"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionQuiromancia, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";

export function FormularioQuiromancia() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionQuiromancia, {});
  const [dominante, setDominante] = useState<"derecha" | "izquierda">("derecha");
  const [mano, setMano] = useState<"derecha" | "izquierda">("derecha");

  const mensajeError = (() => {
    switch (estado.error) {
      case "FOTO_FALTA": return t.quiromancia.errores.foto;
      case "FOTO_FORMATO": return t.quiromancia.errores.formato;
      case "FOTO_TAMANO": return t.quiromancia.errores.tamano;
      case "FOTO_SUBIR": return t.quiromancia.errores.subir;
      case "SIN_CREDITOS": return t.comun.sinCreditos;
      default: return estado.error;
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="etiqueta">{t.quiromancia.manoDominante}</p>
          <OpcionesMano valor={dominante} alCambiar={setDominante} nombre="dominante" />
        </div>
        <div>
          <p className="etiqueta">{t.quiromancia.queMano}</p>
          <OpcionesMano valor={mano} alCambiar={setMano} nombre="mano" />
        </div>
      </div>

      <CapturaPalma mano={mano} />

      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.quiromancia.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" />
      </div>

      <p className="text-xs text-texto-suave">{t.quiromancia.consejo}</p>
      <BotonEnviar cargando={t.quiromancia.subiendo}>{t.quiromancia.leer}</BotonEnviar>
    </form>
  );
}

function OpcionesMano({
  valor,
  alCambiar,
  nombre,
}: {
  valor: "derecha" | "izquierda";
  alCambiar: (v: "derecha" | "izquierda") => void;
  nombre: string;
}) {
  const { t } = useT();
  return (
    <div className="flex gap-2" role="radiogroup">
      <input type="hidden" name={nombre} value={valor} />
      {(["izquierda", "derecha"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={valor === v}
          onClick={() => alCambiar(v)}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${valor === v ? "border-oro/60 bg-oro/10 text-oro-suave" : "border-borde text-texto-suave hover:text-texto"}`}
        >
          {v === "izquierda" ? "🤚 " : "🖐 "}
          {v === "izquierda" ? t.quiromancia.izquierda : t.quiromancia.derecha}
        </button>
      ))}
    </div>
  );
}
