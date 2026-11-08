/**
 * Próximo directo de «Sibila en vivo» en YouTube, para el aviso de la portada.
 * El aviso se muestra desde ya hasta `fin` y se quita solo; para el siguiente
 * directo basta cambiar las fechas, el enlace de la emisión programada y el
 * código de la noche (null si no hay oferta).
 */
export const PROXIMO_DIRECTO = {
  inicio: "2026-11-01T20:00:00-05:00",
  fin: "2026-11-01T21:00:00-05:00",
  // Enlace del canal en vivo: siempre lleva al directo activo, aunque haya que crear otra emisión.
  url: "https://www.youtube.com/@miarcana/live",
  // Emisión programada en YouTube Studio: antes del directo muestra la cuenta regresiva y el botón «Notificarme».
  emision: "https://youtube.com/live/tFyKvAmk5H8" as string | null,
  codigo: { codigo: "SIBILA", creditosExtra: 2 } as { codigo: string; creditosExtra: number } | null,
  video: "directo",
};

export const ZONA_DIRECTO = "America/Bogota";

/** «proximo» antes de la hora, «en-vivo» durante el directo, null cuando ya pasó. */
export function estadoDirecto(ahora = new Date()): "proximo" | "en-vivo" | null {
  const t = ahora.getTime();
  if (t >= Date.parse(PROXIMO_DIRECTO.fin)) return null;
  return t >= Date.parse(PROXIMO_DIRECTO.inicio) ? "en-vivo" : "proximo";
}

/** Días de calendario (hora Colombia) que faltan para el directo: 0 hoy, 1 mañana. */
export function diasParaDirecto(ahora = new Date()): number {
  const dia = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: ZONA_DIRECTO }).format(d);
  return Math.round((Date.parse(dia(new Date(PROXIMO_DIRECTO.inicio))) - Date.parse(dia(ahora))) / 86_400_000);
}

/**
 * Directo de TikTok LIVE (sin emisión programada ni aviso en la portada). Mientras está próximo (el mismo día) o en
 * curso, /vivo lo muestra y deja subir desde antes la foto del vaso, la taza o la mano: queda en la fila para esa noche.
 * Para el siguiente basta cambiar las dos horas.
 */
export const DIRECTO_TIKTOK = {
  inicio: "2026-11-08T20:00:00-05:00",
  fin: "2026-11-08T21:00:00-05:00",
  perfil: "https://www.tiktok.com/@miarcana4",
  envivo: "https://www.tiktok.com/@miarcana4/live",
};

/** Las fotos se reciben desde 12 horas antes del directo de TikTok hasta que termina. */
const ANTES_FOTOS = 12 * 3_600_000;

export function estadoTikTok(ahora = new Date()): "proximo" | "en-vivo" | null {
  const t = ahora.getTime();
  const inicio = Date.parse(DIRECTO_TIKTOK.inicio);
  if (t >= Date.parse(DIRECTO_TIKTOK.fin) || t < inicio - ANTES_FOTOS) return null;
  return t >= inicio ? "en-vivo" : "proximo";
}
