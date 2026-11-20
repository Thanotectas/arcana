import type { NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esBot } from "@/lib/embudo/visitas";
import { fechaBogota } from "@/lib/redes/carta-dia";

/** Instalación o primera apertura de Arcana instalada (ContarApp lo manda una vez por dispositivo). Anónimo. */
export async function POST(request: NextRequest) {
  const sitio = request.headers.get("sec-fetch-site");
  const agente = request.headers.get("user-agent") ?? "";
  if ((sitio && sitio !== "same-origin") || esBot(agente)) return new Response(null, { status: 204 });
  const cuerpo = (await request.json().catch(() => null)) as { evento?: unknown } | null;
  const evento = cuerpo?.evento === "instalada" ? "instalada" : cuerpo?.evento === "abierta" ? "abierta" : null;
  if (!evento) return new Response(null, { status: 400 });
  const sistema = /iPhone|iPad|iPod/i.test(agente) ? "iphone" : /Android/i.test(agente) ? "android" : "computador";
  const plataforma = request.cookies.get("plataforma")?.value === "android" ? "android" : "pwa";
  const pais = request.headers.get("x-vercel-ip-country");
  try {
    const { error } = await getSupabaseAdmin()
      .from("app_eventos")
      .insert({ fecha: fechaBogota(), evento, sistema, plataforma, pais: pais && /^[A-Z]{2}$/.test(pais) ? pais : null });
    if (error) throw new Error(error.message);
  } catch (e) {
    // Sin la migración 0055 la tabla no existe: no se cuenta, nada más.
    console.error("[app evento]", e instanceof Error ? e.message : e);
  }
  return new Response(null, { status: 204 });
}
