"use client";

import { useRef, useState } from "react";
import type { Lugar } from "@/lib/astro/geocodificar";

/** Autocompletado de lugar de nacimiento; rellena lat, lon y zona horaria ocultos. */
export function CampoLugar({ valorInicial }: { valorInicial?: Lugar | null }) {
  const [texto, setTexto] = useState(valorInicial ? etiqueta(valorInicial) : "");
  const [opciones, setOpciones] = useState<Lugar[]>([]);
  const [seleccion, setSeleccion] = useState<Lugar | null>(valorInicial ?? null);
  const [abierto, setAbierto] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimaBusqueda = useRef(0);

  function buscar(valor: string) {
    if (temporizador.current) clearTimeout(temporizador.current);
    if (valor.trim().length < 2) {
      setOpciones([]);
      return;
    }
    temporizador.current = setTimeout(async () => {
      const marca = ++ultimaBusqueda.current;
      try {
        const res = await fetch(`/api/lugares?q=${encodeURIComponent(valor)}`);
        const json = (await res.json()) as { lugares: Lugar[] };
        if (marca !== ultimaBusqueda.current) return; // llegó una búsqueda más nueva
        setOpciones(json.lugares);
        setAbierto(true);
      } catch {
        setOpciones([]);
      }
    }, 300);
  }

  return (
    <div className="relative">
      <label className="etiqueta" htmlFor="lugar-texto">Lugar de nacimiento</label>
      <input
        id="lugar-texto"
        className="campo"
        value={texto}
        autoComplete="off"
        placeholder="Ciudad, país"
        onChange={(e) => {
          setTexto(e.target.value);
          setSeleccion(null);
          buscar(e.target.value);
        }}
        onFocus={() => opciones.length && setAbierto(true)}
        onBlur={() => setTimeout(() => setAbierto(false), 150)}
        required
      />
      <input type="hidden" name="lugar" value={seleccion ? etiqueta(seleccion) : ""} />
      <input type="hidden" name="latitud" value={seleccion?.latitud ?? ""} />
      <input type="hidden" name="longitud" value={seleccion?.longitud ?? ""} />
      <input type="hidden" name="zona_horaria" value={seleccion?.zonaHoraria ?? ""} />

      {abierto && opciones.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-borde bg-superficie-2 shadow-xl">
          {opciones.map((o, i) => (
            <li key={`${o.latitud}-${o.longitud}-${i}`}>
              <button
                type="button"
                className="w-full px-4 py-2 text-left text-sm hover:bg-violeta/20"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSeleccion(o);
                  setTexto(etiqueta(o));
                  setAbierto(false);
                }}
              >
                {etiqueta(o)}
                <span className="block text-xs text-texto-suave">{o.zonaHoraria}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!seleccion && texto.length >= 2 && (
        <p className="mt-1 text-xs text-texto-suave">Selecciona una opción de la lista para fijar coordenadas y zona horaria.</p>
      )}
    </div>
  );
}

function etiqueta(l: Lugar) {
  return [l.nombre, l.region, l.pais].filter(Boolean).join(", ");
}
