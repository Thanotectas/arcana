import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { sitio } from "@/lib/correo";
import { videoPermitido } from "./tiktok";

/**
 * YouTube Shorts (YouTube Data API v3). La administración conecta el canal
 * una vez desde /admin/redes (OAuth de Google con acceso sin conexión: el
 * permiso se guarda y el acceso de una hora se renueva solo). Los reels
 * verticales de menos de 3 minutos YouTube los muestra como Shorts.
 *
 * Variables: YOUTUBE_CLIENT_ID y YOUTUBE_CLIENT_SECRET (Google Cloud, cliente
 * OAuth "Aplicación web" con la URI <sitio>/api/youtube/callback).
 * YOUTUBE_PRIVACIDAD (public | unlisted | private, por defecto public) para el
 * Short diario. Mientras Google no audite el proyecto, todo lo subido por API
 * queda privado aunque se pida público.
 *
 * Cupo: subir un video cuesta 1.600 de las 10.000 unidades diarias del
 * proyecto, unas 6 subidas al día.
 */
// youtube.force-ssl: leer y responder comentarios (Sibila). Los canales conectados antes de noviembre de 2026 no lo
// tienen: hay que volver a conectar YouTube en /admin/redes.
const ALCANCE_COMENTARIOS = "https://www.googleapis.com/auth/youtube.force-ssl";
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly", ALCANCE_COMENTARIOS];

type Admin = SupabaseClient<Database>;
export type PublicacionYoutube = Database["public"]["Tables"]["publicaciones_youtube"]["Row"];
export type PrivacidadYoutube = PublicacionYoutube["privacidad"];

const clienteId = () => (process.env.YOUTUBE_CLIENT_ID ?? "").trim();
const secreto = () => (process.env.YOUTUBE_CLIENT_SECRET ?? "").trim();

export function youtubeConfigurado() {
  return Boolean(clienteId() && secreto());
}

export function redirectYoutube() {
  return `${sitio()}/api/youtube/callback`;
}

export function privacidadYoutube(): PrivacidadYoutube {
  const p = (process.env.YOUTUBE_PRIVACIDAD ?? "").trim();
  return p === "unlisted" || p === "private" ? p : "public";
}

export function urlAutorizacionYoutube(estado: string) {
  const q = new URLSearchParams({
    client_id: clienteId(),
    redirect_uri: redirectYoutube(),
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    // Sin prompt=consent Google no vuelve a entregar el refresh token al reconectar.
    prompt: "consent",
    include_granted_scopes: "true",
    state: estado,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
}

interface RespuestaToken {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

async function pedirToken(campos: Record<string, string>): Promise<RespuestaToken & { access_token: string }> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clienteId(), client_secret: secreto(), ...campos }),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as RespuestaToken;
  if (!res.ok || !d.access_token) {
    if (d.error === "invalid_grant") throw new Error("Google retiró el permiso del canal: vuelve a conectar YouTube en /admin/redes.");
    throw new Error(`Google token: ${d.error_description || d.error || res.status}`);
  }
  return d as RespuestaToken & { access_token: string };
}

const vence = (s?: number) => new Date(Date.now() + (s ?? 3600) * 1000).toISOString();

async function api<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const d = (await res.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!res.ok || d.error) throw new Error(`YouTube ${ruta.split("?")[0]}: ${d.error?.message ?? res.status}`);
  return d;
}

/** Canjea el código del callback, lee el canal y guarda la cuenta (reemplaza la anterior). */
export async function conectarYoutube(admin: Admin, codigo: string) {
  const t = await pedirToken({ code: codigo, grant_type: "authorization_code", redirect_uri: redirectYoutube() });
  if (!t.refresh_token) throw new Error("Google no entregó el permiso sin conexión; vuelve a intentarlo.");
  type Canales = { items?: { id: string; snippet?: { title?: string; customUrl?: string; thumbnails?: { default?: { url?: string } } } }[] };
  const canales = await api<Canales>("channels?part=snippet&mine=true", t.access_token);
  const canal = canales.items?.[0];
  if (!canal) throw new Error("Esa cuenta de Google no tiene canal de YouTube: créalo primero en youtube.com.");
  const fila = {
    id: 1,
    canal_id: canal.id,
    nombre: canal.snippet?.title ?? null,
    usuario: canal.snippet?.customUrl ?? null,
    avatar: canal.snippet?.thumbnails?.default?.url ?? null,
    refresh_token: t.refresh_token,
    access_token: t.access_token,
    expira_en: vence(t.expires_in),
    conectada_en: new Date().toISOString(),
    actualizado_en: new Date().toISOString(),
    scopes: t.scope ?? SCOPES.join(" "),
  };
  const { error } = await admin.from("youtube_cuenta").upsert(fila, { onConflict: "id" });
  if (error) throw new Error(`guardar canal de YouTube: ${error.message}`);
  return fila;
}

