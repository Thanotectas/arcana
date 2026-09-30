import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { COOKIE_IDIOMA, esIdioma, idiomaDesdeAcceptLanguage, type Idioma } from "./idiomas";
import { diccionario, type Diccionario } from "./diccionarios";

/** Idioma de la petición actual: cookie, o Accept-Language si no hay cookie. */
export const getIdioma = cache(async (): Promise<Idioma> => {
  const jar = await cookies();
  const guardado = jar.get(COOKIE_IDIOMA)?.value;
  if (esIdioma(guardado)) return guardado;
  const h = await headers();
  return idiomaDesdeAcceptLanguage(h.get("accept-language"));
});

/** Diccionario de textos de la interfaz para la petición actual. */
export const getT = cache(async (): Promise<Diccionario> => diccionario(await getIdioma()));
