import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarPush, pushConfigurado } from "@/lib/push";
import { RACHA_PREMIO, diaAnterior, fechaBogota, numeroDeJuego } from "@/lib/juego/carta-escondida";
import { progresoDeCuenta } from "@/lib/juego/servidor";

export const maxDuration = 300;

/**
 * Recordatorio de «El Camino del Loco» (lo llama el orquestador del mediodía): a quien jugó ayer y todavía
 * no ha jugado hoy le llega un aviso para no perder su racha. A nadie más: no es publicidad.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  if (!pushConfigurado()) return Response.json({ ok: true, omitido: "push sin configurar" });
  const admin = getSupabaseAdmin();
  const hoy = fechaBogota();
  const ayer = diaAnterior(hoy);
  const [{ data: deAyer }, { data: deHoy }] = await Promise.all([
    admin.from("juego_partidas").select("usuario_id").eq("fecha", ayer).limit(2000),
    admin.from("juego_partidas").select("usuario_id").eq("fecha", hoy).limit(5000),
  ]);
  const yaJugaron = new Set((deHoy ?? []).map((f) => f.usuario_id));
  const pendientes = [...new Set((deAyer ?? []).map((f) => f.usuario_id))].filter((u) => !yaJugaron.has(u));
  if (!pendientes.length) return Response.json({ ok: true, avisos: 0 });

  const { data: suscripciones } = await admin.from("suscripciones_push").select("id, usuario_id, endpoint, p256dh, auth").in("usuario_id", pendientes);
  const numero = numeroDeJuego(hoy);
  let enviados = 0;
  const borrar: number[] = [];
  for (const usuario of pendientes) {
    const suyas = (suscripciones ?? []).filter((s) => s.usuario_id === usuario);
    if (!suyas.length) continue;
    const { racha } = await progresoDeCuenta(usuario);
    if (racha < 1) continue;
    const premioHoy = (racha + 1) % RACHA_PREMIO === 0;
    const carga = {
      titulo: `🔥 Tu racha de ${racha} ${racha === 1 ? "día" : "días"} te espera`,
      cuerpo: premioHoy
        ? `La carta #${numero} ya está escondida. ¡Si juegas hoy completas ${racha + 1} días y ganas 1 crédito!`
        : `La carta #${numero} ya está escondida. Juega antes de medianoche y no pierdas tu racha.`,
      url: "/juego",
      tag: "arcana-juego",
    };
    for (const s of suyas) {
      const r = await enviarPush(s, carga);
      if (r === "enviada") enviados++;
      if (r === "caducada") borrar.push(s.id);
    }
  }
  if (borrar.length) await admin.from("suscripciones_push").delete().in("id", borrar);
  return Response.json({ ok: true, pendientes: pendientes.length, avisos: enviados });
}
