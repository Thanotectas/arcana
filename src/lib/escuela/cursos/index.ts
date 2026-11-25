import type { Curso } from "../tipos";
import { CURSO_RITUALES } from "./rituales";

/** Todos los cursos de la Escuela de Sibila. */
export const CURSOS_ESCUELA: Curso[] = [CURSO_RITUALES];

export function cursoPorSlug(slug: string) {
  return CURSOS_ESCUELA.find((c) => c.slug === slug) ?? null;
}
