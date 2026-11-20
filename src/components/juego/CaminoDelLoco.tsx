"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { imagenCarta } from "@/components/CartaVisual";
import {
  MAX_INTENTOS,
  PROGRESO_VACIO,
  RACHA_PREMIO,
  buscarCartas,
  cartaDelJuego,
  cartaPorId,
  comparar,
  diaAnterior,
  fechaBogota,
  mensajeDelDia,
  msHastaNuevaCarta,
  nombreGrupo,
  numeroDeJuego,
  pistas,
  terminarPartida,
  textoParaCompartir,
  type Progreso,
} from "@/lib/juego/carta-escondida";

const CLAVE = "arcana-camino-del-loco-v1";

function leerProgreso(): Progreso {
  try {
    const guardado = localStorage.getItem(CLAVE);
    return guardado ? { ...PROGRESO_VACIO, ...(JSON.parse(guardado) as Partial<Progreso>) } : PROGRESO_VACIO;
  } catch {
    return PROGRESO_VACIO;
  }
}

function guardarProgreso(p: Progreso) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(p));
  } catch {
    // Navegación privada o almacenamiento bloqueado: se juega igual, sin guardar.
  }
}

const sinSuscripcion = () => () => {};

/** El juego depende de la fecha y del progreso guardado en el navegador: se pinta solo en el cliente. */
export function CaminoDelLoco() {
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!enCliente) {
    return (
      <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
        <img src="/cartas/arcana/dorso.webp" alt="" className="w-28 animate-pulse rounded-xl border border-oro/50" />
        <p className="text-texto-suave">Sibila está escondiendo la carta de hoy…</p>
      </div>
    );
  }
  return <Juego />;
}

