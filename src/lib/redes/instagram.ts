import "server-only";

/**
 * Publicación en Instagram con la API Graph de Meta (cuenta profesional
 * vinculada a la página de Facebook "Mi Arcana"). Mismo flujo que usa
 * Thanotectas: crear el contenedor, esperar a que Meta lo procese y publicar.
 */
const API = "https://graph.facebook.com/v25.0";

export function instagramConfigurado() {
  return Boolean(process.env.IG_USER_ID && process.env.IG_PAGE_TOKEN);
}

async function llamar(ruta: string, params: Record<string, string>, metodo: "GET" | "POST" = "POST") {
  const token = process.env.IG_PAGE_TOKEN!;
  const cuerpo = new URLSearchParams(params);
  const url = metodo === "GET" ? `${API}/${ruta}?${cuerpo}` : `${API}/${ruta}`;
  const res = await fetch(url, {
    method: metodo,
    // El token va en la cabecera: nunca en la URL (quedaría en los registros).
    headers: { Authorization: `Bearer ${token}` },
    body: metodo === "POST" ? cuerpo : undefined,
    cache: "no-store",
  });
  const datos = (await res.json().catch(() => ({}))) as Record<string, unknown> & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`Instagram ${ruta.split("/").pop()}: ${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Publica una imagen (JPEG o PNG en una URL pública) y devuelve el id de la publicación. */
export async function publicarImagen(urlImagen: string, texto: string): Promise<string> {
  const ig = process.env.IG_USER_ID!;
  const contenedor = await llamar(`${ig}/media`, { image_url: urlImagen, caption: texto });
  const id = String(contenedor.id ?? "");
  if (!id) throw new Error("Instagram media: sin id de contenedor");

  // Las imágenes suelen estar listas al instante; esperamos hasta ~1 minuto.
  for (let i = 0; i < 12; i++) {
    const estado = await llamar(id, { fields: "status_code" }, "GET");
    if (estado.status_code === "FINISHED") break;
    if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") {
      throw new Error(`Instagram: el contenedor quedó en ${estado.status_code}`);
    }
    await esperar(5000);
  }

  const publicada = await llamar(`${ig}/media_publish`, { creation_id: id });
  return String(publicada.id ?? "");
}

/**
 * Publica un Reel (video MP4 en una URL pública). Meta procesa el video antes
 * de publicarlo: puede tardar de 30 segundos a un par de minutos.
 */
export async function publicarReel(urlVideo: string, texto: string): Promise<string> {
  const ig = process.env.IG_USER_ID!;
  const contenedor = await llamar(`${ig}/media`, { media_type: "REELS", video_url: urlVideo, caption: texto, share_to_feed: "true", thumb_offset: "3000" });
  const id = String(contenedor.id ?? "");
  if (!id) throw new Error("Instagram media: sin id de contenedor del reel");
  let listo = false;
  for (let i = 0; i < 36; i++) {
    await esperar(5000);
    const estado = await llamar(id, { fields: "status_code" }, "GET");
    if (estado.status_code === "FINISHED") {
      listo = true;
      break;
    }
    if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") throw new Error(`Instagram: el reel quedó en ${estado.status_code}`);
  }
  if (!listo) throw new Error("Instagram: el reel no terminó de procesarse a tiempo");
  const publicada = await llamar(`${ig}/media_publish`, { creation_id: id });
  return String(publicada.id ?? "");
}

/** Espera a que Meta termine de procesar un contenedor (hasta ~`intentos` × 5 s). */
async function esperarContenedor(id: string, intentos: number) {
  for (let i = 0; i < intentos; i++) {
    const estado = await llamar(id, { fields: "status_code" }, "GET");
    if (estado.status_code === "FINISHED") return;
    if (estado.status_code === "ERROR" || estado.status_code === "EXPIRED") throw new Error(`Instagram: el contenedor quedó en ${estado.status_code}`);
    await esperar(5000);
  }
  throw new Error("Instagram: el contenedor no terminó de procesarse a tiempo");
}

/** Publica una historia con una imagen 9:16 (URL pública). */
export async function publicarHistoria(urlImagen: string): Promise<string> {
  const ig = process.env.IG_USER_ID!;
  const contenedor = await llamar(`${ig}/media`, { media_type: "STORIES", image_url: urlImagen });
  const id = String(contenedor.id ?? "");
  if (!id) throw new Error("Instagram media: sin id de contenedor de la historia");
  await esperarContenedor(id, 12);
  const publicada = await llamar(`${ig}/media_publish`, { creation_id: id });
  return String(publicada.id ?? "");
}

/** Publica un carrusel de 2 a 10 imágenes (URLs públicas) con su texto. */
export async function publicarCarrusel(urlsImagenes: string[], texto: string): Promise<string> {
  const ig = process.env.IG_USER_ID!;
  if (urlsImagenes.length < 2 || urlsImagenes.length > 10) throw new Error("Instagram: un carrusel lleva de 2 a 10 imágenes");
  const hijos: string[] = [];
  for (const url of urlsImagenes) {
    const hijo = await llamar(`${ig}/media`, { image_url: url, is_carousel_item: "true" });
    if (!hijo.id) throw new Error("Instagram media: sin id de una lámina del carrusel");
    hijos.push(String(hijo.id));
  }
  for (const h of hijos) await esperarContenedor(h, 12);
  const contenedor = await llamar(`${ig}/media`, { media_type: "CAROUSEL", children: hijos.join(","), caption: texto });
  const id = String(contenedor.id ?? "");
  if (!id) throw new Error("Instagram media: sin id del carrusel");
  await esperarContenedor(id, 24);
  const publicada = await llamar(`${ig}/media_publish`, { creation_id: id });
  return String(publicada.id ?? "");
}
