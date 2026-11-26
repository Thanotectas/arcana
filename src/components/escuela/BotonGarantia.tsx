"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOTIVOS: Record<string, string> = {
  vencida: "El plazo de la garantía ya pasó.",
  avanzado: "La garantía aplica antes de completar la segunda lección.",
  garantia_usada: "Ya usaste la garantía de este curso.",
  sin_cobro: "Este curso no tuvo cobro, así que no hay nada que devolver.",
};

/** La garantía de la primera lección: con confirmación, devuelve los créditos y cierra la inscripción. */
export function BotonGarantia({ curso, hasta, devolucion }: { curso: string; hasta: string; devolucion: string }) {
  const router = useRouter();
  const [paso, setPaso] = useState<"" | "confirmar" | "enviando" | "hecho">("");
  const [mensaje, setMensaje] = useState("");
  const fecha = new Intl.DateTimeFormat("es", { day: "numeric", month: "long" }).format(new Date(hasta));

  const pedir = async () => {
    setPaso("enviando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "garantia", curso }) }).catch(() => null);
    const d = (await r?.json().catch(() => null)) as { ok?: boolean; creditos?: number; motivo?: string } | null;
    if (d?.ok) {
      setPaso("hecho");
      setMensaje(`Listo: te devolvimos ${d.creditos} créditos. Gracias por probar; aquí estaremos si quieres volver.`);
      setTimeout(() => router.refresh(), 2500);
      return;
    }
    setPaso("");
    setMensaje(MOTIVOS[d?.motivo ?? ""] ?? "No se pudo ahora. Inténtalo en un rato.");
  };

  return (
    <div className="no-imprimir space-y-2 text-center text-xs text-texto-suave">
      {paso === "" && (
        <p>
          ¿No es para ti? Tienes garantía hasta el {fecha}.{" "}
          <button type="button" onClick={() => setPaso("confirmar")} className="text-oro-suave underline">Pedir la devolución</button>
        </p>
      )}
      {paso === "confirmar" && (
        <div className="tarjeta mx-auto max-w-md space-y-3 p-4 text-sm">
          <p>{devolucion} Tu inscripción se cierra; lo que escribiste se guarda por si vuelves.</p>
          <div className="flex justify-center gap-3">
            <button type="button" onClick={() => setPaso("")} className="boton boton-secundario">Seguir en el curso</button>
            <button type="button" onClick={pedir} className="boton boton-primario">Sí, devolver</button>
          </div>
        </div>
      )}
      {paso === "enviando" && <p>Procesando…</p>}
      {mensaje && <p className="text-sm text-texto/90">{mensaje}</p>}
    </div>
  );
}
