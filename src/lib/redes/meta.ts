import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { resolverPagina, type PaginaResuelta } from "./pagina";

/**
 * Comentarios y mensajes directos de Instagram y Facebook (API Graph de Meta):
 * leer los avisos del webhook, responder y suscribir la página.
 *
 * Variables (todas opcionales; sin token no se responde nada):
 * - META_PAGE_TOKEN: token de la página "Mi Arcana" emitido por la app de
 *   Meta que recibe los avisos, con instagram_manage_comments,
 *   instagram_manage_messages, pages_manage_engagement, pages_messaging,
 *   pages_read_engagement y pages_manage_metadata. Si falta, se usa
 *   FB_PAGE_TOKEN o IG_PAGE_TOKEN.
 * - META_APP_SECRET y META_VERIFY_TOKEN: firma y verificación del webhook;
 *   si faltan se usan WA_APP_SECRET y WA_VERIFY_TOKEN (la misma app que WhatsApp).
 * - FB_PAGE_ID e IG_USER_ID: opcionales; el id real de la página se deduce
 *   del token (ver `pagina.ts`), y los comentarios propios se reconocen por el
 *   id de la entrada del aviso.
 */
const API = "https://graph.facebook.com/v25.0";

export function tokenMeta() {
  return process.env.META_PAGE_TOKEN ?? process.env.FB_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN ?? "";
}

export function metaConfigurado() {
  return Boolean(tokenMeta());
}

export function tokenVerificacionMeta() {
  return process.env.META_VERIFY_TOKEN ?? process.env.WA_VERIFY_TOKEN ?? "";
}

