"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { accionGenerarSemana, type EstadoAdminRedes } from "@/lib/redes/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Botones para pedirle a Sibila los borradores de esta semana o de la próxima. */
export function FormularioGenerar({ semanaActual, proxima }: { semanaActual: boolean; proxima: boolean }) {
  const [estado, enviar] = useActionState<EstadoAdminRedes, FormData>(accionGenerarSemana, {});
  if (!semanaActual && !proxima && !estado.error && !estado.mensaje) return null;
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div className="flex flex-wrap gap-2">
        {semanaActual && (
          <BotonEnviar className="boton boton-primario" cargando="Sibila está escribiendo…">
            <Sparkles className="h-4 w-4" aria-hidden /> Generar lo que falta de esta semana
          </BotonEnviar>
        )}
        {proxima && (
          <button type="submit" name="semana" value="proxima" className="boton boton-secundario">
            Generar la próxima semana
          </button>
        )}
      </div>
    </form>
  );
}
