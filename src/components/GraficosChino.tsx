import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import { ANIMALES, ELEMENTOS, FICHA, COLOR_ELEMENTO, CARACTER_ELEMENTO, type Animal, type ElementoChino, type PilarAnio, type ResultadoChino } from "@/lib/chino";

type T = Diccionario["chino"];

const COLOR_TRINO = "#f1d99a";
const COLOR_AMIGO = "#7fd6a4";
const COLOR_CHOQUE = "#ff8a5b";
const COLOR_HORA = "#b7a5ff";
const COLOR_ANIO = "#ffb35c";

const redondear = (v: number) => Math.round(v * 10) / 10;
const polar = (cx: number, cy: number, r: number, grados: number) => {
  const a = (grados * Math.PI) / 180;
  return { x: redondear(cx + r * Math.cos(a)), y: redondear(cy + r * Math.sin(a)) };
};
/** Ángulo de cada animal en la rueda: la Rata arriba y en sentido horario. */
const anguloAnimal = (a: Animal) => ANIMALES.indexOf(a) * 30 - 90;

function sector(r1: number, r2: number, desde: number, hasta: number) {
  const a = polar(200, 200, r2, desde), b = polar(200, 200, r2, hasta), c = polar(200, 200, r1, hasta), d = polar(200, 200, r1, desde);
  return `M ${a.x} ${a.y} A ${r2} ${r2} 0 0 1 ${b.x} ${b.y} L ${c.x} ${c.y} A ${r1} ${r1} 0 0 0 ${d.x} ${d.y} Z`;
}

/** Símbolo del yin y el yang, con la mitad de la polaridad iluminada. */
export function YinYang({ polaridad, className = "" }: { polaridad: "yin" | "yang"; className?: string }) {
  const claro = polaridad === "yang" ? "#f1d99a" : "rgba(241,217,154,0.25)";
  const oscuro = polaridad === "yin" ? "#8b6cf6" : "rgba(139,108,246,0.3)";
  return (
    <svg viewBox="-12 -12 24 24" className={className} aria-hidden>
      <circle r="11" fill={oscuro} />
      <path d="M 0 -11 A 11 11 0 0 1 0 11 A 5.5 5.5 0 0 1 0 0 A 5.5 5.5 0 0 0 0 -11 Z" fill={claro} />
      <circle cy="-5.5" r="1.8" fill={oscuro} />
      <circle cy="5.5" r="1.8" fill={claro} />
      <circle r="11" fill="none" stroke="#e2bc63" strokeWidth="0.8" />
    </svg>
  );
}

/** Encabezado del resultado: moneda del animal, su carácter y el pilar del año. */
export function PilarChino({ r, t }: { r: ResultadoChino; t: T }) {
  const nombres = t.animales as Record<Animal, string>;
  const elementos = t.elementos as Record<ElementoChino, string>;
  const color = COLOR_ELEMENTO[r.pilar.elemento];
  return (
    <div className="flex items-center justify-center gap-4 text-left">
      <div className="relative shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
        <img src={`/animales/${r.pilar.animal}.webp`} alt="" width={88} height={88} className="animal-oro-vivo chino-moneda" />
        <span className="font-display absolute -right-2 -top-1 text-2xl" style={{ color }}>{FICHA[r.pilar.animal].caracter}</span>
      </div>
      <div>
        <p className="font-display text-3xl font-semibold leading-tight text-oro-suave">{plantilla(t.pilar, { animal: nombres[r.pilar.animal], elemento: elementos[r.pilar.elemento] })}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-texto-suave">
          <span style={{ color }}>{CARACTER_ELEMENTO[r.pilar.elemento]} {elementos[r.pilar.elemento]}</span>
          <span>·</span>
          <YinYang polaridad={r.pilar.polaridad} className="h-4 w-4" />
          {r.pilar.polaridad}
          <span>·</span>
          {r.pilar.anio}
        </p>
      </div>
    </div>
  );
}

