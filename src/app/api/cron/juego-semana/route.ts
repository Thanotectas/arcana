import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarPush, pushConfigurado } from "@/lib/push";
import { fechaBogota, inicioSemana, sumarDias } from "@/lib/juego/carta-escondida";
import { pagarPodioSemana } from "@/lib/juego/servidor";

export const maxDuration = 120;

/**
 * Lunes por la mañana (orquestador de la mañana): paga el podio del ranking de la semana que terminó
 * (3, 2 y 1 créditos), les avisa con push y reinicia los puestos avisados para la semana nueva.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const desde = sumarDias(inicioSemana(fechaBogota()), -7);
  const pagados = await pagarPodioSemana(desde);
  const admin = getSupabaseAdmin();
  await admin.from("juego_jugadores").update({ ultimo_puesto: null, semana_puesto: null }).not("ultimo_puesto", "is", null);

  let avisos = 0;
  if (pushConfigurado() && pagados.length) {
    const { data: suscripciones } = await admin.from("suscripciones_push").select("id, usuario_id, endpoint, p256dh, auth").in("usuario_id", pagados.map((p) => p.usuarioId));
    const medalla = ["🥇", "🥈", "🥉"];
    for (const p of pagados) {
      for (const s of (suscripciones ?? []).filter((x) => x.usuario_id === p.usuarioId)) {
        const r = await enviarPush(s, {
          titulo: `${medalla[p.puesto - 1]} ¡Quedaste ${p.puesto}.º en el ranking!`,
          cuerpo: `Con ${p.puntos} puntos en El Camino del Loco. Te sumamos ${p.creditos} ${p.creditos === 1 ? "crédito" : "créditos"} de regalo. La semana nueva ya empezó.`,
          url: "/juego/ranking",
          tag: "arcana-juego-podio",
        });
        if (r === "enviada") avisos++;
      }
    }
  }
  return Response.json({ ok: true, semana: desde, pagados: pagados.map((p) => ({ puesto: p.puesto, apodo: p.apodo, puntos: p.puntos, creditos: p.creditos })), avisos });
}
