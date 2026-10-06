"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { accionEnviarResumen, type EstadoResumen } from "@/lib/resumen/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Botón para mandar el resumen por correo ahora mismo. */
export function BotonResumen() {
  const [estado, enviar] = useActionState<EstadoResumen, FormData>(() => accionEnviarResumen(), {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-secundario" cargando="Enviando…">
        <Send className="h-4 w-4" aria-hidden /> Enviármelo por correo ahora
      </BotonEnviar>
    </form>
  );
}
