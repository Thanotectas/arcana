/** Idiomas en los que sale la aplicación. El primero es el predeterminado. */
export const IDIOMAS = ["es", "en", "pt"] as const;
export type Idioma = (typeof IDIOMAS)[number];

export const IDIOMA_PREDETERMINADO: Idioma = "es";
export const COOKIE_IDIOMA = "idioma";

export const NOMBRES_IDIOMA: Record<Idioma, string> = {
  es: "Español",
  en: "English",
  pt: "Português",
};

/** Nombre del idioma tal como se le indica al modelo de IA. */
export const IDIOMA_PARA_IA: Record<Idioma, string> = {
  es: "español neutro latinoamericano",
  en: "English",
  pt: "português do Brasil",
};

/** Código regional para fechas y monedas. */
export const LOCALE_INTL: Record<Idioma, string> = {
  es: "es-CO",
  en: "en-US",
  pt: "pt-BR",
};

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === "string" && (IDIOMAS as readonly string[]).includes(valor);
}

/** Elige el idioma a partir de la cabecera Accept-Language. */
export function idiomaDesdeAcceptLanguage(cabecera: string | null | undefined): Idioma {
  if (!cabecera) return IDIOMA_PREDETERMINADO;
  const candidatos = cabecera
    .split(",")
    .map((parte) => parte.trim().split(";")[0].toLowerCase().slice(0, 2));
  for (const c of candidatos) {
    if (esIdioma(c)) return c;
  }
  return IDIOMA_PREDETERMINADO;
}
