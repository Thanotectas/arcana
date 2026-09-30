import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { verificarEvento, type EventoWompi } from "@/lib/pagos/wompi";

/**
 * Webhook de eventos de Wompi. Configurar la URL en el panel de Wompi:
 *   https://<dominio>/api/webhooks/wompi
 *
 * Siempre respondemos 200 (Wompi reintenta ante otros códigos); los errores
 * de verificación se registran y se ignoran.
 */
export async function POST(request: Request) {
  let evento: EventoWompi;
  try {
    evento = (await request.json()) as EventoWompi;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" }, { status: 200 });
  }

  if (evento.event !== "transaction.updated") {
    return NextResponse.json({ ok: true, ignorado: evento.event });
  }

  if (!verificarEvento(evento)) {
    console.warn("[wompi] checksum inválido", evento?.data?.transaction?.reference);
    return NextResponse.json({ ok: false, motivo: "firma" }, { status: 200 });
  }

  const tx = evento.data.transaction;
  const admin = getSupabaseAdmin();

  const { data: orden } = await admin
    .from("ordenes")
    .select("id, estado, monto_centavos, moneda")
    .eq("referencia", tx.reference)
    .maybeSingle();

  if (!orden) {
    console.warn("[wompi] orden no encontrada", tx.reference);
    return NextResponse.json({ ok: false, motivo: "orden" });
  }

  if (tx.status === "APPROVED") {
    if (Number(orden.monto_centavos) !== Number(tx.amount_in_cents) || orden.moneda !== tx.currency) {
      console.error("[wompi] monto no coincide", tx.reference, orden.monto_centavos, tx.amount_in_cents);
      await admin.from("ordenes").update({ estado: "error", transaccion_id: tx.id }).eq("id", orden.id);
      return NextResponse.json({ ok: false, motivo: "monto" });
    }
    const { error } = await admin.rpc("acreditar_orden", {
      p_referencia: tx.reference,
      p_transaccion_id: tx.id,
      p_metodo_pago: tx.payment_method_type ?? null,
    });
    if (error) {
      console.error("[wompi] no se pudo acreditar", error);
      return NextResponse.json({ ok: false, motivo: "acreditar" });
    }
    return NextResponse.json({ ok: true, acreditada: true });
  }

  const nuevoEstado =
    tx.status === "DECLINED" ? "rechazada" : tx.status === "VOIDED" ? "anulada" : tx.status === "ERROR" ? "error" : null;
  if (nuevoEstado && orden.estado === "pendiente") {
    await admin
      .from("ordenes")
      .update({ estado: nuevoEstado, transaccion_id: tx.id, metodo_pago: tx.payment_method_type ?? null })
      .eq("id", orden.id);
  }
  return NextResponse.json({ ok: true, estado: tx.status });
}
