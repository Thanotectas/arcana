/**
 * Numerología pitagórica más allá de los seis números: la cuadrícula de
 * Pitágoras de la fecha (con sus flechas), los pináculos y desafíos (las
 * cuatro etapas de la vida), lo que dice el nombre (lecciones kármicas, pasión
 * oculta) y las deudas kármicas. Sin dependencias de servidor.
 */
import { reducir } from "./numerologia";
import { letrasConValor } from "./numerologia-detalle";

/** Las ocho líneas de la cuadrícula (filas, columnas y diagonales). */
export const FLECHAS = ["369", "258", "147", "123", "456", "789", "159", "357"] as const;
export type Flecha = (typeof FLECHAS)[number];

export interface Cuadricula {
  /** Cuántas veces aparece cada dígito del 1 al 9 en la fecha (índice 1..9). */
  cuenta: number[];
  llenas: Flecha[];
  vacias: Flecha[];
}

/** Cuadrícula de Pitágoras con los dígitos de la fecha de nacimiento (AAAA-MM-DD). */
export function cuadricula(fecha: string): Cuadricula {
  const cuenta = Array<number>(10).fill(0);
  for (const c of fecha.replace(/\D/g, "")) if (c !== "0") cuenta[Number(c)]++;
  const digitos = (f: Flecha) => f.split("").map(Number);
  return {
    cuenta,
    llenas: FLECHAS.filter((f) => digitos(f).every((d) => cuenta[d] > 0)),
    vacias: FLECHAS.filter((f) => digitos(f).every((d) => cuenta[d] === 0)),
  };
}

export interface Etapa {
  pinaculo: number;
  desafio: number;
  desde: number;
  /** Edad en que termina (null en la última etapa). */
  hasta: number | null;
}

/** Los cuatro pináculos con su desafío y las edades de cada etapa. */
export function etapas(fecha: string): Etapa[] | null {
  const m0 = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m0) return null;
  const [a, m, d] = [Number(m0[1]), Number(m0[2]), Number(m0[3])].map((n) => reducir(n, false));
  const camino = reducir(a + m + d, false);
  const p1 = reducir(m + d);
  const p2 = reducir(d + a);
  const p3 = reducir(reducir(p1, false) + reducir(p2, false));
  const p4 = reducir(m + a);
  const d1 = Math.abs(m - d);
  const d2 = Math.abs(d - a);
  const d3 = Math.abs(d1 - d2);
  const d4 = Math.abs(m - a);
  const fin1 = 36 - camino;
  return [
    { pinaculo: p1, desafio: d1, desde: 0, hasta: fin1 },
    { pinaculo: p2, desafio: d2, desde: fin1 + 1, hasta: fin1 + 9 },
    { pinaculo: p3, desafio: d3, desde: fin1 + 10, hasta: fin1 + 18 },
    { pinaculo: p4, desafio: d4, desde: fin1 + 19, hasta: null },
  ];
}

/** Edad cumplida en una fecha dada (AAAA-MM-DD contra el día de hoy). */
export function edad(fecha: string, hoy: Date) {
  const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  let e = hoy.getUTCFullYear() - a;
  if (hoy.getUTCMonth() + 1 < mes || (hoy.getUTCMonth() + 1 === mes && hoy.getUTCDate() < d)) e--;
  return e;
}

export interface Nombre {
  /** Cuántas letras del nombre valen cada número (índice 1..9). */
  cuenta: number[];
  lecciones: number[];
  pasion: number[];
}

/** Plano de inclusión del nombre: lecciones kármicas (números ausentes) y pasión oculta (los que más se repiten). */
export function planoNombre(nombre: string): Nombre {
  const cuenta = Array<number>(10).fill(0);
  for (const l of letrasConValor(nombre)) if (l.valor) cuenta[l.valor]++;
  const max = Math.max(...cuenta.slice(1));
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return { cuenta, lecciones: nums.filter((n) => cuenta[n] === 0), pasion: max > 0 ? nums.filter((n) => cuenta[n] === max) : [] };
}

export const DEUDAS = [13, 14, 16, 19] as const;
export type Deuda = (typeof DEUDAS)[number];

