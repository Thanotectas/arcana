import { cronAutorizado, ejecutarRutas, respuestaOrquestador } from "@/lib/cron";

export const maxDuration = 300;

/**
 * Orquestador del mediodía (vercel.json, 17:00 UTC = 12:00 Bogotá): reintenta
 * la carta del día si falló por la mañana y publica lo aprobado del agente de redes.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  return respuestaOrquestador(await ejecutarRutas(request, ["/api/cron/instagram"]));
}
