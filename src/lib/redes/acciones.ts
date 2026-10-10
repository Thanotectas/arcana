"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { generarSemana, lunesDe, sumarDias } from "./calendario";
import { publicarProgramada } from "./publicar";
import { fechaBogota } from "./carta-dia";
import { reelCartaDelDia } from "./reel";

export interface EstadoAdminRedes {
  error?: string;
  mensaje?: string;
}

const UUID = /^[0-9a-f-]{36}$/i;

function texto(formData: FormData, campo: string, max: number) {
  return String(formData.get(campo) ?? "").trim().slice(0, max);
}

/** Guardar, aprobar, descartar, devolver a borrador o publicar ahora una publicación. */
export async function accionPublicacion(_prev: EstadoAdminRedes, formData: FormData): Promise<EstadoAdminRedes> {
  await requerirAdmin();
  const id = texto(formData, "id", 36);
  const accion = texto(formData, "accion", 20);
  if (!UUID.test(id)) return { error: "Publicación no válida." };
  const admin = getSupabaseAdmin();

  if (accion === "guardar" || accion === "aprobar") {
    const titulo = texto(formData, "titulo", 70);
    const extracto = texto(formData, "extracto", 200);
    const cuerpo = String(formData.get("texto") ?? "").trim().slice(0, 2200);
    const redes = ["instagram", "facebook"].filter((r) => formData.get(`red_${r}`) === "on");
    if (!titulo || !extracto || !cuerpo) return { error: "Faltan el título, la frase o el texto." };
    if (!redes.length) return { error: "Elige al menos una red." };
    const { error } = await admin
      .from("publicaciones_programadas")
      .update({ titulo, extracto, texto: cuerpo, redes, estado: accion === "aprobar" ? "aprobada" : "borrador", actualizado_en: new Date().toISOString(), detalle: null })
      .eq("id", id)
      .in("estado", ["borrador", "aprobada", "error"]);
    if (error) return { error: error.message };
    revalidatePath("/admin/redes");
    return { mensaje: accion === "aprobar" ? "Aprobada: saldrá el día indicado a mediodía." : "Guardada." };
  }

  if (accion === "descartar" || accion === "borrador") {
    const { error } = await admin
      .from("publicaciones_programadas")
      .update({ estado: accion === "descartar" ? "descartada" : "borrador", actualizado_en: new Date().toISOString() })
      .eq("id", id)
      .in("estado", ["borrador", "aprobada", "error"]);
    if (error) return { error: error.message };
    revalidatePath("/admin/redes");
    return { mensaje: accion === "descartar" ? "Descartada." : "Vuelve a borrador." };
  }

  if (accion === "publicar") {
    const r = await publicarProgramada(admin, id);
    revalidatePath("/admin/redes");
    if (r.estado === "omitida") return { error: "Solo se publica lo aprobado (o lo que falló)." };
    if (r.estado === "error") return { error: "Falló en alguna red; revisa el detalle." };
    return { mensaje: "Publicada." };
  }

  return { error: "Acción desconocida." };
}

/** Genera los borradores de esta semana o de la próxima (Sibila redacta; tarda medio minuto). */
export async function accionGenerarSemana(_prev: EstadoAdminRedes, formData: FormData): Promise<EstadoAdminRedes> {
  await requerirAdmin();
  const cual = texto(formData, "semana", 10);
  const hoy = fechaBogota();
  const lunes = cual === "proxima" ? sumarDias(lunesDe(hoy), 7) : lunesDe(hoy);
  try {
    const r = await generarSemana(getSupabaseAdmin(), lunes, hoy);
    revalidatePath("/admin/redes");
    return r.creadas ? { mensaje: `${r.creadas} borradores nuevos para la semana del ${lunes}.` } : { mensaje: "Esa semana ya tiene sus publicaciones." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar." };
  }
}

export interface EstadoReel {
  error?: string;
  url?: string;
}

/** Genera (o reutiliza) el reel de la carta del día de hoy para verlo antes de que salga. */
export async function accionVistaReel(_prev: EstadoReel, formData: FormData): Promise<EstadoReel> {
  await requerirAdmin();
  try {
    const url = await reelCartaDelDia(getSupabaseAdmin(), fechaBogota(), { regenerar: formData.get("regenerar") === "1" });
    return { url: `${url}?v=${Date.now()}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo generar el reel." };
  }
}
