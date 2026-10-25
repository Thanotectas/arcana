import { signoPorId, imagenSigno } from "@/lib/zodiaco";
import { NOMBRES_CUERPO, SIMBOLOS_CUERPO } from "@/lib/astro/efemerides";
import { NOMBRES_ASPECTO, SIMBOLOS_ASPECTO } from "@/lib/astro/carta";
import type { Dimension, PuntoSinastria, ResultadoSinastria } from "@/lib/astro/sinastria";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";

const DIMENSIONES: Dimension[] = ["emocional", "pasion", "estabilidad", "comunicacion"];
const ORDEN: PuntoSinastria[] = ["sol", "luna", "mercurio", "venus", "marte", "jupiter", "saturno", "urano", "neptuno", "pluton", "ascendente"];
const COLOR_ELEMENTO: Record<string, string> = { fuego: "#ff8a5b", tierra: "#9ad07f", aire: "#8fc7ff", agua: "#b28dff" };
const ARMONICO = "#7fd6a4";
const TENSO = "#ffb35c";
const r2 = (v: number) => Math.round(v * 100) / 100;
/** Símbolo como texto (sin el selector, algunos teléfonos lo pintan como emoji). */
const texto = (s: string) => `${s}︎`;

/**
 * Sinastría: el anillo de afinidad entre las dos monedas, el radar de las
 * cuatro dimensiones, los hilos entre los planetas de cada uno (verde suma,
 * ámbar tensa), el balance de elementos frente a frente y en qué casa del
 * otro cae cada planeta personal.
 */
