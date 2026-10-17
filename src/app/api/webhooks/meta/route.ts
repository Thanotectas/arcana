import { after, NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extraerInteracciones, firmaValidaMeta, metaConfigurado, tokenVerificacionMeta, type AvisoMeta } from "@/lib/redes/meta";
import { atenderInteraccion } from "@/lib/redes/sibila-redes";

// Sibila tarda unos segundos por respuesta; Meta solo espera el 200.
export const maxDuration = 60;

/**
 * Webhook de Instagram y Facebook (comentarios y mensajes directos). Registrar
 * en la app de Meta, Webhooks: URL https://miarcana.com/api/webhooks/meta,
 * token de verificación META_VERIFY_TOKEN (o WA_VERIFY_TOKEN); objeto
 * "instagram" con los campos comments y messages, objeto "page" con feed y
 * messages. La página se suscribe desde /admin/redes.
 */
export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const esperado = tokenVerificacionMeta();
  if (q.get("hub.mode") === "subscribe" && esperado && q.get("hub.verify_token") === esperado) {
    return new Response(q.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("No autorizado", { status: 403 });
}

export async function POST(request: Request) {
  const cuerpo = await request.text();
  if (!firmaValidaMeta(cuerpo, request.headers.get("x-hub-signature-256"))) {
    console.warn("[meta] firma inválida");
    return NextResponse.json({ ok: false, motivo: "firma" }, { status: 401 });
  }
  if (!metaConfigurado()) return NextResponse.json({ ok: false, motivo: "sin_configurar" }, { status: 503 });

  let aviso: AvisoMeta;
  try {
    aviso = JSON.parse(cuerpo) as AvisoMeta;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }
  const interacciones = extraerInteracciones(aviso);
  console.info(`[meta] aviso ${aviso.object ?? "?"}: ${interacciones.length} interacción(es)`);
  if (!interacciones.length) return NextResponse.json({ ok: true, ignorado: "sin_interacciones" });

  // Respondemos a Meta de inmediato y atendemos después (reintentaría si tardamos).
  const trabajo = (async () => {
    const admin = getSupabaseAdmin();
    for (const i of interacciones) {
      try {
        const r = await atenderInteraccion(admin, i);
        console.info(`[meta ${i.red} ${i.tipo}] ${i.idMeta}: ${r}`);
      } catch (e) {
        console.error(`[meta ${i.red} ${i.tipo}]`, i.idMeta, e instanceof Error ? e.message : e);
      }
    }
  })();
  after(() => trabajo);
  return NextResponse.json({ ok: true, recibidas: interacciones.length });
}
