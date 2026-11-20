import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fechaBogota, inicioSemana, sumarDias } from "@/lib/juego/carta-escondida";
import { MOTIVO_RACHA, tablaSemana } from "@/lib/juego/servidor";

export const metadata: Metadata = { title: "El Camino del Loco · métricas", robots: { index: false } };
export const dynamic = "force-dynamic";

const n = (x: number) => new Intl.NumberFormat("es-CO").format(x);
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");
const cop = (centavos: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(centavos / 100);

/** Solo administración: si el juego trae gente, si vuelve, si crea cuenta y si termina comprando lecturas. */
export default async function PaginaMetricasJuego() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const hoy = fechaBogota();
  const desde30 = sumarDias(hoy, -29);
  const [{ data: eventos, error }, { data: partidas }, { data: ordenes }, { data: lecturas }, { data: regalos }, { data: redes }, { count: apodos }, podio] = await Promise.all([
    admin.from("juego_eventos").select("fecha, visitante, evento, usuario_id, gano").gte("fecha", desde30).limit(100_000),
    admin.from("juego_partidas").select("usuario_id, fecha, gano, comodin").gte("fecha", desde30).limit(100_000),
    admin.from("ordenes").select("usuario_id, creado_en, monto_centavos, codigo, estado").eq("estado", "aprobada").gte("creado_en", `${desde30}T05:00:00Z`).limit(20_000),
    admin.from("lecturas").select("usuario_id, creado_en, creditos_usados").gte("creado_en", `${desde30}T05:00:00Z`).limit(50_000),
    admin.from("movimientos_creditos").select("cantidad, referencia, creado_en").eq("motivo", MOTIVO_RACHA).gte("creado_en", `${desde30}T05:00:00Z`).limit(20_000),
    admin.from("publicaciones_redes").select("red, fecha, estado").eq("tipo", "juego").gte("fecha", sumarDias(hoy, -6)),
    admin.from("juego_jugadores").select("usuario_id", { count: "exact", head: true }),
    tablaSemana(inicioSemana(hoy), hoy).catch(() => []),
  ]);
  const ev = eventos ?? [];
  const dias14 = Array.from({ length: 14 }, (_, i) => sumarDias(hoy, -i));
  const jugadores = (desde: string, hasta = hoy) => new Set(ev.filter((e) => e.evento === "inicio" && e.fecha >= desde && e.fecha <= hasta).map((e) => e.visitante));
  const cuenta = (evento: string, fecha?: string, filtro?: (e: (typeof ev)[number]) => boolean) =>
    ev.filter((e) => e.evento === evento && (!fecha || e.fecha === fecha) && (!filtro || filtro(e))).length;

  // Vuelven al día siguiente: de quienes jugaron el día D, cuántos jugaron el D+1 (días cerrados de las últimas 2 semanas).
  let base = 0;
  let volvieron = 0;
  for (const d of dias14.slice(1)) {
    const ese = jugadores(d, d);
    const siguiente = jugadores(sumarDias(d, 1), sumarDias(d, 1));
    base += ese.size;
    volvieron += [...ese].filter((v) => siguiente.has(v)).length;
  }

  // Cuentas que jugaron y después hicieron una lectura o compraron (30 días).
  const primera = new Map<string, string>();
  for (const p of partidas ?? []) if (!primera.has(p.usuario_id) || p.fecha < (primera.get(p.usuario_id) ?? "")) primera.set(p.usuario_id, p.fecha);
  const despues = (usuario: string, instante: string) => {
    const f = primera.get(usuario);
    return Boolean(f && instante >= `${f}T05:00:00Z`);
  };
  const lectoras = new Set((lecturas ?? []).filter((l) => despues(l.usuario_id, l.creado_en)).map((l) => l.usuario_id));
  const lecturasPagas = (lecturas ?? []).filter((l) => l.creditos_usados > 0 && despues(l.usuario_id, l.creado_en));
  const compras = (ordenes ?? []).filter((o) => despues(o.usuario_id, o.creado_en));
  const compradoras = new Set(compras.map((o) => o.usuario_id));
  const conCamino = (ordenes ?? []).filter((o) => o.codigo === "CAMINO");
  const regalado = (prefijo: string) => (regalos ?? []).filter((r) => (r.referencia ?? "").startsWith(prefijo)).reduce((s, r) => s + r.cantidad, 0);

  const cifra = (titulo: string, valor: string, detalle: string) => (
    <div className="tarjeta p-4">
      <p className="text-sm text-texto-suave">{titulo}</p>
      <p className="font-display text-4xl text-oro-suave">{valor}</p>
      <p className="text-xs text-texto-suave">{detalle}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">El Camino del Loco</h1>
        <p className="mt-2 text-texto-suave">
          Si el juego trae gente, si vuelve, si crea cuenta y si termina en lecturas y compras. Las personas se cuentan sin datos personales (un número al azar por
          navegador). <Link href="/juego/ranking" className="text-oro-suave underline">Ver el ranking</Link>
        </p>
      </div>
      {error && <p className="tarjeta border-peligro/40 p-4 text-sm text-peligro">Falta aplicar la migración 0057_juego_lectura_metricas.sql: sin ella todavía no se cuentan los jugadores.</p>}

      <section className="grid gap-3 sm:grid-cols-3">
        {cifra("Jugaron hoy", n(jugadores(hoy).size), `${n(jugadores(sumarDias(hoy, -6)).size)} en 7 días · ${n(jugadores(desde30).size)} en 30`)}
        {cifra("Vuelven al día siguiente", pct(volvieron, base), `${n(volvieron)} de ${n(base)} (últimos 13 días)`)}
        {cifra("Juegan con cuenta", n(primera.size), `cuentas distintas en 30 días · ${n(apodos ?? 0)} con apodo en el ranking`)}
        {cifra("Hicieron una lectura después", n(lectoras.size), `${pct(lectoras.size, primera.size)} de las cuentas que juegan · ${n(lecturasPagas.length)} lecturas pagas`)}
        {cifra("Compraron después de jugar", n(compradoras.size), `${n(compras.length)} compras · ${cop(compras.reduce((s, o) => s + o.monto_centavos, 0))}`)}
        {cifra("Compras con el código CAMINO", n(conCamino.length), `${cop(conCamino.reduce((s, o) => s + o.monto_centavos, 0))} en 30 días`)}
        {cifra("Mensajes de Sibila vistos", n(cuenta("mensaje")), `${n(cuenta("oferta"))} clics en la tirada o en CAMINO (${pct(cuenta("oferta"), cuenta("mensaje"))})`)}
        {cifra("Créditos regalados por el juego", n((regalos ?? []).reduce((s, r) => s + r.cantidad, 0)), `racha ${n(regalado("racha:"))} · álbum ${n(regalado("album:"))} · podio ${n(regalado("semana:"))} (30 días)`)}
        {cifra(
          "Publicación diaria en redes",
          `${(redes ?? []).filter((r) => r.estado === "publicada").length}/${(redes ?? []).length || 0}`,
          `publicadas en 7 días · ${(redes ?? []).filter((r) => r.estado === "error").length} con error`,
        )}
      </section>

      <section className="tarjeta overflow-x-auto p-5">
        <h2 className="mb-3 font-display text-2xl">Últimos 14 días</h2>
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-texto-suave">
            <tr>
              <th className="py-1">Día</th>
              <th className="text-right">Jugaron</th>
              <th className="text-right">Terminaron</th>
              <th className="text-right">La encontraron</th>
              <th className="text-right">Comodín</th>
              <th className="text-right">Maestro</th>
              <th className="text-right">Con cuenta</th>
              <th className="text-right">Clics lectura</th>
            </tr>
          </thead>
          <tbody>
            {dias14.map((d) => {
              const fin = cuenta("fin", d);
              return (
                <tr key={d} className="border-t border-white/10">
                  <td className="py-1">{d}</td>
                  <td className="text-right">{n(jugadores(d, d).size)}</td>
                  <td className="text-right">{n(fin)}</td>
                  <td className="text-right">{pct(cuenta("fin", d, (e) => Boolean(e.gano)), fin)}</td>
                  <td className="text-right">{n(cuenta("comodin", d))}</td>
                  <td className="text-right">{n(cuenta("maestro", d))}</td>
                  <td className="text-right">{n((partidas ?? []).filter((p) => p.fecha === d).length)}</td>
                  <td className="text-right">{n(cuenta("oferta", d))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="tarjeta space-y-2 p-5">
        <h2 className="font-display text-2xl">Ranking de esta semana</h2>
        {podio.length === 0 ? (
          <p className="text-sm text-texto-suave">Todavía nadie con apodo ha sumado puntos esta semana.</p>
        ) : (
          <ol className="space-y-1 text-sm">
            {podio.slice(0, 10).map((f) => (
              <li key={f.usuarioId} className="flex justify-between border-t border-white/10 py-1">
                <span>
                  {f.puesto}. {f.apodo}
                </span>
                <span className="tabular-nums">
                  {f.puntos} pts · {f.dias} d
                </span>
              </li>
            ))}
          </ol>
        )}
        <p className="text-xs text-texto-suave">El lunes a las 7 a. m. el podio recibe 3, 2 y 1 créditos automáticamente.</p>
      </section>
    </div>
  );
}
