"use client";

import { useActionState } from "react";
import { Volume2 } from "lucide-react";
import { accionProbarVoz, type EstadoReel } from "@/lib/redes/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Oír la voz de Sibila con una frase corta; si ElevenLabs falla, muestra su error. */
export function ProbarVoz() {
  const [estado, probar] = useActionState<EstadoReel, FormData>(() => accionProbarVoz(), {});
  return (
    <div className="space-y-2">
      <form action={probar}>
        <BotonEnviar className="boton boton-fantasma text-sm" cargando="Generando la voz…">
          <Volume2 className="h-4 w-4" aria-hidden /> Probar la voz
        </BotonEnviar>
      </form>
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.url && <audio src={estado.url} controls autoPlay className="w-full max-w-sm" />}
    </div>
  );
}
