"use client";

import { useActionState, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { EstadoAccion } from "@/lib/lecturas/acciones";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { BotonVoz } from "./BotonVoz";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { textoErrorLectura } from "@/lib/i18n/errores";

type Accion = (prev: EstadoAccion, fd: FormData) => Promise<EstadoAccion>;

export interface TiradaRitualOraculo {
  id: string;
  nombre: string;
  descripcion: string;
  n: number;
}

/**
 * Ritual común de la baraja española, el Lenormand y las runas: la persona
 * elige tirada y pregunta, baraja (o mezcla la bolsa) y escoge sus piezas.
 * El servidor decide qué pieza hay en cada posición.
 */
export function RitualOraculo({
  accion,
  tiradas,
  total,
  estilo,
  textos,
  dorso,
}: {
  accion: Accion;
  tiradas: TiradaRitualOraculo[];
  total: number;
  estilo: "carta" | "runa";
  textos: { elige: string; leer: string };
  /** Imagen del reverso del mazo, si la tiene, y su proporción (el Lenormand es 5:6). */
  dorso?: { src: string; ancho: number; alto: number };
}) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accion, {});
  const [tiradaId, setTiradaId] = useState(tiradas[0].id);
  const [pregunta, setPregunta] = useState("");
  const [fase, setFase] = useState<"preparar" | "barajar" | "elegir">("preparar");
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [faltaPregunta, setFaltaPregunta] = useState(false);
  const tirada = tiradas.find((x) => x.id === tiradaId)!;
  const completa = seleccion.length === tirada.n;
  const sinCreditos = estado.error === "SIN_CREDITOS";

  const barajar = () => {
    if (!pregunta.trim()) {
      setFaltaPregunta(true);
      return;
    }
    setSeleccion([]);
    setFase("barajar");
    setTimeout(() => setFase("elegir"), 1100);
  };

  const tocar = (i: number) => {
    setSeleccion((s) => (s.includes(i) ? s.filter((x) => x !== i) : s.length < tirada.n ? [...s, i] : s));
  };

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}
      <input type="hidden" name="tirada" value={tirada.id} />
      <input type="hidden" name="pregunta" value={pregunta} />
      <input type="hidden" name="posiciones" value={JSON.stringify(seleccion)} />

      {fase === "preparar" && (
        <>
          <fieldset>
            <legend className="etiqueta">{t.oraculo.tirada}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {tiradas.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setTiradaId(x.id)}
                  aria-pressed={x.id === tiradaId}
                  className={`rounded-xl border p-4 text-left transition ${x.id === tiradaId ? "border-oro bg-oro/10" : "border-borde hover:border-oro/50"}`}
                >
                  <span className="font-display text-lg">{x.nombre}</span>
                  <span className="mt-1 block text-sm text-texto-suave">{x.descripcion}</span>
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label className="etiqueta" htmlFor="pregunta-oraculo">{t.oraculo.pregunta}</label>
            <textarea
              id="pregunta-oraculo"
              rows={2}
              maxLength={300}
              className="campo"
              placeholder={t.oraculo.placeholder}
              value={pregunta}
              onChange={(e) => {
                setPregunta(e.target.value);
                setFaltaPregunta(false);
              }}
            />
            <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
            {faltaPregunta && <p className="mt-2 text-sm text-oro-suave">{textoErrorLectura(estilo === "runa" ? "runas.pregunta" : "baraja.pregunta", t)}</p>}
          </div>
          <button type="button" onClick={barajar} className="boton boton-primario w-full">
            {estilo === "runa" ? t.oraculo.mezclar : t.oraculo.barajar}
          </button>
        </>
      )}

      {fase === "barajar" && (
        <div className="flex h-48 items-center justify-center" aria-live="polite">
          <div className="relative h-32 w-24">
            {[0, 1, 2, 3, 4].map((i) => (
              <Pieza key={i} estilo={estilo} dorso={dorso} className="absolute inset-0 animate-pulse" style={{ transform: `rotate(${(i - 2) * 9}deg) translateX(${(i - 2) * 6}px)`, animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
          <p className="sr-only">{t.oraculo.mezclando}</p>
        </div>
      )}

      {fase === "elegir" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-xl">{plantilla(textos.elige, { n: tirada.n })}</p>
            <p className="text-sm text-texto-suave">{plantilla(t.oraculo.elegidas, { a: seleccion.length, b: tirada.n })}</p>
          </div>
          <div className={`grid gap-2 ${estilo === "runa" ? "grid-cols-6 sm:grid-cols-8" : "grid-cols-8 sm:grid-cols-10"}`}>
            {Array.from({ length: total }, (_, i) => {
              const orden = seleccion.indexOf(i);
              return (
                <button key={i} type="button" onClick={() => tocar(i)} aria-pressed={orden >= 0} aria-label={`${i + 1}`} className="relative transition hover:-translate-y-1">
                  <Pieza estilo={estilo} dorso={dorso} elegida={orden >= 0} />
                  {orden >= 0 && <span className="absolute inset-0 flex items-center justify-center font-display text-xl text-oro">{orden + 1}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            {completa && <div className="flex-1"><BotonEnviar cargando={t.oraculo.cargando}>{textos.leer}</BotonEnviar></div>}
            <button type="button" onClick={() => setFase("preparar")} className="boton boton-fantasma">{t.oraculo.otraVez}</button>
          </div>
        </>
      )}
    </form>
  );
}

function Pieza({ estilo, dorso, elegida = false, className = "", style }: { estilo: "carta" | "runa"; dorso?: { src: string; ancho: number; alto: number }; elegida?: boolean; className?: string; style?: CSSProperties }) {
  const borde = elegida ? "border-oro shadow-[0_0_14px_rgba(217,180,90,0.5)]" : "border-oro/30";
  if (dorso) {
    // eslint-disable-next-line @next/next/no-img-element -- reverso estático del mazo
    return <img src={dorso.src} alt="" width={dorso.ancho} height={dorso.alto} style={{ aspectRatio: `${dorso.ancho} / ${dorso.alto}`, ...style }} className={`block w-full rounded-md ${elegida ? "opacity-60 shadow-[0_0_14px_rgba(217,180,90,0.7)] ring-2 ring-oro" : ""} ${className}`} />;
  }
  if (estilo === "runa") {
    return <span style={style} className={`block aspect-[4/5] rounded-[45%] border bg-gradient-to-br from-stone-500/50 to-stone-800/70 ${borde} ${className}`} />;
  }
  return (
    <span style={style} className={`block aspect-[2/3] rounded-md border bg-gradient-to-br from-violeta/50 via-superficie to-violeta/30 ${borde} ${className}`}>
      <span className="m-[18%] block h-[64%] rounded-sm border border-oro/20" />
    </span>
  );
}
