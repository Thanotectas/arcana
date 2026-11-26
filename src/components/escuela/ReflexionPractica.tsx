"use client";

import { useState } from "react";
import { Moon } from "lucide-react";

/** Al abrir la lección: ¿cómo te fue con la práctica entre lunas de ayer? Queda en el grimorio y Sibila lo lee al final. */
export function ReflexionPractica({ curso, leccion, titulo, pregunta, inicial }: { curso: string; leccion: number; titulo: string; pregunta: string; inicial: string }) {
  const [texto, setTexto] = useState(inicial);
  const [estado, setEstado] = useState<"" | "guardando" | "guardado" | "error">(inicial ? "guardado" : "");
  const guardar = async () => {
    setEstado("guardando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "nota", curso, leccion, paso: 90, texto }) }).catch(() => null);
    setEstado(r?.ok ? "guardado" : "error");
  };
  return (
    <section className="tarjeta space-y-3 border-violeta/40 p-6">
      <p className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-violeta-suave"><Moon className="h-4 w-4" aria-hidden />Antes de empezar · {titulo}</p>
      <p className="font-display text-2xl leading-snug">{pregunta}</p>
      <textarea rows={3} maxLength={3000} value={texto} onChange={(e) => { setTexto(e.target.value); if (estado === "guardado") setEstado(""); }} className="campo w-full" placeholder="Unas líneas bastan. Si no pudiste hacerla, cuéntalo también." />
      <div className="flex items-center gap-3">
        <button type="button" onClick={guardar} disabled={!texto.trim() || estado === "guardando"} className="boton boton-secundario">
          {estado === "guardando" ? "Guardando…" : "Guardar en mi grimorio"}
        </button>
        {estado === "guardado" && <span className="text-sm text-oro-suave">Guardado ✦</span>}
        {estado === "error" && <span className="text-sm text-red-300">No se pudo guardar.</span>}
      </div>
    </section>
  );
}
