import { datoDeUsuario } from "../seguridad";
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

/** Tipo de mano por los cuatro elementos (forma de la palma y largo de los dedos). */
export type FormaMano = "tierra" | "aire" | "fuego" | "agua";
export const FORMAS: FormaMano[] = ["tierra", "aire", "fuego", "agua"];

/** Montes de la palma, con el planeta que les da nombre. */
export type Monte = "jupiter" | "saturno" | "sol" | "mercurio" | "venus" | "luna" | "marte";
export const MONTES: Monte[] = ["jupiter", "saturno", "sol", "mercurio", "venus", "luna", "marte"];

/** Lo demás que el modelo ve en la foto: tipo de mano, montes marcados y cómo es cada línea. */
export interface DetalleMano {
  forma: FormaMano | null;
  montes: Monte[];
  rasgos: Partial<Record<LineaMano, string>>;
}

const BLOQUE_ANEXO = /```json\s*(\{[\s\S]*?\})\s*```\s*$/;

/** Separa el texto de la lectura del anexo JSON final (si existe). */
export function separarAnexo(texto: string): { cuerpo: string; trazos: TrazosMano | null; detalle: DetalleMano } {
  const detalle: DetalleMano = { forma: null, montes: [], rasgos: {} };
  const m = texto.match(BLOQUE_ANEXO);
  if (!m) return { cuerpo: texto, trazos: null, detalle };
  let trazos: TrazosMano | null = null;
  try {
    const json = JSON.parse(m[1]) as { lineas?: Record<string, unknown>; forma?: unknown; montes?: unknown; rasgos?: Record<string, unknown> };
    // Las lecturas anteriores al 26 oct 2026 solo traen las líneas.
    if (typeof json.forma === "string" && (FORMAS as string[]).includes(json.forma)) detalle.forma = json.forma as FormaMano;
    if (Array.isArray(json.montes)) detalle.montes = json.montes.filter((x): x is Monte => typeof x === "string" && (MONTES as string[]).includes(x)).slice(0, 3);
    for (const l of LINEAS) {
      const r = json.rasgos?.[l];
      if (typeof r === "string" && r.trim()) detalle.rasgos[l] = r.trim().slice(0, 60);
    }
    const lineas = json.lineas ?? {};
    const limpio: TrazosMano = {};
    for (const l of LINEAS) {
      const puntos = lineas[l];
      if (Array.isArray(puntos)) {
        const validos = puntos
          .filter((p): p is [number, number] => Array.isArray(p) && p.length === 2 && p.every((n) => typeof n === "number" && n >= 0 && n <= 100))
          .slice(0, 16);
        if (validos.length >= 2) limpio[l] = validos;
      }
    }
    trazos = Object.keys(limpio).length ? limpio : null;
  } catch {
    trazos = null;
  }
  return { cuerpo: texto.replace(BLOQUE_ANEXO, "").trim(), trazos, detalle };
}

/** Texto para el modelo con el contexto de la mano. */
export function resumenQuiromancia(e: EntradaQuiromancia) {
  const lineas = [
    `Mano fotografiada: ${e.mano}. Mano dominante de la persona: ${e.dominante}.`,
    e.mano === e.dominante
      ? "Es la mano dominante: en la tradición representa lo que la persona construye y su presente."
      : "No es la mano dominante: en la tradición representa lo innato, el potencial y lo heredado.",
    `Pregunta de la persona: ${datoDeUsuario(e.pregunta, 300) || "(sin pregunta específica)"}`,
  ];
  return lineas.join("\n");
}

export const INSTRUCCION_ANEXO =
  "Al final, después de la lectura, añade un bloque de código con este formato exacto y nada más dentro:\n" +
  "```json\n{\"lineas\":{\"vida\":[[x,y],[x,y],[x,y],[x,y]],\"cabeza\":[[x,y],[x,y],[x,y]],\"corazon\":[[x,y],[x,y],[x,y]],\"destino\":[[x,y],[x,y],[x,y]]},\"forma\":\"agua\",\"montes\":[\"venus\",\"luna\"],\"rasgos\":{\"vida\":\"larga y curva\",\"cabeza\":\"recta y profunda\",\"corazon\":\"curva hacia Júpiter\",\"destino\":\"tenue, con un corte\"}}\n```\n" +
  "donde x e y son porcentajes enteros (0 a 100) sobre el ancho y el alto de la foto, de 5 a 8 puntos por línea siguiendo su recorrido tal como la ves, desde donde empieza hasta donde termina. Omite una línea si no la distingues. " +
  "forma: el tipo de mano que ves: tierra (palma cuadrada, dedos cortos), aire (palma cuadrada, dedos largos), fuego (palma larga, dedos cortos) o agua (palma larga, dedos largos). " +
  "montes: los dos o tres montes más marcados entre jupiter, saturno, sol, mercurio, venus, luna y marte. " +
  "rasgos: de 2 a 5 palabras por línea que veas, en el idioma de la lectura, que coincidan con lo que dices de ella. No expliques el bloque.";
