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

export interface DiagnosticoFacebook {
  pagina: string | null;
  fuenteToken: "FB_PAGE_TOKEN" | "IG_PAGE_TOKEN" | null;
  /** A quién representa el token según Meta (/me). */
  identidad?: { id: string; name?: string };
  /** El token es el de la propia página (requisito para publicar como la página). */
  esTokenDePagina: boolean;
  nombrePagina?: string;
  error?: string;
}

/** Revisa con qué identidad publicaría Arcana en la página, sin publicar nada. */
export async function diagnosticoFacebook(): Promise<DiagnosticoFacebook> {
  const pagina = process.env.FB_PAGE_ID ?? null;
  const fuenteToken = process.env.FB_PAGE_TOKEN ? "FB_PAGE_TOKEN" : process.env.IG_PAGE_TOKEN ? "IG_PAGE_TOKEN" : null;
  const token = process.env.FB_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN;
  if (!pagina || !token) return { pagina, fuenteToken, esTokenDePagina: false, error: !pagina ? "Falta FB_PAGE_ID en Vercel." : "No hay token: falta FB_PAGE_TOKEN (o IG_PAGE_TOKEN)." };
  const consultar = async (ruta: string) => {
    const res = await fetch(`${API}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    return (await res.json().catch(() => ({}))) as { id?: string; name?: string; error?: { message?: string; code?: number } };
  };
  const yo = await consultar("me?fields=id,name");
  if (yo.error) return { pagina, fuenteToken, esTokenDePagina: false, error: `El token no sirve: ${yo.error.message ?? "error"}${yo.error.code ? ` (código ${yo.error.code})` : ""}` };
  const pag = await consultar(`${pagina}?fields=name`);
  return {
    pagina,
    fuenteToken,
    identidad: { id: String(yo.id ?? ""), name: yo.name },
    esTokenDePagina: String(yo.id ?? "") === pagina,
    nombrePagina: pag.name,
    error: pag.error ? `No se pudo leer la página ${pagina}: ${pag.error.message ?? "error"}` : undefined,
  };
}
