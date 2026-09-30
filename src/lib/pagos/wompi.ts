import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Integración con Wompi (pasarela colombiana de Bancolombia).
 *
 * Flujo:
 *  1. Creamos una orden 'pendiente' con una referencia única.
 *  2. Redirigimos al Web Checkout de Wompi con la firma de integridad.
 *  3. Wompi notifica el resultado al webhook /api/webhooks/wompi (evento
 *     transaction.updated). Verificamos el checksum y acreditamos.
 *  4. Como respaldo, la página de retorno consulta el estado de la transacción.
 *
 * Documentación: https://docs.wompi.co/docs/colombia/
 */

export function wompiEnv() {
  const env = process.env.WOMPI_ENV === "production" ? "production" : "sandbox";
  return {
    env,
    publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY ?? "",
    integritySecret: process.env.WOMPI_INTEGRITY_SECRET ?? "",
    eventsSecret: process.env.WOMPI_EVENTS_SECRET ?? "",
    checkoutUrl: "https://checkout.wompi.co/p/",
    apiUrl:
      env === "production"
        ? "https://production.wompi.co/v1"
        : "https://sandbox.wompi.co/v1",
  };
}

export function pagosConfigurados() {
  const c = wompiEnv();
  return Boolean(c.publicKey && c.integritySecret);
}

function sha256(texto: string) {
  return createHash("sha256").update(texto, "utf8").digest("hex");
}

/**
 * Firma de integridad del Web Checkout:
 * SHA256("<referencia><monto_en_centavos><moneda><secreto_integridad>")
 */
export function firmaIntegridad(
  referencia: string,
  montoCentavos: number,
  moneda: string,
) {
  const { integritySecret } = wompiEnv();
  return sha256(`${referencia}${montoCentavos}${moneda}${integritySecret}`);
}

export interface ParamsCheckout {
  referencia: string;
  montoCentavos: number;
  moneda?: string;
  redirectUrl: string;
  email?: string;
  nombre?: string;
}

/** URL del Web Checkout (redirección GET). */
export function urlCheckout(p: ParamsCheckout) {
  const { publicKey, checkoutUrl } = wompiEnv();
  const moneda = p.moneda ?? "COP";
  const q = new URLSearchParams({
    "public-key": publicKey,
    currency: moneda,
    "amount-in-cents": String(p.montoCentavos),
    reference: p.referencia,
    "signature:integrity": firmaIntegridad(p.referencia, p.montoCentavos, moneda),
    "redirect-url": p.redirectUrl,
  });
  if (p.email) q.set("customer-data:email", p.email);
  if (p.nombre) q.set("customer-data:full-name", p.nombre);
  return `${checkoutUrl}?${q.toString()}`;
}

/** Cuerpo del evento que Wompi envía al webhook. */
export interface EventoWompi {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      currency: string;
      status: "APPROVED" | "DECLINED" | "VOIDED" | "ERROR" | "PENDING";
      payment_method_type?: string;
      customer_email?: string;
    };
  };
  environment: string;
  signature: { properties: string[]; checksum: string };
  timestamp: number;
  sent_at: string;
}

function leerPropiedad(obj: unknown, ruta: string): string {
  const valor = ruta.split(".").reduce<unknown>((acc, k) => {
    if (acc && typeof acc === "object" && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
  return valor === undefined || valor === null ? "" : String(valor);
}

/**
 * Verifica el checksum del evento:
 * SHA256(concat(valores de signature.properties en orden) + timestamp + secreto_eventos)
 */
export function verificarEvento(evento: EventoWompi): boolean {
  const { eventsSecret } = wompiEnv();
  if (!eventsSecret || !evento?.signature?.checksum) return false;

  const concatenado = evento.signature.properties
    .map((p) => leerPropiedad(evento.data, p))
    .join("");
  const esperado = sha256(`${concatenado}${evento.timestamp}${eventsSecret}`);

  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(String(evento.signature.checksum).toLowerCase(), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Consulta una transacción por id (respaldo al webhook, usa clave pública). */
export async function consultarTransaccion(id: string) {
  const { apiUrl } = wompiEnv();
  const res = await fetch(`${apiUrl}/transactions/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: EventoWompi["data"]["transaction"] };
  return json.data ?? null;
}

export function nuevaReferencia(usuarioId: string) {
  const corto = usuarioId.replace(/-/g, "").slice(0, 8);
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `ARC-${corto}-${Date.now().toString(36)}-${aleatorio}`.toUpperCase();
}
