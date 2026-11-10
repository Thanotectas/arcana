"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";
import { accionConsultarSeguidores, type EstadoHub } from "@/lib/redes/hub-acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Pregunta ya a cada red cuántos seguidores tiene, sin esperar al cron de la mañana. */
export function BotonSeguidores() {
  const [estado, enviar] = useActionState<EstadoHub, FormData>(accionConsultarSeguidores, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Consultando…">
        <RefreshCw className="h-4 w-4" aria-hidden /> Consultar seguidores ahora
      </BotonEnviar>
    </form>
  );
}
