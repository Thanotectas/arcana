import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { cartaDelDia, esFecha, fechaBogota, frase, mazoDelDia, simboloCarta } from "@/lib/redes/carta-dia";
import { cartaComoDataUri } from "@/lib/marca/imagenes";
import { MAZOS } from "@/lib/tarot/mazos";

/**
 * Historia (1080×1920) de la carta del día para Instagram y Facebook:
 * /api/redes/historia-dia?fecha=AAAA-MM-DD. Mismo contenido que la imagen de
 * la publicación, en formato vertical. El texto sale del mazo, nunca de la URL.
 */
export async function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get("fecha");
  const fecha = esFecha(param) ? param : fechaBogota();
  const carta = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  const ilustracion = await cartaComoDataUri(mazo, carta.id);
  const imagen = await imagenTarjeta({
    etiqueta: `Carta del día · ${mazo === "arcana" ? "Tarot Arcana" : MAZOS[mazo].nombre}`,
    titulo: carta.nombre,
    simbolos: [simboloCarta(carta)],
    imagenes: ilustracion ? [ilustracion] : undefined,
    extracto: frase(carta.significado, 200),
    enlace: "miarcana.com",
    pie: "Saca tu propia carta gratis cada día",
    formato: "historia",
  });
  imagen.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return imagen;
}
