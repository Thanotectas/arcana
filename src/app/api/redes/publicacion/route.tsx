import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { interpretarVisual, visualParaTarjeta } from "@/lib/redes/visual";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Imagen pública (1080×1350) de una publicación programada del agente de
 * redes: /api/redes/publicacion?id=UUID. Meta la descarga al publicar y la
 * página de administración la muestra como vista previa. Los textos salen de
 * la base, nunca de la URL.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!UUID.test(id)) return new Response("No encontrada", { status: 404 });
  const { data: p } = await getSupabaseAdmin().from("publicaciones_programadas").select("*").eq("id", id).neq("estado", "descartada").maybeSingle();
  if (!p) return new Response("No encontrada", { status: 404 });

  // `carta` describe el visual (carta, moneda, rueda, aura…); ver src/lib/redes/visual.tsx.
  const visual = await visualParaTarjeta(interpretarVisual(p.carta, p.simbolos));
  const imagen = await imagenTarjeta({
    etiqueta: p.etiqueta,
    titulo: p.titulo,
    extracto: p.extracto,
    enlace: p.enlace,
    pie: p.pie,
    ...visual,
    simbolos: visual.simbolos?.length ? visual.simbolos : p.simbolos.length ? p.simbolos : ["✦"],
  });
  imagen.headers.set("Cache-Control", "public, max-age=300");
  return imagen;
}
