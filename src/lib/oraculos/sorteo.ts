import "server-only";
import { randomInt } from "node:crypto";
import type { PiezaSacada } from "./comun";

/**
 * Baraja con el azar del servidor y entrega la pieza que quedó en cada
 * posición elegida por la persona en el abanico (o en la bolsa de runas).
 */
export function sacarDesdeAbanico(ids: readonly string[], elegidas: number[], n: number, puedeInvertirse: (id: string) => boolean, probabilidadInvertida = 0): PiezaSacada[] {
  const validas = elegidas.length === n && new Set(elegidas).size === n && elegidas.every((p) => Number.isInteger(p) && p >= 0 && p < ids.length);
  if (!validas) throw new Error("Selección no válida.");
  const orden = ids.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return elegidas.map((p, posicion) => {
    const id = ids[orden[p]];
    return { posicion, id, invertida: puedeInvertirse(id) && randomInt(0, 100) < probabilidadInvertida };
  });
}

/** Lee del formulario las posiciones elegidas (JSON con números). */
export function leerElegidas(valor: FormDataEntryValue | null): number[] | null {
  try {
    const crudo = JSON.parse(String(valor ?? "[]"));
    return Array.isArray(crudo) && crudo.every((x) => typeof x === "number") ? crudo : null;
  } catch {
    return null;
  }
}
