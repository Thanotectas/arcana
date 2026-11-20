import path from "node:path";
import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { webpComoDataUri } from "@/lib/marca/imagenes";
import { MAX_INTENTOS, cartaDelJuego, fechaBogota, numeroDeJuego } from "@/lib/juego/carta-escondida";
import { esFecha } from "@/lib/redes/carta-dia";

/**
 * Imagen de la publicación diaria del juego (1080×1350): «¿Adivinas la carta de hoy?», el dorso y la primera pista.
 * /api/juego/reto?fecha=AAAA-MM-DD. Nunca muestra la carta.
 */
export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("fecha");
  const fecha = esFecha(param) ? param : fechaBogota();
  const numero = numeroDeJuego(fecha);
  const carta = cartaDelJuego(numero);
  const dorso = await webpComoDataUri(path.join(process.cwd(), "public", "cartas", "arcana", "dorso.webp"), { alto: 527 });
  const imagen = await imagenTarjeta({
    etiqueta: `El Camino del Loco · carta #${numero}`,
    titulo: "¿Adivinas la carta de hoy?",
    simbolos: ["?"],
    imagenes: dorso ? [dorso] : undefined,
    extracto: `Primera pista de Sibila: «${carta.palabrasClave[0]}». Tienes ${MAX_INTENTOS} intentos para descubrirla.`,
    enlace: "miarcana.com/juego",
    pie: "Juego diario de tarot · gratis",
  });
  imagen.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return imagen;
}
