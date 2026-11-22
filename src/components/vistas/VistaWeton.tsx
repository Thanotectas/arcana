import type { Idioma } from "@/lib/i18n/idiomas";
import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { HARI, NEPTU_HARI, NEPTU_PASARAN, PASARAN, WUKU, proximoWeton, wetonDeGuardado, type ResultadoWeton } from "@/lib/weton/calculo";
import { textosWeton, type TextosWeton } from "@/lib/weton/textos";

/** Fecha AAAA-MM-DD en el idioma de la persona, sin que el huso horario la mueva un día. */
export function fechaWeton(iso: string, idioma: Idioma) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString(LOCALE_INTL[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** Rueda de un ciclo (7 días o 5 pasaran) con el día de la persona resaltado y su neptu. */
export function RuedaCiclo({ nombres, neptus, activo, titulo, color }: { nombres: readonly string[]; neptus: readonly number[]; activo: number; titulo: string; color: "oro" | "violeta" }) {
  const n = nombres.length;
  const radio = n === 7 ? 72 : 66;
  const acento = color === "oro" ? "var(--oro)" : "var(--violeta)";
  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 200 200" className="h-56 w-56" role="img" aria-label={`${titulo}: ${nombres[activo]}`}>
        <circle cx="100" cy="100" r={radio} fill="none" stroke="var(--borde)" strokeDasharray="2 4" />
        {nombres.map((nombre, i) => {
          const ang = (i / n) * 2 * Math.PI - Math.PI / 2;
          const x = 100 + radio * Math.cos(ang);
          const y = 100 + radio * Math.sin(ang);
          const es = i === activo;
          return (
            <g key={nombre}>
              <circle cx={x} cy={y} r={23} fill={es ? acento : "rgba(255,255,255,0.04)"} stroke={es ? acento : "var(--borde)"} />
              <text x={x} y={y - 1} textAnchor="middle" fontSize="10" fontWeight={es ? 700 : 500} fill={es ? "var(--noche)" : "var(--texto)"}>
                {nombre}
              </text>
              <text x={x} y={y + 11} textAnchor="middle" fontSize="9" fill={es ? "var(--noche)" : "var(--texto-suave)"}>
                {neptus[i]}
              </text>
            </g>
          );
        })}
        <text x="100" y="98" textAnchor="middle" fontSize="15" fontWeight={700} fill={acento}>
          {nombres[activo]}
        </text>
        <text x="100" y="116" textAnchor="middle" fontSize="11" fill="var(--texto-suave)">
          {neptus[activo]}
        </text>
      </svg>
      <figcaption className="text-xs uppercase tracking-[0.2em] text-texto-suave">{titulo}</figcaption>
    </figure>
  );
}

/** Las 30 semanas del Pawukon con la de la persona resaltada. */
function RejillaWuku({ activo, t }: { activo: number; t: TextosWeton }) {
  return (
    <div>
      <ol className="grid grid-cols-5 gap-1 sm:grid-cols-6" aria-label={t.wuku}>
        {WUKU.map((w, i) => (
          <li
            key={w}
            title={`${i + 1}. ${w}`}
            aria-current={i === activo ? "true" : undefined}
            className={`truncate rounded-md border px-1 py-1 text-center text-[10px] leading-tight ${i === activo ? "border-oro bg-oro/20 font-semibold text-oro" : "border-borde text-texto-suave"}`}
          >
            {w}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Ficha del weton de una persona: nombre, weton, neptu, laku, wuku y watak. También la usa la vista de pareja. */
export function FichaWeton({ r, t, nombre, idioma, compacta = false }: { r: ResultadoWeton; t: TextosWeton; nombre?: string; idioma: Idioma; compacta?: boolean }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{nombre || t.tuWeton}</p>
          <p className={`font-display font-semibold text-oro ${compacta ? "text-3xl" : "text-4xl sm:text-5xl"}`}>{r.weton}</p>
          <p className="text-sm text-texto-suave">
            <bdi>
              {r.hari.jawa} {r.pasaran.nombre}
            </bdi>{" "}
            · <bdi>{fechaWeton(r.fecha, idioma)}</bdi>
          </p>
        </div>
        <div className="rounded-2xl border border-oro/40 bg-oro/10 px-4 py-2 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-texto-suave">{t.neptu}</p>
          <p className="font-display text-4xl font-semibold text-oro">{r.neptu}</p>
          <p className="text-[11px] text-texto-suave" dir="ltr">
            {r.hari.neptu} + {r.pasaran.neptu}
          </p>
        </div>
      </div>
      {r.despuesAtardecer && <p className="rounded-xl border border-dashed border-borde px-3 py-2 text-xs text-texto-suave">🌇 {plantilla(t.nacioTrasAtardecer, { fecha: fechaWeton(r.fechaJawa, idioma) })}</p>}
      <dl className={`grid gap-3 ${compacta ? "" : "sm:grid-cols-2"}`}>
        <div className="rounded-xl bg-white/[0.03] p-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-texto-suave">{t.laku}</dt>
          <dd className="mt-1 font-semibold">{r.laku}</dd>
          <dd className="text-sm text-texto-suave">{t.laku7a18[r.neptu]}</dd>
        </div>
        <div className="rounded-xl bg-white/[0.03] p-3">
          <dt className="text-xs uppercase tracking-[0.2em] text-texto-suave">{t.wuku}</dt>
          <dd className="mt-1 font-semibold">{r.wuku.nombre}</dd>
          <dd className="text-sm text-texto-suave">{plantilla(t.wukuNota, { n: r.wuku.indice + 1 })}</dd>
        </div>
      </dl>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-texto-suave">{t.watak}</p>
        <p className="text-sm">
          <span className="font-semibold text-oro">{r.hari.nombre}</span> · {t.watakHari[r.hari.indice]}
        </p>
        <p className="text-sm">
          <span className="font-semibold text-violeta-suave">{r.pasaran.nombre}</span> · {t.watakPasaran[r.pasaran.indice]}
        </p>
      </div>
    </div>
  );
}

/** Resultado guardado del weton: la ficha, las dos ruedas (7 y 5 días) y el Pawukon. */
export function VistaWeton({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  const r = wetonDeGuardado(resultado);
  if (!r) return null;
  const t = textosWeton(idioma);
  const nombre = typeof entrada.nombre === "string" ? entrada.nombre : undefined;
  const proximo = proximoWeton(r, new Date().toISOString().slice(0, 10));
  return (
    <section className="space-y-4">
      <div className="tarjeta p-5 sm:p-6">
        <FichaWeton r={r} t={t} nombre={nombre} idioma={idioma} />
      </div>
      <div className="tarjeta space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap justify-center gap-6">
          <RuedaCiclo nombres={HARI} neptus={NEPTU_HARI} activo={r.hari.indice} titulo={t.ciclo7} color="oro" />
          <RuedaCiclo nombres={PASARAN} neptus={NEPTU_PASARAN} activo={r.pasaran.indice} titulo={t.ciclo5} color="violeta" />
        </div>
        <p className="text-center text-sm text-texto-suave">
          {t.ciclosNota} <span className="font-semibold text-texto">{plantilla(t.proximo, { fecha: fechaWeton(proximo, idioma) })}</span>
        </p>
      </div>
      <div className="tarjeta space-y-3 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-texto-suave">
          {t.wuku} · {r.wuku.nombre}
        </p>
        <RejillaWuku activo={r.wuku.indice} t={t} />
      </div>
    </section>
  );
}
