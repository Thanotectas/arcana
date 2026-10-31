/**
 * Matriz del Destino (método de los 22 arcanos): con la fecha de nacimiento se
 * calculan los puntos del octograma, cada uno reducido a un número del 1 al 22
 * (el 22 es El Loco). Arcanos en el orden de Marsella (8 la Justicia, 11 la
 * Fuerza), que es el que usa la Matriz.
 *
 *            B (don)
 *     F             G
 *  A (cómo te ven)  E (centro)  C (camino material)
 *     I             H
 *            D (lección)
 */
export const ARCANOS_MATRIZ = [
  "el-mago", "la-sacerdotisa", "la-emperatriz", "el-emperador", "el-sumo-sacerdote", "los-enamorados", "el-carro", "la-justicia",
  "el-ermitano", "la-rueda-de-la-fortuna", "la-fuerza", "el-colgado", "la-muerte", "la-templanza", "el-diablo", "la-torre",
  "la-estrella", "la-luna", "el-sol", "el-juicio", "el-mundo", "el-loco",
] as const;

/** Id de la carta (Rider) del arcano n de la Matriz (1–22). */
export function cartaDelArcano(n: number) {
  return ARCANOS_MATRIZ[n - 1];
}

/** Reduce a 1–22 sumando las cifras mientras pase de 22. */
export function reducir(n: number): number {
  let v = n;
  while (v > 22) v = String(v).split("").reduce((s, c) => s + Number(c), 0);
  return v === 0 ? 22 : v;
}

export interface Matriz {
  /** Día: cómo te ven, tu carta de presentación. */
  a: number;
  /** Mes: tu don. */
  b: number;
  /** Año: tu camino material (trabajo y dinero). */
  c: number;
  /** Tu gran lección. */
  d: number;
  /** El centro: tu esencia. */
  e: number;
  /** Cuadro de los ancestros: arriba a la izquierda, arriba a la derecha, abajo a la derecha, abajo a la izquierda. */
  f: number;
  g: number;
  h: number;
  i: number;
  /** Propósitos: personal (20–40 años), social (40–60) y espiritual (60 en adelante). */
  personal: number;
  social: number;
  espiritual: number;
}

/** Matriz de una fecha AAAA-MM-DD; null si la fecha no es válida. */
export function calcularMatriz(fecha: string): Matriz | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) return null;
  const [anio, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(Date.UTC(anio, mes - 1, dia));
  if (d.getUTCDate() !== dia || d.getUTCMonth() !== mes - 1 || anio < 1900 || anio > 2100) return null;
  const a = reducir(dia);
  const b = reducir(mes);
  const c = reducir(String(anio).split("").reduce((s, x) => s + Number(x), 0));
  const dd = reducir(a + b + c);
  const e = reducir(a + b + c + dd);
  const f = reducir(a + b);
  const g = reducir(b + c);
  const h = reducir(c + dd);
  const i = reducir(dd + a);
  const personal = reducir(reducir(b + dd) + reducir(a + c));
  const social = reducir(reducir(f + h) + reducir(g + i));
  return { a, b, c, d: dd, e, f, g, h, i, personal, social, espiritual: reducir(personal + social) };
}
