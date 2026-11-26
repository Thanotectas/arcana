"use client";

import { useState } from "react";
import type { ItemRueda } from "@/lib/escuela/personal";
import { sonarCuenco } from "@/lib/escuela/sonido";

/**
 * La rueda de intenciones: ocho esferas de color alrededor de una vela. Al tocar una, la rueda gira, la llama toma su
 * color y aparecen su día, su astro, su Luna, su planta y su piedra.
 */
export function RuedaIntenciones({ items, inicial }: { items: ItemRueda[]; inicial?: string | null }) {
  const [sel, setSel] = useState(Math.max(0, items.findIndex((x) => x.clave === inicial)));
  const n = items.length;
  const paso = 360 / n;
  const giro = -sel * paso;
  const it = items[sel];
  const elegir = (i: number) => {
    setSel(i);
    sonarCuenco(196 + i * 22, 0.22);
  };
  return (
    <div className="space-y-5">
      <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
        <div className="escuela-cielo pointer-events-none absolute inset-0 rounded-full" aria-hidden />
        <svg viewBox="-150 -150 300 300" className="relative h-full w-full">
          <circle r="118" fill="none" stroke="rgba(241,217,154,.25)" strokeDasharray="2 6" className="escuela-girar" />
          <circle r="92" fill="none" stroke="rgba(183,165,255,.18)" />
          <g style={{ transform: `rotate(${giro}deg)`, transition: "transform 1.1s cubic-bezier(.3,.8,.2,1)" }}>
            {items.map((x, i) => {
              const a = ((i * paso - 90) * Math.PI) / 180;
              const cx = Math.cos(a) * 118;
              const cy = Math.sin(a) * 118;
              const activo = i === sel;
              return (
                <g key={x.clave} transform={`translate(${cx} ${cy})`} onClick={() => elegir(i)} className="cursor-pointer outline-none" role="button" tabIndex={0} aria-label={x.nombre} aria-pressed={activo} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && elegir(i)}>
                  <circle r="24" fill="transparent" />
                  <circle r={activo ? 17 : 12} fill={x.tono} stroke={activo ? "#f1d99a" : "rgba(255,255,255,.25)"} strokeWidth={activo ? 2.5 : 1} style={{ filter: `drop-shadow(0 0 ${activo ? 14 : 6}px ${x.tono})`, transition: "all .6s" }} />
                </g>
              );
            })}
          </g>
          {/* La vela del centro, con la llama del color elegido */}
          <g>
            <defs>
              <radialGradient id="rueda-halo">
                <stop offset="0%" stopColor={it.tono} stopOpacity=".55" />
                <stop offset="100%" stopColor={it.tono} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="0" cy="-30" r="46" fill="url(#rueda-halo)" className="escuela-halo" />
            <rect x="-13" y="-6" width="26" height="62" rx="4" fill="#f4ead2" />
            <rect x="-13" y="-6" width="26" height="8" rx="4" fill="#e6d8b4" />
            <line x1="0" y1="-6" x2="0" y2="-12" stroke="#3a2b1c" strokeWidth="1.5" />
            <path d="M0 -50 C 11 -34 9 -20 0 -12 C -9 -20 -11 -34 0 -50 Z" fill={it.tono} className="escuela-llama" style={{ transition: "fill .8s", filter: `drop-shadow(0 0 10px ${it.tono})` }} />
            <path d="M0 -38 C 5 -29 4 -21 0 -16 C -4 -21 -5 -29 0 -38 Z" fill="#fff7dc" className="escuela-llama" />
          </g>
          {/* Marca arriba: la intención elegida queda siempre ahí */}
          <path d="M0 -146 l6 -9 h-12 z" fill="#f1d99a" transform="rotate(180 0 -150)" />
        </svg>
      </div>
      <div key={it.clave} className="tarjeta aparecer border-oro/40 p-5 text-center" aria-live="polite">
        <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Tu intención</p>
        <p className="font-display text-3xl">{it.nombre}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-start text-sm sm:grid-cols-3">
          {[
            ["Vela", `${it.vela} ${it.alterna}`],
            ["Día", `${it.dia.charAt(0).toUpperCase()}${it.dia.slice(1)}`],
            ["Astro", it.astro.replace(/^(el|la) /, "").replace(/^./, (c) => c.toUpperCase())],
            ["Luna", it.fase],
            ["Planta", it.planta],
            ["Piedra", it.piedra],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-oro-suave">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="text-center text-xs text-texto-suave">Toca una esfera de color para elegir otra intención.</p>
    </div>
  );
}
