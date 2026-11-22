import type { Idioma } from "@/lib/i18n/idiomas";
import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { ANIOS_DASHA, NAKSHATRAS, formatoGradoVedico, type IdGraha, type ResultadoKundli } from "@/lib/vedica/calculo";
import { textosVedica } from "@/lib/vedica/textos";
import { CartaKundli } from "./CartaKundli";

/** Fecha "YYYY-MM-DD" en el idioma de la persona (en UTC: los dashas se guardan como fechas, sin hora). */
export function fechaVedica(iso: string, idioma: Idioma, mes: "long" | "short" = "long") {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(LOCALE_INTL[idioma], { day: "numeric", month: mes, year: "numeric", timeZone: "UTC" });
}

export function marcaRetro(idioma: Idioma) {
  return idioma === "hi" ? "व" : idioma === "ar" ? "ر" : "R";
}

const COLOR_GRAHA: Record<IdGraha, string> = {
  surya: "#f2a33a",
  chandra: "#e8e2f5",
  mangal: "#e5604d",
  budh: "#5fc48a",
  guru: "#f1d99a",
  shukra: "#f3a6c8",
  shani: "#6f86d6",
  rahu: "#8b6cf6",
  ketu: "#a07c5a",
};

const esNodo = (id: IdGraha) => id === "rahu" || id === "ketu";

