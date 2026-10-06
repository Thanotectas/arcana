import { timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { correoConfigurado, enviarCorreo } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { calcularResumen, correoResumen } from "@/lib/resumen/semanal";

export const maxDuration = 60;

/**
 * Cron semanal (vercel.json, lunes 13:00 UTC = 08:00 Bogotá): envía a la
 * administración el estado del negocio de los últimos siete días.
 * Vercel manda `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) return Response.json({ error: "sin_cron_secret" }, { status: 503 });
  const recibido = Buffer.from(request.headers.get("authorization") ?? "");
  const esperado = Buffer.from(`Bearer ${secreto}`);
  if (recibido.length !== esperado.length || !timingSafeEqual(recibido, esperado)) return Response.json({ error: "no_autorizado" }, { status: 401 });
  if (!correoConfigurado()) return Response.json({ error: "correo_sin_configurar" }, { status: 503 });

  const destinatarios = correosAdmin();
  const resumen = await calcularResumen(getSupabaseAdmin());
  const correo = correoResumen(resumen);
  const envios = await Promise.all(destinatarios.map((para) => enviarCorreo({ para, ...correo, etiqueta: "resumen_semanal" })));
  const fallidos = envios.filter((e) => !e.ok);
  if (fallidos.length) console.error("[cron resumen]", fallidos);
  return Response.json({ semana: resumen.desde, enviados: envios.length - fallidos.length, fallidos: fallidos.length, alertas: resumen.alertas }, { status: fallidos.length ? 502 : 200 });
}
