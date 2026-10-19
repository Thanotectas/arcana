import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sitio } from "@/lib/correo";

/**
 * TikTok (Login Kit + Content Posting API v2). La administración conecta la
 * cuenta de la marca una vez desde /admin/redes (los permisos duran un año y
 * el token de 24 h se renueva solo) y desde ahí envía cada video:
 *
 * - "borrador" (video.upload): llega a la bandeja de TikTok y se termina de
 *   publicar en la app. Es lo que sirve mientras la app no pasa la auditoría.
 * - "directo" (video.publish): sale publicado con la privacidad que se eligió
 *   en el panel. Sin auditoría, TikTok solo deja publicar en privado.
 *
 * Variables: TIKTOK_CLIENT_KEY y TIKTOK_CLIENT_SECRET (de la app en
 * developers.tiktok.com). Redirect URI registrada: <sitio>/api/tiktok/callback.
 * Los videos se envían como archivo (FILE_UPLOAD), así que no hace falta
 * verificar el dominio de Supabase.
 */
const API = "https://open.tiktokapis.com/v2";
export const SCOPES_TIKTOK = ["user.info.basic", "video.upload", "video.publish"];

export type CuentaTiktok = Database["public"]["Tables"]["tiktok_cuenta"]["Row"];
export type PublicacionTiktok = Database["public"]["Tables"]["publicaciones_tiktok"]["Row"];
type Admin = SupabaseClient<Database>;

export function tiktokConfigurado() {
  return Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET);
}

export function redirectTiktok() {
  return `${sitio()}/api/tiktok/callback`;
}

export function urlAutorizacionTiktok(estado: string) {
  const q = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY ?? "",
    scope: SCOPES_TIKTOK.join(","),
    response_type: "code",
    redirect_uri: redirectTiktok(),
    state: estado,
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${q}`;
}

interface RespuestaToken {
  access_token?: string;
  expires_in?: number;
  open_id?: string;
  refresh_token?: string;
  refresh_expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

async function pedirToken(campos: Record<string, string>): Promise<Required<Pick<RespuestaToken, "access_token" | "expires_in" | "open_id" | "refresh_token">> & RespuestaToken> {
  const res = await fetch(`${API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY ?? "", client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "", ...campos }),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as RespuestaToken;
  if (!res.ok || d.error || !d.access_token || !d.refresh_token || !d.open_id) {
    throw new Error(`TikTok token: ${d.error_description || d.error || res.status}`);
  }
  return d as Required<Pick<RespuestaToken, "access_token" | "expires_in" | "open_id" | "refresh_token">> & RespuestaToken;
}

function enSegundos(s: number | undefined) {
  return s ? new Date(Date.now() + s * 1000).toISOString() : null;
}

