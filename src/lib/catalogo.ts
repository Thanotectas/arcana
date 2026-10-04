import { COSTOS } from "./creditos";
import type { Diccionario } from "./i18n/diccionarios";

/**
 * Catálogo de productos agrupado para el menú, el cajón móvil y la página
 * Explorar. Los textos salen del diccionario; aquí solo va la estructura.
 */
export type GrupoCatalogo = "oraculos" | "cielo" | "pareja" | "profundo";
export const GRUPOS_CATALOGO: GrupoCatalogo[] = ["oraculos", "cielo", "pareja", "profundo"];

export type IconoCatalogo = "tarot" | "astral" | "hoy" | "horoscopo" | "luna" | "numerologia" | "quiromancia" | "iching" | "chino" | "suenos" | "chocolate" | "velas" | "compatibilidad" | "sinastria" | "cruce";

export interface ItemCatalogo {
  clave: IconoCatalogo;
  href: string;
  grupo: GrupoCatalogo;
  /** Créditos de la lectura principal; 0 = gratis; null = sin costo fijo (horóscopo). */
  costo: number | null;
  /** Solo tiene sentido con sesión (se oculta a visitantes en el menú). */
  requiereCuenta?: boolean;
}

export const CATALOGO: ItemCatalogo[] = [
  { clave: "tarot", href: "/tarot", grupo: "oraculos", costo: COSTOS.tarot_tres },
  { clave: "iching", href: "/iching", grupo: "oraculos", costo: COSTOS.iching },
  { clave: "suenos", href: "/suenos", grupo: "oraculos", costo: COSTOS.suenos },
  { clave: "chocolate", href: "/chocolate", grupo: "oraculos", costo: COSTOS.chocolate },
  { clave: "velas", href: "/velas", grupo: "oraculos", costo: COSTOS.velas },
  { clave: "hoy", href: "/hoy", grupo: "cielo", costo: 0, requiereCuenta: true },
  { clave: "horoscopo", href: "/horoscopo", grupo: "cielo", costo: 0 },
  { clave: "luna", href: "/luna", grupo: "cielo", costo: 0 },
  { clave: "astral", href: "/carta-astral", grupo: "cielo", costo: COSTOS.carta_astral },
  { clave: "chino", href: "/calendario-chino", grupo: "cielo", costo: COSTOS.chino },
  { clave: "numerologia", href: "/numerologia", grupo: "cielo", costo: COSTOS.numerologia },
  { clave: "compatibilidad", href: "/compatibilidad", grupo: "pareja", costo: COSTOS.compatibilidad },
  { clave: "sinastria", href: "/sinastria", grupo: "pareja", costo: COSTOS.sinastria },
  { clave: "quiromancia", href: "/quiromancia", grupo: "profundo", costo: COSTOS.quiromancia },
  { clave: "cruce", href: "/cruce", grupo: "profundo", costo: COSTOS.cruce },
];

/** Ítem con sus textos, listo para pasarlo a componentes de cliente. */
export interface ItemCatalogoTexto extends ItemCatalogo {
  nombre: string;
  descripcion: string;
  costoTexto: string;
}

export function catalogoConTextos(t: Diccionario, opciones: { conCuenta: boolean }): ItemCatalogoTexto[] {
  const modulos = t.portada.modulos as Record<string, { titulo: string; texto: string }>;
  return CATALOGO.filter((i) => opciones.conCuenta || !i.requiereCuenta).map((i) => {
    const m = i.clave === "hoy" ? t.crecimiento.moduloHoy : modulos[i.clave];
    return {
      ...i,
      nombre: m?.titulo ?? i.clave,
      descripcion: m?.texto ?? "",
      costoTexto: i.costo === null || i.costo === 0 ? t.comun.gratis : `${i.costo} cr.`,
    };
  });
}
