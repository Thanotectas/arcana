import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { NAKSHATRAS } from "@/lib/vedica/calculo";
import type { IdKoota, PersonaMilan, ResultadoMilan } from "@/lib/vedica/milan";
import { textosVedica } from "@/lib/vedica/textos";

const COLOR_NIVEL: Record<ResultadoMilan["nivel"], string> = { bajo: "#ffb35c", medio: "#f1d99a", bueno: "#7fd6a4", excelente: "#7fd6a4" };

/** Resultado guardado del kundli milan: total de gunas, las dos Lunas, la tabla Ashtakoot y el Manglik de cada uno. */
export function VistaKundliMilan({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  void entrada;
  const r = resultado as unknown as ResultadoMilan;
  if (!r || r.version !== 1 || !Array.isArray(r.kootas)) return null;
  const t = textosVedica(idioma);
  const m = t.milanVista;
  const n = t.nombres;
  const nivel = m.niveles[r.nivel];
  const color = COLOR_NIVEL[r.nivel];
  const radio = 52;
  const circ = 2 * Math.PI * radio;
  // Lo que cada koota compara de cada persona.
  const valorPersona = (p: PersonaMilan, id: IdKoota) => {
    switch (id) {
      case "varna":
        return n.varnas[p.varna];
      case "vashya":
        return n.vashyas[p.vashya];
      case "tara":
        return n.nakshatras[p.nakshatra] ?? NAKSHATRAS[p.nakshatra];
      case "yoni":
        return n.yonis[p.yoni];
      case "graha_maitri":
        return n.grahas[p.senorRashi];
      case "gana":
        return n.ganas[p.gana];
      case "bhakoot":
        return n.rashis[p.rashi];
      case "nadi":
        return n.nadis[p.nadi];
    }
  };

  return (
    <section className="space-y-6">
      <div className="tarjeta grid items-center gap-6 p-5 sm:p-6 md:grid-cols-[auto_1fr]">
        <svg viewBox="0 0 140 140" className="mx-auto h-40 w-40" role="img" aria-label={`${r.total} ${m.de36}`}>
          <circle cx="70" cy="70" r={radio} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          <circle
            cx="70"
            cy="70"
            r={radio}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(r.total / 36) * circ} ${circ}`}
            transform="rotate(-90 70 70)"
          />
          <text x="70" y="74" textAnchor="middle" fontSize="34" fontWeight="700" fill="#f1d99a">
            {r.total}
          </text>
          <text x="70" y="94" textAnchor="middle" fontSize="11" fill="#a89fc0">
            {m.de36}
          </text>
        </svg>
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">
            {r.total} {m.gunas} · {m.de36}
          </p>
          <h2 className="font-display text-3xl font-semibold" style={{ color }}>
            {nivel.titulo}
          </h2>
          <p className="text-texto-suave">{nivel.texto}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Persona p={r.a} idioma={idioma} rol={t.milan.personaA} />
        <Persona p={r.b} idioma={idioma} rol={t.milan.personaB} />
      </div>

      <div className="tarjeta overflow-hidden p-5 sm:p-6">
        <h2 className="font-display mb-3 text-2xl">{m.kootaTitulo}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-borde text-xs uppercase tracking-wider text-texto-suave">
                <th className="py-2 pe-3 text-start font-medium">{m.koota}</th>
                <th className="py-2 pe-3 text-start font-medium">{r.a.nombre}</th>
                <th className="py-2 pe-3 text-start font-medium">{r.b.nombre}</th>
                <th className="py-2 text-end font-medium">{m.puntos}</th>
              </tr>
            </thead>
            <tbody>
              {r.kootas.map((k) => {
                const pct = (k.puntos / k.maximo) * 100;
                const tono = pct >= 75 ? "#7fd6a4" : pct >= 40 ? "#f1d99a" : "#ffb35c";
                return (
                  <tr key={k.id} className="border-b border-borde align-top last:border-0">
                    <td className="py-2.5 pe-3">
                      <span className="font-medium">{m.kootas[k.id].nombre}</span>
                      <span className="block text-xs text-texto-suave">{m.kootas[k.id].sentido}</span>
                    </td>
                    <td className="py-2.5 pe-3">{valorPersona(r.a, k.id)}</td>
                    <td className="py-2.5 pe-3">{valorPersona(r.b, k.id)}</td>
                    <td className="py-2.5 text-end">
                      <span className="font-semibold tabular-nums whitespace-nowrap" style={{ color: tono }} dir="ltr">
                        {k.puntos} / {k.maximo}
                      </span>
                      <span className="ms-auto mt-1 block h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
                        <span className="block h-full rounded-full" style={{ width: `${pct}%`, background: tono }} />
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-oro/40">
                <td className="pt-3 font-display text-lg" colSpan={3}>
                  {m.total}
                </td>
                <td className="pt-3 text-end font-display text-lg whitespace-nowrap text-oro-suave tabular-nums" dir="ltr">
                  {r.total} / 36
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="tarjeta space-y-3 p-5 sm:p-6">
        <h2 className="font-display text-2xl">{m.doshasTitulo}</h2>
        <ul className="space-y-2 text-sm">
          {r.doshas.map((d) => (
            <li key={d} className="rounded-lg bg-oro/10 px-3 py-2">
              {m.doshas[d]}
            </li>
          ))}
          {r.excepciones.map((e) => (
            <li key={e} className="rounded-lg bg-exito/10 px-3 py-2 text-exito">
              {m.excepciones[e]}
            </li>
          ))}
          <li className="rounded-lg bg-white/[0.03] px-3 py-2">{plantilla(m.manglik[r.manglik], { a: r.a.nombre, b: r.b.nombre })}</li>
        </ul>
        <p className="text-sm text-texto-suave">{m.notaCalma}</p>
      </div>
    </section>
  );
}

function Persona({ p, idioma, rol }: { p: PersonaMilan; idioma: Idioma; rol: string }) {
  const t = textosVedica(idioma);
  const m = t.milanVista;
  const n = t.nombres;
  const filas: [string, string][] = [
    [m.varna, n.varnas[p.varna]],
    [m.vashya, n.vashyas[p.vashya]],
    [m.yoni, n.yonis[p.yoni]],
    [m.gana, n.ganas[p.gana]],
    [m.nadi, n.nadis[p.nadi]],
  ];
  return (
    <div className="tarjeta space-y-3 p-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{rol}</p>
        <h3 className="font-display text-2xl">{plantilla(m.lunaDe, { nombre: p.nombre })}</h3>
        <p className="text-oro-suave">
          {n.rashis[p.rashi]} · {n.nakshatras[p.nakshatra] ?? NAKSHATRAS[p.nakshatra]} · {plantilla(t.vista.pada, { n: p.pada })}
        </p>
        {p.horaDesconocida && <p className="text-xs text-texto-suave">{m.sinHora}</p>}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        {filas.map(([k, val]) => (
          <div key={k} className="contents">
            <dt className="text-texto-suave">{k}</dt>
            <dd>{val}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-2 border-t border-borde pt-3 text-sm">
        <span className="text-texto-suave">{t.vista.manglikTitulo}:</span>
        <span className={`rounded-full px-3 py-0.5 ${p.manglik.estado === "no" ? "bg-exito/15 text-exito" : "bg-oro/15 text-oro-suave"}`}>{t.vista.manglikEstados[p.manglik.estado]}</span>
        {p.manglik.atenuado && <span className="text-xs text-texto-suave">{t.vista.manglikAtenuado}</span>}
      </div>
    </div>
  );
}
