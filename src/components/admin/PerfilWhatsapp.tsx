"use client";

import { useActionState } from "react";
import { Sparkles } from "lucide-react";
import { accionAplicarPerfil, type EstadoRegistro } from "@/lib/whatsapp/acciones";
import { BotonEnviar } from "@/components/BotonEnviar";
import { Aviso } from "@/components/Aviso";

/** Botón que aplica el perfil de empresa definido en src/lib/whatsapp/perfil.ts. */
export function PerfilWhatsapp() {
  const [estado, aplicar] = useActionState<EstadoRegistro, FormData>(() => accionAplicarPerfil(), {});
  return (
    <form action={aplicar} className="space-y-3">
      {estado.error && <Aviso>{estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <BotonEnviar className="boton boton-primario" cargando="Aplicando…">
        <Sparkles className="h-4 w-4" aria-hidden /> Aplicar perfil de Arcana
      </BotonEnviar>
    </form>
  );
}
