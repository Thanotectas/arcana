"use client";

import { useState } from "react";
import { calcularWeton, fechaValida } from "@/lib/weton/calculo";

/** Fecha de nacimiento y casilla del atardecer; al escribir la fecha aparece el weton (cálculo local, sin coste). */
export function CamposWeton({
  prefijo = "",
  fechaInicial,
  atardecerInicial,
  textos,
}: {
  /** "_a", "_b"… para los formularios de dos personas. */
  prefijo?: string;
  fechaInicial: string;
  atardecerInicial: boolean;
  textos: { fecha: string; atardecer: string; atardecerAyuda: string; neptu: string; wuku: string };
}) {
  const [fecha, setFecha] = useState(fechaInicial);
  const [atardecer, setAtardecer] = useState(atardecerInicial);
  const r = fechaValida(fecha) && Number(fecha.slice(0, 4)) >= 1900 ? calcularWeton(fecha, atardecer) : null;
  return (
    <div className="space-y-3">
      <div>
        <label className="etiqueta" htmlFor={`fecha${prefijo}`}>{textos.fecha}</label>
        <input id={`fecha${prefijo}`} name={`fecha${prefijo}`} type="date" className="campo" min="1900-01-01" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name={`atardecer${prefijo}`} checked={atardecer} onChange={(e) => setAtardecer(e.target.checked)} className="mt-1 accent-[var(--oro)]" />
        <span>
          {textos.atardecer}
          <span className="block text-xs text-texto-suave">{textos.atardecerAyuda}</span>
        </span>
      </label>
      {r && (
        <p className="rounded-xl border border-borde bg-white/[0.02] px-3 py-2 text-sm" aria-live="polite">
          <span className="font-display text-xl font-semibold text-oro">{r.weton}</span>
          <span className="text-texto-suave"> · {textos.neptu} {r.neptu} · {textos.wuku} {r.wuku.nombre}</span>
        </p>
      )}
    </div>
  );
}
