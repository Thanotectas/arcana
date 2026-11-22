"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { CaraCarta } from "@/components/CartaVisual";
import { plantilla } from "@/lib/i18n/formato";
import type { RespuestaSiNo, TextosSiONo } from "@/lib/herramientas/si-o-no-textos";

export interface CartaSiNo {
  id: string;
  nombre: string;
  etiqueta: string;
  imagen?: string;
  respuesta: RespuestaSiNo;
  explicacion: string;
}

type TextosCliente = Omit<TextosSiONo, "meta" | "explicaciones" | "comoFunciona" | "cta">;

const COLOR_RESPUESTA: Record<RespuestaSiNo, string> = {
  si: "text-oro-suave",
  no: "text-violeta-suave",
  aun: "text-texto",
};

/** Tarot sí o no: una pregunta, un abanico de 22 cartas boca abajo y una carta que se voltea. */
export function SiONo({ textos, cartas }: { textos: TextosCliente; cartas: CartaSiNo[] }) {
  const [pregunta, setPregunta] = useState("");
  const [elegida, setElegida] = useState<CartaSiNo | null>(null);
  const [volteada, setVolteada] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultado = useRef<HTMLDivElement>(null);

  useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  function elegir() {
    // La carta se decide al tocar: cualquiera de las 22, al azar (las posiciones del abanico están boca abajo).
    const carta = cartas[Math.floor(Math.random() * cartas.length)];
    setElegida(carta);
    setVolteada(false);
    temporizador.current = setTimeout(() => {
      setVolteada(true);
      resultado.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function reiniciar() {
    if (temporizador.current) clearTimeout(temporizador.current);
    setElegida(null);
    setVolteada(false);
    setPregunta("");
  }

  if (elegida) {
    return (
      <div ref={resultado} className="flex flex-col items-center gap-6 text-center" aria-live="polite">
        {pregunta.trim() && (
          <p className="max-w-md text-sm italic text-texto-suave">
            <span className="block text-xs not-italic uppercase tracking-widest text-violeta-suave">{textos.tuPregunta}</span>
            {pregunta.trim()}
          </p>
        )}
        <div className={`carta-3d w-40 sm:w-48 ${volteada ? "volteada" : ""}`}>
          <div className="carta-3d-interior">
            <div className="lado">
              <div className="dorso-carta estilo-rider h-full w-full" />
            </div>
            <div className="lado lado-cara">
              <CaraCarta nombre={elegida.nombre} etiqueta={elegida.etiqueta} simbolo="✦" invertida={false} imagen={elegida.imagen} />
            </div>
          </div>
        </div>
        {volteada && (
          <div className="aparecer max-w-lg space-y-3" style={{ animationDelay: "650ms" }}>
            <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{plantilla(textos.salio, { carta: elegida.nombre })}</p>
            <p className={`font-display text-6xl font-semibold ${COLOR_RESPUESTA[elegida.respuesta]}`}>{textos.respuestas[elegida.respuesta]}</p>
            <p className="text-sm italic text-texto-suave">{textos.matiz[elegida.respuesta]}</p>
            <p className="text-lg leading-relaxed">{elegida.explicacion}</p>
            <p className="text-xs text-texto-suave">{textos.aviso}</p>
            <button type="button" className="boton boton-secundario mt-2" onClick={reiniciar}>
              {textos.otraVez}
            </button>
          </div>
        )}
      </div>
    );
  }

  const total = cartas.length;
  return (
    <div className="space-y-6">
      <div>
        <label className="etiqueta" htmlFor="pregunta-si-no">
          {textos.preguntaEtiqueta}
        </label>
        <input
          id="pregunta-si-no"
          className="campo"
          value={pregunta}
          maxLength={160}
          autoComplete="off"
          placeholder={textos.preguntaPlaceholder}
          onChange={(e) => setPregunta(e.target.value)}
        />
        <p className="mt-1 text-xs text-texto-suave">{textos.preguntaNota}</p>
      </div>
      <p className="text-center font-display text-xl text-oro-suave">{textos.elige}</p>
      {/* El abanico es solo visual: se dibuja siempre de izquierda a derecha, también en árabe. */}
      <div dir="ltr" className="-mx-4 overflow-x-auto px-4 pb-10 pt-6 sm:mx-0 sm:px-0">
        <div className="mx-auto flex w-max justify-center px-2">
          {Array.from({ length: total }, (_, p) => {
            const k = p / (total - 1);
            return (
              <div
                key={p}
                className={p === 0 ? "" : "-ml-[34px] sm:-ml-9"}
                // Redondeado: el servidor y el navegador deben escribir el mismo número (si no, la hidratación no coincide).
                style={{ transform: `translateY(${((1 - Math.sin(Math.PI * k)) * 26).toFixed(2)}px) rotate(${((k - 0.5) * 24).toFixed(2)}deg)` }}
              >
                <button
                  type="button"
                  onClick={elegir}
                  className="abanico-carta block w-[46px] sm:w-[58px]"
                  style={{ "--desde": `${(total / 2 - p) * 12}px`, animationDelay: `${p * 18}ms` } as CSSProperties}
                  aria-label={plantilla(textos.cartaN, { n: p + 1 })}
                >
                  <div className="dorso-carta estilo-rider w-full" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
