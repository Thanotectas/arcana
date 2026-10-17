import { after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generarTexto } from "@/lib/ia";
import { getIdioma } from "@/lib/i18n/servidor";
import { marcaError } from "@/lib/lecturas/marcas";
import { datoDeUsuario } from "@/lib/seguridad";
import { CHAT_VISITAS, huellaDe, ipDe, sistemaVisitas, usoDeHoy } from "@/lib/chat-visitas";

export const maxDuration = 60;

interface Turno {
  rol: "persona" | "asistente";
  contenido: string;
}

/** Cuántos mensajes le quedan hoy a este visitante. */
export async function GET(request: Request) {
  const admin = getSupabaseAdmin();
  const { persona } = await usoDeHoy(admin, huellaDe(ipDe(request))).catch(() => ({ persona: 0 }));
  return Response.json({ restantes: Math.max(0, CHAT_VISITAS.porPersonaDia - persona), tope: CHAT_VISITAS.porPersonaDia });
}

/**
 * Mensaje de un visitante: revisa los topes, guarda la pregunta y transmite
 * la respuesta de Sibila mientras se escribe. El historial viene del
 * navegador (no hay cuenta) y entra solo como contexto, marcado como dato.
 */
export async function POST(request: Request) {
  // Con sesión se usa el chat de la cuenta (/api/asistente).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return Response.json({ error: "con_sesion" }, { status: 409 });

  let texto = "";
  let historial: Turno[] = [];
  try {
    const cuerpo = (await request.json()) as { texto?: unknown; historial?: unknown };
    texto = String(cuerpo.texto ?? "").trim().slice(0, CHAT_VISITAS.largo);
    if (Array.isArray(cuerpo.historial)) {
      historial = cuerpo.historial
        .filter((m): m is Turno => Boolean(m) && typeof m === "object" && (m.rol === "persona" || m.rol === "asistente") && typeof m.contenido === "string")
        .slice(-CHAT_VISITAS.historial)
        .map((m) => ({ rol: m.rol, contenido: m.contenido.slice(0, 800) }));
    }
  } catch {
    /* sin cuerpo */
  }
  if (texto.length < 2) return Response.json({ error: "vacio" }, { status: 400 });

  const admin = getSupabaseAdmin();
  const huella = huellaDe(ipDe(request));
  const uso = await usoDeHoy(admin, huella);
  if (uso.persona >= CHAT_VISITAS.porPersonaDia) return Response.json({ error: "limite_persona" }, { status: 429 });
  if (uso.total >= CHAT_VISITAS.totalDia) return Response.json({ error: "limite_total" }, { status: 429 });

  const idioma = await getIdioma();
  const { data: fila, error } = await admin.from("chat_visitas").insert({ huella, idioma, pregunta: texto }).select("id").single();
  if (error || !fila) {
    console.error("[chat visita] no se pudo guardar:", error?.message);
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
      const contexto = historial.map((m) => (m.rol === "persona" ? `Persona: ${datoDeUsuario(m.contenido, 600)}` : `Tú: ${datoDeUsuario(m.contenido, 800)}`)).join("\n\n");
      const usuario = (contexto ? `Conversación reciente:\n${contexto}\n\n` : "") + `Mensaje nuevo de la persona: ${datoDeUsuario(texto, CHAT_VISITAS.largo)}\n\nResponde solo a este mensaje.`;
      const respuesta = await generarTexto(usuario, await sistemaVisitas(), { idioma, effort: "low", maxTokens: 500 }, enviar);
      await admin.from("chat_visitas").update({ respuesta, estado: "lista" }).eq("id", fila.id);
    } catch (e) {
      console.error("[chat visita] fallo:", e instanceof Error ? e.message : e);
      await admin.from("chat_visitas").update({ estado: "error" }).eq("id", fila.id);
      enviar(marcaError("generico"));
    } finally {
      cerrar();
    }
  })();
  after(() => trabajo);

  return new Response(flujo, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" } });
}
