import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { instagramConfigurado, publicarImagen } from "./instagram";
import { facebookConfigurado, publicarFotoFacebook } from "./facebook";
import { fechaBogota } from "./carta-dia";
import type { PublicacionProgramada } from "./calendario";

type Red = "instagram" | "facebook";

function sitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
}

/** URL pública de la imagen de una publicación (la versión evita cachés viejas tras editar). */
export function urlImagenPublicacion(p: Pick<PublicacionProgramada, "id" | "actualizado_en">) {
  const v = Math.floor(Date.parse(p.actualizado_en) / 1000);
  return `${sitio()}/api/redes/publicacion?id=${p.id}&v=${v}`;
}

export type ResultadoPublicacion = { id: string; estado: "publicada" | "error" | "omitida"; resultados: PublicacionProgramada["resultados"] };

/**
 * Publica una fila aprobada en sus redes. Reserva la fila (aprobada o error →
 * publicando) para que dos corridas no la publiquen dos veces; las redes que
 * ya tienen id no se repiten, así un reintento solo toca la que falló.
 */
export async function publicarProgramada(admin: SupabaseClient<Database>, id: string): Promise<ResultadoPublicacion> {
  const { data: fila } = await admin
    .from("publicaciones_programadas")
    .update({ estado: "publicando", detalle: null })
    .eq("id", id)
    .in("estado", ["aprobada", "error"])
    .select("*")
    .maybeSingle();
  if (!fila) return { id, estado: "omitida", resultados: {} };

  const imagen = urlImagenPublicacion(fila);
  const resultados: PublicacionProgramada["resultados"] = { ...fila.resultados };
  const errores: string[] = [];
  for (const red of fila.redes as Red[]) {
    if (resultados[red]?.id) continue;
    const configurada = red === "instagram" ? instagramConfigurado() : facebookConfigurado();
    if (!configurada) {
      resultados[red] = { error: "sin_configurar" };
      errores.push(`${red}: sin configurar`);
      continue;
    }
    try {
      const postId = red === "instagram" ? await publicarImagen(imagen, fila.texto) : await publicarFotoFacebook(imagen, fila.texto);
      resultados[red] = { id: postId };
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      console.error(`[redes ${red}]`, detalle);
      resultados[red] = { error: detalle.slice(0, 300) };
      errores.push(`${red}: ${detalle.slice(0, 200)}`);
    }
  }
  const estado = errores.length ? "error" : "publicada";
  await admin
    .from("publicaciones_programadas")
    .update({ estado, resultados, detalle: errores.length ? errores.join(" · ").slice(0, 500) : null, publicado_en: estado === "publicada" ? new Date().toISOString() : null })
    .eq("id", id);
  return { id, estado, resultados };
}

/**
 * Publica todo lo aprobado cuya fecha ya llegó (hasta dos días de atraso, por
 * si se aprobó tarde) y reintenta una vez lo que quedó en error ese mismo día.
 */
export async function publicarVencidas(admin: SupabaseClient<Database>, hoy = fechaBogota()): Promise<ResultadoPublicacion[]> {
  const desde = new Date(Date.parse(`${hoy}T12:00:00Z`) - 2 * 86_400_000).toISOString().slice(0, 10);
  const { data: filas } = await admin
    .from("publicaciones_programadas")
    .select("id, estado, fecha")
    .in("estado", ["aprobada", "error"])
    .gte("fecha", desde)
    .lte("fecha", hoy)
    .order("fecha");
  const resultados: ResultadoPublicacion[] = [];
  for (const f of filas ?? []) {
    // Un error solo se reintenta el mismo día de la publicación.
    if (f.estado === "error" && f.fecha !== hoy) continue;
    resultados.push(await publicarProgramada(admin, f.id));
  }
  return resultados;
}
