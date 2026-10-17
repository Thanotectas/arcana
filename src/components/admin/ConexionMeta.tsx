"use client";

import { useActionState } from "react";
import { Link2 } from "lucide-react";
import { accionSuscribirMeta, type EstadoAdminRedes } from "@/lib/redes/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Suscribe la página de Facebook (y su Instagram) a los avisos de comentarios y mensajes. */
export function ConexionMeta({ suscrita }: { suscrita: boolean }) {
  const [estado, enviar] = useActionState<EstadoAdminRedes, FormData>(accionSuscribirMeta, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-secundario" cargando="Conectando…">
        <Link2 className="h-4 w-4" aria-hidden /> {suscrita ? "Volver a conectar los avisos" : "Conectar los avisos de la página"}
      </BotonEnviar>
    </form>
  );
}
