import type { ReactNode } from "react";
import { SIMBOLOS_CUERPO, SIMBOLOS_ASPECTO, type Cuerpo, type TipoAspecto } from "@/lib/astro/textos";
import { ELEMENTOS, MODALIDADES, REGENTE, type Figura, type Hemisferios, type PlanetaFigura, type Temperamento } from "@/lib/astro/figuras";
import { SIGNOS, formatoGrado, imagenSigno, signoPorId, signoPorLongitud } from "@/lib/zodiaco";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

const glifo = (s: string) => `${s}︎`;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** Longitudes de dibujo separadas al menos `minimo` grados, para que los símbolos cercanos no se monten. */
function separar<T extends { longitud: number }>(ps: T[], minimo: number): (T & { dibujo: number })[] {
  const orden = [...ps].sort((x, y) => x.longitud - y.longitud);
  const out: (T & { dibujo: number })[] = [];
  for (const p of orden) {
    const prev = out.at(-1);
    let d = p.longitud;
    if (prev && d - prev.dibujo < minimo) d = prev.dibujo + minimo;
    out.push({ ...p, dibujo: d });
  }
  // Un grupo que se corrió demasiado se recentra sobre su posición real.
  const corrimiento = out.length ? (out.reduce((s, p) => s + (p.dibujo - p.longitud), 0) / out.length) * 0.5 : 0;
  return out.map((p) => ({ ...p, dibujo: p.dibujo - corrimiento }));
}

export const COLOR_ELEMENTO: Record<string, string> = { fuego: "#ff8a5b", tierra: "#9ad07f", aire: "#8fc7ff", agua: "#b28dff" };
const COLOR_ASPECTO: Record<TipoAspecto, string> = { conjuncion: "#d9b45a", oposicion: "#ff7b7b", trigono: "#7fd6a4", cuadratura: "#ff9f6b", sextil: "#8fc7ff" };
const COLOR_FIGURA: Record<Figura["tipo"], string> = { stellium: "#f1d99a", granTrigono: "#7fd6a4", tCuadrada: "#ff9f6b", granCruz: "#ff7b7b" };

/** Nombres traducidos de cuerpos y signos. */
export function nombres(t: Diccionario) {
  const cuerpos = t.astral.cuerpos as Record<Cuerpo, string>;
  const signos = t.piedras.nombresSignos as Record<string, string>;
  return { cuerpo: (c: Cuerpo) => cuerpos[c] ?? c, signo: (id: string) => signos[id] ?? signoPorId(id)?.nombre ?? id };
}

export interface PlanetaCarta extends PlanetaFigura {
  retrogrado: boolean;
}

/**
 * Sol, Luna y Ascendente en tres monedas, con lo que dice cada uno, y debajo
 * el regente de la carta (el planeta que rige el signo del Ascendente).
 */
