import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { shortDelDia } from "@/lib/redes/automaticas";

// Puede tocar generar el reel (~40 s con voz) y subirlo.
export const maxDuration = 300;

/** Short diario de la carta del día en YouTube (orquestador de la tarde, cuando el reel ya existe). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const r = await shortDelDia(getSupabaseAdmin());
  const fallo = !("apagado" in r) && "error" in r.youtube;
  return Response.json(r, { status: fallo ? 502 : 200 });
}
