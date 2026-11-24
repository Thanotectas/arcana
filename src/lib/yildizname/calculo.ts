import type { Idioma } from "@/lib/i18n/idiomas";
import { SIGNOS } from "@/lib/zodiaco";
import { calcularAbjad, type ResultadoAbjad } from "@/lib/abjad/calculo";

/*
 * Yıldızname (el «libro de las estrellas» otomano y turco). Módulo puro.
 *
 * Decisiones documentadas:
 * - Se sigue el método popular que se practica hoy en Turquía: el valor ebced del nombre de la persona más el del
 *   nombre de su madre, dividido entre 12; el resto indica el signo (burç). Los ebced se calculan con el módulo abjad
 *   (valores orientales, misma transcripción de letras latinas).
 * - Los signos se cuentan desde Koç (Aries, «Hamel» en los textos clásicos), como en el orden tradicional del zodiaco.
 * - Si la división es exacta (resto 0), corresponde el duodécimo signo, Balık (Piscis): es lo mismo que contar de 12 en 12.
 * - Planeta: el regente clásico de cada signo (los siete planetas de los yıldızname; sin Urano, Neptuno ni Plutón).
 * - Día: el día de la semana de ese planeta, como en la tradición de los siete días.
 */

export type Planeta = "sol" | "luna" | "mercurio" | "venus" | "marte" | "jupiter" | "saturno";
export type Dia = "domingo" | "lunes" | "martes" | "miercoles" | "jueves" | "viernes" | "sabado";

/** Regentes clásicos, en el orden de SIGNOS (de Aries a Piscis). */
const REGENTE: Record<string, Planeta> = {
  aries: "marte", tauro: "venus", geminis: "mercurio", cancer: "luna", leo: "sol", virgo: "mercurio",
  libra: "venus", escorpio: "marte", sagitario: "jupiter", capricornio: "saturno", acuario: "saturno", piscis: "jupiter",
};

export const DIA_PLANETA: Record<Planeta, Dia> = {
  sol: "domingo", luna: "lunes", marte: "martes", mercurio: "miercoles", jupiter: "jueves", venus: "viernes", saturno: "sabado",
};

export interface ResultadoYildizname {
  abjad: ResultadoAbjad;
  /** Nombre + nombre de la madre. */
  total: number;
  /** El total entre 12: cociente y resto (el resto 0 cuenta como 12). */
  cociente: number;
  resto: number;
  posicion: number;
  signo: string;
  elemento: string;
  planeta: Planeta;
  dia: Dia;
}

export function calcularYildizname(datos: { nombre: string; escritura?: string; madre: string; escrituraMadre?: string }, idioma: Idioma): ResultadoYildizname | null {
  const abjad = calcularAbjad(datos, idioma);
  if (!abjad.madre || !abjad.conMadre || abjad.persona.total <= 0) return null;
  const total = abjad.conMadre.total;
  const resto = total % 12;
  const posicion = resto === 0 ? 12 : resto;
  const signo = SIGNOS[posicion - 1];
  const planeta = REGENTE[signo.id];
  return { abjad, total, cociente: Math.floor(total / 12), resto, posicion, signo: signo.id, elemento: signo.elemento, planeta, dia: DIA_PLANETA[planeta] };
}
