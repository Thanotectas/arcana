import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { COOKIE_IDIOMA, esIdioma, idiomaDesdeAcceptLanguage, type Idioma } from "./idiomas";
import { diccionario, type Diccionario } from "./diccionarios";
import { CABECERA_IDIOMA } from "./rutas";

/** Idioma de la petición actual: el prefijo de la dirección (/fr/…), la cookie, o Accept-Language. */
export const getIdioma = cache(async (): Promise<Idioma> => {
  const h = await headers();
  const porDireccion = h.get(CABECERA_IDIOMA);
  if (esIdioma(porDireccion)) return porDireccion;
  const jar = await cookies();
  const guardado = jar.get(COOKIE_IDIOMA)?.value;
  if (esIdioma(guardado)) return guardado;
  return idiomaDesdeAcceptLanguage(h.get("accept-language"));
});

/** Diccionario de textos de la interfaz para la petición actual. */
export const getT = cache(async (): Promise<Diccionario> => diccionario(await getIdioma()));
