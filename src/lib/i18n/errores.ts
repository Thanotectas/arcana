import type { Diccionario } from "./diccionarios";

/**
 * Traduce un código de error devuelto por una Server Action de lectura
 * ("astral.fecha", "SIN_CREDITOS", ...) al texto del idioma actual.
 */
export function textoErrorLectura(codigo: string | undefined, t: Diccionario): string | undefined {
  if (!codigo) return undefined;
  if (codigo === "SIN_CREDITOS") return t.comun.sinCreditos;
  const [grupo, clave] = codigo.split(".");
  const grupos: Record<string, Record<string, string> | undefined> = {
    astral: t.astral.errores,
    numerologia: t.numerologia.errores,
    compatibilidad: t.compatibilidad.errores,
    quiromancia: t.quiromancia.errores,
    iching: t.iching.errores,
    chino: t.chino.errores,
    cruce: t.cruce.errores,
    suenos: t.suenos.errores,
  };
  return grupos[grupo]?.[clave] ?? codigo;
}
