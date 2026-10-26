"use client";

import { useState } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { PalmaInteractiva } from "./PalmaInteractiva";
import { MapaMano } from "./MapaMano";
import { separarAnexo, type DetalleMano, type Mano, type TrazosMano } from "@/lib/quiromancia";
import { useT } from "@/lib/i18n/cliente";

/**
 * Lectura de la mano: la foto con los trazos identificados y el texto en vivo.
 * Los trazos llegan al final del texto como un anexo JSON que se oculta; con
 * él llegan también el tipo de mano, los montes y los rasgos de cada línea.
 */
export function LecturaQuiromancia({
  id,
  estadoInicial,
  textoInicial,
  urlFoto,
  mano = "derecha",
  dominante = "derecha",
}: {
  id: string;
  estadoInicial: "pendiente" | "generando" | "lista" | "error";
  textoInicial: string | null;
  urlFoto: string | null;
  mano?: Mano;
  dominante?: Mano;
}) {
  const { t } = useT();
  const [trazos, setTrazos] = useState<TrazosMano | null>(() => (textoInicial ? separarAnexo(textoInicial).trazos : null));
  const [detalle, setDetalle] = useState<DetalleMano | null>(() => (textoInicial ? separarAnexo(textoInicial).detalle : null));

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <h2 className="mb-2 text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.quiromancia.tuPalma}</h2>
          {urlFoto ? (
            <PalmaInteractiva urlFoto={urlFoto} trazos={trazos} />
          ) : (
            <p className="text-sm text-texto-suave">—</p>
          )}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarAnexo(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (!terminado) return;
              const anexo = separarAnexo(texto);
              setTrazos(anexo.trazos);
              setDetalle(anexo.detalle);
            }}
          />
        </section>
      </div>
      {/* Tipo de mano, montes y ficha de cada línea, cuando la lectura terminó. */}
      {detalle && (trazos || detalle.forma) && <MapaMano detalle={detalle} trazos={trazos} mano={mano} dominante={dominante} t={t.quiromancia} />}
    </div>
  );
}
