import { posiciones } from "./efemerides";
import { compatibilidadSignos, signoPorId, signoPorLongitud } from "../zodiaco";

/**
 * Compatibilidad con más que el signo solar: con la fecha de nacimiento (sin hora) se calculan Sol, Luna, Mercurio,
 * Venus y Marte al mediodía. La Luna avanza unos 13° al día, así que si cae cerca del borde de un signo se marca
 * como dudosa (puede ser el vecino). Sin hora no hay ascendente ni casas: eso queda para la sinastría.
 */
export interface PlanetasPersona {
  sol: string;
  luna: string;
  mercurio: string;
  venus: string;
  marte: string;
  lunaDudosa: boolean;
}

export type ClaveDimension = "esencia" | "emociones" | "atraccion" | "comunicacion";

export interface DimensionCompatibilidad {
  clave: ClaveDimension;
  puntaje: number;
  /** Signos que se comparan: [de A, de B] (en la atracción, Venus de A con Marte de B). */
  signos: [string, string];
}

export const NOMBRE_DIMENSION: Record<ClaveDimension, { nombre: string; planetas: string }> = {
  esencia: { nombre: "Esencia", planetas: "Sol y Sol" },
  emociones: { nombre: "Emociones", planetas: "Luna y Luna" },
  atraccion: { nombre: "Atracción", planetas: "Venus y Marte" },
  comunicacion: { nombre: "Comunicación", planetas: "Mercurio y Mercurio" },
};

const PESOS: Record<ClaveDimension, number> = { esencia: 0.3, emociones: 0.3, atraccion: 0.25, comunicacion: 0.15 };

export function planetasPorFecha(fecha: string): PlanetasPersona | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return null;
  const instante = new Date(`${fecha}T12:00:00Z`);
  if (Number.isNaN(instante.getTime())) return null;
  const p = posiciones(instante);
  const lon = (c: string) => p.find((x) => x.cuerpo === c)?.longitud ?? 0;
  const luna = lon("luna");
  const enSigno = luna % 30;
  return {
    sol: signoPorLongitud(lon("sol")).id,
    luna: signoPorLongitud(luna).id,
    mercurio: signoPorLongitud(lon("mercurio")).id,
    venus: signoPorLongitud(lon("venus")).id,
    marte: signoPorLongitud(lon("marte")).id,
    lunaDudosa: enSigno < 6.6 || enSigno > 23.4,
  };
}

function afinidad(a: string, b: string) {
  const sa = signoPorId(a);
  const sb = signoPorId(b);
  return sa && sb ? compatibilidadSignos(sa, sb) : 50;
}

export function dimensionesCompatibilidad(a: PlanetasPersona, b: PlanetasPersona): { dimensiones: DimensionCompatibilidad[]; puntaje: number } {
  const atraccion = Math.round((afinidad(a.venus, b.marte) + afinidad(b.venus, a.marte)) / 2);
  const dimensiones: DimensionCompatibilidad[] = [
    { clave: "esencia", puntaje: afinidad(a.sol, b.sol), signos: [a.sol, b.sol] },
    { clave: "emociones", puntaje: afinidad(a.luna, b.luna), signos: [a.luna, b.luna] },
    { clave: "atraccion", puntaje: atraccion, signos: [a.venus, b.marte] },
    { clave: "comunicacion", puntaje: afinidad(a.mercurio, b.mercurio), signos: [a.mercurio, b.mercurio] },
  ];
  const puntaje = Math.round(dimensiones.reduce((s, d) => s + d.puntaje * PESOS[d.clave], 0));
  return { dimensiones, puntaje };
}

/** Los planetas de una persona, en palabras, para la instrucción de Sibila. */
export function describirPlanetas(nombre: string, p: PlanetasPersona) {
  const n = (id: string) => signoPorId(id)?.nombre ?? id;
  return `${nombre}: Sol en ${n(p.sol)}, Luna en ${n(p.luna)}${p.lunaDudosa ? " (aproximada: sin hora puede ser el signo vecino)" : ""}, Mercurio en ${n(p.mercurio)}, Venus en ${n(p.venus)}, Marte en ${n(p.marte)}`;
}
