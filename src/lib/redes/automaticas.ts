import { publicaIdiomaEn } from "@/lib/redes/idioma-red";
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { instagramConfigurado, publicarCarrusel, publicarHistoria, publicarImagen } from "./instagram";
import { facebookConfigurado, publicarFotoFacebook, publicarHistoriaFacebook, publicarVariasFotosFacebook } from "./facebook";
import { MAX_INTENTOS, cartaDelJuego, numeroDeJuego } from "@/lib/juego/carta-escondida";
import { publicarUnaVez, type Resultado } from "./reservas";
import { contenidoGuardado, redactarCarrusel, semanaDelCarrusel, urlsLaminas } from "./carrusel";
import { enviarKitTiktok, piezasDelDia } from "./kit-tiktok";
import { enviarKitCanal, piezasCanal } from "./kit-canal";
import { cartaDelDia, fechaBogota } from "./carta-dia";
import { reelCartaDelDia } from "./reel";
import { textoShortPublicacion, textoShortYoutube } from "./carta-dia";
import { reelPublicacion } from "./reel-publicacion";
import type { PublicacionProgramada } from "./calendario";
import { enviarABorradores, refrescarEstadosTiktok, tiktokListo } from "./tiktok";
import { privacidadYoutube, subirShort, youtubeConectado } from "./youtube";

/**
 * Publicaciones automáticas que no pasan por aprobación (contenido acotado):
 * historia diaria de la carta del día, carrusel semanal de signos y kit de
 * TikTok por correo y Short diario en YouTube. Cada una se registra en
 * `publicaciones_redes` para no repetirse. Variables para apagarlas:
 * REDES_HISTORIA=0, REDES_CARRUSEL=0, REDES_KIT_TIKTOK=0, REDES_KIT_CANAL=0, REDES_YOUTUBE=0.
 */
function sitio() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");
}

const sinConfigurar: Resultado = { omitida: "sin_configurar" };

/** Historia de la carta del día en Instagram y Facebook. */
export async function historiaDelDia(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_HISTORIA === "0") return { apagada: true };
  const imagen = `${sitio()}/api/redes/historia-dia?fecha=${fecha}`;
  const [instagram, facebook] = await Promise.all([
    instagramConfigurado() && publicaIdiomaEn("instagram", "es") ? publicarUnaVez(admin, "instagram", "historia", fecha, () => publicarHistoria(imagen)) : sinConfigurar,
    facebookConfigurado() && publicaIdiomaEn("facebook", "es") ? publicarUnaVez(admin, "facebook", "historia", fecha, () => publicarHistoriaFacebook(imagen)) : sinConfigurar,
  ]);
  return { fecha, instagram, facebook };
}

/** Texto de la publicación diaria del juego. Nunca dice la carta: solo la primera pista. */
export function textoJuegoDelDia(fecha: string, red: "instagram" | "facebook") {
  const numero = numeroDeJuego(fecha);
  const carta = cartaDelJuego(numero);
  const enlace = red === "facebook" ? "miarcana punto com / juego (enlace en nuestro perfil)" : "miarcana.com/ig/juego (enlace en la biografía)";
  return [
    `🔮 El Camino del Loco · carta #${numero}`,
    "",
    `Sibila escondió una de las 78 cartas del tarot. ¿La descubres en ${MAX_INTENTOS} intentos?`,
    "",
    `✨ Su primera pista: «${carta.palabrasClave[0]}».`,
    "Con cada intento sabrás si vas por el palo correcto y si el número es mayor o menor. Con cada fallo, una pista nueva.",
    "",
    `🎮 Juega gratis en ${enlace}`,
    "🏆 Cada semana hay ranking y el podio gana créditos para sus lecturas.",
    "",
    "💬 ¿Cuál crees que es? Escríbela en los comentarios (sin hacer trampa 😉).",
    "",
    "#tarot #juegodiario #tarotdiario #elcaminodelloco #miarcana",
  ].join("\n");
}

/** Publicación diaria del juego en Instagram y Facebook (REDES_JUEGO=0 la apaga). */
export async function juegoEnRedes(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_JUEGO === "0") return { apagada: true };
  const imagen = `${sitio()}/api/juego/reto?fecha=${fecha}`;
  const [instagram, facebook] = await Promise.all([
    instagramConfigurado() && publicaIdiomaEn("instagram", "es") ? publicarUnaVez(admin, "instagram", "juego", fecha, () => publicarImagen(imagen, textoJuegoDelDia(fecha, "instagram"))) : sinConfigurar,
    facebookConfigurado() && publicaIdiomaEn("facebook", "es") ? publicarUnaVez(admin, "facebook", "juego", fecha, () => publicarFotoFacebook(imagen, textoJuegoDelDia(fecha, "facebook"))) : sinConfigurar,
  ]);
  return { fecha, instagram, facebook };
}

