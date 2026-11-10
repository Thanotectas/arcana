import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resumenHub, type ResumenHub } from "@/lib/redes/hub";
import { CANALES_HUB } from "@/lib/marca/redes";
import { es } from "@/lib/i18n/diccionarios/es";
import { BotonSeguidores } from "@/components/admin/BotonSeguidores";
import { EnlacesHub } from "@/components/admin/EnlacesHub";
import { Aviso } from "@/components/Aviso";

export const metadata: Metadata = { title: "Hub de redes", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const NOMBRE_RED: Record<string, string> = { instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", facebook: "Facebook", telegram: "Telegram (carta diaria)" };
const DIAS = [7, 30, 90];
const n = (v: number) => v.toLocaleString("es-CO");
const fechaCorta = (f: string) => new Date(`${f}T12:00:00Z`).toLocaleDateString("es-CO", { timeZone: "UTC", day: "numeric", month: "short" });

function Barras({ porDia }: { porDia: ResumenHub["porDia"] }) {
  const W = 640, H = 200, m = { t: 10, r: 6, b: 24, l: 30 };
  const max = Math.max(...porDia.map((d) => d.total), 1);
  const paso = [1, 2, 5, 10, 20, 50, 100, 200, 500].find((p) => max / p <= 4) ?? 1000;
  const tope = Math.ceil(max / paso) * paso;
  const y = (v: number) => m.t + (H - m.t - m.b) * (1 - v / tope);
  const banda = (W - m.l - m.r) / porDia.length;
  const ancho = Math.max(3, Math.min(18, banda * 0.6));
  const cada = Math.ceil(porDia.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" role="img" aria-label="Clics por día">
      {Array.from({ length: tope / paso + 1 }, (_, i) => i * paso).map((v) => (
        <g key={v}>
          <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.12} />
          <text x={m.l - 5} y={y(v) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.6}>{v}</text>
        </g>
      ))}
      {porDia.map((d, i) => {
        const cx = m.l + banda * i + banda / 2;
        return (
          <g key={d.fecha}>
            <rect x={cx - ancho / 2} y={y(d.total)} width={ancho} height={y(0) - y(d.total)} rx={2} fill="#d9b45a">
              <title>{`${fechaCorta(d.fecha)}: ${d.total}`}</title>
            </rect>
            {(i % cada === 0 || (i === porDia.length - 1 && i % cada > cada / 2)) && (
              <text x={cx} y={H - 7} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>{fechaCorta(d.fecha)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function Lineas({ series }: { series: ResumenHub["seguidores"] }) {
  const con = series.filter((s) => s.historial.length);
  if (!con.length) return <p className="text-sm text-texto-suave">Todavía no hay datos: se anotan cada mañana, o ahora con el botón.</p>;
  const fechas = [...new Set(con.flatMap((s) => s.historial.map((h) => h.fecha)))].sort();
  const W = 640, H = 200, m = { t: 10, r: 6, b: 24, l: 40 };
  const valores = con.flatMap((s) => s.historial.map((h) => h.n));
  const max = Math.max(...valores, 1), min = Math.min(...valores, 0);
  const tope = Math.ceil((max * 1.1) / 5) * 5 || 5;
  const y = (v: number) => m.t + (H - m.t - m.b) * (1 - (v - min) / (tope - min || 1));
  const x = (f: string) => m.l + (W - m.l - m.r) * (fechas.length === 1 ? 0.5 : fechas.indexOf(f) / (fechas.length - 1));
  const colores = ["#d9b45a", "#E1306C", "#69C9D0", "#FF0000", "#229ED9", "#1877F2"];
  const cada = Math.ceil(fechas.length / 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" role="img" aria-label="Seguidores por día">
      {[0, 1, 2, 3, 4].map((k) => {
        const v = Math.round(min + ((tope - min) * k) / 4);
        return (
          <g key={k}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="currentColor" strokeOpacity={0.12} />
            <text x={m.l - 5} y={y(v) + 4} textAnchor="end" fontSize={11} fill="currentColor" fillOpacity={0.6}>{v}</text>
          </g>
        );
      })}
      {con.map((s, i) => (
        <g key={s.red}>
          <polyline points={s.historial.map((h) => `${x(h.fecha)},${y(h.n)}`).join(" ")} fill="none" stroke={colores[i % colores.length]} strokeWidth={2.5} strokeLinejoin="round" />
          {s.historial.map((h) => (
            <circle key={h.fecha} cx={x(h.fecha)} cy={y(h.n)} r={3} fill={colores[i % colores.length]}>
              <title>{`${NOMBRE_RED[s.red] ?? s.red} · ${fechaCorta(h.fecha)}: ${h.n}`}</title>
            </circle>
          ))}
        </g>
      ))}
      {fechas.map((f, i) => (i % cada === 0 || (i === fechas.length - 1 && i % cada > cada / 2)) && (
        <text key={f} x={x(f)} y={H - 7} textAnchor="middle" fontSize={11} fill="currentColor" fillOpacity={0.6}>{fechaCorta(f)}</text>
      ))}
    </svg>
  );
}

/** Hub de redes: clics desde miarcana.com/redes por día, canal y origen; seguidores de cada red. Solo administración. */
export default async function PaginaHub({ searchParams }: { searchParams: Promise<{ dias?: string }> }) {
  await requerirAdmin();
  const sp = await searchParams;
  const dias = DIAS.includes(Number(sp.dias)) ? Number(sp.dias) : 30;
  const r = await resumenHub(getSupabaseAdmin(), dias);
  const nombres = es.hub.canales as Record<string, { nombre: string }>;
  const nombreCanal = (id: string) => nombres[id]?.nombre ?? id;
  const top = r.porRed.find((x) => x.clics > 0);
  const origen = r.porOrigen[0];
  const activos = new Set(CANALES_HUB.map((c) => c.id));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
          <h1 className="font-display text-4xl font-semibold">Hub de redes</h1>
          <p className="mt-2 text-texto-suave">
            Clics desde <Link href="/redes" target="_blank" className="text-oro-suave">miarcana.com/redes</Link> hacia cada canal, por origen, y seguidores de cada red. Los seguidores se anotan cada mañana con el cron.
          </p>
        </div>
        <nav className="flex gap-1" aria-label="Periodo">
          {DIAS.map((d) => (
            <Link key={d} href={`/admin/hub?dias=${d}`} className={`rounded-lg border px-3 py-1 text-sm ${d === dias ? "border-oro bg-oro/10 text-oro-suave" : "border-borde text-texto-suave hover:text-texto"}`}>
              {d} días
            </Link>
          ))}
        </nav>
      </div>

      {r.error && <Aviso>No se pudieron leer los clics: {r.error}. ¿Está aplicada la migración 0049_hub_redes.sql?</Aviso>}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="tarjeta border-oro/40 bg-oro/10 p-5"><p className="text-sm text-texto-suave">Clics hacia los canales</p><p className="font-display text-4xl text-oro-suave">{n(r.total)}</p><p className="text-xs text-texto-suave">Últimos {dias} días</p></div>
        <div className="tarjeta p-5"><p className="text-sm text-texto-suave">Últimos 7 días</p><p className="font-display text-4xl text-oro-suave">{n(r.total7)}</p><p className="text-xs text-texto-suave">Clics en el hub</p></div>
        <div className="tarjeta p-5"><p className="text-sm text-texto-suave">Canal más visitado</p><p className="font-display text-3xl text-oro-suave">{top ? nombreCanal(top.red) : "—"}</p><p className="text-xs text-texto-suave">{top ? `${n(top.clics)} clics` : "Sin clics todavía"}</p></div>
        <div className="tarjeta p-5"><p className="text-sm text-texto-suave">Mejor origen</p><p className="font-display text-3xl text-oro-suave">{origen?.origen ?? "—"}</p><p className="text-xs text-texto-suave">{origen ? `${n(origen.clics)} clics` : "Sin clics todavía"}</p></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="tarjeta p-5">
          <h2 className="font-display text-2xl font-semibold">Clics por día</h2>
          <Barras porDia={r.porDia} />
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display text-2xl font-semibold">Por canal</h2>
          <table className="mt-2 w-full text-sm">
            <thead><tr className="text-texto-suave"><th className="py-1 text-left font-semibold">Canal</th><th className="py-1 text-right font-semibold">Periodo</th><th className="py-1 text-right font-semibold">7 días</th><th className="py-1 text-right font-semibold">Celular</th></tr></thead>
            <tbody className="divide-y divide-white/10">
              {r.porRed.map((x) => (
                <tr key={x.red} className={activos.has(x.red) ? "" : "text-texto-suave"}>
                  <td className="py-1.5">{nombreCanal(x.red)}{activos.has(x.red) ? "" : " (ya no está en el hub)"}</td>
                  <td className="py-1.5 text-right text-oro-suave">{n(x.clics)}</td>
                  <td className="py-1.5 text-right">{n(x.clics7)}</td>
                  <td className="py-1.5 text-right">{x.clics ? `${Math.round((100 * x.movil) / x.clics)} %` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold">Seguidores</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {r.seguidores.length === 0 && <p className="text-sm text-texto-suave sm:col-span-2 lg:col-span-5">{r.fuentes.length ? "Aún no se han consultado los seguidores." : "No hay credenciales configuradas para consultar seguidores."}</p>}
          {r.seguidores.map((s) => {
            const dif = s.actual !== null && s.hace30 !== null ? s.actual - s.hace30 : null;
            return (
              <div key={s.red} className="tarjeta p-4">
                <p className="text-sm text-texto-suave">{NOMBRE_RED[s.red] ?? s.red}</p>
                <p className="font-display text-3xl text-oro-suave">{s.actual === null ? "—" : n(s.actual)}</p>
                <p className={`text-xs ${dif === null ? "text-texto-suave" : dif >= 0 ? "text-exito" : "text-peligro"}`}>{dif === null ? (s.detalle ?? "Sin dato de hace 30 días") : `${dif >= 0 ? "+" : ""}${n(dif)} en 30 días`}</p>
              </div>
            );
          })}
        </div>
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="tarjeta space-y-3 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-display text-xl font-semibold">Evolución (últimos 90 días)</h3>
              <BotonSeguidores />
            </div>
            <Lineas series={r.seguidores} />
            <p className="text-xs text-texto-suave">Se consultan: {r.fuentes.map((f) => NOMBRE_RED[f] ?? f).join(", ") || "ninguna"}. TikTok necesita el permiso user.info.stats (vuelve a conectar la cuenta en /admin/redes si sale sin dato).</p>
          </div>
          <div className="tarjeta p-5">
            <h3 className="font-display text-xl font-semibold">Por origen (?ref=)</h3>
            <table className="mt-2 w-full text-sm">
              <tbody className="divide-y divide-white/10">
                {r.porOrigen.length === 0 && <tr><td className="py-1.5 text-texto-suave">Sin clics en el periodo</td></tr>}
                {r.porOrigen.map((o) => (
                  <tr key={o.origen}><td className="py-1.5">{o.origen}</td><td className="py-1.5 text-right text-oro-suave">{n(o.clics)}</td></tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-texto-suave">«directo» es quien llegó al hub sin código: escribió la dirección o la abrió desde un enlace sin ?ref=.</p>
          </div>
        </div>
      </section>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl font-semibold">Enlaces del hub con origen</h2>
        <p className="text-sm text-texto-suave">Cada lugar donde pongas el enlace lleva su código, para saber de dónde llega la gente. Escríbelo «red-lugar»: quien entre a la app desde el hub queda con esa red como origen en «Por dónde llegan», y quien abra el bot de Telegram llega con el mismo código.</p>
        <EnlacesHub />
      </section>
    </div>
  );
}
