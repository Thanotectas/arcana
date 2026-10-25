import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { COLOR_CSS, NAWALES, NOMBRE_COLOR, TONOS, nombreKin, selloPorNumero, type ResultadoMaya } from "@/lib/oraculos/maya";

type T = Diccionario["maya"];

const COLOR_HOY = "#ffb35c";

/** Kin (1–260) que une un sello (1–20) con un tono (1–13). */
export function kinDe(sello: number, tono: number) {
  for (let k = sello; k <= 260; k += 20) if ((k - 1) % 13 === tono - 1) return k;
  return sello;
}

/** Días que faltan para que el Tzolkin vuelva al kin de la persona (0 = hoy). */
export function diasParaKin(kin: number, kinHoy: number) {
  return (kin - kinHoy + 260) % 260;
}

/**
 * Número maya de puntos y barras (1–13). Vertical, como se escribe junto al
 * cartucho de un día: barras de pie y los puntos en columna a su izquierda.
 */
export function NumeroMaya({ n, vertical = false, color = "#f1d99a", className = "" }: { n: number; vertical?: boolean; color?: string; className?: string }) {
  const barras = Math.floor(n / 5);
  const puntos = n % 5;
  if (vertical) {
    const ancho = (puntos ? 9 : 0) + barras * 8;
    return (
      <svg viewBox={`0 0 ${Math.max(ancho, 6)} 40`} className={className} aria-hidden>
        {Array.from({ length: puntos }, (_, i) => (
          <circle key={`p${i}`} cx="3.6" cy={20 + (i - (puntos - 1) / 2) * 8.4} r="3.1" fill={color} />
        ))}
        {Array.from({ length: barras }, (_, i) => (
          <rect key={`b${i}`} x={(puntos ? 9 : 0) + i * 8} y="2" width="5" height="36" rx="2.5" fill={color} />
        ))}
      </svg>
    );
  }
  const alto = (puntos ? 9 : 0) + barras * 8;
  return (
    <svg viewBox={`0 0 40 ${Math.max(alto, 6)}`} className={className} aria-hidden>
      {Array.from({ length: puntos }, (_, i) => (
        <circle key={`p${i}`} cx={20 + (i - (puntos - 1) / 2) * 8.4} cy="3.6" r="3.1" fill={color} />
      ))}
      {Array.from({ length: barras }, (_, i) => (
        <rect key={`b${i}`} x="2" y={(puntos ? 9 : 0) + i * 8} width="36" height="5" rx="2.5" fill={color} />
      ))}
    </svg>
  );
}

/**
 * Glifo de un kin: el número del tono en puntos y barras y, al lado, el
 * cartucho del sello con su color (rojo, blanco, azul o amarillo) y su pedestal.
 */
