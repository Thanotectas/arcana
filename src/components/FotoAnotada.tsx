"use client";

import type { ReactNode } from "react";

/** Algo que el modelo señaló en la foto, en porcentajes sobre su ancho y su alto. */
export interface MarcaFoto {
  nombre: string;
  x: number;
  y: number;
  sentido: string;
}

/**
 * Foto con un número sobre cada marca y la lista debajo; tocar un número o
 * una fila la resalta en los dos lados. `color` pinta el aro de cada número y
 * `extra` agrega algo después del nombre (por ejemplo, una flecha).
 */
export function FotoAnotada<M extends MarcaFoto>({
  urlFoto,
  alt,
  marcas,
  activa,
  elegir,
  color,
  extra,
}: {
  urlFoto: string;
  alt: string;
  marcas: M[];
  activa: number | null;
  elegir: (i: number | null) => void;
  color?: (m: M) => string;
  extra?: (m: M) => ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-borde">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto privada firmada */}
        <img src={urlFoto} alt={alt} className="block w-full" />
        {marcas.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => elegir(activa === i ? null : i)}
            className={`taza-marca absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums transition ${activa === i ? "border-white bg-oro text-noche scale-125" : "border-oro bg-noche/80 text-oro-suave"}`}
            style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${0.3 + i * 0.25}s`, borderColor: activa !== i && color ? color(m) : undefined }}
            aria-label={`${i + 1}. ${m.nombre}`}
            aria-pressed={activa === i}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {marcas.length > 0 && (
        <ol className="space-y-1.5 text-sm">
          {marcas.map((m, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => elegir(activa === i ? null : i)}
                onMouseEnter={() => elegir(i)}
                className={`flex w-full items-baseline gap-2 rounded-lg px-2 py-1 text-left transition ${activa === i ? "bg-oro/15" : "hover:bg-white/5"}`}
              >
                <span className="font-semibold tabular-nums text-oro" style={{ color: color?.(m) }}>{i + 1}.</span>
                <span className="min-w-0">
                  <span className="text-texto first-letter:uppercase">{m.nombre}</span>
                  {extra?.(m)}
                  {m.sentido && <span className="text-texto-suave"> · {m.sentido}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
