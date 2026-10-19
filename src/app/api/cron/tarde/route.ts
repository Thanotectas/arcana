import { cronAutorizado, ejecutarRutas, respuestaOrquestador } from "@/lib/cron";

export const maxDuration = 300;

/**
 * Orquestador del mediodía (vercel.json, 17:00 UTC = 12:00 Bogotá): reintenta
 * la carta del día si falló por la mañana, publica lo aprobado del agente de
 * redes, actualiza las cifras de las publicaciones de los últimos 14 días y
 * sube el Short de la carta del día a YouTube (el reel ya existe de la mañana).
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  return respuestaOrquestador(await ejecutarRutas(request, ["/api/cron/instagram", "/api/cron/metricas", "/api/cron/youtube"]));
}
