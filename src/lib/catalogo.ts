import { COSTOS } from "./creditos";
import type { Diccionario } from "./i18n/diccionarios";
import type { Idioma } from "./i18n/idiomas";
import { TEXTOS_CATALOGO_NUEVO, type ClaveNueva } from "./catalogo-textos";

/**
 * Catálogo de productos agrupado para el menú, el cajón móvil y la página
 * Explorar. Los textos salen del diccionario; aquí solo va la estructura.
 */
export type GrupoCatalogo = "oraculos" | "cielo" | "pareja" | "profundo";
export const GRUPOS_CATALOGO: GrupoCatalogo[] = ["oraculos", "cielo", "pareja", "profundo"];

export type IconoCatalogo = "tarot" | "astral" | "hoy" | "horoscopo" | "luna" | "numerologia" | "quiromancia" | "iching" | "chino" | "suenos" | "chocolate" | "velas" | "aura" | "tabaco" | "compatibilidad" | "sinastria" | "cruce" | "rituales" | "piedras" | "revolucion" | "baraja" | "lenormand" | "runas" | "pendulo" | "cafe" | "huevo" | "maya" | "vidas" | "akashicos" | ClaveNueva;

export interface ItemCatalogo {
  clave: IconoCatalogo;
  href: string;
  grupo: GrupoCatalogo;
  /** Créditos de la lectura principal; 0 = gratis; null = sin costo fijo (horóscopo). */
  costo: number | null;
  /** Solo tiene sentido con sesión (se oculta a visitantes en el menú). */
  requiereCuenta?: boolean;
  /** Idiomas para los que es un producto propio de su cultura: allí va primero en su grupo. */
  destacadoEn?: Idioma[];
}

