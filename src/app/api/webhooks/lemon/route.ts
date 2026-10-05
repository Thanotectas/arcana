import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verificarFirmaWebhook, type EventoLemon } from "@/lib/pagos/lemon";

/**
 * Webhook de Lemon Squeezy. Configurar en Settings → Webhooks con los eventos
 * order_created y order_refunded y la URL https://<dominio>/api/webhooks/lemon.
 */
export async function POST(request: Request) {
  const cuerpo = await request.text();
  if (!verificarFirmaWebhook(cuerpo, request.headers.get("x-signature"))) {
    console.warn("[lemon] firma inválida");
    return NextResponse.json({ ok: false, motivo: "firma" }, { status: 401 });
  }

  let evento: EventoLemon;
  try {
    evento = JSON.parse(cuerpo) as EventoLemon;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }

  const referencia = evento.meta?.custom_data?.referencia;
  if (!referencia) return NextResponse.json({ ok: true, ignorado: "sin_referencia" });

  const admin = getSupabaseAdmin();
  const { data: orden } = await admin.from("ordenes").select("id, estado, monto_centavos, moneda").eq("referencia", referencia).maybeSingle();
  if (!orden) return NextResponse.json({ ok: true, ignorado: "orden_no_encontrada" });

  const a = evento.data?.attributes ?? {};
  const transaccionId = evento.data?.id ?? referencia;

  if (evento.meta.event_name === "order_created" && a.status === "paid") {
    const moneda = (a.currency ?? "USD").toUpperCase();
    if (Number(a.total) !== Number(orden.monto_centavos) || moneda !== orden.moneda) {
      console.error("[lemon] monto no coincide", referencia, orden.monto_centavos, a.total, moneda);
      await admin.from("ordenes").update({ estado: "error", transaccion_id: transaccionId }).eq("id", orden.id).eq("estado", "pendiente");
      return NextResponse.json({ ok: false, motivo: "monto" });
    }
    const { error } = await admin.rpc("acreditar_orden", { p_referencia: referencia, p_transaccion_id: transaccionId, p_metodo_pago: "lemonsqueezy" });
    if (error) {
      console.error("[lemon] no se pudo acreditar", error);
      return NextResponse.json({ ok: false, motivo: "acreditar" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, acreditada: true });
  }

  if (evento.meta.event_name === "order_refunded" || a.status === "refunded") {
    await admin.from("ordenes").update({ estado: "anulada", transaccion_id: transaccionId }).eq("id", orden.id);
    return NextResponse.json({ ok: true, anulada: true });
  }
  if (a.status === "failed" && orden.estado === "pendiente") {
    await admin.from("ordenes").update({ estado: "rechazada", transaccion_id: transaccionId }).eq("id", orden.id);
  }
  return NextResponse.json({ ok: true, evento: evento.meta.event_name });
}
