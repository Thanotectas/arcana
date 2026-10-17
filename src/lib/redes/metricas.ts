import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { resolverPagina } from "./pagina";
import { NOMBRE_TIPO, sumarDias, type PublicacionProgramada } from "./calendario";
import { fechaBogota } from "./carta-dia";

/**
 * Rendimiento de las publicaciones en Instagram y Facebook. Un cron diario
 * (`/api/cron/metricas`) toma lo publicado en los últimos 14 días (carta del
 * día y agente de redes), pregunta a Meta sus cifras y las guarda en
 * `metricas_redes`. Sin el permiso de estadísticas se guardan al menos los
 * "me gusta" y los comentarios.
 *
 * Instagram: campos `like_count` y `comments_count` (instagram_basic) y, con
 * instagram_manage_insights, `/insights` con views, reach, saved y shares.
 * Facebook: reacciones, comentarios y compartidos de la publicación
 * (pages_read_engagement).
 */
const API = "https://graph.facebook.com/v25.0";
const DIAS = 14;

type Fila = Database["public"]["Tables"]["metricas_redes"]["Insert"];
type Cifras = Pick<Fila, "vistas" | "alcance" | "me_gusta" | "comentarios" | "guardados" | "compartidos" | "detalle">;

async function consultar<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || datos.error) {
    const e = datos.error;
    throw new Error(`${e?.message ?? res.status}${e?.code ? ` (código ${e.code})` : ""}`);
  }
  return datos;
}

