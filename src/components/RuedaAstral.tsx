"use client";

import { useState, type KeyboardEvent } from "react";
import { SIGNOS, signoPorId, formatoGrado } from "@/lib/zodiaco";
import {
  NOMBRES_CUERPO,
  SIMBOLOS_CUERPO,
  SIGNIFICADO_CUERPO,
  SIGNIFICADO_CASA,
  NOMBRES_ASPECTO,
  SIMBOLOS_ASPECTO,
  SIGNIFICADO_ASPECTO,
  type Cuerpo,
  type TipoAspecto,
} from "@/lib/astro/textos";

interface PlanetaRueda {
  cuerpo: Cuerpo;
  longitud: number;
  retrogrado: boolean;
  casa: number;
  signo: string;
}

interface AspectoRueda {
  a: Cuerpo;
  b: Cuerpo;
  tipo: TipoAspecto;
  orbe: number;
}

type Seleccion = { tipo: "planeta"; cuerpo: Cuerpo } | { tipo: "aspecto"; indice: number } | null;

const COLOR_ELEMENTO: Record<string, string> = {
  fuego: "#ff8a5b",
  tierra: "#9ad07f",
  aire: "#8fc7ff",
  agua: "#b28dff",
};

const COLOR_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "#d9b45a",
  oposicion: "#ff7b7b",
  cuadratura: "#ff9f6b",
  trigono: "#7fd6a4",
  sextil: "#8fc7ff",
};

const TIPOS: TipoAspecto[] = ["conjuncion", "oposicion", "trigono", "cuadratura", "sextil"];

/** Estrellas fijas del fondo de la rueda: [longitud, radio, tamaño], siempre las mismas. */
const ESTRELLAS: [number, number, number][] = Array.from({ length: 46 }, (_, i) => [(i * 137.5) % 360, 256 + ((i * 53) % 22), 0.5 + ((i * 7) % 5) * 0.18]);

