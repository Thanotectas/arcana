import "server-only";
import { createHmac } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { COSTOS, NOMBRES_LECTURA, type TipoLectura } from "@/lib/creditos";
import { RUTAS, NOMBRE_ASISTENTE } from "@/lib/asistente";
import { hechos } from "@/lib/whatsapp/sibila";
import { MENSAJE_INSTAGRAM, TELEGRAM } from "@/lib/marca/redes";

/**
 * Chat de Sibila para visitantes sin cuenta (la burbuja de la página cuando
 * no hay sesión). Responde dudas sobre Arcana con los mismos hechos que la
 * línea de WhatsApp, no hace lecturas e invita a crear la cuenta. No cobra:
 * se limita por persona (huella de la IP) y por día en total.
 */
export const CHAT_VISITAS = {
  porPersonaDia: 12,
  totalDia: 1500,
  historial: 8,
  largo: 500,
} as const;

/** Huella no reversible de la IP (HMAC con un secreto del servidor). */
export function huellaDe(ip: string) {
  const sal = process.env.CORREO_SECRETO ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "arcana";
  return createHmac("sha256", sal).update(`chat:${ip}`).digest("hex").slice(0, 40);
}

/** IP del visitante según las cabeceras de Vercel. */
export function ipDe(request: Request) {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida";
}

function inicioDelDia() {
  // Medianoche de Bogotá (UTC-5).
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
  return `${hoy}T05:00:00.000Z`;
}

/** Cuántos mensajes lleva hoy esa huella y el total del sitio. */
export async function usoDeHoy(admin: SupabaseClient<Database>, huella: string) {
  const desde = inicioDelDia();
  const [{ count: persona }, { count: total }] = await Promise.all([
    admin.from("chat_visitas").select("id", { count: "exact", head: true }).eq("huella", huella).gte("creado_en", desde),
    admin.from("chat_visitas").select("id", { count: "exact", head: true }).gte("creado_en", desde),
  ]);
  return { persona: persona ?? 0, total: total ?? 0 };
}

/** Instrucciones de Sibila para la burbuja de visitantes. */
export async function sistemaVisitas() {
  const catalogo = (Object.keys(COSTOS) as TipoLectura[])
    .map((t) => `- ${NOMBRES_LECTURA[t]}: ${COSTOS[t] === 0 ? "gratis (1 al día)" : `${COSTOS[t]} crédito(s)`} → ruta ${RUTAS[t]}`)
    .join("\n");
  return [
    `Ahora conversas como ${NOMBRE_ASISTENTE} en la burbuja de chat de la página de Arcana, con una persona que todavía no ha entrado a su cuenta (o no la tiene). Respuestas breves (30 a 110 palabras), cálidas y concretas, en primera persona. Puedes usar Markdown ligero y enlaces internos en Markdown con su ruta, por ejemplo [Crear mi cuenta](/registro) o [Ver precios](/creditos).`,
    `Qué haces aquí: explicar qué es Arcana y cómo funciona, orientar sobre qué lectura le sirve según lo que busca, contar precios, medios de pago y qué es gratis, y resolver dudas de la cuenta. Cuando encaje, invita a crear la cuenta (gratis, con 3 créditos de regalo) o a sacar la carta del día gratis.`,
    `Qué no haces: no escribas lecturas ni interpretaciones (ni tarot, ni carta astral, ni sueños, ni signos de la persona): explica con cariño que la lectura se hace en la app, di cuánto cuesta y deja el enlace. No pidas datos personales, contraseñas ni datos de pago. No inventes precios, funciones ni plazos.`,
    `Si la persona necesita ayuda de una persona del equipo (un pago que no aparece, un problema con su cuenta, una queja), dile que escriba por mensaje directo de Instagram a ${MENSAJE_INSTAGRAM.usuario} (${MENSAJE_INSTAGRAM.url})${TELEGRAM.activo ? `, por Telegram a ${TELEGRAM.usuario} (${TELEGRAM.url}), donde también recibe la carta del día cada mañana,` : ""} o al correo miarcana4@gmail.com. No hay línea de WhatsApp: no la ofrezcas.`,
    `Catálogo de lecturas y rutas:\n${catalogo}\nOtras rutas: precios y paquetes /creditos, Círculo /creditos#circulo, crear cuenta /registro, entrar /entrar, horóscopo gratis /horoscopo, calendario lunar gratis /luna, guías de rituales gratis /rituales, invitar amigos y programa de Embajadores /invitar.`,
    await hechos(),
  ].join("\n\n");
}
