import type { NextRequest } from "next/server";
import { imagenTarjeta } from "@/lib/marca/tarjeta";
import { cartaComoDataUri, monedaComoDataUri } from "@/lib/marca/imagenes";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { IdMazo } from "@/lib/tarot/mazos";

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

  // "carta": "mazo/id" (ilustración de carta) o "signos/id" (moneda del signo).
  let ilustracion: string | null = null;
  let monedas = false;
  if (p.carta) {
    const [carpeta, nombre] = p.carta.split("/");
    if (carpeta === "signos" && nombre) {
      ilustracion = await monedaComoDataUri("signos", nombre);
      monedas = true;
    } else if (carpeta && nombre) {
      ilustracion = await cartaComoDataUri(carpeta as IdMazo, nombre);
    }
  }
  const imagen = await imagenTarjeta({
    etiqueta: p.etiqueta,
    titulo: p.titulo,
    simbolos: p.simbolos.length ? p.simbolos : ["✦"],
    imagenes: ilustracion ? [ilustracion] : undefined,
    monedas,
    extracto: p.extracto,
    enlace: p.enlace,
    pie: p.pie,
  });
  imagen.headers.set("Cache-Control", "public, max-age=300");
  return imagen;
}