/**
 * Carrusel "Tu signo esta semana" de la semana que corresponde a `hoy`
 * (la actual de lunes a jueves; la siguiente de viernes a domingo). Sibila
 * escribe los textos una sola vez y las dos redes usan los mismos.
 */
export async function carruselSemanal(admin: SupabaseClient<Database>, hoy = fechaBogota()) {
  if (process.env.REDES_CARRUSEL === "0") return { apagado: true };
  const semana = semanaDelCarrusel(hoy);
  const contenido = (await contenidoGuardado(admin, semana)) ?? (await redactarCarrusel(semana));
  const laminas = urlsLaminas(semana, String(Date.now()).slice(-6));
  const instagram = instagramConfigurado() && publicaIdiomaEn("instagram", "es") ? await publicarUnaVez(admin, "instagram", "carrusel", semana, () => publicarCarrusel(laminas, contenido.texto), contenido) : sinConfigurar;
  const facebook = facebookConfigurado() && publicaIdiomaEn("facebook", "es") ? await publicarUnaVez(admin, "facebook", "carrusel", semana, () => publicarVariasFotosFacebook(laminas, contenido.texto), contenido) : sinConfigurar;
  return { semana, titulo: contenido.titulo, instagram, facebook };
}

/**
 * Kit de TikTok: los reels del día llegan solos a los borradores de TikTok
 * (si la cuenta está conectada; REDES_TIKTOK_BORRADORES=0 lo apaga) y además
 * un correo con los textos para pegar. De paso actualiza el estado de los
 * envíos anteriores.
 */
export async function kitTiktok(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_KIT_TIKTOK === "0") return { apagado: true };
  const piezas = await piezasDelDia(admin, fecha);
  let borradores: { enviados: string[]; errores: string[] } | null = null;
  if (process.env.REDES_TIKTOK_BORRADORES !== "0" && (await tiktokListo(admin).catch(() => false))) {
    await refrescarEstadosTiktok(admin).catch((e) => console.error("[kit tiktok] estados:", e));
    borradores = await enviarABorradores(admin, piezas);
    if (borradores.errores.length) console.error("[kit tiktok] borradores:", borradores.errores);
  }
  const enBorradores = borradores ? piezas.length - borradores.errores.length : 0;
  const correo = await publicarUnaVez(admin, "correo", "kit_tiktok", fecha, () => enviarKitTiktok(fecha, piezas, enBorradores));
  return { fecha, piezas: piezas.length, borradores, correo };
}

/** Correo con lo del día listo para el canal de WhatsApp (no se puede publicar ahí de forma automática). */
export async function kitCanal(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_KIT_CANAL === "0") return { apagado: true };
  const piezas = await piezasCanal(admin, fecha);
  const correo = await publicarUnaVez(admin, "correo", "kit_canal", fecha, () => enviarKitCanal(fecha, piezas));
  return { fecha, piezas: piezas.length, correo };
}

/** Short diario en YouTube con el reel (narrado) de la carta del día. */
export async function shortDelDia(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_YOUTUBE === "0") return { apagado: true };
  if (!(await youtubeConectado(admin))) return { fecha, youtube: sinConfigurar };
  const carta = cartaDelDia(fecha);
  const youtube = await publicarUnaVez(admin, "youtube", "carta_dia", fecha, async () =>
    subirShort(admin, await reelCartaDelDia(admin, fecha), { titulo: `Carta del día: ${carta.nombre} ✨ | Tarot`, descripcion: textoShortYoutube(fecha), privacidad: privacidadYoutube() }),
  );
  return { fecha, youtube };
}

/**
 * Segundo Short del día en YouTube: la publicación del agente de redes de hoy
 * (guía, luna, signo, oferta…) con su reel narrado. Solo si ya está aprobada;
 * se sube una vez aunque la rutina corra por la mañana y al mediodía.
 */
export async function shortPublicacionDelDia(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_YOUTUBE === "0") return { apagado: true };
  if (!(await youtubeConectado(admin))) return { fecha, youtube: sinConfigurar };
  const { data: fila } = await admin
    .from("publicaciones_programadas")
    .select("*")
    .eq("fecha", fecha)
    .in("estado", ["aprobada", "publicando", "publicada"])
    .order("creado_en", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!fila) return { fecha, youtube: { omitida: "sin_publicacion_aprobada" } as Resultado };
  const p = fila as PublicacionProgramada;
  const { titulo, descripcion } = textoShortPublicacion(p);
  const youtube = await publicarUnaVez(admin, "youtube", "publicacion", fecha, async () => subirShort(admin, await reelPublicacion(admin, p), { titulo, descripcion, privacidad: privacidadYoutube() }), { publicacion: p.id });
  return { fecha, publicacion: p.id, youtube };
}
