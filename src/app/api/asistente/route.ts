import { after } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generarTexto } from "@/lib/ia";
import { getPerfil } from "@/lib/dal";
import { getIdioma } from "@/lib/i18n/servidor";
import { ASISTENTE, sistemaAsistente } from "@/lib/asistente";
import { marcaError, type CodigoErrorLectura } from "@/lib/lecturas/marcas";
import { datoDeUsuario } from "@/lib/seguridad";

export const maxDuration = 60;

/** Historial reciente del chat. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  const [{ data: mensajes }, { data: hoy }] = await Promise.all([
    supabase.from("mensajes_asistente").select("id, rol, contenido, estado, creado_en").eq("usuario_id", user.id).neq("estado", "error").order("creado_en", { ascending: false }).limit(30),
    supabase.rpc("mensajes_asistente_hoy"),
  ]);
  return Response.json({ mensajes: (mensajes ?? []).reverse(), hoy: typeof hoy === "number" ? hoy : 0 });
}

/** Mensaje nuevo: cobra si toca (en la base), guarda y transmite la respuesta. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });

  let texto = "";
  try {
    texto = String(((await request.json()) as { texto?: string }).texto ?? "").trim().slice(0, 600);
  } catch {
    /* sin cuerpo */
  }
  if (texto.length < 2) return Response.json({ error: "vacio" }, { status: 400 });

  const [{ data: creado, error: errorCrear }, { data: previos }, perfil, idioma] = await Promise.all([
    supabase.rpc("crear_mensaje_asistente", { p_texto: texto }),
    supabase.from("mensajes_asistente").select("rol, contenido").eq("usuario_id", user.id).eq("estado", "lista").order("creado_en", { ascending: false }).limit(ASISTENTE.historial),
    getPerfil(),
    getIdioma(),
  ]);
  if (errorCrear) {
    console.error("[asistente] no se pudo crear el mensaje", errorCrear.message);
    return Response.json({ error: "guardar" }, { status: 500 });
  }
  const fila = creado?.[0];
  if (!fila) return Response.json({ error: "sin_creditos" }, { status: 402 });
  if (!perfil) return Response.json({ error: "no_autenticado" }, { status: 401 });

  const admin = getSupabaseAdmin();
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
  const enviar = (s: string) => {
    if (!abierto) return;
    try {
      controlador.enqueue(codificador.encode(s));
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
      const sistema = await sistemaAsistente(supabase, perfil, idioma);
      const historial = (previos ?? [])
        .reverse()
        .map((m) => (m.rol === "persona" ? `Persona: ${datoDeUsuario(m.contenido, 600)}` : `Tú: ${m.contenido}`))
        .join("\n\n");
      const usuario = (historial ? `Conversación reciente:\n${historial}\n\n` : "") + `Mensaje nuevo de la persona: ${datoDeUsuario(texto, 600)}\n\nResponde solo a este mensaje.`;
      const respuesta = await generarTexto(usuario, sistema, { idioma, effort: "low", maxTokens: 600 }, enviar);
      await admin.rpc("finalizar_mensaje_asistente", { p_mensaje: fila.id, p_texto: respuesta });
    } catch (e) {
      const codigo = clasificarError(e);
      console.error(`[asistente] fallo (${codigo})`, fila.id, e instanceof Error ? e.message : e);
      await admin.rpc("reembolsar_mensaje_asistente", { p_mensaje: fila.id });
      enviar(marcaError(codigo));
    } finally {
      cerrar();
    }
  })();
  after(() => trabajo);

  return new Response(flujo, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no", "X-Costo": String(fila.costo) },
  });
}

function clasificarError(e: unknown): CodigoErrorLectura {
  if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return "clave";
  if (e instanceof Anthropic.RateLimitError) return "limite";
  if (e instanceof Anthropic.BadRequestError && /credit balance|billing/i.test(e.message)) return "saldo";
  if (e instanceof Error && /No fue posible generar/.test(e.message)) return "rechazo";
  return "generico";
}
