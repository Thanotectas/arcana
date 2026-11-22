import type { MetadataRoute } from "next";
import { MAZO } from "@/lib/tarot/deck";
import { SIGNOS } from "@/lib/zodiaco";
import { RESULTADOS } from "@/lib/seo/test-carta";
import { NIVELES_ALMA } from "@/lib/seo/test-alma";
import { slugPareja, todasLasParejas } from "@/lib/seo/compatibilidad";
import { IDIOMAS_CON_PREFIJO, alternativas, rutaIdioma } from "@/lib/i18n/rutas";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");

/** Mapa del sitio para Google: solo páginas públicas que se pueden leer sin cuenta. */
/** Páginas cuyo contenido completo está en todos los idiomas: van también con su dirección por idioma (/fr/…). */
const TRADUCIDAS = ["/", "/explorar", "/horoscopo", ...SIGNOS.map((s) => `/horoscopo/${s.id}`), "/luna", "/piedras", "/rituales", "/velas", "/si-o-no", "/calculadora-ascendente", "/compatibilidad-nombres", "/numeros-angelicales", ..."000 111 222 333 444 555 666 777 888 999 0101 1001 1010 1111 1122 1144 1212 1221 1234 1313 1414 1515 2020 2121 2222 2323 3333 4444 5555 911".split(" ").map((n) => `/numeros-angelicales/${n}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (ruta: string, prioridad: number, frecuencia: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: BASE + ruta,
    changeFrequency: frecuencia,
    priority: prioridad,
    ...(TRADUCIDAS.includes(ruta) ? { alternates: { languages: Object.fromEntries(Object.entries(alternativas(ruta, "es").languages).map(([i, r]) => [i, BASE + r])) } } : {}),
  });
  // Cada página traducida también en su dirección por idioma (con las mismas alternativas).
  const porIdioma = IDIOMAS_CON_PREFIJO.flatMap((i) =>
    TRADUCIDAS.map((ruta) => ({ ...url(ruta, ruta === "/" ? 0.9 : 0.6, ruta.startsWith("/horoscopo") ? "daily" : "weekly"), url: BASE + rutaIdioma(ruta, i) })),
  );
  return [
    ...porIdioma,
    url("/", 1, "daily"),
    url("/explorar", 0.8, "weekly"),
    url("/horoscopo", 0.9, "daily"),
    ...SIGNOS.map((s) => url(`/horoscopo/${s.id}`, 0.8, "daily")),
    url("/luna", 0.8, "weekly"),
    url("/juego", 0.9, "daily"),
    url("/si-o-no", 0.8, "weekly"),
    url("/calculadora-ascendente", 0.8),
    url("/compatibilidad-nombres", 0.7),
    url("/numeros-angelicales", 0.8),
    ...["000", "111", "222", "333", "444", "555", "666", "777", "888", "999", "1010", "1111", "1212", "1221", "1234", "1313", "1414", "1515", "2020", "2121", "2222", "0101", "1001", "1122", "1144", "2323", "3333", "4444", "5555", "911"].map((n) => url(`/numeros-angelicales/${n}`, 0.6)),
    url("/que-carta-eres", 0.9, "weekly"),
    ...Object.keys(RESULTADOS).map((c) => url(`/que-carta-eres/${c}`, 0.4)),
    url("/matriz-del-destino", 0.8),
    url("/significado-tarot", 0.9),
    ...MAZO.map((c) => url(`/significado-tarot/${c.id}`, 0.7)),
    url("/signos-zodiacales", 0.9),
    ...SIGNOS.map((s) => url(`/signos-zodiacales/${s.id}`, 0.8)),
    url("/compatibilidad-signos", 0.9),
    ...todasLasParejas().map(([a, b]) => url(`/compatibilidad-signos/${slugPareja(a, b)}`, 0.6)),
    url("/reencarnacion", 0.8),
    url("/que-son-registros-akashicos", 0.8),
    url("/alma-vieja", 0.9, "weekly"),
    ...NIVELES_ALMA.map((n) => url(`/alma-vieja/${n}`, 0.4)),
    url("/piedras", 0.6),
    url("/rituales", 0.6),
    url("/velas", 0.5),
    url("/baraja-espanola", 0.6),
    url("/lenormand", 0.6),
    url("/runas", 0.6),
    url("/cafe", 0.6),
    url("/huevo", 0.6),
    url("/vivo", 0.5, "weekly"),
    url("/registro", 0.4),
  ];
}