/** Resultado guardado del kundli: resumen, carta del norte de la India, tabla de grahas, dashas y Manglik. */
export function VistaKundli({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  void entrada;
  const r = resultado as unknown as ResultadoKundli;
  if (!r || r.version !== 1 || !Array.isArray(r.grahas)) return null;
  const t = textosVedica(idioma);
  const v = t.vista;
  const n = t.nombres;
  const nak = (i: number) => n.nakshatras[i] ?? NAKSHATRAS[i];
  const actual = r.dasha.actual;
  const actualMaha = actual ? r.dasha.mahadashas.find((m) => m.inicio === actual.maha.inicio) : undefined;

  const resumen: { etiqueta: string; valor: string; detalle?: string }[] = [
    r.lagna
      ? { etiqueta: v.lagna, valor: n.rashis[r.lagna.rashi], detalle: `${formatoGradoVedico(r.lagna.grado)} · ${nak(r.lagna.nakshatra)}` }
      : { etiqueta: v.chandraLagna, valor: n.rashis[r.rashiCasa1] },
    { etiqueta: v.rashiLunar, valor: n.rashis[r.luna.rashi] },
    { etiqueta: v.nakshatra, valor: nak(r.luna.nakshatra), detalle: plantilla(v.pada, { n: r.luna.pada }) },
  ];
  if (actual) {
    resumen.push({
      etiqueta: `${v.mahadasha} / ${v.antardasha}`,
      valor: `${n.grahas[actual.maha.senor]} / ${n.grahas[actual.antar.senor]}`,
      detalle: plantilla(v.hasta, { fecha: fechaVedica(actual.antar.fin, idioma, "short") }),
    });
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {resumen.map((x) => (
          <div key={x.etiqueta} className="tarjeta p-4">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{x.etiqueta}</p>
            <p className="font-display mt-1 text-xl font-semibold text-oro-suave">{x.valor}</p>
            {x.detalle && <p className="text-xs text-texto-suave">{x.detalle}</p>}
          </div>
        ))}
      </div>

      {r.horaDesconocida && <p className="tarjeta p-4 text-sm text-texto-suave">{v.sinHora}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="tarjeta space-y-3 p-5">
          <div>
            <h2 className="font-display text-2xl">{v.cartaTitulo}</h2>
            <p className="text-xs text-texto-suave">{v.cartaNota}</p>
          </div>
          <CartaKundli
            rashiCasa1={r.rashiCasa1}
            grahas={r.grahas}
            abreviaturas={n.abreviaturas}
            marcaCasa1={r.lagna ? n.abreviaturas.lagna : v.chandraLagna}
            marcaRetro={marcaRetro(idioma)}
            titulo={v.cartaTitulo}
          />
          <p className="text-center text-xs text-texto-suave">
            {v.ayanamsa}: <span dir="ltr">{formatoGradoVedico(r.ayanamsa)}</span>
          </p>
        </div>

        <div className="tarjeta overflow-hidden p-5">
          <h2 className="font-display mb-3 text-2xl">{v.tablaTitulo}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-borde text-xs uppercase tracking-wider text-texto-suave">
                  <th className="py-2 pe-2 text-start font-medium">{v.graha}</th>
                  <th className="py-2 pe-2 text-start font-medium">{v.rashi}</th>
                  <th className="py-2 pe-2 text-start font-medium">{v.grado}</th>
                  <th className="py-2 pe-2 text-start font-medium">{v.nakshatra}</th>
                  <th className="py-2 text-center font-medium">{v.casa}</th>
                </tr>
              </thead>
              <tbody>
                {r.lagna && (
                  <tr className="border-b border-borde text-oro-suave">
                    <td className="py-2 pe-2 font-medium">{v.lagna}</td>
                    <td className="py-2 pe-2">{n.rashis[r.lagna.rashi]}</td>
                    <td className="py-2 pe-2 tabular-nums"><span dir="ltr">{formatoGradoVedico(r.lagna.grado)}</span></td>
                    <td className="py-2 pe-2">
                      {nak(r.lagna.nakshatra)} <span className="text-texto-suave">· {r.lagna.pada}</span>
                    </td>
                    <td className="py-2 text-center">1</td>
                  </tr>
                )}
                {r.grahas.map((g) => {
                  const notas = [g.retrogrado && !esNodo(g.id) ? v.retrogrado : null, g.dignidad ? v.dignidades[g.dignidad] : null].filter(Boolean);
                  return (
                    <tr key={g.id} className="border-b border-borde last:border-0">
                      <td className="py-2 pe-2">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLOR_GRAHA[g.id] }} aria-hidden />
                          <span className="font-medium">{n.grahas[g.id]}</span>
                          <span className="hidden text-xs text-texto-suave sm:inline">{n.abreviaturas[g.id]}</span>
                        </span>
                        {notas.length > 0 && <span className="block ps-[1.125rem] text-xs text-texto-suave">{notas.join(" · ")}</span>}
                      </td>
                      <td className="py-2 pe-2">{n.rashis[g.rashi]}</td>
                      <td className="py-2 pe-2 tabular-nums"><span dir="ltr">{formatoGradoVedico(g.grado)}</span></td>
                      <td className="py-2 pe-2">
                        {nak(g.nakshatra)} <span className="text-texto-suave">· {g.pada}</span>
                      </td>
                      <td className="py-2 text-center tabular-nums">{g.casa}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <LineaDasha r={r} idioma={idioma} />

      <div className="grid gap-6 md:grid-cols-2">
        {actual && actualMaha && (
          <div className="tarjeta p-5">
            <h3 className="font-display mb-3 text-xl">{plantilla(v.antardashasDe, { graha: n.grahas[actualMaha.senor] })}</h3>
            <ol className="space-y-1.5 text-sm">
              {actualMaha.antardashas.map((a) => {
                const esActual = a.inicio === actual.antar.inicio;
                return (
                  <li key={a.inicio} className={`flex flex-wrap items-center justify-between gap-x-3 rounded-lg px-3 py-1.5 ${esActual ? "bg-violeta/20 ring-1 ring-violeta/50" : ""}`}>
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_GRAHA[a.senor] }} aria-hidden />
                      {n.grahas[actualMaha.senor]} / {n.grahas[a.senor]}
                      {esActual && <span className="rounded-full bg-violeta/40 px-2 text-[0.65rem] uppercase tracking-wider">{v.ahora}</span>}
                    </span>
                    <span className="text-xs text-texto-suave tabular-nums">
                      {fechaVedica(a.inicio, idioma, "short")} – {fechaVedica(a.fin, idioma, "short")}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        <div className="space-y-6">
          {r.dasha.proximos.length > 0 && (
            <div className="tarjeta p-5">
              <h3 className="font-display mb-3 text-xl">{v.proximos}</h3>
              <ol className="space-y-2 text-sm">
                {r.dasha.proximos.map((p) => (
                  <li key={p.inicio} className="flex flex-wrap items-center justify-between gap-x-3">
                    <span>
                      {n.grahas[p.maha]} / <strong className="text-oro-suave">{n.grahas[p.senor]}</strong>
                    </span>
                    <span className="text-xs text-texto-suave">{fechaVedica(p.inicio, idioma, "short")}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <Manglik r={r} idioma={idioma} />
        </div>
      </div>
    </section>
  );
}

function LineaDasha({ r, idioma }: { r: ResultadoKundli; idioma: Idioma }) {
  const t = textosVedica(idioma);
  const v = t.vista;
  const n = t.nombres;
  const ms = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();
  const nacer = new Date(r.fechaUtc).getTime();
  const total = ms(r.dasha.mahadashas[r.dasha.mahadashas.length - 1].fin) - nacer;
  const posAhora = Math.min(100, Math.max(0, ((new Date(r.fechaCalculo).getTime() - nacer) / total) * 100));
  const b = r.dasha.balance;
  const anio = (iso: string) => iso.slice(0, 4);

  return (
    <div className="tarjeta space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="font-display text-2xl">{v.dashaTitulo}</h2>
        <p className="text-xs text-texto-suave">
          {v.dashaNota} {plantilla(v.balance, { graha: n.grahas[b.senor], a: b.anios, m: b.meses, d: b.dias })}
        </p>
      </div>
      <div className="relative pt-5">
        <div className="flex h-9 overflow-hidden rounded-lg ring-1 ring-borde">
          {r.dasha.mahadashas.map((m, i) => {
            const ancho = ((ms(m.fin) - (i === 0 ? nacer : ms(m.inicio))) / total) * 100;
            const esActual = r.dasha.actual?.maha.inicio === m.inicio;
            return (
              <div
                key={m.inicio}
                className={`flex items-center justify-center overflow-hidden border-e border-noche text-[0.7rem] font-semibold text-noche last:border-0 ${esActual ? "" : "opacity-55"}`}
                style={{ width: `${ancho}%`, background: COLOR_GRAHA[m.senor] }}
                title={`${n.grahas[m.senor]} ${anio(i === 0 ? r.fechaUtc : m.inicio)}–${anio(m.fin)}`}
              >
                {ancho > 4 ? n.abreviaturas[m.senor] : ""}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center rtl:translate-x-1/2" style={{ insetInlineStart: `${posAhora}%` }}>
          <span className="rounded bg-oro px-1.5 text-[0.6rem] font-bold uppercase leading-4 text-noche">{v.ahora}</span>
          <span className="w-0.5 flex-1 bg-oro" />
        </div>
      </div>
      <ol className="grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-3">
        {r.dasha.mahadashas.map((m, i) => {
          const esActual = r.dasha.actual?.maha.inicio === m.inicio;
          return (
            <li key={m.inicio} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 ${esActual ? "bg-violeta/20 ring-1 ring-violeta/50" : "bg-white/[0.02]"}`}>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: COLOR_GRAHA[m.senor] }} aria-hidden />
                <span className={esActual ? "font-semibold text-oro-suave" : ""}>{n.grahas[m.senor]}</span>
                <span className="text-xs text-texto-suave">{ANIOS_DASHA[m.senor]}</span>
              </span>
              <span className="text-xs text-texto-suave tabular-nums" dir="ltr">
                {anio(i === 0 ? r.fechaUtc : m.inicio)}–{anio(m.fin)}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Manglik({ r, idioma }: { r: ResultadoKundli; idioma: Idioma }) {
  const v = textosVedica(idioma).vista;
  const m = r.manglik;
  return (
    <div className="tarjeta space-y-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-xl">{v.manglikTitulo}</h3>
        <span className={`rounded-full px-3 py-0.5 text-sm ${m.estado === "no" ? "bg-exito/15 text-exito" : "bg-oro/15 text-oro-suave"}`}>{v.manglikEstados[m.estado]}</span>
      </div>
      <p className="text-sm text-texto-suave">{m.casaDesdeLagna === null ? plantilla(v.manglikDetalleLuna, { luna: m.casaDesdeLuna }) : plantilla(v.manglikDetalle, { lagna: m.casaDesdeLagna, luna: m.casaDesdeLuna })}</p>
      {m.atenuado && <p className="text-sm text-texto-suave">{v.manglikAtenuado}</p>}
      {m.estado !== "no" && <p className="text-sm">{v.manglikNota}</p>}
    </div>
  );
}