export function VistaSinastria({ resultado: r, t }: { resultado: ResultadoSinastria; t: Diccionario }) {
  const s = t.sinastria;
  const nombres = s.dimensiones as Record<Dimension, string>;
  const simbolo = (p: PuntoSinastria) => (p === "ascendente" ? "AC" : texto(SIMBOLOS_CUERPO[p]));
  const nombre = (p: PuntoSinastria) => (p === "ascendente" ? t.astral.ascendente : NOMBRES_CUERPO[p]);

  return (
    <section className="space-y-6">
      <Afinidad r={r} t={t} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-2 text-2xl">{s.dimensionesTitulo}</h2>
          <Radar valores={DIMENSIONES.map((d) => ({ nombre: nombres[d], valor: r.dimensiones[d] }))} />
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display mb-1 text-2xl">{s.hilosTitulo}</h2>
          <p className="mb-2 text-xs text-texto-suave">{s.hilosNota}</p>
          {r.aspectos.length ? <Hilos r={r} simbolo={simbolo} /> : <p className="text-sm text-texto-suave">{s.sinAspectos}</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{s.aspectosTitulo}</h2>
          {r.aspectos.length ? (
            <ul className="space-y-1.5 text-sm">
              {r.aspectos.slice(0, 8).map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 border-t border-borde pt-1.5 first:border-0">
                  <span>
                    {nombre(a.a)} <span className="text-texto-suave">{SIMBOLOS_ASPECTO[a.tipo]} {NOMBRES_ASPECTO[a.tipo].toLowerCase()}</span> {nombre(a.b)}
                  </span>
                  <span className="shrink-0" style={{ color: a.aporte >= 0 ? ARMONICO : TENSO }}>
                    {a.aporte >= 0 ? s.armonico : s.tenso} · {a.orbe}°
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-texto-suave">{s.sinAspectos}</p>
          )}
        </div>
        <div className="tarjeta space-y-5 p-5">
          <div>
            <h2 className="font-display mb-3 text-2xl">{s.elementosTitulo}</h2>
            <Elementos r={r} t={t} />
          </div>
          {r.solapamientos.length > 0 && (
            <div>
              <h3 className="font-display mb-2 text-xl">{s.casasTitulo}</h3>
              <ul className="flex flex-wrap gap-2 text-xs">
                {r.solapamientos.map((o, i) => (
                  <li key={i} className="rounded-full border border-borde bg-superficie-2/60 px-3 py-1">
                    <span className="text-oro-suave">{texto(SIMBOLOS_CUERPO[o.cuerpo])}</span>{" "}
                    {plantilla(s.casaDe, { planeta: NOMBRES_CUERPO[o.cuerpo], de: o.de === "a" ? r.a.nombre : r.b.nombre, en: o.de === "a" ? r.b.nombre : r.a.nombre, n: o.casa })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/** Las dos monedas y, entre ellas, el anillo dorado que se llena hasta la afinidad. */
function Afinidad({ r, t }: { r: ResultadoSinastria; t: Diccionario }) {
  const persona = (p: ResultadoSinastria["a"]) => {
    const sol = signoPorId(p.sol);
    const luna = signoPorId(p.luna);
    const asc = p.ascendente ? signoPorId(p.ascendente) : undefined;
    return (
      <div className="flex flex-col items-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña */}
        {sol && <img src={imagenSigno(sol.id)} alt="" width={104} height={104} className="moneda-signo" />}
        <p className="font-display mt-2 text-xl">{p.nombre}</p>
        <p className="mt-1 flex flex-wrap justify-center gap-x-2 text-xs text-texto-suave">
          {sol && <span>{texto("☉")} {texto(sol.simbolo)} {sol.nombre}</span>}
          {luna && <span>{texto("☽")} {texto(luna.simbolo)} {luna.nombre}</span>}
          {asc && <span>AC {texto(asc.simbolo)} {asc.nombre}</span>}
        </p>
      </div>
    );
  };
  return (
    <div className="tarjeta relative grid items-center gap-6 overflow-hidden p-6 sm:grid-cols-[1fr_auto_1fr]">
      {persona(r.a)}
      <div className="relative mx-auto h-48 w-48">
        <svg viewBox="0 0 200 200" className="absolute inset-0" aria-hidden>
          <defs>
            <linearGradient id="sin-anillo" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#b7a5ff" />
              <stop offset="1" stopColor="#f1d99a" />
            </linearGradient>
            <radialGradient id="sin-centro">
              <stop offset="0" stopColor="#2a1a5e" />
              <stop offset="1" stopColor="#0b0716" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#sin-centro)" />
          <circle cx="100" cy="100" r="84" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          <circle
            cx="100"
            cy="100"
            r="84"
            fill="none"
            stroke="url(#sin-anillo)"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={`${r.puntaje} 100`}
            transform="rotate(-90 100 100)"
            className="sinastria-anillo"
          />
          {/* Los dos destellos que se acercan: uno por persona */}
          <circle cx="100" cy="16" r="4" fill="#f1d99a" className="sinastria-chispa" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="font-display text-5xl text-oro-suave">{r.puntaje}%</p>
          <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-texto-suave">{t.compatibilidad.afinidad}</p>
        </div>
      </div>
      {persona(r.b)}
    </div>
  );
}

/** Radar de cuatro puntas (0–100) con la figura de la pareja en dorado. */
function Radar({ valores }: { valores: { nombre: string; valor: number }[] }) {
  const C = 150;
  const R = 92;
  const punto = (i: number, v: number) => {
    const a = (i / valores.length) * Math.PI * 2 - Math.PI / 2;
    return [r2(C + (R * v) / 100 * Math.cos(a)), r2(C + (R * v) / 100 * Math.sin(a))] as const;
  };
  const figura = (v: (i: number) => number) => valores.map((_, i) => punto(i, v(i)).join(",")).join(" ");
  return (
    <svg viewBox="-85 0 470 300" className="mx-auto w-full max-w-[420px]" role="img" aria-label={valores.map((v) => `${v.nombre}: ${v.valor}`).join(", ")}>
      <defs>
        <radialGradient id="sin-radar" cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#f1d99a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#8b6cf6" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      {[25, 50, 75, 100].map((n) => (
        <polygon key={n} points={figura(() => n)} fill="none" stroke="rgba(255,255,255,0.1)" />
      ))}
      {valores.map((_, i) => {
        const [x, y] = punto(i, 100);
        return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" />;
      })}
      <polygon points={figura((i) => valores[i].valor)} fill="url(#sin-radar)" stroke="#f1d99a" strokeWidth="1.6" strokeLinejoin="round" className="sinastria-radar" />
      {valores.map((v, i) => {
        const [x, y] = punto(i, v.valor);
        const [lx, ly] = punto(i, 128);
        const ancla = Math.abs(lx - C) < 5 ? "middle" : lx > C ? "start" : "end";
        return (
          <g key={v.nombre}>
            <circle cx={x} cy={y} r="3.5" fill="#f1d99a" />
            <text x={ancla === "start" ? lx - 18 : ancla === "end" ? lx + 18 : lx} y={ly - 7} textAnchor={ancla} fontSize="11" fill="#a89fc0">
              {v.nombre}
            </text>
            <text x={ancla === "start" ? lx - 18 : ancla === "end" ? lx + 18 : lx} y={ly + 9} textAnchor={ancla} fontSize="15" fontWeight={600} fill="#f1d99a">
              {v.valor}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Columnas de planetas de cada uno unidas por curvas: verde suma, ámbar tensa; el grosor es el peso. */
function Hilos({ r, simbolo }: { r: ResultadoSinastria; simbolo: (p: PuntoSinastria) => string }) {
  const aspectos = r.aspectos.slice(0, 14);
  const columna = (lado: "a" | "b") => ORDEN.filter((p) => aspectos.some((x) => x[lado] === p));
  const izq = columna("a");
  const der = columna("b");
  const filas = Math.max(izq.length, der.length);
  const alto = 46 + filas * 34;
  const y = (lista: PuntoSinastria[], p: PuntoSinastria) => r2(40 + (lista.indexOf(p) + 0.5) * ((alto - 46) / lista.length));
  const XA = 58;
  const XB = 262;
  return (
    <svg viewBox={`0 0 320 ${alto}`} className="mx-auto w-full max-w-[360px]" aria-hidden>
      <text x={XA} y={20} textAnchor="middle" fontSize="13" fill="#f1d99a" fontWeight={600}>{r.a.nombre.slice(0, 14)}</text>
      <text x={XB} y={20} textAnchor="middle" fontSize="13" fill="#f1d99a" fontWeight={600}>{r.b.nombre.slice(0, 14)}</text>
      {aspectos.map((a, i) => {
        const ya = y(izq, a.a);
        const yb = y(der, a.b);
        const color = a.aporte >= 0 ? ARMONICO : TENSO;
        const peso = Math.min(4.5, 0.8 + Math.abs(a.aporte) * 1.1);
        return (
          <path
            key={i}
            d={`M ${XA + 16} ${ya} C 160 ${ya}, 160 ${yb}, ${XB - 16} ${yb}`}
            fill="none"
            stroke={color}
            strokeWidth={peso}
            strokeOpacity={0.35 + Math.min(0.55, Math.abs(a.aporte) * 0.2)}
            strokeLinecap="round"
            pathLength={1}
            className="trazo-aspecto"
            style={{ animationDelay: `${200 + i * 70}ms` }}
          />
        );
      })}
      {(
        [
          [izq, XA],
          [der, XB],
        ] as const
      ).map(([lista, x]) =>
        lista.map((p) => (
          <g key={`${x}-${p}`}>
            <circle cx={x} cy={y(lista, p)} r={14} fill="#150f26" stroke="#d9b45a" strokeWidth={1} />
            <text x={x} y={y(lista, p)} textAnchor="middle" dominantBaseline="central" fontSize={p === "ascendente" ? 10 : 15} fontWeight={p === "ascendente" ? 700 : 400} fill="#f1d99a">
              {simbolo(p)}
            </text>
          </g>
        )),
      )}
    </svg>
  );
}

/** Elementos frente a frente: la barra de uno crece hacia la izquierda y la del otro hacia la derecha. */
function Elementos({ r, t }: { r: ResultadoSinastria; t: Diccionario }) {
  const claves = ["fuego", "tierra", "aire", "agua"] as const;
  const maximo = Math.max(1, ...claves.flatMap((k) => [r.a.elementos[k], r.b.elementos[k]]));
  const nombres = t.horoscopo.elementos as Record<string, string>;
  return (
    <div className="space-y-2 text-sm">
      <div className="grid grid-cols-[1fr_5.5rem_1fr] text-xs text-texto-suave">
        <span className="truncate text-right">{r.a.nombre}</span>
        <span />
        <span className="truncate">{r.b.nombre}</span>
      </div>
      {claves.map((k) => (
        <div key={k} className="grid grid-cols-[1fr_5.5rem_1fr] items-center gap-2">
          <span className="flex items-center justify-end gap-2">
            <span className="text-xs text-texto-suave">{r.a.elementos[k]}</span>
            <span className="h-2.5 rounded-full" style={{ width: `${(r.a.elementos[k] / maximo) * 100}%`, background: COLOR_ELEMENTO[k], minWidth: r.a.elementos[k] ? 6 : 0 }} />
          </span>
          <span className="text-center capitalize">{nombres[k] ?? k}</span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 rounded-full" style={{ width: `${(r.b.elementos[k] / maximo) * 100}%`, background: COLOR_ELEMENTO[k], minWidth: r.b.elementos[k] ? 6 : 0 }} />
            <span className="text-xs text-texto-suave">{r.b.elementos[k]}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
