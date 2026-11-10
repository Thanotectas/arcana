import { cronAutorizado, ejecutarRutas, respuestaOrquestador } from "@/lib/cron";
import { fechaBogota } from "@/lib/redes/carta-dia";

export const maxDuration = 300;

/**
 * Orquestador de la mañana (vercel.json, 12:00 UTC = 07:00 Bogotá): mensajes
 * del Círculo y avisos push, carta del día en redes (y borradores del agente),
 * su historia, el kit de TikTok con los videos de ayer, el kit del canal de WhatsApp, correos de campaña, el
 * Short de la publicación del agente en YouTube, la carta diaria por Telegram,
 * los seguidores de cada red para el hub (/admin/hub) y, los lunes, el estado del
 * negocio, el carrusel semanal de signos y el kit de comentarios.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const esLunes = new Date(`${fechaBogota()}T12:00:00Z`).getUTCDay() === 1;
  const rutas = ["/api/cron/diario", "/api/cron/instagram", "/api/cron/historia", "/api/cron/kit-tiktok", "/api/cron/kit-canal", "/api/cron/correos", "/api/cron/youtube?que=publicacion", "/api/cron/telegram", "/api/cron/seguidores", ...(esLunes ? ["/api/cron/resumen", "/api/cron/carrusel", "/api/cron/kit-comentarios"] : [])];
  return respuestaOrquestador(await ejecutarRutas(request, rutas));
}
