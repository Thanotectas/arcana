"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EscucharSibila } from "./EscucharSibila";

interface Campo {
  clave: string;
  etiqueta: string;
  ayuda: string;
}

/** El proyecto final: la persona diseña su propio ritual, campo por campo, y Sibila se lo revisa con su voz. */
export function ProyectoRitual({ curso, leccion, campos, iniciales, revision, audio }: { curso: string; leccion: number; campos: Campo[]; iniciales: Record<string, string>; revision: string | null; audio: string | null }) {
  const router = useRouter();
  const [valores, setValores] = useState<Record<string, string>>(iniciales);
  const [estado, setEstado] = useState<"" | "enviando" | "incompleto" | "error">("");
  const [comentario, setComentario] = useState<string | null>(revision);
  const llenos = campos.filter((c) => (valores[c.clave] ?? "").trim()).length;
  const minimo = Math.min(4, campos.length);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "proyecto", curso, leccion, campos: valores }) }).catch(() => null);
    const d = (await r?.json().catch(() => null)) as { ok?: boolean; comentario?: string | null; error?: string } | null;
    if (d?.ok) {
      setComentario(d.comentario ?? null);
      setEstado("");
      router.refresh();
      return;
    }
    setEstado(d?.error === "incompleto" ? "incompleto" : "error");
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {campos.map((c, i) => (
        <label key={c.clave} className="block space-y-1.5">
          <span className="font-display text-xl"><span className="text-oro-suave">{["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][i]}.</span> {c.etiqueta}</span>
          <span className="block text-xs text-texto-suave">{c.ayuda}</span>
          <textarea rows={3} maxLength={2000} value={valores[c.clave] ?? ""} onChange={(e) => setValores({ ...valores, [c.clave]: e.target.value })} className="campo w-full" />
        </label>
      ))}
      <button type="submit" disabled={llenos < minimo || estado === "enviando"} className="boton boton-primario">
        {estado === "enviando" ? "Sibila está leyendo tu ritual…" : comentario ? "Enviar mi ritual corregido" : "Enviar mi ritual a Sibila"}
      </button>
      {llenos < minimo && <p className="text-xs text-texto-suave">Completa al menos {minimo} partes para enviarlo.</p>}
      {estado === "incompleto" && <p className="text-sm text-red-300">Faltan partes por completar.</p>}
      {estado === "error" && <p className="text-sm text-red-300">No se pudo enviar. Intenta de nuevo.</p>}
      {comentario && (
        <div className="tarjeta border-oro/40 bg-oro/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Sibila revisa tu ritual</p>
          {comentario.split(/\n{2,}/).map((x, k) => (
            <p key={k} className="mt-2 leading-relaxed">{x}</p>
          ))}
          <EscucharSibila key={comentario} curso={curso} leccion={leccion} audioInicial={comentario === revision ? audio : null} />
        </div>
      )}
    </form>
  );
}
