"use client";

import { useActionState } from "react";
import { Link2 } from "lucide-react";
import { accionConectarTelegram, type EstadoTelegram } from "@/lib/telegram/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Registra el webhook y los comandos del bot (se puede repetir sin problema). */
export function ConectarTelegram({ conectado }: { conectado: boolean }) {
  const [estado, enviar] = useActionState<EstadoTelegram, FormData>(() => accionConectarTelegram(), {});
  return (
    <form action={enviar} className="space-y-2">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className={`boton ${conectado ? "boton-fantasma" : "boton-primario"} text-sm`} cargando="Conectando…">
        <Link2 className="h-4 w-4" aria-hidden /> {conectado ? "Volver a conectar" : "Conectar el bot"}
      </BotonEnviar>
    </form>
  );
}
