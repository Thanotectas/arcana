import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "./supabase/server";
import { getSupabaseAdmin } from "./supabase/admin";
import { generarTexto } from "./ia";
import { cieloDeHoy, resumenCieloDeHoy, type CieloDeHoy } from "./astro/transitos";
import type { DatosNacimiento } from "./astro/carta";
import { circuloActivo, type Perfil } from "./dal";
import { fechaLarga } from "./i18n/formato";
import type { Idioma } from "./i18n/idiomas";
import { memoriaDeLaPersona } from "./lecturas/memoria";
import { datoDeUsuario } from "./seguridad";

/**
 * "Tu cielo hoy": mensaje personal diario a partir de los tránsitos sobre la
 * carta natal guardada en el perfil. Se escribe una vez por persona, día e
 * idioma (tabla mensajes_diarios) y solo para el Círculo Arcana.
 */

export const ZONA_PREDETERMINADA = "America/Bogota";

/** Datos de nacimiento guardados en el perfil, si están completos. */
export function datosNacimientoDePerfil(perfil: Perfil | null): DatosNacimiento | null {
  if (!perfil?.fecha_nacimiento || perfil.latitud == null || perfil.longitud == null || !perfil.zona_horaria) return null;
  return {
    nombre: perfil.nombre ?? "",
    fecha: perfil.fecha_nacimiento,
    hora: perfil.hora_nacimiento ? perfil.hora_nacimiento.slice(0, 5) : "12:00",
    horaDesconocida: !perfil.hora_nacimiento,
    lugar: perfil.lugar_nacimiento ?? "",
    latitud: perfil.latitud,
    longitud: perfil.longitud,
    zonaHoraria: perfil.zona_horaria,
  };
}

/** Fecha civil (YYYY-MM-DD) de hoy en la zona horaria de la persona. */
export function fechaLocalHoy(zona: string | null | undefined, ahora = new Date()) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: zona || ZONA_PREDETERMINADA, year: "numeric", month: "2-digit", day: "2-digit" }).format(ahora);
  } catch {
    return ahora.toISOString().slice(0, 10);
  }
}

export interface MensajeDeHoy {
  fecha: string;
  cielo: CieloDeHoy;
  /** Texto del mensaje; null cuando la persona no está en el Círculo. */
  contenido: string | null;
  /** true si acaba de escribirse en esta petición. */
  recien: boolean;
}

/** Cielo de hoy (fecha local de la persona) sin tocar la base de datos. */
export function cieloDeHoyDePerfil(perfil: Perfil) {
  const datos = datosNacimientoDePerfil(perfil);
  if (!datos) return null;
  // Mediodía local de hoy: evita que el tránsito cambie de fecha por zona horaria.
  const fecha = fechaLocalHoy(perfil.zona_horaria);
  const cielo = cieloDeHoy(datos, new Date(`${fecha}T12:00:00${desfase(perfil.zona_horaria)}`));
  return { datos, fecha, cielo };
}

/**
 * Mensaje de hoy: lo lee de la caché o lo escribe (solo Círculo).
 * `cliente` permite usar el cliente admin desde el cron; por defecto usa el de la sesión.
 */
export async function getMensajeDeHoy(perfil: Perfil, idioma: Idioma, cliente?: SupabaseClient<Database>): Promise<MensajeDeHoy | null> {
  const hoy = cieloDeHoyDePerfil(perfil);
  if (!hoy) return null;
  const { datos, fecha, cielo } = hoy;

  if (!circuloActivo(perfil)) return { fecha, cielo, contenido: null, recien: false };

  const supabase = cliente ?? (await createClient());
  const { data: guardado } = await supabase
    .from("mensajes_diarios")
    .select("contenido")
    .eq("usuario_id", perfil.id)
    .eq("fecha", fecha)
    .eq("idioma", idioma)
    .maybeSingle();
  if (guardado?.contenido) return { fecha, cielo, contenido: guardado.contenido, recien: false };

  const memoria = await memoriaDeLaPersona(supabase, perfil.id, { maximo: 2 });
  const usuario =
    `${resumenCieloDeHoy(cielo, datoDeUsuario(datos.nombre, 80) || "la persona", fechaLarga(`${fecha}T12:00:00`, idioma))}\n\n` +
    `Escribe el mensaje personal de hoy para esta persona a partir de sus tránsitos reales. ` +
    `Estructura: un título corto y evocador (##), un párrafo sobre el clima del día (qué tránsito manda y cómo se siente), ` +
    `un párrafo práctico (dónde poner la atención, qué conviene y qué no), y una última línea que empiece con "Hoy:" con una intención breve. ` +
    `Nombra el planeta y el punto natal implicados con naturalidad, sin jerga excesiva. Si no hay aspectos exactos, apóyate en la Luna del día y el fondo lento. ` +
    `Extensión: 140 a 200 palabras. Tono de amiga que sabe de astrología, sin predicciones absolutas.`;
  const contenido = await generarTexto(usuario, memoria, { idioma, effort: "low", maxTokens: 800 });

  const admin = getSupabaseAdmin();
  await admin.from("mensajes_diarios").upsert({ usuario_id: perfil.id, fecha, idioma, contenido }, { onConflict: "usuario_id,fecha,idioma", ignoreDuplicates: true });
  return { fecha, cielo, contenido, recien: true };
}

/** Desfase "+HH:MM" de una zona IANA respecto a UTC, hoy. */
function desfase(zona: string | null | undefined) {
  try {
    const partes = new Intl.DateTimeFormat("en-US", { timeZone: zona || ZONA_PREDETERMINADA, timeZoneName: "longOffset" }).formatToParts(new Date());
    const nombre = partes.find((p) => p.type === "timeZoneName")?.value ?? "GMT";
    const m = nombre.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!m) return "Z";
    const h = Number(m[1]);
    return `${h < 0 ? "-" : "+"}${String(Math.abs(h)).padStart(2, "0")}:${m[2] ?? "00"}`;
  } catch {
    return "Z";
  }
}
