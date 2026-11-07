import type { MetadataRoute } from "next";
import { MAZO } from "@/lib/tarot/deck";
import { SIGNOS } from "@/lib/zodiaco";
import { RESULTADOS } from "@/lib/seo/test-carta";
import { NIVELES_ALMA } from "@/lib/seo/test-alma";
import { slugPareja, todasLasParejas } from "@/lib/seo/compatibilidad";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");

/** Mapa del sitio para Google: solo páginas públicas que se pueden leer sin cuenta. */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (ruta: string, prioridad: number, frecuencia: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: BASE + ruta,
    changeFrequency: frecuencia,
    priority: prioridad,
  });
  return [
    url("/", 1, "daily"),
    url("/explorar", 0.8, "weekly"),
    url("/horoscopo", 0.9, "daily"),
    ...SIGNOS.map((s) => url(`/horoscopo/${s.id}`, 0.8, "daily")),
    url("/luna", 0.8, "weekly"),
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
