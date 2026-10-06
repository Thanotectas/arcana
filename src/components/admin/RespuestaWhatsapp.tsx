"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { accionResponder, type EstadoRegistro } from "@/lib/whatsapp/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Caja para responder a mano desde el panel (texto libre dentro de las 24 horas). */
export function RespuestaWhatsapp({ telefono }: { telefono: string }) {
  const [estado, enviar] = useActionState<EstadoRegistro, FormData>(accionResponder, {});
  return (
    <form action={enviar} className="space-y-2 pt-3">
      <input type="hidden" name="telefono" value={telefono} />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <textarea name="texto" rows={2} maxLength={4000} required placeholder="Responder como el equipo de Arcana…" className="campo w-full" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-texto-suave">Se envía tal cual, sin pasar por Sibila. Sibila seguirá contestando los mensajes nuevos.</span>
        <BotonEnviar className="boton boton-secundario" cargando="Enviando…"><Send className="h-4 w-4" aria-hidden /> Enviar</BotonEnviar>
      </div>
    </form>
  );
}
