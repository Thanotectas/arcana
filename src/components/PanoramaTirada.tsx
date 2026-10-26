import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import { ELEMENTOS, contarElementos, dominante, ecosTirada, type CartaPanorama, type ClaveElemento, type Elemento } from "@/lib/tarot/panorama";

export type { CartaPanorama };

type T = Diccionario["tarot"]["panorama"];
type Clave = ClaveElemento;

const COLOR: Record<Clave, string> = { fuego: "#ff8a5b", agua: "#8fc7ff", aire: "#c9d6f2", tierra: "#d9b45a", espiritu: "#f1d99a" };
/** Fuego arriba, agua a la derecha, tierra abajo y aire a la izquierda: la cruz de los cuatro palos. */
const ANGULO: Record<Elemento, number> = { fuego: -90, agua: 0, tierra: 90, aire: 180 };

function RosaElementos({ n, t }: { n: Record<Clave, number>; t: T }) {
  const max = Math.max(1, ...ELEMENTOS.map((e) => n[e]));
  const C = 120;
  const radioCentro = 20 + Math.min(n.espiritu, 5) * 5;
  return (
    <svg viewBox="-34 0 308 240" className="mx-auto w-full max-w-[15rem]" role="img" aria-label={t.elementosTitulo}>
      <circle cx={C} cy={C} r="112" fill="none" stroke="rgba(217,180,90,0.2)" />
      <circle cx={C} cy={C} r="78" fill="none" stroke="rgba(217,180,90,0.12)" strokeDasharray="3 5" />
      {ELEMENTOS.map((e, i) => {
        // El pétalo crece con la cantidad de cartas del elemento, sin pasar del anillo punteado.
        const largo = n[e] ? (82 - radioCentro) * (0.4 + 0.6 * (n[e] / max)) : 0;
        const a = ANGULO[e];
        const rad = (a * Math.PI) / 180;
        const etiqueta = { x: C + Math.cos(rad) * 98, y: C + Math.sin(rad) * 98 };
        return (
          <g key={e}>
            {n[e] > 0 && (
              <g transform={`rotate(${a} ${C} ${C})`}>
                <path
                  d={`M ${C + radioCentro} ${C} q ${Math.round(largo * 0.4)} -26 ${Math.round(largo)} 0 q ${-Math.round(largo * 0.6)} 26 ${-Math.round(largo)} 0 Z`}
                  fill={COLOR[e]}
                  fillOpacity="0.5"
                  stroke={COLOR[e]}
                  strokeWidth="1.5"
                  className="tarot-petalo"
                  style={{ transformOrigin: `${C}px ${C}px`, animationDelay: `${0.15 + i * 0.12}s` }}
                />
                <circle cx={C + radioCentro + Math.round(largo)} cy={C} r="3" fill={COLOR[e]} />
              </g>
            )}
            <text x={Math.round(etiqueta.x)} y={Math.round(etiqueta.y) + (e === "tierra" ? 12 : e === "fuego" ? -2 : 4)} textAnchor={e === "agua" ? "start" : e === "aire" ? "end" : "middle"} fontSize="12" fontWeight="600" fill={n[e] ? COLOR[e] : "rgba(168,159,192,0.55)"}>
              {t.corto[e]} {n[e]}
            </text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r={radioCentro} fill="#1a1233" stroke={COLOR.espiritu} strokeWidth={n.espiritu ? 2 : 1} strokeOpacity={n.espiritu ? 1 : 0.4} />
      <text x={C} y={C + 5} textAnchor="middle" fontSize="15" fontWeight="600" fill={COLOR.espiritu}>★ {n.espiritu}</text>
    </svg>
  );
}

/**
 * La tirada en conjunto: el elemento que domina (rosa de los cuatro palos con
 * los arcanos mayores al centro), cuántas cartas salieron al derecho o
 * invertidas, y los ecos (números repetidos y figuras de la corte).
 */
export function PanoramaTirada({ cartas, t, conInvertidas = true }: { cartas: CartaPanorama[]; t: T; conInvertidas?: boolean }) {
  const total = cartas.length;
  const n = contarElementos(cartas);
  const dom = dominante(n, total);
  const faltante = total >= 4 ? ELEMENTOS.find((e) => n[e] === 0) : undefined;
  const invertidas = cartas.filter((c) => c.invertida).length;
  const derechas = total - invertidas;
  const energia = invertidas === 0 || invertidas / total < 0.34 ? "fluye" : invertidas / total <= 0.5 ? "mixta" : "detenida";

  const { repetidos, figuras } = ecosTirada(cartas);
  const ecos = [
    ...repetidos.map((num) => plantilla(t.repetido, { n: num, sentido: t.numeros[num] })),
    ...(figuras > 1 ? [plantilla(t.figuras, { n: figuras })] : figuras === 1 ? [t.figura] : []),
  ];

  return (
    <section className="aparecer rounded-xl border border-borde bg-superficie-2/60 p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.titulo}</p>
      <p className="text-xs text-texto-suave">{t.nota}</p>
      <div className="mt-4 grid items-center gap-5 sm:grid-cols-[minmax(0,15rem)_1fr]">
        <RosaElementos n={n} t={t} />
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{t.elementosTitulo}</p>
            <p className="mt-1 text-texto" style={{ color: dom !== "equilibrio" ? COLOR[dom] : undefined }}>{t.domina[dom]}</p>
            {faltante && <p className="mt-1 text-texto-suave">{plantilla(t.falta, { elemento: t.elementos[faltante] })}</p>}
          </div>
          {conInvertidas && (
            <div>
              <p className="text-xs uppercase tracking-widest text-texto-suave">{t.energiaTitulo}</p>
              <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-white/5" aria-hidden>
                <div className="tarot-barra h-full bg-oro" style={{ width: `${(derechas / total) * 100}%` }} />
                <div className="tarot-barra h-full bg-violeta" style={{ width: `${(invertidas / total) * 100}%`, animationDelay: "0.3s" }} />
              </div>
              <p className="mt-1 flex justify-between text-xs text-texto-suave">
                <span>{plantilla(t.derecho, { n: derechas })}</span>
                <span>{plantilla(invertidas === 1 ? t.invertida : t.invertidas, { n: invertidas })}</span>
              </p>
              <p className="mt-1 text-texto">{t.energia[energia]}</p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{t.ecosTitulo}</p>
            {ecos.length ? (
              <ul className="mt-1 space-y-1">
                {ecos.map((e) => (
                  <li key={e} className="flex gap-2 text-texto">
                    <span className="text-oro" aria-hidden>✦</span>
                    {e}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-texto-suave">{t.sinEcos}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