function Juego() {
  const [fecha] = useState(() => fechaBogota());
  const numero = numeroDeJuego(fecha);
  const escondida = useMemo(() => cartaDelJuego(numero), [numero]);
  const [progreso, setProgreso] = useState(leerProgreso);
  const [intentos, setIntentos] = useState<string[]>(() => leerProgreso().partidas[fecha] ?? []);
  const [texto, setTexto] = useState("");

  const cartasIntento = intentos.map((id) => cartaPorId(id)).filter((c) => c !== undefined);
  const comparaciones = cartasIntento.map((c) => comparar(c, escondida));
  const gano = comparaciones.some((c) => c.acierto);
  const termino = gano || intentos.length >= MAX_INTENTOS;
  const fallos = comparaciones.filter((c) => !c.acierto).length;
  const pistasVisibles = pistas(escondida).slice(0, termino ? 6 : 1 + fallos);
  const sugerencias = buscarCartas(texto, new Set(intentos));
  const racha = progreso.ultima === fecha || progreso.ultima === diaAnterior(fecha) ? progreso.racha : 0;

  function adivinar(id: string) {
    if (termino || intentos.includes(id)) return;
    const nuevos = [...intentos, id];
    const acierta = id === escondida.id;
    const siguiente =
      acierta || nuevos.length >= MAX_INTENTOS
        ? terminarPartida(progreso, fecha, nuevos, acierta, escondida.id)
        : { ...progreso, partidas: { ...progreso.partidas, [fecha]: nuevos } };
    setIntentos(nuevos);
    setTexto("");
    setProgreso(siguiente);
    guardarProgreso(siguiente);
  }

  return (
    <div className="space-y-6">
      <div className="tarjeta space-y-5 p-5 sm:p-7">
        <div className="flex items-center justify-between text-sm text-texto-suave">
          <span>Carta #{numero}</span>
          <span>{termino ? "Partida terminada" : `Intento ${intentos.length + 1} de ${MAX_INTENTOS}`}</span>
          <span title="Días seguidos jugando">🔥 {racha}</span>
        </div>

        <div className="flex justify-center">
          {termino ? (
            // eslint-disable-next-line @next/next/no-img-element -- ilustración estática de la carta
            <img src={imagenCarta(escondida) ?? "/cartas/arcana/dorso.webp"} alt={escondida.nombre} className="aparecer w-40 rounded-xl border border-oro/60 shadow-lg sm:w-48" />
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
              <img src="/cartas/arcana/dorso.webp" alt="Carta escondida" className="w-32 rounded-xl border border-oro/50 sm:w-40" />
              <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-oro drop-shadow">?</span>
            </div>
          )}
        </div>

        <ul className="space-y-2">
          {pistasVisibles.map((p, i) => (
            <li key={i} className="aparecer flex gap-2 rounded-lg bg-superficie-2 px-3 py-2 text-sm">
              <span className="text-oro">✦</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {!termino && (
          <div className="space-y-2">
            <label className="block text-sm text-texto-suave" htmlFor="intento">
              ¿Qué carta es? Escribe su nombre (por ejemplo «Luna», «As de Copas», «Reina de Oros»)
            </label>
            <input
              id="intento"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && sugerencias[0]) adivinar(sugerencias[0].id);
              }}
              placeholder="Escribe una carta…"
              autoComplete="off"
              className="campo w-full"
            />
            {sugerencias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sugerencias.map((c) => (
                  <button key={c.id} type="button" onClick={() => adivinar(c.id)} className="boton boton-secundario px-3 py-1.5 text-sm">
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {cartasIntento.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-1 text-xs uppercase tracking-wider text-texto-suave">
              <span>Tu intento</span>
              <span className="w-28 text-center">Grupo</span>
              <span className="w-20 text-center">Número</span>
            </div>
            {cartasIntento.map((c, i) => {
              const r = comparaciones[i];
              return (
                <div key={c.id} className="aparecer grid grid-cols-[1fr_auto_auto] items-center gap-2">
                  <span className={`truncate rounded-lg px-3 py-2 text-sm ${r.acierto ? "bg-violeta font-semibold text-white" : "bg-superficie-2"}`}>{c.nombre}</span>
                  <span className={`w-28 rounded-lg px-2 py-2 text-center text-xs ${r.grupo ? "bg-violeta text-white" : "bg-superficie-2 text-texto-suave"}`}>{nombreGrupo(c)}</span>
                  <span className={`w-20 rounded-lg px-2 py-2 text-center text-sm ${r.numero === "igual" ? "bg-violeta text-white" : "bg-superficie-2"}`}>
                    {c.numero} {r.numero === "mayor" ? "⬆️" : r.numero === "menor" ? "⬇️" : "✓"}
                  </span>
                </div>
              );
            })}
            {!termino && <p className="text-xs text-texto-suave">Morado: coincide. ⬆️ la carta escondida tiene un número mayor; ⬇️ menor.</p>}
          </div>
        )}
      </div>

      {termino && <Final numero={numero} escondida={escondida} gano={gano} comparaciones={comparaciones} progreso={progreso} racha={racha} />}

      <details className="tarjeta p-5 text-sm text-texto-suave">
        <summary className="cursor-pointer font-semibold text-texto">¿Cómo se juega?</summary>
        <div className="mt-3 space-y-2">
          <p>Cada día Sibila esconde una de las 78 cartas del tarot. Es la misma para todos y cambia a medianoche (hora de Colombia).</p>
          <p>Tienes {MAX_INTENTOS} intentos. En cada uno ves si acertaste el grupo (Arcanos Mayores, Bastos, Copas, Espadas u Oros) y si el número de la carta escondida es mayor ⬆️ o menor ⬇️. En los menores, el As es 1, la Sota 11, el Caballero 12, la Reina 13 y el Rey 14.</p>
          <p>Con cada fallo, Sibila te da una pista más. Cada carta que descubres entra en tu álbum, y si juegas {RACHA_PREMIO} días seguidos te regalamos 1 crédito para tus lecturas.</p>
        </div>
      </details>
    </div>
  );
}

function Final({
  numero,
  escondida,
  gano,
  comparaciones,
  progreso,
  racha,
}: {
  numero: number;
  escondida: NonNullable<ReturnType<typeof cartaPorId>>;
  gano: boolean;
  comparaciones: ReturnType<typeof comparar>[];
  progreso: Progreso;
  racha: number;
}) {
  const [copiado, setCopiado] = useState(false);
  const texto = textoParaCompartir(numero, comparaciones, gano, racha, window.location.origin);
  const faltan = RACHA_PREMIO - (racha % RACHA_PREMIO);
  const premio = racha > 0 && racha % RACHA_PREMIO === 0;

  async function compartir() {
    if (navigator.share) {
      try {
        await navigator.share({ text: texto });
        return;
      } catch {
        // Si se cancela o falla, se copia.
      }
    }
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <div className="tarjeta aparecer space-y-5 p-5 text-center sm:p-7">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-violeta-suave">{gano ? `La encontraste en ${comparaciones.length}` : "Hoy se escondió muy bien"}</p>
        <h2 className="font-display text-3xl font-semibold">{escondida.nombre}</h2>
      </div>
      <p className="mx-auto max-w-lg text-texto">{mensajeDelDia(escondida)}</p>
      <p className="mx-auto max-w-lg text-sm text-texto-suave">
        <span className="text-oro">En el amor:</span> {escondida.amor}
      </p>

      <pre className="mx-auto w-fit max-w-full whitespace-pre-wrap break-words rounded-xl bg-superficie-2 px-4 py-3 text-left font-sans text-sm leading-relaxed">{texto}</pre>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={compartir} className="boton boton-primario">
          {copiado ? "¡Copiado! Pégalo donde quieras" : "Compartir resultado"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="boton boton-whatsapp">
          Enviar por WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { n: progreso.jugadas, t: "Jugadas" },
          { n: progreso.jugadas ? Math.round((progreso.ganadas / progreso.jugadas) * 100) : 0, t: "% ganadas" },
          { n: racha, t: "Racha 🔥" },
          { n: progreso.mejorRacha, t: "Mejor racha" },
        ].map((x) => (
          <div key={x.t} className="rounded-xl bg-superficie-2 p-3">
            <div className="text-2xl font-semibold tabular-nums">{x.n}</div>
            <div className="text-xs text-texto-suave">{x.t}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-oro/40 p-4 text-sm">
        {premio ? (
          <p>
            🎁 <strong>¡{racha} días seguidos!</strong> Ganaste 1 crédito de regalo para tus lecturas. Muy pronto lo reclamas desde tu cuenta de Arcana.
          </p>
        ) : (
          <p>
            🔥 Llevas {racha} {racha === 1 ? "día" : "días"} seguidos. Te {faltan === 1 ? "falta 1 día" : `faltan ${faltan} días`} para ganar <strong>1 crédito de regalo</strong>.
          </p>
        )}
        <p className="mt-1 text-texto-suave">Tu álbum: {progreso.album.length} de 78 cartas descubiertas.</p>
      </div>

      <Cuenta />

      <Link href="/tarot" className="boton boton-secundario">
        ¿Qué te dice esta carta a ti? Pregúntale a Sibila
      </Link>
    </div>
  );
}

function Cuenta() {
  const [ms, setMs] = useState(() => msHastaNuevaCarta());
  useEffect(() => {
    const t = setInterval(() => setMs(msHastaNuevaCarta()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor(ms / 1000);
  const dos = (n: number) => String(n).padStart(2, "0");
  return (
    <p className="text-sm text-texto-suave">
      Nueva carta escondida en <span className="font-mono text-texto">{dos(Math.floor(s / 3600))}:{dos(Math.floor((s % 3600) / 60))}:{dos(s % 60)}</span>
    </p>
  );
}
