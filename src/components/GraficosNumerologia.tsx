import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "@/lib/numerologia";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import type { Cuadricula, Deuda, Etapa, Flecha, Nombre } from "@/lib/numerologia-avanzada";

export const CLAVES_NUMEROLOGIA = ["caminoDeVida", "expresion", "almaOImpulso", "personalidad", "cumpleanos", "anioPersonal"] as const;
type Clave = (typeof CLAVES_NUMEROLOGIA)[number];

/** Color de cada número del perfil (el mismo en el mandala y en las fichas). */
export const COLOR_NUMERO: Record<Clave, string> = {
  caminoDeVida: "#f1d99a",
  expresion: "#b7a5ff",
  almaOImpulso: "#f28dc4",
  personalidad: "#8fc7ff",
  cumpleanos: "#9ad07f",
  anioPersonal: "#ffb35c",
};

const C = 160;
const R = 118;
const r2 = (v: number) => Math.round(v * 100) / 100;
/** Posición del 1 al 9 en el círculo (el 9 arriba, como en el eneagrama); los maestros caen en su raíz: 11→2, 22→4, 33→6. */
const raiz = (n: number) => (n === 11 ? 2 : n === 22 ? 4 : n === 33 ? 6 : n);
const posicion = (n: number, radio = R) => {
  const a = ((raiz(n) % 9) / 9) * Math.PI * 2 - Math.PI / 2;
  return [r2(C + radio * Math.cos(a)), r2(C + radio * Math.sin(a))] as const;
};
const esMaestro = (n: number) => n === 11 || n === 22 || n === 33;

/**
 * Mandala numerológico: el círculo del 1 al 9 con la figura del eneagrama de
 * fondo; los seis números de la persona se encienden con su color y una línea
 * dorada los une en orden (su constelación). El Camino de vida, al centro.
 */
export function MandalaNumerologia({ perfil, t }: { perfil: PerfilNumerologico; t: Diccionario }) {
  const n = t.numerologia;
  const siglas = n.siglas as Record<Clave, string>;
  // Qué números de la persona caen en cada punto del círculo.
  const enPunto = new Map<number, Clave[]>();
  for (const k of CLAVES_NUMEROLOGIA) {
    const p = raiz(perfil[k]);
    enPunto.set(p, [...(enPunto.get(p) ?? []), k]);
  }
  const recorrido = CLAVES_NUMEROLOGIA.map((k) => posicion(perfil[k]).join(",")).join(" ");
  const eneagrama = [1, 4, 2, 8, 5, 7, 1].map((x) => posicion(x).join(",")).join(" ");
  const triangulo = [3, 6, 9, 3].map((x) => posicion(x).join(",")).join(" ");
  const cv = perfil.caminoDeVida;

  return (
    <svg viewBox="-42 -6 404 332" className="mx-auto w-full max-w-[380px]" role="img" aria-label={`${n.constelacion}: ${CLAVES_NUMEROLOGIA.map((k) => `${n.numeros[k]} ${perfil[k]}`).join(", ")}`}>
      <defs>
        <radialGradient id="num-fondo">
          <stop offset="0" stopColor="#2a1a5e" stopOpacity="0.8" />
          <stop offset="1" stopColor="#0b0716" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="num-centro">
          <stop offset="0" stopColor="#3a2380" />
          <stop offset="1" stopColor="#150f26" />
        </radialGradient>
        <filter id="num-brillo" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <circle cx={C} cy={C} r={156} fill="url(#num-fondo)" />
      <circle cx={C} cy={C} r={R + 24} fill="none" stroke="rgba(241,217,154,0.25)" strokeDasharray="1 5" strokeLinecap="round" />
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(241,217,154,0.35)" />
      <circle cx={C} cy={C} r={R - 34} fill="none" stroke="rgba(255,255,255,0.07)" />
      <polyline points={eneagrama} fill="none" stroke="rgba(183,165,255,0.18)" />
      <polyline points={triangulo} fill="none" stroke="rgba(183,165,255,0.18)" />

      {/* La constelación de la persona */}
      <polyline points={recorrido} fill="none" stroke="#f1d99a" strokeOpacity="0.35" strokeWidth="5" filter="url(#num-brillo)" />
      <polyline points={recorrido} fill="none" stroke="#f1d99a" strokeWidth="1.6" strokeLinejoin="round" pathLength={1} className="trazo-aspecto" style={{ animationDelay: "250ms" }} />

      {Array.from({ length: 9 }, (_, i) => i + 1).map((x) => {
        const [px, py] = posicion(x);
        const claves = enPunto.get(x) ?? [];
        const activo = claves.length > 0;
        const color = activo ? COLOR_NUMERO[claves[0]] : "rgba(255,255,255,0.25)";
        const [ex, ey] = posicion(x, R + 30);
        return (
          <g key={x}>
            {activo && <circle cx={px} cy={py} r={20} fill={color} opacity={0.35} filter="url(#num-brillo)" />}
            <circle cx={px} cy={py} r={15} fill={activo ? "#150f26" : "#0f0a1c"} stroke={color} strokeWidth={activo ? 1.8 : 1} />
            <text x={px} y={py} textAnchor="middle" dominantBaseline="central" fontSize={15} fontWeight={600} fill={activo ? color : "rgba(236,230,247,0.45)"}>
              {x}
            </text>
            {activo && (
              <text x={ex} y={ey} textAnchor="middle" dominantBaseline="central" fontSize={8.5} letterSpacing="0.08em" fill={color}>
                {claves.map((k) => siglas[k]).join("·")}
              </text>
            )}
          </g>
        );
      })}

      {/* Camino de vida al centro */}
      <circle cx={C} cy={C} r={50} fill="url(#num-centro)" stroke="#d9b45a" strokeWidth={1.2} />
      {esMaestro(cv) && <circle cx={C} cy={C} r={56} fill="none" stroke="#b7a5ff" strokeDasharray="2 4" strokeLinecap="round" />}
      <text x={C} y={C - 4} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-display), serif" fontSize={44} fontWeight={600} fill="#f1d99a">
        {cv}
      </text>
      <text x={C} y={C + 26} textAnchor="middle" fontSize={7.5} letterSpacing="0.18em" fill="#b7a5ff">
        {n.numeros.caminoDeVida.toUpperCase()}
      </text>
    </svg>
  );
}

