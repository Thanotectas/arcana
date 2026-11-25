import "server-only";
import { getSupabaseAdmin } from "../supabase/admin";

/**
 * Pagos internacionales con PayPal (API REST de Orders v2, cuenta Empresas
 * "Mi Arcana"). Reemplaza a Lemon Squeezy, que rechazó la tienda.
 *
 * Flujo:
 *  1. accionComprarInternacional crea la orden 'pendiente' en USD y aquí
 *     pedimos a PayPal una orden con custom_id = referencia. Guardamos el id
 *     de PayPal en ordenes.transaccion_id y llevamos a la persona al enlace
 *     de aprobación.
 *  2. Al aprobar, PayPal vuelve a /api/pagos/paypal/retorno?ref=…, que
 *     captura el cobro y acredita (confirmarOrdenPaypal).
 *  3. Respaldo: el webhook /api/webhooks/paypal (CHECKOUT.ORDER.APPROVED y
 *     PAYMENT.CAPTURE.COMPLETED/REFUNDED/REVERSED) hace lo mismo si la persona
 *     cerró la ventana antes de volver. No confiamos en el cuerpo del aviso:
 *     siempre volvemos a consultar la orden en la API con nuestras credenciales.
 *
 * Variables (Vercel, nunca en el repositorio):
 *  - PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET (app REST de developer.paypal.com).
 *  - PAYPAL_ENV = "live" para cobrar de verdad; cualquier otro valor usa sandbox.
 *  - PAYPAL_ACTIVO = "0" apaga el botón sin borrar las claves.
 * Guía: docs/PAGOS-INTERNACIONALES.md
 */

export function paypalEnv() {
  const live = process.env.PAYPAL_ENV === "live";
  return {
    clientId: process.env.PAYPAL_CLIENT_ID ?? "",
    secret: process.env.PAYPAL_CLIENT_SECRET ?? "",
    live,
    api: live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
  };
}

export function paypalConfigurado() {
  if (process.env.PAYPAL_ACTIVO === "0") return false;
  const c = paypalEnv();
  return Boolean(c.clientId && c.secret);
}

let tokenCache: { valor: string; vence: number; api: string } | null = null;

async function token(): Promise<string | null> {
  const { clientId, secret, api } = paypalEnv();
  if (!clientId || !secret) return null;
  if (tokenCache && tokenCache.api === api && tokenCache.vence > Date.now() + 60_000) return tokenCache.valor;
  try {
    const res = await fetch(`${api}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[paypal] token rechazado", res.status);
      return null;
    }
    const datos = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!datos.access_token) return null;
    tokenCache = { valor: datos.access_token, vence: Date.now() + (datos.expires_in ?? 300) * 1000, api };
    return datos.access_token;
  } catch (e) {
    console.error("[paypal] error de red (token)", e instanceof Error ? e.message : e);
    return null;
  }
}

async function llamar<T>(ruta: string, opciones: { method?: string; body?: unknown; idempotencia?: string } = {}): Promise<{ ok: boolean; status: number; datos: T | null }> {
  const t = await token();
  if (!t) return { ok: false, status: 0, datos: null };
  const { api } = paypalEnv();
  try {
    const res = await fetch(`${api}${ruta}`, {
      method: opciones.method ?? "GET",
      headers: {
        Authorization: `Bearer ${t}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        ...(opciones.idempotencia ? { "PayPal-Request-Id": opciones.idempotencia } : {}),
      },
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
      cache: "no-store",
    });
    const datos = (await res.json().catch(() => null)) as T | null;
    if (!res.ok) console.error("[paypal]", opciones.method ?? "GET", ruta, res.status, JSON.stringify(datos).slice(0, 300));
    return { ok: res.ok, status: res.status, datos };
  } catch (e) {
    console.error("[paypal] error de red", ruta, e instanceof Error ? e.message : e);
    return { ok: false, status: 0, datos: null };
  }
}

interface Monto {
  currency_code: string;
  value: string;
}
interface Captura {
  id: string;
  status: string; // COMPLETED, PENDING, DECLINED, REFUNDED, PARTIALLY_REFUNDED, FAILED
  amount?: Monto;
  custom_id?: string;
}
interface OrdenPaypal {
  id: string;
  status: string; // CREATED, APPROVED, COMPLETED, VOIDED, PAYER_ACTION_REQUIRED
  links?: { href: string; rel: string }[];
  purchase_units?: { custom_id?: string; amount?: Monto; payments?: { captures?: Captura[] } }[];
}

const centavosATexto = (c: number) => (c / 100).toFixed(2);
const textoACentavos = (v: string | undefined) => Math.round(Number(v ?? "NaN") * 100);

