"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { accionPendulo, type EstadoAccion } from "@/lib/lecturas/acciones";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { Pendulo } from "./Pendulo";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

/** Pregunta de sí o no; mientras se envía, el péndulo busca la respuesta. */
export function FormularioPendulo() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionPendulo, {});
  const [pregunta, setPregunta] = useState("");
  return (
    <form action={enviar} className="space-y-5">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {estado.error === "SIN_CREDITOS" && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}
      <PenduloSegunEstado />
      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.pendulo.pregunta}</label>
        <input id="pregunta" name="pregunta" maxLength={200} className="campo" placeholder={t.pendulo.placeholder} value={pregunta} onChange={(e) => setPregunta(e.target.value)} required minLength={5} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 200))} /></div>
        <p className="mt-2 text-xs text-texto-suave">{t.pendulo.consejo}</p>
      </div>
      <BotonEnviar cargando={t.pendulo.cargando}>{t.pendulo.preguntar}</BotonEnviar>
    </form>
  );
}

function PenduloSegunEstado() {
  const { pending } = useFormStatus();
  return <Pendulo movimiento={pending ? "buscando" : "esperando"} className="mx-auto h-56 w-48" />;
}
