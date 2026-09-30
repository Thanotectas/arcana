"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import type { EstadoAccion } from "@/lib/lecturas/acciones";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

type Accion = (prev: EstadoAccion, fd: FormData) => Promise<EstadoAccion>;

/** Envuelve cualquier formulario de lectura: maneja errores y estado de envío. */
export function FormularioLectura({
  accion,
  children,
  textoBoton,
  textoCargando,
}: {
  accion: Accion;
  children: React.ReactNode;
  textoBoton: string;
  textoCargando?: string;
}) {
  const { t } = useT();
  const [estado, enviar] = useActionState(accion, {});
  const sinCreditos = estado.error === "SIN_CREDITOS";
  return (
    <form action={enviar} className="space-y-5">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)}{" "}
          {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}
      {children}
      <BotonEnviar cargando={textoCargando ?? t.comun.unMomento}>{textoBoton}</BotonEnviar>
    </form>
  );
}
