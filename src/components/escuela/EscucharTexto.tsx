"use client";

import { useState } from "react";
import { Headphones } from "lucide-react";

/** «Escuchar la lección»: Sibila lee este texto (el audio se graba una vez para todas las personas). */
export function EscucharTexto({ curso, leccion, bloque }: { curso: string; leccion: number; bloque: number }) {
  const [audio, setAudio] = useState<string | null>(null);
  const [estado, setEstado] = useState<"" | "cargando" | "error">("");
  if (audio) return <audio controls autoPlay src={audio} className="w-full" />;
  const pedir = async () => {
    setEstado("cargando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "texto", curso, leccion, bloque }) }).catch(() => null);
    const d = (await r?.json().catch(() => null)) as { audio?: string | null } | null;
    if (d?.audio) setAudio(d.audio);
    else setEstado("error");
  };
  return (
    <div className="no-imprimir text-center">
      <button type="button" onClick={pedir} disabled={estado === "cargando"} className="inline-flex items-center gap-2 rounded-full border border-oro/40 px-4 py-2 text-sm text-oro-suave transition hover:border-oro hover:text-texto">
        <Headphones className="h-4 w-4" aria-hidden /> {estado === "cargando" ? "Sibila se prepara…" : "Escuchar la lección con la voz de Sibila"}
      </button>
      {estado === "error" && <p className="mt-1 text-xs text-texto-suave">Ahora no se pudo. Inténtalo en un rato.</p>}
    </div>
  );
}
