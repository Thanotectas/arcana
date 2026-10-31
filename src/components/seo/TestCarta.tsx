"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PREGUNTAS, cartaDelTest } from "@/lib/seo/test-carta";

/** Las 6 preguntas del test, una por pantalla. Al terminar lleva a la página del resultado. */
export function TestCarta({ invitacion }: { invitacion?: string | null }) {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [revelando, setRevelando] = useState(false);
  const i = respuestas.length;
  const pregunta = PREGUNTAS[i];

  function elegir(op: number) {
    const nuevas = [...respuestas, op];
    setRespuestas(nuevas);
    if (nuevas.length === PREGUNTAS.length) {
      setRevelando(true);
      const carta = cartaDelTest(nuevas);
      const q = new URLSearchParams({ mia: "1" });
      if (invitacion) q.set("inv", invitacion);
      setTimeout(() => router.push(`/que-carta-eres/${carta}?${q}`), 1600);
    }
  }

  if (revelando || !pregunta) {
    return (
      <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
        <img src="/cartas/arcana/dorso.webp" alt="" className="w-32 animate-pulse rounded-xl border border-oro/50" />
        <p className="font-display text-2xl">Las cartas están eligiendo la tuya…</p>
      </div>
    );
  }

  return (
    <div className="tarjeta space-y-5 p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-texto-suave">
        <span>Pregunta {i + 1} de {PREGUNTAS.length}</span>
        {i > 0 && (
          <button type="button" onClick={() => setRespuestas(respuestas.slice(0, -1))} className="hover:text-texto">← Atrás</button>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-borde">
        <div className="h-full rounded-full bg-oro transition-all" style={{ width: `${(i / PREGUNTAS.length) * 100}%` }} />
      </div>
      <h2 className="font-display text-3xl">{pregunta.texto}</h2>
      <div className="grid gap-3">
        {pregunta.opciones.map((o, j) => (
          <button
            key={o.texto}
            type="button"
            onClick={() => elegir(j)}
            className="rounded-2xl border border-borde px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-oro/60 hover:bg-oro/5"
          >
            {o.texto}
          </button>
        ))}
      </div>
    </div>
  );
}
