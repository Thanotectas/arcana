import "server-only";

/**
 * La página de Facebook "Mi Arcana" tal como la ve la API Graph. Con la nueva
 * experiencia de páginas, el número de la barra del navegador
 * (profile.php?id=…) es el del perfil, no el de la página, así que no sirve
 * como FB_PAGE_ID. Aquí se deduce del token:
 * - si es un token de página, /me es la página;
 * - si es un token de usuario, /me/accounts lista sus páginas con su propio
 *   token y se elige la de Arcana (por FB_PAGE_ID, por el Instagram vinculado
 *   IG_USER_ID, por el nombre o porque es la única).
 */
const API = "https://graph.facebook.com/v25.0";

export interface PaginaResuelta {
  id: string;
  nombre?: string;
  /** Token de la página (el mismo si ya lo era). */
  token: string;
  origen: "token_de_pagina" | "cuentas_del_usuario";
  /** Instagram profesional vinculado, si Meta lo informa. */
  instagram?: string;
}

async function consultar<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`Meta ${ruta.split("?")[0]}: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos;
}

const enCache = new Map<string, Promise<PaginaResuelta>>();

async function resolver(token: string): Promise<PaginaResuelta> {
  // `category` solo existe en las páginas: si responde, el token es de página.
  const yo = await consultar<{ id?: string; name?: string; category?: string }>("me?fields=id,name,category", token).catch(() => consultar<{ id?: string; name?: string }>("me?fields=id,name", token));
  if (yo.id && "category" in yo && yo.category) {
    const ig = await consultar<{ instagram_business_account?: { id?: string } }>(`${yo.id}?fields=instagram_business_account`, token).catch(() => ({}) as { instagram_business_account?: { id?: string } });
    return { id: yo.id, nombre: yo.name, token, origen: "token_de_pagina", instagram: ig.instagram_business_account?.id };
  }
  const cuentas = await consultar<{ data?: { id: string; name?: string; access_token?: string; instagram_business_account?: { id?: string } }[] }>("me/accounts?fields=id,name,access_token,instagram_business_account&limit=100", token);
  const paginas = (cuentas.data ?? []).filter((p) => p.access_token);
  const elegida =
    paginas.find((p) => p.id === process.env.FB_PAGE_ID) ??
    paginas.find((p) => process.env.IG_USER_ID && p.instagram_business_account?.id === process.env.IG_USER_ID) ??
    paginas.find((p) => /arcana/i.test(p.name ?? "")) ??
    (paginas.length === 1 ? paginas[0] : undefined);
  if (!elegida) {
    throw new Error(`El token es de un usuario${yo.name ? ` («${yo.name}»)` : ""} y no se encontró la página de Arcana entre las que administra (${paginas.length} página${paginas.length === 1 ? "" : "s"} con acceso). Genera el token de la página "Mi Arcana" con pages_show_list.`);
  }
  return { id: elegida.id, nombre: elegida.name, token: elegida.access_token!, origen: "cuentas_del_usuario", instagram: elegida.instagram_business_account?.id };
}

/** Página de Arcana para ese token (se calcula una vez por instancia; si falla, se reintenta la próxima vez). */
export function resolverPagina(token: string): Promise<PaginaResuelta> {
  if (!token) return Promise.reject(new Error("No hay token de Meta configurado."));
  let p = enCache.get(token);
  if (!p) {
    p = resolver(token);
    enCache.set(token, p);
    p.catch(() => enCache.delete(token));
  }
  return p;
}