/** Los nueve años del ciclo personal en un arco, con el año actual encendido. */
export function CicloNumerologia({ anio, t }: { anio: number; t: Diccionario }) {
  const actual = raiz(anio);
  const puntos = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI + (i / 8) * Math.PI;
    return { n: i + 1, x: r2(170 + 140 * Math.cos(a)), y: r2(160 + 120 * Math.sin(a)) };
  });
  return (
    <div>
      <svg viewBox="0 0 340 180" className="mx-auto w-full max-w-[420px]" aria-hidden>
        <path d="M 30 160 A 140 120 0 0 1 310 160" fill="none" stroke="rgba(241,217,154,0.25)" strokeDasharray="2 5" strokeLinecap="round" />
        {puntos.map((p) => {
          const hecho = p.n < actual;
          const ahora = p.n === actual;
          return (
            <g key={p.n}>
              {ahora && <circle cx={p.x} cy={p.y} r={22} fill="#ffb35c" opacity={0.3} className="num-ciclo-pulso" />}
              <circle cx={p.x} cy={p.y} r={ahora ? 16 : 11} fill={ahora ? "#ffb35c" : hecho ? "rgba(241,217,154,0.35)" : "#150f26"} stroke={ahora ? "#fff1c4" : "rgba(241,217,154,0.5)"} strokeWidth={1.2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize={ahora ? 15 : 11} fontWeight={600} fill={ahora ? "#150f26" : hecho ? "#150f26" : "#f1d99a"}>
                {p.n}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="text-center text-sm text-texto-suave">
        {plantilla(t.numerologia.cicloNota, { n: anio, titulo: SIGNIFICADO_NUMERO[anio]?.titulo ?? "" })}
      </p>
    </div>
  );
}

/** Ficha de un número: su color, si es maestro y lo que significa. */
export function FichaNumero({ clave, valor, t, retraso = 0 }: { clave: Clave; valor: number; t: Diccionario; retraso?: number }) {
  const color = COLOR_NUMERO[clave];
  return (
    <div className="tarjeta aparecer relative overflow-hidden p-4 text-center" style={{ animationDelay: `${retraso}ms` }}>
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: color }} aria-hidden />
      <p key={valor} className="numero-brota font-display text-5xl" style={{ color }}>
        {valor}
      </p>
      <p className="mt-1 text-sm font-medium">{t.numerologia.numeros[clave]}</p>
      <p className="text-xs text-texto-suave">{SIGNIFICADO_NUMERO[valor]?.titulo}</p>
      {esMaestro(valor) && <p className="mt-1 text-[10px] uppercase tracking-widest text-violeta-suave">{t.numerologia.maestro}</p>}
    </div>
  );
}

/** Celda de cada dígito en la cuadrícula: columnas 1-2-3, 4-5-6, 7-8-9, con el 3, el 6 y el 9 arriba. */
const celda = (d: number) => {
  const col = Math.floor((d - 1) / 3);
  const fila = 2 - ((d - 1) % 3);
  return [70 + col * 80, 70 + fila * 80] as const;
};

/**
 * Cuadrícula de Pitágoras: los dígitos de la fecha en el cuadro de 3×3, con
 * las líneas llenas (fuerzas) trazadas en oro y las vacías (lo que se
 * aprende) punteadas; debajo, el nombre y el sentido de cada flecha.
 */
export function CuadriculaPitagoras({ cuadro, t }: { cuadro: Cuadricula; t: Diccionario }) {
  const n = t.numerologia;
  const flechas = n.flechas as Record<Flecha, { plena: { nombre: string; texto: string }; vacia: { nombre: string; texto: string } }>;
  const linea = (f: Flecha) => {
    const [a, , c] = f.split("").map(Number);
    const [x1, y1] = celda(a);
    const [x2, y2] = celda(c);
    const dx = (x2 - x1) / 160;
    const dy = (y2 - y1) / 160;
    return { x1: x1 - dx * 26, y1: y1 - dy * 26, x2: x2 + dx * 26, y2: y2 + dy * 26 };
  };
  return (
    <div className="grid items-center gap-6 md:grid-cols-[minmax(0,17rem)_1fr]">
      <svg viewBox="0 0 330 280" className="mx-auto w-full max-w-[17rem]" role="img" aria-label={n.cuadriculaTitulo}>
        {[0, 1, 2].map((fila) =>
          [0, 1, 2].map((col) => <rect key={`${fila}${col}`} x={32 + col * 80} y={32 + fila * 80} width={76} height={76} rx={10} fill="#150f26" stroke="rgba(241,217,154,0.3)" />),
        )}
        {(["mente", "alma", "cuerpo"] as const).map((k, i) => (
          <text key={k} x={276} y={74 + i * 80} fontSize={11} letterSpacing="0.1em" fill="#b7a5ff">{n.filas[k].toUpperCase()}</text>
        ))}
        {cuadro.vacias.map((f) => {
          const l = linea(f);
          return <line key={f} {...l} stroke="#b7a5ff" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="3 6" strokeLinecap="round" />;
        })}
        {cuadro.llenas.map((f, i) => {
          const l = linea(f);
          return (
            <g key={f}>
              <line {...l} stroke="#f1d99a" strokeOpacity={0.3} strokeWidth={9} strokeLinecap="round" />
              <line {...l} stroke="#f1d99a" strokeWidth={3} strokeLinecap="round" pathLength={1} className="trazo-aspecto" style={{ animationDelay: `${300 + i * 250}ms` }} />
            </g>
          );
        })}
        {Array.from({ length: 9 }, (_, i) => i + 1).map((d) => {
          const [x, y] = celda(d);
          const veces = cuadro.cuenta[d];
          return (
            <g key={d}>
              {veces > 0 && <circle cx={x} cy={y} r={24} fill="#2a1a5e" stroke="#f1d99a" strokeOpacity={0.6} />}
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={veces > 2 ? 16 : 21} fontWeight={700} letterSpacing={veces > 1 ? "0.06em" : undefined} fill={veces ? "#f1d99a" : "rgba(236,230,247,0.2)"}>
                {veces ? String(d).repeat(veces) : d}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="space-y-3 text-sm">
        {cuadro.llenas.length === 0 && cuadro.vacias.length === 0 && <p className="text-texto-suave">{n.sinFlechas}</p>}
        {cuadro.llenas.map((f) => (
          <div key={f} className="flex gap-3">
            <span className="mt-0.5 text-oro" aria-hidden>✦</span>
            <p>
              <span className="text-oro-suave">{flechas[f].plena.nombre}</span> <span className="text-xs text-texto-suave">({f.split("").join("-")})</span>
              <span className="block text-texto">{flechas[f].plena.texto}</span>
            </p>
          </div>
        ))}
        {cuadro.vacias.map((f) => (
          <div key={f} className="flex gap-3">
            <span className="mt-0.5 text-violeta-suave" aria-hidden>○</span>
            <p>
              <span className="text-violeta-suave">{flechas[f].vacia.nombre}</span> <span className="text-xs text-texto-suave">({f.split("").join("-")})</span>
              <span className="block text-texto">{flechas[f].vacia.texto}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Las cuatro etapas de la vida: una cordillera con un pico por pináculo (más
 * alto cuanto mayor el número), el desafío de cada etapa debajo y la etapa
 * actual encendida con la marca de la edad.
 */
export function EtapasVida({ etapas, edad, t }: { etapas: Etapa[]; edad: number | null; t: Diccionario }) {
  const n = t.numerologia;
  const temas = n.temas as Record<string, string>;
  const actual = edad == null ? -1 : etapas.findIndex((e) => edad >= e.desde && (e.hasta == null || edad <= e.hasta));
  const rango = (e: Etapa) => (e.hasta == null ? plantilla(n.desdeEdad, { n: e.desde }) : plantilla(n.edades, { desde: e.desde, hasta: e.hasta }));
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 640 190" className="w-full" role="img" aria-label={n.etapasTitulo}>
        <defs>
          <linearGradient id="num-monte" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f1d99a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f1d99a" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="num-monte-apagado" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b7a5ff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#b7a5ff" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        <line x1="0" y1="150" x2="640" y2="150" stroke="rgba(241,217,154,0.35)" />
        {etapas.map((e, i) => {
          const x0 = i * 160;
          const cima = 150 - (44 + raiz(e.pinaculo) * 9);
          const es = i === actual;
          return (
            <g key={i} className="aparecer" style={{ animationDelay: `${i * 150}ms` }}>
              <path d={`M ${x0 + 4} 150 Q ${x0 + 50} ${cima + 30} ${x0 + 80} ${cima} Q ${x0 + 110} ${cima + 30} ${x0 + 156} 150 Z`} fill={es ? "url(#num-monte)" : "url(#num-monte-apagado)"} stroke={es ? "#f1d99a" : "rgba(183,165,255,0.5)"} strokeWidth={es ? 1.6 : 1} />
              <circle cx={x0 + 80} cy={cima - 4} r={19} fill="#150f26" stroke={es ? "#f1d99a" : "#b7a5ff"} strokeWidth={es ? 2 : 1} />
              <text x={x0 + 80} y={cima - 4} textAnchor="middle" dominantBaseline="central" fontSize={18} fontWeight={700} fill={es ? "#f1d99a" : "#d9d0f5"}>{e.pinaculo}</text>
              <text x={x0 + 80} y={170} textAnchor="middle" fontSize={12} fill={es ? "#f1d99a" : "rgba(236,230,247,0.6)"}>{rango(e)}</text>
              {es && edad != null && (
                <g>
                  <circle cx={x0 + 12 + 136 * Math.min(1, (edad - e.desde) / Math.max(1, (e.hasta ?? e.desde + 27) - e.desde))} cy={150} r={6} fill="#ffb35c" stroke="#fff1c4" className="num-ciclo-pulso" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {etapas.map((e, i) => {
          const es = i === actual;
          return (
            <div key={i} className={`rounded-xl border p-4 text-sm ${es ? "border-oro bg-oro/10" : "border-borde bg-superficie-2/60"}`}>
              <p className="flex items-center justify-between gap-2 text-xs uppercase tracking-widest text-texto-suave">
                {rango(e)}
                {es && <span className="shrink-0 whitespace-nowrap rounded-full bg-oro px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-noche">{n.ahora}</span>}
              </p>
              <p className="mt-2 text-texto">
                <span className="text-oro-suave">{n.pinaculo} {e.pinaculo}</span> · {temas[String(e.pinaculo)]}
              </p>
              <p className="mt-1 text-texto-suave">
                <span className="text-violeta-suave">{n.desafio} {e.desafio}</span> · {n.desafios[e.desafio]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Lo que dice el nombre: una barra por número con cuántas letras lo valen;
 * los que faltan quedan como lecciones kármicas y el que más se repite brilla
 * como pasión oculta. Debajo, las lecciones, la pasión y las deudas kármicas.
 */
export function NombreNumeros({ plano, deudas, t }: { plano: Nombre; deudas: Deuda[]; t: Diccionario }) {
  const n = t.numerologia;
  const temas = n.temas as Record<string, string>;
  const deudaTexto = n.deudaTexto as Record<string, string>;
  const max = Math.max(1, ...plano.cuenta.slice(1));
  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,18rem)_1fr]">
      <div className="flex h-44 items-end justify-between gap-1.5" aria-hidden>
        {Array.from({ length: 9 }, (_, i) => i + 1).map((d, i) => {
          const v = plano.cuenta[d];
          const pasion = plano.pasion.includes(d);
          return (
            <div key={d} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-xs tabular-nums text-texto-suave">{v || ""}</span>
              {v ? (
                <div className="num-barra w-full rounded-t-md" style={{ height: `${(v / max) * 100}%`, background: pasion ? "#f1d99a" : "rgba(183,165,255,0.55)", animationDelay: `${i * 60}ms` }} />
              ) : (
                <div className="h-6 w-full rounded-md border border-dashed border-violeta-suave/70" />
              )}
              <span className={`text-base font-semibold tabular-nums ${pasion ? "text-oro" : v ? "text-texto" : "text-violeta-suave"}`}>{d}</span>
            </div>
          );
        })}
      </div>
      <div className="space-y-4 text-sm">
        {plano.pasion.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{n.pasion}</p>
            <p className="mt-1 text-oro-suave">
              {plano.pasion.map((d) => `${d} · ${temas[String(d)]}`).join(" / ")}
            </p>
            <p className="text-texto-suave">{n.pasionNota}</p>
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-widest text-texto-suave">{n.lecciones}</p>
          {plano.lecciones.length ? (
            <ul className="mt-1 space-y-1">
              {plano.lecciones.map((d) => (
                <li key={d} className="text-texto">
                  <span className="text-violeta-suave">{d}</span> · {n.leccion[d]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-texto">{n.sinLecciones}</p>
          )}
        </div>
        {deudas.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-widest text-texto-suave">{n.deudas}</p>
            <ul className="mt-1 space-y-1">
              {deudas.map((d) => (
                <li key={d} className="text-texto">
                  <span className="text-oro-suave">{d}</span> · {deudaTexto[String(d)]}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/** El mes y el día personal de hoy, con su tema. */
export function MesDiaPersonal({ mes, dia, t }: { mes: number; dia: number; t: Diccionario }) {
  const n = t.numerologia;
  const temas = n.temas as Record<string, string>;
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-borde pt-4 text-center text-sm">
      <div>
        <p className="text-3xl font-semibold tabular-nums text-[#ffb35c]">{mes}</p>
        <p className="text-texto">{plantilla(n.mesPersonal, { n: mes })}</p>
        <p className="text-xs text-texto-suave">{temas[String(mes)]}</p>
      </div>
      <div>
        <p className="text-3xl font-semibold tabular-nums text-oro-suave">{dia}</p>
        <p className="text-texto">{plantilla(n.diaPersonal, { n: dia })}</p>
        <p className="text-xs text-texto-suave">{temas[String(dia)]}</p>
      </div>
    </div>
  );
}
