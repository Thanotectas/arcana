import { HEXAGRAMAS, type Hexagrama, type Trigrama } from "./hexagramas";

export type { Hexagrama, Trigrama };
export { HEXAGRAMAS };

/**
 * Valor de una línea según el método de las tres monedas: cara = 3, cruz = 2.
 * 6 = yin mutante, 7 = yang, 8 = yin, 9 = yang mutante.
 */
export type ValorLinea = 6 | 7 | 8 | 9;

export interface Lanzamiento {
  monedas: [boolean, boolean, boolean]; // true = cara
  valor: ValorLinea;
}

export function valorDeMonedas(monedas: [boolean, boolean, boolean]): ValorLinea {
  const suma = monedas.reduce((acc, cara) => acc + (cara ? 3 : 2), 0);
  return suma as ValorLinea;
}

export function esYang(v: ValorLinea) {
  return v === 7 || v === 9;
}

export function esMutante(v: ValorLinea) {
  return v === 6 || v === 9;
}

/** Busca el hexagrama por sus seis líneas (de abajo hacia arriba). */
export function hexagramaPorLineas(lineas: (0 | 1)[]): Hexagrama | undefined {
  const clave = lineas.join("");
  return HEXAGRAMAS.find((h) => h.lineas.join("") === clave);
}

export function hexagramaPorNumero(n: number): Hexagrama | undefined {
  return HEXAGRAMAS.find((h) => h.numero === n);
}

export interface ResultadoIChing {
  valores: ValorLinea[]; // 6 valores, de abajo hacia arriba
  presente: number; // número de hexagrama
  mutantes: number[]; // índices 0..5 de líneas mutantes
  futuro: number | null; // hexagrama resultante si hay mutantes
}

/** Construye el resultado a partir de los seis valores. */
export function resolverHexagramas(valores: ValorLinea[]): ResultadoIChing {
  if (valores.length !== 6) throw new Error("Se necesitan seis líneas.");
  const lineasPresente = valores.map((v) => (esYang(v) ? 1 : 0)) as (0 | 1)[];
  const mutantes = valores.map((v, i) => (esMutante(v) ? i : -1)).filter((i) => i >= 0);
  const lineasFuturo = valores.map((v) => (esMutante(v) ? (esYang(v) ? 0 : 1) : esYang(v) ? 1 : 0)) as (0 | 1)[];
  const presente = hexagramaPorLineas(lineasPresente);
  const futuro = mutantes.length ? hexagramaPorLineas(lineasFuturo) : undefined;
  if (!presente) throw new Error("Hexagrama no encontrado.");
  return { valores, presente: presente.numero, mutantes, futuro: futuro?.numero ?? null };
}

export const SIMBOLO_TRIGRAMA: Record<Trigrama, string> = {
  cielo: "☰",
  tierra: "☷",
  trueno: "☳",
  agua: "☵",
  montana: "☶",
  viento: "☴",
  fuego: "☲",
  lago: "☱",
};

/** Texto para el modelo con la consulta completa. */
export function resumenIChing(r: ResultadoIChing, pregunta: string) {
  const p = hexagramaPorNumero(r.presente)!;
  const f = r.futuro ? hexagramaPorNumero(r.futuro) : null;
  const describir = (h: Hexagrama) =>
    `${h.numero}. ${h.nombre} (${h.chino}, ${h.pinyin}); trigramas ${h.trigramaInferior} abajo y ${h.trigramaSuperior} arriba. ` +
    `Juicio: ${h.juicio} Imagen: ${h.imagen} Significado: ${h.significado}`;
  const lineas = [
    `Pregunta de la persona: ${pregunta || "(sin pregunta específica)"}`,
    `Método: tres monedas, seis lanzamientos. Valores de abajo hacia arriba: ${r.valores.join(", ")} (6 = yin mutante, 7 = yang, 8 = yin, 9 = yang mutante).`,
    `Hexagrama presente: ${describir(p)}`,
    r.mutantes.length
      ? `Líneas mutantes (contando desde abajo): ${r.mutantes.map((i) => i + 1).join(", ")}. Interpreta el texto tradicional de cada línea mutante del hexagrama presente.`
      : "No hay líneas mutantes: la situación es estable; interpreta solo el Juicio y la Imagen.",
    f ? `Hexagrama resultante: ${describir(f)}` : "",
  ];
  return lineas.filter(Boolean).join("\n");
}
