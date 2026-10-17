import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esFecha } from "@/lib/redes/carta-dia";
import { LAMINAS, contenidoGuardado, lamina } from "@/lib/redes/carrusel";

/**
 * Lámina pública (1080×1350) del carrusel semanal:
 * /api/redes/carrusel?semana=AAAA-MM-DD&n=0..7. Meta la descarga al publicar.
 * Los textos salen de la base (escritos por Sibila), nunca de la URL.
 */
export async function GET(request: NextRequest) {
  const semana = request.nextUrl.searchParams.get("semana");
  const n = Number(request.nextUrl.searchParams.get("n"));
  if (!esFecha(semana) || !Number.isInteger(n) || n < 0 || n >= LAMINAS) return new Response("No encontrada", { status: 404 });
  const contenido = await contenidoGuardado(getSupabaseAdmin(), semana);
  if (!contenido) return new Response("No encontrada", { status: 404 });
  const imagen = await lamina(contenido, n);
  return new Response(new Uint8Array(imagen), { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=3600" } });
}
