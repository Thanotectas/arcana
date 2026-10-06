"use client";

import { useActionState } from "react";
import { accionRegistrarNumero, type EstadoRegistro } from "@/lib/whatsapp/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Formulario para registrar el número en la API de la nube con un PIN. */
export function RegistroWhatsapp() {
  const [estado, enviar] = useActionState<EstadoRegistro, FormData>(accionRegistrarNumero, {});
  return (
    <form action={enviar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="text-texto-suave">PIN de seis dígitos (verificación en dos pasos)</span>
          <input name="pin" inputMode="numeric" pattern="\d{6}" maxLength={6} required className="campo mt-1 w-40" placeholder="123456" />
        </label>
        <BotonEnviar className="boton boton-primario" cargando="Registrando…">Registrar número</BotonEnviar>
      </div>
      <p className="text-xs text-texto-suave">Si el número tenía verificación en dos pasos en la app del celular, usa ese mismo PIN. Si no, inventa uno y guárdalo.</p>
    </form>
  );
}
