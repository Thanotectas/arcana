"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { calcularMatriz, cartaDelArcano, type Matriz } from "@/lib/seo/matriz";
import { RESULTADOS } from "@/lib/seo/test-carta";
import { cartaPorId } from "@/lib/tarot/deck";

/** Nombre de la carta del arcano n (El Mago, La Justicia…). */
const nombre = (n: number) => cartaPorId(cartaDelArcano(n))?.nombre ?? "";

const PUNTOS: { clave: keyof Matriz; x: number; y: number; r: number; tono: "centro" | "personal" | "ancestros" }[] = [
  { clave: "b", x: 210, y: 42, r: 26, tono: "personal" },
  { clave: "a", x: 42, y: 210, r: 26, tono: "personal" },
  { clave: "c", x: 378, y: 210, r: 26, tono: "personal" },
  { clave: "d", x: 210, y: 378, r: 26, tono: "personal" },
  { clave: "f", x: 91, y: 91, r: 22, tono: "ancestros" },
  { clave: "g", x: 329, y: 91, r: 22, tono: "ancestros" },
  { clave: "h", x: 329, y: 329, r: 22, tono: "ancestros" },
  { clave: "i", x: 91, y: 329, r: 22, tono: "ancestros" },
  { clave: "e", x: 210, y: 210, r: 36, tono: "centro" },
];

const ETIQUETA: Partial<Record<keyof Matriz, string>> = { b: "Don", a: "Cómo te ven", c: "Camino material", d: "Lección", e: "Esencia" };

