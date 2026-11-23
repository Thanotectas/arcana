"use client";

import { InvitacionCreditos } from "../InvitacionCreditos";

import { useActionState, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { EstadoAccion } from "@/lib/lecturas/crear";
import { accionIskambil } from "@/lib/iskambil/acciones";
import type { TextosIskambil } from "@/lib/iskambil/textos";
import type { IdTiradaIskambil } from "@/lib/iskambil/tirada";
import { BotonEnviar } from "@/components/BotonEnviar";
import { BotonVoz } from "@/components/BotonVoz";
import { Aviso } from "@/components/Aviso";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { DorsoIskambil } from "./CartaIskambil";

const TOTAL = 52;
const IDS: IdTiradaIskambil[] = ["uc", "bes"];

/**
 * Ritual del iskambil falı: la persona elige tirada (3 o 5 cartas), escribe su deseo, baraja y escoge del abanico de
 * 52 cartas boca abajo. Solo se envían las posiciones del abanico: el servidor decide qué carta hay en cada una.
 */
export function RitualIskambil({ textos }: { textos: TextosIskambil }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionIskambil, {});
  const [tiradaId, setTiradaId] = useState<IdTiradaIskambil>("uc");
  const [pregunta, setPregunta] = useState("");
  const [fase, setFase] = useState<"preparar" | "barajar" | "elegir">("preparar");
  const [seleccion, setSeleccion] = useState<number[]>([]);
  const [faltaPregunta, setFaltaPregunta] = useState(false);
  const campo = useRef<HTMLTextAreaElement>(null);

  const tirada = textos.tiradas[tiradaId];
  const total = tirada.posiciones.length;
  const completa = seleccion.length === total;
  const faltan = total - seleccion.length;
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
        sinCreditos ? (
          <InvitacionCreditos />
        ) : (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
        )
      )}

      {fase === "preparar" && (
        <div className="tarjeta aparecer space-y-5 p-6">
          <fieldset>
            <legend className="etiqueta">{textos.tirada}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {IDS.map((id) => {
                const x = textos.tiradas[id];
                const activa = id === tiradaId;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTiradaId(id)}
                    aria-pressed={activa}
                    className={`rounded-xl border p-4 text-start transition ${activa ? "border-oro bg-oro/10" : "border-borde hover:border-oro/50"}`}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-lg">{x.nombre}</span>
                      <span className="text-xs text-violeta-suave">{plantilla(textos.nCartas, { n: x.posiciones.length })}</span>
                    </span>
                    <span className="mt-1 block text-sm text-texto-suave">{x.descripcion}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <div>
            <label className="etiqueta" htmlFor="pregunta-iskambil">{textos.pregunta}</label>
            <textarea
              id="pregunta-iskambil"
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
              aria-describedby="ayuda-pregunta-iskambil"
            />
            <div className="mt-2"><BotonVoz valor={pregunta} onChange={(v) => setPregunta(v.slice(0, 300))} /></div>
            <p id="ayuda-pregunta-iskambil" className={`mt-2 text-xs ${faltaPregunta ? "text-oro-suave" : "text-texto-suave"}`} role={faltaPregunta ? "alert" : undefined}>
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
              // .dorso-carta solo para heredar la animación de barajado del mazo; el dibujo es el dorso propio.
              <div key={i} className="dorso-carta absolute inset-0" style={{ background: "none", border: "none", boxShadow: "none", "--dx": `${dx}px`, "--rot": `${dx / 10}deg`, animationDelay: `${i * 60}ms` } as CSSProperties}>
                <DorsoIskambil />
              </div>
            ))}
          </div>
          <p className="font-display text-xl text-oro-suave">{textos.barajando}</p>
        </div>
      )}

      {fase === "elegir" && (
        <form action={enviar} className="space-y-8">
          <input type="hidden" name="tirada" value={tiradaId} />
          <input type="hidden" name="pregunta" value={pregunta} />
          <input type="hidden" name="posiciones" value={JSON.stringify(seleccion)} />

          <div className="text-center">
            <p className="font-display text-2xl">{completa ? textos.listas : faltan === 1 ? textos.eligeUltima : plantilla(textos.eligeN, { n: faltan })}</p>
            <p className="text-sm text-texto-suave">{completa ? textos.tocaDevolver : plantilla(textos.sigue, { n: seleccion.length, total })}</p>
          </div>

          <div className="tarjeta p-5">
            <ol className="flex flex-wrap items-start justify-center gap-3 sm:gap-5">
              {tirada.posiciones.map((nombre, i) => {
                const elegida = seleccion.at(i);
                return (
                  <li key={i} className="flex w-[clamp(60px,17vw,96px)] flex-col items-center gap-1.5">
                    {elegida !== undefined ? (
                      <button type="button" onClick={() => devolver(i)} className="llegar w-full" aria-label={plantilla(textos.devolver, { posicion: nombre })}>
                        <DorsoIskambil />
                      </button>
                    ) : (
                      <div className="flex aspect-[2/3] w-full items-center justify-center rounded-[0.45rem] border border-dashed border-oro/30 text-sm text-oro/60">{i + 1}</div>
                    )}
                    <span className="text-center text-[11px] uppercase tracking-widest text-violeta-suave">{nombre}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {!completa && <p className="text-center text-xs text-texto-suave sm:hidden">{textos.deslizaMazo}</p>}
          {!completa && (
            <div className="-mx-4 overflow-x-auto px-4 pb-10 pt-6 sm:mx-0 sm:px-0">
              <div className="flex min-w-max justify-center pe-8 ps-4" dir="ltr">
                {Array.from({ length: TOTAL }, (_, p) => {
                  const k = p / (TOTAL - 1);
                  const usada = seleccion.includes(p);
                  return (
                    <div key={p} className={p === 0 ? "" : "-ml-9 sm:-ml-10"} style={{ transform: `translateY(${(1 - Math.sin(Math.PI * k)) * 26}px) rotate(${(k - 0.5) * 20}deg)` }}>
                      <button
                        type="button"
                        onClick={() => elegir(p)}
                        disabled={usada}
                        className={`abanico-carta block w-[52px] ${usada ? "pointer-events-none opacity-0" : ""}`}
                        style={{ "--desde": `${(TOTAL / 2 - p) * 10}px`, animationDelay: `${p * 8}ms` } as CSSProperties}
                        aria-label={plantilla(textos.cartaN, { n: p + 1 })}
                      >
                        <DorsoIskambil />
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
