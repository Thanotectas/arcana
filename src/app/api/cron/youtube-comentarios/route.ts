import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { revisarComentariosYoutube } from "@/lib/redes/youtube-comentarios";

export const maxDuration = 300;

/** Sibila responde los comentarios nuevos de YouTube (lo llaman los orquestadores de la mañana y la tarde). */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    return Response.json(await revisarComentariosYoutube(getSupabaseAdmin(), 5));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
