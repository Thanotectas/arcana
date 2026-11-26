"use client";

import { useState } from "react";
import { sonarCampanitas } from "@/lib/escuela/sonido";

const NUMEROS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

/** Los saberes como cartas boca abajo: se tocan para revelar su secreto. */
export function CartasSaber({ items }: { items: { titulo: string; texto: string }[] }) {
  const [vistas, setVistas] = useState<boolean[]>(() => items.map(() => false));
  const reveladas = vistas.filter(Boolean).length;
  const voltear = (i: number) => {
    if (!vistas[i]) sonarCampanitas(0.06);
    setVistas((v) => v.map((x, j) => (j === i ? !x : x)));
  };
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-texto-suave">
        {reveladas === items.length ? "Revelaste todos los secretos de hoy ✦" : `Toca cada carta para revelar su secreto · ${reveladas} de ${items.length}`}
      </p>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
        {items.map((it, i) => (
          <button key={it.titulo} type="button" onClick={() => voltear(i)} data-volteada={vistas[i]} aria-pressed={vistas[i]} className="escuela-carta text-start">
            <span className="escuela-carta-interior min-h-[9rem] sm:min-h-[12rem]">
              <span className="escuela-carta-frente flex flex-col items-center justify-center gap-2 rounded-2xl border border-oro/40 p-4 text-center shadow-[0_0_30px_rgba(139,108,246,.15)]">
                <span className="font-display text-4xl text-oro/70">{NUMEROS[i]}</span>
                <span className="font-display text-lg leading-tight">{it.titulo}</span>
                <span className="text-[11px] uppercase tracking-[0.25em] text-violeta-suave">Toca para revelar</span>
              </span>
              <span className="escuela-carta-dorso tarjeta flex flex-col gap-1.5 overflow-auto border-oro/50 p-4">
                <span className="font-display text-lg leading-tight text-oro-suave">{it.titulo}</span>
                <span className="text-sm leading-relaxed text-texto/90">{it.texto}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
