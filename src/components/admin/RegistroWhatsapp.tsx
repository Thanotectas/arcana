"use client";

import { useActionState } from "react";
import { accionPedirCodigo, accionRegistrarNumero, accionVerificarCodigo, type EstadoRegistro } from "@/lib/whatsapp/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Registro del número en la API de la nube: registrar con PIN y, si hace falta, volver a verificar el número. */
export function RegistroWhatsapp({ verificado }: { verificado: boolean }) {
  const [registro, registrar] = useActionState<EstadoRegistro, FormData>(accionRegistrarNumero, {});
  const [pedido, pedir] = useActionState<EstadoRegistro, FormData>(accionPedirCodigo, {});
  const [verificacion, verificar] = useActionState<EstadoRegistro, FormData>(accionVerificarCodigo, {});
  return (
    <div className="space-y-6">
      <form action={registrar} className="space-y-3">
        <h3 className="font-semibold">1. Registrar con PIN</h3>
        {registro.error && <Aviso>{registro.error}</Aviso>}
        {registro.mensaje && <Aviso tipo="exito">{registro.mensaje}</Aviso>}
        <div className="flex flex-wrap items-end gap-3">
          <label className="block text-sm">
            <span className="text-texto-suave">PIN de seis dígitos (verificación en dos pasos)</span>
            <input name="pin" inputMode="numeric" pattern="\d{6}" maxLength={6} required className="campo mt-1 w-40" placeholder="123456" />
          </label>
          <BotonEnviar className="boton boton-primario" cargando="Registrando…">Registrar número</BotonEnviar>
        </div>
        <p className="text-xs text-texto-suave">Si el número tenía verificación en dos pasos en la app del celular, usa ese mismo PIN. Si no, inventa uno y guárdalo.</p>
      </form>

      <div className="space-y-3 border-t border-borde pt-4">
        <h3 className="font-semibold">2. Si el registro falla: volver a verificar el número {verificado ? <span className="text-xs text-exito">(hoy figura verificado)</span> : <span className="text-xs text-peligro">(hoy figura sin verificar)</span>}</h3>
        <form action={pedir} className="flex flex-wrap items-center gap-3">
          {pedido.error && <Aviso>{pedido.error}</Aviso>}
          {pedido.mensaje && <Aviso tipo="exito">{pedido.mensaje}</Aviso>}
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="metodo" value="SMS" defaultChecked className="accent-[var(--oro)]" /> SMS</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="metodo" value="VOICE" className="accent-[var(--oro)]" /> Llamada</label>
          <BotonEnviar className="boton boton-secundario" cargando="Pidiendo…">Pedir código</BotonEnviar>
        </form>
        <form action={verificar} className="flex flex-wrap items-end gap-3">
          {verificacion.error && <Aviso>{verificacion.error}</Aviso>}
          {verificacion.mensaje && <Aviso tipo="exito">{verificacion.mensaje}</Aviso>}
          <label className="block text-sm">
            <span className="text-texto-suave">Código recibido</span>
            <input name="codigo" inputMode="numeric" maxLength={7} required className="campo mt-1 w-40" placeholder="123-456" />
          </label>
          <BotonEnviar className="boton boton-secundario" cargando="Verificando…">Confirmar código</BotonEnviar>
        </form>
      </div>
    </div>
  );
}
