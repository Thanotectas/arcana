import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { instagramConfigurado, publicarImagen } from "@/lib/redes/instagram";
import { cartaDelDia, fechaBogota, textoCartaDelDia } from "@/lib/redes/carta-dia";

// Meta procesa la imagen antes de publicarla: puede tardar un minuto.
export const maxDuration = 120;

/**
 * Cron diario (vercel.json, 12:00 UTC = 07:00 Bogotá): publica en Instagram la
 * carta del día de Arcana. Vercel manda `Authorization: Bearer CRON_SECRET`.
 * Una sola publicación por día: la tabla publicaciones_redes lo garantiza.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "sin_cron_secret" }, { status: 503 });
  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return Response.json({ error: "no_autorizado" }, { status: 401 });
  if (!instagramConfigurado()) return Response.json({ error: "instagram_sin_configurar" }, { status: 503 });

  const fecha = fechaBogota();
  const sitio = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
  const imagen = `${sitio}/api/redes/carta-dia?fecha=${fecha}`;
  const carta = cartaDelDia(fecha);

  // Reserva el día: si ya se publicó (o se está publicando), no se repite.
  const admin = getSupabaseAdmin();
  const clave = { red: "instagram", tipo: "carta_dia", fecha };
  const { data: nueva, error: errorReserva } = await admin.from("publicaciones_redes").insert(clave).select("id").maybeSingle();
  let id = nueva?.id;
  if (!id) {
    if (errorReserva && errorReserva.code !== "23505") {
      return Response.json({ error: "reserva", detalle: errorReserva.message }, { status: 500 });
    }
    // Ya existía: solo se reintenta si el intento anterior falló.
    const { data: retomada } = await admin
      .from("publicaciones_redes")
      .update({ estado: "pendiente", detalle: null })
      .match({ ...clave, estado: "error" })
      .select("id")
      .maybeSingle();
    if (!retomada) return Response.json({ fecha, carta: carta.nombre, omitida: "ya_publicada_o_en_curso" });
    id = retomada.id;
  }

  try {
    const postId = await publicarImagen(imagen, textoCartaDelDia(fecha));
    await admin.from("publicaciones_redes").update({ estado: "publicada", referencia: postId }).eq("id", id);
    return Response.json({ fecha, carta: carta.nombre, publicada: postId });
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error("[cron instagram]", detalle);
    await admin.from("publicaciones_redes").update({ estado: "error", detalle: detalle.slice(0, 500) }).eq("id", id);
    return Response.json({ fecha, carta: carta.nombre, error: "publicacion", detalle }, { status: 502 });
  }
}
