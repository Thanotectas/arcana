/**
 * Test público «¿Eres alma vieja?»: 7 preguntas que suman de 0 a 3 puntos
 * cada una; el total (0 a 21) da uno de cinco niveles. Creencia espiritual,
 * para reflexionar y compartir.
 */

export interface PreguntaAlma {
  texto: string;
  opciones: { texto: string; puntos: 0 | 1 | 2 | 3 }[];
}

export const PREGUNTAS_ALMA: PreguntaAlma[] = [
  {
    texto: "De niña o niño, la gente te decía…",
    opciones: [
      { texto: "Que eras muy inquieta y juguetona", puntos: 0 },
      { texto: "Nada especial, era como los demás", puntos: 1 },
      { texto: "Que eras muy seria para tu edad", puntos: 2 },
      { texto: "«Esta niña ya vino sabiendo»", puntos: 3 },
    ],
  },
  {
    texto: "Un viernes por la noche prefieres…",
    opciones: [
      { texto: "Fiesta, música y mucha gente", puntos: 0 },
      { texto: "Salir con un grupo pequeño", puntos: 1 },
      { texto: "Una conversación profunda con una sola persona", puntos: 2 },
      { texto: "Estar sola, con velas, un libro o mis pensamientos", puntos: 3 },
    ],
  },
  {
    texto: "¿Has sentido nostalgia de una época o un lugar que nunca viviste?",
    opciones: [
      { texto: "Nunca", puntos: 0 },
      { texto: "Alguna vez, con una película o una canción", puntos: 1 },
      { texto: "Sí, hay épocas o países que siento míos", puntos: 2 },
      { texto: "Muchas veces, como si recordara", puntos: 3 },
    ],
  },
  {
    texto: "Cuando alguien te hace daño…",
    opciones: [
      { texto: "Me enojo y me cuesta mucho soltarlo", puntos: 0 },
      { texto: "Me alejo y sigo con mi vida", puntos: 1 },
      { texto: "Me duele, pero intento entender por qué lo hizo", puntos: 2 },
      { texto: "Lo veo como una lección que mi alma necesitaba", puntos: 3 },
    ],
  },
  {
    texto: "¿La gente te busca para pedirte consejo?",
    opciones: [
      { texto: "Casi nunca", puntos: 0 },
      { texto: "A veces, mis amigos más cercanos", puntos: 1 },
      { texto: "Bastante, hasta gente mayor que yo", puntos: 2 },
      { texto: "Siempre: hasta desconocidos me cuentan su vida", puntos: 3 },
    ],
  },
  {
    texto: "¿Qué tan seguido «sabes» algo antes de que pase?",
    opciones: [
      { texto: "No me pasa", puntos: 0 },
      { texto: "Alguna corazonada de vez en cuando", puntos: 1 },
      { texto: "Seguido: mi intuición casi nunca falla", puntos: 2 },
      { texto: "Todo el tiempo, y también lo sueño", puntos: 3 },
    ],
  },
  {
    texto: "¿Qué es lo que más buscas en la vida?",
    opciones: [
      { texto: "Divertirme y vivir experiencias nuevas", puntos: 0 },
      { texto: "Éxito, estabilidad y reconocimiento", puntos: 1 },
      { texto: "Amor verdadero y paz", puntos: 2 },
      { texto: "Entender para qué vine a este mundo", puntos: 3 },
    ],
  },
];

export const NIVELES_ALMA = ["nueva", "joven", "madura", "vieja", "ancestral"] as const;
export type NivelAlma = (typeof NIVELES_ALMA)[number];

export function nivelDelTest(respuestas: number[]): NivelAlma {
  const total = respuestas.reduce((s, r, i) => s + (PREGUNTAS_ALMA[i]?.opciones[r]?.puntos ?? 0), 0);
  if (total <= 5) return "nueva";
  if (total <= 9) return "joven";
  if (total <= 13) return "madura";
  if (total <= 17) return "vieja";
  return "ancestral";
}

export interface ResultadoAlma {
  nombre: string;
  estrellas: number;
  esencia: string;
  descripcion: string;
  don: string;
  reto: string;
}

export const RESULTADOS_ALMA: Record<NivelAlma, ResultadoAlma> = {
  nueva: {
    nombre: "Alma nueva",
    estrellas: 1,
    esencia: "Llegaste con los ojos abiertos de asombro: todo es nuevo para ti.",
    descripcion: "Tu alma vive con curiosidad y ganas de probarlo todo. No cargas tanto pasado: por eso tienes una alegría y una ligereza que otros envidian. Cada experiencia es un primer capítulo.",
    don: "El asombro y la valentía de empezar.",
    reto: "Aprender de cada caída sin perder la alegría.",
  },
  joven: {
    nombre: "Alma joven",
    estrellas: 2,
    esencia: "Tu alma vino a conquistar, a construir y a brillar.",
    descripcion: "Tienes energía, ambición y ganas de dejar huella. Te mueven las metas, los logros y la gente. Ya traes algo de experiencia, pero esta vida es para expandirte y descubrir de qué eres capaz.",
    don: "La fuerza para lograr lo que te propones.",
    reto: "Que el éxito no te aleje de lo que sientes.",
  },
  madura: {
    nombre: "Alma madura",
    estrellas: 3,
    esencia: "Tu alma ya vivió lo suficiente para mirar hacia adentro.",
    descripcion: "Sientes profundo, te importan las relaciones verdaderas y empiezas a preguntarte por el sentido de todo. Has pasado por mucho, y eso te dio empatía. Estás en la etapa de sanar y comprender.",
    don: "La empatía: entiendes lo que el otro siente.",
    reto: "No cargar con los problemas de todos.",
  },
  vieja: {
    nombre: "Alma vieja",
    estrellas: 4,
    esencia: "Ya estuviste aquí muchas veces, y tu alma lo recuerda.",
    descripcion: "Eres sabia sin haberlo buscado, necesitas tu soledad, te atraen lo antiguo y lo espiritual, y la gente te busca para pedirte consejo. Muchas veces te sientes un poco extranjera en este mundo: es la memoria de otras vidas.",
    don: "Una sabiduría que nadie te enseñó.",
    reto: "Permitirte disfrutar, reír y vivir lo simple.",
  },
  ancestral: {
    nombre: "Alma ancestral",
    estrellas: 5,
    esencia: "Tu alma es de las más antiguas: viniste a guiar y a sanar.",
    descripcion: "Tu intuición es casi un don, sueñas con escenas de otras épocas y sientes que tu misión va más allá de ti. Las personas se sienten en paz a tu lado. Has vivido tantas vidas que en esta te toca enseñar lo que aprendiste.",
    don: "Sanar y guiar a otros con tu sola presencia.",
    reto: "Cuidar tu energía y poner límites.",
  },
};