/**
 * Rueda de los doce animales. Cada casilla lleva el color del elemento fijo
 * del animal; con un resultado se trazan el triángulo de afinidad, el amigo
 * secreto y el choque, se marca el animal de la hora y el del año en curso.
 */
export function RuedaAnimales({ r, t, className = "" }: { r: ResultadoChino | null; t: T; className?: string }) {
  const nombres = t.animales as Record<Animal, string>;
  const animal = r?.pilar.animal ?? null;
  const punto = (a: Animal, radio = 124) => polar(200, 200, radio, anguloAnimal(a));
  const trino = r ? [r.pilar.animal, ...r.companeros].map((a) => punto(a)) : [];
  return (
    <svg viewBox="-14 -6 428 414" className={className} role="img" aria-label={t.rueda}>
      <defs>
        <radialGradient id="chino-fondo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#2a1a5e" stopOpacity="0.55" />
          <stop offset="1" stopColor="#120c22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="194" fill="url(#chino-fondo)" stroke="rgba(217,180,90,0.5)" />
      <circle cx="200" cy="200" r="189" fill="none" stroke="rgba(217,180,90,0.18)" />

      {/* Casillas con el color del elemento fijo de cada animal */}
      {ANIMALES.map((a) => {
        const ang = anguloAnimal(a);
        const activo = a === animal;
        return (
          <path
            key={a}
            d={sector(128, 186, ang - 15, ang + 15)}
            fill={COLOR_ELEMENTO[FICHA[a].elementoFijo]}
            fillOpacity={activo ? 0.24 : 0.06}
            stroke="rgba(217,180,90,0.22)"
            strokeWidth="0.8"
            style={{ transition: "fill-opacity .4s" }}
          />
        );
      })}
      <circle cx="200" cy="200" r="128" fill="none" stroke="rgba(217,180,90,0.35)" />

      {/* Carácter del elemento del año, de marca de agua en el centro */}
      {r ? (
        <text x="200" y="232" textAnchor="middle" fontSize="96" fill={COLOR_ELEMENTO[r.pilar.elemento]} opacity="0.12" fontFamily="serif">
          {CARACTER_ELEMENTO[r.pilar.elemento]}
        </text>
      ) : (
        <text x="200" y="205" textAnchor="middle" fontSize="13" fill="rgba(168,159,192,0.9)">{t.escribeFecha}</text>
      )}

      {/* Relaciones: se vuelven a dibujar cada vez que cambia el animal */}
      {r && (
        <g key={`${r.pilar.animal}-${r.animalHora ?? ""}`}>
          <polygon points={trino.map((p) => `${p.x},${p.y}`).join(" ")} fill={COLOR_TRINO} fillOpacity="0.07" stroke={COLOR_TRINO} strokeWidth="1.6" strokeLinejoin="round" pathLength={1} className="chino-trazo" />
          <line x1={punto(r.pilar.animal).x} y1={punto(r.pilar.animal).y} x2={punto(r.amigo).x} y2={punto(r.amigo).y} stroke={COLOR_AMIGO} strokeWidth="1.6" strokeLinecap="round" pathLength={1} className="chino-trazo chino-trazo-2" />
          <line x1={punto(r.pilar.animal).x} y1={punto(r.pilar.animal).y} x2={punto(r.choque).x} y2={punto(r.choque).y} stroke={COLOR_CHOQUE} strokeWidth="1.4" strokeDasharray="4 4" className="chino-aparecer" />
          {[r.pilar.animal, ...r.companeros, r.amigo, r.choque].map((a, i) => (
            <circle key={i} cx={punto(a).x} cy={punto(a).y} r="3" fill={i === 0 ? COLOR_ELEMENTO[r.pilar.elemento] : i <= 2 ? COLOR_TRINO : i === 3 ? COLOR_AMIGO : COLOR_CHOQUE} />
          ))}
        </g>
      )}

      {/* Los doce animales */}
      {ANIMALES.map((a) => {
        const { x, y } = punto(a, 157);
        const activo = a === animal;
        const secreto = r?.animalHora === a && !activo;
        const anioAhora = r?.anioActual.animal === a;
        const tam = activo ? 50 : 36;
        const color = activo && r ? COLOR_ELEMENTO[r.pilar.elemento] : secreto ? COLOR_HORA : "rgba(236,230,247,0.6)";
        return (
          <g key={a}>
            {activo && <circle cx={x} cy={y} r="30" fill={color} opacity="0.2" className="chino-halo" style={{ transformOrigin: `${x}px ${y}px` }} />}
            {secreto && <circle cx={x} cy={y} r="21" fill="none" stroke={COLOR_HORA} strokeWidth="1.4" strokeDasharray="3 3" />}
            {anioAhora && !activo && <circle cx={x} cy={y} r="21" fill="none" stroke={COLOR_ANIO} strokeWidth="1.2" strokeDasharray="1 3" strokeLinecap="round" className="chino-orbita" style={{ transformOrigin: `${x}px ${y}px` }} />}
            <image
              href={`/animales/${a}.webp`}
              x={x - tam / 2}
              y={y - tam / 2 - 2}
              width={tam}
              height={tam}
              className={activo ? "animal-oro-vivo" : secreto ? "animal-violeta" : r && (r.companeros.includes(a) || r.amigo === a || anioAhora) ? "" : "animal-oro"}
              style={{ transition: "all .4s" }}
            />
            <text x={x} y={y + (activo ? 33 : 29)} textAnchor="middle" fontSize={activo ? 11.5 : 9.5} fontWeight={activo ? 600 : 400} fill={activo ? color : "rgba(190,182,214,0.9)"}>
              {nombres[a]}
              {anioAhora && activo && r && <tspan fill={COLOR_ANIO}> · {r.anioActual.anio}</tspan>}
            </text>
            {anioAhora && !activo && r && (
              <text x={x} y={y - 26} textAnchor="middle" fontSize="9" fontWeight="600" fill={COLOR_ANIO}>
                {r.anioActual.anio}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Lista de lo que dibuja la rueda, con la clave de color de cada línea. */
export function LeyendaRueda({ r, t }: { r: ResultadoChino; t: T }) {
  const nombres = t.animales as Record<Animal, string>;
  const elementos = t.elementos as Record<ElementoChino, string>;
  const pilar = (p: PilarAnio) => plantilla(t.pilar, { animal: nombres[p.animal], elemento: elementos[p.elemento] });
  const filas: { muestra: React.ReactNode; titulo: string; valor: string }[] = [
    { muestra: <path d="M 2 12 L 9 2 L 16 12 Z" fill="none" stroke={COLOR_TRINO} strokeWidth="1.6" strokeLinejoin="round" />, titulo: t.trino, valor: r.companeros.map((a) => nombres[a]).join(" · ") },
    { muestra: <line x1="1" y1="7" x2="17" y2="7" stroke={COLOR_AMIGO} strokeWidth="2" strokeLinecap="round" />, titulo: t.amigo, valor: nombres[r.amigo] },
    { muestra: <line x1="1" y1="7" x2="17" y2="7" stroke={COLOR_CHOQUE} strokeWidth="2" strokeDasharray="3 3" />, titulo: t.choque, valor: nombres[r.choque] },
  ];
  if (r.animalHora) filas.push({ muestra: <circle cx="9" cy="7" r="5.5" fill="none" stroke={COLOR_HORA} strokeWidth="1.4" strokeDasharray="2 2" />, titulo: t.animalSecreto, valor: nombres[r.animalHora] });
  return (
    <div className="space-y-2 text-sm">
      <ul className="space-y-1.5">
        {filas.map((f) => (
          <li key={f.titulo} className="flex items-baseline gap-2">
            <svg viewBox="0 0 18 14" className="h-3.5 w-[18px] shrink-0 self-center" aria-hidden>{f.muestra}</svg>
            <span className="text-texto-suave">{f.titulo}:</span>
            <span className="text-texto">{f.valor}</span>
          </li>
        ))}
      </ul>
      <p className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
        <svg viewBox="0 0 18 14" className="mt-1 h-3.5 w-[18px] shrink-0" aria-hidden>
          <circle cx="9" cy="7" r="5.5" fill="none" stroke={COLOR_ANIO} strokeWidth="1.4" strokeDasharray="1 2.4" strokeLinecap="round" />
        </svg>
        <span>
          <span className="text-texto-suave">{t.anioActual}:</span> <strong className="text-oro-suave">{r.anioActual.anio}, {pilar(r.anioActual)}</strong> · {(t.relaciones as Record<string, string>)[r.relacionAnioActual]}
        </span>
      </p>
    </div>
  );
}

type RelacionElemento = "mismo" | "nutre" | "nutres" | "controla" | "controlas";

/** Cómo actúa el elemento del año en curso sobre el elemento de la persona. */
export function relacionElementos(tuyo: ElementoChino, delAnio: ElementoChino): RelacionElemento {
  const d = (ELEMENTOS.indexOf(delAnio) - ELEMENTOS.indexOf(tuyo) + 5) % 5;
  return (["mismo", "nutres", "controlas", "controla", "nutre"] as const)[d];
}

/**
 * Los cinco elementos: el círculo es el ciclo que nutre (Madera → Fuego →
 * Tierra → Metal → Agua) y la estrella el que controla. Se iluminan el
 * elemento de la persona, el fijo de su animal y la flecha que la une con el
 * elemento del año en curso.
 */
export function CicloElementos({ r, t }: { r: ResultadoChino; t: T }) {
  const elementos = t.elementos as Record<ElementoChino, string>;
  const tuyo = r.pilar.elemento;
  const fijo = FICHA[r.pilar.animal].elementoFijo;
  const delAnio = r.anioActual.elemento;
  const relacion = relacionElementos(tuyo, delAnio);
  const C = 160, R = 96, NODO = 25;
  const ang = (e: ElementoChino) => ELEMENTOS.indexOf(e) * 72 - 90;
  const centro = (e: ElementoChino) => polar(C, C, R, ang(e));
  // Flecha resaltada: sale del elemento que actúa sobre el otro.
  const desde = relacion === "nutre" || relacion === "controla" ? delAnio : tuyo;

  const arcoNutre = (e: ElementoChino) => {
    const a = ang(e), sig = ELEMENTOS[(ELEMENTOS.indexOf(e) + 1) % 5];
    const p = polar(C, C, R, a + 19), q = polar(C, C, R, ang(sig) - 19 + (sig === "madera" ? 360 : 0));
    return `M ${p.x} ${p.y} A ${R} ${R} 0 0 1 ${q.x} ${q.y}`;
  };
  const cuerdaControla = (e: ElementoChino) => {
    const objetivo = ELEMENTOS[(ELEMENTOS.indexOf(e) + 2) % 5];
    const p = centro(e), q = centro(objetivo);
    const dx = q.x - p.x, dy = q.y - p.y, largo = Math.hypot(dx, dy);
    const k = (NODO + 5) / largo;
    return { x1: redondear(p.x + dx * k), y1: redondear(p.y + dy * k), x2: redondear(q.x - dx * k), y2: redondear(q.y - dy * k) };
  };
  const esResaltada = (e: ElementoChino, tipo: "nutre" | "controla") =>
    relacion !== "mismo" && e === desde && (tipo === "nutre" ? (relacion === "nutre" || relacion === "nutres") : (relacion === "controla" || relacion === "controlas"));

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,15rem)_1fr]">
      <svg viewBox="28 14 274 292" className="mx-auto w-full max-w-[15rem]" role="img" aria-label={t.ciclo.titulo}>
        <defs>
          <marker id="chino-punta" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(241,217,154,0.55)" />
          </marker>
          <marker id="chino-punta-viva" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
            <path d="M 0 1 L 9 5 L 0 9 z" fill={COLOR_ANIO} />
          </marker>
        </defs>

        {ELEMENTOS.map((e) => {
          const viva = esResaltada(e, "nutre");
          return <path key={`n-${e}`} d={arcoNutre(e)} fill="none" stroke={viva ? COLOR_ANIO : "rgba(241,217,154,0.4)"} strokeWidth={viva ? 3 : 1.4} markerEnd={`url(#${viva ? "chino-punta-viva" : "chino-punta"})`} className={viva ? "chino-flecha-viva" : ""} />;
        })}
        {ELEMENTOS.map((e) => {
          const viva = esResaltada(e, "controla");
          return <line key={`c-${e}`} {...cuerdaControla(e)} stroke={viva ? COLOR_ANIO : "rgba(183,165,255,0.35)"} strokeWidth={viva ? 2.6 : 1.1} strokeDasharray={viva ? undefined : "3 4"} markerEnd={`url(#${viva ? "chino-punta-viva" : "chino-punta"})`} className={viva ? "chino-flecha-viva" : ""} />;
        })}

        {ELEMENTOS.map((e) => {
          const { x, y } = centro(e);
          const color = COLOR_ELEMENTO[e];
          const esTuyo = e === tuyo;
          // Nombre debajo del nodo (encima en la Madera, que está arriba).
          const etiquetaY = e === "madera" ? y - NODO - 9 : y + NODO + 17;
          return (
            <g key={e}>
              {esTuyo && <circle cx={x} cy={y} r={NODO + 9} fill={color} opacity="0.22" className="chino-halo" style={{ transformOrigin: `${x}px ${y}px` }} />}
              <circle cx={x} cy={y} r={NODO} fill={esTuyo ? color : "#1a1233"} fillOpacity={esTuyo ? 0.9 : 1} stroke={color} strokeWidth={esTuyo ? 2.4 : 1.4} />
              {e === fijo && !esTuyo && <circle cx={x} cy={y} r={NODO + 5} fill="none" stroke={color} strokeWidth="1.2" strokeDasharray="2 3" />}
              <text x={x} y={y + 8} textAnchor="middle" fontSize="23" fontFamily="serif" fill={esTuyo ? "#120c22" : color}>{CARACTER_ELEMENTO[e]}</text>
              <text x={x} y={etiquetaY} textAnchor="middle" fontSize="13" fontWeight={esTuyo ? 700 : 400} fill={esTuyo ? color : "rgba(190,182,214,0.9)"}>{elementos[e]}</text>
              {e === delAnio && (
                <g>
                  <rect x={x + 12} y={y - NODO - 6} width="34" height="15" rx="7.5" fill="#120c22" stroke={COLOR_ANIO} strokeWidth="1" />
                  <text x={x + 29} y={y - NODO + 5} textAnchor="middle" fontSize="9.5" fontWeight="600" fill={COLOR_ANIO}>{r.anioActual.anio}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.ciclo.titulo}</p>
          <p className="mt-1 text-texto-suave">{t.ciclo.nota}</p>
        </div>
        <ul className="space-y-1.5">
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLOR_ELEMENTO[tuyo] }} />
            <span className="text-texto-suave">{t.ciclo.tuElemento}:</span> {CARACTER_ELEMENTO[tuyo]} {elementos[tuyo]}
          </li>
          <li className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-full border border-dashed" style={{ borderColor: COLOR_ELEMENTO[fijo] }} />
            <span className="text-texto-suave">{t.ciclo.fijo}:</span> {CARACTER_ELEMENTO[fijo]} {elementos[fijo]}
          </li>
        </ul>
        <p className="rounded-xl border px-3 py-2 text-texto" style={{ borderColor: `${COLOR_ANIO}55`, background: `${COLOR_ANIO}12` }}>
          {plantilla(t.ciclo.relaciones[relacion], { anio: r.anioActual.anio, suyo: elementos[delAnio], tuyo: elementos[tuyo] })}
        </p>
      </div>
    </div>
  );
}
