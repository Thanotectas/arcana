import { MAZO_ISKAMBIL, PALOS, cartaIskambil, type Palo, type Rango } from "./mazo";

/**
 * Tiradas del iskambil falı: tres cartas (geçmiş, şimdi, gelecek) o cinco (sen, kalbin, yolundaki, yakın gelecek,
 * kısmet). La persona elige posiciones del abanico boca abajo y el servidor decide qué carta hay en cada una.
 * En el iskambil falı las cartas no se leen invertidas. Módulo puro: sirve en el servidor y en el cliente.
 */
export type IdTiradaIskambil = "uc" | "bes";

export const TOTAL_ISKAMBIL = MAZO_ISKAMBIL.length; // 52

/** `sentido` de cada posición, para el modelo (en español). */
export const TIRADAS_ISKAMBIL: Record<IdTiradaIskambil, { sentidos: string[] }> = {
  uc: {
    sentidos: ["Geçmiş (el pasado): lo que trajo a la persona hasta aquí.", "Şimdi (el presente): el corazón de la situación.", "Gelecek (el futuro): hacia dónde va si nada cambia."],
  },
  bes: {
    sentidos: [
      "Sen (tú): la persona y su situación ahora.",
      "Kalbin (tu corazón): lo que pasa por su corazón, lo que desea o siente.",
      "Yolundaki (lo que se cruza en tu camino): ayudas u obstáculos que aparecen.",
      "Yakın gelecek (el futuro cercano): lo que llega en las próximas semanas.",
      "Kısmet (el destino de la consulta): el desenlace, lo que la vida tiene reservado si sigue este camino.",
    ],
  },
};

export function esTiradaIskambil(valor: unknown): valor is IdTiradaIskambil {
  return valor === "uc" || valor === "bes";
}

export function cartasDeTirada(tirada: IdTiradaIskambil) {
  return TIRADAS_ISKAMBIL[tirada].sentidos.length;
}

export interface CartaSacadaIskambil {
  posicion: number;
  id: string;
}

export interface ResultadoIskambil {
  tirada: IdTiradaIskambil;
  cartas: CartaSacadaIskambil[];
}

export interface EntradaIskambil {
  pregunta: string;
}

/** ¿Son válidas las posiciones elegidas en el abanico de 52? */
export function seleccionValidaIskambil(elegidas: unknown, tirada: IdTiradaIskambil): elegidas is number[] {
  const n = cartasDeTirada(tirada);
  return (
    Array.isArray(elegidas) &&
    elegidas.length === n &&
    new Set(elegidas).size === n &&
    elegidas.every((p) => Number.isInteger(p) && p >= 0 && p < TOTAL_ISKAMBIL)
  );
}

export interface AnalisisIskambil {
  conteo: Record<Palo, number>;
  /** El palo con más cartas, si alguno tiene más que los demás. */
  dominante: Palo | null;
  /** Valores que salen dos o más veces (refuerzan su tema). */
  repetidos: { rango: Rango; n: number }[];
  /** ¿Salió el 9 de kupa, la carta del deseo? */
  dilek: boolean;
}

/** Lectura de conjunto: palo dominante, valores repetidos y carta del deseo. */
export function analizarIskambil(ids: readonly string[]): AnalisisIskambil {
  const conteo: Record<Palo, number> = { kupa: 0, karo: 0, sinek: 0, maca: 0 };
  const rangos = new Map<Rango, number>();
  for (const id of ids) {
    const c = cartaIskambil(id);
    if (!c) continue;
    conteo[c.palo]++;
    rangos.set(c.rango, (rangos.get(c.rango) ?? 0) + 1);
  }
  const max = Math.max(...PALOS.map((p) => conteo[p]));
  const empatados = PALOS.filter((p) => conteo[p] === max);
  return {
    conteo,
    dominante: max > 0 && empatados.length === 1 ? empatados[0] : null,
    repetidos: [...rangos].filter(([, n]) => n >= 2).map(([rango, n]) => ({ rango, n })),
    dilek: ids.includes("kupa-9"),
  };
}

/** Lee un resultado guardado sin fiarse de su forma (viene de la base de datos). */
export function leerResultadoIskambil(resultado: Record<string, unknown>): ResultadoIskambil | null {
  if (!esTiradaIskambil(resultado.tirada)) return null;
  const cartas = (Array.isArray(resultado.cartas) ? (resultado.cartas as CartaSacadaIskambil[]) : []).filter((c) => c && Number.isInteger(c.posicion) && cartaIskambil(c.id));
  if (cartas.length !== cartasDeTirada(resultado.tirada)) return null;
  return { tirada: resultado.tirada, cartas: [...cartas].sort((a, b) => a.posicion - b.posicion) };
}
