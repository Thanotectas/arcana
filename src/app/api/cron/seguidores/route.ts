import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { consultarSeguidores, guardarSeguidores } from "@/lib/redes/hub";

export const maxDuration = 60;

/**
 * Seguidores de cada red (Instagram, Facebook, YouTube, TikTok y suscriptores
 * de Telegram) anotados una vez al día para el hub de redes (/admin/hub).
 * Lo llama el orquestador de la mañana. Exige `Authorization: Bearer CRON_SECRET`.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  try {
    const admin = getSupabaseAdmin();
    const s = await consultarSeguidores(admin);
    // Sin la migración 0049 no hay dónde guardar: se avisa en la respuesta sin marcar
    // como fallido todo el orquestador de la mañana.
    let advertencia: string | undefined;
    try {
      await guardarSeguidores(admin, s);
    } catch (e) {
      advertencia = `Sin guardar (¿migración 0049 aplicada?): ${e instanceof Error ? e.message : String(e)}`;
      console.error("[hub de redes] seguidores sin guardar:", advertencia);
    }
    const fallidas = s.redes.filter((r) => r.seguidores === null);
    return Response.json({ ...s, ...(advertencia ? { advertencia } : {}) }, { status: fallidas.length && fallidas.length === s.redes.length ? 502 : 200 });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
