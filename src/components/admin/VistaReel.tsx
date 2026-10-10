"use client";

import { useActionState } from "react";
import { Clapperboard } from "lucide-react";
import { accionVistaReel, type EstadoReel } from "@/lib/redes/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Vista previa del reel de la carta del día (se genera en ~30 s y se guarda para la publicación). */
export function VistaReel() {
  const [estado, generar] = useActionState<EstadoReel, FormData>(accionVistaReel, {});
  return (
    <div className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <form action={generar} className="flex flex-wrap gap-2">
        <BotonEnviar className="boton boton-secundario" cargando="Generando el reel…">
          <Clapperboard className="h-4 w-4" aria-hidden /> Ver el reel de hoy
        </BotonEnviar>
        {estado.url && (
          <button type="submit" name="regenerar" value="1" className="boton boton-fantasma text-sm">Volver a generarlo</button>
        )}
      </form>
      {estado.url && (
        <video src={estado.url} controls playsInline className="w-full max-w-[300px] rounded-xl border border-borde" />
      )}
    </div>
  );
}