/** El octograma: los dos cuadros se trazan y los números aparecen uno a uno. */
function Octograma({ m }: { m: Matriz }) {
  const p = (k: keyof Matriz) => PUNTOS.find((x) => x.clave === k)!;
  const linea = (a: keyof Matriz, b: keyof Matriz, color: string, ancho = 2, opacidad = 0.8) => (
    <line key={`${a}${b}`} x1={p(a).x} y1={p(a).y} x2={p(b).x} y2={p(b).y} stroke={color} strokeWidth={ancho} strokeOpacity={opacidad} className="matriz-trazo" />
  );
  return (
    <svg viewBox="-34 -14 488 448" className="mx-auto w-full max-w-md" role="img" aria-label={`Matriz del destino: centro ${m.e}, ${nombre(m.e)}`}>
      <defs>
        <radialGradient id="matriz-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#f1d99a" stopOpacity="0.35" />
          <stop offset="1" stopColor="#8b6cf6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="210" cy="210" r="150" fill="url(#matriz-halo)" />
      {/* Cuadro personal (rombo) y cuadro de los ancestros */}
      {linea("a", "b", "#b7a5ff")}
      {linea("b", "c", "#b7a5ff")}
      {linea("c", "d", "#b7a5ff")}
      {linea("d", "a", "#b7a5ff")}
      {linea("f", "g", "#d9b45a")}
      {linea("g", "h", "#d9b45a")}
      {linea("h", "i", "#d9b45a")}
      {linea("i", "f", "#d9b45a")}
      {linea("a", "c", "#ece6f7", 1, 0.25)}
      {linea("b", "d", "#ece6f7", 1, 0.25)}
      {linea("f", "h", "#ece6f7", 1, 0.25)}
      {linea("g", "i", "#ece6f7", 1, 0.25)}
      {PUNTOS.map((pt, n) => {
        const valor = m[pt.clave];
        const centro = pt.tono === "centro";
        return (
          <g key={pt.clave} className="matriz-punto" style={{ animationDelay: `${0.6 + n * 0.15}s` }}>
            <circle cx={pt.x} cy={pt.y} r={pt.r} fill={centro ? "#f1d99a" : "#150f26"} stroke={pt.tono === "ancestros" ? "#d9b45a" : "#f1d99a"} strokeWidth={centro ? 0 : 2} />
            <text x={pt.x} y={pt.y} textAnchor="middle" dominantBaseline="central" fontFamily="var(--font-inter), sans-serif" fontWeight={600} fontSize={centro ? 30 : 20} fill={centro ? "#0b0716" : "#ece6f7"}>
              {valor}
            </text>
          </g>
        );
      })}
      {(["b", "a", "c", "d"] as const).map((k) => {
        const pt = p(k);
        const dy = k === "b" ? -34 : k === "d" ? 40 : 40;
        return (
          <text key={`et-${k}`} x={pt.x} y={pt.y + dy} textAnchor="middle" fontSize="11" fill="#b7a5ff" fontFamily="var(--font-inter), sans-serif" className="matriz-punto" style={{ animationDelay: "1.8s" }}>
            {ETIQUETA[k]}
          </text>
        );
      })}
    </svg>
  );
}

function Arcano({ n, titulo, texto }: { n: number; titulo: string; texto: string }) {
  const id = cartaDelArcano(n);
  return (
    <div className="tarjeta flex gap-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- imágenes estáticas del mazo */}
      <img src={`/cartas/rider/${id}.webp`} alt={nombre(n)} className="h-28 w-16 shrink-0 rounded-lg border border-oro/40 object-cover" loading="lazy" />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{titulo}</p>
        <p className="font-display text-xl text-oro-suave">
          {n} · {nombre(n)}
        </p>
        <p className="mt-1 text-sm text-texto-suave">{texto}</p>
        <Link href={`/significado-tarot/${id}`} className="mt-1 inline-block text-xs text-oro-suave underline">
          Significado de {nombre(n)}
        </Link>
      </div>
    </div>
  );
}

/** Calculadora de la Matriz del Destino: pide la fecha, dibuja el octograma y explica los puntos. */
export function MatrizDestino({ fechaInicial }: { fechaInicial: string }) {
  const router = useRouter();
  const ruta = usePathname();
  const [fecha, setFecha] = useState(fechaInicial);
  const m = calcularMatriz(fecha);
  const r = (n: number) => RESULTADOS[cartaDelArcano(n)];

  function cambiar(v: string) {
    setFecha(v);
    // La fecha queda en la dirección para poder compartir la matriz.
    if (calcularMatriz(v)) router.replace(`${ruta}?fecha=${v}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="tarjeta space-y-2 p-5">
        <label htmlFor="fecha-matriz" className="text-sm text-texto-suave">
          Tu fecha de nacimiento
        </label>
        <input id="fecha-matriz" type="date" value={fecha} onChange={(e) => cambiar(e.target.value)} min="1900-01-01" max="2100-12-31" className="campo w-full" />
      </div>

      {m && (
        <div key={fecha} className="space-y-6">
          <div className="tarjeta p-4 sm:p-6">
            <Octograma m={m} />
            <p className="mt-2 text-center text-sm text-texto-suave">
              Tu centro es el <span className="text-oro-suave">{m.e}</span>: {nombre(m.e)}
            </p>
          </div>

          <Arcano n={m.e} titulo="Tu esencia · el centro" texto={`${r(m.e).esencia} ${r(m.e).descripcion}`} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Arcano n={m.b} titulo="Tu don" texto={r(m.b).don + " " + r(m.b).esencia} />
            <Arcano n={m.a} titulo="Cómo te ven" texto={r(m.a).esencia} />
            <Arcano n={m.c} titulo="Tu camino material" texto={cartaPorId(cartaDelArcano(m.c))?.trabajo ?? ""} />
            <Arcano n={m.d} titulo="Tu gran lección" texto={r(m.d).reto} />
          </div>

          <section className="space-y-3">
            <h2 className="font-display text-2xl">Tus tres propósitos</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Personal", "De los 20 a los 40 años", m.personal],
                  ["Social", "De los 40 a los 60 años", m.social],
                  ["Espiritual", "Desde los 60 años", m.espiritual],
                ] as const
              ).map(([t, edad, n]) => (
                <div key={t} className="tarjeta p-4 text-center">
                  <p className="text-xs uppercase tracking-widest text-violeta-suave">{t}</p>
                  <p className="font-display text-3xl text-oro-suave">{n}</p>
                  <p className="font-semibold">{nombre(n)}</p>
                  <p className="mt-1 text-xs text-texto-suave">{edad}</p>
                  <p className="mt-2 text-sm text-texto-suave">{r(n).don}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-center text-xs text-texto-suave">
            Los puntos dorados de las esquinas son tu cuadro de los ancestros: {nombre(m.f)}, {nombre(m.g)}, {nombre(m.h)} y {nombre(m.i)}, lo que heredas de tu familia.
          </p>
        </div>
      )}
    </div>
  );
}
