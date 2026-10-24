import type { Intencion } from "./velas";

/**
 * Guía de piedras: color, intenciones (las mismas de los rituales de velas) y
 * signos que acompaña cada una. Los textos visibles están en t.piedras.
 */
export const PIEDRAS = [
  { id: "cuarzo_rosa", color: "#f4b6c8", intenciones: ["amor", "sanacion"], signos: ["tauro", "libra"] },
  { id: "amatista", color: "#9b6cc4", intenciones: ["intuicion", "sanacion"], signos: ["acuario", "piscis"] },
  { id: "citrino", color: "#f2b632", intenciones: ["dinero", "exito"], signos: ["geminis", "leo"] },
  { id: "pirita", color: "#c9a85a", intenciones: ["dinero", "exito"], signos: ["leo"] },
  { id: "jade", color: "#3f9b6b", intenciones: ["dinero", "proteccion"], signos: ["tauro"] },
  { id: "cuarzo_cristal", color: "#e9eef2", intenciones: ["claridad", "proteccion"], signos: [] },
  { id: "turmalina_negra", color: "#26252b", intenciones: ["proteccion"], signos: ["capricornio"] },
  { id: "obsidiana", color: "#1b1b22", intenciones: ["proteccion", "cierre"], signos: ["escorpio"] },
  { id: "ojo_tigre", color: "#b07a2a", intenciones: ["exito", "proteccion"], signos: ["leo", "aries"] },
  { id: "aventurina", color: "#4fae74", intenciones: ["dinero", "exito"], signos: ["virgo"] },
  { id: "lapislazuli", color: "#2c4fa3", intenciones: ["claridad", "intuicion"], signos: ["sagitario", "libra"] },
  { id: "piedra_luna", color: "#d9dbe8", intenciones: ["intuicion", "amor"], signos: ["cancer", "piscis"] },
  { id: "cornalina", color: "#d0582f", intenciones: ["exito", "amor"], signos: ["aries"] },
  { id: "selenita", color: "#f4f1e8", intenciones: ["sanacion", "claridad"], signos: [] },
] as const satisfies readonly { id: string; color: string; intenciones: readonly Intencion[]; signos: readonly string[] }[];

export type IdPiedra = (typeof PIEDRAS)[number]["id"];

/** Piedra principal de cada signo (orden zodiacal). */
export const PIEDRA_DEL_SIGNO: Record<string, IdPiedra> = {
  aries: "cornalina",
  tauro: "cuarzo_rosa",
  geminis: "citrino",
  cancer: "piedra_luna",
  leo: "ojo_tigre",
  virgo: "aventurina",
  libra: "lapislazuli",
  escorpio: "obsidiana",
  sagitario: "lapislazuli",
  capricornio: "turmalina_negra",
  acuario: "amatista",
  piscis: "amatista",
};
