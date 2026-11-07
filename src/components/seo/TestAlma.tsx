"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PREGUNTAS_ALMA, nivelDelTest } from "@/lib/seo/test-alma";

/** Las 7 preguntas del test de alma vieja, una por pantalla. */
export function TestAlma({ invitacion }: { invitacion?: string | null }) {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [revelando, setRevelando] = useState(false);
  const i = respuestas.length;
  const pregunta = PREGUNTAS_ALMA[i];

  function elegir(op: number) {
    const nuevas = [...respuestas, op];
    setRespuestas(nuevas);
    if (nuevas.length === PREGUNTAS_ALMA.length) {
      setRevelando(true);
      const q = new URLSearchParams({ mia: "1" });
      if (invitacion) q.set("inv", invitacion);
      setTimeout(() => router.push(`/alma-vieja/${nivelDelTest(nuevas)}?${q}`), 1600);
    }
  }

  if (revelando || !pregunta) {
    return (
      <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
        <p className="animate-pulse text-5xl text-oro">✦</p>
        <p className="font-display text-2xl">Sibila está leyendo la edad de tu alma…</p>
      </div>
    );
  }

  return (
    <div className="tarjeta space-y-5 p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-texto-suave">
        <span>Pregunta {i + 1} de {PREGUNTAS_ALMA.length}</span>
        {i > 0 && (
          <button type="button" onClick={() => setRespuestas(respuestas.slice(0, -1))} className="hover:text-texto">← Atrás</button>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-borde">
        <div className="h-full rounded-full bg-oro transition-all" style={{ width: `${(i / PREGUNTAS_ALMA.length) * 100}%` }} />
      </div>
      <h2 className="font-display text-3xl">{pregunta.texto}</h2>
      <div className="grid gap-3">
        {pregunta.opciones.map((o, j) => (
          <button key={o.texto} type="button" onClick={() => elegir(j)} className="rounded-2xl border border-borde px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-oro/60 hover:bg-oro/5">
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}
