/**
 * Quiromancia occidental: nombres de líneas y montes, y utilidades para
 * separar el anexo de coordenadas que el modelo añade al final de la lectura.
 */
export type LineaMano = "vida" | "cabeza" | "corazon" | "destino";

export const LINEAS: LineaMano[] = ["vida", "cabeza", "corazon", "destino"];

export const COLOR_LINEA: Record<LineaMano, string> = {
  vida: "#ff8a5b",
  cabeza: "#8fc7ff",
  corazon: "#ff7b9c",
  destino: "#d9b45a",
};

export type Mano = "derecha" | "izquierda";

export interface EntradaQuiromancia {
  foto: string; // ruta dentro del bucket 'palmas'
  mano: Mano;
  dominante: Mano;
  pregunta: string;
  idioma?: string;
}

/** Trazos aproximados (coordenadas 0-100 sobre la foto) que devuelve el modelo. */
export type TrazosMano = Partial<Record<LineaMano, [number, number][]>>;

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarAnexo(texto: string): { cuerpo: string; trazos: TrazosMano | null } {
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return { cuerpo: texto, trazos: null };
  let trazos: TrazosMano | null = null;
  try {
    const json = JSON.parse(m[1]) as { lineas?: Record<string, unknown> };
    const lineas = json.lineas ?? {};
    const limpio: TrazosMano = {};
    for (const l of LINEAS) {
      const puntos = lineas[l];
      if (Array.isArray(puntos)) {
        const validos = puntos
          .filter((p): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && n >= 0 && n <= 100))
          .slice(0, 12);
        if (validos.length >= 2) limpio[l] = validos;
      }
    }
    trazos = Object.keys(limpio).length ? limpio : null;
  } catch {
    trazos = null;
  }
  return { cuerpo: texto.replace(BLOQUE_ANEXO, "").trim(), trazos };
}

/** Texto para el modelo con el contexto de la mano. */
export function resumenQuiromancia(e: EntradaQuiromancia) {
  const lineas = [
    `Mano fotografiada: ${e.mano}. Mano dominante de la persona: ${e.dominante}.`,
    e.mano === e.dominante
      ? "Es la mano dominante: en la tradición representa lo que la persona construye y su presente."
      : "No es la mano dominante: en la tradición representa lo innato, el potencial y lo heredado.",
    `Pregunta de la persona: ${e.pregunta || "(sin pregunta específica)"}`,
  ];
  return lineas.join("\n");
}

export const INSTRUCCION_ANEXO =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  "```json\n{\"lineas\":{\"vida\":[[x,y],[x,y],[x,y],[x,y]],\"cabeza\":[[x,y],[x,y],[x,y]],\"corazon\":[[x,y],[x,y],[x,y]],\"destino\":[[x,y],[x,y],[x,y]]}}\n```\n" +
  "donde x e y son porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, de 3 a 6 puntos por línea siguiendo su recorrido tal como la ves. Omite una línea si no la distingues. No expliques el bloque.";
