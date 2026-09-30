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
  const rSignos = 215;
  const rCasas = 190;
  const rPlanetas = 160;
  const rAspectos = 125;

  const ang = (lon: number) => 180 - (lon - ascendente);
  const punto = (lon: number, r: number) => {
    const a = (ang(lon) * Math.PI) / 180;
    // Redondeo: servidor y navegador difieren en el último decimal de cos/sin.
    const redondear = (v: number) => Math.round(v * 100) / 100;
    return [redondear(cx + r * Math.cos(a)), redondear(cy - r * Math.sin(a))] as const;
  };
  const arco = (desde: number, hasta: number, r: number) => {
    const [x1, y1] = punto(desde, r);
    const [x2, y2] = punto(hasta, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  };

  // Evita superposición de símbolos planetarios cercanos.
  const ordenados = [...planetas].sort((a, b) => a.longitud - b.longitud);
  const ajustados: (PlanetaRueda & { lonDibujo: number })[] = [];
  for (const p of ordenados) {
    let lon = p.longitud;
    const prev = ajustados.at(-1);
    if (prev && ((lon - prev.lonDibujo + 360) % 360) < 7) lon = (prev.lonDibujo + 7) % 360;
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
      <svg viewBox={`-28 -4 ${S + 56} ${S + 8}`} className="rueda-astral mx-auto w-full max-w-[560px] select-none" role="group" aria-label="Rueda de la carta astral. Toca un planeta o un aspecto para ver su significado.">
        <circle cx={cx} cy={cy} r={rExt} fill="rgba(255,255,255,0.02)" stroke="rgba(217,180,90,0.5)" />
        <circle cx={cx} cy={cy} r={rSignos} fill="none" stroke="rgba(255,255,255,0.15)" />
        <circle cx={cx} cy={cy} r={rCasas} fill="none" stroke="rgba(255,255,255,0.1)" />
        <circle cx={cx} cy={cy} r={rAspectos} fill="rgba(11,7,22,0.6)" stroke="rgba(255,255,255,0.1)" onClick={() => setSel(null)} />

        {/* Signos */}
        {SIGNOS.map((s, i) => {
          const ini = i * 30;
          const [x1, y1] = punto(ini, rSignos);
          const [x2, y2] = punto(ini, rExt);
          const [tx, ty] = punto(ini + 15, (rSignos + rExt) / 2);
          const resaltado = planetaSel?.signo === s.id;
          return (
            <g key={s.id}>
              <title>{`${s.nombre}: ${s.rasgos.join(", ")}`}</title>
              <path d={arco(ini, ini + 30, rExt)} fill="none" stroke={COLOR_ELEMENTO[s.elemento]} strokeOpacity={resaltado ? 1 : 0.5} strokeWidth={resaltado ? 5 : 3} />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={resaltado ? 22 : 18} fill={COLOR_ELEMENTO[s.elemento]}>
                {s.simbolo}
              </text>
            </g>
          );
        })}

        {/* Casas */}
        {mostrarCasas &&
          cuspides.map((c, i) => {
            const [x1, y1] = punto(c, rAspectos);
            const [x2, y2] = punto(c, rSignos);
            const sig = cuspides[(i + 1) % 12];
            const medio = c + ((sig - c + 360) % 360) / 2;
            const [tx, ty] = punto(medio, rAspectos + 14);
            const angular = i === 0 || i === 3 || i === 6 || i === 9;
            const resaltada = planetaSel?.casa === i + 1;
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angular ? "rgba(217,180,90,0.8)" : "rgba(255,255,255,0.2)"} strokeWidth={angular ? 2 : 1} />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={resaltada ? 13 : 10} fontWeight={resaltada ? 700 : 400} fill={resaltada ? "#f1d99a" : "rgba(168,159,192,0.9)"}>
                  {i + 1}
                </text>
              </g>
            );
          })}

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
            </g>
          );
        })}

        {/* Planetas */}
        {ajustados.map((p, n) => {
          const [x, y] = punto(p.lonDibujo, rPlanetas);
          const [mx, my] = punto(p.longitud, rCasas);
          const [tx, ty] = punto(p.lonDibujo, rPlanetas + 16);
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
              <circle cx={x} cy={y} r={15} fill={activo ? "rgba(217,180,90,0.22)" : "transparent"} stroke={activo ? "#d9b45a" : "none"} />
              <circle cx={mx} cy={my} r={2} fill="#d9b45a" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={activo ? 23 : 20} fill="#f1d99a">
                {SIMBOLOS_CUERPO[p.cuerpo]}
              </text>
              {p.retrogrado && p.cuerpo !== "nodo_norte" && (
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="#ff9f6b">
                  R
                </text>
              )}
            </g>
          );
        })}

        {/* Ascendente */}
        {(() => {
          const [x, y] = punto(ascendente, rExt + 4);
          return (
            <text x={x - 14} y={y} textAnchor="end" dominantBaseline="central" fontSize={11} fill="#f1d99a">
              ASC
            </text>
          );
        })()}
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
