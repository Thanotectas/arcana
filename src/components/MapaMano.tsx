import type { Diccionario } from "@/lib/i18n/diccionarios";
import { COLOR_LINEA, LINEAS, MONTES, type DetalleMano, type LineaMano, type Mano, type Monte, type TrazosMano } from "@/lib/quiromancia";

type T = Diccionario["quiromancia"];

const ORO = "#f1d99a";
const SIMBOLO: Record<Monte, string> = { jupiter: "♃", saturno: "♄", sol: "☉", mercurio: "☿", venus: "♀", luna: "☽", marte: "♂" };
/** Centro de cada monte sobre una mano derecha vista de frente (el pulgar a la izquierda). */
const POSICION: Record<Monte, [number, number]> = { jupiter: [76, 146], saturno: [108, 141], sol: [140, 145], mercurio: [169, 154], marte: [124, 196], venus: [80, 226], luna: [162, 226] };
/** Recorrido típico de cada línea, para el dibujo (no es el de la foto). */
const LINEA_TIPO: Record<LineaMano, string> = {
  corazon: "M 182 162 C 160 158 132 160 104 150",
  cabeza: "M 64 170 C 96 168 130 178 168 194",
  vida: "M 70 166 C 92 186 98 226 96 262",
  destino: "M 124 266 C 122 230 116 196 110 150",
};
const glifo = (s: string) => `${s}︎`;

/**
 * Mano dibujada con los siete montes (los más marcados en la foto brillan) y
 * las cuatro líneas en su lugar típico. Se refleja si la foto es de la mano
 * izquierda.
 */
function DibujoMano({ mano, montes, lineas, t }: { mano: Mano; montes: Monte[]; lineas: LineaMano[]; t: T }) {
  const izquierda = mano === "izquierda";
  const x = (v: number) => (izquierda ? 220 - v : v);
  return (
    <svg viewBox="0 0 220 280" className="mx-auto w-full max-w-[16rem]" role="img" aria-label={t.mapaTitulo}>
      <defs>
        <linearGradient id="mano-piel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a5e" />
          <stop offset="1" stopColor="#160f2c" />
        </linearGradient>
        <radialGradient id="mano-brillo">
          <stop offset="0" stopColor={ORO} stopOpacity="0.55" />
          <stop offset="1" stopColor={ORO} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={izquierda ? "translate(220 0) scale(-1 1)" : undefined} fill="url(#mano-piel)" stroke="rgba(241,217,154,0.7)" strokeWidth="1.4" strokeLinejoin="round">
        {/* Dedos (índice, medio, anular, meñique), el pulgar y la palma encima */}
        <rect x="62" y="36" width="28" height="104" rx="14" />
        <rect x="94" y="18" width="29" height="118" rx="14.5" />
        <rect x="127" y="28" width="28" height="110" rx="14" />
        <rect x="158" y="60" width="24" height="88" rx="12" />
        <path d="M 66 214 Q 34 196 24 158 Q 18 132 32 126 Q 46 121 54 140 Q 60 158 72 170 Z" />
        <path d="M 58 124 Q 120 116 184 132 Q 192 196 174 246 Q 152 274 112 274 Q 74 272 62 244 Q 48 196 58 124 Z" />
        {/* Las cuatro líneas en su lugar habitual */}
        {LINEAS.map((l, i) => (
          <path
            key={l}
            d={LINEA_TIPO[l]}
            fill="none"
            stroke={COLOR_LINEA[l]}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity={lineas.includes(l) ? 0.9 : 0.25}
            strokeDasharray={lineas.includes(l) ? undefined : "3 4"}
            pathLength={1}
            className={lineas.includes(l) ? "mano-linea" : undefined}
            style={{ animationDelay: `${0.3 + i * 0.35}s` }}
          />
        ))}
      </g>
      {/* Montes (sin reflejar el texto) */}
      {MONTES.map((m, i) => {
        const [cx, cy] = POSICION[m];
        const marcado = montes.includes(m);
        return (
          <g key={m}>
            {marcado && <circle cx={x(cx)} cy={cy} r="20" fill="url(#mano-brillo)" className="mano-monte" style={{ transformOrigin: `${x(cx)}px ${cy}px`, animationDelay: `${1.6 + i * 0.1}s` }} />}
            <circle cx={x(cx)} cy={cy} r={marcado ? 10 : 8} fill="#120c22" stroke={ORO} strokeWidth={marcado ? 1.6 : 0.8} strokeOpacity={marcado ? 1 : 0.5} />
            <text x={x(cx)} y={cy + 4} textAnchor="middle" fontSize={marcado ? 12 : 10} fill={ORO} opacity={marcado ? 1 : 0.6}>{glifo(SIMBOLO[m])}</text>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Lo que la foto dice además de las líneas: el tipo de mano, los montes más
 * marcados y una ficha por línea (cómo se ve y qué representa). Las lecturas
 * anteriores solo tienen los trazos: se muestran el mapa y el sentido de cada
 * línea sin los rasgos.
 */
export function MapaMano({ detalle, trazos, mano, dominante, t }: { detalle: DetalleMano; trazos: TrazosMano | null; mano: Mano; dominante: Mano; t: T }) {
  const vistas = LINEAS.filter((l) => trazos?.[l] || detalle.rasgos[l]);
  return (
    <section className="tarjeta space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.mapaTitulo}</p>
          <p className="text-sm text-texto-suave">{t.mapaNota}</p>
        </div>
        <span className="rounded-full border border-oro/40 bg-oro/10 px-3 py-1 text-xs text-oro-suave">
          {mano === dominante ? t.manoDominanteChip : t.manoNoDominanteChip}
        </span>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,16rem)_1fr]">
        <DibujoMano mano={mano} montes={detalle.montes} lineas={vistas} t={t} />
        <div className="space-y-5 text-sm">
          {detalle.forma && (
            <div className="rounded-xl border border-borde bg-superficie-2/60 p-4">
              <p className="text-xs uppercase tracking-widest text-texto-suave">{t.formaTitulo}</p>
              <p className="font-display mt-1 text-2xl text-oro-suave">{t.formas[detalle.forma].nombre}</p>
              <p className="mt-1 text-texto">{t.formas[detalle.forma].texto}</p>
            </div>
          )}
          {detalle.montes.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-texto-suave">{t.marcados}</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {detalle.montes.map((m) => (
                  <li key={m} className="rounded-full border border-oro/40 bg-oro/10 px-3 py-1 text-oro-suave">
                    {glifo(SIMBOLO[m])} {t.montes[m].nombre} <span className="text-texto-suave">· {t.montes[m].sentido}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{t.lineasTitulo}</p>
            <ul className="mt-2 space-y-2.5">
              {LINEAS.map((l) => {
                const vista = vistas.includes(l);
                return (
                  <li key={l} className="flex gap-3">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLOR_LINEA[l], opacity: vista ? 1 : 0.35 }} aria-hidden />
                    <span className="min-w-0">
                      <span className="text-texto">{t.lineas[l]}</span>
                      {detalle.rasgos[l] ? <span className="text-oro-suave"> · {detalle.rasgos[l]}</span> : !vista && trazos ? <span className="text-texto-suave"> · {t.noVista}</span> : null}
                      <span className="block text-texto-suave">{t.sentidos[l]}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          {detalle.montes.length === 0 && (
            <ul className="grid gap-x-4 gap-y-1 text-xs text-texto-suave sm:grid-cols-2">
              {MONTES.map((m) => (
                <li key={m}>
                  <span className="text-oro-suave">{glifo(SIMBOLO[m])} {t.montes[m].nombre}</span> · {t.montes[m].sentido}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
