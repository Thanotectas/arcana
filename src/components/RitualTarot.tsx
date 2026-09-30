"use client";

import { useActionState, useState, type CSSProperties } from "react";
import Link from "next/link";
import { accionTarot, type EstadoAccion } from "@/lib/lecturas/acciones";
import { DisposicionTirada } from "./DisposicionTirada";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import type { IdMazo } from "@/lib/tarot/mazos";

export interface TiradaRitual {
  id: "tarot_carta" | "tarot_tres" | "tarot_celta";
  nombre: string;
  descripcion: string;
  posiciones: { nombre: string; descripcion: string }[];
  costoTexto: string;
  disponible: boolean;
}

export interface MazoRitual {
  id: IdMazo;
  nombre: string;
  descripcion: string;
  tamano: number;
  estilo: "rider" | "marsella" | "angeles";
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
 * Ritual de tarot: la persona elige mazo, tirada y pregunta, baraja y escoge
 * sus cartas del abanico. El servidor decide qué carta hay en cada posición.
 */
export function RitualTarot({
  tiradas,
  mazos,
  inicial,
  mazoInicial,
}: {
  tiradas: TiradaRitual[];
  mazos: MazoRitual[];
  inicial: TiradaRitual["id"];
  mazoInicial: IdMazo;
}) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionTarot, {});
  const [tiradaId, setTiradaId] = useState(inicial);
  const [mazoId, setMazoId] = useState<IdMazo>(mazoInicial);
  const [pregunta, setPregunta] = useState("");
  const [fase, setFase] = useState<Fase>("preparar");
  const [seleccion, setSeleccion] = useState<number[]>([]);

  const tirada = tiradas.find((x) => x.id === tiradaId)!;
  const mazo = mazos.find((m) => m.id === mazoId)!;
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

  const sinCreditos = estado.error === "SIN_CREDITOS";
  const faltan = total - seleccion.length;
  const textoElegir = completa
    ? t.tarot.cartasListas
    : total === 1
      ? t.tarot.eligeTuCarta
      : faltan === 1
        ? t.tarot.eligeUltima
        : plantilla(t.tarot.eligeN, { n: faltan });

  return (
    <div className="space-y-8">
      {estado.error && (
        <Aviso>
          {sinCreditos ? t.comun.sinCreditos : estado.error}{" "}
          {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      {fase === "preparar" && (
        <div className="space-y-6 aparecer">
          <section>
            <h2 className="mb-3 text-sm uppercase tracking-[0.25em] text-violeta-suave">{t.tarot.eligeMazo}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {mazos.map((m) => {
                const activo = m.id === mazoId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMazoId(m.id)}
                    className={`tarjeta flex items-center gap-4 p-4 text-left transition ${activo ? "border-oro/60 bg-oro/5" : "hover:border-oro/30"}`}
                    aria-pressed={activo}
                  >
                    <div className={`dorso-carta estilo-${m.estilo} w-14 shrink-0 transition ${activo ? "-rotate-6 scale-105" : ""}`} aria-hidden />
                    <div>
                      <h3 className="font-display text-xl font-semibold">{m.nombre}</h3>
                      <p className="text-xs text-texto-suave">{m.descripcion}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-widest text-oro/80">{plantilla(t.tarot.nCartas, { n: m.tamano })}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            {tiradas.map((x) => {
              const activa = x.id === tiradaId;
              return (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setTiradaId(x.id)}
                  className={`tarjeta p-4 text-left transition ${activa ? "border-oro/60 bg-oro/5" : "hover:border-oro/30"}`}
                  aria-pressed={activa}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-xl font-semibold">{x.nombre}</h2>
                    <span className="shrink-0 text-xs text-violeta-suave">{x.costoTexto}</span>
                  </div>
                  <p className="mt-1 text-xs text-texto-suave">
                    {x.posiciones.length === 1 ? t.tarot.unaCarta : plantilla(t.tarot.nCartas, { n: x.posiciones.length })}
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
                {t.tarot.tuPregunta} {preguntaObligatoria ? "" : t.tarot.opcional}
              </label>
              <textarea
                id="pregunta"
                rows={3}
                maxLength={300}
                className="campo"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder={t.tarot.ejemploPregunta}
              />
              <p className="mt-2 text-xs text-texto-suave">{t.tarot.respira}</p>
            </div>
            {!tirada.disponible && <Aviso tipo="info">{t.tarot.yaUsaste}</Aviso>}
            <button type="button" className="boton boton-primario w-full sm:w-auto" disabled={!puedeBarajar} onClick={barajar}>
              {t.tarot.barajar}
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
                className={`dorso-carta estilo-${mazo.estilo} absolute inset-0`}
                style={{ "--dx": p.dx, "--rot": p.rot, animationDelay: `${i * 60}ms` } as CSSProperties}
              />
            ))}
          </div>
          <p className="font-display text-xl text-oro-suave">{t.tarot.barajando}</p>
        </div>
      )}

      {fase === "elegir" && (
        <form action={enviar} className="space-y-8">
          <input type="hidden" name="tipo" value={tirada.id} />
          <input type="hidden" name="mazo" value={mazo.id} />
          <input type="hidden" name="pregunta" value={pregunta} />
          <input type="hidden" name="posiciones" value={JSON.stringify(seleccion)} />

          <div className="text-center">
            <p className="font-display text-2xl">{textoElegir}</p>
            <p className="text-sm text-texto-suave">
              {completa ? t.tarot.tocaDevolver : plantilla(t.tarot.sigueIntuicion, { n: seleccion.length, total })}
            </p>
          </div>

          <div className="tarjeta p-5">
            <DisposicionTirada total={total}>
              {(i) => {
                const elegida = seleccion.at(i);
                return (
                  <div className="flex w-full flex-col items-center gap-1.5">
                    {elegida !== undefined ? (
                      <button type="button" onClick={() => devolver(i)} className="llegar w-full" aria-label={plantilla(t.tarot.devolverCarta, { posicion: tirada.posiciones[i].nombre })}>
                        <div className={`dorso-carta estilo-${mazo.estilo} w-full`} />
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

          {!completa && <p className="text-center text-xs text-texto-suave sm:hidden">{t.tarot.deslizaMazo}</p>}
          {!completa && (
            <div className="-mx-4 overflow-x-auto px-4 pb-4 pt-6 sm:mx-0 sm:px-0" aria-label={mazo.nombre}>
              <div className="flex min-w-max justify-center pl-4 pr-8">
                {Array.from({ length: mazo.tamano }, (_, p) => {
                  const k = p / (mazo.tamano - 1);
                  const usada = seleccion.includes(p);
                  return (
                    <div
                      key={p}
                      className={p === 0 ? "" : "-ml-9 sm:-ml-[44px]"}
                      style={{ transform: `translateY(${(1 - Math.sin(Math.PI * k)) * 26}px) rotate(${(k - 0.5) * 18}deg)` }}
                    >
                      <button
                        type="button"
                        onClick={() => elegir(p)}
                        disabled={usada}
                        className={`abanico-carta block w-[54px] ${usada ? "pointer-events-none opacity-0" : ""}`}
                        style={{ "--desde": `${(mazo.tamano / 2 - p) * 12}px`, animationDelay: `${p * 7}ms` } as CSSProperties}
                        aria-label={plantilla(t.tarot.cartaN, { n: p + 1 })}
                      >
                        <div className={`dorso-carta estilo-${mazo.estilo} w-full`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            {completa && (
              <BotonEnviar cargando={t.tarot.consultando} className="boton boton-primario">
                {t.tarot.revelarLectura}
              </BotonEnviar>
            )}
            <button type="button" className="boton boton-fantasma" onClick={() => setFase("preparar")}>
              {t.tarot.cambiar}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
