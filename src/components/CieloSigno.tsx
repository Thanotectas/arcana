import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import { SIGNOS, imagenSigno, signoPorId } from "@/lib/zodiaco";
import { SIMBOLOS_CUERPO } from "@/lib/astro/efemerides";
import type { CieloDelSigno, PlanetaDelDia, Trato } from "@/lib/horoscopo/cielo";

type T = Diccionario["horoscopo"];

const COLOR_TRATO: Record<Trato, string> = { mismo: "#f1d99a", apoyo: "#7fd6a4", tension: "#ffb35c", neutro: "rgba(183,165,255,0.55)" };
const COLOR_ELEMENTO = { fuego: "#ff8a5b", tierra: "#d9b45a", aire: "#bfe3ff", agua: "#8fc7ff" } as const;

const redondear = (v: number) => Math.round(v * 10) / 10;
/** Glifos como texto: sin el selector, los celulares los pintan como emoji. */
const comoTexto = (s: string) => `${s}︎`;

/** Disco de la Luna con la fase del día (la parte oscura es una elipse que la tapa). */
export function DiscoLuna({ fraccion, className = "" }: { fraccion: number; className?: string }) {
  const creciente = fraccion < 0.5;
  const ancho = Math.abs(Math.cos(fraccion * 2 * Math.PI)) * 20;
  const llenaMasDeMedia = fraccion > 0.25 && fraccion < 0.75;
  // Media luna oscura del lado que falta, más la elipse del terminador.
  const lado = creciente ? -1 : 1;
  const mitad = `M 24 4 A 20 20 0 0 ${lado < 0 ? 0 : 1} 24 44 Z`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <circle cx="24" cy="24" r="20" fill="#f1d99a" />
      <path d={mitad} fill="#140d29" />
      <ellipse cx="24" cy="24" rx={redondear(ancho)} ry="20" fill={llenaMasDeMedia ? "#f1d99a" : "#140d29"} />
      <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(241,217,154,0.6)" />
    </svg>
  );
}

/**
 * Rueda del cielo de hoy para un signo: el signo es la casa 1 (a la
 * izquierda, como el ascendente) y cada planeta del día cae en su casa solar,
 * con una línea hacia el centro verde si apoya y ámbar si exige.
 */
