import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { cartaDelDia, esFecha, fechaBogota, frase, mazoDelDia, simboloCarta } from "@/lib/redes/carta-dia";
import { cartaComoDataUri } from "@/lib/marca/imagenes";
import { MAZOS } from "@/lib/tarot/mazos";

/**
 * Imagen pública (1080×1350) de la carta del día de Arcana para Instagram:
 * /api/redes/carta-dia?fecha=AAAA-MM-DD. El texto sale del mazo, nunca de la
 * URL, así que nadie puede fabricar imágenes con la marca.
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
    extracto: frase(carta.significado),
    enlace: "miarcana.com",
    pie: "Saca tu propia carta gratis cada día",
  });
  imagen.headers.set("Cache-Control", "public, max-age=86400, immutable");
  return imagen;
}
