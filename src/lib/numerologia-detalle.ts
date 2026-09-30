/**
 * Detalle paso a paso del cálculo numerológico, para mostrarlo en pantalla.
 * Sin dependencias de servidor: se usa en el navegador.
 */
import { reducir } from "./numerologia";

const VALORES: Record<string, number> = {
  a: 1, j: 1, s: 1, b: 2, k: 2, t: 2, c: 3, l: 3, u: 3, d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5, f: 6, o: 6, x: 6, g: 7, p: 7, y: 7, h: 8, q: 8, z: 8, i: 9, r: 9,
};
const VOCALES = new Set(["a", "e", "i", "o", "u"]);

export interface LetraValor {
  letra: string;
  valor: number;
  vocal: boolean;
}

export function letrasConValor(nombre: string): LetraValor[] {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .split("")
    .filter((l) => /[a-z]/.test(l))
    .map((letra) => ({ letra, valor: VALORES[letra] ?? 0, vocal: VOCALES.has(letra) }));
}

export interface PasoSuma {
  total: number;
  reducido: number;
}

export function pasoSuma(valores: number[]): PasoSuma {
  const total = valores.reduce((a, b) => a + b, 0);
  return { total, reducido: reducir(total) };
}

export function pasoFecha(fecha: string): { dia: PasoSuma; mes: PasoSuma; anio: PasoSuma; camino: PasoSuma } | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const [a, m, d] = fecha.split("-").map(Number);
  const dia = { total: d, reducido: reducir(d) };
  const mes = { total: m, reducido: reducir(m) };
  const anio = { total: a, reducido: reducir(a) };
  const camino = pasoSuma([dia.reducido, mes.reducido, anio.reducido]);
  return { dia, mes, anio, camino };
}
