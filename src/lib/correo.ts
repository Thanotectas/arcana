import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Correos transaccionales y de campaña con Resend (API HTTP, sin SDK).
 * Variables: RESEND_API_KEY (si falta, no se envía nada), CORREO_REMITENTE
 * ("Sibila de Arcana <sibila@miarcana.com>", el dominio debe estar verificado
 * en Resend), CORREO_RESPUESTA (buzón real que recibe las respuestas; el
 * remitente no necesita existir) y, opcional, CORREO_SECRETO para firmar los
 * enlaces de baja.
 */
export function correoConfigurado() {
  return Boolean(process.env.RESEND_API_KEY);
}

function remitente() {
  return process.env.CORREO_REMITENTE ?? "Sibila de Arcana <sibila@miarcana.com>";
}

/** A dónde llegan las respuestas: sibila@ es solo el remitente y no tiene buzón. */
function respuesta() {
  return process.env.CORREO_RESPUESTA ?? "miarcana4@gmail.com";
}

export function sitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
}

export interface Correo {
  para: string;
  asunto: string;
  html: string;
  texto: string;
  /** Cabeceras extra (List-Unsubscribe…). */
  cabeceras?: Record<string, string>;
  /** Etiqueta para las métricas de Resend. */
  etiqueta?: string;
}

export type ResultadoEnvio = { ok: true; id: string } | { ok: false; error: string };

export async function enviarCorreo(c: Correo): Promise<ResultadoEnvio> {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) return { ok: false, error: "sin_configurar" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: remitente(),
        reply_to: respuesta(),
        to: [c.para],
        subject: c.asunto,
        html: c.html,
        text: c.texto,
        headers: c.cabeceras,
        tags: c.etiqueta ? [{ name: "tipo", value: c.etiqueta }] : undefined,
      }),
    });
    if (!res.ok) {
      const detalle = (await res.text().catch(() => "")).slice(0, 300);
      return { ok: false, error: `${res.status} ${detalle}` };
    }
    const datos = (await res.json().catch(() => ({}))) as { id?: string };
    return { ok: true, id: datos.id ?? "" };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "red" };
  }
}

// ---------------------------------------------------------------------------
// Enlace de baja firmado: no exige sesión (se abre desde el correo) y nadie
// puede dar de baja a otra persona sin la firma.
// ---------------------------------------------------------------------------
function claveFirma() {
  return process.env.CORREO_SECRETO ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function tokenBaja(usuarioId: string) {
  return createHmac("sha256", claveFirma()).update(`baja:${usuarioId}`).digest("hex").slice(0, 32);
}

export function tokenBajaValido(usuarioId: string, token: string) {
  if (!/^[0-9a-f-]{36}$/.test(usuarioId) || !/^[0-9a-f]{32}$/.test(token)) return false;
  const a = Buffer.from(tokenBaja(usuarioId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function urlBaja(usuarioId: string) {
  return `${sitio()}/correos/baja?u=${usuarioId}&t=${tokenBaja(usuarioId)}`;
}

/** Escapa texto para incrustarlo en HTML. */
export function escaparHtml(texto: string) {
  return texto.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}
