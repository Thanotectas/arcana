import { AFINES, CHAKRAS, COLORES_AURA, COLORES_CHAKRA, EQUILIBRA, TONO_AURA, brilloChakras, ordenAura, type Chakra, type ColorAura, type ResultadoAura } from "@/lib/aura";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

type T = Diccionario["aura"];
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Altura de cada centro de energía sobre la silueta. */
const ALTURA_CHAKRA: Record<Chakra, number> = { corona: 68, tercerOjo: 104, garganta: 150, corazon: 206, plexo: 242, sacro: 274, raiz: 306 };

/** El color con que brilla un centro: el más fuerte de los suyos. */
const colorChakra = (c: Chakra, r: ResultadoAura) => COLORES_CHAKRA[c].reduce((a, b) => (r.puntajes[b] > r.puntajes[a] ? b : a));

/**
 * El aura por capas: tres halos (el color principal por dentro, el secundario
 * y el tercero hacia afuera) alrededor de una silueta, con los siete centros
 * de energía encendidos según el puntaje de sus colores.
 */
function AuraCapas({ r, capas, t }: { r: ResultadoAura; capas: ColorAura[]; t: T }) {
  const brillo = brilloChakras(r);
  const radios = [92, 122, 150];
  return (
    <svg viewBox="0 0 300 340" className="mx-auto w-full max-w-[18rem]" role="img" aria-label={t.capasTitulo}>
      <defs>
        {capas.map((c, i) => (
          <radialGradient key={c} id={`aura-capa-${i}-${c}`}>
            <stop offset="0" stopColor={TONO_AURA[c]} stopOpacity={i === 0 ? 0.95 : 0.7} />
            <stop offset="0.6" stopColor={TONO_AURA[c]} stopOpacity={i === 0 ? 0.55 : 0.35} />
            <stop offset="1" stopColor={TONO_AURA[c]} stopOpacity="0" />
          </radialGradient>
        ))}
        <radialGradient id="aura-luz">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#f1d99a" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* De afuera hacia adentro, para que el principal quede encima */}
      {[...capas].reverse().map((c) => {
        const i = capas.indexOf(c);
        return <circle key={c} cx="150" cy="178" r={radios[i]} fill={`url(#aura-capa-${i}-${c})`} className="aura-capa" style={{ animationDelay: `${-i * 2}s` }} />;
      })}
      <circle cx="150" cy="170" r="52" fill="url(#aura-luz)" />
      {/* Silueta */}
      <circle cx="150" cy="106" r="25" fill="#0b0716" fillOpacity="0.88" />
      <path d="M 72 336 C 74 256 98 204 128 192 L 133 158 C 141 152 159 152 167 158 L 172 192 C 202 204 226 256 228 336 Z" fill="#0b0716" fillOpacity="0.88" />
      <line x1="150" y1="68" x2="150" y2="306" stroke="#f1d99a" strokeOpacity="0.18" strokeDasharray="2 4" />
      {CHAKRAS.map((c, i) => {
        const y = ALTURA_CHAKRA[c];
        const color = TONO_AURA[colorChakra(c, r)];
        const b = brillo[c];
        return (
          <g key={c} className="aura-chakra" style={{ animationDelay: `${i * 0.35}s` }}>
            <circle cx="150" cy={y} r={r2(7 + b / 9)} fill={color} opacity={r2(0.12 + (b / 100) * 0.4)} />
            <circle cx="150" cy={y} r="5.5" fill={color} opacity={r2(0.35 + (b / 100) * 0.65)} stroke="#fff6d8" strokeOpacity={b >= 70 ? 0.9 : 0.3} />
          </g>
        );
      })}
    </svg>
  );
}

