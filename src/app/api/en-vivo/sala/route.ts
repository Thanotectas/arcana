import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esIdioma } from "@/lib/i18n/idiomas";
import { estadoSala } from "@/lib/en-vivo-sala";

export const maxDuration = 60;

/**
 * Sala de Sibila (pública): GET ?idioma=fr → lo que el escenario muestra y dice ahora, en francés y con su audio.
 * La respuesta se cachea 1 s en el CDN: con cientos de personas mirando, el servidor responde una vez por segundo
 * por idioma.
 */
export async function GET(request: NextRequest) {
  const pedido = request.nextUrl.searchParams.get("idioma");
  const idioma = esIdioma(pedido) ? pedido : "es";
  const estado = await estadoSala(getSupabaseAdmin(), idioma);
  return NextResponse.json(estado, { headers: { "Cache-Control": estado.pendiente ? "public, max-age=0, s-maxage=1" : "public, max-age=0, s-maxage=1, stale-while-revalidate=1" } });
}
