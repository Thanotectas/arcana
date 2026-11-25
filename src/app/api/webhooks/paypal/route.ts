import { NextResponse } from "next/server";
import { anularPorCaptura, confirmarOrdenPaypal } from "@/lib/pagos/paypal";

/**
 * Webhook de PayPal (respaldo de la ruta de retorno). Configurar en
 * developer.paypal.com → la app → Webhooks con la URL
 * https://miarcana.com/api/webhooks/paypal y los eventos
 * CHECKOUT.ORDER.APPROVED, PAYMENT.CAPTURE.COMPLETED, PAYMENT.CAPTURE.DENIED,
 * PAYMENT.CAPTURE.REFUNDED y PAYMENT.CAPTURE.REVERSED.
 *
 * El cuerpo solo se usa para saber qué orden revisar: el estado, el monto y la
 * referencia se vuelven a consultar en la API con nuestras credenciales, así un
 * aviso falso no puede acreditar nada.
 */
interface EventoPaypal {
  event_type?: string;
  resource?: {
    id?: string;
    custom_id?: string;
    links?: { href?: string; rel?: string }[];
    purchase_units?: { custom_id?: string }[];
  };
}

const REF = /^[A-Za-z0-9_-]{6,80}$/;

export async function POST(request: Request) {
  let evento: EventoPaypal;
  try {
    evento = (await request.json()) as EventoPaypal;
  } catch {
    return NextResponse.json({ ok: false, motivo: "json" });
  }
  const tipo = evento.event_type ?? "";
  const r = evento.resource ?? {};

  if (tipo === "PAYMENT.CAPTURE.REFUNDED" || tipo === "PAYMENT.CAPTURE.REVERSED") {
    // En REFUNDED el recurso es el reembolso (su enlace "up" apunta a la captura); en REVERSED es la captura.
    const arriba = r.links?.find((l) => l.rel === "up")?.href?.match(/\/captures\/([A-Za-z0-9]+)/)?.[1];
    const idCaptura = tipo === "PAYMENT.CAPTURE.REFUNDED" ? arriba : r.id;
    const anulada = idCaptura ? await anularPorCaptura(idCaptura) : false;
    return NextResponse.json({ ok: true, anulada });
  }

  const referencia = r.custom_id ?? r.purchase_units?.[0]?.custom_id;
  if (!referencia || !REF.test(referencia)) return NextResponse.json({ ok: true, ignorado: "sin_referencia" });

  if (["CHECKOUT.ORDER.APPROVED", "PAYMENT.CAPTURE.COMPLETED", "PAYMENT.CAPTURE.DENIED"].includes(tipo)) {
    const resultado = await confirmarOrdenPaypal(referencia);
    // 500 en error temporal para que PayPal reintente.
    return NextResponse.json({ ok: resultado !== "error", resultado }, { status: resultado === "error" ? 500 : 200 });
  }
  return NextResponse.json({ ok: true, evento: tipo });
}
