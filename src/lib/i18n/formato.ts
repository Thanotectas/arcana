import { LOCALE_INTL, type Idioma } from "./idiomas";

/** Reemplaza {clave} en una plantilla. */
export function plantilla(texto: string, valores: Record<string, string | number>) {
  return texto.replace(/\{(\w+)\}/g, (_, k: string) => (k in valores ? String(valores[k]) : `{${k}}`));
}

export function fechaLarga(iso: string | Date, idioma: Idioma) {
  return new Date(iso).toLocaleDateString(LOCALE_INTL[idioma], { day: "numeric", month: "long", year: "numeric" });
}

export function fechaHora(iso: string | Date, idioma: Idioma) {
  return new Date(iso).toLocaleString(LOCALE_INTL[idioma], { dateStyle: "medium", timeStyle: "short" });
}
