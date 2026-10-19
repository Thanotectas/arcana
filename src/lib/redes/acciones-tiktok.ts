"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { fechaBogota } from "./carta-dia";
import { BUCKET, asegurarBucket, reelCartaDelDia } from "./reel";
import { reelPublicacion } from "./reel-publicacion";
import { textoCarta, textoPublicacion } from "./kit-tiktok";
import { actualizarEstadoTiktok, desconectarTiktok, enviarVideoTiktok, infoCreador, videoPermitido, type InfoCreador } from "./tiktok";
import type { PublicacionProgramada } from "./calendario";

const UUID = /^[0-9a-f-]{36}$/i;

export interface EstadoPrepararTiktok {
  error?: string;
  video?: string;
  texto?: string;
  creador?: InfoCreador;
}

/**
 * Abre el formulario de TikTok: deja listo el video (carta del día, una
 * publicación del agente o un video subido) con su texto y consulta a TikTok
 * qué permite hoy la cuenta (privacidades, comentarios, dúo, stitch).
 */
export async function accionPrepararTiktok(_prev: EstadoPrepararTiktok, formData: FormData): Promise<EstadoPrepararTiktok> {
  await requerirAdmin();
  const fuente = String(formData.get("fuente") ?? "");
  const admin = getSupabaseAdmin();
  try {
    let video: string;
    let texto = "";
    if (fuente === "carta") {
      const hoy = fechaBogota();
      video = await reelCartaDelDia(admin, hoy);
      texto = textoCarta(hoy);
    } else if (fuente.startsWith("pub:")) {
      const id = fuente.slice(4);
      if (!UUID.test(id)) return { error: "Publicación no válida." };
      const { data: fila } = await admin.from("publicaciones_programadas").select("*").eq("id", id).maybeSingle();
      if (!fila) return { error: "Publicación no encontrada." };
      video = await reelPublicacion(admin, fila as PublicacionProgramada);
      texto = textoPublicacion(fila as PublicacionProgramada);
    } else if (fuente.startsWith("subida:")) {
      const ruta = fuente.slice(7);
      if (!/^tiktok\/subidas\/[0-9a-f-]{36}\.mp4$/i.test(ruta)) return { error: "Video no válido." };
      video = admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
    } else {
      return { error: "Elige un video." };
    }
    const creador = await infoCreador(admin);
    return { video, texto, creador };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo preparar el video." };
  }
}

/** Permiso para que el navegador suba un video propio (MP4, hasta 50 MB) directo al almacenamiento. */
export async function accionSubidaTiktok(): Promise<{ ruta?: string; token?: string; error?: string }> {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  try {
    await asegurarBucket(admin);
    const ruta = `tiktok/subidas/${randomUUID()}.mp4`;
    const { data, error } = await admin.storage.from(BUCKET).createSignedUploadUrl(ruta);
    if (error || !data) return { error: error?.message ?? "No se pudo preparar la subida." };
    return { ruta, token: data.token };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo preparar la subida." };
  }
}

export interface EstadoEnvioTiktok {
  error?: string;
  mensaje?: string;
}

/**
 * Envía el video a TikTok. "borrador" lo deja en la bandeja de la app;
 * "directo" lo publica con lo que se eligió en el formulario, que se vuelve
 * a validar contra lo que TikTok permite a la cuenta en este momento.
 */
export async function accionEnviarTiktok(_prev: EstadoEnvioTiktok, formData: FormData): Promise<EstadoEnvioTiktok> {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const modo = formData.get("modo") === "directo" ? "directo" : "borrador";
  const video = String(formData.get("video") ?? "");
  if (!videoPermitido(video)) return { error: "Ese video no es del almacenamiento de Arcana." };
  try {
    if (modo === "borrador") {
      await enviarVideoTiktok(admin, video, "borrador");
      revalidatePath("/admin/redes");
      return { mensaje: "Enviado a tus borradores: abre TikTok, toca la notificación (o Perfil → Bandeja) y termina de publicarlo. Puede tardar un par de minutos en llegar." };
    }
    const creador = await infoCreador(admin);
    const titulo = String(formData.get("titulo") ?? "").trim().slice(0, 2200);
    const privacidad = String(formData.get("privacidad") ?? "");
    const divulgar = formData.get("divulgar") === "on";
    const tuMarca = divulgar && formData.get("tu_marca") === "on";
    const contenidoDeMarca = divulgar && formData.get("de_marca") === "on";
    if (!creador.privacy_level_options.includes(privacidad)) return { error: "Elige quién puede ver el video." };
    if (divulgar && !tuMarca && !contenidoDeMarca) return { error: "Si divulgas contenido comercial, elige «Tu marca», «Contenido de marca» o ambos." };
    if (contenidoDeMarca && privacidad === "SELF_ONLY") return { error: "El contenido de marca no puede ser privado (Solo yo)." };
    await enviarVideoTiktok(admin, video, "directo", {
      titulo,
      privacidad,
      comentarios: !creador.comment_disabled && formData.get("comentarios") === "on",
      duo: !creador.duet_disabled && formData.get("duo") === "on",
      stitch: !creador.stitch_disabled && formData.get("stitch") === "on",
      tuMarca,
      contenidoDeMarca,
    });
    revalidatePath("/admin/redes");
    return { mensaje: "Enviado. TikTok tarda unos minutos en procesar el video antes de que aparezca en tu perfil; el estado se actualiza abajo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo enviar a TikTok." };
  }
}

/** Pregunta a TikTok por los envíos que siguen en proceso. */
export async function accionEstadosTiktok(): Promise<EstadoEnvioTiktok> {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const desde = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await admin.from("publicaciones_tiktok").select("id, publish_id").in("estado", ["enviando", "procesando"]).gte("creado_en", desde).limit(20);
  const errores: string[] = [];
  for (const p of data ?? []) {
    try {
      await actualizarEstadoTiktok(admin, p);
    } catch (e) {
      errores.push(e instanceof Error ? e.message : String(e));
    }
  }
  revalidatePath("/admin/redes");
  if (errores.length) return { error: errores.slice(0, 2).join(" · ") };
  return { mensaje: data?.length ? `${data.length} envío${data.length === 1 ? "" : "s"} revisado${data.length === 1 ? "" : "s"}.` : "No hay envíos en proceso." };
}

export async function accionDesconectarTiktok(): Promise<EstadoEnvioTiktok> {
  await requerirAdmin();
  await desconectarTiktok(getSupabaseAdmin());
  revalidatePath("/admin/redes");
  return { mensaje: "TikTok desconectado." };
}
