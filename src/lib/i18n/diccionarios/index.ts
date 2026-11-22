import type { Idioma } from "../idiomas";
import { es, type Diccionario } from "./es";
import { en } from "./en";
import { pt } from "./pt";
import { fr } from "./fr";
import { tr } from "./tr";

export type { Diccionario };

const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en, pt, fr, tr };

export function diccionario(idioma: Idioma): Diccionario {
  return DICCIONARIOS[idioma] ?? es;
}
