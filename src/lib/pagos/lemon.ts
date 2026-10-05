import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pagos internacionales con Lemon Squeezy (merchant of record: cobra en USD
 * con tarjeta o PayPal en cualquier país, liquida el IVA del comprador y
 * paga a Colombia). Se usa cuando la persona está fuera de Colombia.
 *
 * Flujo:
 *  1. Creamos una orden 'pendiente' en USD con una referencia única.
 *  2. Pedimos a la API un checkout con la referencia en custom_data y la
 *     persona paga en la página alojada de Lemon Squeezy.
 *  3. El webhook /api/webhooks/lemon recibe order_created (status paid),
 *     verifica la firma y el monto y acredita con acreditar_orden().
 *
 * Variables: LEMON_API_KEY, LEMON_STORE_ID, LEMON_WEBHOOK_SECRET y
 * LEMON_VARIANTES ("inicial:123456,buscador:123457,…": id de variante por paquete).
 * Documentación: https://docs.lemonsqueezy.com/api/checkouts y /help/webhooks
 */
const API = "https://api.lemonsqueezy.com/v1";

export function lemonEnv() {
  return {
    apiKey: process.env.LEMON_API_KEY ?? "",
    storeId: process.env.LEMON_STORE_ID ?? "",
    webhookSecret: process.env.LEMON_WEBHOOK_SECRET ?? "",
    variantes: Object.fromEntries(
      (process.env.LEMON_VARIANTES ?? "")
        .split(",")
        .map((par) => par.trim().split(":"))
        .filter(([k, v]) => k && v)
        .map(([k, v]) => [k, v]),
    ) as Record<string, string>,
  };
}

export function pagosInternacionalesConfigurados() {
  const c = lemonEnv();
  return Boolean(c.apiKey && c.storeId && c.webhookSecret && Object.keys(c.variantes).length);
}

export function varianteDe(paquete: string) {
  return lemonEnv().variantes[paquete];
}

/** Crea un checkout alojado y devuelve su URL. */
export async function crearCheckout(opciones: { paquete: string; referencia: string; email: string; nombre?: string | null; urlRetorno: string }): Promise<string | null> {
  const { apiKey, storeId } = lemonEnv();
  const variante = varianteDe(opciones.paquete);
  if (!apiKey || !storeId || !variante) return null;
  const cuerpo = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: opciones.email,
          name: opciones.nombre ?? undefined,
          custom: { referencia: opciones.referencia },
        },
        checkout_options: { embed: false, media: false, logo: true, button_color: "#d9b45a" },
        product_options: { redirect_url: opciones.urlRetorno, receipt_button_text: "Volver a Arcana", receipt_link_url: opciones.urlRetorno },
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variante } },
      },
    },
  };
  try {
    const res = await fetch(`${API}/checkouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/vnd.api+json", "Content-Type": "application/vnd.api+json" },
      body: JSON.stringify(cuerpo),
    });
    if (!res.ok) {
      console.error("[lemon] checkout rechazado", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return null;
    }
    const datos = (await res.json()) as { data?: { attributes?: { url?: string } } };
    return datos.data?.attributes?.url ?? null;
  } catch (e) {
    console.error("[lemon] error de red", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Evento del webhook (campos que usamos). */
export interface EventoLemon {
  meta: { event_name: string; custom_data?: { referencia?: string } };
  data: {
    id: string;
    attributes: {
      status?: string; // paid, pending, failed, refunded
      total?: number; // centavos
      currency?: string;
      identifier?: string;
      user_email?: string;
    };
  };
}

/** X-Signature: HMAC-SHA256 del cuerpo crudo con el secreto del webhook, en hexadecimal. */
export function verificarFirmaWebhook(cuerpoCrudo: string, firma: string | null) {
  const { webhookSecret } = lemonEnv();
  if (!firma || !webhookSecret) return false;
  const esperado = createHmac("sha256", webhookSecret).update(cuerpoCrudo).digest("hex");
  const a = Buffer.from(esperado, "hex");
  const b = Buffer.from(firma.toLowerCase(), "hex");
  return a.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}
