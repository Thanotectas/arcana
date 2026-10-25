import { SIGNOS, signoPorId, signoPorLongitud, formatoGrado } from "@/lib/zodiaco";
import type { ResultadoRevolucion } from "@/lib/astro/revolucion";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";

const COLOR_ELEMENTO: Record<string, string> = { fuego: "#ff8a5b", tierra: "#9ad07f", aire: "#8fc7ff", agua: "#b28dff" };
const redondear = (v: number) => Math.round(v * 100) / 100;
/** Símbolo del signo como texto (sin el selector, algunos teléfonos lo pintan como emoji). */
const comoTexto = (simbolo: string) => `${simbolo}\uFE0E`;

/**
 * Cabecera de la revolución solar: el Sol arriba, en su grado natal, recorre
 * el zodiaco y vuelve al mismo punto (eso es el «regreso»); al lado, cuándo y
 * dónde ocurre y las tres claves del año: Ascendente, Luna y Sol.
 */
export function RetornoSolar({ r, horaDesconocida, t, idioma }: { r: ResultadoRevolucion; horaDesconocida: boolean; t: Diccionario; idioma: Idioma }) {
  const sol = r.planetas.find((p) => p.cuerpo === "sol");
  const luna = r.planetas.find((p) => p.cuerpo === "luna");
  if (!sol) return null;
  const signoSol = signoPorId(sol.signo);
  const asc = signoPorLongitud(r.casas.ascendente);
  const signoLuna = luna ? signoPorId(luna.signo) : undefined;
  const fecha = new Intl.DateTimeFormat(LOCALE_INTL[idioma], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${r.fechaLocal}T12:00:00Z`));

  // El Sol natal arriba y el zodiaco en sentido antihorario, como en la rueda.
  const C = 150;
  const punto = (lon: number, radio: number) => {
    const a = ((90 + (lon - sol.longitud)) * Math.PI) / 180;
    return [redondear(C + radio * Math.cos(a)), redondear(C - radio * Math.sin(a))] as const;
  };
  const [sx, sy] = punto(sol.longitud, 104);
  const t2 = t.revolucion.retorno;
  const claves = [
    { etiqueta: t2.asc, simbolo: comoTexto(asc.simbolo), valor: `${asc.nombre} ${formatoGrado(r.casas.ascendente)}`, nota: horaDesconocida ? "" : plantilla(t2.ascCasa, { n: r.ascEnCasaNatal }) },
    signoLuna && luna ? { etiqueta: t2.luna, simbolo: comoTexto(signoLuna.simbolo), valor: `${signoLuna.nombre} ${formatoGrado(luna.longitud)}`, nota: plantilla(t2.casa, { n: luna.casa }) } : null,
    signoSol ? { etiqueta: t2.sol, simbolo: comoTexto(signoSol.simbolo), valor: `${signoSol.nombre} ${formatoGrado(sol.longitud)}`, nota: plantilla(t2.casa, { n: sol.casa }) } : null,
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <section className="tarjeta grid items-center gap-6 overflow-hidden p-5 sm:grid-cols-[260px_1fr] sm:p-6">
      <svg viewBox="0 0 300 300" className="mx-auto w-full max-w-[260px]" aria-hidden>
        <defs>
          <radialGradient id="retorno-sol">
            <stop offset="0" stopColor="#fff6d6" />
            <stop offset="0.45" stopColor="#ffd25e" />
            <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="retorno-fondo">
            <stop offset="0" stopColor="#2a1a5e" stopOpacity="0.7" />
            <stop offset="1" stopColor="#0b0716" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="retorno-oro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1c4" />
            <stop offset="1" stopColor="#d9b45a" />
          </linearGradient>
        </defs>
        <circle cx={C} cy={C} r={146} fill="url(#retorno-fondo)" />
        <circle cx={C} cy={C} r={136} fill="none" stroke="rgba(241,217,154,0.35)" />
        {SIGNOS.map((s, i) => {
          const [x, y] = punto(i * 30 + 15, 124);
          const [x1, y1] = punto(i * 30, 112);
          const [x2, y2] = punto(i * 30, 136);
          return (
            <g key={s.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(241,217,154,0.2)" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={COLOR_ELEMENTO[s.elemento]} opacity={0.85}>
                {`${s.simbolo}︎`}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={112} fill="none" stroke="rgba(241,217,154,0.2)" />
        {/* El camino del año: arranca en el Sol, da la vuelta y vuelve a él */}
        <circle cx={C} cy={C} r={104} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
        <circle
          cx={C}
          cy={C}
          r={104}
          fill="none"
          stroke="url(#retorno-oro)"
          strokeWidth={3}
          strokeLinecap="round"
          pathLength={1}
          className="retorno-camino"
          transform={`rotate(-90 ${C} ${C}) scale(1 -1) translate(0 ${-2 * C})`}
        />
        <circle cx={sx} cy={sy} r={26} fill="url(#retorno-sol)" className="retorno-brillo" />
        <circle cx={sx} cy={sy} r={9} fill="#ffd25e" stroke="#fff6d6" strokeWidth={1.5} />
        <circle cx={sx} cy={sy} r={2.4} fill="#a87a2a" />
        <text x={C} y={C - 10} textAnchor="middle" fontFamily="var(--font-display), serif" fontSize={38} fontWeight={600} fill="#f1d99a">
          {`${r.anio}`}
        </text>
        <text x={C} y={C + 22} textAnchor="middle" fontSize={13} letterSpacing="0.2em" fill="#b7a5ff">
          {`→ ${r.anio + 1}`}
        </text>
      </svg>

      <div className="space-y-4 text-center sm:text-left">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t2.titulo}</p>
          <p className="font-display mt-1 text-3xl text-oro-suave">
            {plantilla(t2.vuelve, { signo: signoSol ? `${comoTexto(signoSol.simbolo)} ${signoSol.nombre}` : "", grado: formatoGrado(sol.longitud) })}
          </p>
          <p className="mt-1 text-sm text-texto-suave">{plantilla(t2.cuando, { fecha, hora: r.horaLocal, lugar: r.lugar?.lugar ?? "" })}</p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-3">
          {claves.map((c) => (
            <li key={c.etiqueta} className="rounded-xl border border-borde bg-superficie-2/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.15em] text-violeta-suave">{c.etiqueta}</p>
              <p className="mt-1 font-display text-lg leading-tight text-texto">
                <span className="text-oro-suave">{c.simbolo}</span> {c.valor}
              </p>
              {c.nota && <p className="mt-0.5 text-xs text-texto-suave">{c.nota}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
