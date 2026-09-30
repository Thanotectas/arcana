import type { Idioma } from "../idiomas";
import { es, type Diccionario } from "./es";
import { en } from "./en";
import { pt } from "./pt";

export type { Diccionario };

const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en, pt };

export function diccionario(idioma: Idioma): Diccionario {
  return DICCIONARIOS[idioma] ?? es;
}
