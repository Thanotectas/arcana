import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Baraja francesa de 52 cartas (iskambil) para el iskambil falı turco, sin comodines.
 *
 * Tradición usada (núcleo común del iskambil falı tal como se practica en casas y en los libros populares de fal de
 * Turquía; los sentidos varían entre familias y regiones, así que esta tabla es una elección documentada):
 *  - Palos: kupa (corazones) = amor, sentimientos, hogar; karo (diamantes) = dinero, noticias, papeles, caminos cortos;
 *    sinek (tréboles) = trabajo, esfuerzo, amistades útiles; maça (picas) = obstáculos y advertencias (se leen como
 *    avisos para actuar con calma, nunca como desgracias).
 *  - Figuras: papaz (rey) = un hombre maduro o una autoridad; kız (reina) = una mujer; vale/bacak (jota) = una persona
 *    joven, un mensajero o un pensamiento. Kupa y karo suelen describir a personas de tez o cabello claros; sinek y maça,
 *    morenas (solo como pista suave, nunca como juicio).
 *  - Números: as = el corazón del asunto, un comienzo o una noticia importante; 10 = algo grande o cumplido;
 *    9 = deseo (el 9 de kupa es la «dilek kartı», la carta del deseo); 8 = movimiento, visita o invitación;
 *    7 = espera, pequeña noticia; 6 = camino corto, lo que viene del pasado; 5 = cambio; 4 = estabilidad, casa;
 *    3 = reunión, papeles; 2 = encuentro, pareja o elección.
 *  - Lectura de conjunto: el palo que domina da el tono; dos o más cartas del mismo valor refuerzan su tema.
 * Módulo puro: sirve en el servidor y en el cliente.
 */
export type Palo = "kupa" | "karo" | "sinek" | "maca";
export type Rango = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export const PALOS: readonly Palo[] = ["kupa", "karo", "sinek", "maca"];
export const RANGOS: readonly Rango[] = ["A", "K", "Q", "J", "10", "9", "8", "7", "6", "5", "4", "3", "2"];

export interface DatosPalo {
  rojo: boolean;
  /** Nombre del palo en cada idioma (para nombrar las cartas). */
  nombre: Record<Idioma, string>;
  /** Tema tradicional (va al modelo, en español). */
  tema: string;
}

export const DATOS_PALO: Record<Palo, DatosPalo> = {
  kupa: {
    rojo: true,
    nombre: { tr: "Kupa", es: "corazones", en: "Hearts", pt: "Copas", fr: "cœur", ar: "الكُبّة", id: "hati", hi: "पान" },
    tema: "kupa (corazones): amor, sentimientos, hogar y alegría",
  },
  karo: {
    rojo: true,
    nombre: { tr: "Karo", es: "diamantes", en: "Diamonds", pt: "Ouros", fr: "carreau", ar: "الديناري", id: "wajik", hi: "ईंट" },
    tema: "karo (diamantes): dinero, noticias, papeles y caminos cortos",
  },
  sinek: {
    rojo: false,
    nombre: { tr: "Sinek", es: "tréboles", en: "Clubs", pt: "Paus", fr: "trèfle", ar: "السباتي", id: "keriting", hi: "चिड़ी" },
    tema: "sinek (tréboles): trabajo, esfuerzo y amistades que ayudan",
  },
  maca: {
    rojo: false,
    nombre: { tr: "Maça", es: "picas", en: "Spades", pt: "Espadas", fr: "pique", ar: "البستوني", id: "sekop", hi: "हुकुम" },
    tema: "maça (picas): obstáculos y advertencias, para avanzar con calma y cuidado",
  },
};

