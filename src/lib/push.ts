import "server-only";
import webpush, { WebPushError, type PushSubscription } from "web-push";

/**
 * Web push (VAPID). Claves en el entorno:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
 */
let listo = false;

export function pushConfigurado() {
  return Boolean(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function preparar() {
  if (listo) return;
  if (!pushConfigurado()) throw new Error("[push] Faltan las claves VAPID en el entorno.");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT ?? "mailto:hola@miarcana.com", process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!, process.env.VAPID_PRIVATE_KEY!);
  listo = true;
}

export interface CargaPush {
  titulo: string;
  cuerpo: string;
  url?: string;
  tag?: string;
}

export interface SuscripcionGuardada {
  endpoint: string;
  p256dh: string;
  auth: string;
}

/** Envía un aviso. Devuelve "caducada" si el navegador ya no reconoce la suscripción (hay que borrarla). */
export async function enviarPush(s: SuscripcionGuardada, carga: CargaPush): Promise<"enviada" | "caducada" | "error"> {
  preparar();
  const suscripcion: PushSubscription = { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } };
  try {
    await webpush.sendNotification(suscripcion, JSON.stringify(carga), { TTL: 60 * 60 * 12, urgency: "normal" });
    return "enviada";
  } catch (e) {
    if (e instanceof WebPushError && (e.statusCode === 404 || e.statusCode === 410)) return "caducada";
    console.error("[push] fallo al enviar", e instanceof Error ? e.message : e);
    return "error";
  }
}