export function GlifoKin({ sello, tono, idioma, grande = false, destacado = false, sinNumero = false }: { sello: number; tono: number; idioma: Idioma; grande?: boolean; destacado?: boolean; sinNumero?: boolean }) {
  const s = selloPorNumero(sello);
  const color = COLOR_CSS[s.color];
  return (
    <div className={`flex items-center ${grande ? "gap-2.5" : "gap-1.5"}`}>
      {!sinNumero && <NumeroMaya n={tono} vertical color={color} className={`${grande ? "h-16" : "h-9"} w-auto shrink-0`} />}
      <div className="flex flex-col items-center">
        <div
          className={`flex flex-col items-center justify-center rounded-[38%] border-2 text-center ${grande ? "h-28 w-28 p-2" : "h-[4.6rem] w-[4.6rem] p-1"} ${destacado ? "maya-glifo-vivo" : ""}`}
          style={{ borderColor: color, background: `radial-gradient(circle at 50% 35%, ${color}40, ${color}12 65%, transparent), #150f2a`, boxShadow: destacado ? `0 0 26px ${color}66` : undefined }}
        >
          <span className={`font-display leading-tight text-texto ${grande ? "text-lg" : "text-[0.78rem]"}`}>{s.nombre[idioma]}</span>
          <span className={`mt-0.5 uppercase tracking-widest ${grande ? "text-[0.65rem]" : "text-[0.55rem]"}`} style={{ color }}>
            {NOMBRE_COLOR[s.color][idioma]}
          </span>
        </div>
        {/* Pedestal del cartucho, como en los glifos de los días */}
        <div className="mt-0.5 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className={`${grande ? "h-2 w-5" : "h-1.5 w-3"} rounded-b-full`} style={{ background: `${color}88` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Encabezado del resultado: glifo del kin, su nombre, el tono y su pregunta. */
export function EncabezadoKin({ r, t, idioma }: { r: ResultadoMaya; t: T; idioma: Idioma }) {
  const sello = selloPorNumero(r.sello);
  const tono = TONOS[r.tono - 1];
  return (
    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
      <div className="maya-entrada shrink-0">
        <GlifoKin sello={r.sello} tono={r.tono} idioma={idioma} grande destacado />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.tuKin} · Kin {r.kin}</p>
        <p className="font-display text-3xl font-semibold leading-tight text-oro-suave">{nombreKin(r.kin, idioma)}</p>
        <p className="mt-1 text-sm" style={{ color: COLOR_CSS[sello.color] }}>{t.claves[r.sello - 1]}</p>
        <p className="mt-2 text-sm text-texto-suave">
          {t.tono} {tono.numero} · {tono.nombre[idioma]} — <span className="text-texto">{t.preguntas[r.tono - 1]}</span>
        </p>
      </div>
    </div>
  );
}

/**
 * Cruz del oráculo del destino: el kin en el centro, el guía arriba, el
 * análogo a la derecha, el antípoda a la izquierda y el oculto abajo.
 */
export function CruzOraculo({ r, t, idioma }: { r: ResultadoMaya; t: T; idioma: Idioma }) {
  const celda = (rol: "guia" | "analogo" | "antipoda" | "oculto" | "destino", sello: number, area: string, retraso: number) => (
    <div className={`${area} maya-entrada flex flex-col items-center gap-1 text-center`} style={{ animationDelay: `${retraso}s` }}>
      <span className="text-[0.65rem] uppercase tracking-widest text-violeta-suave">{rol === "destino" ? t.destino : t.oraculo[rol]}</span>
      {/* Los cinco comparten el tono: el número solo va en el centro. */}
      <GlifoKin sello={sello} tono={r.tono} idioma={idioma} destacado={rol === "destino"} sinNumero={rol !== "destino"} />
      {rol !== "destino" && <span className="text-[0.7rem] leading-tight text-texto-suave">{t.roles[rol]}</span>}
    </div>
  );
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.cruzTitulo}</p>
        <p className="mt-1 text-sm text-texto-suave">{t.cruzNota}</p>
      </div>
      <div className="relative mx-auto max-w-sm">
        {/* La cruz que une los cinco sellos */}
        <svg viewBox="0 0 300 300" className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <path d="M 150 40 L 150 260 M 40 150 L 260 150" stroke="rgba(241,217,154,0.3)" strokeWidth="1.4" strokeDasharray="4 5" className="maya-cruz" />
        </svg>
        <div className="relative grid grid-cols-3 grid-rows-3 items-center justify-items-center gap-y-2">
          {celda("guia", r.oraculo.guia, "col-start-2 row-start-1", 0.35)}
          {celda("antipoda", r.oraculo.antipoda, "col-start-1 row-start-2", 0.55)}
          {celda("destino", r.sello, "col-start-2 row-start-2", 0)}
          {celda("analogo", r.oraculo.analogo, "col-start-3 row-start-2", 0.75)}
          {celda("oculto", r.oraculo.oculto, "col-start-2 row-start-3", 0.95)}
        </div>
      </div>
    </div>
  );
}

/**
 * Matriz del Tzolkin: 13 columnas de 20 sellos (los 260 kines). Brilla el kin
 * de la persona, los kines de su oráculo llevan un punto y un anillo marca el
 * kin del día.
 */
