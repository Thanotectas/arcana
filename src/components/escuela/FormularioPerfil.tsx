"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface OpcionVela {
  valor: string;
  nombre: string;
  tono: string;
}

/**
 * «Antes de empezar»: cómo quiere que Sibila la llame, qué quiere cerrar este año y qué quiere encender en el que
 * viene. La zona horaria sale del navegador (la Luna y los días de su vela se calculan en su hora).
 */
export function FormularioPerfil({ curso, opciones, inicial }: { curso: string; opciones: OpcionVela[]; inicial?: { nombre: string; intencionCierre: string; intencionVela: string | null } }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(inicial?.nombre ?? "");
  const [cierre, setCierre] = useState(inicial?.intencionCierre ?? "");
  const [vela, setVela] = useState<string | null>(inicial?.intencionVela ?? null);
  const [estado, setEstado] = useState<"" | "enviando" | "error">("");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    const zona = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const r = await fetch("/api/escuela", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "perfil", curso, nombre, intencionCierre: cierre, intencionVela: vela, zona }),
    }).catch(() => null);
    if (r?.ok) return router.refresh();
    setEstado("error");
  };

  return (
    <form onSubmit={enviar} className="tarjeta relative space-y-6 overflow-hidden border-oro/40 p-6 sm:p-8">
      <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="relative space-y-1 text-center">
        <Sparkles className="mx-auto h-6 w-6 text-oro" aria-hidden />
        <h2 className="font-display text-3xl sm:text-4xl">Antes de empezar</h2>
        <p className="text-sm text-texto-suave">Cuéntame un poco de ti: así cada lección te habla a ti, con tu Luna y tu vela.</p>
      </div>
      <label className="relative block space-y-2">
        <span className="font-display text-xl">¿Cómo quieres que te llame?</span>
        <input required maxLength={40} value={nombre} onChange={(e) => setNombre(e.target.value)} className="campo w-full" placeholder="Tu nombre" autoComplete="given-name" />
      </label>
      <label className="relative block space-y-2">
        <span className="font-display text-xl">¿Qué quieres cerrar de este año?</span>
        <textarea rows={3} maxLength={600} value={cierre} onChange={(e) => setCierre(e.target.value)} className="campo w-full" placeholder="Un miedo, una etapa, un cansancio, algo que ya terminó…" />
        <span className="block text-xs text-texto-suave">Solo lo leemos Sibila y tú. Lo usaré en tus lecciones y en tu carta de cierre.</span>
      </label>
      <fieldset className="relative space-y-3">
        <legend className="font-display text-xl">¿Qué quieres encender para el año que viene?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {opciones.map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => setVela(o.valor)}
              aria-pressed={vela === o.valor}
              className={`flex items-center gap-3 rounded-xl border p-3 text-start text-sm transition ${vela === o.valor ? "border-oro/70 bg-oro/10" : "border-borde hover:border-oro/30"}`}
            >
              <span className="h-6 w-6 shrink-0 rounded-full border border-white/20" style={{ background: o.tono, boxShadow: vela === o.valor ? `0 0 14px ${o.tono}` : undefined }} aria-hidden />
              {o.nombre}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="relative text-center">
        <button type="submit" disabled={estado === "enviando" || !nombre.trim()} className="boton boton-primario">
          {estado === "enviando" ? "Preparando tu camino…" : "Empezar mi camino"}
        </button>
        {estado === "error" && <p className="mt-2 text-sm text-red-300">No se pudo guardar. Intenta de nuevo.</p>}
      </div>
    </form>
  );
}
