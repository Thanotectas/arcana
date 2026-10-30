import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { kitCanal } from "@/lib/redes/automaticas";

export const maxDuration = 120;

/** Correo con lo de hoy listo para el canal de WhatsApp (orquestador de la mañana). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    const r = await kitCanal(getSupabaseAdmin());
    return Response.json(r, { status: "correo" in r && r.correo && "error" in r.correo ? 502 : 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
