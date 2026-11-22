"use client";

import { useActionState, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { EstadoAccion } from "@/lib/lecturas/crear";
import { accionMarsella } from "@/lib/marsella/acciones";
import type { TextosMarsella } from "@/lib/marsella/textos";
import { BotonEnviar } from "@/components/BotonEnviar";
import { BotonVoz } from "@/components/BotonVoz";
import { Aviso } from "@/components/Aviso";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { CruzMarsella } from "./CruzMarsella";

const TOTAL = 22;
const A_ELEGIR = 4;

/**
 * Ritual del tirage en croix: la persona escribe su pregunta, baraja y elige cuatro láminas del abanico boca abajo.
 * Solo se envían las posiciones del abanico: el servidor decide qué lámina hay en cada una y calcula la síntesis.
 */
export function RitualMarsella({ textos }: { textos: TextosMarsella }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionMarsella, {});
  const [pregunta, setPregunta] = useState("");
  const [fase, setFase] = useState<"preparar" | "barajar" | "elegir">("preparar");
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [faltaPregunta, setFaltaPregunta] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);

  const completa = seleccion.length === A_ELEGIR;
  const faltan = A_ELEGIR - seleccion.length;
  const sinCreditos = estado.error === "SIN_CREDITOS";

  const barajar = () => {
    if (pregunta.trim().length < 3) {
      setFaltaPregunta(true);
      campo.current?.focus();
      return;
    }
    setSeleccion([]);
    setFase("barajar");
    window.setTimeout(() => setFase("elegir"), 1400);
  };
  const elegir = (p: number) => {
    if (completa || seleccion.includes(p)) return;
    setSeleccion((s) => [...s, p]);
  };
  const devolver = (i: number) => setSeleccion((s) => s.filter((_, j) => j !== i));

  return (
    <div className="space-y-8">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      {fase === "preparar" && (
        <div className="tarjeta aparecer space-y-4 p-6">
          <div>
            <label className="etiqueta" htmlFor="pregunta-marsella">{textos.pregunta}</label>
            <textarea
              id="pregunta-marsella"
              ref={campo}
              rows={3}
              maxLength={300}
              className="campo"
              value={pregunta}
              placeholder={textos.placeholder}
              onChange={(e) => {
                setPregunta(e.target.value);
                if (e.target.value.trim().length >= 3) setFaltaPregunta(false);
              }}
              aria-invalid={faltaPregunta}
              aria-describedby="ayuda-pregunta-marsella"
            />
            <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
            <p id="ayuda-pregunta-marsella" className={`mt-2 text-xs ${faltaPregunta ? "text-oro-suave" : "text-texto-suave"}`} role={faltaPregunta ? "alert" : undefined}>
              {faltaPregunta ? textos.faltaPregunta : textos.respira}
            </p>
          </div>
          <button type="button" className="boton boton-primario w-full sm:w-auto" onClick={barajar}>
            {textos.barajar}
          </button>
        </div>
      )}

      {fase === "barajar" && (
        <div className="flex flex-col items-center gap-6 py-10" role="status">
          <div className="mazo-barajando relative h-36 w-24">
            {[70, -60, 50, -80, 40, -45].map((dx, i) => (
              <div key={i} className="dorso-carta estilo-marsella absolute inset-0" style={{ "--dx": `${dx}px`, "--rot": `${dx / 10}deg`, animationDelay: `${i * 60}ms` } as CSSProperties} />
            ))}
          </div>
          <p className="font-display text-xl text-oro-suave">{textos.barajando}</p>
        </div>
      )}

      {fase === "elegir" && (
        <form action={enviar} className="space-y-8">
          <input type="hidden" name="pregunta" value={pregunta} />
          <input type="hidden" name="posiciones" value={JSON.stringify(seleccion)} />

          <div className="text-center">
            <p className="font-display text-2xl">{completa ? textos.listas : faltan === 1 ? textos.eligeUltima : plantilla(textos.eligeN, { n: faltan })}</p>
            <p className="text-sm text-texto-suave">{completa ? textos.tocaDevolver : plantilla(textos.sigue, { n: seleccion.length, total: A_ELEGIR })}</p>
          </div>

          <div className="tarjeta p-5">
            <CruzMarsella ancho="clamp(64px, 19vw, 96px)">
              {(i) => {
                const posicion = textos.posiciones[i];
                const elegida = i < A_ELEGIR ? seleccion.at(i) : undefined;
                return (
                  <>
                    {i === 4 ? (
                      <div className="flex aspect-[2/3] w-full flex-col items-center justify-center gap-1 rounded-[0.6rem] border border-oro/40 bg-oro/5 text-center text-oro/80">
                        <span className="font-display text-3xl" aria-hidden>∑</span>
                        <span className="px-1 text-[10px] uppercase tracking-widest">{textos.calculada}</span>
                      </div>
                    ) : elegida !== undefined ? (
                      <button type="button" onClick={() => devolver(i)} className="llegar w-full" aria-label={plantilla(textos.devolver, { posicion: posicion.nombre })}>
                        <div className="dorso-carta estilo-marsella w-full" />
                      </button>
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center rounded-[0.6rem] border border-dashed border-oro/30 text-sm text-oro/60">{i + 1}</div>
                    )}
                    <span className="mt-1.5 text-center text-[11px] uppercase tracking-widest text-violeta-suave">{posicion.nombre}</span>
                  </>
                );
              }}
            </CruzMarsella>
          </div>

          {!completa && <p className="text-center text-xs text-texto-suave sm:hidden">{textos.deslizaMazo}</p>}
          {!completa && (
            <div className="-mx-4 overflow-x-auto px-4 pb-10 pt-6 sm:mx-0 sm:px-0">
              <div className="flex min-w-max justify-center pe-8 ps-4" dir="ltr">
                {Array.from({ length: TOTAL }, (_, p) => {
                  const k = p / (TOTAL - 1);
                  const usada = seleccion.includes(p);
                  return (
                    <div key={p} className={p === 0 ? "" : "-ml-6 sm:-ml-[34px]"} style={{ transform: `translateY(${(1 - Math.sin(Math.PI * k)) * 24}px) rotate(${(k - 0.5) * 22}deg)` }}>
                      <button
                        type="button"
                        onClick={() => elegir(p)}
                        disabled={usada}
                        className={`abanico-carta block w-[56px] sm:w-[64px] ${usada ? "pointer-events-none opacity-0" : ""}`}
                        style={{ "--desde": `${(TOTAL / 2 - p) * 14}px`, animationDelay: `${p * 18}ms` } as CSSProperties}
                        aria-label={plantilla(textos.cartaN, { n: p + 1 })}
                      >
                        <div className="dorso-carta estilo-marsella w-full" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {completa && (
              <BotonEnviar cargando={textos.consultando} className="boton boton-primario">
                {textos.revelar}
              </BotonEnviar>
            )}
            <button type="button" className="boton boton-fantasma" onClick={() => setFase("preparar")}>
              {textos.cambiar}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
