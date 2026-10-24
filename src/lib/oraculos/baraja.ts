import { datoDeUsuario } from "../seguridad";
import type { Texto, TiradaOraculo, PiezaSacada } from "./comun";

/**
 * Baraja española de 40 cartas (sin ochos ni nueves), como se tira en las
 * casas de Colombia, Venezuela, México y España: cuatro palos y tres figuras.
 */
export type Palo = "oros" | "copas" | "espadas" | "bastos";
export const PALOS: Palo[] = ["oros", "copas", "espadas", "bastos"];

export const NOMBRE_PALO: Record<Palo, Texto> = {
  oros: { es: "Oros", en: "Coins", pt: "Ouros" },
  copas: { es: "Copas", en: "Cups", pt: "Copas" },
  espadas: { es: "Espadas", en: "Swords", pt: "Espadas" },
  bastos: { es: "Bastos", en: "Clubs", pt: "Paus" },
};

export const TEMA_PALO: Record<Palo, string> = {
  oros: "dinero, trabajo, bienes y lo material",
  copas: "amor, emociones, familia y alegrías",
  espadas: "conflictos, decisiones, obstáculos y lo que duele",
  bastos: "acción, proyectos, viajes y energía para avanzar",
};

const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12] as const;
const FIGURA: Record<number, Texto> = {
  1: { es: "As", en: "Ace", pt: "Ás" },
  10: { es: "Sota", en: "Jack", pt: "Valete" },
  11: { es: "Caballo", en: "Knight", pt: "Cavalo" },
  12: { es: "Rey", en: "King", pt: "Rei" },
};

/** Sentido tradicional de cada carta (para el modelo), por palo y número. */
const SENTIDO: Record<Palo, Record<number, string>> = {
  oros: {
    1: "dinero que llega, buena noticia económica, éxito material",
    2: "intercambio, un ingreso pequeño, negociación o mensaje de dinero",
    3: "trabajo que da frutos, reconocimiento al esfuerzo, ascenso",
    4: "estabilidad y ahorro; también miedo a soltar o avaricia",
    5: "preocupación económica o gasto inesperado; pide orden y paciencia",
    6: "generosidad, ayuda que se da o se recibe, préstamo",
    7: "inversión a largo plazo, cosecha lenta que rinde",
    10: "joven o noticia de estudio o negocio, una propuesta concreta",
    11: "dinero en movimiento, viaje por trabajo, progreso lento y seguro",
    12: "hombre maduro con recursos o protector; solidez y autoridad material",
  },
  copas: {
    1: "amor nuevo o renovado, alegría en el hogar, inicio emocional",
    2: "pareja, unión, reconciliación",
    3: "celebración, reunión, buena noticia familiar",
    4: "hastío, insatisfacción, momento de mirar hacia dentro",
    5: "tristeza o pérdida, lo que se derramó; aún queda algo en pie",
    6: "recuerdos, el pasado que vuelve, la familia y la infancia",
    7: "ilusiones y muchas opciones; decidir con la cabeza",
    10: "mensaje amoroso, joven sensible, una invitación",
    11: "propuesta, enamorado que llega, visita grata",
    12: "hombre bondadoso y afectivo, consejero, alguien que cuida",
  },
  espadas: {
    1: "decisión firme, fuerza, victoria tras la lucha",
    2: "indecisión, bloqueo, tregua",
    3: "dolor o desengaño, ruptura, una verdad que corta",
    4: "descanso, pausa, recuperación",
    5: "discusión, orgullo herido, algo que se pierde por terquedad",
    6: "salida de los problemas, mudanza o viaje para alejarse",
    7: "engaño o alguien que actúa a escondidas; también estrategia",
    10: "chisme, vigilancia, noticia inesperada, joven conflictivo",
    11: "llegada rápida, impulsividad, un conflicto que irrumpe",
    12: "hombre de autoridad, rigor, alguien que impone reglas",
  },
  bastos: {
    1: "nuevo proyecto, energía creativa, oportunidad de trabajo",
    2: "planes, elegir entre dos caminos, socios",
    3: "expansión, negocios que avanzan, espera de resultados",
    4: "estabilidad, hogar, base firme, celebración",
    5: "competencia, rivalidades, esfuerzo disperso",
    6: "triunfo, reconocimiento, buena noticia",
    7: "defender lo propio, mantener la posición, resistencia",
    10: "noticia, joven entusiasta, mensaje de trabajo",
    11: "viaje, cambio de residencia, avance rápido",
    12: "hombre emprendedor, líder, figura de padre",
  },
};

export interface CartaEspanola {
  id: string; // "oros-1"
  palo: Palo;
  numero: number;
}

