"use client";

import { useActionState, useState, type CSSProperties } from "react";
import Link from "next/link";
import { accionTarot, type EstadoAccion } from "@/lib/lecturas/acciones";
import { DisposicionTirada } from "./DisposicionTirada";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";

export interface TiradaRitual {
  id: "tarot_carta" | "tarot_tres" | "tarot_celta";
  nombre: string;
  descripcion: string;
  posiciones: { nombre: string; descripcion: string }[];
  costoTexto: string;
  disponible: boolean;
}

type Fase = "preparar" | "barajar" | "elegir";

const PILA = [
  { dx: "70px", rot: "8deg" },
  { dx: "-60px", rot: "-7deg" },
  { dx: "50px", rot: "5deg" },
  { dx: "-80px", rot: "-9deg" },
  { dx: "40px", rot: "4deg" },
  { dx: "-45px", rot: "-5deg" },
  { dx: "65px", rot: "7deg" },
  { dx: "-30px", rot: "-3deg" },
];

/**
 * Ritual de tarot: la persona elige la tirada y su pregunta, baraja y escoge
 * sus cartas del abanico. El servidor decide qué carta hay en cada posición.
 */
export function RitualTarot({
  tiradas,
  inicial,
  tamanoMazo,
}: {
  tiradas: TiradaRitual[];
  inicial: TiradaRitual["id"];
  tamanoMazo: number;
}) {
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionTarot, {});
  const [tiradaId, setTiradaId] = useState(inicial);
  const [pregunta, setPregunta] = useState("");
  const [fase, setFase] = useState<Fase>("preparar");
  const [seleccion, setSeleccion] = useState<number[]>([]);

  const tirada = tiradas.find((t) => t.id === tiradaId)!;
  const total = tirada.posiciones.length;
  const completa = seleccion.length === total;
  const preguntaObligatoria = tirada.id !== "tarot_carta";
  const puedeBarajar = tirada.disponible && (!preguntaObligatoria || pregunta.trim().length > 0);

  const barajar = () => {
    setSeleccion([]);
    setFase("barajar");
    window.setTimeout(() => setFase("elegir"), 1500);
  };

  const elegir = (p: number) => {
    if (completa || seleccion.includes(p)) return;
    setSeleccion((s) => [...s, p]);
  };
  const devolver = (i: number) => setSeleccion((s) => s.filter((_, j) => j !== i));

  const sinCreditos = estado.error?.includes("créditos");

  return (
    <div className="space-y-8">
      {estado.error && (
        <Aviso>
          {estado.error}{" "}
          {sinCreditos && <Link href="/creditos" className="underline">Comprar créditos</Link>}
        </Aviso>
      )}

      {fase === "preparar" && (
        <div className="space-y-6 aparecer">
          <div className="grid gap-3 sm:grid-cols-3">
            {tiradas.map((t) => {
              const activa = t.id === tiradaId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTiradaId(t.id)}
                  className={`tarjeta p-4 text-left transition ${activa ? "border-oro/60 bg-oro/5" : "hover:border-oro/30"}`}
                  aria-pressed={activa}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold">{t.nombre}</h2>
                    <span className="shrink-0 text-xs text-violeta-suave">{t.costoTexto}</span>
                  </div>
                  <p className="mt-1 text-xs text-texto-suave">
                    {t.posiciones.length} carta{t.posiciones.length > 1 ? "s" : ""}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="tarjeta space-y-4 p-6">
            <div>
              <h2 className="font-display text-2xl font-semibold">{tirada.nombre}</h2>
              <p className="text-sm text-texto-suave">{tirada.descripcion}</p>
            </div>
            <div>
              <label className="etiqueta" htmlFor="pregunta">
                Tu pregunta {preguntaObligatoria ? "" : "(opcional)"}
              </label>
              <textarea
                id="pregunta"
                rows={3}
                maxLength={300}
                className="campo"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Por ejemplo: ¿Qué necesito ver sobre mi relación actual?"
              />
              <p className="mt-2 text-xs text-texto-suave">Respira, piensa en tu pregunta y baraja cuando te sientas listo.</p>
            </div>
            {!tirada.disponible && <Aviso tipo="info">Ya sacaste tu carta gratuita de hoy. Vuelve mañana o elige otra tirada.</Aviso>}
            <button type="button" className="boton boton-primario w-full sm:w-auto" disabled={!puedeBarajar} onClick={barajar}>
              Barajar el mazo
            </button>
          </div>
        </div>
      )}

      {fase === "barajar" && (
        <div className="flex flex-col items-center gap-6 py-10" role="status">
          <div className="mazo-barajando relative h-40 w-24">
            {PILA.map((p, i) => (
              <div
                key={i}
                className="dorso-carta absolute inset-0"
                style={{ "--dx": p.dx, "--rot": p.rot, animationDelay: `${i * 60}ms` } as CSSProperties}
              />
            ))}
          </div>
          <p className="font-display text-xl text-oro-suave">Barajando…</p>
        </div>
      )}

      {fase === "elegir" && (
        <form action={enviar} className="space-y-8">
          <input type="hidden" name="tipo" value={tirada.id} />
          <input type="hidden" name="pregunta" value={pregunta} />
          <input type="hidden" name="posiciones" value={JSON.stringify(seleccion)} />

          <div className="text-center">
            <p className="font-display text-2xl">
              {completa ? "Tus cartas están listas" : `Elige ${total - seleccion.length === 1 && total > 1 ? "tu última carta" : total === 1 ? "tu carta" : `${total - seleccion.length} cartas`}`}
            </p>
            <p className="text-sm text-texto-suave">
              {completa ? "Toca una carta para devolverla al mazo, o revela tu lectura." : `Sigue tu intuición. Llevas ${seleccion.length} de ${total}.`}
            </p>
          </div>

          <div className="tarjeta p-5">
            <DisposicionTirada total={total}>
              {(i) => {
                const elegida = seleccion.at(i);
                return (
                  <div className="flex w-full flex-col items-center gap-1.5">
                    {elegida !== undefined ? (
                      <button type="button" onClick={() => devolver(i)} className="llegar w-full" aria-label={`Devolver la carta de ${tirada.posiciones[i].nombre}`}>
                        <div className="dorso-carta w-full" />
                      </button>
                    ) : (
                      <div className="flex w-full items-center justify-center rounded-[0.6rem] border border-dashed border-oro/30 text-sm text-oro/60" style={{ aspectRatio: "5 / 8.5" }}>
                        {i + 1}
                      </div>
                    )}
                    {total < 10 && <span className="text-center text-xs uppercase tracking-widest text-violeta-suave">{tirada.posiciones[i].nombre}</span>}
                  </div>
                );
              }}
            </DisposicionTirada>
            {total === 10 && (
              <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-texto-suave sm:grid-cols-5">
                {tirada.posiciones.map((p, i) => (
                  <li key={i} className={i < seleccion.length ? "text-oro-suave" : ""}>
                    {i + 1}. {p.nombre}
                  </li>
                ))}
              </ol>
            )}
          </div>

          {!completa && <p className="text-center text-xs text-texto-suave sm:hidden">Desliza el mazo hacia los lados para ver todas las cartas.</p>}
          {!completa && (
            <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-6 sm:mx-0 sm:px-0" aria-label="Mazo desplegado">
              <div className="flex min-w-max justify-center pl-4 pr-8">
                {Array.from({ length: tamanoMazo }, (_, p) => {
                  const t = p / (tamanoMazo - 1);
                  const usada = seleccion.includes(p);
                  return (
                    <div
                      key={p}
                      className={p === 0 ? "" : "-ml-9 sm:-ml-[44px]"}
                      style={{ transform: `translateY(${(1 - Math.sin(Math.PI * t)) * 26}px) rotate(${(t - 0.5) * 18}deg)` }}
                    >
                      <button
                        type="button"
                        onClick={() => elegir(p)}
                        disabled={usada}
                        className={`abanico-carta block w-[54px] ${usada ? "pointer-events-none opacity-0" : ""}`}
                        style={{ "--desde": `${(tamanoMazo / 2 - p) * 12}px`, animationDelay: `${p * 7}ms` } as CSSProperties}
                        aria-label={`Carta ${p + 1} del mazo`}
                      >
                        <div className="dorso-carta w-full" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {completa && (
              <BotonEnviar cargando="Consultando el oráculo…" className="boton boton-primario">
                Revelar mi lectura
              </BotonEnviar>
            )}
            <button type="button" className="boton boton-fantasma" onClick={() => setFase("preparar")}>
              Cambiar tirada o pregunta
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