/** El canal conectado, sin los tokens (para el panel). */
export async function cuentaYoutube(admin: Admin) {
  const { data } = await admin.from("youtube_cuenta").select("canal_id, nombre, usuario, avatar, conectada_en, scopes, comentarios_revisados_en").eq("id", 1).maybeSingle();
  return data && { ...data, comentarios: Boolean(data.scopes?.includes(ALCANCE_COMENTARIOS)) };
}

/** Acceso vigente al canal (lo renueva si vence en menos de 5 minutos). */
export async function tokenVigente(admin: Admin): Promise<string> {
  const { data: c } = await admin.from("youtube_cuenta").select("*").eq("id", 1).maybeSingle();
  if (!c) throw new Error("YouTube no está conectado: usa «Conectar YouTube» en /admin/redes.");
  if (c.access_token && c.expira_en && Date.parse(c.expira_en) - Date.now() > 5 * 60_000) return c.access_token;
  const t = await pedirToken({ grant_type: "refresh_token", refresh_token: c.refresh_token });
  await admin
    .from("youtube_cuenta")
    .update({ access_token: t.access_token, expira_en: vence(t.expires_in), ...(t.refresh_token ? { refresh_token: t.refresh_token } : {}), actualizado_en: new Date().toISOString() })
    .eq("id", 1);
  return t.access_token;
}

export async function desconectarYoutube(admin: Admin) {
  const { data: c } = await admin.from("youtube_cuenta").select("refresh_token").eq("id", 1).maybeSingle();
  if (c) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(c.refresh_token)}`, { method: "POST", cache: "no-store" }).catch(() => null);
  }
  await admin.from("youtube_cuenta").delete().eq("id", 1);
}

export async function youtubeConectado(admin: Admin) {
  if (!youtubeConfigurado()) return false;
  const { data } = await admin.from("youtube_cuenta").select("id").eq("id", 1).maybeSingle();
  return Boolean(data);
}

export interface DatosShort {
  titulo: string;
  descripcion: string;
  privacidad: PrivacidadYoutube;
}

/** YouTube no acepta < ni > en título ni descripción; el título va hasta 100 caracteres. */
function limpiar(texto: string, max: number) {
  return texto.replace(/[<>]/g, "").trim().slice(0, max);
}

/**
 * Sube un video del bucket de redes como Short (subida reanudable en un solo
 * envío) y devuelve el id del video en YouTube.
 */
export async function subirShort(admin: Admin, video: string, datos: DatosShort): Promise<string> {
  if (!videoPermitido(video)) throw new Error("Ese video no es del almacenamiento de Arcana.");
  const token = await tokenVigente(admin);
  const res = await fetch(video.split("?")[0], { cache: "no-store" });
  if (!res.ok) throw new Error(`No se pudo leer el video (${res.status}).`);
  const archivo = Buffer.from(await res.arrayBuffer());
  const descripcion = datos.descripcion.includes("#Shorts") ? datos.descripcion : `${datos.descripcion}\n\n#Shorts`;
  const metadatos = (sintetico: boolean) => ({
    snippet: {
      title: limpiar(datos.titulo, 100) || "Arcana",
      description: limpiar(descripcion, 5000),
      categoryId: "24",
      defaultLanguage: "es",
      defaultAudioLanguage: "es",
      tags: ["tarot", "astrologia", "carta del dia", "horoscopo", "Arcana"],
    },
    status: {
      privacyStatus: datos.privacidad,
      selfDeclaredMadeForKids: false,
      // La voz y las imágenes se generan con IA: se declara.
      ...(sintetico ? { containsSyntheticMedia: true } : {}),
    },
  });
  const iniciar = (sintetico: boolean) =>
    fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(archivo.length),
        "X-Upload-Content-Type": "video/mp4",
      },
      body: JSON.stringify(metadatos(sintetico)),
      cache: "no-store",
    });
  let inicio = await iniciar(true);
  if (inicio.status === 400) {
    const detalle = await inicio.text().catch(() => "");
    // Por si la API no reconoce el campo de contenido sintético.
    if (/containsSyntheticMedia/i.test(detalle)) inicio = await iniciar(false);
    else throw new Error(`YouTube: ${detalle.slice(0, 300)}`);
  }
  const destino = inicio.headers.get("location");
  if (!inicio.ok || !destino) {
    const detalle = await inicio.text().catch(() => "");
    throw new Error(`YouTube (${inicio.status}): ${detalle.slice(0, 300)}`);
  }
  const subida = await fetch(destino, { method: "PUT", headers: { "Content-Type": "video/mp4", "Content-Length": String(archivo.length) }, body: new Uint8Array(archivo) });
  const resultado = (await subida.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!subida.ok || !resultado.id) throw new Error(`YouTube subida (${subida.status}): ${resultado.error?.message ?? "sin id"}`);
  return resultado.id;
}

