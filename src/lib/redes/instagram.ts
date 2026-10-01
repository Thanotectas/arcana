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
