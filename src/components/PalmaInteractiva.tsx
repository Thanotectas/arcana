"use client";

import { useState } from "react";
import { useT } from "@/lib/i18n/cliente";
import { COLOR_LINEA, LINEAS, type LineaMano, type TrazosMano } from "@/lib/quiromancia";

/**
 * Foto de la palma con los trazos que el modelo identificó. Cada línea se
 * puede encender o apagar; al pasar el cursor se resalta.
 */
export function PalmaInteractiva({ urlFoto, trazos }: { urlFoto: string; trazos: TrazosMano | null }) {
  const { t } = useT();
  const [visibles, setVisibles] = useState<Record<LineaMano, boolean>>({ vida: true, cabeza: true, corazon: true, destino: true });
  const [activa, setActiva] = useState<LineaMano | null>(null);

  const suavizar = (puntos: [number, number][]) => {
    if (puntos.length < 3) return `M ${puntos.map((p) => p.join(" ")).join(" L ")}`;
    let d = `M ${puntos[0][0]} ${puntos[0][1]}`;
    for (let i = 1; i < puntos.length - 1; i++) {
      const [x0, y0] = puntos[i];
      const [x1, y1] = puntos[i + 1];
      d += ` Q ${x0} ${y0} ${(x0 + x1) / 2} ${(y0 + y1) / 2}`;
    }
    const u = puntos[puntos.length - 1];
    d += ` T ${u[0]} ${u[1]}`;
    return d;
  };

  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-borde">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={urlFoto} alt={t.quiromancia.tuPalma} className="block w-full" />
        {trazos && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
            {LINEAS.map((l) => {
              const puntos = trazos[l];
              if (!puntos || !visibles[l]) return null;
              const resaltada = activa === l;
              return (
                <path
                  key={l}
                  d={suavizar(puntos)}
                  fill="none"
                  stroke={COLOR_LINEA[l]}
                  strokeWidth={resaltada ? 1.6 : 0.9}
                  strokeOpacity={activa && !resaltada ? 0.35 : 0.95}
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  className="trazo-palma"
                  style={{ filter: resaltada ? `drop-shadow(0 0 3px ${COLOR_LINEA[l]})` : undefined }}
                />
              );
            })}
          </svg>
        )}
      </div>
      {trazos && (
        <div className="flex flex-wrap justify-center gap-2" role="group">
          {LINEAS.filter((l) => trazos[l]).map((l) => (
            <button
              key={l}
              type="button"
              onMouseEnter={() => setActiva(l)}
              onMouseLeave={() => setActiva(null)}
              onFocus={() => setActiva(l)}
              onBlur={() => setActiva(null)}
              onClick={() => setVisibles((v) => ({ ...v, [l]: !v[l] }))}
              aria-pressed={visibles[l]}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition ${visibles[l] ? "border-borde text-texto" : "border-borde/40 text-texto-suave line-through"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR_LINEA[l] }} aria-hidden />
              {t.quiromancia.lineas[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
