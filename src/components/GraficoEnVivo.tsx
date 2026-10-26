import type { GraficoVivo, PlanetaVivo } from "@/lib/en-vivo-graficos";
import { SIMBOLOS_CUERPO, type Cuerpo } from "@/lib/astro/textos";
import { SIGNOS } from "@/lib/zodiaco";

const COLOR_ELEMENTO = { fuego: "#ff8a5b", tierra: "#d9b45a", aire: "#bfe3ff", agua: "#8fc7ff" } as const;
const ARMONICO = "#7fd6a4";
const TENSO = "#ffb35c";
const ORO = "#f1d99a";
const VIOLETA = "#b7a5ff";
const COLOR_TRATO = { mismo: ORO, apoyo: ARMONICO, tension: TENSO, neutro: "rgba(183,165,255,0.6)" } as const;
const COLOR_ASPECTO = { conjuncion: ORO, trigono: ARMONICO, sextil: ARMONICO, cuadratura: TENSO, oposicion: TENSO } as const;

/** Cuándo empieza cada parte del dibujo (s): los signos, luego un planeta tras otro, luego las líneas. */
const T_SIGNOS = 0.9;
const T_PLANETAS = 2.6;
const PASO_PLANETA = 0.45;

const r1 = (v: number) => Math.round(v * 10) / 10;
const glifo = (s: string) => `${s}︎`;
/** Punto en la rueda: «grados» en sentido matemático (antihorario, con y hacia arriba). */
const punto = (r: number, grados: number) => {
  const a = (grados * Math.PI) / 180;
  return { x: r1(r * Math.cos(a)), y: r1(-r * Math.sin(a)) };
};
const sector = (ra: number, rb: number, desde: number, hasta: number) => {
  const a = punto(rb, desde), b = punto(rb, hasta), c = punto(ra, hasta), d = punto(ra, desde);
  return `M ${a.x} ${a.y} A ${rb} ${rb} 0 0 0 ${b.x} ${b.y} L ${c.x} ${c.y} A ${ra} ${ra} 0 0 1 ${d.x} ${d.y} Z`;
};

/** Anillo de los doce signos; el que empieza en «base» queda a la izquierda (como el ascendente). */
function AnilloSignos({ base, resaltado }: { base: number; resaltado?: string }) {
  const angulo = (lon: number) => 180 + (lon - base);
  return (
    <g>
      <circle r="228" fill="rgba(18,12,34,0.7)" stroke="rgba(217,180,90,0.55)" strokeWidth="1.5" />
      {SIGNOS.map((s, i) => {
        const desde = angulo(i * 30);
        const g = punto(208, desde + 15);
        const activo = s.id === resaltado;
        return (
          <g key={s.id} className="vivo-trazo-aparecer" style={{ animationDelay: `${(T_SIGNOS + i * 0.08).toFixed(2)}s` }}>
            <path d={sector(188, 228, desde, desde + 30)} fill={COLOR_ELEMENTO[s.elemento]} fillOpacity={activo ? 0.35 : 0.1} stroke="rgba(217,180,90,0.3)" strokeWidth="1" />
            <text x={g.x} y={g.y + 8} textAnchor="middle" fontSize="23" fill={activo ? ORO : COLOR_ELEMENTO[s.elemento]}>{glifo(s.simbolo)}</text>
          </g>
        );
      })}
      <circle r="188" fill="none" stroke="rgba(217,180,90,0.45)" strokeWidth="1.2" />
    </g>
  );
}

/** Radio de cada planeta: si queda a menos de 9° de otro ya puesto en el mismo anillo, entra hacia el centro. */
function radios(planetas: PlanetaVivo[], base: number, radio: number, paso: number) {
  const ordenados = [...planetas].sort((a, b) => ((a.lon - base + 360) % 360) - ((b.lon - base + 360) % 360));
  const res = new Map<Cuerpo, number>();
  const puestos: { lon: number; r: number }[] = [];
  const cerca = (a: number, b: number) => Math.min((a - b + 360) % 360, (b - a + 360) % 360) < 9;
  for (const p of ordenados) {
    const ocupado = (r: number) => puestos.some((q) => q.r === r && cerca(q.lon, p.lon));
    const r = !ocupado(radio) ? radio : !ocupado(radio - paso) ? radio - paso : radio - 2 * paso;
    res.set(p.c, r);
    puestos.push({ lon: p.lon, r });
  }
  return res;
}