/** Firma X-Hub-Signature-256: HMAC-SHA256 del cuerpo con el secreto de la app. */
export function firmaValidaMeta(cuerpo: string, cabecera: string | null) {
  const secreto = (process.env.META_APP_SECRET ?? process.env.WA_APP_SECRET ?? "").trim().replace(/^["']|["']$/g, "");
  if (!secreto) return true; // sin secreto no se exige firma (solo para pruebas)
  if (!cabecera?.startsWith("sha256=")) return false;
  const esperada = createHmac("sha256", secreto).update(cuerpo).digest("hex");
  const recibida = cabecera.slice(7);
  return esperada.length === recibida.length && timingSafeEqual(Buffer.from(esperada), Buffer.from(recibida));
}

/** Página de Arcana con su token, deducida del token configurado. */
export function paginaMeta() {
  return resolverPagina(tokenMeta());
}

async function llamar<T = Record<string, unknown>>(ruta: string, cuerpo?: Record<string, unknown>, metodo: "GET" | "POST" | "DELETE" = cuerpo ? "POST" : "GET"): Promise<T> {
  const { token } = await paginaMeta();
  const res = await fetch(`${API}/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, ...(cuerpo ? { "Content-Type": "application/json" } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`Meta ${ruta.split("?")[0]}: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos;
}

export type RedMeta = "instagram" | "facebook";

/** Responde un comentario (Instagram: /replies; Facebook: /comments). Devuelve el id de la respuesta. */
export async function responderComentario(red: RedMeta, idComentario: string, texto: string): Promise<string> {
  const r = await llamar<{ id?: string }>(`${idComentario}/${red === "instagram" ? "replies" : "comments"}`, { message: texto });
  return String(r.id ?? "");
}

/** Envía un mensaje directo (Instagram o Messenger) como respuesta a quien escribió. */
export async function enviarMensajeDirecto(destinatario: string, texto: string): Promise<string> {
  const { id } = await paginaMeta();
  const r = await llamar<{ message_id?: string }>(`${id}/messages`, { recipient: { id: destinatario }, messaging_type: "RESPONSE", message: { text: texto } });
  return String(r.message_id ?? "");
}

export interface EstadoSuscripcion {
  suscrita: boolean;
  campos: string[];
  pagina?: { id: string; nombre?: string; instagram?: string };
  /** El token configurado es de usuario (vence): conviene cambiarlo por el de la página. */
  tokenDeUsuario?: boolean;
  error?: string;
}

/** ¿La página está suscrita a los avisos de esta app (feed y mensajes)? */
export async function estadoSuscripcion(): Promise<EstadoSuscripcion> {
  let pagina: PaginaResuelta | undefined;
  try {
    pagina = await paginaMeta();
    const r = await llamar<{ data?: { id?: string; subscribed_fields?: string[] }[] }>(`${pagina.id}/subscribed_apps`);
    const campos = r.data?.flatMap((a) => a.subscribed_fields ?? []) ?? [];
    return { suscrita: campos.includes("feed") && campos.includes("messages"), campos, pagina: { id: pagina.id, nombre: pagina.nombre, instagram: pagina.instagram }, tokenDeUsuario: pagina.tokenDeUsuario };
  } catch (e) {
    return { suscrita: false, campos: [], pagina: pagina && { id: pagina.id, nombre: pagina.nombre, instagram: pagina.instagram }, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Suscribe la página a los avisos de esta app. Intenta comentarios (feed) y
 * mensajes juntos; si el token no tiene el permiso de uno, suscribe el otro
 * solo para que al menos los comentarios funcionen. Devuelve lo suscrito y
 * los errores de lo que no se pudo.
 */
export async function suscribirPagina(): Promise<{ suscritos: string[]; errores: string[] }> {
  const { id } = await paginaMeta();
  try {
    await llamar(`${id}/subscribed_apps`, { subscribed_fields: ["feed", "messages"] });
    return { suscritos: ["feed", "messages"], errores: [] };
  } catch {
    const suscritos: string[] = [];
    const errores: string[] = [];
    for (const campo of ["feed", "messages"]) {
      try {
        await llamar(`${id}/subscribed_apps`, { subscribed_fields: [...suscritos, campo] });
        suscritos.push(campo);
      } catch (e) {
        errores.push(`${campo === "feed" ? "Comentarios" : "Mensajes"}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (!suscritos.length) throw new Error(errores.join(" · "));
    return { suscritos, errores };
  }
}

/** Un comentario o mensaje recibido, ya normalizado. */
export interface Interaccion {
  red: RedMeta;
  tipo: "comentario" | "mensaje";
  idMeta: string;
  remitenteId: string;
  remitente: string | null;
  objetoId: string | null;
  texto: string;
}

interface Cambio {
  field?: string;
  value?: {
    // Instagram: comentarios
    id?: string;
    text?: string;
    from?: { id?: string; username?: string; name?: string };
    media?: { id?: string };
    parent_id?: string;
    // Facebook: feed
    item?: string;
    verb?: string;
    comment_id?: string;
    post_id?: string;
    message?: string;
  };
}

interface Mensajeria {
  sender?: { id?: string };
  recipient?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean };
}

export interface AvisoMeta {
  object?: string;
  entry?: { id?: string; changes?: Cambio[]; messaging?: Mensajeria[] }[];
}

/** Extrae los comentarios y mensajes ajenos del aviso; descarta lo propio y lo que no es texto. */
export function extraerInteracciones(aviso: AvisoMeta): Interaccion[] {
  const red: RedMeta | null = aviso.object === "instagram" ? "instagram" : aviso.object === "page" ? "facebook" : null;
  if (!red) return [];
  const propios = new Set([process.env.FB_PAGE_ID, process.env.IG_USER_ID].filter(Boolean));
  const lista: Interaccion[] = [];
  for (const entrada of aviso.entry ?? []) {
    if (entrada.id) propios.add(entrada.id);
    for (const c of entrada.changes ?? []) {
      const v = c.value ?? {};
      if (red === "instagram" && c.field === "comments" && v.id && v.text && v.from?.id && !propios.has(v.from.id)) {
        lista.push({ red, tipo: "comentario", idMeta: v.id, remitenteId: v.from.id, remitente: v.from.username ?? null, objetoId: v.media?.id ?? null, texto: v.text });
      }
      if (red === "facebook" && c.field === "feed" && v.item === "comment" && v.verb === "add" && v.comment_id && v.message && v.from?.id && !propios.has(v.from.id)) {
        lista.push({ red, tipo: "comentario", idMeta: v.comment_id, remitenteId: v.from.id, remitente: v.from.name ?? null, objetoId: v.post_id ?? null, texto: v.message });
      }
    }
    for (const m of entrada.messaging ?? []) {
      const texto = m.message?.text?.trim();
      if (!m.message?.mid || !texto || m.message.is_echo || !m.sender?.id || propios.has(m.sender.id)) continue;
      lista.push({ red, tipo: "mensaje", idMeta: m.message.mid, remitenteId: m.sender.id, remitente: null, objetoId: null, texto });
    }
  }
  return lista;
}
