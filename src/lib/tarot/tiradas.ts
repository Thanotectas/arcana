import { randomInt } from "node:crypto";
import { MAZO, type CartaTarot } from "./deck";
import type { TipoLectura } from "../creditos";

export type TipoTirada = Extract<TipoLectura, "tarot_carta" | "tarot_tres" | "tarot_celta">;

export interface PosicionTirada {
  nombre: string;
  descripcion: string;
}

export interface Tirada {
  id: TipoTirada;
  nombre: string;
  descripcion: string;
  posiciones: PosicionTirada[];
}

export const TIRADAS: Record<TipoTirada, Tirada> = {
  tarot_carta: {
    id: "tarot_carta",
    nombre: "Carta del día",
    descripcion: "Una sola carta para orientar tu jornada o responder una pregunta puntual.",
    posiciones: [{ nombre: "Tu carta", descripcion: "La energía que te acompaña hoy." }],
  },
  tarot_tres: {
    id: "tarot_tres",
    nombre: "Pasado, presente y futuro",
    descripcion: "Tres cartas que muestran de dónde vienes, dónde estás y hacia dónde apunta la situación.",
    posiciones: [
      { nombre: "Pasado", descripcion: "Raíces e influencias que te trajeron hasta aquí." },
      { nombre: "Presente", descripcion: "El corazón de la situación actual." },
      { nombre: "Futuro", descripcion: "La dirección probable si nada cambia." },
    ],
  },
  tarot_celta: {
    id: "tarot_celta",
    nombre: "Cruz Celta",
    descripcion: "La tirada clásica de diez cartas para una lectura profunda de una situación compleja.",
    posiciones: [
      { nombre: "La situación", descripcion: "El asunto central." },
      { nombre: "El desafío", descripcion: "Lo que cruza o tensiona la situación." },
      { nombre: "La raíz", descripcion: "Lo inconsciente, la base del asunto." },
      { nombre: "El pasado", descripcion: "Lo que queda atrás." },
      { nombre: "Lo consciente", descripcion: "Tus metas y lo que tienes en mente." },
      { nombre: "El futuro cercano", descripcion: "Lo que se aproxima." },
      { nombre: "Tú", descripcion: "Tu actitud frente a la situación." },
      { nombre: "El entorno", descripcion: "Influencias de personas y circunstancias." },
      { nombre: "Esperanzas y temores", descripcion: "Lo que deseas y lo que temes." },
      { nombre: "El resultado", descripcion: "Hacia dónde tiende todo." },
    ],
  },
};

export interface CartaTirada {
  posicion: number;
  cartaId: string;
  invertida: boolean;
}

/** Baraja con aleatoriedad criptográfica y devuelve n cartas sin repetir. */
export function tirarCartas(tipo: TipoTirada): CartaTirada[] {
  const n = TIRADAS[tipo].posiciones.length;
  const indices = MAZO.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, n).map((idx, posicion) => ({
    posicion,
    cartaId: MAZO[idx].id,
    invertida: randomInt(0, 100) < 30,
  }));
}

export function cartasDeTirada(cartas: CartaTirada[]): (CartaTirada & { carta: CartaTarot })[] {
  return cartas.map((c) => ({ ...c, carta: MAZO.find((m) => m.id === c.cartaId)! }));
}

/** Texto para el modelo de IA con la tirada completa. */
export function resumenTirada(tipo: TipoTirada, cartas: CartaTirada[], pregunta: string) {
  const t = TIRADAS[tipo];
  const lineas = [`Tirada: ${t.nombre}`, `Pregunta de la persona: ${pregunta || "(sin pregunta específica)"}`, "Cartas:"];
  for (const c of cartasDeTirada(cartas)) {
    const pos = t.posiciones[c.posicion];
    lineas.push(
      `- Posición ${c.posicion + 1} "${pos.nombre}" (${pos.descripcion}): ${c.carta.nombre}${c.invertida ? " INVERTIDA" : ""}. ` +
        `Palabras clave: ${(c.invertida ? c.carta.palabrasClaveInvertida : c.carta.palabrasClave).join(", ")}. ` +
        `Significado: ${c.invertida ? c.carta.significadoInvertido : c.carta.significado}`,
    );
  }
  return lineas.join("\n");
}
