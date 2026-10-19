import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { fechaBogota, cartaDelDia } from "./carta-dia";
import { BUCKET, reelCartaDelDia } from "./reel";
import { reelPublicacion } from "./reel-publicacion";
import { textoCarta, textoPublicacion } from "./kit-tiktok";
import type { PublicacionProgramada } from "./calendario";

const UUID = /^[0-9a-f-]{36}$/i;

export interface VideoElegido {
  video: string;
  titulo: string;
  texto: string;
}

/**
 * El video que se eligió en el panel para TikTok o YouTube: "carta" (reel de
 * hoy), "pub:<id>" (reel de una publicación del agente) o "subida:<ruta>" (un
 * MP4 propio subido al bucket). Lanza con un mensaje para mostrar si no sirve.
 */
export async function videoDeFuente(admin: SupabaseClient<Database>, fuente: string): Promise<VideoElegido> {
  if (fuente === "carta") {
    const hoy = fechaBogota();
    return { video: await reelCartaDelDia(admin, hoy), titulo: `Carta del día: ${cartaDelDia(hoy).nombre} ✨`, texto: textoCarta(hoy) };
  }
  if (fuente.startsWith("pub:")) {
    const id = fuente.slice(4);
    if (!UUID.test(id)) throw new Error("Publicación no válida.");
    const { data: fila } = await admin.from("publicaciones_programadas").select("*").eq("id", id).maybeSingle();
    if (!fila) throw new Error("Publicación no encontrada.");
    const p = fila as PublicacionProgramada;
    return { video: await reelPublicacion(admin, p), titulo: `${p.titulo} ✨`, texto: textoPublicacion(p) };
  }
  if (fuente.startsWith("subida:")) {
    const ruta = fuente.slice(7);
    if (!/^tiktok\/subidas\/[0-9a-f-]{36}\.mp4$/i.test(ruta)) throw new Error("Video no válido.");
    return { video: admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl, titulo: "", texto: "" };
  }
  throw new Error("Elige un video.");
}
