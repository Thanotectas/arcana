/**
 * Direcciones por idioma para Google: el español va sin prefijo (/horoscopo) y cada otro idioma con el suyo
 * (/fr/horoscopo, /tr/horoscopo…). El proxy quita el prefijo, sirve la misma página y fija el idioma.
 */
import { IDIOMAS, esIdioma, type Idioma } from "./idiomas";

/** Cabecera interna con la que el proxy le dice a la página en qué idioma va (por el prefijo de la dirección). */
export const CABECERA_IDIOMA = "x-arcana-idioma";

/** Idiomas que llevan prefijo en la dirección (todos menos el español). */
export const IDIOMAS_CON_PREFIJO = IDIOMAS.filter((i) => i !== "es");

/** «/fr/horoscopo» → { idioma: "fr", ruta: "/horoscopo" }; sin prefijo → null. */
export function separarPrefijo(pathname: string): { idioma: Idioma; ruta: string } | null {
  const m = /^\/([a-z]{2})(?=\/|$)(.*)$/.exec(pathname);
  if (!m || !esIdioma(m[1]) || m[1] === "es") return null;
  return { idioma: m[1], ruta: m[2] || "/" };
}

/** La dirección de una página en un idioma: «/horoscopo» + fr → «/fr/horoscopo». */
export function rutaIdioma(ruta: string, idioma: Idioma) {
  if (idioma === "es") return ruta;
  return `/${idioma}${ruta === "/" ? "" : ruta}`;
}

/** Canónica de la página en el idioma actual y sus versiones en los demás (hreflang), para los metadatos. */
export function alternativas(ruta: string, idioma: Idioma) {
  const languages: Record<string, string> = {};
  for (const i of IDIOMAS) languages[i] = rutaIdioma(ruta, i);
  languages["x-default"] = ruta;
  return { canonical: rutaIdioma(ruta, idioma), languages };
}
