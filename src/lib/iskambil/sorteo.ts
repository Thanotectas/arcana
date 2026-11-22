import { randomInt } from "node:crypto";
import { MAZO_ISKAMBIL } from "./mazo";
import { seleccionValidaIskambil, type IdTiradaIskambil, type ResultadoIskambil } from "./tirada";

/**
 * Sorteo en el servidor: se baraja el mazo de 52 con azar criptográfico y se mira qué carta quedó en cada posición
 * del abanico que eligió la persona. Elegir una posición no permite elegir carta. Usa node:crypto: solo en el servidor.
 */
export function sortearIskambil(tirada: IdTiradaIskambil, elegidas: number[]): ResultadoIskambil {
  if (!seleccionValidaIskambil(elegidas, tirada)) throw new Error("Selección no válida.");
  const orden = MAZO_ISKAMBIL.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return { tirada, cartas: elegidas.map((p, posicion) => ({ posicion, id: MAZO_ISKAMBIL[orden[p]].id })) };
}
