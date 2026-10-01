import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { estadoOrden, verificarFirmaWebhook, type EventoBold } from "@/lib/pagos/bold";

/**
 * Webhook de Bold. Configurar en el panel de Bold (Integraciones → Webhooks):
 *   https://<dominio>/api/webhooks/bold
 *
 * Respondemos 200 salvo cuando conviene que Bold reintente (error al
 * acreditar). Las firmas inválidas y los eventos ajenos se ignoran.
 */
export async function POST(request: Request) {
  const cuerpo = await request.text();

  if (!verificarFirmaWebhook(cuerpo, request.headers.get("x-bold-signature"))) {
    console.warn("[bold] firma inválida");
    return NextResponse.json({ ok: false, motivo: "firma" }, { status: 401 });
  }

  let evento: EventoBold;
  try {
    evento = JSON.parse(cuerpo) as EventoBold;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }

  const referencia = evento.data?.metadata?.reference;
  if (!referencia) {
    // Ventas que no vienen del checkout de Arcana (p. ej. links de pago de otros proyectos).
    return NextResponse.json({ ok: true, ignorado: "sin_referencia" });
  }

  const admin = getSupabaseAdmin();
  const { data: orden } = await admin
    .from("ordenes")
    .select("id, estado, monto_centavos, moneda")
    .eq("referencia", referencia)
    .maybeSingle();

  if (!orden) {
    return NextResponse.json({ ok: true, ignorado: "orden_no_encontrada" });
  }

  const transaccionId = evento.data.payment_id ?? null;
  const metodoPago = evento.data.payment_method ?? null;

  if (evento.type === "SALE_APPROVED") {
    const total = Number(evento.data.amount?.total);
    const montoPesos = Number(orden.monto_centavos) / 100;
    const moneda = evento.data.amount?.currency ?? orden.moneda;
    if (total !== montoPesos || moneda !== orden.moneda) {
      console.error("[bold] monto no coincide", referencia, orden.monto_centavos, total, moneda);
      await admin.from("ordenes").update({ estado: "error", transaccion_id: transaccionId }).eq("id", orden.id).eq("estado", "pendiente");
      return NextResponse.json({ ok: false, motivo: "monto" });
    }
    const { error } = await admin.rpc("acreditar_orden", {
      p_referencia: referencia,
      p_transaccion_id: transaccionId ?? referencia,
      p_metodo_pago: metodoPago,
    });
    if (error) {
      console.error("[bold] no se pudo acreditar", error);
      return NextResponse.json({ ok: false, motivo: "acreditar" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, acreditada: true });
  }

  const nuevoEstado = estadoOrden(evento.type);
  if (nuevoEstado && orden.estado === "pendiente") {
    await admin
      .from("ordenes")
      .update({ estado: nuevoEstado, transaccion_id: transaccionId, metodo_pago: metodoPago })
      .eq("id", orden.id);
  }
  return NextResponse.json({ ok: true, evento: evento.type });
}
