"use client";

import { useActionState } from "react";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { CampoLugar } from "./CampoLugar";
import { CampoHora } from "./CampoHoraDesconocida";
import type { EstadoAuth } from "@/lib/auth/acciones";
import type { Lugar } from "@/lib/astro/geocodificar";
import { useT } from "@/lib/i18n/cliente";

type Accion = (prev: EstadoAuth, fd: FormData) => Promise<EstadoAuth>;

/** Datos de nacimiento en Mi cuenta: alimentan el cielo diario y precargan la carta astral. */
export function FormularioNacimiento({
  accion,
  fecha,
  hora,
  lugar,
}: {
  accion: Accion;
  fecha: string;
  /** "HH:MM", o null si la persona indicó que no la conoce. */
  hora: string | null | undefined;
  lugar: Lugar | null;
}) {
  const [estado, enviar] = useActionState(accion, {});
  const { t } = useT();
  const textos = t.auth.errores as Record<string, string>;
  return (
    <form action={enviar} className="space-y-4">
      {estado.error && <Aviso>{textos[estado.error] ?? estado.error}</Aviso>}
      {estado.mensaje && <Aviso tipo="exito">{textos[estado.mensaje] ?? estado.mensaje}</Aviso>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="fecha">{t.astral.fecha}</label>
          <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={fecha} />
        </div>
        <CampoHora valorInicial={hora} />
      </div>
      <CampoLugar valorInicial={lugar} />
      <BotonEnviar>{t.cuenta.nacimiento.guardar}</BotonEnviar>
    </form>
  );
}
