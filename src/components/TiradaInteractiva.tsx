"use client";

import { useState } from "react";
import { DisposicionTirada } from "./DisposicionTirada";
import { CaraCarta } from "./CartaVisual";

export interface CartaRevelada {
  nombre: string;
  etiqueta: string;
  simbolo: string;
  invertida: boolean;
  posicion: string;
  posicionDescripcion: string;
  palabras: string[];
  significado: string;
  amor: string;
  trabajo: string;
}

type Tema = "significado" | "amor" | "trabajo";

/**
 * Cartas de una lectura de tarot. En una lectura nueva aparecen boca abajo y
 * la persona las voltea una a una; tocar una carta muestra su significado.
 */
export function TiradaInteractiva({ cartas, ocultas }: { cartas: CartaRevelada[]; ocultas: boolean }) {
  const [volteadas, setVolteadas] = useState<boolean[]>(() => cartas.map(() => !ocultas));
  const [activa, setActiva] = useState<number | null>(ocultas ? null : 0);
  const [tema, setTema] = useState<Tema>("significado");
  const todas = volteadas.every(Boolean);

  const tocar = (i: number) => {
    setVolteadas((v) => v.map((x, j) => (j === i ? true : x)));
    setActiva(i);
    setTema("significado");
  };

  const revelarTodas = () => {
    cartas.forEach((_, i) => {
      window.setTimeout(() => setVolteadas((v) => v.map((x, j) => (j === i ? true : x))), i * 220);
    });
    if (activa === null) setActiva(0);
  };

  const c = activa !== null ? cartas.at(activa) : undefined;

  return (
    <section className="tarjeta space-y-6 p-5 sm:p-6">
      {!todas && (
        <p className="text-center text-sm text-texto-suave">
          Toca cada carta para revelarla{cartas.length > 1 ? " en el orden que quieras" : ""}.
        </p>
      )}

      <DisposicionTirada total={cartas.length}>
        {(i) => {
          const carta = cartas.at(i)!;
          const volteada = volteadas.at(i);
          return (
            <div className="flex w-full flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => tocar(i)}
                className={`carta-3d w-full ${volteada ? "volteada" : ""} ${activa === i ? "rounded-[0.9rem] ring-2 ring-oro/70 ring-offset-2 ring-offset-noche" : ""}`}
                aria-label={volteada ? `${carta.posicion}: ${carta.nombre}${carta.invertida ? " invertida" : ""}` : `Revelar la carta de ${carta.posicion}`}
                aria-pressed={activa === i}
              >
                <div className="carta-3d-interior">
                  <div className="lado">
                    <div className="dorso-carta h-full w-full" />
                  </div>
                  <div className="lado lado-cara">
                    <CaraCarta nombre={carta.nombre} etiqueta={carta.etiqueta} simbolo={carta.simbolo} invertida={carta.invertida} compacta={cartas.length === 10} />
                  </div>
                </div>
              </button>
              {cartas.length < 10 && (
                <span className="text-center text-xs uppercase tracking-widest text-violeta-suave">{carta.posicion}</span>
              )}
            </div>
          );
        }}
      </DisposicionTirada>

      {cartas.length === 10 && (
        <ol className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-5">
          {cartas.map((k, i) => (
            <li key={i}>
              <button type="button" onClick={() => tocar(i)} className={`text-left ${activa === i ? "text-oro-suave" : "text-texto-suave hover:text-texto"}`}>
                {i + 1}. {k.posicion}
              </button>
            </li>
          ))}
        </ol>
      )}

      {!todas && (
        <div className="text-center">
          <button type="button" className="boton boton-secundario" onClick={revelarTodas}>
            Revelar todas
          </button>
        </div>
      )}

      {c && volteadas.at(activa!) && (
        <div key={activa} className="aparecer rounded-xl border border-borde bg-superficie-2/60 p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{c.posicion}</p>
          <p className="text-xs text-texto-suave">{c.posicionDescripcion}</p>
          <h3 className="font-display mt-2 text-2xl font-semibold">
            {c.nombre} {c.invertida && <span className="text-base text-oro">· invertida</span>}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {c.palabras.map((p) => (
              <span key={p} className="rounded-full border border-oro/30 px-2.5 py-0.5 text-xs text-oro-suave">{p}</span>
            ))}
          </div>
          <div className="mt-4 flex gap-1 text-sm" role="tablist">
            {(["significado", "amor", "trabajo"] as Tema[]).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tema === t}
                onClick={() => setTema(t)}
                className={`rounded-full px-3 py-1 capitalize transition ${tema === t ? "bg-violeta/25 text-violeta-suave" : "text-texto-suave hover:text-texto"}`}
              >
                {t === "significado" ? "General" : t}
              </button>
            ))}
          </div>
          <p className="mt-3 leading-relaxed text-[#d9d2ea]">{tema === "significado" ? c.significado : tema === "amor" ? c.amor : c.trabajo}</p>
        </div>
      )}
    </section>
  );
}
