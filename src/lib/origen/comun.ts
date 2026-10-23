/**
 * Origen de una visita (por dónde llegó la persona). Funciones puras, sin
 * dependencias de servidor: las usa el proxy (edge) y el resto del servidor.
 */
export const COOKIE_ORIGEN = "arcana_origen";
export const DIAS_ORIGEN = 30;

export interface Origen {
  fuente: string; // youtube, instagram, tiktok, facebook, whatsapp, google, …
  medio?: string; // short, reel, bio, en-vivo, …
  campana?: string; // carta-dia, ritual-octubre, …
}

/** Redes con enlace corto propio (miarcana.com/yt, /ig, /tt, /fb, /wa). */
export const ENLACES_CORTOS: Record<string, string> = { yt: "youtube", ig: "instagram", tt: "tiktok", fb: "facebook", wa: "whatsapp", tg: "telegram" };

const DOMINIOS: [RegExp, string][] = [
  [/(^|\.)(youtube\.com|youtu\.be)$/, "youtube"],
  [/(^|\.)instagram\.com$/, "instagram"],
  [/(^|\.)tiktok\.com$/, "tiktok"],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, "facebook"],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, "whatsapp"],
  [/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, "telegram"],
  [/(^|\.)(twitter\.com|x\.com|t\.co)$/, "x"],
  [/(^|\.)pinterest\.[a-z.]+$/, "pinterest"],
  [/(^|\.)google\.[a-z.]+$/, "google"],
  [/(^|\.)bing\.com$/, "bing"],
];

const limpiar = (v: string | null | undefined, max = 32) =>
  (v ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max) || undefined;

/** Origen de una petición: utm_source manda; si no hay, el Referer de una red conocida. */
export function detectarOrigen(busqueda: URLSearchParams, referer: string | null): Origen | null {
  const fuente = limpiar(busqueda.get("utm_source"));
  if (fuente) return { fuente, medio: limpiar(busqueda.get("utm_medium")), campana: limpiar(busqueda.get("utm_campaign"), 48) };
  if (!referer) return null;
  let host: string;
  try {
    host = new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
  const red = DOMINIOS.find(([re]) => re.test(host))?.[1];
  return red ? { fuente: red, medio: "enlace" } : null;
}

export function serializarOrigen(o: Origen) {
  return [o.fuente, o.medio ?? "", o.campana ?? ""].join("|");
}

export function leerOrigen(valor: string | undefined | null): Origen | null {
  if (!valor) return null;
  const [fuente, medio, campana] = valor.split("|");
  const f = limpiar(fuente);
  return f ? { fuente: f, medio: limpiar(medio), campana: limpiar(campana, 48) } : null;
}

/** "short · carta-dia" para guardar junto a la fuente. */
export function detalleOrigen(o: Origen) {
  return [o.medio, o.campana].filter(Boolean).join(" · ") || null;
}

export const OPCIONES_COOKIE_ORIGEN = { path: "/", maxAge: 60 * 60 * 24 * DIAS_ORIGEN, sameSite: "lax" as const, httpOnly: true };
