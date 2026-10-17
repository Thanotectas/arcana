import { NextResponse, type NextRequest } from "next/server";
import { firmaValida, type AvisoWhatsapp } from "@/lib/whatsapp/api";
import { atenderAvisoWhatsapp } from "@/lib/whatsapp/webhook";

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
  let aviso: AvisoWhatsapp;
  try {
    aviso = JSON.parse(cuerpo) as AvisoWhatsapp;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }
  const r = atenderAvisoWhatsapp(aviso);
  return NextResponse.json(r.cuerpo, { status: r.status });
}
