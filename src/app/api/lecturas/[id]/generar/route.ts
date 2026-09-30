import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generarTexto } from "@/lib/ia";
import { construirPrompt } from "@/lib/lecturas/prompts";
import Anthropic from "@anthropic-ai/sdk";
import { marcaError, type CodigoErrorLectura } from "@/lib/lecturas/marcas";
import { memoriaDeLaPersona } from "@/lib/lecturas/memoria";

// Una carta astral puede tardar más de un minuto en escribirse.
export const maxDuration = 300;

/**
 * Escribe la interpretación de una lectura ya cobrada y la transmite como
 * texto plano mientras el modelo la genera. La generación sigue aunque la
 * persona cierre la página (se guarda al terminar); si falla, se reembolsa.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });

  const { data: lectura } = await supabase
    .from("lecturas")
    .select("id, tipo, entrada, resultado, interpretacion, estado")
    .eq("id", id)
    .maybeSingle();
  if (!lectura) return Response.json({ error: "no_encontrada" }, { status: 404 });

  if (lectura.estado === "lista" && lectura.interpretacion) {
    return new Response(lectura.interpretacion, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  if (lectura.estado === "error") return Response.json({ error: "fallida" }, { status: 410 });

  const { data: reclamada } = await supabase.rpc("reclamar_generacion", { p_lectura: id });
  if (!reclamada) return Response.json({ error: "en_curso" }, { status: 409 });

  const codificador = new TextEncoder();
  let controlador!: ReadableStreamDefaultController<Uint8Array>;
  let abierto = true;
  const flujo = new ReadableStream<Uint8Array>({
    start(c) {
      controlador = c;
    },
    cancel() {
      abierto = false; // la persona se fue; seguimos generando para guardar el texto
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

  const admin = getSupabaseAdmin();
  const trabajo = (async () => {
    try {
      const [{ usuario, sistemaExtra, opciones }, memoria] = await Promise.all([
        construirPrompt({ tipo: lectura.tipo as never, entrada: lectura.entrada, resultado: lectura.resultado }),
        memoriaDeLaPersona(supabase, user.id, { excluirLectura: id }).catch(() => ""),
      ]);
      const texto = await generarTexto(usuario, [sistemaExtra ?? "", memoria].filter(Boolean).join("\n\n"), opciones, enviar);
      await admin.from("lecturas").update({ interpretacion: texto, estado: "lista" }).eq("id", id);
    } catch (e) {
      const codigo = clasificarError(e);
      console.error(`[lecturas] generación fallida (${codigo})`, id, e instanceof Error ? e.message : e);
      await admin.rpc("reembolsar_lectura", { p_lectura: id });
      enviar(marcaError(codigo));
    } finally {
      cerrar();
    }
  })();

  // Mantiene viva la función hasta guardar, aunque el navegador se desconecte.
  after(() => trabajo);

  return new Response(flujo, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}

/** Traduce el error del proveedor a un código que la interfaz sabe explicar. */
function clasificarError(e: unknown): CodigoErrorLectura {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return "clave";
  if (e instanceof Anthropic.RateLimitError) return "limite";
  if (e instanceof Anthropic.BadRequestError && /credit balance|billing/i.test(e.message)) return "saldo";
  if (e instanceof Error && /Falta ANTHROPIC_API_KEY/.test(e.message)) return "clave";
  if (e instanceof Error && /No fue posible generar/.test(e.message)) return "rechazo";
  return "generico";
}
