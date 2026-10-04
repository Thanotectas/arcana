"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionAura, type EstadoAccion } from "@/lib/lecturas/acciones";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { PREGUNTAS } from "@/lib/aura";

/** Test de aura: doce preguntas de cuatro opciones y un nombre opcional. */
export function FormularioAura({ nombreInicial = "" }: { nombreInicial?: string }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionAura, {});
  const [respuestas, setRespuestas] = useState<(number | null)[]>(() => Array.from({ length: PREGUNTAS }, () => null));
  const preguntas = t.aura.preguntas as readonly { texto: string; opciones: readonly string[] }[];
  const respondidas = respuestas.filter((r) => r !== null).length;
  const completo = respondidas === PREGUNTAS;
  const mensajeError = textoErrorLectura(estado.error, t);
  const sinCreditos = estado.error === "SIN_CREDITOS";

  return (
    <form action={enviar} className="space-y-8">
      {mensajeError && (
        <Aviso>
          {mensajeError} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <div>
        <label className="etiqueta" htmlFor="nombre">{t.aura.nombre}</label>
        <input id="nombre" name="nombre" className="campo" maxLength={80} defaultValue={nombreInicial} autoComplete="given-name" />
      </div>

      <div className="sticky top-16 z-10 -mx-2 rounded-xl bg-superficie/90 px-3 py-2 backdrop-blur">
        <div className="flex items-center justify-between text-xs text-texto-suave">
          <span>{t.aura.progreso.replace("{n}", String(respondidas)).replace("{total}", String(PREGUNTAS))}</span>
          <span className="font-display text-base text-oro-suave">{Math.round((respondidas / PREGUNTAS) * 100)}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-violeta to-oro transition-all" style={{ width: `${(respondidas / PREGUNTAS) * 100}%` }} />
        </div>
      </div>

      <ol className="space-y-7">
        {preguntas.map((p, i) => (
          <li key={i}>
            <fieldset>
              <legend className="mb-3 font-display text-xl">
                <span className="mr-2 text-oro">{i + 1}.</span>
                {p.texto}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
                {p.opciones.map((o, j) => {
                  const activa = respuestas[i] === j;
                  return (
                    <button
                      key={j}
                      type="button"
                      role="radio"
                      aria-checked={activa}
                      onClick={() => setRespuestas((prev) => prev.map((r, k) => (k === i ? j : r)))}
                      className={`rounded-xl border px-4 py-3 text-left text-sm transition ${activa ? "border-oro/70 bg-oro/15 text-oro-suave" : "border-borde bg-white/[0.02] text-texto-suave hover:border-oro/40 hover:text-texto"}`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {respuestas[i] !== null && <input type="hidden" name={`r${i}`} value={String(respuestas[i])} />}
            </fieldset>
          </li>
        ))}
      </ol>

      <div className="flex flex-wrap items-center gap-4">
        <BotonEnviar cargando={t.aura.calculando} className={`boton boton-primario ${completo ? "" : "pointer-events-none opacity-50"}`}>{t.aura.calcular}</BotonEnviar>
        {!completo && <p className="text-sm text-texto-suave">{t.aura.faltan.replace("{n}", String(PREGUNTAS - respondidas))}</p>}
      </div>
    </form>
  );
}
