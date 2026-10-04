import { datoDeUsuario } from "../seguridad";
import type { FaseClave } from "../astro/lunaciones";

/**
 * Rituales de velas: guía por intención (color, preparación, cuándo) y
 * lectura de los restos (ceromancia: cera, hollín, llama). Los textos
 * visibles están en el diccionario (t.velas); aquí va la estructura.
 */
export const INTENCIONES = ["amor", "dinero", "proteccion", "sanacion", "claridad", "cierre", "exito", "intuicion"] as const;
export type Intencion = (typeof INTENCIONES)[number];

export const COLORES = ["rojo", "rosa", "verde", "amarillo", "azul", "blanco", "morado", "naranja", "negro"] as const;
export type ColorVela = (typeof COLORES)[number];

/** Señales que la persona observó mientras ardía (se marcan antes de la foto). */
export const SENALES = ["llama_alta", "llama_inquieta", "llama_baja", "se_apago", "mucho_humo", "chisporroteo", "lagrimas", "cera_limpia", "rapida", "lenta"] as const;
export type Senal = (typeof SENALES)[number];

export interface FichaIntencion {
  color: ColorVela;
  /** Color alternativo cuando no se tiene el principal. */
  alterno: ColorVela;
  /** Fase lunar más favorable para encenderla. */
  fase: FaseClave;
  /** Día de la semana tradicional (0 domingo … 6 sábado). */
  dia: number;
}

export const FICHA_INTENCION: Record<Intencion, FichaIntencion> = {
  amor: { color: "rosa", alterno: "rojo", fase: "creciente", dia: 5 },
  dinero: { color: "verde", alterno: "amarillo", fase: "creciente", dia: 4 },
  proteccion: { color: "blanco", alterno: "azul", fase: "llena", dia: 6 },
  sanacion: { color: "azul", alterno: "blanco", fase: "menguante", dia: 1 },
  claridad: { color: "amarillo", alterno: "blanco", fase: "llena", dia: 3 },
  cierre: { color: "negro", alterno: "morado", fase: "menguante", dia: 6 },
  exito: { color: "naranja", alterno: "amarillo", fase: "nueva", dia: 0 },
  intuicion: { color: "morado", alterno: "azul", fase: "llena", dia: 1 },
};

/** Tono CSS de cada color para las muestras. */
export const TONO_COLOR: Record<ColorVela, string> = {
  rojo: "#c0392b",
  rosa: "#f4a3c0",
  verde: "#2e8b57",
  amarillo: "#f1c40f",
  azul: "#2f6fcf",
  blanco: "#f6f1e7",
  morado: "#7b4fb3",
  naranja: "#f08a24",
  negro: "#1b1b1f",
};

export function esIntencion(v: unknown): v is Intencion {
  return typeof v === "string" && (INTENCIONES as readonly string[]).includes(v);
}
export function esColor(v: unknown): v is ColorVela {
  return typeof v === "string" && (COLORES as readonly string[]).includes(v);
}
export function esSenal(v: unknown): v is Senal {
  return typeof v === "string" && (SENALES as readonly string[]).includes(v);
}

export interface EntradaVelas {
  foto: string; // ruta en el bucket 'palmas'
  intencion: Intencion;
  color: ColorVela;
  senales: Senal[];
  pregunta: string;
  idioma?: string;
}

const NOMBRE_INTENCION: Record<Intencion, string> = {
  amor: "amor y reconciliación",
  dinero: "dinero y prosperidad",
  proteccion: "protección y limpieza",
  sanacion: "sanación emocional y calma",
  claridad: "claridad y decisiones",
  cierre: "cerrar un ciclo y soltar",
  exito: "éxito y nuevos caminos",
  intuicion: "intuición y poder personal",
};
const NOMBRE_SENAL: Record<Senal, string> = {
  llama_alta: "llama alta y firme",
  llama_inquieta: "llama inquieta, que bailaba",
  llama_baja: "llama baja o débil",
  se_apago: "se apagó sola",
  mucho_humo: "mucho humo u hollín",
  chisporroteo: "chisporroteó o crepitó",
  lagrimas: "la cera corrió en lágrimas",
  cera_limpia: "la cera quedó limpia, casi sin restos",
  rapida: "se consumió rápido",
  lenta: "tardó mucho en consumirse",
};

/** Texto para el modelo con el contexto del ritual. */
export function resumenVelas(e: EntradaVelas) {
  const lineas = [
    `Intención del ritual: ${NOMBRE_INTENCION[e.intencion]}. Vela de color ${e.color}.`,
    e.senales.length ? `Lo que la persona observó mientras ardía: ${e.senales.map((s) => NOMBRE_SENAL[s]).join("; ")}.` : "La persona no anotó señales durante la quema.",
    "Foto adjunta: los restos de la vela (cabo, cera en el plato o vaso, hollín) una vez apagada.",
  ];
  const pregunta = datoDeUsuario(e.pregunta, 300);
  if (pregunta) lineas.push(`Lo que la persona quiere saber: ${pregunta}`);
  return lineas.join("\n");
}

export const TRADICION_VELAS =
  "Ceromancia (lectura de los restos de una vela ritual) según la tradición popular hispanoamericana y europea. " +
  "La llama durante la quema: alta y firme = la petición avanza con fuerza; inquieta o que baila = hay interferencias o emociones agitadas alrededor; baja = falta energía o convicción; se apaga sola = resistencia fuerte o no es el momento; mucho humo u hollín negro = hay que limpiar algo antes (una persona, un ambiente, un pensamiento); chisporroteo = alguien habla del tema, mensajes que llegan; lágrimas de cera = dolor que se libera o llanto pendiente; se consume rápido = respuesta rápida pero pasajera; lenta = proceso largo pero sólido. " +
  "Los restos: cera limpia y poca = ritual cumplido, camino despejado; cera abundante y oscura = obstáculos, trabajo pendiente; la forma de la cera se lee como figuras (corazón, llave, camino, montaña, animal, letra inicial, número); hollín en el vaso arriba = problema que viene de fuera, abajo = problema interno; la mecha doblada hacia un lado señala de dónde viene la influencia (derecha lo que llega, izquierda lo que se va); restos en el lado del plato más cercano a la persona hablan de ella, en el lado opuesto de los demás. " +
  "Describe primero con honestidad lo que sí se ve en la foto; si está borrosa o no se distingue nada, dilo y no inventes figuras. El color de la vela y la intención dan el contexto de toda la lectura. Tono cálido, práctico y esperanzador: ningún resultado es un mal augurio, es información para el siguiente paso. Nunca prometas resultados ni hables de daños a terceros; si la intención implica a otra persona, orienta hacia el bien de ambas.";
