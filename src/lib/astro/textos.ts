/**
 * Nombres, símbolos y significados astrológicos. Sin cálculos ni efemérides:
 * se puede usar en el navegador.
 */

export type Cuerpo =
  | "sol"
  | "luna"
  | "mercurio"
  | "venus"
  | "marte"
  | "jupiter"
  | "saturno"
  | "urano"
  | "neptuno"
  | "pluton"
  | "nodo_norte";

export type TipoAspecto = "conjuncion" | "oposicion" | "trigono" | "cuadratura" | "sextil";

export const NOMBRES_CUERPO: Record<Cuerpo, string> = {
  sol: "Sol",
  luna: "Luna",
  mercurio: "Mercurio",
  venus: "Venus",
  marte: "Marte",
  jupiter: "Júpiter",
  saturno: "Saturno",
  urano: "Urano",
  neptuno: "Neptuno",
  pluton: "Plutón",
  nodo_norte: "Nodo Norte",
};

export const SIMBOLOS_CUERPO: Record<Cuerpo, string> = {
  sol: "☉",
  luna: "☽",
  mercurio: "☿",
  venus: "♀",
  marte: "♂",
  jupiter: "♃",
  saturno: "♄",
  urano: "♅",
  neptuno: "♆",
  pluton: "♇",
  nodo_norte: "☊",
};

/** Qué representa cada cuerpo en una carta natal. */
export const SIGNIFICADO_CUERPO: Record<Cuerpo, string> = {
  sol: "Tu identidad central: lo que te da vitalidad y el propósito hacia el que creces.",
  luna: "Tu mundo emocional: lo que necesitas para sentirte a salvo y cómo reaccionas por instinto.",
  mercurio: "Tu mente: cómo piensas, aprendes, hablas y tomas decisiones.",
  venus: "Cómo amas y qué valoras: tu forma de atraer, disfrutar y relacionarte.",
  marte: "Tu energía y tu deseo: cómo actúas, compites y defiendes lo tuyo.",
  jupiter: "Dónde creces y tienes suerte: tu fe, tu generosidad y tus ganas de expandirte.",
  saturno: "Tus límites y tu maestría: donde la vida te pide disciplina y te hace madurar.",
  urano: "Tu parte rebelde: donde buscas libertad, cambio y originalidad.",
  neptuno: "Tu sensibilidad y tus sueños: intuición, inspiración y también confusión.",
  pluton: "Tu poder de transformación: lo que muere y renace en ti.",
  nodo_norte: "La dirección de crecimiento de tu vida: lo que viniste a aprender.",
};

/** Área de la vida de cada casa (1 a 12). */
export const SIGNIFICADO_CASA: string[] = [
  "Tu imagen, tu cuerpo y cómo inicias las cosas.",
  "Tu dinero, tus recursos y lo que valoras.",
  "Tu comunicación, tus hermanos y tu entorno cercano.",
  "Tu hogar, tu familia y tus raíces.",
  "Tu creatividad, el romance, el juego y los hijos.",
  "Tu trabajo diario, tus hábitos y tu salud.",
  "Tu pareja, tus socios y los vínculos de a dos.",
  "Las crisis, la intimidad y los recursos compartidos.",
  "Los viajes, los estudios y tu filosofía de vida.",
  "Tu vocación, tu reputación y tus metas públicas.",
  "Tus amistades, tus grupos y tus ideales.",
  "Tu mundo interior, lo oculto y la espiritualidad.",
];

export const NOMBRES_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "Conjunción",
  oposicion: "Oposición",
  trigono: "Trígono",
  cuadratura: "Cuadratura",
  sextil: "Sextil",
};

export const SIMBOLOS_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "☌",
  oposicion: "☍",
  trigono: "△",
  cuadratura: "□",
  sextil: "⚹",
};

/** Cómo se relacionan dos cuerpos según su aspecto. */
export const SIGNIFICADO_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "Se funden: sus energías actúan juntas, para bien o para mal, con mucha intensidad.",
  oposicion: "Se miran de frente: una tensión que pide equilibrio entre dos extremos.",
  trigono: "Fluyen con facilidad: un talento natural que conviene no dar por sentado.",
  cuadratura: "Se frotan: una fricción que incomoda y, a la vez, empuja a crecer.",
  sextil: "Se ayudan: una oportunidad que se activa cuando haces algo con ella.",
};
