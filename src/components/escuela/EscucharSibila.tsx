"use client";

import { useState } from "react";
import { Volume2 } from "lucide-react";

/** «Escuchar a Sibila»: pide el comentario en su voz (se narra la primera vez) y lo reproduce. */
export function EscucharSibila({ curso, leccion, audioInicial }: { curso: string; leccion: number; audioInicial: string | null }) {
  const [audio, setAudio] = useState<string | null>(audioInicial);
  const [estado, setEstado] = useState<"" | "cargando" | "error">("");

  if (audio) return <audio controls autoPlay={!audioInicial} src={audio} className="mt-3 w-full" />;

  const pedir = async () => {
    setEstado("cargando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "escuchar", curso, leccion }) }).catch(() => null);
    const datos = (await r?.json().catch(() => null)) as { audio?: string | null } | null;
    if (datos?.audio) {
      setAudio(datos.audio);
      setEstado("");
    } else setEstado("error");
  };

  return (
    <div className="mt-3">
      <button type="button" onClick={pedir} disabled={estado === "cargando"} className="boton boton-secundario inline-flex items-center gap-2">
        <Volume2 className="h-4 w-4" aria-hidden /> {estado === "cargando" ? "Sibila está grabando…" : "Escuchar a Sibila"}
      </button>
      {estado === "error" && <p className="mt-1 text-xs text-texto-suave">Ahora no se pudo grabar la voz. Inténtalo en un rato.</p>}
    </div>
  );
}
