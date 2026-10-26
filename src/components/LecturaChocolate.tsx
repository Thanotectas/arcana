"use client";

import { useState } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { ZONAS, separarFiguras, type FiguraTaza, type ZonaTaza } from "@/lib/chocolate";
import { useT } from "@/lib/i18n/cliente";
import type { Diccionario } from "@/lib/i18n/diccionarios";

type T = Diccionario["chocolate"];

/** Foto de la taza con un número sobre cada figura; tocar uno la resalta y muestra qué anuncia. */
function TazaAnotada({ urlFoto, figuras, activa, elegir, t }: { urlFoto: string; figuras: FiguraTaza[]; activa: number | null; elegir: (i: number | null) => void; t: T }) {
  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-borde">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto privada firmada */}
        <img src={urlFoto} alt={t.tuTaza} className="block w-full" />
        {figuras.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={() => elegir(activa === i ? null : i)}
            className={`taza-marca absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-sm font-bold tabular-nums transition ${activa === i ? "border-white bg-oro text-noche scale-125" : "border-oro bg-noche/80 text-oro-suave"}`}
            style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${0.3 + i * 0.25}s` }}
            aria-label={`${i + 1}. ${f.nombre}`}
            aria-pressed={activa === i}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {figuras.length > 0 && (
        <ol className="space-y-1.5 text-sm">
          {figuras.map((f, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => elegir(activa === i ? null : i)}
                onMouseEnter={() => elegir(i)}
                className={`flex w-full items-baseline gap-2 rounded-lg px-2 py-1 text-left transition ${activa === i ? "bg-oro/15" : "hover:bg-white/5"}`}
              >
                <span className="font-semibold tabular-nums text-oro">{i + 1}.</span>
                <span className="min-w-0">
                  <span className="text-texto first-letter:uppercase">{f.nombre}</span>
                  {f.sentido && <span className="text-texto-suave"> · {f.sentido}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Taza vista desde arriba con el anillo de la zona resaltado (borde, paredes o fondo). */
function IconoZona({ zona }: { zona: ZonaTaza }) {
  const r = { borde: [38, 30], medio: [30, 18], fondo: [18, 0] }[zona];
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14" aria-hidden>
      <path d="M 88 42 Q 100 50 88 58" fill="none" stroke="#d9b45a" strokeWidth="5" strokeLinecap="round" />
      <circle cx="46" cy="50" r="42" fill="#3b2418" stroke="#d9b45a" strokeWidth="2" />
      <circle cx="46" cy="50" r="38" fill="#5a3826" />
      <circle cx="46" cy="50" r={r[0]} fill="#f1d99a" fillOpacity="0.55" />
      {r[1] > 0 && <circle cx="46" cy="50" r={r[1]} fill="#5a3826" />}
      <circle cx="46" cy="50" r="38" fill="none" stroke="#f1d99a" strokeOpacity="0.3" />
    </svg>
  );
}

/** Las figuras ordenadas en el tiempo de la taza: del borde (pronto) al fondo (más adelante). */
function TiempoTaza({ figuras, activa, elegir, t }: { figuras: FiguraTaza[]; activa: number | null; elegir: (i: number | null) => void; t: T }) {
  return (
    <section className="tarjeta space-y-4 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.tiempoTitulo}</p>
        <p className="text-sm text-texto-suave">{t.tiempoNota}</p>
      </div>
      <div className="relative grid gap-4 sm:grid-cols-3">
        <div className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 bg-gradient-to-r from-oro via-oro/60 to-violeta sm:block" aria-hidden />
        {ZONAS.map((z) => {
          const aqui = figuras.map((f, i) => ({ f, i })).filter(({ f }) => f.zona === z);
          return (
            <div key={z} className="relative flex flex-col items-center gap-2 text-center">
              <div className="rounded-full bg-superficie p-0.5"><IconoZona zona={z} /></div>
              <p className="font-display text-xl text-oro-suave">{t.zonas[z].cuando}</p>
              <p className="text-xs uppercase tracking-widest text-texto-suave">{t.zonas[z].nombre}</p>
              {aqui.length ? (
                <ul className="flex flex-wrap justify-center gap-1.5">
                  {aqui.map(({ f, i }) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => elegir(activa === i ? null : i)}
                        className={`rounded-full border px-3 py-1 text-sm transition ${activa === i ? "border-oro bg-oro/20 text-oro-suave" : "border-borde text-texto hover:border-oro/50"}`}
                      >
                        <span className="font-semibold tabular-nums text-oro">{i + 1}</span> {f.nombre}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-texto-suave/70">{t.vacia}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Lectura del chocolate: la foto de la taza con las figuras numeradas, el
 * texto en vivo y la taza en el tiempo. Las figuras llegan al final del
 * texto como un anexo JSON que se oculta (las lecturas anteriores no lo
 * tienen: se ve solo la foto).
 */
export function LecturaChocolate({ id, estadoInicial, textoInicial, urlFoto }: { id: string; estadoInicial: "pendiente" | "generando" | "lista" | "error"; textoInicial: string | null; urlFoto: string | null }) {
  const { t } = useT();
  const [figuras, setFiguras] = useState<FiguraTaza[]>(() => (textoInicial ? separarFiguras(textoInicial).figuras : []));
  const [activa, setActiva] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-2 md:sticky md:top-24 md:self-start">
          <h2 className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{figuras.length ? t.chocolate.figurasTitulo : t.chocolate.tuTaza}</h2>
          {figuras.length > 0 && <p className="text-xs text-texto-suave">{t.chocolate.figurasNota}</p>}
          {urlFoto ? <TazaAnotada urlFoto={urlFoto} figuras={figuras} activa={activa} elegir={setActiva} t={t.chocolate} /> : <p className="text-sm text-texto-suave">—</p>}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarFiguras(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (terminado) setFiguras(separarFiguras(texto).figuras);
            }}
          />
        </section>
      </div>
      {figuras.length > 0 && <TiempoTaza figuras={figuras} activa={activa} elegir={setActiva} t={t.chocolate} />}
    </div>
  );
}
