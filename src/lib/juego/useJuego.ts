"use client";

import { useT } from "@/lib/i18n/cliente";
import { traducir } from "./textos";

/** Idioma de la página y traductor de los textos del juego (clave: el texto en español). */
export function useJ() {
  const { idioma } = useT();
  return { idioma, t: (es: string, vars?: Record<string, string | number>) => traducir(idioma, es, vars) };
}
