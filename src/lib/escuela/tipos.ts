/**
 * La Escuela de Sibila: cursos de lecciones diarias. Cada lección se arma con bloques (video, texto, ritual guiado,
 * test y entrega) que se combinan libremente. El contenido vive en el código (src/lib/escuela/cursos); el avance de
 * cada persona, en escuela_inscripciones y escuela_progreso.
 */

export type PreguntaTest =
  | { tipo: "opcion"; p: string; opciones: string[]; correcta: number; porque: string }
  | { tipo: "abierta"; p: string; ayuda?: string };

/**
 * Un paso del ritual guiado. Puede ser un texto simple o llevar una acción: respirar (guía de respiración), encender
 * (tocar para encender la vela), escribir (lo que escribe queda en su grimorio) o esperar unos segundos.
 */
export type PasoRitual =
  | string
  | { texto: string; accion?: "respirar" | "encender" | "escribir" | "esperar"; segundos?: number; ayuda?: string };

export type Bloque =
  /** Video de Sibila; sin `src`, se muestra que se está grabando. */
  | { tipo: "video"; titulo: string; src?: string; poster?: string }
  | { tipo: "texto"; titulo?: string; parrafos: string[] }
  /** Ritual para hacer en casa, con materiales, pasos y (si aplica) la herramienta de Arcana que lo personaliza. */
  | { tipo: "ritual"; titulo: string; materiales: string[]; pasos: PasoRitual[]; cuidado?: string; herramienta?: { href: string; texto: string } }
  | { tipo: "test"; titulo?: string; preguntas: PreguntaTest[] }
  /** La foto del ritual, que Sibila lee en la lectura de Arcana correspondiente (incluida en el curso). */
  | { tipo: "entrega"; titulo: string; texto: string; href: string; boton: string; lectura: string };

export interface Leccion {
  numero: number;
  titulo: string;
  /** Lo que Sibila le dice a la persona al abrir la lección (con su nombre). */
  saludo: string;
  /** Fase de la Luna que acompaña la lección en el camino (solo simbólica). */
  luna: "🌑" | "🌒" | "🌓" | "🌔" | "🌕" | "🌖" | "🌗" | "🌘";
  resumen: string;
  minutos: number;
  bloques: Bloque[];
}

export interface Curso {
  slug: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  /** Lo que la persona se lleva, en frases cortas. */
  promesas: string[];
  portada: string;
  lecciones: Leccion[];
  /** Precio en créditos (se cobra al inscribirse). */
  costo: number;
  /** Precio para quien se anotó en la lista de espera con su correo (fundadores). */
  costoFundadores?: number;
  /** Créditos que se abonan al inscribirse para las lecturas de las entregas. */
  creditosIncluidos: number;
  /** Sin abrir, solo las cuentas administradoras lo ven y lo prueban (gratis). */
  abierto: boolean;
  /** Horas que deben pasar desde que se completa una lección para que se abra la siguiente. */
  horasEntreLecciones: number;
}

/** Texto de un paso, sea simple o con acción. */
export function textoPaso(p: PasoRitual) {
  return typeof p === "string" ? p : p.texto;
}
