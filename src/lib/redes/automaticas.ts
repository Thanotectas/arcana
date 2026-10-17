import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { instagramConfigurado, publicarCarrusel, publicarHistoria } from "./instagram";
import { facebookConfigurado, publicarHistoriaFacebook, publicarVariasFotosFacebook } from "./facebook";
import { publicarUnaVez, type Resultado } from "./reservas";
import { contenidoGuardado, redactarCarrusel, semanaDelCarrusel, urlsLaminas } from "./carrusel";
import { enviarKitTiktok, piezasDelDia } from "./kit-tiktok";
import { fechaBogota } from "./carta-dia";

/**
 * Publicaciones automáticas que no pasan por aprobación (contenido acotado):
 * historia diaria de la carta del día, carrusel semanal de signos y kit de
 * TikTok por correo. Cada una se registra en `publicaciones_redes` para no
 * repetirse. Variables para apagarlas: REDES_HISTORIA=0, REDES_CARRUSEL=0,
 * REDES_KIT_TIKTOK=0.
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
    instagramConfigurado() ? publicarUnaVez(admin, "instagram", "historia", fecha, () => publicarHistoria(imagen)) : sinConfigurar,
    facebookConfigurado() ? publicarUnaVez(admin, "facebook", "historia", fecha, () => publicarHistoriaFacebook(imagen)) : sinConfigurar,
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
  const instagram = instagramConfigurado() ? await publicarUnaVez(admin, "instagram", "carrusel", semana, () => publicarCarrusel(laminas, contenido.texto), contenido) : sinConfigurar;
  const facebook = facebookConfigurado() ? await publicarUnaVez(admin, "facebook", "carrusel", semana, () => publicarVariasFotosFacebook(laminas, contenido.texto), contenido) : sinConfigurar;
  return { semana, titulo: contenido.titulo, instagram, facebook };
}

/** Correo con los reels del día y los textos para subirlos a TikTok. */
export async function kitTiktok(admin: SupabaseClient<Database>, fecha = fechaBogota()) {
  if (process.env.REDES_KIT_TIKTOK === "0") return { apagado: true };
  const piezas = await piezasDelDia(admin, fecha);
  const correo = await publicarUnaVez(admin, "correo", "kit_tiktok", fecha, () => enviarKitTiktok(fecha, piezas));
  return { fecha, piezas: piezas.length, correo };
}
