import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Integración con Bold (botón de pagos, Colombia).
 *
 * Flujo:
 *  1. Creamos una orden 'pendiente' con una referencia única (orderId de Bold).
 *  2. La página /creditos/pagar abre el checkout de Bold con la firma de
 *     integridad calculada en el servidor.
 *  3. Bold notifica el resultado al webhook /api/webhooks/bold (evento
 *     SALE_APPROVED / SALE_REJECTED). Verificamos la firma y acreditamos.
 *  4. Como respaldo, la página de retorno consulta el estado de la venta.
 *
 * Documentación: https://developers.bold.co/pagos-en-linea/boton-de-pagos
 * Webhook:       https://developers.bold.co/webhook
 */

export const BOLD_SCRIPT_URL = "https://checkout.bold.co/library/boldPaymentButton.js";
const BOLD_API_URL = "https://payments.api.bold.co";

export function boldEnv() {
  return {
    produccion: process.env.BOLD_ENV === "production",
    /** Llave de identidad (pública): va en el checkout y en la API de consulta. */
    apiKey: process.env.NEXT_PUBLIC_BOLD_API_KEY ?? "",
    /** Llave secreta: firma de integridad y verificación del webhook. */
    secretKey: process.env.BOLD_SECRET_KEY ?? "",
  };
}

export function pagosConfigurados() {
  const c = boldEnv();
  return Boolean(c.apiKey && c.secretKey);
}

/**
 * Firma de integridad del checkout:
 * SHA256("<orderId><monto><moneda><llave_secreta>"). El monto va en pesos.
 */
export function firmaIntegridad(orderId: string, montoPesos: number, moneda: string) {
  const { secretKey } = boldEnv();
  return createHash("sha256").update(`${orderId}${montoPesos}${moneda}${secretKey}`, "utf8").digest("hex");
}

/** Cuerpo del evento que Bold envía al webhook (campos que usamos). */
export interface EventoBold {
  id: string;
  type: "SALE_APPROVED" | "SALE_REJECTED" | "VOID_APPROVED" | "VOID_REJECTED" | string;
  subject?: string;
  time?: number;
  data: {
    payment_id: string;
    amount?: { total?: number; currency?: string };
    payment_method?: string;
    metadata?: { reference?: string | null };
  };
}

function firmaCoincide(esperado: string, recibido: string) {
  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(recibido.toLowerCase(), "hex");
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verifica el encabezado x-bold-signature:
 * HMAC-SHA256(base64(cuerpo_crudo), llave_secreta) en hexadecimal.
 * En el ambiente de pruebas de Bold la llave usada para firmar es "".
 */
export function verificarFirmaWebhook(cuerpoCrudo: string, firma: string | null) {
  if (!firma) return false;
  const { secretKey } = boldEnv();
  const base64 = Buffer.from(cuerpoCrudo, "utf8").toString("base64");
  const llaves: string[] = [];
  if (secretKey) llaves.push(secretKey);
  // La llave vacía del sandbox de Bold solo se admite si se pide explícitamente
  // y nunca en el despliegue de producción de Vercel.
  if (process.env.BOLD_ACEPTAR_FIRMA_VACIA === "1" && process.env.VERCEL_ENV !== "production") llaves.push("");
  if (!llaves.length) return false;
  return llaves.some((llave) => firmaCoincide(createHmac("sha256", llave).update(base64).digest("hex"), firma));
}

export type EstadoPagoBold =
  | "APPROVED"
  | "REJECTED"
  | "FAILED"
  | "VOIDED"
  | "PENDING"
  | "PROCESSING"
  | "NO_TRANSACTION_FOUND";

/** Consulta el estado de una venta por su orderId (respaldo al webhook). */
export async function consultarVenta(orderId: string) {
  const { apiKey } = boldEnv();
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BOLD_API_URL}/v2/payment-voucher/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `x-api-key ${apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      payment_status?: EstadoPagoBold;
      total?: number;
      transaction_id?: string;
      payment_id?: string;
      payment_method?: string;
    };
    if (!json.payment_status) return null;
    return {
      estado: json.payment_status,
      total: typeof json.total === "number" ? json.total : null,
      transaccionId: json.transaction_id ?? json.payment_id ?? null,
      metodoPago: json.payment_method ?? null,
    };
  } catch {
    return null;
  }
}

/** Traduce el estado de Bold al estado de nuestra orden (null = sin cambio). */
export function estadoOrden(estado: string): "rechazada" | "anulada" | "error" | null {
  if (estado === "REJECTED" || estado === "SALE_REJECTED") return "rechazada";
  if (estado === "VOIDED" || estado === "VOID_APPROVED") return "anulada";
  if (estado === "FAILED") return "error";
  return null;
}

export function nuevaReferencia(usuarioId: string) {
  const corto = usuarioId.replace(/-/g, "").slice(0, 8);
  const aleatorio = randomBytes(5).toString("hex");
  return `ARC-${corto}-${Date.now().toString(36)}-${aleatorio}`.toUpperCase();
}