export const BARAJA: CartaEspanola[] = PALOS.flatMap((palo) => NUMEROS.map((numero) => ({ id: `${palo}-${numero}`, palo, numero })));

export function cartaEspanola(id: string) {
  return BARAJA.find((c) => c.id === id);
}

/** "As de oros", "Caballo de copas", "5 de espadas". */
export function nombreCartaEspanola(c: CartaEspanola, idioma: keyof Texto = "es") {
  const de = idioma === "en" ? "of" : "de";
  const figura = FIGURA[c.numero]?.[idioma] ?? String(c.numero);
  return `${figura} ${de} ${NOMBRE_PALO[c.palo][idioma].toLowerCase()}`;
}

export const TIRADAS_BARAJA: TiradaOraculo[] = [
  {
    id: "tres",
    nombre: { es: "Tres cartas", en: "Three cards", pt: "Três cartas" },
    descripcion: { es: "Pasado, presente y lo que viene.", en: "Past, present and what is coming.", pt: "Passado, presente e o que vem." },
    posiciones: [
      { nombre: { es: "Lo que pasó", en: "What happened", pt: "O que passou" }, sentido: "el pasado que explica la situación" },
      { nombre: { es: "Lo que pasa", en: "What is happening", pt: "O que acontece" }, sentido: "el presente" },
      { nombre: { es: "Lo que viene", en: "What is coming", pt: "O que vem" }, sentido: "lo que se avecina si nada cambia" },
    ],
  },
  {
    id: "cruz",
    nombre: { es: "La cruz", en: "The cross", pt: "A cruz" },
    descripcion: { es: "Cinco cartas: tu momento, lo que te ayuda, lo que te frena, el consejo y el desenlace.", en: "Five cards: your moment, what helps, what blocks, the advice and the outcome.", pt: "Cinco cartas: seu momento, o que ajuda, o que trava, o conselho e o desfecho." },
    posiciones: [
      { nombre: { es: "Tu momento", en: "Your moment", pt: "Seu momento" }, sentido: "la situación actual de la persona" },
      { nombre: { es: "Lo que te ayuda", en: "What helps", pt: "O que ajuda" }, sentido: "lo que favorece" },
      { nombre: { es: "Lo que te frena", en: "What blocks", pt: "O que trava" }, sentido: "el obstáculo" },
      { nombre: { es: "El consejo", en: "The advice", pt: "O conselho" }, sentido: "lo que conviene hacer" },
      { nombre: { es: "El desenlace", en: "The outcome", pt: "O desfecho" }, sentido: "cómo se resuelve" },
    ],
  },
];

/** Texto para el modelo con la tirada completa. */
export function resumenBaraja(tirada: TiradaOraculo, piezas: PiezaSacada[], pregunta: string) {
  const lineas = [`Tirada: ${tirada.nombre.es} (baraja española de 40 cartas).`];
  const p = datoDeUsuario(pregunta, 300);
  if (p) lineas.push(`Pregunta de la persona: ${p}`);
  for (const pieza of piezas) {
    const c = cartaEspanola(pieza.id);
    const pos = tirada.posiciones[pieza.posicion];
    if (!c || !pos) continue;
    lineas.push(`- ${pos.nombre.es} (${pos.sentido}): ${nombreCartaEspanola(c)}${pieza.invertida ? ", invertida" : ""}. Sentido tradicional: ${SENTIDO[c.palo][c.numero]}.`);
  }
  const palos = piezas.map((x) => cartaEspanola(x.id)?.palo).filter(Boolean) as Palo[];
  const dominante = PALOS.map((pl) => [pl, palos.filter((x) => x === pl).length] as const).sort((a, b) => b[1] - a[1])[0];
  if (dominante && dominante[1] > 1) lineas.push(`Palo que domina: ${dominante[0]} (${TEMA_PALO[dominante[0]]}).`);
  return lineas.join("\n");
}

export const TRADICION_BARAJA =
  "Cartomancia con baraja española (tradición popular de España y Latinoamérica). Los palos: oros = dinero y trabajo; copas = amor, emociones y familia; espadas = conflictos, decisiones y obstáculos; bastos = acción, proyectos y viajes. " +
  "Las figuras suelen ser personas: la sota, una persona joven o un mensaje; el caballo, alguien que llega o un movimiento; el rey, una persona madura o con autoridad. Muchas cartas de un mismo palo marcan el tema de la consulta; muchas figuras, que hay varias personas implicadas. " +
  "Invertida, una carta llega con retraso, a medias o pide revisar su lado difícil, sin volverse una desgracia. Lee como una cartomántica de barrio: cercana, directa, con refranes si vienen al caso, sin fatalismos.";
