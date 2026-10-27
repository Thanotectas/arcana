import { datoDeUsuario } from "../seguridad";
import type { Signo } from "../zodiaco";

/**
 * Test de aura: doce preguntas con cuatro opciones; cada opción suma a uno o
 * dos colores. Se cruza con el elemento del signo solar (si hay fecha de
 * nacimiento) y da un color principal y uno secundario. Base: la tradición
 * teosófica (Leadbeater, Besant) y la lectura moderna de colores del aura.
 */
export const COLORES_AURA = ["rojo", "naranja", "amarillo", "verde", "azul", "indigo", "violeta", "rosa", "dorado"] as const;
export type ColorAura = (typeof COLORES_AURA)[number];

export const PREGUNTAS = 12;
export const OPCIONES = 4;

/** Para cada pregunta, los colores a los que apunta cada opción (índice 0–3). */
export const MAPA: ColorAura[][][] = [
  [["rojo"], ["amarillo"], ["azul"], ["violeta"]], // 1 cómo entras a un lugar nuevo
  [["naranja"], ["verde"], ["indigo"], ["rosa"]], // 2 qué te recarga
  [["rojo", "naranja"], ["azul"], ["verde"], ["dorado"]], // 3 ante un conflicto
  [["amarillo"], ["violeta"], ["rosa"], ["verde"]], // 4 lo que la gente valora de ti
  [["indigo"], ["naranja"], ["azul"], ["rojo"]], // 5 cómo decides
  [["dorado"], ["rosa"], ["amarillo"], ["indigo"]], // 6 qué te agota
  [["verde"], ["violeta"], ["rojo"], ["azul"]], // 7 tu lugar ideal
  [["rosa"], ["dorado"], ["naranja"], ["indigo"]], // 8 en el amor
  [["amarillo"], ["azul"], ["violeta"], ["verde"]], // 9 cuando creas algo
  [["rojo"], ["indigo"], ["rosa"], ["dorado"]], // 10 tu miedo más frecuente
  [["naranja"], ["verde"], ["violeta"], ["azul"]], // 11 un domingo perfecto
  [["dorado"], ["rojo"], ["indigo"], ["amarillo"]], // 12 lo que quieres dejar
];

/** Color que refuerza el elemento del Sol natal. */
const COLOR_ELEMENTO: Record<Signo["elemento"], ColorAura> = { fuego: "rojo", tierra: "verde", aire: "amarillo", agua: "azul" };

/** Tonos para dibujar el aura. */
export const TONO_AURA: Record<ColorAura, string> = {
  rojo: "#e5484d",
  naranja: "#f28c28",
  amarillo: "#f5d547",
  verde: "#3fb27f",
  azul: "#3b82f6",
  indigo: "#4f46e5",
  violeta: "#9b5cf6",
  rosa: "#f472b6",
  dorado: "#e2bd63",
};

export interface ResultadoAura {
  principal: ColorAura;
  secundario: ColorAura;
  /** Puntaje 0–100 por color (normalizado al máximo). */
  puntajes: Record<ColorAura, number>;
  signoSol: string | null;
}

export function esRespuestasValidas(r: unknown): r is number[] {
  return Array.isArray(r) && r.length === PREGUNTAS && r.every((x) => Number.isInteger(x) && x >= 0 && x < OPCIONES);
}

export function calcularAura(respuestas: number[], signoSol: Signo | null): ResultadoAura {
  const suma = Object.fromEntries(COLORES_AURA.map((c) => [c, 0])) as Record<ColorAura, number>;
  respuestas.forEach((opcion, i) => {
    const colores = MAPA[i]?.[opcion] ?? [];
    const peso = 1 / colores.length;
    for (const c of colores) suma[c] += peso;
  });
  if (signoSol) suma[COLOR_ELEMENTO[signoSol.elemento]] += 1.5;
  const orden = [...COLORES_AURA].sort((a, b) => suma[b] - suma[a] || COLORES_AURA.indexOf(a) - COLORES_AURA.indexOf(b));
  const maximo = suma[orden[0]] || 1;
  const puntajes = Object.fromEntries(COLORES_AURA.map((c) => [c, Math.round((suma[c] / maximo) * 100)])) as Record<ColorAura, number>;
  return { principal: orden[0], secundario: orden[1], puntajes, signoSol: signoSol?.id ?? null };
}

const NOMBRE: Record<ColorAura, string> = {
  rojo: "rojo (vitalidad, pasión, acción, cuerpo)",
  naranja: "naranja (creatividad, entusiasmo, sociabilidad, placer)",
  amarillo: "amarillo (mente, optimismo, comunicación, curiosidad)",
  verde: "verde (sanación, equilibrio, naturaleza, cuidado de otros)",
  azul: "azul (calma, verdad, lealtad, sensibilidad profunda)",
  indigo: "índigo (intuición, percepción, silencio, visión interior)",
  violeta: "violeta (espiritualidad, imaginación, transformación, misterio)",
  rosa: "rosa (amor incondicional, ternura, compasión, romance)",
  dorado: "dorado (sabiduría, protección, generosidad, luz que guía)",
};

