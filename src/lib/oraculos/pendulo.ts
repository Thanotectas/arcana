import { datoDeUsuario } from "../seguridad";

/**
 * Péndulo: una pregunta de sí o no. El servidor decide el movimiento (con el
 * azar de la tirada) y Sibila explica la respuesta.
 */
export type Movimiento = "si" | "no" | "vaiven" | "quieto";
export const MOVIMIENTOS: Movimiento[] = ["si", "no", "vaiven", "quieto"];

/** Pesos: sí y no igual de probables; la duda menos; el silencio, raro. */
export const PESO_MOVIMIENTO: Record<Movimiento, number> = { si: 38, no: 38, vaiven: 18, quieto: 6 };

export const SENTIDO_MOVIMIENTO: Record<Movimiento, string> = {
  si: "giró en círculos en el sentido de las agujas del reloj: SÍ",
  no: "giró en círculos en sentido contrario a las agujas del reloj: NO",
  vaiven: "se movió en vaivén, de un lado a otro: todavía no está decidido, depende de lo que la persona haga",
  quieto: "se quedó casi quieto: no es momento de preguntar esto, o la pregunta necesita otra forma",
};

/** Inicio del día de hoy en Colombia (UTC−5, sin horario de verano), en ISO: el péndulo gratis se renueva a medianoche. */
export function inicioDelDia(ahora = new Date()) {
  const fecha = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(ahora);
  return new Date(`${fecha}T05:00:00Z`).toISOString();
}

export interface EntradaPendulo {
  pregunta: string;
  idioma?: string;
}

export interface ResultadoPendulo {
  movimiento: Movimiento;
}

export function resumenPendulo(e: EntradaPendulo, r: ResultadoPendulo) {
  return `Pregunta de sí o no: ${datoDeUsuario(e.pregunta, 200)}\nEl péndulo ${SENTIDO_MOVIMIENTO[r.movimiento]}.`;
}

export const TRADICION_PENDULO =
  "Radiestesia con péndulo: se sostiene el péndulo quieto sobre la mano o sobre una hoja, se respira, se formula una pregunta de sí o no y se observa el movimiento. El giro horario es sí, el antihorario es no, el vaivén es duda y la quietud, que no es momento. " +
  "Responde primero, en una frase clara, lo que dijo el péndulo; después explica qué significa para esta pregunta y qué haría inclinar la balanza. Breve, cálido, sin dramatismo. Si la pregunta toca salud, embarazos, juicios o la vida de terceros, responde con prudencia y recuerda que el péndulo orienta, no sustituye a un profesional.";
