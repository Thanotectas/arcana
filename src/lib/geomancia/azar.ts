import "server-only";
import { randomInt } from "node:crypto";
import { LINEAS, MAX_MARCAS } from "./calculo";

/** Lee del formulario los toques de cada línea (JSON con 16 enteros de 1 a MAX_MARCAS). */
export function leerToques(valor: FormDataEntryValue | null): number[] | null {
  try {
    const crudo = JSON.parse(String(valor ?? "[]"));
    const validos = Array.isArray(crudo) && crudo.length === LINEAS && crudo.every((n) => Number.isInteger(n) && n >= 1 && n <= MAX_MARCAS);
    return validos ? (crudo as number[]) : null;
  } catch {
    return null;
  }
}

/**
 * Como en la arena, la persona traza marcas sin contarlas; el servidor añade a cada línea una última marca o
 * ninguna con el azar criptográfico. Así la paridad de cada línea (y con ella cada figura) la decide el servidor,
 * con la misma probabilidad para par e impar, sea cual sea el número de toques que llegó del navegador.
 */
export function trazarConAzar(toques: readonly number[]): number[] {
  return toques.map((n) => n + randomInt(0, 2));
}
