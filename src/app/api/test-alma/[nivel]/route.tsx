import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { NIVELES_ALMA, RESULTADOS_ALMA, type NivelAlma } from "@/lib/seo/test-alma";

/** Imagen del resultado del test de alma vieja (?formato=historia → 1080×1920). El texto sale del resultado, nunca de la URL. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ nivel: string }> }) {
  const { nivel } = await params;
  if (!(NIVELES_ALMA as readonly string[]).includes(nivel)) return new Response("No encontrado", { status: 404 });
  const r = RESULTADOS_ALMA[nivel as NivelAlma];
  const historia = request.nextUrl.searchParams.get("formato") === "historia";
  const imagen = await imagenTarjeta({
    etiqueta: "¿Eres alma vieja?",
    titulo: `Soy ${r.nombre.toLowerCase()}`,
    simbolos: Array.from({ length: r.estrellas }, () => "✦"),
    extracto: r.esencia,
    enlace: "miarcana.com/alma-vieja",
    pie: "Haz el test y descubre la edad de tu alma",
    formato: historia ? "historia" : "publicacion",
  });
  imagen.headers.set("Cache-Control", "public, max-age=604800, immutable");
  return imagen;
}
