import { cronAutorizado, ejecutarRutas, respuestaOrquestador } from "@/lib/cron";
import { fechaBogota } from "@/lib/redes/carta-dia";

export const maxDuration = 300;

/**
 * Orquestador de la mañana (vercel.json, 12:00 UTC = 07:00 Bogotá): mensajes
 * del Círculo y avisos push, carta del día en redes (y borradores del agente),
 * correos de campaña y, los lunes, el estado del negocio.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const esLunes = new Date(`${fechaBogota()}T12:00:00Z`).getUTCDay() === 1;
  const rutas = ["/api/cron/diario", "/api/cron/instagram", "/api/cron/correos", ...(esLunes ? ["/api/cron/resumen"] : [])];
  return respuestaOrquestador(await ejecutarRutas(request, rutas));
}
