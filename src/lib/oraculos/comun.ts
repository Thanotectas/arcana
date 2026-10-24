import type { Idioma } from "../i18n/idiomas";

/**
 * Piezas comunes de los oráculos de cartas y runas (baraja española,
 * Lenormand, runas): las tiradas, lo que se sacó y los textos en tres idiomas.
 */
export type Texto = Record<Idioma, string>;

export interface Posicion {
  nombre: Texto;
  /** Qué pregunta responde la posición (va al modelo, en español). */
  sentido: string;
}

export interface TiradaOraculo {
  id: string;
  nombre: Texto;
  descripcion: Texto;
  posiciones: Posicion[];
}

/** Lo que salió en cada posición; el servidor decide qué pieza es. */
export interface PiezaSacada {
  posicion: number;
  id: string;
  invertida: boolean;
}

export interface ResultadoOraculo {
  tirada: string;
  piezas: PiezaSacada[];
}

export function tiradaPorId<T extends TiradaOraculo>(tiradas: readonly T[], id: unknown): T | undefined {
  return tiradas.find((t) => t.id === id);
}
