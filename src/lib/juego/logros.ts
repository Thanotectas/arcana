import { MAZO } from "@/lib/tarot/deck";
import { cartasDelGrupo, type IdGrupo } from "./carta-escondida";

/** Logros de El Camino del Loco: se calculan con lo que ya se guarda (partidas, racha y álbum). */
export interface Logro {
  id: string;
  icono: string;
  nombre: string;
  descripcion: string;
}

export const LOGROS: Logro[] = [
  { id: "primer-paso", icono: "🌱", nombre: "Primer paso", descripcion: "Descubre tu primera carta" },
  { id: "lince", icono: "👁️", nombre: "Vista de lince", descripcion: "Encuéntrala a la primera" },
  { id: "por-poco", icono: "😮‍💨", nombre: "Por un pelo", descripcion: "Encuéntrala en el último intento" },
  { id: "racha-3", icono: "🔥", nombre: "Constancia", descripcion: "Juega 3 días seguidos" },
  { id: "racha-7", icono: "🌟", nombre: "Una semana de magia", descripcion: "Juega 7 días seguidos" },
  { id: "coleccion-10", icono: "🃏", nombre: "Coleccionista", descripcion: "Descubre 10 cartas" },
  { id: "palo-completo", icono: "🏆", nombre: "Dueña de un palo", descripcion: "Completa un palo entero (14 cartas)" },
  { id: "medio-mazo", icono: "🌓", nombre: "Medio mazo", descripcion: "Descubre 39 cartas" },
  { id: "camino", icono: "🧭", nombre: "El Camino del Loco", descripcion: "Descubre los 22 Arcanos Mayores" },
  { id: "mazo", icono: "👑", nombre: "Todo el tarot", descripcion: "Descubre las 78 cartas" },
  { id: "maestro", icono: "🌙", nombre: "Ojo de maestro", descripcion: "Supera un reto maestro" },
];

export interface DatosLogros {
  album: ReadonlySet<string>;
  mejorRacha: number;
  /** Partidas ganadas en 1, 2… 6 intentos. */
  distribucion: number[];
  /** Retos maestros superados. */
  maestros?: number;
}

export function logrosObtenidos(d: DatosLogros): Set<string> {
  const tiene = (g: IdGrupo) => cartasDelGrupo(g).every((c) => d.album.has(c.id));
  const s = new Set<string>();
  if (d.album.size >= 1) s.add("primer-paso");
  if ((d.distribucion[0] ?? 0) > 0) s.add("lince");
  if ((d.distribucion[5] ?? 0) > 0) s.add("por-poco");
  if (d.mejorRacha >= 3) s.add("racha-3");
  if (d.mejorRacha >= 7) s.add("racha-7");
  if (d.album.size >= 10) s.add("coleccion-10");
  if ((["bastos", "copas", "espadas", "oros"] as IdGrupo[]).some(tiene)) s.add("palo-completo");
  if (d.album.size >= 39) s.add("medio-mazo");
  if (tiene("mayor")) s.add("camino");
  if (d.album.size >= MAZO.length) s.add("mazo");
  if ((d.maestros ?? 0) > 0) s.add("maestro");
  return s;
}