/** Llamada a la API v2: devuelve `data` o lanza con el código y el mensaje de TikTok. */
async function api<T>(ruta: string, token: string, cuerpo?: unknown): Promise<T> {
  const res = await fetch(`${API}/${ruta}`, {
    method: cuerpo === undefined ? "GET" : "POST",
    headers: { Authorization: `Bearer ${token}`, ...(cuerpo === undefined ? {} : { "Content-Type": "application/json; charset=UTF-8" }) },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as { data?: T; error?: { code?: string; message?: string } };
  if (!res.ok || (d.error?.code && d.error.code !== "ok")) {
    throw new Error(`TikTok ${ruta.split("?")[0]}: ${d.error?.code ?? res.status}${d.error?.message ? ` · ${d.error.message}` : ""}`);
  }
  return d.data as T;
}

/** Canjea el código del callback, lee el perfil y guarda la cuenta (reemplaza la anterior). */
export async function conectarTiktok(admin: Admin, codigo: string) {
  const t = await pedirToken({ code: codigo, grant_type: "authorization_code", redirect_uri: redirectTiktok() });
  const perfil = await api<{ user?: { display_name?: string; username?: string; avatar_url?: string } }>("user/info/?fields=open_id,display_name,avatar_url,username", t.access_token).catch(() =>
    // username pide user.info.profile; sin él, lo básico.
    api<{ user?: { display_name?: string; avatar_url?: string; username?: string } }>("user/info/?fields=open_id,display_name,avatar_url", t.access_token),
  );
  const fila = {
    id: 1,
    open_id: t.open_id,
    nombre: perfil.user?.display_name ?? null,
    usuario: perfil.user?.username ?? null,
    avatar: perfil.user?.avatar_url ?? null,
    access_token: t.access_token,
    refresh_token: t.refresh_token,
    expira_en: enSegundos(t.expires_in) ?? new Date().toISOString(),
    refresh_expira_en: enSegundos(t.refresh_expires_in),
    scopes: t.scope ?? null,
    conectada_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
  };
  const { error } = await admin.from("tiktok_cuenta").upsert(fila, { onConflict: "id" });
  if (error) throw new Error(`guardar cuenta de TikTok: ${error.message}`);
  return fila;
}

/** La cuenta conectada, sin los tokens (para mostrar en el panel). */
export async function cuentaTiktok(admin: Admin) {
  const { data } = await admin.from("tiktok_cuenta").select("open_id, nombre, usuario, avatar, scopes, expira_en, refresh_expira_en, conectada_en").eq("id", 1).maybeSingle();
  return data;
}

/** Token vigente: si vence en menos de 5 minutos, lo renueva con el refresh token. */
async function tokenVigente(admin: Admin): Promise<string> {
  const { data: c } = await admin.from("tiktok_cuenta").select("*").eq("id", 1).maybeSingle();
  if (!c) throw new Error("TikTok no está conectado: usa «Conectar TikTok» en /admin/redes.");
  if (Date.parse(c.expira_en) - Date.now() > 5 * 60_000) return c.access_token;
  if (c.refresh_expira_en && Date.parse(c.refresh_expira_en) < Date.now()) throw new Error("El permiso de TikTok venció: vuelve a conectar la cuenta.");
  const t = await pedirToken({ grant_type: "refresh_token", refresh_token: c.refresh_token });
  await admin
    .from("tiktok_cuenta")
    .update({ access_token: t.access_token, refresh_token: t.refresh_token, expira_en: enSegundos(t.expires_in) ?? c.expira_en, refresh_expira_en: enSegundos(t.refresh_expires_in) ?? c.refresh_expira_en, scopes: t.scope ?? c.scopes, actualizado_en: new Date().toISOString() })
    .eq("id", 1);
  return t.access_token;
}

/** Revoca el permiso en TikTok (si se puede) y borra la cuenta guardada. */
export async function desconectarTiktok(admin: Admin) {
  const { data: c } = await admin.from("tiktok_cuenta").select("access_token").eq("id", 1).maybeSingle();
  if (c) {
    await fetch(`${API}/oauth/revoke/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_key: process.env.TIKTOK_CLIENT_KEY ?? "", client_secret: process.env.TIKTOK_CLIENT_SECRET ?? "", token: c.access_token }),
      cache: "no-store",
    }).catch(() => null);
  }
  await admin.from("tiktok_cuenta").delete().eq("id", 1);
}

export interface InfoCreador {
  creator_avatar_url?: string;
  creator_username?: string;
  creator_nickname?: string;
  privacy_level_options: string[];
  comment_disabled: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  max_video_post_duration_sec?: number;
}

/** Lo que TikTok permite hoy a esa cuenta (privacidades, interacciones). Se consulta al abrir el formulario y al publicar. */
export async function infoCreador(admin: Admin): Promise<InfoCreador> {
  const d = await api<Partial<InfoCreador>>("post/publish/creator_info/query/", await tokenVigente(admin), {});
  return {
    ...d,
    privacy_level_options: d.privacy_level_options ?? [],
    comment_disabled: Boolean(d.comment_disabled),
    duet_disabled: Boolean(d.duet_disabled),
    stitch_disabled: Boolean(d.stitch_disabled),
  };
}

/** Solo se envían videos de nuestro bucket público de redes (no cualquier URL). */
export function videoPermitido(url: string) {
  const base = `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/redes/`;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && url.startsWith(base) && !url.includes("..") && /\.mp4(\?|$)/i.test(url);
}

export interface OpcionesDirecto {
  titulo: string;
  privacidad: string;
  comentarios: boolean;
  duo: boolean;
  stitch: boolean;
  tuMarca: boolean;
  contenidoDeMarca: boolean;
}

/**
 * Envía un video a TikTok: lo descarga del bucket, abre la subida (en
 * borradores o directa), sube el archivo en un solo trozo (hasta 64 MB) y
 * registra el envío. Devuelve la fila guardada.
 */
export async function enviarVideoTiktok(admin: Admin, video: string, modo: "borrador" | "directo", opciones?: OpcionesDirecto): Promise<PublicacionTiktok> {
  if (!videoPermitido(video)) throw new Error("Ese video no es del almacenamiento de Arcana.");
  const token = await tokenVigente(admin);
  const res = await fetch(video.split("?")[0], { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo leer el video (${res.status}).`);
  const archivo = Buffer.from(await res.arrayBuffer());
  const tamano = archivo.length;
  if (tamano > 64 * 1024 * 1024) throw new Error("El video pesa más de 64 MB.");
  const origen = { source: "FILE_UPLOAD", video_size: tamano, chunk_size: tamano, total_chunk_count: 1 };

  let inicio: { publish_id: string; upload_url: string };
  if (modo === "directo") {
    if (!opciones) throw new Error("Faltan las opciones de publicación.");
    inicio = await api("post/publish/video/init/", token, {
      post_info: {
        title: opciones.titulo,
        privacy_level: opciones.privacidad,
        disable_comment: !opciones.comentarios,
        disable_duet: !opciones.duo,
        disable_stitch: !opciones.stitch,
        brand_organic_toggle: opciones.tuMarca,
        brand_content_toggle: opciones.contenidoDeMarca,
        video_cover_timestamp_ms: 1000,
      },
      source_info: origen,
    });
  } else {
    inicio = await api("post/publish/inbox/video/init/", token, { source_info: origen });
  }

  const { data: fila, error } = await admin
    .from("publicaciones_tiktok")
    .insert({ publish_id: inicio.publish_id, modo, titulo: opciones?.titulo ?? null, video: video.split("?")[0], privacidad: opciones?.privacidad ?? null, estado: "enviando" })
    .select("*")
    .single();
  if (error) throw new Error(`registrar envío: ${error.message}`);

  const subida = await fetch(inicio.upload_url, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(tamano), "Content-Range": `bytes 0-${tamano - 1}/${tamano}` },
    body: new Uint8Array(archivo),
  });
  if (!subida.ok) {
    const detalle = `Subida rechazada por TikTok (${subida.status}).`;
    await admin.from("publicaciones_tiktok").update({ estado: "error", detalle, actualizado_en: new Date().toISOString() }).eq("id", fila.id);
    throw new Error(detalle);
  }
  await admin.from("publicaciones_tiktok").update({ estado: "procesando", actualizado_en: new Date().toISOString() }).eq("id", fila.id);
  return { ...fila, estado: "procesando" };
}

/** Pregunta a TikTok cómo va un envío y actualiza la fila. */
export async function actualizarEstadoTiktok(admin: Admin, p: Pick<PublicacionTiktok, "id" | "publish_id">) {
  if (!p.publish_id) return null;
  const d = await api<{ status?: string; fail_reason?: string; publicaly_available_post_id?: (string | number)[] }>("post/publish/status/fetch/", await tokenVigente(admin), { publish_id: p.publish_id });
  const estado: PublicacionTiktok["estado"] =
    d.status === "PUBLISH_COMPLETE" ? "publicada" : d.status === "SEND_TO_USER_INBOX" ? "en_borradores" : d.status === "FAILED" ? "error" : "procesando";
  const cambios = {
    estado,
    post_id: d.publicaly_available_post_id?.length ? String(d.publicaly_available_post_id[0]) : null,
    detalle: d.fail_reason ? `TikTok: ${d.fail_reason}` : d.status ?? null,
    actualizado_en: new Date().toISOString(),
  };
  await admin.from("publicaciones_tiktok").update(cambios).eq("id", p.id);
  return cambios;
}
