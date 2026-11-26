"use client";

import { useState } from "react";
import { sonarCampanitas } from "@/lib/escuela/sonido";

interface Tradicion {
  lugar: string;
  emoji: string;
  nombre: string;
  texto: string;
}

// Posiciones de las estrellas (en un lienzo de 320×200) para 2 a 6 tradiciones: una constelación que se dibuja.
const FORMAS: Record<number, [number, number][]> = {
  2: [[90, 110], [230, 80]],
  3: [[60, 140], [160, 60], [260, 130]],
  4: [[50, 130], [130, 55], [215, 95], [280, 35]],
  5: [[40, 150], [105, 70], [175, 120], [245, 50], [290, 140]],
  6: [[35, 120], [95, 50], [160, 95], [215, 35], [265, 110], [195, 165]],
};

/** Las tradiciones del mundo como una constelación: cada estrella se toca y cuenta cómo se vive el gesto allí. */
export function ConstelacionTradiciones({ items }: { items: Tradicion[] }) {
  const [activa, setActiva] = useState(0);
  const [vistas, setVistas] = useState<Set<number>>(() => new Set([0]));
  const puntos = FORMAS[Math.min(Math.max(items.length, 2), 6)] ?? FORMAS[4];
  const elegir = (i: number) => {
    if (!vistas.has(i)) sonarCampanitas(0.05);
    setActiva(i);
    setVistas((v) => new Set(v).add(i));
  };
  const t = items[activa];
  return (
    <div className="space-y-4">
      <div className="tarjeta relative overflow-hidden p-2">
        <div className="escuela-cielo pointer-events-none absolute inset-0" aria-hidden />
        <svg viewBox="0 0 320 200" className="relative w-full" role="group" aria-label="Constelación de tradiciones">
          <polyline points={puntos.slice(0, items.length).map((p) => p.join(",")).join(" ")} fill="none" stroke="rgba(241,217,154,.45)" strokeWidth="1" className="escuela-trazo" />
          {items.map((it, i) => {
            const [x, y] = puntos[i];
            const sel = i === activa;
            return (
              <g key={it.nombre} onClick={() => elegir(i)} className="cursor-pointer outline-none" role="button" tabIndex={0} aria-label={`${it.lugar}: ${it.nombre}`} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && elegir(i)}>
                <circle cx={x} cy={y} r="22" fill="transparent" />
                <circle cx={x} cy={y} r={sel ? 14 : 9} fill={sel ? "rgba(241,217,154,.18)" : "rgba(183,165,255,.12)"} />
                <circle cx={x} cy={y} r={sel ? 4.5 : 3.2} fill={vistas.has(i) ? "#f1d99a" : "#b7a5ff"} className="escuela-estrella" style={{ animationDelay: `${i * 0.4}s` }} />
                <text x={x} y={y + (y > 150 ? -16 : 24)} textAnchor="middle" fontSize="11" fill={sel ? "#f1d99a" : "rgba(236,230,247,.7)"}>{it.emoji}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-center text-xs text-texto-suave">Toca cada estrella · {vistas.size} de {items.length}</p>
      {t && (
        <div key={activa} className="tarjeta aparecer border-oro/40 p-5" aria-live="polite">
          <p className="text-xs uppercase tracking-[0.25em] text-oro-suave">
            <span aria-hidden>{t.emoji} </span>
            {t.lugar}
          </p>
          <h3 className="font-display text-2xl">{t.nombre}</h3>
          <p className="mt-1 leading-relaxed text-texto/85">{t.texto}</p>
        </div>
      )}
    </div>
  );
}
