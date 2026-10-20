import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { shortDelDia, shortPublicacionDelDia } from "@/lib/redes/automaticas";

// Puede tocar generar el reel (~40 s con voz) y subirlo.
export const maxDuration = 300;

/**
 * Dos Shorts al día en YouTube. `?que=publicacion` (orquestador de la mañana):
 * la publicación del agente de hoy, si ya está aprobada. Sin parámetro
 * (orquestador del mediodía, cuando el reel de la carta ya existe): la carta
 * del día y, si por la mañana no estaba aprobada, la publicación.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const admin = getSupabaseAdmin();
  const que = new URL(request.url).searchParams.get("que");
  const carta = que === "publicacion" ? null : await shortDelDia(admin);
  const publicacion = await shortPublicacionDelDia(admin);
  const fallo = [carta, publicacion].some((r) => r && !("apagado" in r) && "error" in r.youtube);
  return Response.json({ carta, publicacion }, { status: fallo ? 502 : 200 });
}
