"use client";

import { useActionState } from "react";
import { accionResolverRetiro, type EstadoRetiroAdmin } from "@/lib/embajadores-admin";
import { Aviso } from "@/components/Aviso";

/** Botones para marcar un retiro como pagado o rechazado. */
export function ResolverRetiro({ id }: { id: number }) {
  const [estado, resolver] = useActionState<EstadoRetiroAdmin, FormData>(accionResolverRetiro, {});
  if (estado.mensaje) return <Aviso tipo="exito">{estado.mensaje}</Aviso>;
  return (
    <form action={resolver} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      {estado.error && <Aviso>{estado.error}</Aviso>}
      <input name="nota" placeholder="Nota para el embajador (opcional)" maxLength={300} className="campo w-full text-sm" />
      <div className="flex gap-2">
        <button type="submit" name="decision" value="pagado" className="boton boton-primario">Ya lo pagué</button>
        <button type="submit" name="decision" value="rechazado" className="boton boton-secundario text-peligro">Rechazar</button>
      </div>
    </form>
  );
}
