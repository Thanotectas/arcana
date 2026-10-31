import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { cartaComoDataUri } from "@/lib/marca/imagenes";
import { cartaPorId } from "@/lib/tarot/deck";
import { RESULTADOS } from "@/lib/seo/test-carta";

/**
 * Imagen del resultado del test «¿Qué carta del tarot eres?».
 * ?formato=historia → 1080×1920 (historias y estados); si no, 1080×1350.
 * El texto sale del resultado guardado, nunca de la URL.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ carta: string }> }) {
  const { carta } = await params;
  const c = cartaPorId(carta);
  const r = RESULTADOS[carta];
  if (!c || !r) return new Response("No encontrada", { status: 404 });
  const ilustracion = await cartaComoDataUri("rider", c.id);
  const historia = request.nextUrl.searchParams.get("formato") === "historia";
  const imagen = await imagenTarjeta({
    etiqueta: "¿Qué carta eres?",
    titulo: `Soy ${c.nombre}`,
    simbolos: ["✦"],
    imagenes: ilustracion ? [ilustracion] : undefined,
    extracto: r.esencia,
    enlace: "miarcana.com/que-carta-eres",
    pie: "Haz el test y descubre la tuya",
    formato: historia ? "historia" : "publicacion",
  });
  imagen.headers.set("Cache-Control", "public, max-age=604800, immutable");
  if (historia) imagen.headers.set("Content-Disposition", `inline; filename="arcana-${c.id}.png"`);
  return imagen;
}