export function MatrizTzolkin({ r, t, idioma }: { r: ResultadoMaya; t: T; idioma: Idioma }) {
  const C = 13, F = 20, P = 14, M = 18;
  const oraculo = new Map<number, string>([
    [kinDe(r.oraculo.guia, r.tono), t.oraculo.guia],
    [kinDe(r.oraculo.analogo, r.tono), t.oraculo.analogo],
    [kinDe(r.oraculo.antipoda, r.tono), t.oraculo.antipoda],
    [kinDe(r.oraculo.oculto, r.tono), t.oraculo.oculto],
  ]);
  const pos = (k: number) => ({ x: M + Math.floor((k - 1) / F) * P, y: Math.floor(((k - 1) % F)) * P });
  const tuyo = pos(r.kin), hoy = pos(r.kinHoy);
  const dias = diasParaKin(r.kin, r.kinHoy);
  return (
    <div className="grid items-center gap-5 sm:grid-cols-[auto_1fr]">
      <svg viewBox={`-2 -2 ${M + C * P + 4} ${F * P + 4}`} className="mx-auto w-full max-w-[13.5rem]" role="img" aria-label={t.matrizTitulo}>
        {/* Color de cada fila (el sello) */}
        {Array.from({ length: F }, (_, i) => (
          <circle key={i} cx="6" cy={i * P + 6} r="3.4" fill={COLOR_CSS[selloPorNumero(i + 1).color]} opacity="0.8" />
        ))}
        {Array.from({ length: 260 }, (_, i) => {
          const k = i + 1;
          const { x, y } = pos(k);
          const s = selloPorNumero(k);
          const esTuyo = k === r.kin;
          return (
            <rect
              key={k}
              x={x}
              y={y}
              width={P - 2}
              height={P - 2}
              rx="2.5"
              fill={COLOR_CSS[s.color]}
              fillOpacity={esTuyo ? 1 : oraculo.has(k) ? 0.5 : 0.13}
              className="maya-celda"
              style={{ animationDelay: `${(Math.floor(i / F) * 0.05).toFixed(2)}s` }}
            />
          );
        })}
        {[...oraculo.keys()].map((k) => (
          <circle key={k} cx={pos(k).x + (P - 2) / 2} cy={pos(k).y + (P - 2) / 2} r="2" fill="#120c22" />
        ))}
        <rect x={tuyo.x - 3} y={tuyo.y - 3} width={P + 4} height={P + 4} rx="5" fill="none" stroke="#f1d99a" strokeWidth="1.6" className="maya-latido" style={{ transformOrigin: `${tuyo.x + (P - 2) / 2}px ${tuyo.y + (P - 2) / 2}px` }} />
        {dias !== 0 && <circle cx={hoy.x + (P - 2) / 2} cy={hoy.y + (P - 2) / 2} r="8.5" fill="none" stroke={COLOR_HOY} strokeWidth="1.6" />}
      </svg>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.matrizTitulo}</p>
          <p className="mt-1 text-texto-suave">{t.matrizNota}</p>
        </div>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm ring-2 ring-oro-suave" style={{ background: COLOR_CSS[selloPorNumero(r.sello).color] }} />
            <span className="text-texto-suave">{t.tuKin}:</span> Kin {r.kin}, {nombreKin(r.kin, idioma)}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full border-2" style={{ borderColor: COLOR_HOY }} />
            <span className="text-texto-suave">{t.kinHoy}:</span> Kin {r.kinHoy}, {nombreKin(r.kinHoy, idioma)}
          </li>
          <li className="flex items-center gap-2">
            <NumeroMaya n={r.nawal.numero} color="#b7a5ff" className="h-3.5 w-auto shrink-0" />
            <span className="text-texto-suave">{t.nawal}:</span> {r.nawal.numero} {NAWALES[r.nawal.indice].nombre}
          </li>
        </ul>
        <p className="rounded-xl border px-3 py-2 text-texto" style={{ borderColor: `${COLOR_HOY}55`, background: `${COLOR_HOY}12` }}>
          {dias === 0 ? t.hoyTuKin : plantilla(t.vuelve, { n: dias })}
        </p>
      </div>
    </div>
  );
}
