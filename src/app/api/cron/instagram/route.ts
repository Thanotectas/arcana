import { cronAutorizado } from "@/lib/cron";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { instagramConfigurado, publicarImagen, publicarReel } from "@/lib/redes/instagram";
import { facebookConfigurado, publicarFotoFacebook, publicarVideoFacebook } from "@/lib/redes/facebook";
import { reelCartaDelDia } from "@/lib/redes/reel";
import { cartaDelDia, fechaBogota, textoCartaDelDia } from "@/lib/redes/carta-dia";
import { publicarVencidas, type ResultadoPublicacion } from "@/lib/redes/publicar";
import { asegurarBorradores } from "@/lib/redes/agente";

// Generar el reel (~30 s) y que Meta lo procese (hasta ~3 min) toma tiempo.
export const maxDuration = 300;

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
 * UTC) solo actúa en la red que falló y, además, publica las publicaciones
 * aprobadas del agente de redes. Vercel manda `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  if (!instagramConfigurado() && !facebookConfigurado()) return Response.json({ error: "redes_sin_configurar" }, { status: 503 });

  const fecha = fechaBogota();
  const sitio = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
  const imagen = `${sitio}/api/redes/carta-dia?fecha=${fecha}`;
  const carta = cartaDelDia(fecha);
  const texto = textoCartaDelDia(fecha);
  const admin = getSupabaseAdmin();

  // La carta del día sale como reel (video corto). Se genera una sola vez, solo
  // si alguna red lo necesita, y si algo falla se publica la imagen de siempre.
  // REDES_REEL=0 vuelve a la imagen fija.
  let reel: Promise<string> | null = null;
  const obtenerReel = () => (reel ??= reelCartaDelDia(admin, fecha));
  const conRespaldo = async (red: string, video: (url: string) => Promise<string>, foto: () => Promise<string>) => {
    if (process.env.REDES_REEL !== "0") {
      try {
        return await video(await obtenerReel());
      } catch (e) {
        console.error(`[cron ${red}] reel falló, se publica la imagen:`, e instanceof Error ? e.message : e);
      }
    }
    return foto();
  };

  const instagram: Resultado = instagramConfigurado()
    ? await publicarEn(admin, "instagram", fecha, () => conRespaldo("instagram", (url) => publicarReel(url, texto), () => publicarImagen(imagen, texto)))
    : { omitida: "sin_configurar" };
  const facebook: Resultado = facebookConfigurado()
    ? await publicarEn(admin, "facebook", fecha, () => conRespaldo("facebook", (url) => publicarVideoFacebook(url, texto), () => publicarFotoFacebook(imagen, texto)))
    : { omitida: "sin_configurar" };

  // Agente de redes: la corrida de la tarde (17:00 UTC = mediodía en Bogotá)
  // publica lo aprobado; cualquier corrida redacta los borradores que falten.
  let programadas: ResultadoPublicacion[] = [];
  let agente: unknown = null;
  try {
    if (new Date().getUTCHours() >= 15) programadas = await publicarVencidas(admin, fecha);
    agente = await asegurarBorradores(admin, fecha);
  } catch (e) {
    agente = { error: e instanceof Error ? e.message : String(e) };
    console.error("[cron agente redes]", agente);
  }

  const fallo = "error" in instagram || "error" in facebook || programadas.some((p) => p.estado === "error");
  return Response.json({ fecha, carta: carta.nombre, instagram, facebook, programadas, agente }, { status: fallo ? 502 : 200 });
}
