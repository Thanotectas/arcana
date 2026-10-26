import { SIGNOS, signoPorId, imagenSigno, compatibilidadSignos, type Elemento } from "@/lib/zodiaco";
import { SIMBOLOS_CUERPO, type Cuerpo } from "@/lib/astro/efemerides";
import { SIMBOLOS_ASPECTO, calcularCarta, type DatosNacimiento, type TipoAspecto } from "@/lib/astro/carta";
import type { AspectoSinastria, Dimension, PuntoSinastria, ResultadoSinastria } from "@/lib/astro/sinastria";
import { nombres as nombresAstro, separar } from "./CartaDetalle";
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
export function VistaSinastria({ resultado: r, entrada, t }: { resultado: ResultadoSinastria; entrada?: { a?: DatosNacimiento; b?: DatosNacimiento }; t: Diccionario }) {
  const s = t.sinastria;
  const nombres = s.dimensiones as Record<Dimension, string>;
  const n = nombresAstro(t);
  const simbolo = (p: PuntoSinastria) => (p === "ascendente" ? "AC" : texto(SIMBOLOS_CUERPO[p]));
  const nombre = (p: PuntoSinastria) => (p === "ascendente" ? t.astral.ascendente : n.cuerpo(p));
  const casas = t.astral.rueda.casas;
  // Con los datos de nacimiento se recalculan las dos cartas para la rueda doble (las lecturas guardan solo los signos).
  const cartas = entrada?.a && entrada?.b ? [calcularCarta(entrada.a), calcularCarta(entrada.b)] : null;

  return (
    <section className="space-y-6">
      <Afinidad r={r} t={t} />

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-2 text-2xl">{s.dimensionesTitulo}</h2>
          <Radar valores={DIMENSIONES.map((d) => ({ nombre: nombres[d], valor: r.dimensiones[d] }))} />
        </div>
        <div className="tarjeta space-y-3 p-5">
          <div>
            <h2 className="font-display text-2xl">{s.quimicaTitulo}</h2>
            <p className="text-xs text-texto-suave">{s.quimicaNota}</p>
          </div>
          <Quimica r={r} t={t} />
        </div>
      </div>

      {cartas && (
        <div className="tarjeta space-y-3 p-5 sm:p-6">
          <div>
            <h2 className="font-display text-2xl">{s.ruedaTitulo}</h2>
            <p className="text-xs text-texto-suave">{plantilla(s.ruedaNota, { a: r.a.nombre, b: r.b.nombre })}</p>
          </div>
          <RuedaDoble
            a={cartas[0].planetas.filter((p) => p.cuerpo !== "nodo_norte").map((p) => ({ cuerpo: p.cuerpo, longitud: p.longitud }))}
            b={cartas[1].planetas.filter((p) => p.cuerpo !== "nodo_norte").map((p) => ({ cuerpo: p.cuerpo, longitud: p.longitud }))}
            aspectos={r.aspectos}
            nombreA={r.a.nombre}
            nombreB={r.b.nombre}
            t={t}
          />
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <UneTrabajar titulo={s.uneTitulo} vacio={s.sinUne} aspectos={r.aspectos.filter((a) => a.aporte >= 0).slice(0, 4)} color={ARMONICO} r={r} nombre={nombre} t={t} />
        <UneTrabajar titulo={s.trabajarTitulo} vacio={s.sinTrabajar} aspectos={r.aspectos.filter((a) => a.aporte < 0).slice(0, 4)} color={TENSO} r={r} nombre={nombre} t={t} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-1 text-2xl">{s.hilosTitulo}</h2>
          <p className="mb-2 text-xs text-texto-suave">{s.hilosNota}</p>
          {r.aspectos.length ? <Hilos r={r} simbolo={simbolo} /> : <p className="text-sm text-texto-suave">{s.sinAspectos}</p>}
        </div>
        <div className="tarjeta space-y-5 p-5">
          <div>
            <h2 className="font-display mb-3 text-2xl">{s.elementosTitulo}</h2>
            <Elementos r={r} t={t} />
          </div>
          {r.solapamientos.length > 0 && (
            <div>
              <h3 className="font-display mb-2 text-xl">{s.casasTitulo}</h3>
              <ul className="space-y-2 text-sm">
                {r.solapamientos.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-oro-suave">{texto(SIMBOLOS_CUERPO[o.cuerpo])}</span>
                    <span>
                      {plantilla(s.casaDe, { planeta: n.cuerpo(o.cuerpo), de: o.de === "a" ? r.a.nombre : r.b.nombre, en: o.de === "a" ? r.b.nombre : r.a.nombre, n: o.casa })}
                      <span className="block text-xs text-texto-suave">{casas[o.casa - 1]}</span>
                    </span>
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
  const n = nombresAstro(t);
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
          {sol && <span>{texto("☉")} {texto(sol.simbolo)} {n.signo(sol.id)}</span>}
          {luna && <span>{texto("☽")} {texto(luna.simbolo)} {n.signo(luna.id)}</span>}
          {asc && <span>AC {texto(asc.simbolo)} {n.signo(asc.id)}</span>}
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

/** Cómo se llevan dos elementos: el mismo, complementarios (fuego-aire, tierra-agua), retadores (fuego-agua, tierra-aire) o neutros. */
function relacion(x: Elemento, y: Elemento) {
  if (x === y) return "mismo";
  const par = [x, y].sort().join("-");
  if (par === "aire-fuego" || par === "agua-tierra") return "complementa";
  if (par === "agua-fuego" || par === "aire-tierra") return "reto";
  return "neutro";
}

/** Soles, lunas y Venus con Marte cruzados: los dos signos, su afinidad y cómo se llevan sus elementos. */
function Quimica({ r, t }: { r: ResultadoSinastria; t: Diccionario }) {
  const s = t.sinastria;
  const n = nombresAstro(t);
  const pares = [
    { titulo: s.pares.soles, x: r.a.sol, y: r.b.sol, cx: "sol", cy: "sol" },
    { titulo: s.pares.lunas, x: r.a.luna, y: r.b.luna, cx: "luna", cy: "luna" },
    { titulo: plantilla(s.pares.venusMarte, { a: r.a.nombre, b: r.b.nombre }), x: r.a.venus, y: r.b.marte, cx: "venus", cy: "marte" },
    { titulo: plantilla(s.pares.venusMarte, { a: r.b.nombre, b: r.a.nombre }), x: r.b.venus, y: r.a.marte, cx: "venus", cy: "marte" },
  ] as const;
  return (
    <ul className="space-y-3">
      {pares.map((p, i) => {
        const sx = signoPorId(p.x);
        const sy = signoPorId(p.y);
        if (!sx || !sy) return null;
        const afinidad = compatibilidadSignos(sx, sy);
        const rel = relacion(sx.elemento, sy.elemento);
        return (
          <li key={i} className="aparecer text-sm" style={{ animationDelay: `${i * 120}ms` }}>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{p.titulo}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="w-28 shrink-0 truncate" style={{ color: COLOR_ELEMENTO[sx.elemento] }}>
                {texto(SIMBOLOS_CUERPO[p.cx])} {texto(sx.simbolo)} {n.signo(sx.id)}
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                <span className="tarot-barra block h-full rounded-full bg-gradient-to-r from-violeta to-oro" style={{ width: `${afinidad}%` }} />
              </span>
              <span className="w-28 shrink-0 truncate text-right" style={{ color: COLOR_ELEMENTO[sy.elemento] }}>
                {n.signo(sy.id)} {texto(sy.simbolo)} {texto(SIMBOLOS_CUERPO[p.cy])}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-texto-suave">
              <span className="font-semibold text-oro-suave">{afinidad}%</span> · {s.relaciones[rel]}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** El tema de la vida real que toca un par de planetas (Sol–Luna, Venus–Marte, Saturno…). */
function tema(x: PuntoSinastria, y: PuntoSinastria, t: Diccionario) {
  const temas = t.sinastria.temas as Record<string, string>;
  const directo = temas[`${x}-${y}`] ?? temas[`${y}-${x}`];
  if (directo) return directo;
  if (x === "ascendente" || y === "ascendente") return temas.ascendente;
  const lento = (["saturno", "pluton", "neptuno", "urano", "jupiter"] as const).find((p) => p === x || p === y);
  return lento ? temas[lento] : temas.otro;
}

/** Una columna de aspectos (los que unen o los que piden trabajo), con lo que significan en la vida real. */
function UneTrabajar({ titulo, vacio, aspectos, color, r, nombre, t }: { titulo: string; vacio: string; aspectos: AspectoSinastria[]; color: string; r: ResultadoSinastria; nombre: (p: PuntoSinastria) => string; t: Diccionario }) {
  const s = t.sinastria;
  const aspectosNombres = t.astral.aspectosNombres as Record<TipoAspecto, string>;
  return (
    <div className="tarjeta p-5">
      <h2 className="font-display mb-3 flex items-center gap-2 text-2xl">
        <span className="h-3 w-3 rounded-full" style={{ background: color }} aria-hidden />
        {titulo}
      </h2>
      {aspectos.length ? (
        <ul className="space-y-3 text-sm">
          {aspectos.map((a, i) => (
            <li key={i} className="aparecer border-t border-borde pt-2 first:border-0 first:pt-0" style={{ animationDelay: `${i * 100}ms` }}>
              <p>
                {plantilla(s.de, { planeta: nombre(a.a), nombre: r.a.nombre })}{" "}
                <span style={{ color }}>{texto(SIMBOLOS_ASPECTO[a.tipo])} {aspectosNombres[a.tipo].toLowerCase()}</span>{" "}
                {plantilla(s.de, { planeta: nombre(a.b), nombre: r.b.nombre })}
                <span className="text-xs text-texto-suave"> · {a.orbe}°</span>
              </p>
              <p className="text-texto-suave">{tema(a.a, a.b, t)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-texto-suave">{vacio}</p>
      )}
    </div>
  );
}

/**
 * Las dos cartas en un mismo zodiaco: los planetas de una persona por dentro
 * (oro), los de la otra por fuera (violeta) y, en el centro, las cuerdas de
 * sus aspectos cruzados.
 */
function RuedaDoble({ a, b, aspectos, nombreA, nombreB, t }: { a: { cuerpo: Cuerpo; longitud: number }[]; b: { cuerpo: Cuerpo; longitud: number }[]; aspectos: AspectoSinastria[]; nombreA: string; nombreB: string; t: Diccionario }) {
  const n = nombresAstro(t);
  const punto = (lon: number, radio: number) => {
    const ang = ((180 + lon) * Math.PI) / 180;
    return [r2(radio * Math.cos(ang)), r2(-radio * Math.sin(ang))] as const;
  };
  const RA = 104;
  const RB = 146;
  const RC = 84;
  const lon = (lista: typeof a, c: PuntoSinastria) => lista.find((p) => p.cuerpo === c)?.longitud;
  const cuerdas = aspectos.filter((x) => x.a !== "ascendente" && x.b !== "ascendente").slice(0, 14);
  return (
    <div className="space-y-3">
      <svg viewBox="-215 -215 430 430" className="mx-auto w-full max-w-[30rem]" role="img" aria-label={t.sinastria.ruedaTitulo}>
        <circle r="206" fill="#120c22" stroke="rgba(241,217,154,0.45)" />
        <circle r="178" fill="none" stroke="rgba(241,217,154,0.45)" />
        {SIGNOS.map((sg, i) => {
          const [x1, y1] = punto(i * 30, 178);
          const [x2, y2] = punto(i * 30, 206);
          const [gx, gy] = punto(i * 30 + 15, 192);
          return (
            <g key={sg.id}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(241,217,154,0.35)" />
              <text x={gx} y={gy} textAnchor="middle" dominantBaseline="central" fontSize="16" fill={COLOR_ELEMENTO[sg.elemento]}>
                <title>{n.signo(sg.id)}</title>
                {texto(sg.simbolo)}
              </text>
            </g>
          );
        })}
        <circle r={(RA + RB) / 2} fill="none" stroke="rgba(183,165,255,0.3)" strokeDasharray="3 5" />
        <circle r={RC} fill="#1a1233" stroke="rgba(241,217,154,0.25)" />
        {cuerdas.map((x, i) => {
          const la = lon(a, x.a);
          const lb = lon(b, x.b);
          if (la == null || lb == null) return null;
          const [x1, y1] = punto(la, RC);
          const [x2, y2] = punto(lb, RC);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={x.aporte >= 0 ? ARMONICO : TENSO} strokeWidth={Math.min(3.5, 0.8 + Math.abs(x.aporte))} strokeOpacity={0.75} strokeLinecap="round" pathLength={1} className="trazo-aspecto" style={{ animationDelay: `${600 + i * 80}ms` }} />
          );
        })}
        {(
          [
            [a, RA, "#f1d99a", 0],
            [b, RB, "#b7a5ff", 300],
          ] as const
        ).map(([lista, radio, color, retraso]) =>
          // En el anillo de adentro las monedas ocupan más grados.
          separar(lista, radio === RA ? 15 : 11).map((p, i) => {
            const [x, y] = punto(p.dibujo, radio);
            const [ex, ey] = punto(p.longitud, radio === RA ? RC : 178);
            const [fx, fy] = punto(p.longitud, radio === RA ? RC + 7 : 171);
            return (
              <g key={`${radio}-${p.cuerpo}`} className="aparecer" style={{ animationDelay: `${retraso + i * 60}ms` }}>
                <line x1={ex} y1={ey} x2={fx} y2={fy} stroke={color} strokeWidth="1.5" />
                <circle cx={x} cy={y} r="13" fill="#150f26" stroke={color} strokeWidth="1.2" />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="14" fill={color}>
                  <title>{n.cuerpo(p.cuerpo)}</title>
                  {texto(SIMBOLOS_CUERPO[p.cuerpo])}
                </text>
              </g>
            );
          }),
        )}
      </svg>
      <p className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-oro bg-[#150f26]" />{nombreA}</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full border border-violeta-suave bg-[#150f26]" />{nombreB}</span>
      </p>
    </div>
  );
}
