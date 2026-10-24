"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionCafe, accionHuevo, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

/** Lectura del café o limpia con huevo: pasos, foto y pregunta opcional. */
export function FormularioFotoOraculo({ tipo }: { tipo: "cafe" | "huevo" }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(tipo === "cafe" ? accionCafe : accionHuevo, {});
  const [pregunta, setPregunta] = useState("");
  const textos = t[tipo];

  const mensajeError = (() => {
    switch (estado.error) {
      case "FOTO_FORMATO": return t.quiromancia.errores.formato;
      case "FOTO_TAMANO": return t.quiromancia.errores.tamano;
      case "FOTO_SUBIR": return t.quiromancia.errores.subir;
      default: return textoErrorLectura(estado.error, t);
    }
  })();

  return (
    <form action={enviar} className="space-y-6">
      {mensajeError && (
        <Aviso>
          {mensajeError} {estado.error === "SIN_CREDITOS" && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <ol className="grid gap-3 text-sm text-texto-suave sm:grid-cols-3">
        {(textos.pasos as readonly string[]).map((p, i) => (
          <li key={i} className="rounded-xl border border-borde bg-white/[0.02] p-3">
            <span className="font-display text-lg text-oro">{i + 1}</span>
            <p className="mt-1">{p}</p>
          </li>
        ))}
      </ol>

      <CapturaPalma variante={tipo} />

      <div>
        <label className="etiqueta" htmlFor="pregunta">{textos.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
      </div>

      <BotonEnviar cargando={textos.subiendo}>{textos.leer}</BotonEnviar>
    </form>
  );
}
