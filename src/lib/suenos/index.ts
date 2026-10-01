/**
 * Interpretación de sueños. La persona cuenta su sueño con sus palabras;
 * Sibila lo lee con la tradición simbólica (arquetipos, diccionarios
 * clásicos) y con la memoria de sus sueños anteriores (diario de sueños).
 */

export const EMOCIONES = ["paz", "alegria", "miedo", "angustia", "tristeza", "confusion", "nostalgia", "deseo"] as const;
export type Emocion = (typeof EMOCIONES)[number];

export function esEmocion(valor: unknown): valor is Emocion {
  return typeof valor === "string" && (EMOCIONES as readonly string[]).includes(valor);
}

export const SUENO_MIN = 20;
export const SUENO_MAX = 2000;

export interface EntradaSueno {
  texto: string;
  emocion: Emocion | null;
  recurrente: boolean;
  /** Fecha del sueño (YYYY-MM-DD) o null si no la dio. */
  fecha: string | null;
}

/** Sueño anterior resumido, guardado con la lectura para que el prompt sea reproducible. */
export interface SuenoPrevio {
  fecha: string;
  titulo: string;
  extracto: string;
}

export interface ResultadoSueno {
  previos: SuenoPrevio[];
}

/** Título breve a partir de las primeras palabras del sueño. */
export function tituloDeSueno(texto: string, max = 60) {
  const limpio = texto.replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const espacio = corte.lastIndexOf(" ");
  return (espacio > 30 ? corte.slice(0, espacio) : corte).trim() + "…";
}

const NOMBRE_EMOCION: Record<Emocion, string> = { paz: "paz", alegria: "alegría", miedo: "miedo", angustia: "angustia", tristeza: "tristeza", confusion: "confusión", nostalgia: "nostalgia", deseo: "deseo" };

/** Texto plano del sueño para el modelo (lo usa la lectura cruzada). */
export function resumenSueno(e: EntradaSueno, limpiar: (texto: string, max: number) => string) {
  return (
    `Sueño contado por la persona${e.fecha ? ` (${e.fecha})` : ""}: ${limpiar(e.texto, 1200)}` +
    (e.emocion ? `\nAl despertar sintió ${NOMBRE_EMOCION[e.emocion]}.` : "") +
    (e.recurrente ? "\nEs un sueño recurrente." : "")
  );
}
