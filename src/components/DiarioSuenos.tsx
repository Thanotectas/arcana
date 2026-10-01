"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionSuenos, type EstadoAccion } from "@/lib/lecturas/acciones";
import { EMOCIONES, SUENO_MAX, SUENO_MIN, type Emocion } from "@/lib/suenos";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { plantilla } from "@/lib/i18n/formato";

const ICONO_EMOCION: Record<Emocion, string> = { paz: "☽", alegria: "☀", miedo: "⚡", angustia: "〰", tristeza: "☂", confusion: "?", nostalgia: "⌛", deseo: "♡" };

/** Formulario del diario de sueños: el relato, cómo despertó, si se repite y cuándo. */
export function DiarioSuenos() {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionSuenos, {});
  const [texto, setTexto] = useState("");
  const [emocion, setEmocion] = useState<Emocion | "">("");
  const hoy = new Date().toISOString().slice(0, 10);
  const sinCreditos = estado.error === "SIN_CREDITOS";
  const emociones = t.suenos.emociones as Record<Emocion, string>;
  const faltan = Math.max(0, SUENO_MIN - texto.trim().length);

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <div>
        <label className="etiqueta" htmlFor="texto">{t.suenos.cuentalo}</label>
        <textarea
          id="texto"
          name="texto"
          required
          minLength={SUENO_MIN}
          maxLength={SUENO_MAX}
          rows={7}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={t.suenos.ejemplo}
          className="campo min-h-40 w-full resize-y"
        />
        <p className="mt-1 text-right text-xs text-texto-suave">
          {faltan > 0 ? plantilla(t.suenos.faltan, { n: faltan }) : `${texto.length} / ${SUENO_MAX}`}
        </p>
      </div>

      <fieldset>
        <legend className="etiqueta">{t.suenos.alDespertar}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {EMOCIONES.map((e) => {
            const activa = emocion === e;
            return (
              <button
                key={e}
                type="button"
                onClick={() => setEmocion(activa ? "" : e)}
                aria-pressed={activa}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${activa ? "border-oro/70 bg-oro/15 text-oro-suave" : "border-borde text-texto-suave hover:border-oro/40 hover:text-texto"}`}
              >
                <span aria-hidden className="mr-1">{ICONO_EMOCION[e]}</span>
                {emociones[e]}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="emocion" value={emocion} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-texto-suave">
          <input type="checkbox" name="recurrente" className="h-4 w-4 accent-oro" />
          {t.suenos.esRecurrente}
        </label>
        <div>
          <label className="etiqueta" htmlFor="fecha">{t.suenos.cuando}</label>
          <input id="fecha" name="fecha" type="date" defaultValue={hoy} max={hoy} className="campo w-full" />
        </div>
      </div>

      <BotonEnviar className="boton boton-primario w-full" cargando={t.suenos.leyendo}>{t.suenos.interpretar}</BotonEnviar>
    </form>
  );
}
