import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { juegoEnRedes } from "@/lib/redes/automaticas";

export const maxDuration = 120;

/** Publicación diaria «¿Adivinas la carta de hoy?» en Instagram y Facebook (orquestador de la mañana). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const r = await juegoEnRedes(getSupabaseAdmin());
  const fallo = "instagram" in r && [r.instagram, r.facebook].some((x) => x && "error" in x);
  return Response.json(r, { status: fallo ? 502 : 200 });
}
