"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { accionAutomatica, type EstadoAdminRedes } from "@/lib/redes/acciones";
import { Aviso } from "@/components/Aviso";

function Boton({ valor, children }: { valor: string; children: React.ReactNode }) {
  const { pending, data } = useFormStatus();
  const activo = pending && data?.get("cual") === valor;
  return (
    <button type="submit" name="cual" value={valor} disabled={pending} className="boton boton-secundario text-sm" aria-busy={activo}>
      {activo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

/** Lanzar a mano la carta de hoy, la historia, el carrusel de la semana o el kit de TikTok. */
export function BotonesAutomaticas() {
  const [estado, enviar] = useActionState<EstadoAdminRedes, FormData>(accionAutomatica, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div className="flex flex-wrap gap-2">
        <Boton valor="carta">Publicar la carta de hoy</Boton>
        <Boton valor="historia">Publicar la historia de hoy</Boton>
        <Boton valor="carrusel">Publicar el carrusel de la semana</Boton>
        <Boton valor="kit">Enviarme el kit de TikTok de hoy</Boton>
        <Boton valor="canal">Enviarme el kit del canal de WhatsApp</Boton>
      </div>
    </form>
  );
}