/** Crea la orden en PayPal y devuelve el id y el enlace de aprobación. */
export async function crearOrdenPaypal(opciones: { referencia: string; montoCentavos: number; descripcion: string; urlRetorno: string; urlCancelar: string; idioma?: string }) {
  const r = await llamar<OrdenPaypal>("/v2/checkout/orders", {
    method: "POST",
    idempotencia: `crear-${opciones.referencia}`,
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opciones.referencia,
          custom_id: opciones.referencia,
          invoice_id: opciones.referencia,
          description: opciones.descripcion.slice(0, 127),
          amount: { currency_code: "USD", value: centavosATexto(opciones.montoCentavos) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Mi Arcana",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            locale: opciones.idioma === "en" ? "en-US" : opciones.idioma === "pt" ? "pt-BR" : "es-ES",
            return_url: opciones.urlRetorno,
            cancel_url: opciones.urlCancelar,
          },
        },
      },
    },
  });
  if (!r.ok || !r.datos) return null;
  const aprobar = r.datos.links?.find((l) => l.rel === "payer-action" || l.rel === "approve")?.href;
  return aprobar ? { id: r.datos.id, urlAprobar: aprobar } : null;
}

export type ResultadoPaypal = "acreditada" | "pendiente" | "rechazada" | "error" | "ignorada";

/**
 * Lleva una orden de Arcana al estado que tiene en PayPal: captura si está
 * aprobada, verifica referencia, monto y moneda y acredita (idempotente).
 * La usan la ruta de retorno, la página de retorno y el webhook.
 */
export async function confirmarOrdenPaypal(referencia: string): Promise<ResultadoPaypal> {
  const admin = getSupabaseAdmin();
  const { data: orden } = await admin.from("ordenes").select("id, estado, monto_centavos, moneda, transaccion_id").eq("referencia", referencia).maybeSingle();
  if (!orden || orden.moneda !== "USD" || !orden.transaccion_id) return "ignorada";
  if (orden.estado === "aprobada") return "acreditada";
  if (orden.estado !== "pendiente") return "rechazada";

  const idPaypal = orden.transaccion_id;
  let r = await llamar<OrdenPaypal>(`/v2/checkout/orders/${encodeURIComponent(idPaypal)}`);
  if (!r.ok || !r.datos) return "error";

  if (r.datos.status === "APPROVED") {
    r = await llamar<OrdenPaypal>(`/v2/checkout/orders/${encodeURIComponent(idPaypal)}/capture`, { method: "POST", idempotencia: `capturar-${referencia}` });
    // 422 ORDER_ALREADY_CAPTURED: otra llamada (retorno o webhook) ganó la carrera; releer.
    if (!r.ok) r = await llamar<OrdenPaypal>(`/v2/checkout/orders/${encodeURIComponent(idPaypal)}`);
    if (!r.datos) return "error";
  }

  const unidad = r.datos.purchase_units?.[0];
  const captura = unidad?.payments?.captures?.[0];
  if (r.datos.status === "VOIDED" || captura?.status === "DECLINED" || captura?.status === "FAILED") {
    await admin.from("ordenes").update({ estado: "rechazada" }).eq("id", orden.id).eq("estado", "pendiente");
    return "rechazada";
  }
  if (r.datos.status !== "COMPLETED" || captura?.status !== "COMPLETED") return "pendiente";

  const idOk = (unidad?.custom_id ?? captura.custom_id) === referencia;
  const monto = captura.amount ?? unidad?.amount;
  const montoOk = monto?.currency_code === "USD" && textoACentavos(monto.value) === Number(orden.monto_centavos);
  if (!idOk || !montoOk) {
    console.error("[paypal] orden no coincide", referencia, orden.monto_centavos, monto, unidad?.custom_id);
    await admin.from("ordenes").update({ estado: "error", transaccion_id: captura.id }).eq("id", orden.id).eq("estado", "pendiente");
    return "error";
  }

  const { error } = await admin.rpc("acreditar_orden", { p_referencia: referencia, p_transaccion_id: captura.id, p_metodo_pago: "paypal" });
  if (error) {
    console.error("[paypal] no se pudo acreditar", error);
    return "error";
  }
  return "acreditada";
}

/** Reembolso o contracargo de una captura: anula la orden si existe. */
export async function anularPorCaptura(idCaptura: string) {
  const r = await llamar<Captura>(`/v2/payments/captures/${encodeURIComponent(idCaptura)}`);
  if (!r.ok || !r.datos) return false;
  if (!["REFUNDED", "PARTIALLY_REFUNDED"].includes(r.datos.status) && r.datos.status !== "REVERSED") return false;
  const referencia = r.datos.custom_id;
  if (!referencia) return false;
  await getSupabaseAdmin().from("ordenes").update({ estado: "anulada" }).eq("referencia", referencia).eq("moneda", "USD");
  return true;
}