/** La paleta completa como flor: un pétalo por color, más largo cuanto más presente. */
function FlorAura({ r, t, nombres }: { r: ResultadoAura; t: T; nombres: Record<string, { nombre: string }> }) {
  const C = 150;
  return (
    <svg viewBox="-24 -6 348 312" className="mx-auto w-full max-w-[18rem]" role="img" aria-label={t.paletaTitulo}>
      <circle cx={C} cy={C} r="120" fill="none" stroke="rgba(241,217,154,0.15)" strokeDasharray="2 5" />
      {COLORES_AURA.map((c, i) => {
        const a = i * 40 - 90;
        const largo = r2(18 + (r.puntajes[c] / 100) * 84);
        const rad = (a * Math.PI) / 180;
        const lx = r2(C + Math.cos(rad) * 134);
        const ly = r2(C + Math.sin(rad) * 134);
        return (
          <g key={c}>
            <g transform={`rotate(${a} ${C} ${C})`}>
              <path
                d={`M ${C + 16} ${C} q ${r2(largo * 0.45)} -22 ${largo} 0 q ${r2(-largo * 0.55)} 22 ${-largo} 0 Z`}
                fill={TONO_AURA[c]}
                fillOpacity={c === r.principal ? 0.85 : 0.55}
                stroke={TONO_AURA[c]}
                strokeWidth="1.2"
                className="tarot-petalo"
                style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${i * 0.08}s` }}
              />
            </g>
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fill={r.puntajes[c] >= 60 ? TONO_AURA[c] : "rgba(236,230,247,0.55)"}>
              {nombres[c]?.nombre}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r="16" fill={TONO_AURA[r.principal]} stroke="#fff6d8" strokeOpacity="0.6" />
    </svg>
  );
}

/** Un punto de color con su nombre. */
function Muestra({ color, nombre }: { color: ColorAura; nombre: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-borde bg-superficie-2/60 px-3 py-1 text-sm">
      <span className="h-3.5 w-3.5 rounded-full" style={{ background: TONO_AURA[color], boxShadow: `0 0 10px ${TONO_AURA[color]}` }} aria-hidden />
      {nombre}
    </span>
  );
}

/**
 * El aura completa: las capas con los centros de energía, la paleta en flor,
 * cada centro con su brillo, lo que nutre y lo que drena, el color dormido y
 * con qué auras se armoniza. Todo sale del resultado del test, así que también
 * aparece en las lecturas anteriores.
 */
export function VistaAura({ resultado: r, t }: { resultado: ResultadoAura; t: Diccionario }) {
  const a = t.aura;
  const nombres = a.colores as Record<string, { nombre: string; rasgos: string }>;
  const detalle = a.detalle as Record<ColorAura, { nutre: string; drena: string; cultivar: string }>;
  const orden = ordenAura(r);
  const capas = orden.slice(0, 3);
  const dormido = orden[orden.length - 1];
  const brillo = brilloChakras(r);
  const nombreCapa = [a.capas.interior, a.capas.media, a.capas.exterior];

  return (
    <section className="space-y-6">
      <div className="tarjeta grid items-center gap-6 p-6 md:grid-cols-[minmax(0,18rem)_1fr]">
        <AuraCapas r={r} capas={capas} t={a} />
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.tuAura}</p>
            <p className="font-display text-3xl text-oro-suave">
              {nombres[r.principal]?.nombre} <span className="text-texto-suave">+</span> {nombres[r.secundario]?.nombre}
            </p>
            <p className="text-sm text-texto-suave">{nombres[r.principal]?.rasgos}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{a.capasTitulo}</p>
            <p className="text-xs text-texto-suave">{a.capasNota}</p>
            <ul className="mt-2 space-y-2 text-sm">
              {capas.map((c, i) => (
                <li key={c} className="flex gap-3">
                  <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: TONO_AURA[c], boxShadow: `0 0 8px ${TONO_AURA[c]}` }} aria-hidden />
                  <span>
                    <span className="text-texto-suave">{nombreCapa[i]} · </span>
                    <span className="text-texto">{nombres[c]?.nombre}</span>
                    <span className="block text-xs text-texto-suave">{nombres[c]?.rasgos}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta space-y-2 p-5">
          <h2 className="font-display text-2xl">{a.paletaTitulo}</h2>
          <p className="text-xs text-texto-suave">{a.paletaNota}</p>
          <FlorAura r={r} t={a} nombres={nombres} />
        </div>
        <div className="tarjeta space-y-3 p-5">
          <div>
            <h2 className="font-display text-2xl">{a.chakrasTitulo}</h2>
            <p className="text-xs text-texto-suave">{a.chakrasNota}</p>
          </div>
          <ul className="space-y-2.5 text-sm">
            {CHAKRAS.map((c, i) => {
              const color = TONO_AURA[colorChakra(c, r)];
              return (
                <li key={c} className="grid grid-cols-[1fr_6rem] items-center gap-x-3">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color, opacity: 0.4 + brillo[c] / 170 }} aria-hidden />
                    <span>
                      <span className="text-texto">{a.chakras[c].nombre}</span>
                      <span className="text-xs text-texto-suave"> · {a.chakras[c].sentido}</span>
                    </span>
                  </span>
                  <span className="h-2 overflow-hidden rounded-full bg-white/10" aria-hidden>
                    <span className="tarot-barra block h-full rounded-full" style={{ width: `${brillo[c]}%`, background: color, animationDelay: `${i * 0.08}s` }} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="tarjeta space-y-4 p-5">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.nutreTitulo}</p>
            <p className="text-sm text-texto">{detalle[r.principal].nutre}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.drenaTitulo}</p>
            <p className="text-sm text-texto">{detalle[r.principal].drena}</p>
          </div>
        </div>
        <div className="tarjeta space-y-2 p-5">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.dormidoTitulo}</p>
          <Muestra color={dormido} nombre={nombres[dormido]?.nombre ?? dormido} />
          <p className="text-xs text-texto-suave">{plantilla(a.dormidoNota, { color: nombres[dormido]?.nombre ?? dormido })}</p>
          <p className="text-sm text-texto">{detalle[dormido].cultivar}</p>
        </div>
      </div>

      <div className="tarjeta grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.afinesTitulo}</p>
          <p className="flex flex-wrap gap-2">
            {AFINES[r.principal].map((c) => (
              <Muestra key={c} color={c} nombre={nombres[c]?.nombre ?? c} />
            ))}
          </p>
          <p className="text-sm text-texto-suave">{a.afinesNota}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{a.equilibraTitulo}</p>
          <Muestra color={EQUILIBRA[r.principal]} nombre={nombres[EQUILIBRA[r.principal]]?.nombre ?? EQUILIBRA[r.principal]} />
          <p className="text-sm text-texto-suave">{plantilla(a.equilibraNota, { color: (nombres[EQUILIBRA[r.principal]]?.nombre ?? "").toLowerCase() })}</p>
        </div>
      </div>
    </section>
  );
}
