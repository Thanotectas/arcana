"use client";

import { useActionState } from "react";
import { RefreshCw } from "lucide-react";
import { accionActualizarMetricas, type EstadoAdminRedes } from "@/lib/redes/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Pide ya a Meta las cifras de lo publicado en los últimos 14 días. */
export function BotonMetricas() {
  const [estado, enviar] = useActionState<EstadoAdminRedes, FormData>(accionActualizarMetricas, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-fantasma text-sm" cargando="Consultando a Meta…">
        <RefreshCw className="h-4 w-4" aria-hidden /> Actualizar cifras ahora
      </BotonEnviar>
    </form>
  );
}
