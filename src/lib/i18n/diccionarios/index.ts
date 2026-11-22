import type { Idioma } from "../idiomas";
import { es, type Diccionario } from "./es";
import { en } from "./en";
import { pt } from "./pt";
import { fr } from "./fr";
import { tr } from "./tr";
import { ar } from "./ar";
import { id } from "./id";
import { hi } from "./hi";

export type { Diccionario };

const DICCIONARIOS: Record<Idioma, Diccionario> = { es, en, pt, fr, tr, ar, id, hi };

export function diccionario(idioma: Idioma): Diccionario {
  return DICCIONARIOS[idioma] ?? es;
}