/** Resumen para el modelo. */
export function resumenAura(r: ResultadoAura, nombre: string) {
  const lista = [...COLORES_AURA].sort((a, b) => r.puntajes[b] - r.puntajes[a]).map((c) => `${c} ${r.puntajes[c]}`).join(", ");
  return [
    `Persona: ${datoDeUsuario(nombre, 80) || "la persona"}${r.signoSol ? `, Sol en ${r.signoSol}` : ""}.`,
    `Color principal del aura: ${NOMBRE[r.principal]}.`,
    `Color secundario: ${NOMBRE[r.secundario]}.`,
    `Perfil completo (0–100): ${lista}.`,
    `Centros de energía más encendidos: ${centrosEncendidos(r)}. Color dormido (el más bajo): ${NOMBRE[ordenAura(r).at(-1)!]}.`,
  ].join("\n");
}

export const TRADICION_AURA =
  "Lectura del aura según la tradición teosófica (Leadbeater, 'El hombre visible e invisible'; Besant, 'Formas de pensamiento') y la lectura moderna de colores (campo energético por capas, colores como estados y tendencias, no como etiquetas fijas). " +
  "El color principal describe el tono de fondo de la persona en este momento de su vida; el secundario, el matiz que lo acompaña o lo equilibra; los colores con puntaje bajo señalan lo que la persona tiene poco presente y podría cultivar. " +
  "El aura cambia: no es un diagnóstico ni un destino. Habla de cómo se percibe a la persona, qué la nutre, qué la drena y cómo cuidar su energía. Sin referencias médicas ni a enfermedades. Tono cálido, concreto y luminoso.";

/** Los siete centros de energía, de la coronilla a la base, y los colores del aura que los encienden. */
export const CHAKRAS = ["corona", "tercerOjo", "garganta", "corazon", "plexo", "sacro", "raiz"] as const;
export type Chakra = (typeof CHAKRAS)[number];
export const COLORES_CHAKRA: Record<Chakra, ColorAura[]> = {
  corona: ["violeta", "dorado"],
  tercerOjo: ["indigo"],
  garganta: ["azul"],
  corazon: ["verde", "rosa"],
  plexo: ["amarillo"],
  sacro: ["naranja"],
  raiz: ["rojo"],
};

/** Cuánto brilla cada centro (0–100): el mayor puntaje de sus colores. */
export function brilloChakras(r: ResultadoAura): Record<Chakra, number> {
  return Object.fromEntries(CHAKRAS.map((c) => [c, Math.max(...COLORES_CHAKRA[c].map((x) => r.puntajes[x] ?? 0))])) as Record<Chakra, number>;
}

/** Colores vecinos en la rueda del aura: armonizan con cada color. */
export const AFINES: Record<ColorAura, [ColorAura, ColorAura]> = {
  rojo: ["naranja", "dorado"],
  naranja: ["rojo", "amarillo"],
  amarillo: ["naranja", "verde"],
  verde: ["azul", "amarillo"],
  azul: ["verde", "indigo"],
  indigo: ["azul", "violeta"],
  violeta: ["indigo", "rosa"],
  rosa: ["violeta", "rojo"],
  dorado: ["amarillo", "violeta"],
};

/** El color opuesto, que equilibra a cada uno. */
export const EQUILIBRA: Record<ColorAura, ColorAura> = {
  rojo: "verde",
  naranja: "azul",
  amarillo: "violeta",
  verde: "rojo",
  azul: "naranja",
  indigo: "dorado",
  violeta: "amarillo",
  rosa: "verde",
  dorado: "indigo",
};

/** Los colores de mayor a menor puntaje. */
export function ordenAura(r: ResultadoAura): ColorAura[] {
  return [...COLORES_AURA].sort((a, b) => r.puntajes[b] - r.puntajes[a] || COLORES_AURA.indexOf(a) - COLORES_AURA.indexOf(b));
}

const NOMBRE_CHAKRA: Record<Chakra, string> = { corona: "coronilla", tercerOjo: "tercer ojo", garganta: "garganta", corazon: "corazón", plexo: "plexo solar", sacro: "sacro", raiz: "raíz" };

function centrosEncendidos(r: ResultadoAura) {
  const b = brilloChakras(r);
  return [...CHAKRAS].sort((x, y) => b[y] - b[x]).slice(0, 3).map((c) => `${NOMBRE_CHAKRA[c]} ${b[c]}`).join(", ");
}
