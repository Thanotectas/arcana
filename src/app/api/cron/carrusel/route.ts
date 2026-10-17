import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { carruselSemanal } from "@/lib/redes/automaticas";

// Sibila escribe los textos (~30 s) y Meta procesa ocho láminas.
export const maxDuration = 300;

/** Carrusel semanal "Tu signo esta semana" (el orquestador de la mañana lo llama los lunes). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    const r = await carruselSemanal(getSupabaseAdmin());
    const fallo = "instagram" in r && [r.instagram, r.facebook].some((x) => x && "error" in x);
    return Response.json(r, { status: fallo ? 502 : 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
