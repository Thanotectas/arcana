"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionVelas, type EstadoAccion } from "@/lib/lecturas/acciones";
import { CapturaPalma } from "./CapturaPalma";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { COLORES, FICHA_INTENCION, INTENCIONES, SENALES, TONO_COLOR, type ColorVela, type Intencion, type Senal } from "@/lib/velas";

/** Lectura de los restos: intención, color, señales observadas, pregunta y foto. */
export function FormularioVelas() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionVelas, {});
  const [intencion, setIntencion] = useState<Intencion>("amor");
  const [color, setColor] = useState<ColorVela>(FICHA_INTENCION.amor.color);
  const [senales, setSenales] = useState<Senal[]>([]);
  const [pregunta, setPregunta] = useState("");
  const intenciones = t.velas.intenciones as Record<Intencion, { nombre: string }>;
  const colores = t.velas.colores as Record<ColorVela, { nombre: string }>;
  const nombresSenales = t.velas.senales as Record<Senal, string>;

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="intencion">{t.velas.queIntencion}</label>
          <select
            id="intencion"
            name="intencion"
            className="campo"
            value={intencion}
            onChange={(e) => {
              const i = e.target.value as Intencion;
              setIntencion(i);
              setColor(FICHA_INTENCION[i].color);
            }}
          >
            {INTENCIONES.map((i) => (
              <option key={i} value={i}>{intenciones[i].nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="etiqueta">{t.velas.queColor}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            <input type="hidden" name="color" value={color} />
            {COLORES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={color === c}
                aria-label={colores[c].nombre}
                title={colores[c].nombre}
                onClick={() => setColor(c)}
                className={`h-8 w-8 rounded-full border-2 transition ${color === c ? "scale-110 border-oro" : "border-white/15 hover:border-white/50"}`}
                style={{ background: TONO_COLOR[c] }}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-texto-suave">{colores[color].nombre}</p>
        </div>
      </div>

      <fieldset>
        <legend className="etiqueta">{t.velas.quePaso}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {SENALES.map((s) => {
            const activa = senales.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={activa}
                onClick={() => setSenales((prev) => (activa ? prev.filter((x) => x !== s) : [...prev, s]))}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${activa ? "border-oro/70 bg-oro/15 text-oro-suave" : "border-borde text-texto-suave hover:border-oro/40 hover:text-texto"}`}
              >
                {nombresSenales[s]}
              </button>
            );
          })}
        </div>
        {senales.map((s) => (
          <input key={s} type="hidden" name="senal" value={s} />
        ))}
      </fieldset>

      <CapturaPalma variante="vela" />

      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.velas.pregunta}</label>
        <textarea id="pregunta" name="pregunta" rows={2} maxLength={300} className="campo" value={pregunta} onChange={(e) => setPregunta(e.target.value)} />
        <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
      </div>

      <BotonEnviar cargando={t.velas.subiendo}>{t.velas.leer}</BotonEnviar>
    </form>
  );
}