/** Estrella de ocho puntas de Arcana, centrada en (x, y). */
function estrellaCentro(x: number, y: number, largo: number, corto: number) {
  const pts: string[] = [];
  for (let k = 0; k < 16; k++) {
    const r = k % 2 === 0 ? (k % 4 === 0 ? largo : largo * 0.55) : corto;
    const a = (k * Math.PI) / 8 - Math.PI / 2;
    pts.push(`${Math.round((x + r * Math.cos(a)) * 100) / 100},${Math.round((y + r * Math.sin(a)) * 100) / 100}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

const conTeclado = (accion: () => void) => (e: KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    accion();
  }
};

/**
 * Rueda zodiacal interactiva. El Ascendente va a la izquierda (9 en punto) y
 * los signos avanzan en sentido antihorario. Tocar un planeta resalta sus
 * aspectos y explica su posición; tocar una línea explica el aspecto.
 */
export function RuedaAstral({
  planetas,
  cuspides,
  ascendente,
  aspectos,
  mostrarCasas = true,
}: {
  planetas: PlanetaRueda[];
  cuspides: number[];
  ascendente: number;
  aspectos: AspectoRueda[];
  mostrarCasas?: boolean;
}) {
  const [sel, setSel] = useState<Seleccion>(null);
  const [visibles, setVisibles] = useState<Set<TipoAspecto>>(() => new Set(TIPOS));

  const S = 560;
  const cx = S / 2;
  const cy = S / 2;
  const rExt = 250;
  const rSignos = 212;
  const rCasas = 190;
  const rPlanetas = 160;
  const rAspectos = 122;

  // El Ascendente a las 9 en punto y el zodiaco en sentido antihorario (la casa 1 queda debajo del AC y el MC arriba).
  const ang = (lon: number) => 180 + (lon - ascendente);
  const punto = (lon: number, r: number) => {
    const a = (ang(lon) * Math.PI) / 180;
    // Redondeo: servidor y navegador difieren en el último decimal de cos/sin.
    const redondear = (v: number) => Math.round(v * 100) / 100;
    return [redondear(cx + r * Math.cos(a)), redondear(cy - r * Math.sin(a))] as const;
  };
  /** Franja anular entre dos longitudes (en el sentido del zodiaco). */
  const sector = (desde: number, hasta: number, rIn: number, rOut: number) => {
    const [x1, y1] = punto(desde, rOut);
    const [x2, y2] = punto(hasta, rOut);
    const [x3, y3] = punto(hasta, rIn);
    const [x4, y4] = punto(desde, rIn);
    return `M ${x1} ${y1} A ${rOut} ${rOut} 0 0 0 ${x2} ${y2} L ${x3} ${y3} A ${rIn} ${rIn} 0 0 1 ${x4} ${y4} Z`;
  };

  // Evita superposición de símbolos planetarios cercanos.
  const ordenados = [...planetas].sort((a, b) => a.longitud - b.longitud);
  const ajustados: (PlanetaRueda & { lonDibujo: number })[] = [];
  for (const p of ordenados) {
    let lon = p.longitud;
    const prev = ajustados.at(-1);
    // Las monedas miden unos 10° en la órbita de los planetas: más cerca se montarían.
    if (prev && ((lon - prev.lonDibujo + 360) % 360) < 10) lon = (prev.lonDibujo + 10) % 360;
    ajustados.push({ ...p, lonDibujo: lon });
  }

  const planetaSel = sel?.tipo === "planeta" ? planetas.find((p) => p.cuerpo === sel.cuerpo) : undefined;
  const aspectoSel = sel?.tipo === "aspecto" ? aspectos.at(sel.indice) : undefined;
  const aspectosDe = (c: Cuerpo) => aspectos.map((a, i) => ({ a, i })).filter(({ a }) => a.a === c || a.b === c);
  const vinculados = new Set<Cuerpo>(
    planetaSel ? aspectosDe(planetaSel.cuerpo).flatMap(({ a }) => [a.a, a.b]) : aspectoSel ? [aspectoSel.a, aspectoSel.b] : [],
  );

  const mismo = (a: Seleccion, b: Seleccion) =>
    a !== null && b !== null && a.tipo === b.tipo && (a.tipo === "planeta" ? a.cuerpo === (b as typeof a).cuerpo : a.indice === (b as typeof a).indice);
  const alternar = (s: Seleccion) => setSel((actual) => (mismo(actual, s) ? null : s));

  const alternarTipo = (t: TipoAspecto) =>
    setVisibles((v) => {
      const n = new Set(v);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });

  return (
    <div className="space-y-4">
      <svg viewBox={`-30 -30 ${S + 60} ${S + 60}`} className="rueda-astral mx-auto w-full max-w-[560px] select-none" role="group" aria-label="Rueda de la carta astral. Toca un planeta o un aspecto para ver su significado.">
        <defs>
          <radialGradient id="rueda-fondo" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#2a1a5e" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="#150f26" stopOpacity="0.35" />
            <stop offset="1" stopColor="#0b0716" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="rueda-centro" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#1e1145" />
            <stop offset="1" stopColor="#0b0716" />
          </radialGradient>
          <linearGradient id="rueda-oro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff1c4" />
            <stop offset="0.5" stopColor="#e2bc63" />
            <stop offset="1" stopColor="#a87a2a" />
          </linearGradient>
          <filter id="rueda-brillo" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Fondo, cielo con estrellas y doble aro dorado */}
        <circle cx={cx} cy={cy} r={rExt + 26} fill="url(#rueda-fondo)" />
        {ESTRELLAS.map(([lon, rr, t], i) => {
          const [x, y] = punto(lon, rr);
          return <circle key={i} cx={x} cy={y} r={t} fill="#fff" opacity={0.25 + (i % 3) * 0.12} />;
        })}
        <circle cx={cx} cy={cy} r={rExt + 7} fill="none" stroke="url(#rueda-oro)" strokeOpacity="0.45" strokeWidth="0.8" />
        <circle cx={cx} cy={cy} r={rExt} fill="none" stroke="url(#rueda-oro)" strokeWidth="1.6" />
        <circle cx={cx} cy={cy} r={rCasas} fill="rgba(11,7,22,0.35)" stroke="rgba(255,255,255,0.12)" />
        <circle cx={cx} cy={cy} r={rAspectos} fill="url(#rueda-centro)" stroke="rgba(217,180,90,0.35)" onClick={() => setSel(null)} />

        {/* Signos: franja de color por elemento */}
        {SIGNOS.map((s, i) => {
          const ini = i * 30;
          const [x1, y1] = punto(ini, rSignos);
          const [x2, y2] = punto(ini, rExt);
          const [tx, ty] = punto(ini + 15, (rSignos + rExt) / 2);
          const resaltado = planetaSel?.signo === s.id;
          return (
            <g key={s.id}>
              <title>{`${s.nombre}: ${s.rasgos.join(", ")}`}</title>
              <path d={sector(ini, ini + 30, rSignos, rExt)} fill={COLOR_ELEMENTO[s.elemento]} fillOpacity={resaltado ? 0.32 : i % 2 ? 0.1 : 0.16} />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(241,217,154,0.35)" />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={resaltado ? 24 : 20} fill={COLOR_ELEMENTO[s.elemento]} style={{ filter: resaltado ? "drop-shadow(0 0 6px currentColor)" : undefined }}>
                {`${s.simbolo}\uFE0E`}
              </text>
            </g>
          );
        })}

        {/* Grados: cada grado una marca; cada 5 y cada 10, más larga */}
        {Array.from({ length: 360 }, (_, g) => {
          const largo = g % 10 === 0 ? 7 : g % 5 === 0 ? 4.5 : 2.2;
          const [x1, y1] = punto(g, rSignos);
          const [x2, y2] = punto(g, rSignos - largo);
          return <line key={g} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(241,217,154,0.45)" strokeWidth={g % 10 === 0 ? 0.9 : 0.5} />;
        })}

        {/* Casas */}
        {mostrarCasas &&
          cuspides.map((c, i) => {
            const angular = i === 0 || i === 3 || i === 6 || i === 9;
            const [x1, y1] = punto(c, rAspectos);
            const [x2, y2] = punto(c, angular ? rExt + 14 : rSignos);
            const sig = cuspides[(i + 1) % 12];
            const medio = c + ((sig - c + 360) % 360) / 2;
            const [tx, ty] = punto(medio, rAspectos + 13);
            const resaltada = planetaSel?.casa === i + 1;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angular ? "url(#rueda-oro)" : "rgba(255,255,255,0.18)"} strokeWidth={angular ? 2 : 1} />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={resaltada ? 13 : 10} fontWeight={resaltada ? 700 : 400} fill={resaltada ? "#f1d99a" : "rgba(168,159,192,0.9)"}>
                  {i + 1}
                </text>
              </g>
            );
          })}

        {/* Ejes: AC, IC, DC y MC fuera del aro */}
        {mostrarCasas &&
          ([
            ["AC", cuspides[0]],
            ["IC", cuspides[3]],
            ["DC", cuspides[6]],
            ["MC", cuspides[9]],
          ] as const).map(([nombre, lon]) => {
            const [x, y] = punto(lon, rExt + 22);
            return (
              <text key={nombre} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} letterSpacing="0.06em" fill="#f1d99a">
                {nombre}
              </text>
            );
          })}
        {!mostrarCasas &&
          (() => {
            const [x, y] = punto(ascendente, rExt + 22);
            return (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600} fill="#f1d99a">
                AC
              </text>
            );
          })()}

        {/* Estrella de Arcana en el centro */}
        <path d={estrellaCentro(cx, cy, 16, 4)} fill="#f1d99a" opacity="0.18" pointerEvents="none" />

        {/* Aspectos */}
        {aspectos.map((a, i) => {
          if (!visibles.has(a.tipo)) return null;
          const pa = planetas.find((p) => p.cuerpo === a.a);
          const pb = planetas.find((p) => p.cuerpo === a.b);
          if (!pa || !pb) return null;
          const [x1, y1] = punto(pa.longitud, rAspectos);
          const [x2, y2] = punto(pb.longitud, rAspectos);
          const activo =
            (sel?.tipo === "aspecto" && sel.indice === i) ||
            (sel?.tipo === "planeta" && (a.a === sel.cuerpo || a.b === sel.cuerpo));
          const opacidad = sel ? (activo ? 1 : 0.1) : 0.7;
          return (
            <g
              key={i}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${NOMBRES_CUERPO[a.a]} ${NOMBRES_ASPECTO[a.tipo].toLowerCase()} ${NOMBRES_CUERPO[a.b]}`}
              aria-pressed={sel?.tipo === "aspecto" && sel.indice === i}
              onClick={() => alternar({ tipo: "aspecto", indice: i })}
              onKeyDown={conTeclado(() => alternar({ tipo: "aspecto", indice: i }))}
            >
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={10} />
              {activo && <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLOR_ASPECTO[a.tipo]} strokeWidth={5} opacity={0.5} filter="url(#rueda-brillo)" />}
              <line
                className="trazo-aspecto"
                style={{ animationDelay: `${300 + i * 40}ms` }}
                pathLength={1}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={COLOR_ASPECTO[a.tipo]}
                strokeOpacity={opacidad}
                strokeWidth={activo ? 2.5 : a.orbe < 2 ? 1.5 : 1}
              />
              <circle cx={x1} cy={y1} r={1.8} fill={COLOR_ASPECTO[a.tipo]} opacity={opacidad} />
              <circle cx={x2} cy={y2} r={1.8} fill={COLOR_ASPECTO[a.tipo]} opacity={opacidad} />
            </g>
          );
        })}

        {/* Planetas: monedas con su símbolo y una aguja hasta su grado exacto */}
        {ajustados.map((p, n) => {
          const [x, y] = punto(p.lonDibujo, rPlanetas);
          const [ax, ay] = punto(p.longitud, rSignos - 9);
          const [bx, by] = punto(p.lonDibujo, rPlanetas + 14);
          const [tx, ty] = punto(p.lonDibujo, rPlanetas - 21);
          const activo = sel?.tipo === "planeta" && sel.cuerpo === p.cuerpo;
          const apagado = sel !== null && !activo && !vinculados.has(p.cuerpo);
          return (
            <g
              key={p.cuerpo}
              className="planeta-rueda cursor-pointer"
              style={{ animationDelay: `${n * 60}ms`, opacity: apagado ? 0.35 : 1 }}
              role="button"
              tabIndex={0}
              aria-label={`${NOMBRES_CUERPO[p.cuerpo]} en ${signoPorId(p.signo)?.nombre ?? ""}`}
              aria-pressed={activo}
              onClick={() => alternar({ tipo: "planeta", cuerpo: p.cuerpo })}
              onKeyDown={conTeclado(() => alternar({ tipo: "planeta", cuerpo: p.cuerpo }))}
            >
              <line x1={bx} y1={by} x2={ax} y2={ay} stroke="rgba(241,217,154,0.55)" strokeWidth={0.8} />
              <circle cx={ax} cy={ay} r={2.2} fill="#f1d99a" />
              {activo && <circle cx={x} cy={y} r={18} fill="#d9b45a" opacity={0.45} filter="url(#rueda-brillo)" />}
              <circle cx={x} cy={y} r={14} fill="#150f26" stroke={activo ? "#f1d99a" : "url(#rueda-oro)"} strokeWidth={activo ? 1.8 : 1} />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={activo ? 19 : 17} fill="#f1d99a">
                {`${SIMBOLOS_CUERPO[p.cuerpo]}\uFE0E`}
              </text>
              {p.retrogrado && p.cuerpo !== "nodo_norte" && (
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={8} fontWeight={700} fill="#ff9f6b">
                  R
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex flex-wrap justify-center gap-2 text-xs" aria-label="Mostrar u ocultar tipos de aspecto">
        {TIPOS.map((t) => {
          const activo = visibles.has(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => alternarTipo(t)}
              aria-pressed={activo}
              className={`rounded-full border px-3 py-1 transition ${activo ? "border-borde text-texto" : "border-transparent text-texto-suave line-through opacity-60"}`}
            >
              <span style={{ color: COLOR_ASPECTO[t] }}>{SIMBOLOS_ASPECTO[t]}</span> {NOMBRES_ASPECTO[t]}
            </button>
          );
        })}
      </div>

      <div className="min-h-24 rounded-xl border border-borde bg-superficie-2/60 p-4" aria-live="polite">
        {planetaSel ? (
          <FichaPlaneta
            planeta={planetaSel}
            mostrarCasas={mostrarCasas}
            aspectos={aspectosDe(planetaSel.cuerpo)}
            alElegirAspecto={(i) => setSel({ tipo: "aspecto", indice: i })}
          />
        ) : aspectoSel ? (
          <div className="aparecer space-y-1">
            <p className="font-display text-xl">
              {SIMBOLOS_CUERPO[aspectoSel.a]} {NOMBRES_CUERPO[aspectoSel.a]}{" "}
              <span style={{ color: COLOR_ASPECTO[aspectoSel.tipo] }}>
                {SIMBOLOS_ASPECTO[aspectoSel.tipo]} {NOMBRES_ASPECTO[aspectoSel.tipo]}
              </span>{" "}
              {SIMBOLOS_CUERPO[aspectoSel.b]} {NOMBRES_CUERPO[aspectoSel.b]}
            </p>
            <p className="text-xs text-texto-suave">Orbe de {aspectoSel.orbe}° (cuanto menor, más fuerte)</p>
            <p className="text-sm leading-relaxed text-[#d9d2ea]">{SIGNIFICADO_ASPECTO[aspectoSel.tipo]}</p>
          </div>
        ) : (
          <p className="text-center text-sm text-texto-suave">Toca un planeta o una línea de la rueda para descubrir qué significa.</p>
        )}
      </div>
    </div>
  );
}

function FichaPlaneta({
  planeta,
  mostrarCasas,
  aspectos,
  alElegirAspecto,
}: {
  planeta: PlanetaRueda;
  mostrarCasas: boolean;
  aspectos: { a: AspectoRueda; i: number }[];
  alElegirAspecto: (i: number) => void;
}) {
  const signo = signoPorId(planeta.signo);
  return (
    <div className="aparecer space-y-2">
      <p className="font-display text-xl">
        {SIMBOLOS_CUERPO[planeta.cuerpo]} {NOMBRES_CUERPO[planeta.cuerpo]} en {signo?.simbolo} {signo?.nombre} {formatoGrado(planeta.longitud)}
        {mostrarCasas && <span className="text-texto-suave"> · casa {planeta.casa}</span>}
        {planeta.retrogrado && planeta.cuerpo !== "nodo_norte" && <span className="text-sm text-[#ff9f6b]"> · retrógrado</span>}
      </p>
      <p className="text-sm leading-relaxed text-[#d9d2ea]">{SIGNIFICADO_CUERPO[planeta.cuerpo]}</p>
      {signo && (
        <p className="text-sm text-texto-suave">
          En {signo.nombre} ({signo.elemento}, {signo.modalidad}) se expresa con {signo.rasgos.join(", ")}.
        </p>
      )}
      {mostrarCasas && <p className="text-sm text-texto-suave">Casa {planeta.casa}: {SIGNIFICADO_CASA.at(planeta.casa - 1)}</p>}
      {aspectos.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {aspectos.map(({ a, i }) => {
            const otro = a.a === planeta.cuerpo ? a.b : a.a;
            return (
              <button key={i} type="button" onClick={() => alElegirAspecto(i)} className="rounded-full border border-borde px-2.5 py-0.5 text-xs text-texto hover:border-oro/40">
                <span style={{ color: COLOR_ASPECTO[a.tipo] }}>{SIMBOLOS_ASPECTO[a.tipo]}</span> {NOMBRES_CUERPO[otro]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
