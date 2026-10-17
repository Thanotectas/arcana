import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { kitTiktok } from "@/lib/redes/automaticas";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { sumarDias } from "@/lib/redes/calendario";

export const maxDuration = 120;

/** Correo con los reels de ayer listos para TikTok (orquestador de la mañana: ya están generados). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    const r = await kitTiktok(getSupabaseAdmin(), sumarDias(fechaBogota(), -1));
    return Response.json(r, { status: "correo" in r && r.correo && "error" in r.correo ? 502 : 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
