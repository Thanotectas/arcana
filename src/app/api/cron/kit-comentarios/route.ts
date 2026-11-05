import { cronAutorizado } from "@/lib/cron";
import { kitComentarios } from "@/lib/redes/kit-comentarios";

// Sibila redacta el kit en español y en francés (~40 s).
export const maxDuration = 180;

/** Correo de los lunes con el kit de comentarios de la semana (orquestador de la mañana). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    return Response.json(await kitComentarios());
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
