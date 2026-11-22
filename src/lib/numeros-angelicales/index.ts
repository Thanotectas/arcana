import type { Idioma } from "@/lib/i18n/idiomas";
import type { ContenidoNumeros, NumeroAngelical } from "./tipos";

export { NUMEROS_ANGELICALES, esNumeroAngelical, type NumeroAngelical, type TextoNumero, type ContenidoNumeros } from "./tipos";

/** Cada idioma en su propio archivo: solo se carga el que se pide. */
const CARGADORES: Record<Idioma, () => Promise<ContenidoNumeros>> = {
  es: () => import("./contenido-es").then((m) => m.CONTENIDO),
  en: () => import("./contenido-en").then((m) => m.CONTENIDO),
  pt: () => import("./contenido-pt").then((m) => m.CONTENIDO),
  fr: () => import("./contenido-fr").then((m) => m.CONTENIDO),
  tr: () => import("./contenido-tr").then((m) => m.CONTENIDO),
  ar: () => import("./contenido-ar").then((m) => m.CONTENIDO),
  id: () => import("./contenido-id").then((m) => m.CONTENIDO),
  hi: () => import("./contenido-hi").then((m) => m.CONTENIDO),
};

export function contenidoNumeros(idioma: Idioma): Promise<ContenidoNumeros> {
  return CARGADORES[idioma]();
}

/** Números relacionados (por cifra, por espejo o por secuencia). Igual en todos los idiomas. */
export const RELACIONADOS: Record<NumeroAngelical, NumeroAngelical[]> = {
  "000": ["111", "0101", "1001", "999"],
  "111": ["1111", "000", "1010", "222"],
  "222": ["2222", "1212", "1122", "333"],
  "333": ["3333", "1313", "2323", "222"],
  "444": ["4444", "1414", "1144", "555"],
  "555": ["5555", "1515", "444", "666"],
  "666": ["999", "777", "555", "888"],
  "777": ["1111", "333", "999", "888"],
  "888": ["1144", "444", "999", "2020"],
  "999": ["000", "666", "1111", "777"],
  "0101": ["1010", "1001", "000", "111"],
  "1001": ["0101", "1010", "1221", "000"],
  "1010": ["0101", "2020", "111", "1001"],
  "1111": ["111", "1212", "2222", "777"],
  "1122": ["1212", "2222", "1221", "1144"],
  "1144": ["444", "1414", "1122", "888"],
  "1212": ["1221", "2121", "1111", "222"],
  "1221": ["1212", "2121", "1001", "222"],
  "1234": ["1111", "555", "2323", "444"],
  "1313": ["333", "3333", "1212", "1414"],
  "1414": ["444", "1144", "1313", "1515"],
  "1515": ["555", "5555", "1414", "1234"],
  "2020": ["1010", "2222", "222", "2121"],
  "2121": ["1212", "1221", "2222", "2323"],
  "2222": ["222", "1122", "1111", "2020"],
  "2323": ["333", "2121", "1313", "1234"],
  "3333": ["333", "1313", "2323", "777"],
  "4444": ["444", "1144", "1414", "888"],
  "5555": ["555", "1515", "1234", "999"],
  "911": ["999", "111", "1111", "666"],
};

export { normalizarNumero, reducir } from "./cifras";