function Planeta({ p, x, y, color, orden, grande = false }: { p: PlanetaVivo; x: number; y: number; color: string; orden: number; grande?: boolean }) {
  const r = grande ? 19 : 16;
  return (
    <g className="vivo-planeta" style={{ animationDelay: `${(T_PLANETAS + orden * PASO_PLANETA).toFixed(2)}s`, transformOrigin: `${x}px ${y}px` }}>
      <circle cx={x} cy={y} r={r + 7} fill={color} opacity="0.18" />
      <circle cx={x} cy={y} r={r} fill="#1a1233" stroke={color} strokeWidth="2" />
      <text x={x} y={y + (grande ? 7.5 : 6.5)} textAnchor="middle" fontSize={grande ? 22 : 19} fill={ORO}>{glifo(SIMBOLOS_CUERPO[p.c])}</text>
      {p.r && <text x={x + r - 2} y={y + r + 4} fontSize="11" fill={TENSO}>℞</text>}
    </g>
  );
}

/** Rueda de la carta astral: signos, ejes si hay ascendente, planetas uno por uno y los aspectos más exactos. */
function RuedaCarta({ g }: { g: Extract<GraficoVivo, { tipo: "carta" }> }) {
  const base = g.asc ?? 0;
  const angulo = (lon: number) => 180 + (lon - base);
  const rs = radios(g.planetas, base, 152, 36);
  const fin = T_PLANETAS + g.planetas.length * PASO_PLANETA;
  const pos = (c: Cuerpo, r?: number) => {
    const p = g.planetas.find((x) => x.c === c)!;
    return punto(r ?? rs.get(c)!, angulo(p.lon));
  };
  return (
    <svg viewBox="-240 -240 480 480" className="h-full w-full">
      <AnilloSignos base={base} />
      {g.asc != null && g.mc != null && (
        <g className="vivo-trazo-aparecer" style={{ animationDelay: `${T_PLANETAS - 0.6}s` }}>
          {[g.asc, g.mc].map((lon, i) => {
            const a = punto(188, angulo(lon)), b = punto(188, angulo(lon) + 180), e = punto(170, angulo(lon) + (i === 0 ? 4 : -4));
            return (
              <g key={i}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(241,217,154,0.45)" strokeWidth="1.5" strokeDasharray="5 5" />
                <text x={e.x} y={e.y + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill={ORO}>{i === 0 ? "AC" : "MC"}</text>
              </g>
            );
          })}
        </g>
      )}
      {g.aspectos.map((a, i) => {
        const p = pos(a.a, 118), q = pos(a.b, 118);
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={COLOR_ASPECTO[a.t]} strokeWidth="2" strokeOpacity="0.85" pathLength={1} className="vivo-linea" style={{ animationDelay: `${(fin + 0.3 + i * 0.4).toFixed(2)}s` }} />;
      })}
      <circle r="118" fill="none" stroke="rgba(217,180,90,0.2)" />
      {g.planetas.map((p, i) => {
        const { x, y } = pos(p.c);
        return <Planeta key={p.c} p={p} x={x} y={y} color={p.c === "sol" || p.c === "luna" ? ORO : VIOLETA} orden={i} grande={p.c === "sol" || p.c === "luna"} />;
      })}
    </svg>
  );
}

/** Cielo de hoy para un signo: su signo en la casa 1 y cada planeta con su línea hacia el centro (verde apoya, ámbar exige). */
function RuedaCielo({ g }: { g: Extract<GraficoVivo, { tipo: "cielo" }> }) {
  const indice = SIGNOS.findIndex((s) => s.id === g.signo);
  const base = indice * 30;
  const angulo = (lon: number) => 180 + (lon - base);
  const rs = radios(g.planetas, base, 150, 36);
  const signo = SIGNOS[indice];
  return (
    <svg viewBox="-240 -240 480 480" className="h-full w-full">
      <AnilloSignos base={base} resaltado={g.signo} />
      {g.planetas.map((p, i) => {
        const a = punto((rs.get(p.c) ?? 150) - 22, angulo(p.lon)), b = punto(62, angulo(p.lon));
        return (
          <line key={`l-${p.c}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={COLOR_TRATO[p.trato]} strokeWidth="2" strokeOpacity="0.85" pathLength={1} className="vivo-linea" style={{ animationDelay: `${(T_PLANETAS + i * PASO_PLANETA + 0.3).toFixed(2)}s` }} />
        );
      })}
      <circle r="60" fill="#1a1233" stroke={ORO} strokeWidth="2" className="vivo-trazo-aparecer" style={{ animationDelay: `${T_SIGNOS + 1}s` }} />
      <text y="22" textAnchor="middle" fontSize="64" fill={ORO} className="vivo-trazo-aparecer" style={{ animationDelay: `${T_SIGNOS + 1}s` }}>{glifo(signo.simbolo)}</text>
      {g.planetas.map((p, i) => {
        const { x, y } = punto(rs.get(p.c) ?? 150, angulo(p.lon));
        return <Planeta key={p.c} p={p} x={x} y={y} color={COLOR_TRATO[p.trato]} orden={i} grande={p.c === "luna"} />;
      })}
    </svg>
  );
}

/** Sinastría: las dos cartas en una rueda (afuera la de quien pregunta, adentro la otra) y los hilos entre ellas. */
function RuedaDoble({ g }: { g: Extract<GraficoVivo, { tipo: "sinastria" }> }) {
  const angulo = (lon: number) => 180 + lon;
  const ra = radios(g.a.planetas, 0, 164, 24);
  const rb = radios(g.b.planetas, 0, 108, 24);
  const finA = T_PLANETAS + g.a.planetas.length * PASO_PLANETA * 0.6;
  const finB = finA + g.b.planetas.length * PASO_PLANETA * 0.6;
  const posA = (c: Cuerpo) => punto(ra.get(c) ?? 164, angulo(g.a.planetas.find((x) => x.c === c)!.lon));
  const posB = (c: Cuerpo) => punto(rb.get(c) ?? 108, angulo(g.b.planetas.find((x) => x.c === c)!.lon));
  return (
    <svg viewBox="-240 -240 480 480" className="h-full w-full">
      <AnilloSignos base={0} />
      <circle r="132" fill="none" stroke="rgba(183,165,255,0.35)" strokeDasharray="3 5" />
      {g.hilos.map((h, i) => {
        const p = posA(h.a), q = posB(h.b);
        return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={h.armonico ? ARMONICO : TENSO} strokeWidth="2.2" strokeOpacity="0.9" pathLength={1} className="vivo-linea" style={{ animationDelay: `${(finB + 0.3 + i * 0.45).toFixed(2)}s` }} />;
      })}
      {g.a.planetas.map((p, i) => {
        const { x, y } = posA(p.c);
        return <Planeta key={`a-${p.c}`} p={p} x={x} y={y} color={ORO} orden={i * 0.6} />;
      })}
      {g.b.planetas.map((p, i) => {
        const { x, y } = posB(p.c);
        return <Planeta key={`b-${p.c}`} p={p} x={x} y={y} color={VIOLETA} orden={g.a.planetas.length * 0.6 + i * 0.6} />;
      })}
      {/* Afinidad: el anillo se llena hasta el porcentaje al final */}
      <g className="vivo-trazo-aparecer" style={{ animationDelay: `${finB + g.hilos.length * 0.45 + 0.4}s` }}>
        <circle r="50" fill="#1a1233" stroke="rgba(241,217,154,0.2)" strokeWidth="8" />
        <circle r="50" fill="none" stroke={ORO} strokeWidth="8" strokeLinecap="round" pathLength={100} strokeDasharray={`${g.afinidad} 100`} transform="rotate(-90)" className="vivo-anillo" style={{ animationDelay: `${finB + g.hilos.length * 0.45 + 0.4}s` }} />
        <text y="12" textAnchor="middle" fontSize="34" fontWeight="700" fill={ORO}>{g.afinidad}%</text>
      </g>
    </svg>
  );
}

/** El gráfico de la lectura con su leyenda: se dibuja de a poco mientras Sibila habla. */
export function GraficoEnVivo({ grafico, tamano = 400 }: { grafico: GraficoVivo; tamano?: number }) {
  const nombre = (lon: number) => SIGNOS[Math.floor(lon / 30) % 12];
  const chips: { texto: string; color: string }[] = [];
  if (grafico.tipo === "carta") {
    const sol = grafico.planetas.find((p) => p.c === "sol")!, luna = grafico.planetas.find((p) => p.c === "luna")!;
    chips.push({ texto: `☉︎ Sol en ${nombre(sol.lon).nombre}`, color: ORO }, { texto: `☽︎ Luna en ${nombre(luna.lon).nombre}`, color: ORO });
    chips.push(grafico.asc != null ? { texto: `AC ${nombre(grafico.asc).nombre}`, color: ORO } : { texto: "Sin hora: sin ascendente", color: VIOLETA });
  } else if (grafico.tipo === "cielo") {
    const luna = grafico.planetas.find((p) => p.c === "luna");
    if (luna) chips.push({ texto: `☽︎ Luna hoy en ${nombre(luna.lon).nombre}`, color: ORO });
    chips.push({ texto: "Verde: te apoya", color: ARMONICO }, { texto: "Ámbar: te exige", color: TENSO });
  } else {
    chips.push({ texto: `Afuera: ${grafico.a.fecha}`, color: ORO }, { texto: `Adentro: ${grafico.b.fecha}`, color: VIOLETA });
  }
  return (
    <div className="flex flex-col items-center">
      <div style={{ width: tamano, height: tamano }}>
        {grafico.tipo === "carta" ? <RuedaCarta g={grafico} /> : grafico.tipo === "cielo" ? <RuedaCielo g={grafico} /> : <RuedaDoble g={grafico} />}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <span key={c.texto} className="rounded-full border px-4 py-1 text-xl" style={{ borderColor: `${c.color}88`, color: c.color, background: "rgba(0,0,0,0.45)" }}>
            {c.texto}
          </span>
        ))}
      </div>
    </div>
  );
}
