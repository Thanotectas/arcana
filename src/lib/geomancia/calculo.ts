import { figuraPorFilas, figuraPorId, type Filas, type IdFigura, type Punto } from "./figuras";

/*
 * El escudo geomántico a partir de las 16 líneas de marcas. Módulo puro (el azar lo pone src/lib/geomancia/azar.ts).
 *
 * - Madres: las líneas 1–4 forman la Madre I (cabeza, cuello, cuerpo, pies), 5–8 la II, 9–12 la III y 13–16 la IV.
 *   Línea impar → un punto; par → dos puntos.
 * - Hijas: la Hija I son las cabezas de las cuatro Madres (de la I a la IV), la II los cuellos, la III los cuerpos y la
 *   IV los pies.
 * - Sobrinas: I = Madre I + Madre II; II = Madre III + Madre IV; III = Hija I + Hija II; IV = Hija III + Hija IV.
 *   «Sumar» dos figuras: fila a fila se suman los puntos; par → dos puntos, impar → uno.
 * - Testigo derecho = Sobrina I + Sobrina II; Testigo izquierdo = Sobrina III + Sobrina IV.
 * - Juez = Testigo derecho + Testigo izquierdo. El Juez siempre tiene un número par de puntos (resulta de sumar, fila
 *   a fila, las ocho figuras de arriba y cada línea entra dos veces).
 * - Reconciliador (o Sentencia) = Juez + Madre I.
 */

export const LINEAS = 16;
/** Máximo de toques que se aceptan por línea (la interfaz no deja pasar de ahí). */
export const MAX_MARCAS = 40;

export interface ResultadoGeomancia {
  /** Marcas trazadas en cada una de las 16 líneas (con la marca final del azar). */
  marcas: number[];
  madres: IdFigura[];
  hijas: IdFigura[];
  sobrinas: IdFigura[];
  testigoDerecho: IdFigura;
  testigoIzquierdo: IdFigura;
  juez: IdFigura;
  reconciliador: IdFigura;
  /** Figuras que aparecen más de una vez entre las 15 del escudo (Madres a Juez). */
  repetidas: { id: IdFigura; veces: number }[];
}

export function sumarFiguras(a: Filas, b: Filas): Filas {
  return a.map((p, i) => ((p + b[i]) % 2 === 0 ? 2 : 1)) as unknown as Filas;
}

export function madresDesdeMarcas(marcas: readonly number[]): Filas[] {
  if (marcas.length !== LINEAS || !marcas.every((m) => Number.isInteger(m) && m > 0)) throw new Error("Marcas no válidas");
  return [0, 1, 2, 3].map((m) => marcas.slice(m * 4, m * 4 + 4).map((n): Punto => (n % 2 === 1 ? 1 : 2)) as unknown as Filas);
}

export function hijasDesdeMadres(madres: readonly Filas[]): Filas[] {
  return [0, 1, 2, 3].map((fila) => madres.map((m) => m[fila]) as unknown as Filas);
}

export interface Escudo {
  madres: Filas[];
  hijas: Filas[];
  sobrinas: Filas[];
  testigoDerecho: Filas;
  testigoIzquierdo: Filas;
  juez: Filas;
  reconciliador: Filas;
}

export function escudoDesdeMadres(madres: readonly Filas[]): Escudo {
  const hijas = hijasDesdeMadres(madres);
  const sobrinas = [sumarFiguras(madres[0], madres[1]), sumarFiguras(madres[2], madres[3]), sumarFiguras(hijas[0], hijas[1]), sumarFiguras(hijas[2], hijas[3])];
  const testigoDerecho = sumarFiguras(sobrinas[0], sobrinas[1]);
  const testigoIzquierdo = sumarFiguras(sobrinas[2], sobrinas[3]);
  const juez = sumarFiguras(testigoDerecho, testigoIzquierdo);
  const reconciliador = sumarFiguras(juez, madres[0]);
  return { madres: [...madres], hijas, sobrinas, testigoDerecho, testigoIzquierdo, juez, reconciliador };
}

export function calcularGeomancia(marcas: readonly number[]): ResultadoGeomancia {
  const e = escudoDesdeMadres(madresDesdeMarcas(marcas));
  const id = (f: Filas) => figuraPorFilas(f).id;
  const quince = [...e.madres, ...e.hijas, ...e.sobrinas, e.testigoDerecho, e.testigoIzquierdo, e.juez].map(id);
  const cuentas = new Map<IdFigura, number>();
  for (const f of quince) cuentas.set(f, (cuentas.get(f) ?? 0) + 1);
  return {
    marcas: [...marcas],
    madres: e.madres.map(id),
    hijas: e.hijas.map(id),
    sobrinas: e.sobrinas.map(id),
    testigoDerecho: id(e.testigoDerecho),
    testigoIzquierdo: id(e.testigoIzquierdo),
    juez: id(e.juez),
    reconciliador: id(e.reconciliador),
    repetidas: [...cuentas].filter(([, v]) => v > 1).map(([f, veces]) => ({ id: f, veces })).sort((a, b) => b.veces - a.veces),
  };
}

/** ¿Es un resultado guardado con la forma esperada? (para las vistas, que reciben JSON). */
export function esResultadoGeomancia(r: unknown): r is ResultadoGeomancia {
  const x = r as Partial<ResultadoGeomancia> | null;
  const ok = (v: unknown) => typeof v === "string" && Boolean(figuraPorId(v));
  return Boolean(
    x &&
      Array.isArray(x.madres) && x.madres.length === 4 && x.madres.every(ok) &&
      Array.isArray(x.hijas) && x.hijas.length === 4 && x.hijas.every(ok) &&
      Array.isArray(x.sobrinas) && x.sobrinas.length === 4 && x.sobrinas.every(ok) &&
      ok(x.testigoDerecho) && ok(x.testigoIzquierdo) && ok(x.juez) && ok(x.reconciliador),
  );
}
