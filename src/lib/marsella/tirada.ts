import { ARCANOS_MARSELLA, arcanoMarsella, arcanoPorNumero } from "./mazo";

/**
 * «Tirage en croix» (tirada en cruz) de la cartomancia francesa con los 22 arcanos mayores de Marsella.
 *
 * Disposición (tal como se coloca sobre la mesa):
 *
 *                 [3 Jugement]
 *   [1 Pour]      [5 Synthèse]      [2 Contre]
 *                 [4 Issue]
 *
 * La persona elige cuatro láminas boca abajo (1 a 4). La quinta, la de síntesis, NO se saca: se calcula.
 *
 * Regla de la carta de síntesis (tradición francesa):
 *  1. Se suman los números de las cuatro láminas (Le Mat, que no lleva número, vale 0).
 *  2. Si la suma pasa de 22, se reduce sumando sus cifras (40 → 4 + 0 = 4), y se repite si hiciera falta.
 *     Con 22 arcanos la suma va de 6 (0+1+2+3) a 78 (21+20+19+18), así que en la práctica basta una reducción.
 *  3. El número resultante (1 a 21) es la carta de síntesis; si da 22, es Le Mat.
 * La carta de síntesis puede coincidir con una de las cuatro ya salidas: entonces refuerza su mensaje.
 * Módulo puro: sirve en el servidor y en el cliente.
 */

export const TOTAL_MARSELLA = ARCANOS_MARSELLA.length; // 22
export const CARTAS_A_ELEGIR = 4;

/** Las cinco posiciones en el orden de la tirada; `sentido` va al modelo, en español. */
export const POSICIONES_MARSELLA = [
  { clave: "pour", sentido: "A favor (izquierda): lo que te favorece, las fuerzas y apoyos con los que cuentas." },
  { clave: "contre", sentido: "En contra (derecha): lo que se opone, frena o pide atención; aunque la lámina sea luminosa, aquí señala lo que falta o lo que conviene vigilar." },
  { clave: "jugement", sentido: "El juicio o árbitro (arriba): lo que inclina la balanza, cómo se decide el asunto, la actitud que conviene adoptar." },
  { clave: "issue", sentido: "La salida (abajo): el desenlace probable, hacia dónde tiende la situación." },
  { clave: "synthese", sentido: "La síntesis (centro, calculada): el corazón de la pregunta, la clave que resume la tirada." },
] as const;

export type ClavePosicionMarsella = (typeof POSICIONES_MARSELLA)[number]["clave"];

export interface CartaSacadaMarsella {
  /** 0 = pour, 1 = contre, 2 = jugement, 3 = issue. */
  posicion: number;
  id: string;
}

export interface SintesisMarsella {
  id: string;
  /** Suma de los números de las cuatro láminas. */
  suma: number;
  /** Cada paso del cálculo: [suma, reducción, …]; el último es el número de la carta (22 = Le Mat). */
  pasos: number[];
}

export interface ResultadoMarsella {
  cartas: CartaSacadaMarsella[];
  sintesis: SintesisMarsella;
}

export interface EntradaMarsella {
  pregunta: string;
}

function sumaDeCifras(n: number) {
  return String(n)
    .split("")
    .reduce((s, c) => s + Number(c), 0);
}

/** Reduce una suma según la regla de la síntesis: mientras pase de 22, se suman sus cifras. */
export function reducirSuma(suma: number): number[] {
  const pasos = [suma];
  let n = suma;
  while (n > 22) {
    n = sumaDeCifras(n);
    pasos.push(n);
  }
  return pasos;
}

/** Calcula la carta de síntesis a partir de las cuatro láminas elegidas. */
export function cartaDeSintesis(ids: readonly string[]): SintesisMarsella {
  const numeros = ids.map((id) => {
    const a = arcanoMarsella(id);
    if (!a) throw new Error(`Arcano desconocido: ${id}`);
    return a.numero;
  });
  const suma = numeros.reduce((s, n) => s + n, 0);
  const pasos = reducirSuma(suma);
  const final = pasos[pasos.length - 1];
  // 22 (o 0, que no puede darse con cuatro láminas distintas) es Le Mat.
  const arcano = arcanoPorNumero(final === 22 ? 0 : final) ?? arcanoPorNumero(0)!;
  return { id: arcano.id, suma, pasos };
}

/** ¿Son válidas las posiciones elegidas en el abanico? (n distintas, enteras, dentro del abanico) */
export function seleccionValida(elegidas: unknown, n = CARTAS_A_ELEGIR, total = TOTAL_MARSELLA): elegidas is number[] {
  return (
    Array.isArray(elegidas) &&
    elegidas.length === n &&
    new Set(elegidas).size === n &&
    elegidas.every((p) => Number.isInteger(p) && p >= 0 && p < total)
  );
}

/** Lee un resultado guardado sin fiarse de su forma (viene de la base de datos). */
export function leerResultadoMarsella(resultado: Record<string, unknown>): ResultadoMarsella | null {
  const cartas = Array.isArray(resultado.cartas) ? (resultado.cartas as CartaSacadaMarsella[]) : [];
  const validas = cartas.filter((c) => c && Number.isInteger(c.posicion) && arcanoMarsella(c.id));
  const s = resultado.sintesis as SintesisMarsella | undefined;
  if (validas.length !== CARTAS_A_ELEGIR || !s || !arcanoMarsella(s.id)) return null;
  return {
    cartas: [...validas].sort((a, b) => a.posicion - b.posicion),
    sintesis: { id: s.id, suma: Number(s.suma) || 0, pasos: Array.isArray(s.pasos) ? s.pasos.map(Number) : [Number(s.suma) || 0] },
  };
}
