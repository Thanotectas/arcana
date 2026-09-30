"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function BotonEnviar({
  children,
  cargando = "Un momento…",
  className = "boton boton-primario",
}: {
  children: React.ReactNode;
  cargando?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          {cargando}
        </>
      ) : (
        children
      )}
    </button>
  );
}
