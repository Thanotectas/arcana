import { posiciones, type Cuerpo } from "../astro/efemerides";
import { faseLunar, type FaseLunar } from "../luna";
import { SIGNOS, type Signo } from "../zodiaco";

/**
 * El cielo de un día visto desde un signo solar: en qué signo está cada
 * planeta y en qué casa solar cae (el signo de la persona es la casa 1), y si
 * su signo hace un aspecto de apoyo o de tensión con el de la persona. Es la
 * base del horóscopo de cada signo: la usan el gráfico y el texto.
 */

export const CUERPOS_HOROSCOPO = ["sol", "luna", "mercurio", "venus", "marte", "jupiter", "saturno"] as const satisfies readonly Cuerpo[];
export type CuerpoHoroscopo = (typeof CUERPOS_HOROSCOPO)[number];

export type Trato = "mismo" | "apoyo" | "tension" | "neutro";

export interface PlanetaDelDia {
  cuerpo: CuerpoHoroscopo;
  longitud: number;
  signo: string;
  /** Casa solar 1–12 contada desde el signo de la persona. */
  casa: number;
  trato: Trato;
  retrogrado: boolean;
}

export interface CieloDelSigno {
  signo: string;
  planetas: PlanetaDelDia[];
  fase: FaseLunar;
}

/** Mediodía de Bogotá del día dado (YYYY-MM-DD): el instante del horóscopo de ese día. */
export function instanteDelDia(fecha: string) {
  return new Date(`${fecha}T12:00:00-05:00`);
}

/** Aspecto entre signos según cuántos los separan: sextil y trígono apoyan, cuadratura y oposición tensan. */
function trato(distancia: number): Trato {
  const d = Math.min(distancia, 12 - distancia);
  if (d === 0) return "mismo";
  if (d === 2 || d === 4) return "apoyo";
  if (d === 3 || d === 6) return "tension";
  return "neutro";
}

export function cieloDelSigno(signo: Signo, instante: Date): CieloDelSigno {
  const indice = SIGNOS.findIndex((s) => s.id === signo.id);
  const planetas = posiciones(instante)
    .filter((p): p is typeof p & { cuerpo: CuerpoHoroscopo } => (CUERPOS_HOROSCOPO as readonly string[]).includes(p.cuerpo))
    .map((p) => {
      const i = Math.floor(p.longitud / 30) % 12;
      const distancia = (i - indice + 12) % 12;
      return { cuerpo: p.cuerpo, longitud: p.longitud, signo: SIGNOS[i].id, casa: distancia + 1, trato: trato(distancia), retrogrado: p.retrogrado };
    })
    .sort((a, b) => CUERPOS_HOROSCOPO.indexOf(a.cuerpo) - CUERPOS_HOROSCOPO.indexOf(b.cuerpo));
  return { signo: signo.id, planetas, fase: faseLunar(instante) };
}

const NOMBRE: Record<CuerpoHoroscopo, string> = { sol: "Sol", luna: "Luna", mercurio: "Mercurio", venus: "Venus", marte: "Marte", jupiter: "Júpiter", saturno: "Saturno" };
const TEMA_CASA = [
  "la persona y su imagen", "el dinero y los recursos", "las conversaciones y los trámites", "el hogar y la familia",
  "el amor y la creatividad", "el trabajo diario y la rutina", "la pareja y los socios", "la intimidad y los cambios",
  "los viajes y los estudios", "la carrera y las metas", "los amigos y los proyectos", "el descanso y la intuición",
];
const FASES = ["luna nueva", "creciente", "cuarto creciente", "gibosa creciente", "luna llena", "gibosa menguante", "cuarto menguante", "menguante"];

/** Resumen en texto plano para el modelo, con las mismas posiciones que muestra el gráfico. */
export function resumenCielo(c: CieloDelSigno) {
  const nombre = (id: string) => SIGNOS.find((s) => s.id === id)?.nombre ?? id;
  const lineas = c.planetas.map((p) => {
    const trato = p.trato === "apoyo" ? ", en buen aspecto con el signo" : p.trato === "tension" ? ", en aspecto tenso con el signo" : p.trato === "mismo" ? ", en el propio signo" : "";
    return `- ${NOMBRE[p.cuerpo]} en ${nombre(p.signo)}${p.retrogrado ? " (retrógrado)" : ""}: casa solar ${p.casa}, ${TEMA_CASA[p.casa - 1]}${trato}.`;
  });
  return [`Cielo real del día para ${nombre(c.signo)} (casas solares: el signo es la casa 1). Fase lunar: ${FASES[c.fase.indice]}.`, ...lineas].join("\n");
}
