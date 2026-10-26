"use client";

import { useState } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { FotoAnotada } from "./FotoAnotada";
import { ZONAS, separarFiguras, type AnexoTaza, type FiguraTaza, type ZonaTaza } from "@/lib/oraculos/taza";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

/** Textos que comparten la taza de chocolate y la del café. */
type T = Pick<Diccionario["chocolate"], "figurasTitulo" | "figurasNota" | "tiempoTitulo" | "tiempoNota" | "zonas" | "vacia">;
type TCafe = Diccionario["cafe"];

/** Flecha de la figura en el café: sube hacia el borde (se acerca) o baja hacia el fondo (se aleja). */
function Rumbo({ va, t }: { va?: FiguraTaza["va"]; t?: TCafe }) {
  if (!va || !t) return null;
  return (
    <span className={va === "sube" ? "text-oro" : "text-violeta-suave"} title={t.va[va]}>
      {" "}
      <span aria-hidden>{va === "sube" ? "↑" : "↓"}</span>
      <span className="sr-only">{t.va[va]}</span>
    </span>
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
function TiempoTaza({ figuras, activa, elegir, t, cafe }: { figuras: FiguraTaza[]; activa: number | null; elegir: (i: number | null) => void; t: T; cafe?: TCafe }) {
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
                        <Rumbo va={f.va} t={cafe} />
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
 * Café: cuánto de la taza quedó limpio (caminos abiertos) frente a la borra
 * espesa (cargas), en un anillo, y cuántas figuras se acercan o se alejan.
 */
function LimpioEspeso({ limpio, figuras, t }: { limpio: number | null; figuras: FiguraTaza[]; t: TCafe }) {
  const suben = figuras.filter((f) => f.va === "sube").length;
  const bajan = figuras.filter((f) => f.va === "baja").length;
  if (limpio == null && !suben && !bajan) return null;
  const estado = limpio == null ? null : limpio >= 55 ? "abierto" : limpio >= 30 ? "mixto" : "cargado";
  const R = 40;
  const largo = Math.round(2 * Math.PI * R);
  return (
    <section className="tarjeta grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-6">
      {limpio != null && (
        <svg viewBox="0 0 100 100" className="mx-auto h-32 w-32" role="img" aria-label={plantilla(t.limpio, { n: limpio })}>
          <circle cx="50" cy="50" r={R} fill="none" stroke="#3b2418" strokeWidth="12" />
          <g transform="rotate(-90 50 50)">
            <circle
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke="#f1d99a"
              strokeWidth="12"
              strokeLinecap={limpio > 0 && limpio < 100 ? "round" : "butt"}
              strokeDasharray={`${Math.round((largo * limpio) / 100)} ${largo}`}
              className="cafe-anillo"
              style={{ ["--largo" as string]: `${largo}` }}
            />
          </g>
          <circle cx="50" cy="50" r="30" fill="#5a3826" />
          <text x="50" y="52" textAnchor="middle" fontSize="18" fontWeight="700" fill="#f1d99a">{limpio}%</text>
          <text x="50" y="64" textAnchor="middle" fontSize="8" fill="#f1d99a" opacity="0.8">{t.limpioCorto}</text>
        </svg>
      )}
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.limpioTitulo}</p>
          <p className="text-texto-suave">{t.limpioNota}</p>
        </div>
        {limpio != null && estado && (
          <>
            <div className="flex h-3 overflow-hidden rounded-full bg-white/5" aria-hidden>
              <div className="tarot-barra h-full bg-oro-suave" style={{ width: `${limpio}%` }} />
              <div className="tarot-barra h-full bg-[#5a3826]" style={{ width: `${100 - limpio}%`, animationDelay: "0.3s" }} />
            </div>
            <p className="flex justify-between text-xs text-texto-suave">
              <span>{plantilla(t.limpio, { n: limpio })}</span>
              <span>{plantilla(t.espeso, { n: 100 - limpio })}</span>
            </p>
            <p className="text-texto">{t.estados[estado]}</p>
          </>
        )}
        {(suben > 0 || bajan > 0) && (
          <p className="flex flex-wrap gap-2">
            {suben > 0 && <span className="rounded-full border border-oro/40 bg-oro/10 px-3 py-1 text-oro-suave">↑ {plantilla(t.acercan, { n: suben })}</span>}
            {bajan > 0 && <span className="rounded-full border border-violeta/40 bg-violeta/10 px-3 py-1 text-violeta-suave">↓ {plantilla(t.alejan, { n: bajan })}</span>}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Lectura de una taza (chocolate o borra de café): la foto con las figuras
 * numeradas, el texto en vivo y la taza en el tiempo; en el café, además, lo
 * limpio y lo espeso y si cada figura sube o baja. Las figuras llegan al final
 * del texto como un anexo JSON que se oculta (las lecturas anteriores no lo
 * tienen: se ve solo la foto).
 */
export function LecturaTaza({ id, tipo, estadoInicial, textoInicial, urlFoto }: { id: string; tipo: "chocolate" | "cafe"; estadoInicial: "pendiente" | "generando" | "lista" | "error"; textoInicial: string | null; urlFoto: string | null }) {
  const { t } = useT();
  const [anexo, setAnexo] = useState<AnexoTaza | null>(() => (textoInicial ? separarFiguras(textoInicial) : null));
  const [activa, setActiva] = useState<number | null>(null);
  const textos: T = tipo === "cafe" ? t.cafe : t.chocolate;
  const cafe = tipo === "cafe" ? t.cafe : undefined;
  const tuTaza = tipo === "cafe" ? t.cafe.tuFoto : t.chocolate.tuTaza;
  const figuras = anexo?.figuras ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-2 md:sticky md:top-24 md:self-start">
          <h2 className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{figuras.length ? textos.figurasTitulo : tuTaza}</h2>
          {figuras.length > 0 && <p className="text-xs text-texto-suave">{textos.figurasNota}</p>}
          {urlFoto ? <FotoAnotada urlFoto={urlFoto} alt={tuTaza} marcas={figuras} activa={activa} elegir={setActiva} extra={(f) => <Rumbo va={f.va} t={cafe} />} /> : <p className="text-sm text-texto-suave">—</p>}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarFiguras(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (terminado) setAnexo(separarFiguras(texto));
            }}
          />
        </section>
      </div>
      {figuras.length > 0 && <TiempoTaza figuras={figuras} activa={activa} elegir={setActiva} t={textos} cafe={cafe} />}
      {cafe && anexo && <LimpioEspeso limpio={anexo.limpio} figuras={figuras} t={cafe} />}
    </div>
  );
}
