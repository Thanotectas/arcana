import "server-only";

/**
 * Publicación de una foto en la página de Facebook "Mi Arcana" con la API
 * Graph. Usa el mismo token de página que Instagram (IG_PAGE_TOKEN) salvo que
 * se defina FB_PAGE_TOKEN; el token debe tener el permiso pages_manage_posts.
 * Variable: FB_PAGE_ID (id numérico de la página).
 */
const API = "https://graph.facebook.com/v25.0";

export function facebookConfigurado() {
  return Boolean(process.env.FB_PAGE_ID && (process.env.FB_PAGE_TOKEN || process.env.IG_PAGE_TOKEN));
}

/** Publica una imagen (URL pública) con texto en la página y devuelve el id de la publicación. */
export async function publicarFotoFacebook(urlImagen: string, texto: string): Promise<string> {
  const pagina = process.env.FB_PAGE_ID!;
  const token = process.env.FB_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN!;
  const res = await fetch(`${API}/${pagina}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: new URLSearchParams({ url: urlImagen, message: texto, published: "true" }),
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as { id?: string; post_id?: string; error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`Facebook photos: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return String(datos.post_id ?? datos.id ?? "");
}

/** Publica un video (MP4 en una URL pública) con texto en la página y devuelve su id. */
export async function publicarVideoFacebook(urlVideo: string, texto: string): Promise<string> {
  const pagina = process.env.FB_PAGE_ID!;
  const token = process.env.FB_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN!;
  const res = await fetch(`${API}/${pagina}/videos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: new URLSearchParams({ file_url: urlVideo, description: texto, published: "true" }),
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`Facebook videos: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return String(datos.id ?? "");
}
