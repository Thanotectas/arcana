import { SIGNIFICADO_NUMERO, type PerfilNumerologico } from "@/lib/numerologia";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";

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