/** Sube un video desde el panel y lo registra en publicaciones_youtube. */
export async function subirDesdePanel(admin: Admin, video: string, datos: DatosShort) {
  const { data: fila, error } = await admin.from("publicaciones_youtube").insert({ titulo: datos.titulo.slice(0, 100), video: video.split("?")[0], privacidad: datos.privacidad }).select("id").single();
  if (error) throw new Error(`registrar subida: ${error.message}`);
  try {
    const id = await subirShort(admin, video, datos);
    await admin.from("publicaciones_youtube").update({ estado: "subido", video_id: id }).eq("id", fila.id);
    return id;
  } catch (e) {
    const detalle = e instanceof Error ? e.message : String(e);
    await admin.from("publicaciones_youtube").update({ estado: "error", detalle: detalle.slice(0, 500) }).eq("id", fila.id);
    throw e;
  }
}

// ——— Comentarios (Sibila responde en YouTube) ———

/** ¿El canal se conectó con el permiso de comentarios? */
export async function permisoComentariosYoutube(admin: Admin) {
  const { data } = await admin.from("youtube_cuenta").select("scopes").eq("id", 1).maybeSingle();
  return Boolean(data?.scopes?.includes(ALCANCE_COMENTARIOS));
}

const textosVideo = new Map<string, { texto: string; hasta: number }>();

/** Título y descripción de un video (para saber si es un reel de abjad o del Yıldızname). Una hora en memoria. */
export async function textoDeVideo(admin: Admin, videoId: string): Promise<string> {
  const guardado = textosVideo.get(videoId);
  if (guardado && guardado.hasta > Date.now()) return guardado.texto;
  const token = await tokenVigente(admin);
  type Videos = { items?: { snippet?: { title?: string; description?: string } }[] };
  const v = await api<Videos>(`videos?part=snippet&id=${encodeURIComponent(videoId)}`, token);
  const s = v.items?.[0]?.snippet;
  const texto = `${s?.title ?? ""}\n${s?.description ?? ""}`.trim();
  textosVideo.set(videoId, { texto, hasta: Date.now() + 3_600_000 });
  return texto;
}

export interface ComentarioYoutube {
  id: string;
  videoId: string;
  autorId: string;
  autor: string | null;
  texto: string;
  publicado: string;
}

/**
 * Comentarios principales recientes en los videos del canal que el canal aún no respondió (una consulta: 1 unidad
 * del cupo). Se dejan fuera los del propio canal y los que ya tienen una respuesta del canal en el hilo.
 */
export async function comentariosSinResponder(admin: Admin, horas = 72): Promise<ComentarioYoutube[]> {
  const token = await tokenVigente(admin);
  const { data: c } = await admin.from("youtube_cuenta").select("canal_id").eq("id", 1).maybeSingle();
  if (!c) return [];
  type Hilo = {
    snippet?: {
      videoId?: string;
      topLevelComment?: { id: string; snippet?: { textOriginal?: string; authorDisplayName?: string; authorChannelId?: { value?: string }; publishedAt?: string } };
    };
    replies?: { comments?: { snippet?: { authorChannelId?: { value?: string } } }[] };
  };
  const r = await api<{ items?: Hilo[] }>(`commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${c.canal_id}&order=time&maxResults=50&textFormat=plainText`, token);
  const desde = Date.now() - horas * 3_600_000;
  const lista: ComentarioYoutube[] = [];
  for (const h of r.items ?? []) {
    const top = h.snippet?.topLevelComment;
    const s = top?.snippet;
    const autorId = s?.authorChannelId?.value ?? "";
    if (!top || !s?.textOriginal || !h.snippet?.videoId || !autorId || autorId === c.canal_id) continue;
    if (Date.parse(s.publishedAt ?? "") < desde) continue;
    if ((h.replies?.comments ?? []).some((x) => x.snippet?.authorChannelId?.value === c.canal_id)) continue;
    lista.push({ id: top.id, videoId: h.snippet.videoId, autorId, autor: s.authorDisplayName?.replace(/^@/, "") ?? null, texto: s.textOriginal, publicado: s.publishedAt ?? "" });
  }
  return lista.reverse();
}

/** Responde un comentario como el canal (50 unidades del cupo). Devuelve el id de la respuesta. */
export async function responderComentarioYoutube(admin: Admin, comentarioId: string, texto: string): Promise<string> {
  const token = await tokenVigente(admin);
  const res = await fetch("https://www.googleapis.com/youtube/v3/comments?part=snippet", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
    body: JSON.stringify({ snippet: { parentId: comentarioId, textOriginal: texto.slice(0, 9000) } }),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as { id?: string; error?: { message?: string } };
  if (!res.ok || !d.id) throw new Error(`YouTube responder (${res.status}): ${d.error?.message ?? "sin id"}`);
  return d.id;
}

/** Marca la revisión de comentarios si pasaron al menos `minutos` desde la anterior (una sola ejecución a la vez). */
export async function turnoComentariosYoutube(admin: Admin, minutos: number): Promise<boolean> {
  const limite = new Date(Date.now() - minutos * 60_000).toISOString();
  const { data } = await admin
    .from("youtube_cuenta")
    .update({ comentarios_revisados_en: new Date().toISOString() })
    .eq("id", 1)
    .or(`comentarios_revisados_en.is.null,comentarios_revisados_en.lt.${limite}`)
    .select("id");
  return Boolean(data?.length);
}