/** Sentido de cada carta en el iskambil falı (va al modelo, en español). */
const SENTIDOS: Record<Palo, Record<Rango, string>> = {
  kupa: {
    A: "El hogar y la familia; un asunto del corazón que se pone en el centro; una alegría que llega a casa.",
    K: "Un hombre de buen corazón; para una mujer que consulta, el ser querido o la pareja.",
    Q: "Una mujer cariñosa y de buen corazón; para un hombre que consulta, la persona amada.",
    J: "Una persona joven y afectuosa, o lo que pasa por el corazón (kalbinden geçen).",
    "10": "Una gran alegría, felicidad compartida, una celebración.",
    "9": "La carta del deseo (dilek kartı): el deseo del corazón tiene buen camino.",
    "8": "Una invitación, una reunión, muestras de cariño.",
    "7": "Sueños y expectativas; una pequeña sorpresa agradable.",
    "6": "Algo o alguien querido del pasado que vuelve; nostalgia dulce.",
    "5": "Una pequeña ola emocional, un malentendido sin importancia que se aclara.",
    "4": "Paz en casa, estabilidad afectiva.",
    "3": "Celebración con amigos, buena compañía.",
    "2": "Dos corazones: un encuentro, un acuerdo, un acercamiento.",
  },
  karo: {
    A: "Una noticia importante, una carta o un documento; un asunto de dinero que se mueve.",
    K: "Un hombre con medios o de negocios; alguien que puede abrir una puerta práctica.",
    Q: "Una mujer sociable y resuelta; alguien que trae noticias.",
    J: "Un mensajero, una persona joven que trae novedades; una noticia en camino.",
    "10": "Una oportunidad material importante (kısmet), sin garantía de cifras.",
    "9": "Una nueva oportunidad de trabajo o de ingresos que conviene estudiar.",
    "8": "Un camino corto, un viaje o un movimiento de dinero.",
    "7": "Un pequeño regalo, un ingreso modesto o una buena noticia menor.",
    "6": "Idas y venidas, un trayecto cercano.",
    "5": "Comunicación, colaboración, mensajes que se cruzan.",
    "4": "Ahorro, base material firme.",
    "3": "Papeles, trámites, asuntos oficiales.",
    "2": "Un acuerdo entre dos personas; una noticia que llega.",
  },
  sinek: {
    A: "Trabajo, logro, una oportunidad de carrera; el esfuerzo que da frutos.",
    K: "Un hombre fiable y servicial; un apoyo en el trabajo.",
    Q: "Una mujer trabajadora y fuerte; una aliada.",
    J: "Una persona joven y trabajadora, un amigo leal.",
    "10": "El fruto de un gran esfuerzo; un viaje o cambio por trabajo.",
    "9": "Una nueva responsabilidad, un paso adelante.",
    "8": "Una entrevista, una reunión de trabajo, un período de mucho movimiento.",
    "7": "Un pequeño éxito que pide constancia y paciencia.",
    "6": "Ayuda y apoyo en el trabajo.",
    "5": "Nuevas amistades o una asociación.",
    "4": "Estabilidad, aunque el avance sea lento.",
    "3": "Una segunda oportunidad, una conversación que se repite.",
    "2": "Colaboración; un pequeño freno que se supera trabajando en equipo.",
  },
  maca: {
    A: "Un momento importante, una decisión seria o una noticia de peso; pide calma y reflexión, no es una desgracia.",
    K: "Una figura de autoridad o una persona oficial (un jefe, un abogado, un funcionario); trato formal.",
    Q: "Una mujer reservada o exigente; conviene la prudencia y la claridad con ella.",
    J: "Alguien que habla de más o actúa con prisa; cuidar la comunicación.",
    "10": "Cansancio, el cierre de una etapa; necesidad de descanso.",
    "9": "Preocupación e insomnio: invita a descansar y a no adelantarse a los hechos.",
    "8": "Un obstáculo o un retraso; hay que rodear y no forzar.",
    "7": "Una pequeña discusión; paciencia y buenas palabras.",
    "6": "Un camino que va alejando los problemas; mejora lenta pero segura.",
    "5": "Una decepción que pasa; soltar lo que no funcionó.",
    "4": "Descanso, recuperación, una pausa necesaria.",
    "3": "Una herida o distancia afectiva que se arregla hablando.",
    "2": "Una decisión entre dos caminos; elegir con calma.",
  },
};

export interface CartaIskambil {
  id: string;
  palo: Palo;
  rango: Rango;
  sentido: string;
}

export const MAZO_ISKAMBIL: readonly CartaIskambil[] = PALOS.flatMap((palo) =>
  RANGOS.map((rango) => ({ id: `${palo}-${rango.toLowerCase()}`, palo, rango, sentido: SENTIDOS[palo][rango] })),
);

const POR_ID = new Map(MAZO_ISKAMBIL.map((c) => [c.id, c]));

export function cartaIskambil(id: unknown): CartaIskambil | undefined {
  return typeof id === "string" ? POR_ID.get(id) : undefined;
}

/** Nombre del valor en cada idioma: as y figuras con palabra; los números, con cifra (salvo en hindi). */
const FIGURAS: Record<Idioma, Record<"A" | "K" | "Q" | "J", string>> = {
  tr: { A: "As", K: "Papaz", Q: "Kız", J: "Vale" },
  es: { A: "As", K: "Rey", Q: "Reina", J: "Jota" },
  en: { A: "Ace", K: "King", Q: "Queen", J: "Jack" },
  pt: { A: "Ás", K: "Rei", Q: "Dama", J: "Valete" },
  fr: { A: "As", K: "Roi", Q: "Dame", J: "Valet" },
  ar: { A: "آس", K: "شايب", Q: "بنت", J: "ولد" },
  id: { A: "As", K: "King", Q: "Queen", J: "Jack" },
  hi: { A: "इक्का", K: "बादशाह", Q: "बेगम", J: "गुलाम" },
};

const NUMEROS_HINDI: Record<string, string> = { "10": "दहला", "9": "नहला", "8": "अट्ठा", "7": "सत्ता", "6": "छक्का", "5": "पंजा", "4": "चौका", "3": "तिक्की", "2": "दुक्की" };
/** Sufijo turco del genitivo (posesivo) de cada valor: «Kupa Ası», «Maça Papazı», «Karo Kızı», «Sinek Valesi». */
const POSESIVO_TR: Record<"A" | "K" | "Q" | "J", string> = { A: "Ası", K: "Papazı", Q: "Kızı", J: "Valesi" };

/** Nombre de la carta en el idioma pedido: «Kupa Ası», «Ace of Hearts», «Dame de trèfle», «पान का इक्का»… */
export function nombreCartaIskambil(id: unknown, idioma: Idioma): string {
  const c = cartaIskambil(id);
  if (!c) return String(id ?? "");
  const palo = DATOS_PALO[c.palo].nombre[idioma];
  const figura = c.rango === "A" || c.rango === "K" || c.rango === "Q" || c.rango === "J" ? c.rango : null;
  switch (idioma) {
    case "tr":
      return figura ? `${palo} ${POSESIVO_TR[figura]}` : `${palo} ${c.rango}`;
    case "en":
      return `${figura ? FIGURAS.en[figura] : c.rango} of ${palo}`;
    case "es":
    case "pt":
    case "fr":
      return `${figura ? FIGURAS[idioma][figura] : c.rango} de ${palo}`;
    case "ar":
      return `${figura ? FIGURAS.ar[figura] : c.rango} ${palo}`;
    case "id":
      return `${figura ? FIGURAS.id[figura] : c.rango} ${palo}`;
    case "hi": {
      const valor = figura ? FIGURAS.hi[figura] : NUMEROS_HINDI[c.rango];
      return `${palo} ${figura === "Q" ? "की" : "का"} ${valor}`;
    }
  }
}
