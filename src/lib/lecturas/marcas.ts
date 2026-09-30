/**
 * Marca que la ruta de generación añade al final del texto cuando falla.
 * Lleva un código para que la interfaz explique la causa:
 *   [[ERROR:clave]]   la clave de la API no es válida o no está configurada
 *   [[ERROR:saldo]]   la cuenta del proveedor de IA no tiene saldo
 *   [[ERROR:limite]]  demasiadas peticiones simultáneas
 *   [[ERROR:rechazo]] el modelo declinó escribir la lectura
 *   [[ERROR:generico]]
 */
export const MARCA_ERROR = "\n\n[[ERROR]]";
export const PREFIJO_ERROR = "[[ERROR";

export type CodigoErrorLectura = "clave" | "saldo" | "limite" | "rechazo" | "generico";

export function marcaError(codigo: CodigoErrorLectura) {
  return `\n\n[[ERROR:${codigo}]]`;
}

/** Extrae el código de error del texto recibido (o null si no hay marca). */
export function extraerError(texto: string): CodigoErrorLectura | null {
  const m = texto.match(/\[\[ERROR(?::([a-z]+))?\]\]/);
  if (!m) return null;
  const c = m[1] as CodigoErrorLectura | undefined;
  return c && ["clave", "saldo", "limite", "rechazo", "generico"].includes(c) ? c : "generico";
}

export function limpiarMarcas(texto: string) {
  return texto.replace(/\n*\[\[ERROR(?::[a-z]+)?\]\]/g, "");
}