/** Deudas kármicas: 13, 14, 16 o 19 como suma intermedia del día, el camino o los números del nombre. */
export function deudasKarmicas(nombre: string, fecha: string): Deuda[] {
  const letras = letrasConValor(nombre);
  const intermedio = (n: number) => {
    // Recorre la reducción y devuelve los valores de dos cifras por los que pasa.
    const vistos: number[] = [];
    while (n > 9) {
      vistos.push(n);
      n = String(n).split("").reduce((s, c) => s + Number(c), 0);
    }
    return vistos;
  };
  const sumas: number[] = [letras.reduce((s, l) => s + l.valor, 0), letras.filter((l) => l.vocal).reduce((s, l) => s + l.valor, 0), letras.filter((l) => !l.vocal).reduce((s, l) => s + l.valor, 0)];
  const m = fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [a, mes, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
    sumas.push(d, reducir(a, false) + reducir(mes, false) + reducir(d, false));
  }
  const halladas = new Set(sumas.flatMap(intermedio));
  return DEUDAS.filter((n) => halladas.has(n));
}

/** La fecha de hoy en Colombia (UTC-5), leída con getUTC*. */
export function hoyColombia() {
  return new Date(Date.now() - 5 * 3600 * 1000);
}

/** Mes y día personal a partir del año personal y la fecha de hoy. */
export function mesYDia(anioPersonal: number, hoy: Date) {
  const mes = reducir(anioPersonal + reducir(hoy.getUTCMonth() + 1, false), false);
  const dia = reducir(mes + reducir(hoy.getUTCDate(), false), false);
  return { mes, dia };
}

const NOMBRE_FLECHA: Record<Flecha, [string, string]> = {
  "369": ["intelecto", "memoria floja"],
  "258": ["equilibrio emocional", "hipersensibilidad"],
  "147": ["lo práctico", "desorden"],
  "123": ["planificación", "improvisación"],
  "456": ["voluntad", "frustración"],
  "789": ["acción", "vacilación"],
  "159": ["determinación", "postergación"],
  "357": ["espiritualidad", "escepticismo"],
};

/** Texto para el modelo con los datos que se dibujan en la página (etapas, cuadrícula, nombre, mes personal). */
export function resumenNumerologiaAvanzada(nombre: string, fecha: string, anioPersonal: number, hoy = hoyColombia()) {
  const lineas: string[] = [];
  const vida = etapas(fecha);
  const anos = edad(fecha, hoy);
  if (vida && anos != null) {
    const i = vida.findIndex((e) => anos >= e.desde && (e.hasta == null || anos <= e.hasta));
    const describir = (e: Etapa) => `pináculo ${e.pinaculo}, desafío ${e.desafio} (${e.hasta == null ? `desde los ${e.desde} años` : `${e.desde} a ${e.hasta} años`})`;
    lineas.push(`Edad: ${anos} años. Etapas: ${vida.map((e, k) => `${k + 1}) ${describir(e)}`).join("; ")}. Etapa actual: la ${i + 1}.`);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    const c = cuadricula(fecha);
    const flechas = [...c.llenas.map((f) => `llena ${f} (${NOMBRE_FLECHA[f][0]})`), ...c.vacias.map((f) => `vacía ${f} (${NOMBRE_FLECHA[f][1]})`)];
    lineas.push(`Cuadrícula de Pitágoras de la fecha: ${flechas.length ? flechas.join(", ") : "sin líneas completas"}.`);
  }
  if (nombre) {
    const p = planoNombre(nombre);
    const deudas = deudasKarmicas(nombre, fecha);
    lineas.push(`Lecciones kármicas (números ausentes en el nombre): ${p.lecciones.length ? p.lecciones.join(", ") : "ninguna"}. Pasión oculta: ${p.pasion.join(", ") || "—"}.${deudas.length ? ` Deuda kármica: ${deudas.join(", ")}.` : ""}`);
  }
  const { mes } = mesYDia(anioPersonal, hoy);
  lineas.push(`Mes personal actual: ${mes}.`);
  return lineas.join("\n");
}