export const CATALOGO: ItemCatalogo[] = [
  { clave: "tarot", href: "/tarot", grupo: "oraculos", costo: COSTOS.tarot_tres },
  { clave: "iching", href: "/iching", grupo: "oraculos", costo: COSTOS.iching },
  { clave: "suenos", href: "/suenos", grupo: "oraculos", costo: COSTOS.suenos },
  { clave: "chocolate", href: "/chocolate", grupo: "oraculos", costo: COSTOS.chocolate },
  { clave: "velas", href: "/velas", grupo: "oraculos", costo: COSTOS.velas },
  { clave: "tabaco", href: "/tabaco", grupo: "oraculos", costo: COSTOS.tabaco },
  { clave: "cafe", href: "/cafe", grupo: "oraculos", costo: COSTOS.cafe },
  { clave: "huevo", href: "/huevo", grupo: "oraculos", costo: COSTOS.huevo },
  { clave: "baraja", href: "/baraja-espanola", grupo: "oraculos", costo: COSTOS.baraja_espanola },
  { clave: "lenormand", href: "/lenormand", grupo: "oraculos", costo: COSTOS.lenormand },
  { clave: "runas", href: "/runas", grupo: "oraculos", costo: COSTOS.runas },
  { clave: "pendulo", href: "/pendulo", grupo: "oraculos", costo: 0, requiereCuenta: true },
  { clave: "rituales", href: "/rituales", grupo: "oraculos", costo: 0 },
  { clave: "piedras", href: "/piedras", grupo: "oraculos", costo: 0 },
  { clave: "hoy", href: "/hoy", grupo: "cielo", costo: 0, requiereCuenta: true },
  { clave: "horoscopo", href: "/horoscopo", grupo: "cielo", costo: 0 },
  { clave: "luna", href: "/luna", grupo: "cielo", costo: 0 },
  { clave: "astral", href: "/carta-astral", grupo: "cielo", costo: COSTOS.carta_astral },
  { clave: "revolucion", href: "/revolucion-solar", grupo: "cielo", costo: COSTOS.revolucion_solar },
  { clave: "vidas", href: "/vidas-pasadas", grupo: "profundo", costo: COSTOS.vidas_pasadas },
  { clave: "akashicos", href: "/registros-akashicos", grupo: "profundo", costo: COSTOS.akashicos },
  { clave: "maya", href: "/calendario-maya", grupo: "cielo", costo: COSTOS.maya },
  { clave: "chino", href: "/calendario-chino", grupo: "cielo", costo: COSTOS.chino },
  { clave: "numerologia", href: "/numerologia", grupo: "cielo", costo: COSTOS.numerologia },
  { clave: "aura", href: "/aura", grupo: "profundo", costo: COSTOS.aura },
  { clave: "compatibilidad", href: "/compatibilidad", grupo: "pareja", costo: COSTOS.compatibilidad },
  { clave: "sinastria", href: "/sinastria", grupo: "pareja", costo: COSTOS.sinastria },
  { clave: "quiromancia", href: "/quiromancia", grupo: "profundo", costo: COSTOS.quiromancia },
  { clave: "cruce", href: "/cruce", grupo: "profundo", costo: COSTOS.cruce },
  // Mercados nuevos: productos de cada tradición y herramientas gratis.
  { clave: "siono", href: "/si-o-no", grupo: "oraculos", costo: 0, destacadoEn: ["fr", "en", "id", "tr"] },
  { clave: "marsella", href: "/tarot-marsella", grupo: "oraculos", costo: COSTOS.marsella, destacadoEn: ["fr"] },
  { clave: "iskambil", href: "/iskambil", grupo: "oraculos", costo: COSTOS.iskambil, destacadoEn: ["tr"] },
  { clave: "geomancia", href: "/geomancia", grupo: "oraculos", costo: COSTOS.geomancia, destacadoEn: ["ar", "fr"] },
  { clave: "angeles", href: "/numeros-angelicales", grupo: "oraculos", costo: 0, destacadoEn: ["en", "fr", "id", "pt"] },
  { clave: "kundli", href: "/kundli", grupo: "cielo", costo: COSTOS.kundli, destacadoEn: ["hi"] },
  { clave: "ascendente", href: "/calculadora-ascendente", grupo: "cielo", costo: 0, destacadoEn: ["hi", "tr", "en"] },
  { clave: "weton", href: "/weton", grupo: "cielo", costo: COSTOS.weton, destacadoEn: ["id"] },
  { clave: "abjad", href: "/abjad", grupo: "cielo", costo: COSTOS.abjad, destacadoEn: ["ar", "tr"] },
  { clave: "milan", href: "/kundli-milan", grupo: "pareja", costo: COSTOS.kundli_milan, destacadoEn: ["hi"] },
  { clave: "jodoh", href: "/weton-jodoh", grupo: "pareja", costo: COSTOS.weton_jodoh, destacadoEn: ["id"] },
  { clave: "nombres", href: "/compatibilidad-nombres", grupo: "pareja", costo: 0, destacadoEn: ["hi", "id", "ar", "tr"] },
];

/** Ítem con sus textos, listo para pasarlo a componentes de cliente. */
export interface ItemCatalogoTexto extends ItemCatalogo {
  nombre: string;
  descripcion: string;
  costoTexto: string;
}

export function catalogoConTextos(t: Diccionario, opciones: { conCuenta: boolean; idioma?: Idioma }): ItemCatalogoTexto[] {
  const modulos = t.portada.modulos as Record<string, { titulo: string; texto: string }>;
  const nuevos = TEXTOS_CATALOGO_NUEVO[opciones.idioma ?? "es"] as Record<string, { titulo: string; texto: string }>;
  const idioma = opciones.idioma;
  // Lo propio de cada cultura va primero en su grupo (kundli en hindi, weton en indonesio…); el resto, en su orden.
  const ordenados = idioma ? [...CATALOGO].sort((a, b) => Number(Boolean(b.destacadoEn?.includes(idioma))) - Number(Boolean(a.destacadoEn?.includes(idioma)))) : CATALOGO;
  return ordenados.filter((i) => opciones.conCuenta || !i.requiereCuenta).map((i) => {
    const m = i.clave === "hoy" ? t.crecimiento.moduloHoy : (modulos[i.clave] ?? nuevos[i.clave]);
    return {
      ...i,
      nombre: m?.titulo ?? i.clave,
      descripcion: m?.texto ?? "",
      costoTexto: i.costo === null || i.costo === 0 ? t.comun.gratis : `${i.costo} cr.`,
    };
  });
}
