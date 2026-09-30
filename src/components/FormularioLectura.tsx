"use client";

import { useActionState } from "react";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import type { EstadoAccion } from "@/lib/lecturas/acciones";
import Link from "next/link";

type Accion = (prev: EstadoAccion, fd: FormData) => Promise<EstadoAccion>;

/** Envuelve cualquier formulario de lectura: maneja errores y estado de envío. */
export function FormularioLectura({
  accion,
  children,
  textoBoton,
  textoCargando = "Consultando…",
}: {
  accion: Accion;
  children: React.ReactNode;
  textoBoton: string;
  textoCargando?: string;
}) {
  const [estado, enviar] = useActionState(accion, {});
  const sinCreditos = estado.error?.includes("créditos");
  return (
    <form action={enviar} className="space-y-5">
      {estado.error && (
        <Aviso>
          {estado.error}{" "}
          {sinCreditos && (
            <Link href="/creditos" className="underline">Comprar créditos</Link>
          )}
        </Aviso>
      )}
      {children}
      <BotonEnviar cargando={textoCargando}>{textoBoton}</BotonEnviar>
    </form>
  );
}