async function cifrasInstagram(mediaId: string, token: string): Promise<Cifras> {
  const base = await consultar<{ like_count?: number; comments_count?: number }>(`${mediaId}?fields=like_count,comments_count`, token);
  const cifras: Cifras = { me_gusta: base.like_count ?? null, comentarios: base.comments_count ?? null };
  // Primero las métricas de 2025 en adelante (views); si Meta no las acepta para ese contenido, las básicas.
  for (const metricas of ["views,reach,saved,shares", "reach,saved,shares"]) {
    try {
      const r = await consultar<{ data?: { name: string; values?: { value?: number }[]; total_value?: { value?: number } }[] }>(`${mediaId}/insights?metric=${metricas}`, token);
      for (const m of r.data ?? []) {
        const v = m.total_value?.value ?? m.values?.[0]?.value ?? null;
        if (m.name === "views") cifras.vistas = v;
        if (m.name === "reach") cifras.alcance = v;
        if (m.name === "saved") cifras.guardados = v;
        if (m.name === "shares") cifras.compartidos = v;
      }
      return cifras;
    } catch (e) {
      const texto = e instanceof Error ? e.message : String(e);
      if (/permission|\(#10\)|\(#200\)|código 10\)|código 200\)/i.test(texto)) {
        cifras.detalle = "Sin permiso de estadísticas (instagram_manage_insights): solo me gusta y comentarios.";
        return cifras;
      }
      cifras.detalle = texto.slice(0, 200);
    }
  }
  return cifras;
}

async function cifrasFacebook(postId: string, token: string): Promise<Cifras> {
  const campos = "reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0)";
  type Respuesta = { reactions?: { summary?: { total_count?: number } }; comments?: { summary?: { total_count?: number } }; shares?: { count?: number } };
  let r: Respuesta;
  try {
    r = await consultar<Respuesta>(`${postId}?fields=${campos},shares`, token);
  } catch {
    // Los videos no tienen el campo shares.
    r = await consultar<Respuesta>(`${postId}?fields=${campos}`, token);
  }
  return { me_gusta: r.reactions?.summary?.total_count ?? null, comentarios: r.comments?.summary?.total_count ?? null, compartidos: r.shares?.count ?? null };
}

function tokenInstagram() {
  return process.env.IG_PAGE_TOKEN ?? process.env.META_PAGE_TOKEN ?? "";
}

function tokenFacebook() {
  return process.env.FB_PAGE_TOKEN ?? process.env.META_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN ?? "";
}

interface Pendiente {
  red: "instagram" | "facebook";
  media_id: string;
  origen: "carta_dia" | "programada" | "carrusel";
  referencia: string;
  fecha: string;
  tipo: string;
  formato: string | null;
}

/** Publicaciones de los últimos 14 días que tienen id en Meta. */
async function publicadas(admin: SupabaseClient<Database>, hoy: string): Promise<Pendiente[]> {
  const desde = sumarDias(hoy, -DIAS);
  const [{ data: cartas }, { data: programadas }] = await Promise.all([
    admin.from("publicaciones_redes").select("red, tipo, fecha, referencia").eq("estado", "publicada").in("tipo", ["carta_dia", "carrusel"]).gte("fecha", desde).not("referencia", "is", null),
    admin.from("publicaciones_programadas").select("id, fecha, tipo, etiqueta, resultados").gte("fecha", desde).in("estado", ["publicada", "error"]),
  ]);
  const lista: Pendiente[] = [];
  for (const c of cartas ?? []) {
    if (!c.referencia || (c.red !== "instagram" && c.red !== "facebook")) continue;
    const carrusel = c.tipo === "carrusel";
    lista.push({ red: c.red, media_id: c.referencia, origen: carrusel ? "carrusel" : "carta_dia", referencia: c.fecha, fecha: c.fecha, tipo: carrusel ? "Carrusel de signos" : "Carta del día", formato: carrusel ? "carrusel" : null });
  }
  for (const p of (programadas ?? []) as Pick<PublicacionProgramada, "id" | "fecha" | "tipo" | "etiqueta" | "resultados">[]) {
    for (const red of ["instagram", "facebook"] as const) {
      const r = p.resultados?.[red];
      if (r?.id) lista.push({ red, media_id: r.id, origen: "programada", referencia: p.id, fecha: p.fecha, tipo: `${NOMBRE_TIPO[p.tipo]} · ${p.etiqueta}`, formato: r.formato ?? null });
    }
  }
  return lista;
}

/** Consulta a Meta las cifras de lo publicado en los últimos 14 días y las guarda. */
export async function actualizarMetricas(admin: SupabaseClient<Database>, hoy = fechaBogota()) {
  const lista = await publicadas(admin, hoy);
  const igToken = tokenInstagram();
  const fb = tokenFacebook() ? await resolverPagina(tokenFacebook()).catch(() => null) : null;
  let actualizadas = 0;
  const errores: string[] = [];
  for (const p of lista) {
    let cifras: Cifras;
    try {
      if (p.red === "instagram") {
        if (!igToken) continue;
        cifras = await cifrasInstagram(p.media_id, igToken);
      } else {
        if (!fb) continue;
        cifras = await cifrasFacebook(p.media_id, fb.token);
      }
    } catch (e) {
      const texto = e instanceof Error ? e.message : String(e);
      errores.push(`${p.red} ${p.media_id}: ${texto.slice(0, 160)}`);
      cifras = { detalle: texto.slice(0, 200) };
    }
    const fila: Fila = {
      ...p,
      vistas: cifras.vistas ?? null,
      alcance: cifras.alcance ?? null,
      me_gusta: cifras.me_gusta ?? null,
      comentarios: cifras.comentarios ?? null,
      guardados: cifras.guardados ?? null,
      compartidos: cifras.compartidos ?? null,
      detalle: cifras.detalle ?? null,
      actualizado_en: new Date().toISOString(),
    };
    const { error } = await admin.from("metricas_redes").upsert(fila, { onConflict: "red,media_id" });
    if (error) errores.push(`guardar ${p.red} ${p.media_id}: ${error.message}`);
    else actualizadas++;
  }
  return { revisadas: lista.length, actualizadas, errores };
}

export type MetricaRed = Database["public"]["Tables"]["metricas_redes"]["Row"];

/** Interacciones de una publicación: me gusta + comentarios + guardados + compartidos. */
export function interacciones(m: Pick<MetricaRed, "me_gusta" | "comentarios" | "guardados" | "compartidos">) {
  return (m.me_gusta ?? 0) + (m.comentarios ?? 0) + (m.guardados ?? 0) + (m.compartidos ?? 0);
}

export interface PromedioTipo {
  tipo: string;
  publicaciones: number;
  vistas: number | null;
  interacciones: number;
}

/**
 * Promedio por tipo de publicación (el rótulo antes del "·": Carta del día,
 * Una lectura, Guía gratis, Signo de la semana…), del mejor al peor.
 */
export function promediosPorTipo(filas: MetricaRed[]): PromedioTipo[] {
  const grupos = new Map<string, MetricaRed[]>();
  for (const f of filas) {
    const clave = f.tipo.split(" · ")[0];
    grupos.set(clave, [...(grupos.get(clave) ?? []), f]);
  }
  return [...grupos.entries()]
    .map(([tipo, lista]) => {
      const conVistas = lista.filter((x) => x.vistas != null);
      return {
        tipo,
        publicaciones: lista.length,
        vistas: conVistas.length ? Math.round(conVistas.reduce((s, x) => s + (x.vistas ?? 0), 0) / conVistas.length) : null,
        interacciones: Math.round((lista.reduce((s, x) => s + interacciones(x), 0) / lista.length) * 10) / 10,
      };
    })
    .sort((a, b) => b.interacciones - a.interacciones || (b.vistas ?? 0) - (a.vistas ?? 0));
}
