"use client";

import { useId, useState } from "react";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { calcularValor, esEscrituraArabe, limpiarEscritura, transliterar } from "@/lib/abjad/calculo";
import { TEXTOS_ABJAD } from "@/lib/abjad/textos";

/**
 * Un nombre y su grafía árabe: si se escribe en letras latinas, la grafía se rellena sola con la transcripción hasta
 * que la persona la corrige; debajo va el valor abjad provisional.
 */
function NombreYGrafia({
  etiqueta,
  ayuda,
  etiquetaGrafia,
  campo,
  campoGrafia,
  inicial = "",
  requerido = false,
}: {
  etiqueta: string;
  ayuda: string;
  etiquetaGrafia: string;
  campo: string;
  campoGrafia: string;
  inicial?: string;
  requerido?: boolean;
}) {
  const { idioma } = useT();
  const t = TEXTOS_ABJAD[idioma];
  const id = useId();
  const [nombre, setNombre] = useState(inicial);
  const [propia, setPropia] = useState<string | null>(null);
  const latino = nombre.trim() !== "" && !esEscrituraArabe(nombre);
  const automatica = latino ? transliterar(nombre, idioma) : limpiarEscritura(nombre);
  const grafia = propia ?? automatica;
  const valor = calcularValor(grafia);

  return (
    <div className="space-y-3">
      <div>
        <label className="etiqueta" htmlFor={`${id}-n`}>{etiqueta}</label>
        <input id={`${id}-n`} name={campo} className="campo" value={nombre} onChange={(e) => setNombre(e.target.value)} required={requerido} maxLength={80} autoComplete="off" />
        <p className="mt-1 text-xs text-texto-suave">{ayuda}</p>
      </div>
      {(latino || propia !== null) && (
        <div>
          <label className="etiqueta" htmlFor={`${id}-g`}>{etiquetaGrafia}</label>
          <input
            id={`${id}-g`}
            name={campoGrafia}
            className="campo font-display text-2xl"
            dir="rtl"
            lang="ar"
            value={grafia}
            onChange={(e) => setPropia(e.target.value)}
            maxLength={60}
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-texto-suave">
            {propia === null ? `${t.escrituraAuto} ` : ""}
            {t.escrituraAyuda}
          </p>
        </div>
      )}
      {!latino && propia === null && <input type="hidden" name={campoGrafia} value={automatica} />}
      {valor.total > 0 && (
        <p className="text-sm text-oro-suave" aria-live="polite">
          {plantilla(t.vistaPrevia, { n: valor.total })}
        </p>
      )}
    </div>
  );
}

/** También lo usa el yıldızname, donde el nombre de la madre es obligatorio y lleva su propia etiqueta. */
export function CamposAbjad({ nombreInicial, madre }: { nombreInicial: string; madre?: { etiqueta: string; ayuda: string } }) {
  const { idioma } = useT();
  const t = TEXTOS_ABJAD[idioma];
  return (
    <div className="space-y-6">
      <NombreYGrafia etiqueta={t.nombre} ayuda={t.nombreAyuda} etiquetaGrafia={t.escritura} campo="nombre" campoGrafia="escritura" inicial={nombreInicial} requerido />
      <div className="border-t border-borde pt-5">
        <NombreYGrafia etiqueta={madre?.etiqueta ?? t.madre} ayuda={madre?.ayuda ?? t.madreAyuda} etiquetaGrafia={t.escrituraMadre} campo="madre" campoGrafia="escritura_madre" requerido={Boolean(madre)} />
      </div>
    </div>
  );
}
