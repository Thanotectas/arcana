import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { actualizarMetricas } from "@/lib/redes/metricas";

export const maxDuration = 120;

/**
 * Cifras de las publicaciones de los últimos 14 días en Instagram y Facebook
 * (lo llama el orquestador de la tarde). Exige `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    const r = await actualizarMetricas(getSupabaseAdmin());
    return Response.json(r, { status: r.errores.length && !r.actualizadas ? 502 : 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