export function TrioEsencial({ planetas, ascendente, horaDesconocida, t }: { planetas: PlanetaCarta[]; ascendente: number; horaDesconocida: boolean; t: Diccionario }) {
  const a = t.astral;
  const n = nombres(t);
  const claves = a.claves as Record<string, string>;
  const sol = planetas.find((p) => p.cuerpo === "sol");
  const luna = planetas.find((p) => p.cuerpo === "luna");
  const asc = signoPorLongitud(ascendente);
  const regente = REGENTE[asc.id];
  const pr = planetas.find((p) => p.cuerpo === regente);
  const fichas = [
    { rol: a.roles.sol, signo: sol?.signo, titulo: sol && plantilla(a.enSigno, { cuerpo: n.cuerpo("sol"), signo: n.signo(sol.signo) }), detalle: sol && `${formatoGrado(sol.longitud)}${horaDesconocida ? "" : ` · ${plantilla(a.casaN, { n: sol.casa })}`}` },
    { rol: a.roles.luna, signo: luna?.signo, titulo: luna && plantilla(a.enSigno, { cuerpo: n.cuerpo("luna"), signo: n.signo(luna.signo) }), detalle: luna && `${formatoGrado(luna.longitud)}${horaDesconocida ? "" : ` · ${plantilla(a.casaN, { n: luna.casa })}`}` },
    horaDesconocida
      ? { rol: a.roles.asc, signo: undefined, titulo: a.ascendente, detalle: undefined }
      : { rol: a.roles.asc, signo: asc.id, titulo: plantilla(a.ascEn, { signo: n.signo(asc.id) }), detalle: formatoGrado(ascendente) },
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {fichas.map((f, i) => (
          <div key={i} className={`aparecer flex items-center gap-4 rounded-2xl border p-4 sm:flex-col sm:gap-1 sm:p-5 sm:text-center ${f.signo ? "border-oro/40 bg-superficie-2/60" : "border-dashed border-borde opacity-70"}`} style={{ animationDelay: `${i * 150}ms` }}>
            {f.signo ? (
              // eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña
              <img src={imagenSigno(f.signo)} alt="" width={84} height={84} className="moneda-signo h-16 w-16 shrink-0 sm:order-2 sm:my-1 sm:h-[84px] sm:w-[84px]" />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-dashed border-borde text-3xl text-texto-suave sm:order-2 sm:my-1 sm:h-[84px] sm:w-[84px]">?</span>
            )}
            <div className="min-w-0 sm:contents">
              <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave sm:order-1">{f.rol}</p>
              <p className="font-display text-xl text-oro-suave sm:order-3 sm:text-2xl">{f.titulo}</p>
              {f.detalle && <p className="text-xs text-texto-suave sm:order-4">{f.detalle}</p>}
              <p className="text-sm text-texto sm:order-5">{f.signo ? claves[f.signo] : a.sinHora}</p>
            </div>
          </div>
        ))}
      </div>
      {!horaDesconocida && pr && (
        <p className="text-center text-sm text-texto-suave">
          <span className="text-oro">{glifo(SIMBOLOS_CUERPO[regente])}</span>{" "}
          {plantilla(a.regente, { cuerpo: n.cuerpo(regente), asc: n.signo(asc.id), signo: n.signo(pr.signo), casa: pr.casa })}
        </p>
      )}
    </div>
  );
}

/**
 * Los doce signos en una cuadrícula de elementos (filas) por modalidades
 * (columnas), con los planetas de la persona en su casilla; la fila y la
 * columna que dominan se marcan, y se nombra el elemento que falta.
 */
