import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { formatoCOP } from "@/lib/creditos";
import { nombreOrigen } from "@/lib/resumen/semanal";
import { calcularEmbudoAdmin } from "@/lib/embudo/datos";
import { type Agrupacion, BASE_DE, EXPLICACION_PASO, type FilaEmbudo, mayorPerdida, NOMBRE_PASO, PASOS, porcentaje, SIN_PAIS } from "@/lib/embudo/calculo";

export const metadata: Metadata = { title: "Embudo", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const DIAS = [7, 30, 90];
const n = (x: number) => x.toLocaleString("es-CO");
const paises = new Intl.DisplayNames(["es"], { type: "region" });
const fechaCorta = (fecha: string) => new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));

function nombreClave(clave: string, por: Agrupacion) {
  if (clave === "otros") return "Otros";
  if (por === "origen") return nombreOrigen(clave);
  if (clave === SIN_PAIS) return "Sin dato";
  try {
    return paises.of(clave) ?? clave;
  } catch {
    return clave;
  }
}

function ingresos(f: FilaEmbudo) {
  const partes = [f.cop ? formatoCOP(f.cop) : "", f.usdCentavos ? `US$ ${(f.usdCentavos / 100).toFixed(2)}` : ""].filter(Boolean);
  return partes.join(" + ") || "—";
}

/** Embudo por cohorte: de las cuentas creadas en el periodo, cuántas llegan a cada paso. Solo administración. */
export default async function PaginaEmbudo({ searchParams }: { searchParams: Promise<{ dias?: string; por?: string }> }) {
  await requerirAdmin();
  const sp = await searchParams;
  const dias = DIAS.includes(Number(sp.dias)) ? Number(sp.dias) : 30;
  const por: Agrupacion = sp.por === "pais" ? "pais" : "origen";
  const r = await calcularEmbudoAdmin(getSupabaseAdmin(), dias, por);
  const t = r.total;
  const perdida = mayorPerdida(t);
  const maximo = Math.max(1, ...PASOS.map((p) => t[p]));
  const enlace = (d: number, p: Agrupacion) => `/admin/embudo?dias=${d}&por=${p}`;
  const boton = (activo: boolean) => `rounded-lg border px-3 py-1 text-sm ${activo ? "border-oro bg-oro/10 text-oro-suave" : "border-borde text-texto-suave hover:text-texto"}`;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
          <h1 className="font-display text-4xl font-semibold">Embudo</h1>
          <p className="mt-2 max-w-2xl text-texto-suave">
            De las cuentas creadas desde el {fechaCorta(r.desde)}, cuántas llegaron a cada paso hasta hoy. Las cuentas de los últimos días aún no han tenido tiempo de pagar.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <nav className="flex gap-1" aria-label="Periodo">
            {DIAS.map((d) => <Link key={d} href={enlace(d, por)} className={boton(d === dias)}>{d} días</Link>)}
          </nav>
          <nav className="flex gap-1" aria-label="Agrupar por">
            <Link href={enlace(dias, "origen")} className={boton(por === "origen")}>Por origen</Link>
            <Link href={enlace(dias, "pais")} className={boton(por === "pais")}>Por país</Link>
          </nav>
        </div>
      </div>

      {r.sinMigracion && (
        <p className="tarjeta border-peligro/40 p-4 text-sm text-peligro">
          Falta aplicar la migración 0050_embudo.sql en el SQL Editor de Supabase: sin ella no se cuentan las visitas ni el país de las cuentas nuevas.
        </p>
      )}
      {!r.sinMigracion && (!r.primeraVisita || r.primeraVisita > r.desde) && (
        <p className="tarjeta p-4 text-sm text-texto-suave">
          {r.primeraVisita ? `Las visitas se cuentan desde el ${fechaCorta(r.primeraVisita)}` : "Todavía no hay visitas contadas"}: el paso de visitas a cuentas solo vale para periodos posteriores.
          {por === "pais" && r.sinPais > 0 && ` ${n(r.sinPais)} cuentas del periodo se crearon antes de guardar el país y aparecen como «Sin dato».`}
        </p>
      )}

      <section className="tarjeta space-y-4 p-5">
        <h2 className="font-display text-2xl font-semibold">Todo el periodo</h2>
        <ol className="space-y-3">
          {PASOS.map((p) => {
            const base = BASE_DE[p];
            const pct = base ? porcentaje(t[p], t[base]) : null;
            return (
              <li key={p}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span title={EXPLICACION_PASO[p]}>{NOMBRE_PASO[p]}</span>
                  <span>
                    <span className="font-semibold text-oro-suave">{n(t[p])}</span>
                    {pct !== null && <span className="ml-2 text-xs text-texto-suave">{pct} % de «{NOMBRE_PASO[base!].toLowerCase()}»</span>}
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-white/5">
                  <div className={`h-2 rounded-full ${perdida?.hasta === p ? "bg-peligro/70" : "bg-oro/60"}`} style={{ width: `${Math.max(t[p] ? 1 : 0, (100 * t[p]) / maximo)}%` }} />
                </div>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-texto-suave">
          {perdida
            ? <>Donde más gente se pierde: de «{NOMBRE_PASO[perdida.desde].toLowerCase()}» a «{NOMBRE_PASO[perdida.hasta].toLowerCase()}», solo sigue el {perdida.siguen} %.</>
            : "Aún hay muy pocas personas en el periodo para decir dónde se pierden (hacen falta al menos 10 en un paso)."}
          {" "}Ingresos de estas cuentas: <span className="text-oro-suave">{ingresos(t)}</span>.
        </p>
      </section>

      <section className="tarjeta p-5">
        <h2 className="font-display text-2xl font-semibold">{por === "origen" ? "Por origen" : "Por país"}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="text-texto-suave">
                <th className="py-1 text-left align-bottom font-semibold">{por === "origen" ? "Origen" : "País"}</th>
                {PASOS.map((p) => <th key={p} className="py-1 pl-3 text-right align-bottom font-semibold" title={EXPLICACION_PASO[p]}>{NOMBRE_PASO[p]}</th>)}
                <th className="py-1 pl-3 text-right align-bottom font-semibold">Pago por cuenta</th>
                <th className="py-1 pl-3 text-right align-bottom font-semibold">Ingresos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {r.filas.length === 0 && <tr><td colSpan={PASOS.length + 3} className="py-2 text-texto-suave">Sin cuentas ni visitas en el periodo.</td></tr>}
              {r.filas.map((f) => {
                const pago = porcentaje(f.pagaron, f.cuentas);
                return (
                  <tr key={f.clave}>
                    <td className="py-1.5">{nombreClave(f.clave, por)}</td>
                    {PASOS.map((p) => <td key={p} className="py-1.5 pl-3 text-right">{f[p] ? n(f[p]) : "—"}</td>)}
                    <td className="whitespace-nowrap py-1.5 pl-3 text-right text-oro-suave">{pago === null ? "—" : `${pago} %`}</td>
                    <td className="whitespace-nowrap py-1.5 pl-3 text-right">{ingresos(f)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-texto-suave">
          El origen es la primera red por la que llegó la persona (utm, enlaces cortos o la red de la que venía), guardado 30 días. Con pocas cuentas, un porcentaje puede cambiar mucho por una sola persona.
        </p>
      </section>
    </div>
  );
}
