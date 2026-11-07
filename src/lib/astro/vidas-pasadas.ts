/**
 * «Tus vidas pasadas»: lectura de reencarnación que cruza la astrología
 * kármica (Nodo Sur: lo que el alma trae; Nodo Norte: hacia dónde va; Saturno,
 * Plutón y la casa 12), la numerología kármica (deudas 13/14/16/19 y
 * lecciones: números que faltan en el nombre) y tres cartas del tarot.
 * Es una lectura simbólica y espiritual, no un dato comprobable.
 */
import { randomInt } from "node:crypto";
import { datoDeUsuario } from "../seguridad";
import { calcularCarta, type DatosNacimiento } from "./carta";
import { casaDeLongitud } from "./casas";
import { NOMBRES_CUERPO } from "./textos";
import { signoPorLongitud, formatoGrado } from "../zodiaco";
import { deudasKarmicas, planoNombre, type Deuda } from "../numerologia-avanzada";
import { calcularPerfil } from "../numerologia";
import { MAZO } from "../tarot/deck";

export const POSICIONES_VIDAS = ["Quién fuiste", "Lo que trajiste contigo", "Lo que vienes a sanar"] as const;

export interface PuntoKarmico {
  longitud: number;
  signo: string;
  grado: string;
  casa: number | null;
}

export interface CartaVidas {
  id: string;
  nombre: string;
  invertida: boolean;
  posicion: string;
}

export interface ResultadoVidasPasadas {
  fechaUtc: string;
  nodoSur: PuntoKarmico;
  nodoNorte: PuntoKarmico;
  saturno: PuntoKarmico & { retrogrado: boolean };
  pluton: PuntoKarmico & { retrogrado: boolean };
  /** Planetas a menos de 8° del Nodo Sur: talentos o heridas que vienen de atrás. */
  junto_nodo_sur: string[];
  /** Planetas en la casa 12 (lo oculto, la memoria del alma). */
  casa12: string[];
  retrogrados: string[];
  deudas: Deuda[];
  lecciones: number[];
  caminoDeVida: number;
  cartas: CartaVidas[];
}

const separacion = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360 + 360) % 360);
  return d > 180 ? 360 - d : d;
};

function sacarCartas(): CartaVidas[] {
  const elegidas = new Set<number>();
  while (elegidas.size < 3) elegidas.add(randomInt(MAZO.length));
  return [...elegidas].map((i, n) => ({ id: MAZO[i].id, nombre: MAZO[i].nombre, invertida: randomInt(4) === 0, posicion: POSICIONES_VIDAS[n] }));
}

export function calcularVidasPasadas(datos: DatosNacimiento): ResultadoVidasPasadas {
  const carta = calcularCarta(datos);
  const conCasa = !datos.horaDesconocida;
  const punto = (longitud: number): PuntoKarmico => ({
    longitud,
    signo: signoPorLongitud(longitud).id,
    grado: formatoGrado(longitud),
    casa: conCasa ? casaDeLongitud(longitud, carta.casas.cuspides) : null,
  });
  const nodo = carta.planetas.find((p) => p.cuerpo === "nodo_norte")!;
  const sur = (nodo.longitud + 180) % 360;
  const reales = carta.planetas.filter((p) => p.cuerpo !== "nodo_norte");
  const saturno = reales.find((p) => p.cuerpo === "saturno")!;
  const pluton = reales.find((p) => p.cuerpo === "pluton")!;
  return {
    fechaUtc: carta.fechaUtc,
    nodoSur: punto(sur),
    nodoNorte: punto(nodo.longitud),
    saturno: { ...punto(saturno.longitud), retrogrado: saturno.retrogrado },
    pluton: { ...punto(pluton.longitud), retrogrado: pluton.retrogrado },
    junto_nodo_sur: reales.filter((p) => separacion(p.longitud, sur) <= 8).map((p) => p.cuerpo),
    casa12: conCasa ? reales.filter((p) => p.casa === 12).map((p) => p.cuerpo) : [],
    retrogrados: reales.filter((p) => p.retrogrado && !["sol", "luna"].includes(p.cuerpo)).map((p) => p.cuerpo),
    deudas: deudasKarmicas(datos.nombre, datos.fecha),
    lecciones: planoNombre(datos.nombre).lecciones,
    caminoDeVida: calcularPerfil(datos.nombre, new Date(`${datos.fecha}T12:00:00Z`)).caminoDeVida,
    cartas: sacarCartas(),
  };
}

const NOMBRE_SIGNO: Record<string, string> = {
  aries: "Aries", tauro: "Tauro", geminis: "Géminis", cancer: "Cáncer", leo: "Leo", virgo: "Virgo",
  libra: "Libra", escorpio: "Escorpio", sagitario: "Sagitario", capricornio: "Capricornio", acuario: "Acuario", piscis: "Piscis",
};

const nombreCuerpo = (c: string) => NOMBRES_CUERPO[c as keyof typeof NOMBRES_CUERPO] ?? c;
const describir = (p: PuntoKarmico) => `${NOMBRE_SIGNO[p.signo] ?? p.signo} ${p.grado}${p.casa ? `, casa ${p.casa}` : ""}`;

/** Resumen en texto para el modelo. */
export function resumenVidasPasadas(r: ResultadoVidasPasadas, d: DatosNacimiento) {
  return [
    `Persona: ${datoDeUsuario(d.nombre, 80)}. Nacimiento: ${d.fecha}${d.horaDesconocida ? " (sin hora: no hay casas)" : ` ${d.hora}`}, ${datoDeUsuario(d.lugar, 120)}.`,
    `Nodo Sur (lo que el alma trae de otras vidas): ${describir(r.nodoSur)}.`,
    `Nodo Norte (hacia dónde va en esta vida): ${describir(r.nodoNorte)}.`,
    `Saturno (el karma, la lección que se repite): ${describir(r.saturno)}${r.saturno.retrogrado ? ", retrógrado" : ""}.`,
    `Plutón (lo que muere y renace): ${describir(r.pluton)}${r.pluton.retrogrado ? ", retrógrado" : ""}.`,
    `Planetas junto al Nodo Sur: ${r.junto_nodo_sur.map(nombreCuerpo).join(", ") || "ninguno"}.`,
    d.horaDesconocida ? "" : `Planetas en la casa 12: ${r.casa12.map(nombreCuerpo).join(", ") || "ninguno"}.`,
    `Planetas retrógrados (asuntos que vuelven): ${r.retrogrados.map(nombreCuerpo).join(", ") || "ninguno"}.`,
    `Numerología kármica: camino de vida ${r.caminoDeVida}; deudas kármicas ${r.deudas.join(", ") || "ninguna"}; lecciones kármicas (números ausentes en el nombre) ${r.lecciones.join(", ") || "ninguna"}.`,
    `Cartas del tarot: ${r.cartas.map((c) => `${c.posicion}: ${c.nombre}${c.invertida ? " (invertida)" : ""}`).join("; ")}.`,
  ]
    .filter(Boolean)
    .join("\n");
}
