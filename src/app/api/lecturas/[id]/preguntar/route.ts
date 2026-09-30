import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generarTexto } from "@/lib/ia";
import { construirPrompt } from "@/lib/lecturas/prompts";
import { marcaError, type CodigoErrorLectura } from "@/lib/lecturas/marcas";
import { COSTO_PREGUNTA, PREGUNTAS_GRATIS_POR_LECTURA } from "@/lib/creditos";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";

export const maxDuration = 120;

/**
 * Pregunta de seguimiento sobre una lectura terminada. Cobra (salvo la
 * primera de cada lectura y las cuentas ilimitadas), guarda la pregunta y
 * transmite la respuesta mientras se escribe. Si falla, reembolsa.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });

  let pregunta = "";
  try {
    const cuerpo = (await request.json()) as { pregunta?: string };
    pregunta = String(cuerpo.pregunta ?? "").trim().slice(0, 400);
  } catch {
    /* sin cuerpo */
  }
  if (pregunta.length < 3) return Response.json({ error: "pregunta_vacia" }, { status: 400 });

  const { data: lectura } = await supabase
    .from("lecturas")
    .select("id, tipo, entrada, resultado, interpretacion, estado")
    .eq("id", id)
    .maybeSingle();
  if (!lectura || lectura.estado !== "lista" || !lectura.interpretacion) {
    return Response.json({ error: "lectura_no_lista" }, { status: 409 });
  }

  const [{ data: perfil }, { data: previas }] = await Promise.all([
    supabase.from("perfiles").select("ilimitado").eq("id", user.id).maybeSingle(),
    supabase
      .from("preguntas_lectura")
      .select("pregunta, respuesta, estado")
      .eq("lectura_id", id)
      .eq("estado", "lista")
      .order("creado_en", { ascending: true })
      .limit(8),
  ]);
  const hechas = previas?.length ?? 0;
  const gratis = Boolean(perfil?.ilimitado) || hechas < PREGUNTAS_GRATIS_POR_LECTURA;
  const costo = gratis ? 0 : COSTO_PREGUNTA;

  if (costo > 0) {
    const { data: ok, error } = await supabase.rpc("consumir_creditos", {
      p_cantidad: costo,
      p_motivo: "pregunta:lectura",
      p_referencia: id,
    });
    if (error) return Response.json({ error: "cobro" }, { status: 500 });
    if (!ok) return Response.json({ error: "sin_creditos" }, { status: 402 });
  }

  const admin = getSupabaseAdmin();
  const { data: fila, error: errorInsert } = await admin
    .from("preguntas_lectura")
    .insert({ lectura_id: id, usuario_id: user.id, pregunta, creditos_usados: costo })
    .select("id")
    .single();
  if (errorInsert || !fila) {
    if (costo > 0) {
      // Devolvemos el crédito: la pregunta nunca se creó.
      const { data: p } = await admin.from("perfiles").select("creditos").eq("id", user.id).single();
      if (p) await admin.from("perfiles").update({ creditos: p.creditos + costo }).eq("id", user.id);
    }
    return Response.json({ error: "guardar" }, { status: 500 });
  }

  const codificador = new TextEncoder();
  let controlador!: ReadableStreamDefaultController<Uint8Array>;
  let abierto = true;
  const flujo = new ReadableStream<Uint8Array>({
    start(c) {
      controlador = c;
    },
    cancel() {
      abierto = false;
    },
  });
  const enviar = (texto: string) => {
    if (!abierto) return;
    try {
      controlador.enqueue(codificador.encode(texto));
    } catch {
      abierto = false;
    }
  };
  const cerrar = () => {
    if (!abierto) return;
    abierto = false;
    try {
      controlador.close();
    } catch {}
  };

  const trabajo = (async () => {
    try {
      const entrada = (lectura.entrada ?? {}) as Record<string, unknown>;
      const idioma = esIdioma(entrada.idioma) ? entrada.idioma : IDIOMA_PREDETERMINADO;
      const base = await construirPrompt({ tipo: lectura.tipo as never, entrada: lectura.entrada, resultado: lectura.resultado });
      const historial = (previas ?? [])
        .map((p) => `Pregunta anterior: ${p.pregunta}\nRespuesta anterior: ${p.respuesta ?? ""}`)
        .join("\n\n");
      const usuario =
        `Contexto de la consulta original (datos que se usaron para la lectura):\n${base.usuario}\n\n` +
        `Lectura que ya recibió la persona:\n${lectura.interpretacion}\n\n` +
        (historial ? `Conversación posterior:\n${historial}\n\n` : "") +
        `Nueva pregunta de la persona: ${pregunta}\n\n` +
        `Responde solo a esta pregunta, apoyándote en los símbolos de su lectura (cita la carta, el planeta, el número o la línea que corresponda). ` +
        `Sé concreta y cálida, sin repetir la lectura. Si la pregunta se sale del tema esotérico o pide diagnóstico médico, legal o financiero, dilo con amabilidad y redirige. ` +
        `Extensión: 120 a 220 palabras. Sin título; puedes usar un par de párrafos.`;
      const texto = await generarTexto(usuario, base.sistemaExtra ?? "", { idioma, effort: "low", maxTokens: 900 }, enviar);
      await admin.from("preguntas_lectura").update({ respuesta: texto, estado: "lista" }).eq("id", fila.id);
    } catch (e) {
      const codigo = clasificarError(e);
      console.error(`[preguntas] fallo (${codigo})`, fila.id, e instanceof Error ? e.message : e);
      await admin.rpc("reembolsar_pregunta", { p_pregunta: fila.id });
      enviar(marcaError(codigo));
    } finally {
      cerrar();
    }
  })();
  after(() => trabajo);

  return new Response(flujo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Pregunta-Id": fila.id,
      "X-Costo": String(costo),
    },
  });
}

function clasificarError(e: unknown): CodigoErrorLectura {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return "clave";
  if (e instanceof Anthropic.RateLimitError) return "limite";
  if (e instanceof Anthropic.BadRequestError && /credit balance|billing/i.test(e.message)) return "saldo";
  if (e instanceof Error && /No fue posible generar/.test(e.message)) return "rechazo";
  return "generico";
}
