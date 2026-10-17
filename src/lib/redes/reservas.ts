import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Una publicación automática por red, tipo y día (tabla `publicaciones_redes`,
 * clave única red + tipo + fecha). Reservar evita publicar dos veces si el
 * cron se repite; si el intento anterior falló o quedó colgado (más de 10
 * minutos en 'pendiente'), se retoma.
 */
export type RedRegistro = "instagram" | "facebook" | "correo";
export type TipoRegistro = "carta_dia" | "historia" | "carrusel" | "kit_tiktok";
export type Resultado = { publicada: string } | { omitida: string } | { error: string };

export async function reservar(admin: SupabaseClient<Database>, red: RedRegistro, tipo: TipoRegistro, fecha: string): Promise<number | null> {
  const clave = { red, tipo, fecha };
  const { data: nueva, error } = await admin.from("publicaciones_redes").insert(clave).select("id").maybeSingle();
  if (nueva?.id) return nueva.id;
  if (error && error.code !== "23505") throw new Error(`reserva ${red} ${tipo}: ${error.message}`);
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

/** Reserva el día y publica; guarda el id de Meta o el error. */
export async function publicarUnaVez(
  admin: SupabaseClient<Database>,
  red: RedRegistro,
  tipo: TipoRegistro,
  fecha: string,
  publicar: () => Promise<string>,
  contenido?: unknown,
): Promise<Resultado> {
  let id: number | null;
  try {
    id = await reservar(admin, red, tipo, fecha);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  if (!id) return { omitida: "ya_publicada_o_en_curso" };
  if (contenido !== undefined) await admin.from("publicaciones_redes").update({ contenido: contenido as Database["public"]["Tables"]["publicaciones_redes"]["Update"]["contenido"] }).eq("id", id);
  try {
    const referencia = await publicar();
    await admin.from("publicaciones_redes").update({ estado: "publicada", referencia }).eq("id", id);
    return { publicada: referencia };
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    console.error(`[redes ${red} ${tipo}]`, detalle);
    await admin.from("publicaciones_redes").update({ estado: "error", detalle: detalle.slice(0, 500) }).eq("id", id);
    return { error: detalle };
  }
}