export function RuedaCieloSigno({ cielo, t }: { cielo: CieloDelSigno; t: T }) {
  const indice = SIGNOS.findIndex((s) => s.id === cielo.signo);
  const inicio = indice * 30;
  const C = 200;
  // Ángulo en grados matemáticos (y hacia arriba): la casa 1 empieza a la izquierda y avanza en sentido antihorario.
  const angulo = (lon: number) => 180 + (lon - inicio);
  const punto = (r: number, grados: number) => {
    const a = (grados * Math.PI) / 180;
    return { x: redondear(C + r * Math.cos(a)), y: redondear(C - r * Math.sin(a)) };
  };
  const sector = (r1: number, r2: number, desde: number, hasta: number) => {
    const a = punto(r2, desde), b = punto(r2, hasta), c = punto(r1, hasta), d = punto(r1, desde);
    return `M ${a.x} ${a.y} A ${r2} ${r2} 0 0 0 ${b.x} ${b.y} L ${c.x} ${c.y} A ${r1} ${r1} 0 0 1 ${d.x} ${d.y} Z`;
  };
  const casasConPlaneta = new Set(cielo.planetas.map((p) => p.casa));

  // Planetas por ángulo; si dos quedan a menos de 12°, el segundo entra hacia el centro.
  const ordenados = [...cielo.planetas].sort((a, b) => angulo(a.longitud) - angulo(b.longitud));
  const radios = new Map<PlanetaDelDia["cuerpo"], number>();
  let previo: { ang: number; r: number } | null = null;
  for (const p of ordenados) {
    const ang = angulo(p.longitud);
    const r: number = previo && ang - previo.ang < 12 ? (previo.r === 104 ? 80 : 104) : 104;
    radios.set(p.cuerpo, r);
    previo = { ang, r };
  }

  return (
    <svg viewBox="-6 -6 412 412" className="mx-auto w-full max-w-[420px]" role="img" aria-label={plantilla(t.cieloTitulo, { signo: SIGNOS[indice].nombre })}>
      <defs>
        <radialGradient id="cielo-fondo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#2a1a5e" stopOpacity="0.6" />
          <stop offset="1" stopColor="#120c22" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={C} cy={C} r="198" fill="url(#cielo-fondo)" stroke="rgba(217,180,90,0.5)" />

      {/* Anillo de los signos y anillo de las casas */}
      {Array.from({ length: 12 }, (_, i) => {
        const s = SIGNOS[(indice + i) % 12];
        const desde = 180 + i * 30, hasta = desde + 30;
        const medio = desde + 15;
        const glifo = punto(183, medio);
        const etiqueta = punto(145, medio);
        const activa = casasConPlaneta.has(i + 1);
        return (
          <g key={s.id}>
            <path d={sector(166, 198, desde, hasta)} fill={COLOR_ELEMENTO[s.elemento]} fillOpacity={i === 0 ? 0.28 : 0.07} stroke="rgba(217,180,90,0.25)" strokeWidth="0.8" />
            <path d={sector(124, 166, desde, hasta)} fill="#f1d99a" fillOpacity={activa ? 0.08 : 0.015} stroke="rgba(217,180,90,0.18)" strokeWidth="0.8" />
            <text x={glifo.x} y={glifo.y + 6} textAnchor="middle" fontSize="17" fill={i === 0 ? "#f1d99a" : COLOR_ELEMENTO[s.elemento]} opacity={i === 0 ? 1 : 0.8}>{comoTexto(s.simbolo)}</text>
            <text x={etiqueta.x} y={etiqueta.y + 3.5} textAnchor="middle" fontSize="10" fontWeight={activa ? 600 : 400} fill={activa ? "#f1d99a" : "rgba(190,182,214,0.75)"}>{t.temasCortos[i]}</text>
          </g>
        );
      })}
      <circle cx={C} cy={C} r="124" fill="#120c22" fillOpacity="0.6" stroke="rgba(217,180,90,0.35)" />

      {/* Líneas de cada planeta hacia el signo, en el centro */}
      {cielo.planetas.map((p, i) => {
        const r = radios.get(p.cuerpo) ?? 104;
        const a = punto(r - 13, angulo(p.longitud));
        const b = punto(48, angulo(p.longitud));
        return <line key={`l-${p.cuerpo}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLOR_TRATO[p.trato]} strokeWidth={p.trato === "neutro" ? 1 : 1.6} strokeOpacity={p.trato === "neutro" ? 0.5 : 0.85} {...(p.trato === "tension" ? { strokeDasharray: "4 3", className: "cielo-aparecer" } : { pathLength: 1, className: "cielo-trazo" })} style={{ animationDelay: `${0.2 + i * 0.12}s` }} />;
      })}

      {/* Moneda del signo en el centro */}
      <circle cx={C} cy={C} r="47" fill="#f1d99a" opacity="0.1" className="cielo-halo" style={{ transformOrigin: `${C}px ${C}px` }} />
      <image href={imagenSigno(cielo.signo)} x={C - 42} y={C - 42} width="84" height="84" className="moneda-signo" />

      {/* Planetas */}
      {cielo.planetas.map((p, i) => {
        const r = radios.get(p.cuerpo) ?? 104;
        const { x, y } = punto(r, angulo(p.longitud));
        const luna = p.cuerpo === "luna";
        return (
          <g key={p.cuerpo} className="cielo-planeta" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
            <circle cx={x} cy={y} r={luna ? 14 : 12} fill="#1a1233" stroke={COLOR_TRATO[p.trato]} strokeWidth={luna ? 2 : 1.3} />
            {luna && <circle cx={x} cy={y} r="19" fill="none" stroke="#f1d99a" strokeOpacity="0.5" className="cielo-halo" style={{ transformOrigin: `${x}px ${y}px` }} />}
            <text x={x} y={y + 5.5} textAnchor="middle" fontSize={luna ? 16 : 14} fill="#f1d99a">{comoTexto(SIMBOLOS_CUERPO[p.cuerpo])}</text>
            {p.retrogrado && <text x={x + 11} y={y + 13} fontSize="8" fill="#ffb35c">℞</text>}
          </g>
        );
      })}
    </svg>
  );
}

/** Lista de lo que dibuja la rueda: cada planeta con su signo, su casa y si apoya o exige. */
export function ListaCieloSigno({ cielo, t }: { cielo: CieloDelSigno; t: T }) {
  const cuerpos = t.cuerpos as Record<PlanetaDelDia["cuerpo"], string>;
  return (
    <ul className="space-y-2 text-sm">
      {cielo.planetas.map((p) => {
        const s = signoPorId(p.signo)!;
        return (
          <li key={p.cuerpo} className={`flex items-start gap-3 rounded-xl px-3 py-2 ${p.cuerpo === "luna" ? "border border-oro/30 bg-oro/5" : ""}`}>
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-base text-oro-suave" style={{ borderColor: COLOR_TRATO[p.trato] }}>
              {comoTexto(SIMBOLOS_CUERPO[p.cuerpo])}
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-texto">
                {cuerpos[p.cuerpo]} · {comoTexto(s.simbolo)} {s.nombre}
                {p.retrogrado && <span className="text-xs text-[#ffb35c]"> · {t.retro}</span>}
              </span>
              <span className="block text-texto-suave">
                {plantilla(t.casa, { n: p.casa })}: {t.temas[p.casa - 1]}
              </span>
            </span>
            {t.tratos[p.trato] && (
              <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs" style={{ color: COLOR_TRATO[p.trato], background: `${COLOR_TRATO[p.trato]}1f` }}>
                {t.tratos[p.trato]}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Bloque completo para la página del signo: título, Luna del día, rueda y lista. */
export function CieloSigno({ cielo, t, fasesLuna }: { cielo: CieloDelSigno; t: T; fasesLuna: readonly string[] }) {
  const signo = signoPorId(cielo.signo)!;
  const luna = cielo.planetas.find((p) => p.cuerpo === "luna")!;
  const signoLuna = signoPorId(luna.signo)!;
  return (
    <section className="tarjeta space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-4">
        <DiscoLuna fraccion={cielo.fase.fraccion} className="h-12 w-12 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{plantilla(t.cieloTitulo, { signo: signo.nombre })}</p>
          <p className="font-display text-2xl text-oro-suave">
            {plantilla(t.lunaEn, { signo: `${comoTexto(signoLuna.simbolo)} ${signoLuna.nombre}` })} · {fasesLuna[cielo.fase.indice]}
          </p>
          <p className="text-sm text-texto-suave">
            {plantilla(t.casa, { n: luna.casa })}: {t.temas[luna.casa - 1]}
          </p>
        </div>
      </div>
      <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <RuedaCieloSigno cielo={cielo} t={t} />
        <div className="space-y-3">
          <p className="text-sm text-texto-suave">{t.cieloNota}</p>
          <ListaCieloSigno cielo={cielo} t={t} />
        </div>
      </div>
    </section>
  );
}
