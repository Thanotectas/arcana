import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { COOKIE_ORIGEN } from "@/lib/origen/comun";
import { datosVisita, esBot } from "@/lib/embudo/visitas";
import { fechaBogota } from "@/lib/redes/carta-dia";

/**
 * Primera visita de un navegador (ContarVisita la manda una sola vez). Sin datos
 * personales: origen, país, página de entrada, celular o no y plataforma.
 */
export async function POST(request: NextRequest) {
  // Solo desde el propio sitio y desde navegadores (no robots ni llamadas sueltas).
  const sitio = request.headers.get("sec-fetch-site");
  if ((sitio && sitio !== "same-origin") || esBot(request.headers.get("user-agent"))) return new Response(null, { status: 204 });

  const cuerpo = await request.json().catch(() => null);
  const visita = datosVisita({
    ruta: cuerpo && typeof cuerpo === "object" ? (cuerpo as { ruta?: unknown }).ruta : "/",
    cookieOrigen: request.cookies.get(COOKIE_ORIGEN)?.value,
    cookiePlataforma: request.cookies.get("plataforma")?.value,
    pais: request.headers.get("x-vercel-ip-country"),
    agente: request.headers.get("user-agent"),
  });
  try {
    const { error } = await getSupabaseAdmin().from("visitas").insert({ ...visita, fecha: fechaBogota() });
    if (error) throw new Error(error.message);
  } catch (e) {
    // Sin la migración 0050 la tabla no existe: no es grave, solo no se cuenta.
    console.error("[visita]", e instanceof Error ? e.message : e);
  }
  return new Response(null, { status: 204 });
}
