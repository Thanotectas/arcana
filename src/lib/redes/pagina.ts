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

/** Id real de la página "Mi Arcana" en la API (no es secreto): último recurso si el token es de usuario. */
const PAGINA_ARCANA = "1337589612768238";

export interface PaginaResuelta {
  id: string;
  nombre?: string;
  /** Token de la página (el mismo si ya lo era). */
  token: string;
  origen: "token_de_pagina" | "cuentas_del_usuario";
  /** El token configurado es de usuario: vence (60 días como mucho) y conviene cambiarlo por el de la página. */
  tokenDeUsuario?: boolean;
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
  if (elegida) return { id: elegida.id, nombre: elegida.name, token: elegida.access_token!, origen: "cuentas_del_usuario", tokenDeUsuario: true, instagram: elegida.instagram_business_account?.id };

  // /me/accounts puede venir vacío aunque el usuario administre la página (concesiones por página o por
  // portfolio): se pide directamente por su id, como en el Explorador de la API.
  const candidatos = [...new Set([process.env.FB_PAGE_ID, PAGINA_ARCANA].filter((x): x is string => Boolean(x)))];
  for (const id of candidatos) {
    const directa = await consultar<{ id?: string; name?: string; access_token?: string; instagram_business_account?: { id?: string } }>(`${id}?fields=id,name,access_token,instagram_business_account`, token).catch(() => null);
    if (directa?.id && directa.access_token) {
      return { id: directa.id, nombre: directa.name, token: directa.access_token, origen: "cuentas_del_usuario", tokenDeUsuario: true, instagram: directa.instagram_business_account?.id };
    }
  }
  throw new Error(`El token es de un usuario${yo.name ? ` («${yo.name}»)` : ""} y no da acceso a la página de Arcana (${paginas.length} página${paginas.length === 1 ? "" : "s"} en /me/accounts; tampoco respondió la página ${PAGINA_ARCANA}). Pon en Vercel el token de la página: en el Explorador, con este token, consulta ${PAGINA_ARCANA}?fields=name,access_token y copia access_token.`);
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
