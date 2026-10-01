"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionChocolate, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

export function FormularioChocolate() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionChocolate, {});
  const [pregunta, setPregunta] = useState("");

  const mensajeError = (() => {
    switch (estado.error) {
      case "FOTO_FORMATO": return t.quiromancia.errores.formato;
      case "FOTO_TAMANO": return t.quiromancia.errores.tamano;
      case "FOTO_SUBIR": return t.quiromancia.errores.subir;
      default: return textoErrorLectura(estado.error, t);
    }
  })();
  const sinCreditos = estado.error === "SIN_CREDITOS";

  return (
    <form action={enviar} className="space-y-6">
      {mensajeError && (
        <Aviso>
          {mensajeError} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <CapturaPalma variante="taza" />

      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.chocolate.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
      </div>

      <p className="text-xs text-texto-suave">{t.chocolate.consejo}</p>
      <BotonEnviar cargando={t.chocolate.subiendo}>{t.chocolate.leer}</BotonEnviar>
    </form>
  );
}
