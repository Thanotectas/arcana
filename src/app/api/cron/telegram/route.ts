import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { telegramConfigurado } from "@/lib/telegram/api";
import { cartaDiariaTelegram } from "@/lib/telegram/sibila";
import { publicarUnaVez } from "@/lib/redes/reservas";
import { fechaBogota } from "@/lib/redes/carta-dia";

export const maxDuration = 300;

/** Carta del día por Telegram a quienes escribieron /diaria (orquestador de la mañana), una vez por día. */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  if (!telegramConfigurado() || process.env.TELEGRAM_DIARIA === "0") return Response.json({ omitida: "sin_configurar" });
  const admin = getSupabaseAdmin();
  let resumen: Awaited<ReturnType<typeof cartaDiariaTelegram>> | null = null;
  const r = await publicarUnaVez(admin, "telegram", "carta_dia", fechaBogota(), async () => {
    resumen = await cartaDiariaTelegram(admin);
    return `${resumen.enviadas}/${resumen.suscriptores}`;
  });
  return Response.json({ telegram: r, resumen }, { status: "error" in r ? 502 : 200 });
}
