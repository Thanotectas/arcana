import type { NextRequest } from "next/server";
import { esIdioma } from "@/lib/i18n/idiomas";
import { fechaBogota, leerResultado, numeroDeJuego } from "@/lib/juego/carta-escondida";
import { videoResultado } from "@/lib/juego/video";

export const maxDuration = 120;

/**
 * Video del resultado para TikTok, Reels y estados: /api/juego/video?n=&f=&ra=&idioma=es.
 * Responde el MP4 (o redirige al guardado). No revela la carta.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const r = leerResultado(q.get("n"), q.get("f"), q.get("ra"));
  if (!r || r.numero > numeroDeJuego(fechaBogota())) return new Response("Resultado no válido", { status: 400 });
  const idioma = esIdioma(q.get("idioma")) ? (q.get("idioma") as "es" | "en" | "pt") : "es";
  try {
    const { url, video } = await videoResultado(r, idioma);
    if (!video) return Response.redirect(url, 302);
    return new Response(new Uint8Array(video), { headers: { "Content-Type": "video/mp4", "Cache-Control": "public, max-age=86400", "Content-Disposition": `inline; filename="camino-del-loco-${r.numero}.mp4"` } });
  } catch (e) {
    console.error("[juego video]", e instanceof Error ? e.message : e);
    return new Response("No se pudo preparar el video", { status: 502 });
  }
}
