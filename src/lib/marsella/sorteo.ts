import { randomInt } from "node:crypto";
import { ARCANOS_MARSELLA } from "./mazo";
import { CARTAS_A_ELEGIR, cartaDeSintesis, seleccionValida, type ResultadoMarsella } from "./tirada";

/**
 * Sorteo en el servidor: la persona eligió posiciones del abanico boca abajo; aquí se baraja el mazo de 22 con
 * azar criptográfico y se mira qué lámina quedó en cada posición. Elegir una posición no permite elegir carta.
 * Las láminas se leen al derecho (sin invertidas), como en el tirage en croix clásico.
 * Usa node:crypto: solo en el servidor.
 */
export function sortearMarsella(elegidas: number[]): ResultadoMarsella {
  if (!seleccionValida(elegidas)) throw new Error("Selección no válida.");
  const orden = ARCANOS_MARSELLA.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  const cartas = elegidas.slice(0, CARTAS_A_ELEGIR).map((p, posicion) => ({ posicion, id: ARCANOS_MARSELLA[orden[p]].id }));
  return { cartas, sintesis: cartaDeSintesis(cartas.map((c) => c.id)) };
}
