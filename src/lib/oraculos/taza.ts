/**
 * Figuras de una taza (chocolate o borra de café): al final de la lectura el
 * modelo agrega un anexo JSON con dónde está cada figura en la foto, en qué
 * zona de la taza y qué anuncia; en el café, también si sube o baja y cuánto
 * de la taza quedó limpio. Sin dependencias de servidor.
 */

/** Zona de la taza: el borde es lo cercano en el tiempo y el fondo lo lejano. */
export type ZonaTaza = "borde" | "medio" | "fondo";
export const ZONAS: ZonaTaza[] = ["borde", "medio", "fondo"];

/** Una figura que el modelo distingue en la foto, con su lugar (porcentajes sobre la foto). */
export interface FiguraTaza {
  nombre: string;
  x: number;
  y: number;
  zona: ZonaTaza;
  sentido: string;
  /** Café: «sube» hacia el borde (se acerca) o «baja» hacia el fondo (se aleja). */
  va?: "sube" | "baja";
}

export interface AnexoTaza {
  cuerpo: string;
  figuras: FiguraTaza[];
  /** Café: porcentaje de la taza que quedó limpio (caminos abiertos); null si no vino. */
  limpio: number | null;
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarFiguras(texto: string): AnexoTaza {
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return { cuerpo: texto, figuras: [], limpio: null };
  let figuras: FiguraTaza[] = [];
  let limpio: number | null = null;
  try {
    const json = JSON.parse(m[1]) as { figuras?: unknown[]; limpio?: unknown };
    figuras = (json.figuras ?? [])
      .filter((f): f is Record<string, unknown> => typeof f === "object" && f !== null)
      .map((f): FiguraTaza => ({
        nombre: String(f.nombre ?? "").trim().slice(0, 40),
        x: Number(f.x),
        y: Number(f.y),
        zona: (ZONAS as unknown[]).includes(f.zona) ? (f.zona as ZonaTaza) : "medio",
        sentido: String(f.sentido ?? "").trim().slice(0, 60),
        ...(f.va === "sube" || f.va === "baja" ? { va: f.va } : {}),
      }))
      .filter((f) => f.nombre && Number.isFinite(f.x) && Number.isFinite(f.y) && f.x >= 0 && f.x <= 100 && f.y >= 0 && f.y <= 100)
      .slice(0, 8);
    const l = Number(json.limpio);
    if (json.limpio != null && Number.isFinite(l) && l >= 0 && l <= 100) limpio = Math.round(l);
  } catch {
    figuras = [];
  }
  return { cuerpo: texto.replace(BLOQUE_ANEXO, "").trim(), figuras, limpio };
}

/** Instrucción del anexo para el modelo; el café pide además el sentido de cada figura y lo limpio de la taza. */
export function instruccionFiguras(cafe = false) {
  const ejemplo = cafe
    ? '{"figuras":[{"nombre":"ave","x":62,"y":30,"zona":"borde","va":"sube","sentido":"una noticia que llega"}],"limpio":40}'
    : '{"figuras":[{"nombre":"ave","x":62,"y":30,"zona":"borde","sentido":"una noticia que llega"}]}';
  return (
    "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
    "```json\n" + ejemplo + "\n```\n" +
    "con una entrada por cada figura que nombraste en «Figura por figura» (máximo 8), en el mismo orden: nombre como lo dijiste (en el idioma de la lectura), " +
    "x e y en porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, en el centro de la figura; zona: borde, medio o fondo de la taza; " +
    (cafe ? "va: sube si la figura apunta o se estira hacia el borde, baja si va hacia el fondo (omítelo si no se nota); " : "") +
    "sentido: de 3 a 6 palabras con lo que anuncia. " +
    (cafe ? "limpio: porcentaje entero aproximado de la pared de la taza que quedó limpia o blanca, sin borra. " : "") +
    "Si no distinguiste ninguna figura, deja la lista vacía. No expliques el bloque."
  );
}
