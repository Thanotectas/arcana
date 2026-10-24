"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { videoDeFuente, type VideoElegido } from "./fuentes-video";
import { videoPermitido } from "./tiktok";
import { instagramConfigurado, publicarReel } from "./instagram";
import { facebookConfigurado, publicarVideoFacebook } from "./facebook";

export interface EstadoPrepararReel extends Partial<VideoElegido> {
  error?: string;
}

/** Deja listo el video elegido en el panel (un reel del panel o un MP4 propio) para Instagram y Facebook. */
export async function accionPrepararReel(_prev: EstadoPrepararReel, formData: FormData): Promise<EstadoPrepararReel> {
  await requerirAdmin();
  try {
    return await videoDeFuente(getSupabaseAdmin(), String(formData.get("fuente") ?? ""));
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo preparar el video." };
  }
}

export interface EstadoReelMeta {
  error?: string;
  resultados?: { red: string; ok: boolean; detalle: string }[];
}

/**
 * Publica el video como reel en Instagram y como video en la página de
 * Facebook, en las redes marcadas. Una red que falla no detiene a la otra.
 */
export async function accionPublicarReel(_prev: EstadoReelMeta, formData: FormData): Promise<EstadoReelMeta> {
  await requerirAdmin();
  const video = String(formData.get("video") ?? "");
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 2200);
  const redes = formData.getAll("redes").map(String);
  if (!videoPermitido(video)) return { error: "Ese video no es del almacenamiento de Arcana." };
  if (!texto) return { error: "Escribe el texto de la publicación." };
  if (!redes.length) return { error: "Marca Instagram, Facebook o ambas." };

  const resultados: NonNullable<EstadoReelMeta["resultados"]> = [];
  // Facebook primero: responde al instante; Instagram procesa el reel uno o dos minutos.
  if (redes.includes("facebook")) {
    if (!facebookConfigurado()) resultados.push({ red: "Facebook", ok: false, detalle: "sin configurar" });
    else {
      try {
        resultados.push({ red: "Facebook", ok: true, detalle: `publicado (id ${await publicarVideoFacebook(video, texto)})` });
      } catch (e) {
        resultados.push({ red: "Facebook", ok: false, detalle: e instanceof Error ? e.message : String(e) });
      }
    }
  }
  if (redes.includes("instagram")) {
    if (!instagramConfigurado()) resultados.push({ red: "Instagram", ok: false, detalle: "sin configurar" });
    else {
      try {
        resultados.push({ red: "Instagram", ok: true, detalle: `reel publicado (id ${await publicarReel(video, texto)})` });
      } catch (e) {
        resultados.push({ red: "Instagram", ok: false, detalle: e instanceof Error ? e.message : String(e) });
      }
    }
  }
  return { resultados };
}
