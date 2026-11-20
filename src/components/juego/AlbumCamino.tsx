"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { imagenCarta } from "@/components/CartaVisual";
import { MAZO, type CartaTarot } from "@/lib/tarot/deck";
import { GRUPOS, cartaDelJuego, cartasDelGrupo, rotuloCasilla } from "@/lib/juego/carta-escondida";
import { leerPractica, leerProgreso } from "./CaminoDelLoco";
import { Logros } from "./Extras";

const DORSO = "/cartas/arcana/dorso.webp";
const COLUMNAS = 4;
const ALTO_FILA = 170;
const sinSuscripcion = () => () => {};

/** Las cartas descubiertas en este navegador: partidas del día y de práctica que se ganaron. */
function descubiertasLocales() {
  const ids = new Set(leerProgreso().album);
  for (const [n, intentos] of Object.entries(leerPractica())) {
    const carta = cartaDelJuego(Number(n)).id;
    if (intentos.includes(carta)) ids.add(carta);
  }
  return ids;
}

export function AlbumCamino() {
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!enCliente) return <div className="tarjeta h-96 animate-pulse" />;
  return <Album />;
}

function Album() {
  const [locales] = useState(descubiertasLocales);
  const [deCuenta, setDeCuenta] = useState<string[]>([]);
  useEffect(() => {
    let vivo = true;
    fetch("/api/juego", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<{ album: string[] }>) : null))
      .then((d) => vivo && d && setDeCuenta(d.album))
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, []);
  const tiene = new Set([...locales, ...deCuenta]);
  const mayores = cartasDelGrupo("mayor");
  const enCamino = mayores.filter((c) => tiene.has(c.id)).length;

  return (
    <div className="space-y-8">
      <div className="tarjeta space-y-3 p-5">
        <div className="flex items-end justify-between">
          <p className="font-display text-3xl">
            {tiene.size} <span className="text-lg text-texto-suave">de {MAZO.length} cartas</span>
          </p>
          <p className="text-sm text-texto-suave">
            Camino: <strong className="text-oro">{enCamino}</strong> de 22
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-superficie-2">
          <div className="h-full rounded-full bg-gradient-to-r from-violeta to-oro" style={{ width: `${Math.max(2, (tiene.size / MAZO.length) * 100)}%` }} />
        </div>
        {tiene.size === 0 && (
          <p className="text-sm text-texto-suave">
            Todavía no has descubierto ninguna.{" "}
            <Link href="/juego" className="text-oro-suave underline">
              Juega la carta de hoy
            </Link>{" "}
            y empieza tu álbum.
          </p>
        )}
      </div>

      <section className="tarjeta space-y-3 p-5">
        <h2 className="font-display text-2xl">Tus logros</h2>
        <Logros datos={{ album: tiene, mejorRacha: leerProgreso().mejorRacha, distribucion: leerProgreso().distribucion }} />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">El camino del Loco</h2>
        <p className="text-sm text-texto-suave">Los 22 Arcanos Mayores, del Loco al Mundo. Cada uno que descubres ilumina un paso del viaje.</p>
        <Camino cartas={mayores} tiene={tiene} />
      </section>

      {GRUPOS.filter((g) => g.id !== "mayor").map((g) => {
        const cartas = cartasDelGrupo(g.id);
        const n = cartas.filter((c) => tiene.has(c.id)).length;
        return (
          <section key={g.id} className="space-y-3">
            <h2 className="flex items-baseline justify-between font-display text-2xl">
              <span>
                {g.icono} {g.nombre}
              </span>
              <span className="font-sans text-sm text-texto-suave">
                {n} de {cartas.length}
              </span>
            </h2>
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-7">
              {cartas.map((c) => (
                <Carta key={c.id} carta={c} visible={tiene.has(c.id)} />
              ))}
            </div>
          </section>
        );
      })}

      <div className="text-center">
        <Link href="/juego" className="boton boton-primario inline-flex">
          Jugar la carta de hoy
        </Link>
      </div>
    </div>
  );
}

function Carta({ carta, visible, compacta = false }: { carta: CartaTarot; visible: boolean; compacta?: boolean }) {
  const r = rotuloCasilla(carta);
  const imagen = (
    // eslint-disable-next-line @next/next/no-img-element -- ilustración estática
    <img
      src={visible ? (imagenCarta(carta) ?? DORSO) : DORSO}
      alt={visible ? carta.nombre : "Carta por descubrir"}
      loading="lazy"
      className={`w-full rounded-md border ${visible ? "border-oro/60 shadow-[0_0_18px_rgba(241,217,154,0.35)]" : "border-borde opacity-35 grayscale"}`}
    />
  );
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      {visible ? (
        <Link href={`/significado-tarot/${carta.id}`} className="block w-full transition hover:scale-105">
          {imagen}
        </Link>
      ) : (
        <div className="relative w-full">
          {imagen}
          <span className="absolute inset-0 flex items-center justify-center font-display text-xl text-oro/70">?</span>
        </div>
      )}
      <span className={`w-full truncate leading-tight ${compacta ? "text-[10px]" : "text-[10px] sm:text-xs"} ${visible ? "text-texto" : "text-texto-suave"}`}>
        {visible ? carta.nombre : r.numero + (r.nombre && carta.arcano === "menor" ? ` · ${r.nombre}` : "")}
      </span>
    </div>
  );
}

/** Los 22 mayores en un camino que serpentea (izquierda→derecha, luego derecha→izquierda…). */
function Camino({ cartas, tiene }: { cartas: CartaTarot[]; tiene: ReadonlySet<string> }) {
  const filas = Math.ceil(cartas.length / COLUMNAS);
  const posicion = (i: number) => {
    const fila = Math.floor(i / COLUMNAS);
    const col = fila % 2 === 0 ? i % COLUMNAS : COLUMNAS - 1 - (i % COLUMNAS);
    return { fila, col, x: ((col + 0.5) / COLUMNAS) * 100, y: fila * ALTO_FILA + ALTO_FILA * 0.42 };
  };
  const puntos = cartas.map((_, i) => posicion(i));
  return (
    <div className="tarjeta relative overflow-hidden p-3" style={{ height: filas * ALTO_FILA + 24 }}>
      <svg className="absolute" style={{ left: 12, top: 12, width: "calc(100% - 24px)", height: filas * ALTO_FILA }} viewBox={`0 0 100 ${filas * ALTO_FILA}`} preserveAspectRatio="none" aria-hidden>
        {puntos.slice(1).map((p, i) => {
          const a = puntos[i];
          const encendido = tiene.has(cartas[i].id) && tiene.has(cartas[i + 1].id);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={p.x}
              y2={p.y}
              stroke={encendido ? "#f1d99a" : "#3a2d5c"}
              strokeWidth={encendido ? 3 : 2}
              strokeDasharray={encendido ? undefined : "6 6"}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {cartas.map((c, i) => {
        const p = puntos[i];
        return (
          <div key={c.id} className="absolute w-[19%] -translate-x-1/2" style={{ left: `calc(12px + (100% - 24px) * ${p.x / 100})`, top: 12 + p.fila * ALTO_FILA + 6 }}>
            <Carta carta={c} visible={tiene.has(c.id)} compacta />
          </div>
        );
      })}
    </div>
  );
}
