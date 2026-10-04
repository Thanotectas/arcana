"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionTabaco, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

/** Lectura del tabaco: foto del puro, pregunta opcional y confirmación de mayoría de edad. */
export function FormularioTabaco() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionTabaco, {});
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

      <ol className="grid gap-3 text-sm text-texto-suave sm:grid-cols-3">
        {(t.tabaco.pasos as readonly string[]).map((p, i) => (
          <li key={i} className="rounded-xl border border-borde bg-white/[0.02] p-3">
            <span className="font-display text-lg text-oro">{i + 1}</span>
            <p className="mt-1">{p}</p>
          </li>
        ))}
      </ol>

      <CapturaPalma variante="tabaco" />

      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.tabaco.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-borde p-3 text-sm text-texto-suave">
        <input type="checkbox" name="mayor" className="mt-0.5 h-4 w-4 accent-[var(--oro)]" />
        <span>{t.tabaco.mayor}</span>
      </label>

      <BotonEnviar cargando={t.tabaco.subiendo}>{t.tabaco.leer}</BotonEnviar>
    </form>
  );
}
