/**
 * Utilidades de seguridad compartidas (sin dependencias de servidor).
 */

/**
 * Devuelve una ruta interna segura para redirigir después del login.
 * Rechaza URLs absolutas, "//evil", "/\\evil" (el navegador lo trata como //)
 * y cualquier cosa que no resuelva al mismo origen.
 */
export function rutaInterna(valor: string | null | undefined, porDefecto = "/inicio") {
  const s = String(valor ?? "").trim();
  if (!/^\/(?![/\\])/.test(s)) return porDefecto;
  try {
    const u = new URL(s, "http://arcana.local");
    if (u.origin !== "http://arcana.local") return porDefecto;
    const ruta = u.pathname + u.search + u.hash;
    // Tras normalizar ("/..//evil.com" → "//evil.com") vuelve a comprobarse.
    return /^\/(?![/\\])/.test(ruta) ? ruta : porDefecto;
  } catch {
    return porDefecto;
  }
}

/**
 * Texto escrito por la persona que entra en un prompt: se limpia de saltos de
 * línea, encabezados Markdown, etiquetas y bloques de código, y se delimita
 * para que el modelo lo trate como dato y no como instrucción.
 */
export function datoDeUsuario(texto: unknown, max = 400) {
  const limpio = String(texto ?? "")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[<>`]/g, "")
    .replace(/#{2,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return limpio ? `«${limpio}»` : "";
}

/** Comprueba por bytes mágicos que un archivo es JPEG, PNG o WebP. */
export function tipoImagenReal(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return "image/webp";
  return null;
}
