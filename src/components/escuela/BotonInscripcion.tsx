"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** Inscribirse al curso (cobra en créditos). Sin sesión, lleva a registrarse; sin créditos, a comprarlos. */
export function BotonInscripcion({ curso, texto, conSesion }: { curso: string; texto: string; conSesion: boolean }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"" | "enviando" | "sin_creditos" | "error">("");
  if (!conSesion) return <Link href="/registro" className="boton boton-primario">{texto}</Link>;

  const inscribirme = async () => {
    setEstado("enviando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "inscribir", curso }) }).catch(() => null);
    const datos = (await r?.json().catch(() => null)) as { ok?: boolean; estado?: string } | null;
    if (datos?.ok) return router.refresh();
    setEstado(datos?.estado === "sin_creditos" ? "sin_creditos" : "error");
  };

  return (
    <div className="space-y-2">
      <button type="button" onClick={inscribirme} disabled={estado === "enviando"} className="boton boton-primario">
        {estado === "enviando" ? "Inscribiendo…" : texto}
      </button>
      {estado === "sin_creditos" && (
        <p className="text-sm text-texto-suave">
          Te faltan créditos. <Link href="/creditos" className="text-oro-suave underline">Recarga aquí</Link> y vuelve a inscribirte.
        </p>
      )}
      {estado === "error" && <p className="text-sm text-red-300">No se pudo inscribir. Intenta de nuevo; no se cobró nada.</p>}
    </div>
  );
}
