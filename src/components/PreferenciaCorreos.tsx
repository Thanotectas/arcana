"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { accionCorreos, type EstadoAuth } from "@/lib/auth/acciones";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";

/** Casilla para recibir (o no) los correos de Sibila. */
export function PreferenciaCorreos({ activo }: { activo: boolean }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAuth, FormData>(accionCorreos, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{t.auth.errores.noGuardar}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{t.cuenta.correos.guardado}</Aviso>}
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" name="recibe" defaultChecked={activo} className="mt-0.5 h-4 w-4 accent-[var(--oro)]" />
        <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-oro" aria-hidden />{t.cuenta.correos.activar}</span>
      </label>
      <BotonEnviar className="boton boton-secundario">{t.cuenta.correos.guardar}</BotonEnviar>
    </form>
  );
}
