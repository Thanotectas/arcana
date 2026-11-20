"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { imagenCarta } from "@/components/CartaVisual";
import { MAZO, type CartaTarot } from "@/lib/tarot/deck";
import { GRUPOS, cartaDelJuego, emblemaGrupo, cartasDelGrupo, rotuloCasilla } from "@/lib/juego/carta-escondida";
import { leerPractica, leerProgreso } from "./CaminoDelLoco";
import { Logros } from "./Extras";

const DORSO = "/cartas/arcana/dorso.webp";
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
        <h2 className="flex items-center gap-2 font-display text-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element -- emblema estático */}
          <img src={emblemaGrupo("mayor")} alt="" className="h-9 w-9" />
          El camino del Loco
        </h2>
        <p className="text-sm text-texto-suave">Los 22 Arcanos Mayores, del Loco al Mundo. Cada uno que descubres ilumina un paso del viaje.</p>
        <Camino cartas={mayores} tiene={tiene} />
      </section>

      {GRUPOS.filter((g) => g.id !== "mayor").map((g) => {
        const cartas = cartasDelGrupo(g.id);
        const n = cartas.filter((c) => tiene.has(c.id)).length;
        return (
          <section key={g.id} className="space-y-3">
            <h2 className="flex items-center justify-between font-display text-2xl">
              <span className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- emblema estático */}
                <img src={emblemaGrupo(g.id)} alt="" className="h-9 w-9" />
                {g.nombre}
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

/**
 * Centro de la ruta dorada de public/juego/mapa.webp (fracción del ancho y del alto), de abajo hacia arriba:
 * trazada sobre la ilustración. Las 22 cartas se reparten a la misma distancia sobre ella.
 */
const RUTA: [number, number][] = [
  [0.518, 0.955], [0.512, 0.918], [0.578, 0.871], [0.646, 0.823], [0.64, 0.791], [0.554, 0.76], [0.437, 0.728], [0.384, 0.697],
  [0.48, 0.64], [0.592, 0.586], [0.607, 0.554], [0.577, 0.522], [0.446, 0.491], [0.372, 0.475], [0.27, 0.443], [0.262, 0.427],
  [0.297, 0.396], [0.348, 0.38], [0.557, 0.348], [0.607, 0.317], [0.592, 0.285], [0.557, 0.269], [0.476, 0.253], [0.372, 0.237],
  [0.321, 0.222], [0.291, 0.19], [0.306, 0.174], [0.345, 0.158], [0.417, 0.142], [0.479, 0.126], [0.515, 0.095], [0.51, 0.06],
];
const PROPORCION_MAPA = 2000 / 1342;

/** n puntos a la misma distancia a lo largo de la ruta (en el espacio real de la imagen). */
function puntosEnRuta(n: number) {
  const P = RUTA.map(([x, y]) => [x, y * PROPORCION_MAPA] as const);
  const tramos = P.slice(1).map((p, i) => Math.hypot(p[0] - P[i][0], p[1] - P[i][1]));
  const total = tramos.reduce((a, b) => a + b, 0);
  return Array.from({ length: n }, (_, k) => {
    let falta = (k / (n - 1)) * total;
    let i = 0;
    while (i < tramos.length - 1 && falta > tramos[i]) falta -= tramos[i++];
    const t = tramos[i] ? falta / tramos[i] : 0;
    return { x: P[i][0] + (P[i + 1][0] - P[i][0]) * t, y: (P[i][1] + (P[i + 1][1] - P[i][1]) * t) / PROPORCION_MAPA };
  });
}

/** Los 22 mayores sobre el mapa del viaje: del Loco (abajo) al Mundo (la luz de arriba). */
function Camino({ cartas, tiene }: { cartas: CartaTarot[]; tiene: ReadonlySet<string> }) {
  const puntos = puntosEnRuta(cartas.length);
  return (
    <div className="relative overflow-hidden rounded-3xl border border-oro/30" style={{ aspectRatio: "1342 / 2000" }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- ilustración estática */}
      <img src="/juego/mapa.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-noche/25" />
      {cartas.map((c, i) => {
        const p = puntos[i];
        const visible = tiene.has(c.id);
        const r = rotuloCasilla(c);
        return (
          <div key={c.id} className={`absolute -translate-x-1/2 -translate-y-1/2 ${visible ? "z-10 w-[9.5%]" : "w-[6.5%]"}`} style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>
            {visible ? (
              <Link
                href={`/significado-tarot/${c.id}`}
                title={c.nombre}
                className="block aspect-square overflow-hidden rounded-full border-2 border-oro shadow-[0_0_16px_rgba(241,217,154,0.95)] transition hover:scale-125"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- ilustración estática */}
                <img src={imagenCarta(c) ?? DORSO} alt={c.nombre} className="h-full w-full object-cover object-[50%_30%]" />
              </Link>
            ) : (
              <div title={`${r.numero} · por descubrir`} className="flex aspect-square items-center justify-center rounded-full border border-oro/50 bg-noche/55">
                <span className="font-display text-[9px] leading-none text-oro-suave/80 sm:text-xs">{r.numero}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