export function TemperamentoCarta({ tm, t }: { tm: Temperamento; t: Diccionario }) {
  const a = t.astral;
  const n = nombres(t);
  const elementoTexto = a.elementoTexto as Record<string, string>;
  const faltaTexto = a.faltaTexto as Record<string, string>;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[4.5rem_repeat(3,minmax(0,1fr))] gap-1.5 text-center text-xs">
        <span />
        {MODALIDADES.map((m) => (
          <span key={m} className={`pb-1 uppercase tracking-wider ${m === tm.modalidad ? "font-semibold text-oro-suave" : "text-texto-suave"}`}>
            {a.modalidades[m]} <span className="tabular-nums">{tm.modalidades[m]}</span>
          </span>
        ))}
        {ELEMENTOS.map((e) => (
          <div key={e} className="contents">
            <span className="flex flex-col items-start justify-center text-left font-semibold" style={{ color: COLOR_ELEMENTO[e] }}>
              {a.elementosNombres[e]}
              <span className="tabular-nums text-texto-suave">{tm.elementos[e]}</span>
            </span>
            {MODALIDADES.map((m) => {
              const s = SIGNOS.find((x) => x.elemento === e && x.modalidad === m)!;
              const cs = tm.celda[e][m];
              const domina = e === tm.elemento && m === tm.modalidad;
              return (
                <div key={m} className={`flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-lg border p-1 ${domina ? "border-oro bg-oro/10" : cs.length ? "border-borde bg-superficie-2/70" : "border-borde/50"}`}>
                  <span className={cs.length ? "text-texto-suave" : "text-texto-suave/50"}>
                    {glifo(s.simbolo)} {n.signo(s.id)}
                  </span>
                  {cs.length > 0 && (
                    <span className="text-base leading-none tracking-wider" style={{ color: COLOR_ELEMENTO[e] }} title={cs.map(n.cuerpo).join(", ")}>
                      {cs.map((c) => glifo(SIMBOLOS_CUERPO[c])).join(" ")}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="space-y-1 text-sm">
        <p className="font-display text-xl text-oro-suave">{plantilla(a.mezcla, { elemento: a.elementosNombres[tm.elemento], modalidad: a.modalidades[tm.modalidad] })}</p>
        <p className="text-texto">{elementoTexto[tm.elemento]} {(a.modalidadTexto as Record<string, string>)[tm.modalidad]}</p>
        {tm.faltan.map((e) => (
          <p key={e} className="text-texto-suave">
            <span style={{ color: COLOR_ELEMENTO[e] }}>{plantilla(a.falta, { elemento: a.elementosNombres[e] })}</span>: {faltaTexto[e]}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Dibujo pequeño de una figura sobre el círculo del zodiaco, orientado como la rueda (Ascendente a la izquierda). */
function DibujoFigura({ figura, planetas, ascendente }: { figura: Figura; planetas: PlanetaFigura[]; ascendente: number }) {
  const C = 70;
  const R = 46;
  const punto = (lon: number, r = R) => {
    const ang = ((180 + (lon - ascendente)) * Math.PI) / 180;
    return [r2(C + r * Math.cos(ang)), r2(C - r * Math.sin(ang))] as const;
  };
  const lon = (c: Cuerpo) => planetas.find((p) => p.cuerpo === c)?.longitud ?? 0;
  const color = COLOR_FIGURA[figura.tipo];
  const cs = figura.cuerpos;
  const linea = (x: Cuerpo, y: Cuerpo, col: string, i: number) => {
    const [x1, y1] = punto(lon(x));
    const [x2, y2] = punto(lon(y));
    return <line key={`${x}${y}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={1.8} pathLength={1} className="trazo-aspecto" style={{ animationDelay: `${200 + i * 200}ms` }} />;
  };
  let lineas: ReactNode[] = [];
  if (figura.tipo === "granTrigono") {
    const orden = [...cs].sort((x, y) => lon(x) - lon(y));
    lineas = orden.map((x, i) => linea(x, orden[(i + 1) % orden.length], color, i));
  } else if (figura.tipo === "tCuadrada" && figura.vertice) {
    const [x, , y] = cs;
    lineas = [linea(x, y, COLOR_ASPECTO.oposicion, 0), linea(x, figura.vertice, COLOR_ASPECTO.cuadratura, 1), linea(y, figura.vertice, COLOR_ASPECTO.cuadratura, 2)];
  } else if (figura.tipo === "granCruz") {
    const [p, q, r, s] = cs;
    lineas = [linea(p, q, color, 0), linea(q, r, color, 1), linea(r, s, color, 2), linea(s, p, color, 3), linea(p, r, COLOR_ASPECTO.oposicion, 4), linea(q, s, COLOR_ASPECTO.oposicion, 5)];
  }
  let arco: ReactNode = null;
  if (figura.tipo === "stellium") {
    const ls = cs.map(lon).sort((x, y) => x - y);
    // El arco más corto que cubre a todos: empieza después del mayor hueco entre planetas.
    let hueco = 0;
    let inicio = ls[0];
    ls.forEach((l, i) => {
      const sig = i + 1 < ls.length ? ls[i + 1] : ls[0] + 360;
      if (sig - l > hueco) {
        hueco = sig - l;
        inicio = sig % 360;
      }
    });
    const fin = inicio + (360 - hueco);
    const [x1, y1] = punto(inicio - 3, R);
    const [x2, y2] = punto(fin + 3, R);
    arco = <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${fin - inicio + 6 > 180 ? 1 : 0} 0 ${x2} ${y2}`} fill="none" stroke={color} strokeOpacity={0.45} strokeWidth={12} strokeLinecap="round" />;
  }
  return (
    <svg viewBox="0 0 140 140" className="h-28 w-28 shrink-0" aria-hidden>
      <circle cx={C} cy={C} r={R} fill="#150f26" stroke="rgba(241,217,154,0.3)" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x1, y1] = punto(i * 30, R);
        const [x2, y2] = punto(i * 30, R + 6);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(241,217,154,0.35)" />;
      })}
      {arco}
      {lineas}
      {separar(cs.map((c) => ({ c, longitud: lon(c) })), 16).map(({ c, dibujo }) => {
        const [x, y] = punto(lon(c));
        const [lx, ly] = punto(dibujo, R + 16);
        return (
          <g key={c}>
            <circle cx={x} cy={y} r={3.5} fill={color} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize={12} fill={color}>
              {glifo(SIMBOLOS_CUERPO[c])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Las figuras que forman los planetas (stellium, gran trígono, T-cuadrada, gran cruz), cada una con su dibujo. */
export function FigurasCarta({ figuras, planetas, ascendente, t }: { figuras: Figura[]; planetas: PlanetaFigura[]; ascendente: number; t: Diccionario }) {
  const a = t.astral;
  const n = nombres(t);
  if (!figuras.length) return <p className="text-sm text-texto-suave">{a.sinFiguras}</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {figuras.map((f, i) => (
        <div key={i} className="aparecer flex items-center gap-4 rounded-xl border border-borde bg-superficie-2/60 p-3" style={{ animationDelay: `${i * 120}ms` }}>
          <DibujoFigura figura={f} planetas={planetas} ascendente={ascendente} />
          <div className="min-w-0 space-y-1 text-sm">
            <p className="font-display text-xl" style={{ color: COLOR_FIGURA[f.tipo] }}>
              {a.figuras[f.tipo].nombre}
              {f.signo && <span className="text-base text-texto-suave"> {plantilla(a.enSignoCorto, { signo: n.signo(f.signo) })}</span>}
              {f.casa && <span className="text-base text-texto-suave"> {plantilla(a.enCasa, { n: f.casa })}</span>}
            </p>
            <p className="text-texto">{f.cuerpos.map(n.cuerpo).join(" · ")}</p>
            {f.vertice && <p className="text-xs text-oro-suave">{plantilla(a.vertice, { cuerpo: n.cuerpo(f.vertice) })}</p>}
            <p className="text-xs text-texto-suave">{a.figuras[f.tipo].texto}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * El círculo partido por el horizonte (Ascendente–Descendente) y el meridiano
 * (Medio Cielo–Fondo del cielo), con los planetas en su lugar y cuántos caen
 * en cada mitad.
 */
export function HemisferiosCarta({ h, planetas, ascendente, t }: { h: Hemisferios; planetas: PlanetaFigura[]; ascendente: number; t: Diccionario }) {
  const a = t.astral;
  const C = 120;
  const R = 62;
  const punto = (lon: number, r = R) => {
    const ang = ((180 + (lon - ascendente)) * Math.PI) / 180;
    return [r2(C + r * Math.cos(ang)), r2(C - r * Math.sin(ang))] as const;
  };
  const vertical = h.arriba.length - h.abajo.length >= 2 ? "arriba" : h.abajo.length - h.arriba.length >= 2 ? "abajo" : "vertical";
  const horizontal = h.este.length - h.oeste.length >= 2 ? "este" : h.oeste.length - h.este.length >= 2 ? "oeste" : "horizontal";
  const fuerte = (lado: "arriba" | "abajo" | "este" | "oeste") => lado === vertical || lado === horizontal;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,14rem)_1fr]">
      <svg viewBox="0 0 240 200" className="mx-auto w-full max-w-[14rem]" role="img" aria-label={a.hemisferiosTitulo}>
        <path d={`M ${C - R - 14} ${C} A ${R + 14} ${R + 14} 0 0 1 ${C + R + 14} ${C} Z`} fill={vertical === "arriba" ? "rgba(241,217,154,0.14)" : "rgba(255,255,255,0.03)"} />
        <path d={`M ${C - R - 14} ${C} A ${R + 14} ${R + 14} 0 0 0 ${C + R + 14} ${C} Z`} fill={vertical === "abajo" ? "rgba(241,217,154,0.14)" : "rgba(255,255,255,0.03)"} />
        <circle cx={C} cy={C} r={R + 14} fill="none" stroke="rgba(241,217,154,0.35)" />
        <line x1={C - R - 22} y1={C} x2={C + R + 22} y2={C} stroke="#f1d99a" strokeWidth={1.4} />
        <line x1={C} y1={C - R - 22} x2={C} y2={C + R + 22} stroke="#b7a5ff" strokeWidth={1.2} strokeDasharray="3 4" />
        {separar(planetas.filter((p) => p.cuerpo !== "nodo_norte"), 13)
          .map((p, i) => {
            const [x, y] = punto(p.dibujo);
            return (
              <text key={p.cuerpo} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={13} fill="#f1d99a" className="aparecer" style={{ animationDelay: `${i * 60}ms` }}>
                {glifo(SIMBOLOS_CUERPO[p.cuerpo])}
              </text>
            );
          })}
        <text x={C} y={12} textAnchor="middle" fontSize={11} fill={fuerte("arriba") ? "#f1d99a" : "rgba(236,230,247,0.6)"}>{a.lados.arriba} {h.arriba.length}</text>
        <text x={C} y={196} textAnchor="middle" fontSize={11} fill={fuerte("abajo") ? "#f1d99a" : "rgba(236,230,247,0.6)"}>{a.lados.abajo} {h.abajo.length}</text>
        <text x={2} y={C - 8} fontSize={11} fill={fuerte("este") ? "#f1d99a" : "rgba(236,230,247,0.6)"}>{a.lados.este} {h.este.length}</text>
        <text x={238} y={C - 8} textAnchor="end" fontSize={11} fill={fuerte("oeste") ? "#f1d99a" : "rgba(236,230,247,0.6)"}>{a.lados.oeste} {h.oeste.length}</text>
      </svg>
      <div className="space-y-2 text-sm text-texto">
        <p>{a.hemisferiosTexto[vertical]}</p>
        <p>{a.hemisferiosTexto[horizontal]}</p>
      </div>
    </div>
  );
}

/** El aspectario: una escalera con un planeta por fila y el aspecto entre cada par en su casilla. */
export function Aspectario({ planetas, aspectos, t }: { planetas: PlanetaFigura[]; aspectos: { a: Cuerpo; b: Cuerpo; tipo: TipoAspecto; orbe: number }[]; t: Diccionario }) {
  const n = nombres(t);
  const nombresAspecto = t.astral.aspectosNombres as Record<TipoAspecto, string>;
  const cs = planetas.map((p) => p.cuerpo);
  const L = 26;
  const entre = (x: Cuerpo, y: Cuerpo) => aspectos.find((a) => (a.a === x && a.b === y) || (a.a === y && a.b === x));
  return (
    <svg viewBox={`0 0 ${cs.length * L + 2} ${cs.length * L + 2}`} className="mx-auto w-full max-w-[22rem]" role="img" aria-label={t.astral.aspectarioTitulo}>
      {cs.map((fila, i) =>
        cs.slice(0, i + 1).map((col, j) => {
          const x = 1 + j * L;
          const y = 1 + i * L;
          if (i === j) {
            return (
              <g key={`${i}${j}`}>
                <rect x={x} y={y} width={L} height={L} rx={4} fill="#2a1a5e" />
                <text x={x + L / 2} y={y + L / 2} textAnchor="middle" dominantBaseline="central" fontSize={14} fill="#f1d99a">
                  <title>{n.cuerpo(fila)}</title>
                  {glifo(SIMBOLOS_CUERPO[fila])}
                </text>
              </g>
            );
          }
          const a = entre(fila, col);
          return (
            <g key={`${i}${j}`}>
              <rect x={x} y={y} width={L} height={L} fill={a ? `${COLOR_ASPECTO[a.tipo]}22` : "none"} stroke="rgba(241,217,154,0.15)" />
              {a && (
                <text x={x + L / 2} y={y + L / 2} textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill={COLOR_ASPECTO[a.tipo]}>
                  <title>{`${n.cuerpo(fila)} · ${nombresAspecto[a.tipo]} · ${n.cuerpo(col)} (${a.orbe}°)`}</title>
                  {glifo(SIMBOLOS_ASPECTO[a.tipo])}
                </text>
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** Leyenda de colores de los aspectos. */
export function LeyendaAspectos({ t }: { t: Diccionario }) {
  const nombresAspecto = t.astral.aspectosNombres as Record<TipoAspecto, string>;
  return (
    <p className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-texto-suave">
      {(Object.keys(COLOR_ASPECTO) as TipoAspecto[]).map((k) => (
        <span key={k}>
          <span style={{ color: COLOR_ASPECTO[k] }}>{glifo(SIMBOLOS_ASPECTO[k])}</span> {nombresAspecto[k]}
        </span>
      ))}
    </p>
  );
}
