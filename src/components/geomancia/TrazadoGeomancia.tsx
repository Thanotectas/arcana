"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { LINEAS, MAX_MARCAS } from "@/lib/geomancia/calculo";
import { TEXTOS_GEOMANCIA } from "@/lib/geomancia/textos";

const ROMANOS = ["I", "II", "III", "IV"];

/**
 * Las 16 líneas de la arena: cuatro Madres de cuatro filas. La persona toca cada línea varias veces (o lanza todas de
 * una vez). El navegador solo envía cuántas marcas hizo; la paridad final la decide el servidor con su propio azar.
 */
export function TrazadoGeomancia() {
  const { idioma } = useT();
  const t = TEXTOS_GEOMANCIA[idioma];
  const [toques, setToques] = useState<number[]>(() => Array(LINEAS).fill(0));
  const [lanzando, setLanzando] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(() => () => {
    if (temporizador.current) window.clearInterval(temporizador.current);
  }, []);

  const trazadas = toques.filter((n) => n > 0).length;
  const completo = trazadas === LINEAS;

  function marcar(i: number) {
    if (lanzando) return;
    setToques((v) => v.map((n, k) => (k === i ? Math.min(n + 1, MAX_MARCAS) : n)));
  }

  function lanzar() {
    if (lanzando) return;
    setLanzando(true);
    setToques(Array(LINEAS).fill(0));
    let i = 0;
    temporizador.current = window.setInterval(() => {
      const linea = i;
      // Solo es el gesto visual: el servidor decide la paridad final de cada línea.
      setToques((v) => v.map((n, k) => (k === linea ? 3 + Math.floor(Math.random() * 10) : n)));
      i++;
      if (i >= LINEAS) {
        if (temporizador.current) window.clearInterval(temporizador.current);
        temporizador.current = null;
        setLanzando(false);
      }
    }, 70);
  }

  function borrar() {
    if (temporizador.current) window.clearInterval(temporizador.current);
    temporizador.current = null;
    setLanzando(false);
    setToques(Array(LINEAS).fill(0));
  }

  return (
    <fieldset className="space-y-4">
      <legend className="etiqueta">{t.trazar}</legend>
      <p className="text-sm text-texto-suave">{t.instrucciones}</p>
      <input type="hidden" name="toques" value={completo ? JSON.stringify(toques) : "[]"} />

      <div className="fondo-arena grid grid-cols-2 gap-3 rounded-2xl border border-oro/20 p-2.5 sm:grid-cols-4 sm:p-3">
        {ROMANOS.map((romano, m) => (
          <div key={romano} className="rounded-xl border border-borde/70 bg-black/20 p-2.5">
            <p className="mb-2 text-center text-[0.7rem] uppercase tracking-widest text-violeta-suave">{plantilla(t.madre, { n: romano })}</p>
            <div className="space-y-1.5">
              {t.filas.map((fila, f) => {
                const i = m * 4 + f;
                const n = toques[i];
                return (
                  <button
                    key={fila}
                    type="button"
                    onClick={() => marcar(i)}
                    disabled={lanzando}
                    aria-label={`${plantilla(t.madre, { n: romano })} · ${fila}: ${t.tocaLinea}`}
                    className={`flex min-h-11 w-full flex-col items-start gap-1 rounded-lg border px-2 py-1.5 text-start transition ${n > 0 ? "border-oro/40 bg-oro/5" : "border-dashed border-borde hover:border-violeta-suave/60"}`}
                  >
                    <span className="text-[0.6rem] uppercase tracking-wider text-texto-suave">{fila}</span>
                    <span className="flex min-h-2 flex-wrap gap-[3px]" aria-hidden>
                      {Array.from({ length: Math.min(n, 24) }, (_, k) => (
                        <span key={k} className="h-1.5 w-1.5 rounded-full bg-oro-suave/80" />
                      ))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={lanzar} disabled={lanzando} className="boton boton-secundario">
          {t.lanzar}
        </button>
        {trazadas > 0 && (
          <button type="button" onClick={borrar} className="boton boton-fantasma">
            {t.borrar}
          </button>
        )}
        <span className={`text-sm ${completo ? "text-exito" : "text-texto-suave"}`} aria-live="polite">
          {plantilla(t.contador, { n: trazadas })}
        </span>
      </div>
      <p className="text-xs text-texto-suave">{t.azarNota}</p>
    </fieldset>
  );
}
