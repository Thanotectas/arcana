/**
 * Próximo directo de «Sibila en vivo» en YouTube, para el aviso de la portada.
 * El aviso se muestra desde ya hasta `fin` y se quita solo; para el siguiente
 * directo basta cambiar las fechas, el enlace de la emisión programada y el
 * código de la noche (null si no hay oferta).
 */
export const PROXIMO_DIRECTO = {
  inicio: "2026-10-25T20:00:00-05:00",
  fin: "2026-10-25T22:00:00-05:00",
  url: "https://youtube.com/live/ONPScsjRvZ4",
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
