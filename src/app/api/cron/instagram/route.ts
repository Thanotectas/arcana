import { timingSafeEqual } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { instagramConfigurado, publicarImagen } from "@/lib/redes/instagram";
import { facebookConfigurado, publicarFotoFacebook } from "@/lib/redes/facebook";
import { cartaDelDia, fechaBogota, textoCartaDelDia } from "@/lib/redes/carta-dia";

// Meta procesa la imagen antes de publicarla: puede tardar un minuto.
export const maxDuration = 120;

type Red = "instagram" | "facebook";
type Resultado = { publicada: string } | { omitida: string } | { error: string };

/**
 * Reserva el día para una red: si ya se publicó (o se está publicando), no se
 * repite; si el intento anterior falló o quedó colgado (más de 10 minutos en
 * 'pendiente'), se retoma. Devuelve el id de la fila o null si no toca publicar.
 */
async function reservar(admin: SupabaseClient<Database>, red: Red, fecha: string): Promise<number | null> {
  const clave = { red, tipo: "carta_dia", fecha };
  const { data: nueva, error } = await admin.from("publicaciones_redes").insert(clave).select("id").maybeSingle();
  if (nueva?.id) return nueva.id;
  if (error && error.code !== "23505") throw new Error(`reserva ${red}: ${error.message}`);
  const colgadoAntes = new Date(Date.now() - 10 * 60_000).toISOString();
  const { data: retomada } = await admin
    .from("publicaciones_redes")
    .update({ estado: "pendiente", detalle: null, creado_en: new Date().toISOString() })
    .match(clave)
    .or(`estado.eq.error,and(estado.eq.pendiente,creado_en.lt."${colgadoAntes}")`)
    .select("id")
    .maybeSingle();
  return retomada?.id ?? null;
}

async function publicarEn(admin: SupabaseClient<Database>, red: Red, fecha: string, publicar: () => Promise<string>): Promise<Resultado> {
  let id: number | null;
  try {
    id = await reservar(admin, red, fecha);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  if (!id) return { omitida: "ya_publicada_o_en_curso" };
  try {
    const postId = await publicar();
    await admin.from("publicaciones_redes").update({ estado: "publicada", referencia: postId }).eq("id", id);
    return { publicada: postId };
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error(`[cron ${red}]`, detalle);
    await admin.from("publicaciones_redes").update({ estado: "error", detalle: detalle.slice(0, 500) }).eq("id", id);
    return { error: detalle };
  }
}

/**
 * Cron diario (vercel.json, 12:00 UTC = 07:00 Bogotá): publica la carta del día
 * de Arcana en Instagram y en la página de Facebook. Una segunda corrida (17:00
 * UTC) solo actúa en la red que falló. Vercel manda `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "sin_cron_secret" }, { status: 503 });
  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return Response.json({ error: "no_autorizado" }, { status: 401 });
  if (!instagramConfigurado() && !facebookConfigurado()) return Response.json({ error: "redes_sin_configurar" }, { status: 503 });

  const fecha = fechaBogota();
  const sitio = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
  const imagen = `${sitio}/api/redes/carta-dia?fecha=${fecha}`;
  const carta = cartaDelDia(fecha);
  const texto = textoCartaDelDia(fecha);
  const admin = getSupabaseAdmin();

  const instagram: Resultado = instagramConfigurado() ? await publicarEn(admin, "instagram", fecha, () => publicarImagen(imagen, texto)) : { omitida: "sin_configurar" };
  const facebook: Resultado = facebookConfigurado() ? await publicarEn(admin, "facebook", fecha, () => publicarFotoFacebook(imagen, texto)) : { omitida: "sin_configurar" };

  const fallo = "error" in instagram || "error" in facebook;
  return Response.json({ fecha, carta: carta.nombre, instagram, facebook }, { status: fallo ? 502 : 200 });
}
