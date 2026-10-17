import "server-only";
import { resolverPagina } from "./pagina";

/**
 * Publicación de fotos y videos en la página de Facebook "Mi Arcana" con la
 * API Graph. Token: FB_PAGE_TOKEN, o META_PAGE_TOKEN, o el de Instagram
 * (IG_PAGE_TOKEN); debe tener pages_manage_posts. El id real de la página se
 * deduce del token (`pagina.ts`): FB_PAGE_ID es opcional y, con la nueva
 * experiencia de páginas, el número de la barra del navegador no sirve.
 */
const API = "https://graph.facebook.com/v25.0";

function fuenteToken(): "FB_PAGE_TOKEN" | "META_PAGE_TOKEN" | "IG_PAGE_TOKEN" | null {
  return process.env.FB_PAGE_TOKEN ? "FB_PAGE_TOKEN" : process.env.META_PAGE_TOKEN ? "META_PAGE_TOKEN" : process.env.IG_PAGE_TOKEN ? "IG_PAGE_TOKEN" : null;
}

function tokenFacebook() {
  const fuente = fuenteToken();
  return fuente ? process.env[fuente]! : "";
}

export function facebookConfigurado() {
  return Boolean(tokenFacebook());
}

/** Publica una imagen (URL pública) con texto en la página y devuelve el id de la publicación. */
export async function publicarFotoFacebook(urlImagen: string, texto: string): Promise<string> {
  const { id: pagina, token } = await resolverPagina(tokenFacebook());
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
  const { id: pagina, token } = await resolverPagina(tokenFacebook());
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
  /** Id real de la página (deducido del token). */
  pagina: string | null;
  nombrePagina?: string;
  fuenteToken: "FB_PAGE_TOKEN" | "META_PAGE_TOKEN" | "IG_PAGE_TOKEN" | null;
  /** Cómo se llegó a la página: el token ya era de página o se sacó de las cuentas del usuario. */
  origen?: "token_de_pagina" | "cuentas_del_usuario";
  /** FB_PAGE_ID tiene un número distinto del id real (no estorba: ya no se usa). */
  avisoId?: string;
  error?: string;
}

/** Revisa con qué página y qué token publicaría Arcana en Facebook, sin publicar nada. */
export async function diagnosticoFacebook(): Promise<DiagnosticoFacebook> {
  const fuente = fuenteToken();
  if (!fuente) return { pagina: null, fuenteToken: null, error: "No hay token: falta FB_PAGE_TOKEN (o META_PAGE_TOKEN o IG_PAGE_TOKEN)." };
  try {
    const p = await resolverPagina(tokenFacebook());
    const configurado = process.env.FB_PAGE_ID;
    return {
      pagina: p.id,
      nombrePagina: p.nombre,
      fuenteToken: fuente,
      origen: p.origen,
      avisoId: configurado && configurado !== p.id ? `FB_PAGE_ID dice ${configurado} (el número del perfil); el id real de la página es ${p.id}. Ya se usa el real; puedes corregir o borrar FB_PAGE_ID.` : undefined,
    };
  } catch (e) {
    return { pagina: null, fuenteToken: fuente, error: e instanceof Error ? e.message : String(e) };
  }
}
