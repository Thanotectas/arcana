"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { videoDeFuente } from "./fuentes-video";
import { videoPermitido } from "./tiktok";
import { desconectarYoutube, subirDesdePanel, type PrivacidadYoutube } from "./youtube";
import { shortDelDia } from "./automaticas";

export interface EstadoPrepararYoutube {
  error?: string;
  video?: string;
  titulo?: string;
  texto?: string;
}

/** Deja listo el video elegido en el panel con un título y una descripción sugeridos. */
export async function accionPrepararYoutube(_prev: EstadoPrepararYoutube, formData: FormData): Promise<EstadoPrepararYoutube> {
  await requerirAdmin();
  try {
    return await videoDeFuente(getSupabaseAdmin(), String(formData.get("fuente") ?? ""));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo preparar el video." };
  }
}

export interface EstadoYoutube {
  error?: string;
  mensaje?: string;
}

const PRIVACIDADES: PrivacidadYoutube[] = ["public", "unlisted", "private"];

/** Sube el video a YouTube como Short con el título, la descripción y la privacidad del formulario. */
export async function accionSubirYoutube(_prev: EstadoYoutube, formData: FormData): Promise<EstadoYoutube> {
  await requerirAdmin();
  const video = String(formData.get("video") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const privacidad = String(formData.get("privacidad") ?? "") as PrivacidadYoutube;
  if (!videoPermitido(video)) return { error: "Ese video no es del almacenamiento de Arcana." };
  if (!titulo) return { error: "Escribe un título." };
  if (!PRIVACIDADES.includes(privacidad)) return { error: "Elige la privacidad." };
  try {
    const id = await subirDesdePanel(getSupabaseAdmin(), video, { titulo, descripcion, privacidad });
    revalidatePath("/admin/redes");
    return { mensaje: `Subido: youtube.com/shorts/${id}. YouTube tarda unos minutos en procesarlo.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir a YouTube." };
  }
}

/** Sube ya el Short de la carta del día (si ya se subió, no lo repite). */
export async function accionShortDelDia(): Promise<EstadoYoutube> {
  await requerirAdmin();
  try {
    const r = await shortDelDia(getSupabaseAdmin());
    revalidatePath("/admin/redes");
    if ("apagado" in r) return { error: "El Short diario está apagado (REDES_YOUTUBE=0)." };
    if ("error" in r.youtube) return { error: r.youtube.error };
    if ("omitida" in r.youtube) return { mensaje: r.youtube.omitida === "sin_configurar" ? "YouTube no está conectado." : "El Short de hoy ya estaba subido." };
    return { mensaje: `Short de hoy subido: youtube.com/shorts/${r.youtube.publicada}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo subir el Short." };
  }
}

export async function accionDesconectarYoutube(): Promise<EstadoYoutube> {
  await requerirAdmin();
  await desconectarYoutube(getSupabaseAdmin());
  revalidatePath("/admin/redes");
  return { mensaje: "YouTube desconectado." };
}
