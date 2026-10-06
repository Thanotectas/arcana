import { after, NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extraerMensajes, firmaValida, marcarLeido, enviarTexto, whatsappConfigurado, type AvisoWhatsapp } from "@/lib/whatsapp/api";
import { atender } from "@/lib/whatsapp/sibila";

// Sibila tarda unos segundos en responder; Meta solo espera el 200.
export const maxDuration = 60;

/**
 * Webhook de WhatsApp (Meta Cloud API). Registrar en la app de Meta, producto
 * WhatsApp → Configuración: URL https://miarcana.com/api/webhooks/whatsapp,
 * token de verificación WA_VERIFY_TOKEN, campo "messages".
 */
export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const esperado = process.env.WA_VERIFY_TOKEN;
  if (q.get("hub.mode") === "subscribe" && esperado && q.get("hub.verify_token") === esperado) {
    return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("No autorizado", { status: 403 });
}

export async function POST(request: Request) {
  const cuerpo = await request.text();
  if (!firmaValida(cuerpo, request.headers.get("x-hub-signature-256"))) {
    console.warn("[whatsapp] firma inválida");
    return NextResponse.json({ ok: false, motivo: "firma" }, { status: 401 });
  }
  if (!whatsappConfigurado()) return NextResponse.json({ ok: false, motivo: "sin_configurar" }, { status: 503 });

  let aviso: AvisoWhatsapp;
  try {
    aviso = JSON.parse(cuerpo) as AvisoWhatsapp;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }
  const mensajes = extraerMensajes(aviso);
  if (!mensajes.length) return NextResponse.json({ ok: true, ignorado: "sin_mensajes" });

  // Respondemos a Meta de inmediato y atendemos después (reintentaría si tardamos).
  const trabajo = (async () => {
    const admin = getSupabaseAdmin();
    for (const { mensaje, nombre } of mensajes) {
      try {
        await marcarLeido(mensaje.id);
        if (mensaje.type === "text" && mensaje.text?.body?.trim()) {
          await atender(admin, mensaje.from, nombre, mensaje.id, mensaje.text.body.trim());
        } else {
          await admin.from("mensajes_whatsapp").insert({ telefono: mensaje.from, nombre, rol: "persona", contenido: `[${mensaje.type}]`, id_meta: mensaje.id, tipo: mensaje.type });
          await enviarTexto(mensaje.from, "Por aquí solo leo texto 🌙 Las fotos y audios van en la app: miarcana.com. ¿En qué te ayudo?");
        }
      } catch (e) {
        console.error("[whatsapp]", mensaje.id, e instanceof Error ? e.message : e);
      }
    }
  })();
  after(() => trabajo);
  return NextResponse.json({ ok: true, recibidos: mensajes.length });
}
