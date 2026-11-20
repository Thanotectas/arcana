import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { enviarPush, pushConfigurado, type CargaPush } from "@/lib/push";
import { RACHA_PREMIO, diaAnterior, fechaBogota, inicioSemana, numeroDeJuego, sumarDias } from "@/lib/juego/carta-escondida";
import { progresoDeCuenta, tablaSemana } from "@/lib/juego/servidor";

export const maxDuration = 300;

/**
 * Avisos de «El Camino del Loco» (orquestador del mediodía), a quien todavía no ha jugado hoy y tiene los avisos
 * activos. Un solo aviso por persona, el más importante:
 * 1. «Te pasaron en el ranking» (si bajó de puesto desde el aviso anterior).
 * 2. Su racha en riesgo (jugó ayer).
 * 3. De viernes a domingo, si va en el top 10: cuántos días quedan para cerrar la semana.
 * A nadie más: no es publicidad.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  if (!pushConfigurado()) return Response.json({ ok: true, omitido: "push sin configurar" });
  const admin = getSupabaseAdmin();
  const hoy = fechaBogota();
  const ayer = diaAnterior(hoy);
  const lunes = inicioSemana(hoy);
  const quedan = 6 - Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${lunes}T12:00:00Z`)) / 86_400_000);
  const numero = numeroDeJuego(hoy);

  const [{ data: deAyer }, { data: deHoy }, tabla, { data: avisados }] = await Promise.all([
    admin.from("juego_partidas").select("usuario_id").eq("fecha", ayer).limit(5000),
    admin.from("juego_partidas").select("usuario_id").eq("fecha", hoy).limit(5000),
    tablaSemana(lunes, hoy),
    admin.from("juego_jugadores").select("usuario_id, ultimo_puesto, semana_puesto").limit(50_000),
  ]);
  const yaJugaron = new Set((deHoy ?? []).map((f) => f.usuario_id));
  const previo = new Map((avisados ?? []).filter((a) => a.semana_puesto === lunes && a.ultimo_puesto).map((a) => [a.usuario_id, a.ultimo_puesto as number]));
  const puesto = new Map(tabla.map((f) => [f.usuarioId, f]));

  const cargas = new Map<string, CargaPush>();
  // 2. Racha en riesgo.
  for (const usuario of new Set((deAyer ?? []).map((f) => f.usuario_id))) {
    if (yaJugaron.has(usuario)) continue;
    const { racha } = await progresoDeCuenta(usuario);
    if (racha < 1) continue;
    const premioHoy = (racha + 1) % RACHA_PREMIO === 0;
    cargas.set(usuario, {
      titulo: `🔥 Tu racha de ${racha} ${racha === 1 ? "día" : "días"} te espera`,
      cuerpo: premioHoy
        ? `La carta #${numero} ya está escondida. ¡Si juegas hoy completas ${racha + 1} días y ganas 1 crédito!`
        : `La carta #${numero} ya está escondida. Juega antes de medianoche y no pierdas tu racha.`,
      url: "/juego",
      tag: "arcana-juego",
    });
  }
  // 3. Fin de semana en el top 10.
  if (quedan <= 2) {
    for (const f of tabla.slice(0, 10)) {
      if (yaJugaron.has(f.usuarioId) || cargas.has(f.usuarioId)) continue;
      cargas.set(f.usuarioId, {
        titulo: `🏆 Vas ${f.puesto}.º en el ranking`,
        cuerpo: `${f.puntos} puntos y ${quedan === 0 ? "hoy se cierra la semana" : `quedan ${quedan + 1} días`}. Juega la carta #${numero} y defiende tu puesto: el podio gana créditos el lunes.`,
        url: "/juego",
        tag: "arcana-juego",
      });
    }
  }
  // 1. Te pasaron (manda sobre los demás).
  for (const f of tabla) {
    const antes = previo.get(f.usuarioId);
    if (!antes || f.puesto <= antes || yaJugaron.has(f.usuarioId)) continue;
    cargas.set(f.usuarioId, {
      titulo: "⚡ Te pasaron en el ranking",
      cuerpo: `Bajaste del ${antes}.º al ${f.puesto}.º puesto. Juega la carta #${numero} de hoy y recupera tu lugar.`,
      url: "/juego",
      tag: "arcana-juego",
    });
  }

  // Guarda el puesto de hoy para comparar mañana.
  for (const f of tabla.slice(0, 200)) {
    if (previo.get(f.usuarioId) === f.puesto) continue;
    await admin.from("juego_jugadores").update({ ultimo_puesto: f.puesto, semana_puesto: lunes }).eq("usuario_id", f.usuarioId);
  }

  const usuarios = [...cargas.keys()];
  if (!usuarios.length) return Response.json({ ok: true, avisos: 0 });
  const { data: suscripciones } = await admin.from("suscripciones_push").select("id, usuario_id, endpoint, p256dh, auth").in("usuario_id", usuarios);
  let enviados = 0;
  const borrar: number[] = [];
  for (const s of suscripciones ?? []) {
    const carga = cargas.get(s.usuario_id ?? "");
    if (!carga) continue;
    const r = await enviarPush(s, carga);
    if (r === "enviada") enviados++;
    if (r === "caducada") borrar.push(s.id);
  }
  if (borrar.length) await admin.from("suscripciones_push").delete().in("id", borrar);
  return Response.json({ ok: true, candidatos: usuarios.length, avisos: enviados, ranking: tabla.length, puesto: puesto.size, cierre: sumarDias(lunes, 6) });
}
