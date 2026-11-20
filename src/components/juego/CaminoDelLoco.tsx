"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type TouchEvent } from "react";
import Link from "next/link";
import { imagenCarta } from "@/components/CartaVisual";
import { AvisoDiario } from "@/components/AvisoDiario";
import { estaInstalada, pedirInstalacion, usePuedeInstalar } from "@/lib/instalar";
import { medir } from "@/lib/marca/medicion";
import { Logros, Tutorial, VozSibila } from "./Extras";
import { RankingSemanal } from "./Ranking";
import { MensajeSibila } from "./MensajeSibila";
import { contarEvento } from "@/lib/juego/eventos";
import { guardarSonido, sonidoActivo, sonidoCerca, sonidoElegir, sonidoFrio, sonidoGanar, sonidoPerder, sonidoPista, sonidoTocar } from "@/lib/juego/sonido";
import type { CartaTarot } from "@/lib/tarot/deck";
import {
  COMODINES,
  GRUPOS,
  emblemaGrupo,
  MAX_INTENTOS,
  MAX_INTENTOS_MAESTRO,
  PUNTOS_MAESTRO,
  cartaMaestra,
  cumpleComodin,
  pistasMaestras,
  premiosAlbum,
  textoComodin,
  type Comodin,
  PROGRESO_VACIO,
  RACHA_PREMIO,
  buscarCartas,
  cartaDelJuego,
  cartaPorId,
  cartasDelGrupo,
  comparar,
  diaAnterior,
  enlaceResultado,
  fechaBogota,
  fechaDeNumero,
  codigoResultado,
  grupo,
  mensajeDelDia,
  msHastaNuevaCarta,
  nombreGrupo,
  numeroDeJuego,
  pistas,
  posibles,
  reaccion,
  rotuloCasilla,
  terminarPartida,
  textoParaCompartir,
  type Comparacion,
  type IdGrupo,
  type Progreso,
  type ResultadoCompartido,
} from "@/lib/juego/carta-escondida";

const CLAVE = "arcana-camino-del-loco-v1";

/** Las caras de Sibila según el momento de la partida (public/juego/sibila-*.webp). */
type Cara = "pista" | "tibio" | "caliente" | "gana" | "pierde";
const cara = (c: Cara) => `/juego/sibila-${c}.webp`;
const CARA_CALOR: Record<string, Cara> = { frio: "tibio", tibio: "tibio", caliente: "caliente" };

/** Lo que devuelve /api/juego (el progreso guardado en la cuenta). */
interface ProgresoCuenta {
  racha: number;
  mejorRacha: number;
  jugadas: number;
  ganadas: number;
  album: string[];
  hoy: string[] | null;
  creditosGanados: number;
  maestros?: number;
  maestroHoy?: string[] | null;
}
interface PremioNuevo {
  id: string;
  nombre: string;
  creditos: number;
}
type Sesion = "?" | "si" | "no";

/** Guarda en la cuenta la partida terminada de hoy. null: sin sesión; undefined: falló. */
async function enviarPartida(
  fecha: string,
  intentos: string[],
  comodin: Comodin | null,
): Promise<{ progreso: ProgresoCuenta; premio: boolean; premiosAlbum: PremioNuevo[] } | null | undefined> {
  try {
    const r = await fetch("/api/juego", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fecha, intentos, comodin }) });
    if (r.status === 401) return null;
    const d = (await r.json()) as { ok: boolean; progreso?: ProgresoCuenta; premio?: boolean; premiosAlbum?: PremioNuevo[] };
    return d.ok && d.progreso ? { progreso: d.progreso, premio: Boolean(d.premio), premiosAlbum: d.premiosAlbum ?? [] } : undefined;
  } catch {
    return undefined;
  }
}
const DORSO = "/cartas/arcana/dorso.webp";
const CLAVE_PRACTICA = "arcana-camino-practica-v1";

/** Partidas de práctica (días anteriores): no cuentan para la racha ni el crédito. */
export function leerPractica(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_PRACTICA) ?? "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}
function guardarPractica(numero: number, intentos: string[]) {
  try {
    localStorage.setItem(CLAVE_PRACTICA, JSON.stringify({ ...leerPractica(), [numero]: intentos }));
  } catch {
    /* nada */
  }
}

const CLAVE_COMODIN = "arcana-camino-comodin-v1";
type UsoComodin = { tipo: Comodin; en: number };

/** El comodín usado en cada carta (por número): una ayuda por carta. */
function leerComodin(numero: number): UsoComodin | null {
  try {
    return (JSON.parse(localStorage.getItem(CLAVE_COMODIN) ?? "{}") as Record<string, UsoComodin>)[numero] ?? null;
  } catch {
    return null;
  }
}
function guardarComodin(numero: number, uso: UsoComodin) {
  try {
    localStorage.setItem(CLAVE_COMODIN, JSON.stringify({ ...(JSON.parse(localStorage.getItem(CLAVE_COMODIN) ?? "{}") as object), [numero]: uso }));
  } catch {
    /* nada */
  }
}

const CLAVE_MAESTRO = "arcana-camino-maestro-v1";

/** Retos maestros jugados en este navegador (por fecha). */
export function leerMaestro(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_MAESTRO) ?? "{}") as Record<string, string[]>;
  } catch {
    return {};
  }
}
function guardarMaestro(fecha: string, intentos: string[]) {
  try {
    localStorage.setItem(CLAVE_MAESTRO, JSON.stringify({ ...leerMaestro(), [fecha]: intentos }));
  } catch {
    /* nada */
  }
}
/** Cuántos retos maestros se superaron en este navegador. */
export function maestrosGanados() {
  return Object.entries(leerMaestro()).filter(([f, ids]) => {
    const n = numeroDeJuego(f);
    return n >= 1 && ids.includes(cartaMaestra(n).id);
  }).length;
}

export function leerProgreso(): Progreso {
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
export function CaminoDelLoco({ clavePublica, diaPractica = null, reto = null }: { clavePublica: string | null; diaPractica?: number | null; reto?: ResultadoCompartido | null }) {
  const enCliente = useSyncExternalStore(sinSuscripcion, () => true, () => false);
  if (!enCliente) {
    return (
      <div className="tarjeta flex flex-col items-center gap-4 p-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
        <img src={DORSO} alt="" className="w-28 animate-pulse rounded-xl border border-oro/50" />
        <p className="text-texto-suave">Sibila está escondiendo la carta de hoy…</p>
      </div>
    );
  }
  return <Juego clavePublica={clavePublica} diaPractica={diaPractica} reto={reto} />;
}

function Juego({ clavePublica, diaPractica, reto }: { clavePublica: string | null; diaPractica: number | null; reto: ResultadoCompartido | null }) {
  const [fecha] = useState(() => fechaBogota());
  const numeroHoy = numeroDeJuego(fecha);
  const practica = diaPractica !== null && diaPractica >= 1 && diaPractica < numeroHoy;
  const numero = practica ? diaPractica : numeroHoy;
  const escondida = useMemo(() => cartaDelJuego(numero), [numero]);
  const [progreso, setProgreso] = useState(leerProgreso);
  const [intentos, setIntentos] = useState<string[]>(() => (practica ? (leerPractica()[numero] ?? []) : (leerProgreso().partidas[fecha] ?? [])));
  const [sesion, setSesion] = useState<Sesion>("?");
  const [cuenta, setCuenta] = useState<ProgresoCuenta | null>(null);
  const [premioNuevo, setPremioNuevo] = useState(false);
  const [premiosNuevos, setPremiosNuevos] = useState<PremioNuevo[]>([]);
  const [comodin, setComodin] = useState<UsoComodin | null>(() => leerComodin(numero));

  // Con sesión: trae el progreso de la cuenta. Si hoy ya jugó en otro dispositivo, muestra esa partida; si jugó
  // aquí antes de entrar, la guarda en la cuenta.
  useEffect(() => {
    if (practica) return;
    let vivo = true;
    fetch("/api/juego", { cache: "no-store" })
      .then(async (r) => {
        if (!vivo) return;
        if (r.status === 401) return setSesion("no");
        if (!r.ok) return;
        const d = (await r.json()) as ProgresoCuenta;
        if (!vivo) return;
        setSesion("si");
        setCuenta(d);
        const locales = leerProgreso().partidas[fecha] ?? [];
        const escondidaHoy = cartaDelJuego(numeroDeJuego(fecha)).id;
        const terminadaAqui = locales.includes(escondidaHoy) || locales.length >= MAX_INTENTOS;
        if (d.hoy?.length && !locales.length) setIntentos(d.hoy);
        else if (!d.hoy && terminadaAqui) {
          const r2 = await enviarPartida(fecha, locales, leerComodin(numeroDeJuego(fecha))?.tipo ?? null);
          if (vivo && r2) {
            setCuenta(r2.progreso);
            setPremioNuevo(r2.premio);
            setPremiosNuevos(r2.premiosAlbum);
          }
        }
      })
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, [fecha, practica]);

  const cartasIntento = intentos.map((id) => cartaPorId(id)).filter((c) => c !== undefined);
  const comparaciones = cartasIntento.map((c) => comparar(c, escondida));
  const gano = comparaciones.some((c) => c.acierto);
  const termino = gano || intentos.length >= MAX_INTENTOS;
  const fallos = comparaciones.filter((c) => !c.acierto).length;
  const todasLasPistas = pistas(escondida);
  const ultimaCarta = cartasIntento[cartasIntento.length - 1];
  const caraActual: Cara = termino ? (gano ? "gana" : "pierde") : ultimaCarta ? CARA_CALOR[reaccion(ultimaCarta, escondida, cartasIntento.length).calor] : "pista";
  const [sonido, setSonido] = useState(sonidoActivo);
  const [celebrar, setCelebrar] = useState(false);
  const rachaLocal = progreso.ultima === fecha || progreso.ultima === diaAnterior(fecha) ? progreso.racha : 0;
  const racha = cuenta ? cuenta.racha : rachaLocal;
  const quedan = posibles(cartasIntento, comparaciones, comodin ? (c) => cumpleComodin(c, comodin.tipo, escondida) : undefined);

  function usarComodin(tipo: Comodin) {
    if (comodin || termino) return;
    const uso = { tipo, en: intentos.length };
    setComodin(uso);
    guardarComodin(numero, uso);
    if (!practica) contarEvento("comodin");
    sonidoPista();
    navigator.vibrate?.([20, 40, 20]);
    setTimeout(() => document.getElementById("selector-juego")?.scrollIntoView({ behavior: "smooth", block: "end" }), 500);
  }

  /** Sonido, vibración y estallido según cómo salió el intento. */
  function reaccionar(id: string, nuevos: string[]) {
    const intento = cartaPorId(id);
    if (id === escondida.id) {
      sonidoGanar();
      navigator.vibrate?.([40, 60, 40, 60, 120]);
      setCelebrar(true);
      setTimeout(() => setCelebrar(false), 2600);
    } else if (nuevos.length >= MAX_INTENTOS) {
      sonidoPerder();
      navigator.vibrate?.(200);
    } else if (intento) {
      const { calor } = reaccion(intento, escondida, nuevos.length);
      (calor === "frio" ? sonidoFrio : sonidoCerca)();
      navigator.vibrate?.(calor === "caliente" ? [30, 40, 30] : 25);
      setTimeout(sonidoPista, 650);
    }
  }

  function adivinar(id: string) {
    if (termino || intentos.includes(id)) return;
    const nuevos = [...intentos, id];
    const acierta = id === escondida.id;
    sonidoElegir();
    setTimeout(() => reaccionar(id, nuevos), 450);
    // Que se vea la respuesta de Sibila y el selector (o el resultado) sin tener que buscarlos.
    setTimeout(() => document.getElementById(acierta || nuevos.length >= MAX_INTENTOS ? "resultado-juego" : "selector-juego")?.scrollIntoView({ behavior: "smooth", block: acierta || nuevos.length >= MAX_INTENTOS ? "start" : "end" }), 900);
    if (practica) {
      setIntentos(nuevos);
      guardarPractica(numero, nuevos);
      return;
    }
    if (intentos.length === 0) contarEvento("inicio");
    const siguiente =
      acierta || nuevos.length >= MAX_INTENTOS
        ? terminarPartida(progreso, fecha, nuevos, acierta, escondida.id)
        : { ...progreso, partidas: { ...progreso.partidas, [fecha]: nuevos } };
    if (acierta || nuevos.length >= MAX_INTENTOS) {
      // Para los anuncios (solo si la persona aceptó la medición): quién jugó, sin decir qué carta.
      medir("JuegoTerminado", { gano: acierta ? 1 : 0, intentos: nuevos.length });
      contarEvento("fin", { gano: acierta, intentos: nuevos.length });
      void enviarPartida(fecha, nuevos, comodin?.tipo ?? null).then((r) => {
        if (r === null) setSesion("no");
        else if (r) {
          setSesion("si");
          setCuenta(r.progreso);
          setPremioNuevo(r.premio);
          setPremiosNuevos(r.premiosAlbum);
        }
      });
    }
    setIntentos(nuevos);
    setProgreso(siguiente);
    guardarProgreso(siguiente);
  }

  return (
    <div className="space-y-6">
      {!practica && intentos.length === 0 && <Tutorial />}
      {reto && !practica && <Reto reto={reto} numeroHoy={numeroHoy} />}
      {practica && (
        <div className="tarjeta flex items-center justify-between gap-3 border border-violeta-suave/40 p-3 text-sm">
          <span>
            🧭 <strong>Práctica:</strong> carta del {new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${fechaDeNumero(numero)}T12:00:00Z`))}. No cuenta para tu racha.
          </span>
          <Link href="/juego" className="shrink-0 text-oro-suave underline">
            Ir a la de hoy
          </Link>
        </div>
      )}
      <div className="tarjeta space-y-5 p-4 sm:p-7">
        <div className="flex items-center justify-between text-sm text-texto-suave">
          <span className="rounded-full bg-superficie-2 px-3 py-1">Carta #{numero}</span>
          <Vidas usados={intentos.length} gano={gano} />
          <span className="flex items-center gap-1.5">
            <span className="rounded-full bg-superficie-2 px-3 py-1" title="Días seguidos jugando">
              🔥 {racha}
            </span>
            <button
              type="button"
              onClick={() => {
                guardarSonido(!sonido);
                setSonido(!sonido);
              }}
              aria-label={sonido ? "Silenciar el juego" : "Activar el sonido"}
              className="rounded-full bg-superficie-2 px-2 py-1"
            >
              {sonido ? "🔊" : "🔇"}
            </button>
          </span>
        </div>

        <div className="relative flex justify-center py-1">
          {/* Sibila mira la partida: su cara cambia con cada intento. */}
          <figure className="absolute left-0 top-1 flex w-20 flex-col items-center sm:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element -- retrato estático */}
            <img key={caraActual} src={cara(caraActual)} alt="Sibila" className="burbuja-entra h-16 w-16 rounded-full border-2 border-oro/70 shadow-[0_0_24px_rgba(241,217,154,0.35)] sm:h-20 sm:w-20" />
            <figcaption className="mt-1 font-display text-sm text-oro-suave">Sibila</figcaption>
          </figure>
          {termino ? (
            // eslint-disable-next-line @next/next/no-img-element -- ilustración estática de la carta
            <img src={imagenCarta(escondida) ?? DORSO} alt={escondida.nombre} className="voltear-carta w-40 rounded-xl sm:w-48" />
          ) : (
            <div className="flotar-carta relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
              <img
                src={DORSO}
                alt="Carta escondida"
                className="w-28 rounded-xl border border-oro/50 transition-shadow duration-700 sm:w-36"
                style={{ boxShadow: `0 0 ${30 + fallos * 12}px rgba(139,108,246,${0.4 + fallos * 0.08})` }}
              />
              <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-oro drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">?</span>
            </div>
          )}
          {celebrar && <Estallido />}
        </div>

        <Conversacion
          pistas={todasLasPistas}
          cartas={cartasIntento}
          comparaciones={comparaciones}
          escondida={escondida}
          termino={termino}
          gano={gano}
          comodin={comodin ? { texto: textoComodin(comodin.tipo, escondida), en: comodin.en } : null}
        />

        {!termino && !comodin && <ComodinSibila onUsar={usarComodin} />}

        {!termino && (
          <Selector
            key={comodin?.tipo ?? "sin-comodin"}
            intentados={new Set(intentos)}
            quedan={quedan}
            sugerido={comodin?.tipo === "grupo" ? (grupo(escondida) as IdGrupo) : cartasIntento.length ? null : "mayor"}
            onElegir={adivinar}
          />
        )}
      </div>

      {termino && practica && (
        <div className="tarjeta aparecer space-y-4 p-5 text-center sm:p-7">
          <p className="text-sm uppercase tracking-[0.25em] text-violeta-suave">{gano ? `La encontraste en ${comparaciones.length}` : "Esta se escondió muy bien"}</p>
          <h2 className="brillo-oro font-display text-4xl font-semibold">{escondida.nombre}</h2>
          <p className="mx-auto max-w-lg text-texto">{mensajeDelDia(escondida)}</p>
          <VozSibila carta={escondida.id} />
          <div>
            <Link href="/juego" className="boton boton-primario inline-flex">
              Jugar la carta de hoy
            </Link>
          </div>
        </div>
      )}

      {termino && !practica && (
        <Final
          numero={numero}
          escondida={escondida}
          gano={gano}
          comparaciones={comparaciones}
          progreso={progreso}
          racha={racha}
          sesion={sesion}
          cuenta={cuenta}
          premioNuevo={premioNuevo}
          premiosNuevos={premiosNuevos}
          conComodin={Boolean(comodin)}
          fecha={fecha}
          clavePublica={clavePublica}
        />
      )}

      {(termino || practica) && <DiasAnteriores numeroHoy={numeroHoy} actual={numero} progreso={progreso} />}

      <Instalar />

      <details className="tarjeta p-5 text-sm text-texto-suave">
        <summary className="cursor-pointer font-semibold text-texto">¿Cómo se juega?</summary>
        <div className="mt-3 space-y-2">
          <p>Cada día Sibila esconde una de las 78 cartas del tarot. Es la misma para todos y cambia a medianoche (hora de Colombia).</p>
          <p>
            Tienes {MAX_INTENTOS} intentos. Elige un grupo (Mayores, Bastos, Copas, Espadas u Oros) y una carta. Verás si acertaste el grupo y si el número de la
            escondida es mayor ⬆️ o menor ⬇️. Las cartas que ya no pueden ser se apagan. En los menores, el As es 1, la Sota 11, el Caballo 12, la Reina 13 y el Rey 14.
          </p>
          <p>Con cada fallo, Sibila te da una pista más. Si te atascas, pídele su comodín (uno por carta): te revela el grupo, si el número es par o impar, o si es alto o bajo.</p>
          <p>
            Cada carta que descubres entra en tu álbum. Si juegas {RACHA_PREMIO} días seguidos te regalamos 1 crédito; si completas un palo, 2 créditos; los 22 Arcanos
            Mayores, 3; y las 78 cartas, 5.
          </p>
          <p>
            Cuando encuentras la carta del día se abre el <strong>reto maestro</strong>: otra carta, {MAX_INTENTOS_MAESTRO} intentos y pistas en clave. Y cada semana hay
            ranking: encontrarla en 1 intento da 7 puntos, en 2 da 6… en 6 da 2; jugar sin encontrarla da 1; el comodín resta 1 y el reto maestro suma {PUNTOS_MAESTRO}.
          </p>
        </div>
      </details>
    </div>
  );
}

/** Seis estrellas: se apagan con cada intento. */
function Vidas({ usados, gano, max = MAX_INTENTOS }: { usados: number; gano: boolean; max?: number }) {
  return (
    <span className="flex gap-1" aria-label={`${max - usados} intentos restantes`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`text-base transition-opacity ${i < usados ? (gano && i === usados - 1 ? "text-oro estrella-gana" : "opacity-25 estrella-cae") : "text-oro"}`}>
          ★
        </span>
      ))}
    </span>
  );
}

function Miniatura({ carta, className = "w-8" }: { carta: CartaTarot; className?: string }) {
  const src = imagenCarta(carta);
  // eslint-disable-next-line @next/next/no-img-element -- ilustración estática
  return src ? <img src={src} alt="" className={`${className} rounded-[4px] border border-borde`} /> : <span className={className} />;
}

/** Lo que Sibila va diciendo y tus intentos, como un chat: su pista, tu carta (con lo que coincidió), su reacción y la siguiente pista. */
function Conversacion({
  pistas,
  cartas,
  comparaciones,
  escondida,
  termino,
  gano,
  comodin = null,
  max = MAX_INTENTOS,
}: {
  pistas: string[];
  cartas: CartaTarot[];
  comparaciones: Comparacion[];
  escondida: CartaTarot;
  termino: boolean;
  gano: boolean;
  comodin?: { texto: string; en: number } | null;
  max?: number;
}) {
  type Mensaje = { de: "sibila"; texto: string; calor?: string; cara: Cara; comodin?: boolean } | { de: "tu"; carta: CartaTarot; r: Comparacion };
  const mensajes: Mensaje[] = [{ de: "sibila", texto: pistas[0], cara: "pista" }];
  const ponerComodin = () => comodin && mensajes.push({ de: "sibila", texto: comodin.texto, cara: "caliente", comodin: true });
  if (comodin?.en === 0) ponerComodin();
  cartas.forEach((carta, i) => {
    const r = comparaciones[i];
    mensajes.push({ de: "tu", carta, r });
    if (r.acierto) mensajes.push({ de: "sibila", texto: "¡Ahí está! ✨ La encontraste.", cara: "gana" });
    else if (i === max - 1) mensajes.push({ de: "sibila", texto: `Hoy se escondió muy bien… era ${escondida.nombre}. 🌙`, cara: "pierde" });
    else {
      const re = reaccion(carta, escondida, i + 1);
      mensajes.push({ de: "sibila", texto: re.texto, calor: re.calor, cara: CARA_CALOR[re.calor] });
      if (pistas[i + 1]) mensajes.push({ de: "sibila", texto: pistas[i + 1], cara: "pista" });
    }
    if (comodin?.en === i + 1) ponerComodin();
  });
  const ultimo = mensajes.length - 1;
  return (
    <div className="space-y-2.5" aria-live="polite">
      {mensajes.map((m, i) =>
        m.de === "sibila" ? (
          <div key={i} className="burbuja-entra flex items-end gap-2" style={{ animationDelay: i === ultimo && i > 0 ? "0.35s" : "0s" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- retrato estático */}
            <img src={cara(m.cara)} alt="" className="h-8 w-8 shrink-0 rounded-full border border-oro/60" />
            <p
              className={`max-w-[85%] rounded-2xl rounded-bl-sm px-3.5 py-2 text-sm ${
                m.comodin ? "bg-violeta/30 ring-1 ring-violeta-suave" : m.calor === "caliente" ? "bg-oro/15 ring-1 ring-oro/50" : m.calor === "frio" ? "bg-sky-900/30" : i === ultimo && !termino ? "bg-superficie-2 ring-1 ring-oro/40" : "bg-superficie-2"
              }`}
            >
              {i === ultimo && !termino ? <Escribiendo texto={m.texto} /> : m.texto}
            </p>
          </div>
        ) : (
          <div key={i} className={`burbuja-entra ml-auto flex max-w-[92%] items-center gap-2 rounded-2xl rounded-br-sm p-1.5 pr-2 ${m.r.acierto ? "bg-violeta/40 ring-1 ring-oro/70" : "bg-violeta/15"}`}>
            <Miniatura carta={m.carta} />
            <span className={`min-w-0 flex-1 truncate text-sm ${m.r.acierto ? "font-semibold" : ""}`}>{m.carta.nombre}</span>
            <span className={`voltear-chip shrink-0 rounded-md px-2 py-1 text-[11px] ${m.r.grupo ? "bg-violeta text-white" : "bg-noche/60 text-texto-suave"}`} style={{ animationDelay: "0.1s" }}>
              {nombreGrupo(m.carta)}
            </span>
            <span className={`voltear-chip w-14 shrink-0 rounded-md px-1 py-1 text-center text-sm ${m.r.numero === "igual" ? "bg-violeta text-white" : "bg-noche/60"}`} style={{ animationDelay: "0.3s" }}>
              {m.carta.numero} {m.r.numero === "mayor" ? "⬆️" : m.r.numero === "menor" ? "⬇️" : "✓"}
            </span>
          </div>
        ),
      )}
      {termino && gano && <p className="sr-only">La encontraste.</p>}
    </div>
  );
}

/** El último mensaje de Sibila aparece letra por letra, como si lo estuviera escribiendo. */
function Escribiendo({ texto }: { texto: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x >= texto.length ? x : x + 2)), 22);
    return () => clearInterval(t);
  }, [texto]);
  return (
    <>
      {texto.slice(0, n)}
      {n < texto.length && <span className="opacity-0">{texto.slice(n)}</span>}
    </>
  );
}

/** Estrellas doradas que salen de la carta al encontrarla. */
function Estallido() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => {
        const angulo = (i / 18) * Math.PI * 2;
        const distancia = 110 + (i % 3) * 35;
        return (
          <span
            key={i}
            className="particula absolute text-oro"
            style={{ "--x": `${Math.cos(angulo) * distancia}px`, "--y": `${Math.sin(angulo) * distancia}px`, animationDelay: `${(i % 4) * 0.05}s`, fontSize: 12 + (i % 3) * 6 } as React.CSSProperties}
          >
            {i % 2 ? "✦" : "★"}
          </span>
        );
      })}
    </div>
  );
}

/** Selector visual: pestañas por grupo y una casilla por carta. Las que ya no pueden ser se apagan. */
/** Color, elemento y tema de cada grupo, para que se reconozcan de un vistazo. */
const ESTILO_GRUPO: Record<IdGrupo, { color: string; elemento: string; tema: string }> = {
  mayor: { color: "#b69cff", elemento: "Arcanos Mayores", tema: "el viaje del alma" },
  bastos: { color: "#ff9a4d", elemento: "Fuego", tema: "acción, pasión y proyectos" },
  copas: { color: "#5cc8ff", elemento: "Agua", tema: "emociones y vínculos" },
  espadas: { color: "#c9d6ea", elemento: "Aire", tema: "pensamiento y decisiones" },
  oros: { color: "#f5c84c", elemento: "Tierra", tema: "dinero, cuerpo y lo material" },
};

const miniCarta = (c: CartaTarot) => `/cartas/rider-mini/${c.id}.webp`;

function Selector({ intentados, quedan, sugerido, onElegir }: { intentados: ReadonlySet<string>; quedan: ReadonlySet<string>; sugerido: IdGrupo | null; onElegir: (id: string) => void }) {
  const [pestana, setPestana] = useState<IdGrupo>(sugerido ?? "mayor");
  const [elegida, setElegida] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [soloPosibles, setSoloPosibles] = useState(false);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const cartaElegida = elegida ? cartaPorId(elegida) : undefined;
  const sugerencias = buscarCartas(texto, intentados, 6);
  const todas = cartasDelGrupo(pestana);
  const cartas = soloPosibles ? todas.filter((c) => quedan.has(c.id) && !intentados.has(c.id)) : todas;
  const posiblesPorGrupo = (g: IdGrupo) => cartasDelGrupo(g).filter((c) => quedan.has(c.id) && !intentados.has(c.id)).length;
  const estilo = ESTILO_GRUPO[pestana];
  const posiblesAqui = posiblesPorGrupo(pestana);

  function cambiarGrupo(g: IdGrupo) {
    if (g === pestana) return;
    sonidoTocar();
    setPestana(g);
  }

  function seleccionar(c: CartaTarot) {
    sonidoTocar();
    setElegida(c.id);
    setPestana(grupo(c) as IdGrupo);
    setTexto("");
  }

  /** Deslizar de lado sobre las cartas pasa al grupo vecino. */
  function alSoltar(e: TouchEvent) {
    const ini = toque.current;
    toque.current = null;
    if (!ini) return;
    const dx = e.changedTouches[0].clientX - ini.x;
    const dy = e.changedTouches[0].clientY - ini.y;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const i = GRUPOS.findIndex((g) => g.id === pestana);
    const otro = GRUPOS[(i + (dx < 0 ? 1 : -1) + GRUPOS.length) % GRUPOS.length];
    cambiarGrupo(otro.id);
  }

  return (
    <div id="selector-juego" className="scroll-mb-4 space-y-3 border-t border-borde pt-4">
      <p className="text-center text-sm text-texto-suave">¿Qué carta es? Elige un grupo y toca una carta.</p>

      <div className="grid grid-cols-5 gap-1.5 pt-2" role="tablist" aria-label="Grupos del tarot">
        {GRUPOS.map((g) => {
          const n = posiblesPorGrupo(g.id);
          const activo = pestana === g.id;
          const color = ESTILO_GRUPO[g.id].color;
          return (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => cambiarGrupo(g.id)}
              style={{ color, borderColor: activo ? color : undefined, background: activo ? `${color}22` : undefined, boxShadow: activo ? `0 0 18px ${color}40` : undefined }}
              className={`relative flex flex-col items-center rounded-xl border px-0.5 pb-1.5 pt-1.5 transition active:scale-95 ${activo ? "" : "border-borde bg-superficie-2"} ${n === 0 && !activo ? "opacity-40" : ""}`}
            >
              <span key={activo ? "activo" : "inactivo"} className={`relative block h-11 w-11 ${activo ? "emblema-gira" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- emblema estático */}
                <img
                  src={emblemaGrupo(g.id)}
                  alt=""
                  className={`h-full w-full rounded-full transition ${n === 0 ? "opacity-50 grayscale" : activo ? "" : "opacity-80"}`}
                  style={activo ? { filter: `drop-shadow(0 0 8px ${color})` } : undefined}
                />
                {activo && <span className="emblema-destello absolute inset-0 rounded-full border-2" style={{ borderColor: color }} />}
              </span>
              <span className={`mt-1 text-[11px] font-medium ${activo ? "text-texto" : "text-texto-suave"}`}>{g.nombre}</span>
              <span
                className={`absolute -top-2 right-0.5 min-w-5 rounded-full px-1 text-[10px] font-bold leading-5 tabular-nums ${n === 0 ? "bg-superficie-2 text-texto-suave" : "text-noche"}`}
                style={n === 0 ? undefined : { background: color }}
                title={n === 0 ? "Ninguna puede ser" : `${n} posibles`}
              >
                {n === 0 ? "✕" : n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 px-1 text-xs">
        <p className="min-w-0 truncate" style={{ color: estilo.color }}>
          <strong>{estilo.elemento}</strong> <span className="text-texto-suave">· {estilo.tema}</span>
        </p>
        <button type="button" onClick={() => setSoloPosibles(!soloPosibles)} className={`shrink-0 rounded-full border px-2.5 py-1 transition ${soloPosibles ? "border-oro/60 bg-oro/15 text-oro-suave" : "border-borde text-texto-suave"}`}>
          {soloPosibles ? "✓ Solo posibles" : "Solo posibles"}
        </button>
      </div>

      <div
        key={`${pestana}-${soloPosibles}`}
        onTouchStart={(e) => (toque.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={alSoltar}
        className={`aparecer grid gap-1.5 ${pestana === "mayor" ? "grid-cols-6" : "grid-cols-7"}`}
      >
        {cartas.map((c) => {
          const r = rotuloCasilla(c);
          const usada = intentados.has(c.id);
          const descartada = !quedan.has(c.id) && !usada;
          const activa = elegida === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={usada}
              onClick={() => seleccionar(c)}
              title={usada ? `${c.nombre} (ya la intentaste)` : descartada ? `${c.nombre} (según tus pistas, no puede ser)` : c.nombre}
              aria-label={c.nombre}
              style={activa ? { borderColor: estilo.color, boxShadow: `0 0 16px ${estilo.color}aa` } : undefined}
              className={`group relative aspect-[3/4] overflow-hidden rounded-md border transition active:scale-95 ${
                activa ? "z-10 -translate-y-1 scale-105 border-2" : usada || descartada ? "border-transparent" : "border-oro/30 hover:-translate-y-0.5 hover:border-oro/70"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura estática */}
              <img src={miniCarta(c)} alt="" loading="lazy" className={`h-full w-full object-cover transition ${usada || descartada ? "opacity-25 grayscale" : ""}`} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noche via-noche/85 to-transparent px-0.5 pb-0.5 pt-3 text-center">
                <span className="block text-[11px] font-bold leading-none tabular-nums text-white drop-shadow">{r.numero}</span>
                {r.nombre && <span className="block truncate text-[8px] leading-tight text-white/80">{r.nombre}</span>}
              </span>
              {descartada && <span className="absolute inset-x-0 top-[18%] text-center text-lg leading-none text-white/70">✕</span>}
              {usada && <span className="absolute left-1/2 top-[16%] -translate-x-1/2 rounded-full bg-violeta px-1.5 text-[9px] font-semibold leading-4 text-white">ya</span>}
            </button>
          );
        })}
        {cartas.length === 0 && (
          <p className="col-span-full rounded-xl border border-borde bg-superficie-2 p-4 text-center text-sm text-texto-suave">
            Según tus pistas, ninguna carta de {pestana === "mayor" ? "los Arcanos Mayores" : GRUPOS.find((g) => g.id === pestana)?.nombre} puede ser. Prueba otro grupo.
          </p>
        )}
      </div>
      <p className="text-center text-[11px] text-texto-suave">
        {posiblesAqui} posibles aquí · {quedan.size} en total
        <span className="sm:hidden"> · desliza para cambiar de grupo</span>
      </p>

      {cartaElegida && (
        <div className="aparecer flex items-center gap-3 rounded-xl border bg-superficie-2 p-2" style={{ borderColor: `${ESTILO_GRUPO[grupo(cartaElegida) as IdGrupo].color}88` }}>
          <Miniatura carta={cartaElegida} className="w-12" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{cartaElegida.nombre}</p>
            <p className="text-xs text-texto-suave">
              {!quedan.has(cartaElegida.id) ? "Según tus pistas, esta ya no puede ser." : `${ESTILO_GRUPO[grupo(cartaElegida) as IdGrupo].elemento} · ¿es esta?`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onElegir(cartaElegida.id);
              setElegida(null);
            }}
            className="boton boton-primario shrink-0 px-4 py-2"
          >
            Elegir
          </button>
        </div>
      )}

      <div className="space-y-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && sugerencias[0]) seleccionar(sugerencias[0]);
          }}
          placeholder="…o escríbela: «Luna», «As de Copas»"
          autoComplete="off"
          aria-label="Buscar carta por nombre"
          className="campo w-full text-sm"
        />
        {sugerencias.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((c) => (
              <button key={c.id} type="button" onClick={() => seleccionar(c)} className="boton boton-secundario px-3 py-1.5 text-sm">
                {c.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
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
  sesion,
  cuenta,
  premioNuevo,
  premiosNuevos,
  conComodin,
  fecha,
  clavePublica,
}: {
  numero: number;
  escondida: CartaTarot;
  gano: boolean;
  comparaciones: Comparacion[];
  progreso: Progreso;
  racha: number;
  sesion: Sesion;
  cuenta: ProgresoCuenta | null;
  premioNuevo: boolean;
  premiosNuevos: PremioNuevo[];
  conComodin: boolean;
  fecha: string;
  clavePublica: string | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [maestrosLocales] = useState(maestrosGanados);
  const texto = textoParaCompartir(numero, comparaciones, gano, racha, window.location.origin, conComodin);
  const urlImagen = `/api/juego/imagen?n=${numero}&f=${codigoResultado(comparaciones)}&ra=${racha}&formato=historia`;

  /** La imagen para estados e historias: se comparte directo (celular) o se descarga. */
  async function compartirImagen() {
    setGenerando(true);
    try {
      const blob = await (await fetch(urlImagen)).blob();
      const archivo = new File([blob], `camino-del-loco-${numero}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [archivo] })) {
        await navigator.share({ files: [archivo], text: `¿Adivinas la carta de hoy? ${enlaceResultado(window.location.origin, numero, comparaciones, racha)}` }).catch(() => null);
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = archivo.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
    } catch {
      window.open(urlImagen, "_blank");
    } finally {
      setGenerando(false);
    }
  }
  const faltan = RACHA_PREMIO - (racha % RACHA_PREMIO);
  const stats = cuenta ?? { jugadas: progreso.jugadas, ganadas: progreso.ganadas, mejorRacha: progreso.mejorRacha, album: progreso.album, creditosGanados: 0 };
  const album = new Set([...stats.album, ...progreso.album]);
  const proximo = proximoPremio(album);

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
    <div id="resultado-juego" className="tarjeta aparecer scroll-mt-24 space-y-5 p-5 text-center sm:p-7">
      <div>
        <p className="text-sm uppercase tracking-[0.25em] text-violeta-suave">
          {gano ? (comparaciones.length === 1 ? "¡A la primera!" : `La encontraste en ${comparaciones.length}`) : "Hoy se escondió muy bien"}
        </p>
        <h2 className="brillo-oro font-display text-4xl font-semibold">{escondida.nombre}</h2>
      </div>
      <p className="mx-auto max-w-lg text-texto">{mensajeDelDia(escondida)}</p>
      <p className="mx-auto max-w-lg text-sm text-texto-suave">
        <span className="text-oro">En el amor:</span> {escondida.amor}
      </p>
      <VozSibila carta={escondida.id} />

      <MensajeSibila carta={escondida.nombre} />

      <pre className="mx-auto w-fit max-w-full whitespace-pre-wrap break-words rounded-xl bg-superficie-2 px-4 py-3 text-left font-sans text-sm leading-relaxed">{texto}</pre>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={compartir} className="boton boton-primario">
          {copiado ? "¡Copiado! Pégalo donde quieras" : "Compartir resultado"}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noopener noreferrer" className="boton boton-whatsapp">
          Enviar por WhatsApp
        </a>
        <button type="button" onClick={compartirImagen} disabled={generando} className="boton boton-secundario">
          {generando ? "Preparando la imagen…" : "📸 Imagen para historias"}
        </button>
      </div>

      <ComoLeFue propio={gano ? comparaciones.length : null} />

      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { n: stats.jugadas, t: "Jugadas" },
          { n: stats.jugadas ? Math.round((stats.ganadas / stats.jugadas) * 100) : 0, t: "% ganadas" },
          { n: racha, t: "Racha 🔥" },
          { n: Math.max(stats.mejorRacha, racha), t: "Mejor racha" },
        ].map((x) => (
          <div key={x.t} className="rounded-xl bg-superficie-2 p-3">
            <div className="text-2xl font-semibold tabular-nums">{x.n}</div>
            <div className="text-xs text-texto-suave">{x.t}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-xl border border-oro/40 p-4 text-sm">
        {premioNuevo ? (
          <p>
            🎁 <strong>¡{racha} días seguidos!</strong> Te sumamos 1 crédito de regalo: ya está en tu cuenta.{" "}
            <Link href="/tarot" className="text-oro-suave underline">
              Úsalo en una lectura
            </Link>
          </p>
        ) : (
          <>
            <p>
              🔥 Llevas {racha} {racha === 1 ? "día" : "días"} seguidos. Te {faltan === 1 ? "falta 1 día" : `faltan ${faltan} días`} para ganar <strong>1 crédito de regalo</strong>.
            </p>
            <div className="flex justify-center gap-1.5" aria-hidden>
              {Array.from({ length: RACHA_PREMIO }, (_, i) => (
                <span key={i} className={`h-2.5 w-7 rounded-full ${i < racha % RACHA_PREMIO ? "bg-oro" : "bg-superficie-2"}`} />
              ))}
            </div>
          </>
        )}
        {premiosNuevos.map((p) => (
          <div key={p.id} className="logro-nuevo flex items-center gap-3 rounded-xl border border-oro/60 bg-oro/10 p-3 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element -- emblema estático */}
            <img src={emblemaPremio(p.id)} alt="" className="h-14 w-14 shrink-0 drop-shadow-[0_0_12px_rgba(241,217,154,0.7)]" />
            <p>
              🏆 <strong>¡Completaste {p.nombre}!</strong> Te sumamos {p.creditos} créditos de regalo: ya están en tu cuenta.
            </p>
          </div>
        ))}
        {proximo && (
          <div className="flex items-center gap-3 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element -- emblema estático */}
            <img src={emblemaPremio(proximo.id)} alt="" className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs">
                Próximo premio: completa <strong>{proximo.nombre}</strong> ({proximo.tienes} de {proximo.total}) y gana <strong>{proximo.creditos} créditos</strong>.
              </p>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-superficie-2">
                <div className="h-full rounded-full bg-oro" style={{ width: `${(proximo.tienes / proximo.total) * 100}%` }} />
              </div>
            </div>
          </div>
        )}
        <p className="text-texto-suave">
          <Link href="/juego/album" className="text-oro-suave underline">
            Tu álbum
          </Link>
          : {album.size} de 78 cartas descubiertas.
          {stats.creditosGanados > 0 && ` Has ganado ${stats.creditosGanados} ${stats.creditosGanados === 1 ? "crédito" : "créditos"} jugando.`}
        </p>
        {sesion === "no" && (
          <div className="space-y-2 border-t border-borde pt-3">
            <p>
              Para ganar el crédito, juega con tu cuenta de Arcana: tu racha queda guardada aunque cambies de celular. La racha del regalo cuenta desde el primer día que
              juegas con tu cuenta.
            </p>
            <Link href="/entrar?volver=/juego" className="boton boton-primario inline-flex">
              Entrar o crear mi cuenta gratis
            </Link>
          </div>
        )}
      </div>

      {gano && <RetoMaestro fecha={fecha} numero={numero} sesion={sesion} cuenta={cuenta} />}

      <RankingSemanal />

      {sesion === "si" && (
        <div className="space-y-2 rounded-xl bg-superficie-2 p-4 text-sm">
          <p>🔔 Activa los avisos y te recuerdo cuando haya carta nueva y tu racha esté en riesgo.</p>
          <AvisoDiario clavePublica={clavePublica} />
        </div>
      )}

      <Logros
        datos={{
          album,
          mejorRacha: Math.max(stats.mejorRacha, progreso.mejorRacha, racha),
          distribucion: progreso.distribucion,
          maestros: Math.max(cuenta?.maestros ?? 0, maestrosLocales),
        }}
      />

      <Cuenta />

    </div>
  );
}

/** Emblema de cada premio del álbum. */
function emblemaPremio(id: string) {
  if (id === "mazo") return "/juego/logros/mazo.webp";
  if (id === "camino") return emblemaGrupo("mayor");
  return emblemaGrupo(id.replace("palo:", "") as IdGrupo);
}

/** El premio del álbum más cercano (el de mayor avance que aún no se completa). */
function proximoPremio(album: ReadonlySet<string>) {
  const pendientes = premiosAlbum()
    .map((p) => ({ id: p.id, nombre: p.nombre, creditos: p.creditos, total: p.cartas.length, tienes: p.cartas.filter((c) => album.has(c.id)).length }))
    .filter((p) => p.tienes < p.total);
  const sinMazo = pendientes.filter((p) => p.id !== "mazo");
  const lista = sinMazo.length ? sinMazo : pendientes;
  return lista.sort((a, b) => b.tienes / b.total - a.tienes / a.total)[0] ?? null;
}

/** Una ayuda por carta: Sibila revela un rasgo de la escondida (grupo, paridad o si el número es alto o bajo). */
function ComodinSibila({ onUsar }: { onUsar: (t: Comodin) => void }) {
  const [abierto, setAbierto] = useState(false);
  if (!abierto) {
    return (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => {
            sonidoTocar();
            setAbierto(true);
          }}
          className="flex items-center gap-2 rounded-full border border-violeta-suave/50 bg-violeta/15 py-1.5 pl-1.5 pr-4 text-sm transition hover:bg-violeta/25"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- retrato estático */}
          <img src={cara("caliente")} alt="" className="h-7 w-7 rounded-full border border-oro/60" />
          Pedirle el comodín a Sibila <span className="text-xs text-texto-suave">(1 por carta)</span>
        </button>
      </div>
    );
  }
  return (
    <div className="aparecer space-y-3 rounded-xl border border-violeta-suave/50 bg-violeta/10 p-3">
      <p className="text-center text-sm">
        🔮 <strong>¿Qué quieres que te revele?</strong>
        <span className="block text-xs text-texto-suave">Solo una vez por carta. En el ranking resta 1 punto.</span>
      </p>
      <div className="grid grid-cols-3 gap-2">
        {COMODINES.map((k) => (
          <button key={k.id} type="button" onClick={() => onUsar(k.id)} className="rounded-xl border border-borde bg-superficie-2 p-2 text-center transition hover:border-violeta-suave active:scale-95">
            <span className="block text-sm font-semibold">{k.titulo}</span>
            <span className="mt-1 block text-[11px] leading-tight text-texto-suave">{k.descripcion}</span>
          </button>
        ))}
      </div>
      <button type="button" onClick={() => setAbierto(false)} className="mx-auto block text-xs text-texto-suave underline">
        Mejor no, sigo sin ayuda
      </button>
    </div>
  );
}

/** El reto maestro: se abre al encontrar la carta del día. Otra carta, 4 intentos, pistas en clave y sin comodín. */
function RetoMaestro({ fecha, numero, sesion, cuenta }: { fecha: string; numero: number; sesion: Sesion; cuenta: ProgresoCuenta | null }) {
  const escondida = useMemo(() => cartaMaestra(numero), [numero]);
  const [locales, setIntentos] = useState<string[]>(() => leerMaestro()[fecha] ?? []);
  const intentos = locales.length ? locales : (cuenta?.maestroHoy ?? []);
  const [abierto, setAbierto] = useState(() => locales.length > 0);
  const [celebrar, setCelebrar] = useState(false);
  const cartas = intentos.map((id) => cartaPorId(id)).filter((c) => c !== undefined);
  const comparaciones = cartas.map((c) => comparar(c, escondida));
  const gano = comparaciones.some((c) => c.acierto);
  const termino = gano || intentos.length >= MAX_INTENTOS_MAESTRO;
  const quedan = posibles(cartas, comparaciones);
  const fallos = comparaciones.filter((c) => !c.acierto).length;

  function adivinar(id: string) {
    if (termino || intentos.includes(id)) return;
    const nuevos = [...intentos, id];
    const acierta = id === escondida.id;
    const fin = acierta || nuevos.length >= MAX_INTENTOS_MAESTRO;
    sonidoElegir();
    setTimeout(() => {
      if (acierta) {
        sonidoGanar();
        navigator.vibrate?.([40, 60, 40, 60, 120]);
        setCelebrar(true);
        setTimeout(() => setCelebrar(false), 2600);
      } else if (fin) {
        sonidoPerder();
      } else {
        const c = cartaPorId(id);
        if (c) (reaccion(c, escondida, nuevos.length).calor === "frio" ? sonidoFrio : sonidoCerca)();
        setTimeout(sonidoPista, 650);
      }
    }, 450);
    setTimeout(() => document.getElementById(fin ? "reto-maestro" : "selector-juego")?.scrollIntoView({ behavior: "smooth", block: fin ? "start" : "end" }), 900);
    setIntentos(nuevos);
    guardarMaestro(fecha, nuevos);
    if (fin) {
      medir("RetoMaestro", { gano: acierta ? 1 : 0, intentos: nuevos.length });
      contarEvento("maestro", { gano: acierta, intentos: nuevos.length });
      if (sesion !== "no") {
        void fetch("/api/juego/maestro", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fecha, intentos: nuevos }) }).catch(() => null);
      }
    }
  }

  if (!abierto) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-violeta-suave/60 bg-gradient-to-br from-violeta/30 via-noche to-noche p-5 text-left">
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">Desbloqueado</p>
        <p className="mt-1 font-display text-2xl">🌙 El reto maestro de hoy</p>
        <p className="mt-2 text-sm text-texto-suave">
          Sibila escondió otra carta, más difícil: {MAX_INTENTOS_MAESTRO} intentos, pistas en clave y sin comodín. Si la encuentras sumas {PUNTOS_MAESTRO} puntos en el
          ranking y ganas la medalla de maestría.
        </p>
        <button
          type="button"
          onClick={() => {
            sonidoPista();
            setAbierto(true);
            setTimeout(() => document.getElementById("reto-maestro")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
          }}
          className="boton boton-primario mt-4"
        >
          Aceptar el reto
        </button>
      </div>
    );
  }

  return (
    <div id="reto-maestro" className="scroll-mt-24 space-y-4 rounded-2xl border border-violeta-suave/60 bg-gradient-to-b from-violeta/20 to-noche p-4 text-left">
      <div className="flex items-center justify-between">
        <p className="font-display text-xl">🌙 Reto maestro</p>
        <Vidas usados={intentos.length} gano={gano} max={MAX_INTENTOS_MAESTRO} />
      </div>
      <div className="relative flex justify-center py-1">
        {termino ? (
          // eslint-disable-next-line @next/next/no-img-element -- ilustración estática de la carta
          <img src={imagenCarta(escondida) ?? DORSO} alt={escondida.nombre} className="voltear-carta w-32 rounded-xl" />
        ) : (
          <div className="flotar-carta relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
            <img src={DORSO} alt="Carta maestra escondida" className="w-24 rounded-xl border border-violeta-suave/70 hue-rotate-[35deg]" style={{ boxShadow: `0 0 ${34 + fallos * 14}px rgba(182,156,255,${0.5 + fallos * 0.1})` }} />
            <span className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">🌙</span>
          </div>
        )}
        {celebrar && <Estallido />}
      </div>
      <Conversacion pistas={pistasMaestras(escondida)} cartas={cartas} comparaciones={comparaciones} escondida={escondida} termino={termino} gano={gano} max={MAX_INTENTOS_MAESTRO} />
      {!termino && <Selector intentados={new Set(intentos)} quedan={quedan} sugerido={null} onElegir={adivinar} />}
      {termino && (
        <div className="aparecer space-y-2 text-center">
          <p className="text-sm uppercase tracking-[0.25em] text-violeta-suave">{gano ? `Maestría en ${intentos.length}` : "Se te escondió"}</p>
          <p className="brillo-oro font-display text-3xl">{escondida.nombre}</p>
          <p className="text-sm text-texto">{mensajeDelDia(escondida)}</p>
          <p className="text-sm text-texto-suave">
            {gano
              ? sesion === "si"
                ? `+${PUNTOS_MAESTRO} puntos en el ranking de esta semana. 🌙`
                : `Entra con tu cuenta para que estos ${PUNTOS_MAESTRO} puntos cuenten en el ranking.`
              : "Mañana hay otro reto maestro. 🌙"}
          </p>
        </div>
      )}
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

/** Invita a instalar Arcana para jugar cada día desde la pantalla de inicio (no se muestra si ya está instalada). */
function Instalar() {
  const [instalada] = useState(estaInstalada);
  const puede = usePuedeInstalar();
  if (instalada) return null;
  return (
    <div className="tarjeta flex items-center gap-4 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático */}
      <img src="/marca/icono-192.png" alt="" className="h-12 w-12 rounded-xl" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">Juega cada día desde tu pantalla</p>
        <p className="text-texto-suave">Instala Arcana: abre el juego con un toque, no pierdas tu racha y recibe 1 crédito de regalo.</p>
      </div>
      {puede ? (
        <button type="button" onClick={() => void pedirInstalacion()} className="boton boton-primario shrink-0 px-4 py-2">
          Instalar
        </button>
      ) : (
        <Link href="/app" className="boton boton-primario shrink-0 px-4 py-2">
          Instalar
        </Link>
      )}
    </div>
  );
}

/** Llegó desde el resultado que alguien compartió: el reto, sin revelar la carta. */
function Reto({ reto, numeroHoy }: { reto: ResultadoCompartido; numeroHoy: number }) {
  const deHoy = reto.numero === numeroHoy;
  return (
    <div className="tarjeta aparecer flex items-center gap-4 border border-oro/40 p-4">
      <div className="flex shrink-0 flex-col gap-1" aria-hidden>
        {reto.filas.map((f, i) => (
          <div key={i} className="flex gap-1">
            <span className={`h-3.5 w-3.5 rounded-[3px] ${f.grupo ? "bg-violeta" : "bg-superficie-2"}`} />
            <span className={`h-3.5 w-3.5 rounded-[3px] ${f.numero === "igual" ? "bg-violeta" : "bg-superficie-2"}`} />
          </div>
        ))}
      </div>
      <p className="text-sm">
        {deHoy ? (
          <>
            <strong>Te retaron:</strong> {reto.gano ? `la encontraron en ${reto.filas.length} de ${MAX_INTENTOS} intentos` : "a esta persona se le escondió"}. ¿Puedes hacerlo mejor? 🔮
          </>
        ) : (
          <>
            Ese reto era de la carta #{reto.numero}. Hoy Sibila escondió una nueva: <strong>¡a ver en cuántos la encuentras!</strong>
          </>
        )}
      </p>
    </div>
  );
}

interface ResumenHoy {
  jugadores: number;
  ganadas: number;
  distribucion: number[];
}

/** Cómo le fue hoy a quienes juegan con cuenta: porcentaje que la encontró y en qué intento. */
function ComoLeFue({ propio }: { propio: number | null }) {
  const [resumen, setResumen] = useState<ResumenHoy | null>(null);
  useEffect(() => {
    let vivo = true;
    fetch("/api/juego/hoy")
      .then((r) => (r.ok ? (r.json() as Promise<ResumenHoy>) : null))
      .then((d) => vivo && d && setResumen(d))
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, []);
  if (!resumen || resumen.jugadores < 3) return null;
  const maximo = Math.max(1, ...resumen.distribucion);
  const masComun = resumen.distribucion.indexOf(Math.max(...resumen.distribucion)) + 1;
  return (
    <div className="space-y-3 rounded-xl bg-superficie-2 p-4 text-left text-sm">
      <p className="text-center">
        Hoy jugaron <strong>{resumen.jugadores}</strong> personas · el <strong>{Math.round((resumen.ganadas / resumen.jugadores) * 100)}%</strong> la encontró
        {resumen.ganadas > 0 && (
          <>
            {" "}
            · la mayoría en <strong>{masComun}</strong>
          </>
        )}
      </p>
      <div className="space-y-1.5">
        {resumen.distribucion.map((n, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-3 text-right text-xs text-texto-suave">{i + 1}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-noche/60">
              <div
                className={`flex h-full items-center justify-end rounded px-1.5 text-[11px] ${propio === i + 1 ? "bg-oro text-noche" : "bg-violeta/80 text-white"}`}
                style={{ width: `${Math.max(8, (n / maximo) * 100)}%` }}
              >
                {n}
              </div>
            </div>
          </div>
        ))}
      </div>
      {propio && <p className="text-center text-xs text-texto-suave">En dorado, tu resultado.</p>}
    </div>
  );
}

/** Las cartas de días anteriores: se pueden jugar como práctica (sin racha). */
function DiasAnteriores({ numeroHoy, actual, progreso }: { numeroHoy: number; actual: number; progreso: Progreso }) {
  const [practica] = useState(leerPractica);
  if (numeroHoy <= 1) return null;
  const dias = Array.from({ length: Math.min(14, numeroHoy - 1) }, (_, i) => numeroHoy - 1 - i);
  return (
    <div className="tarjeta space-y-3 p-4">
      <div>
        <p className="font-semibold">Cartas de días anteriores</p>
        <p className="text-sm text-texto-suave">Juégalas como práctica: no cuentan para la racha, pero sí te enseñan las cartas.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {dias.map((n) => {
          const real = progreso.partidas[fechaDeNumero(n)];
          const intentos = real ?? practica[n] ?? [];
          const carta = cartaDelJuego(n).id;
          const gano = intentos.includes(carta);
          const termino = gano || intentos.length >= MAX_INTENTOS;
          const marca = termino ? (gano ? "✓" : "✗") : intentos.length ? "…" : "";
          const clase = `rounded-lg border px-3 py-1.5 text-sm ${n === actual ? "border-oro bg-oro/15" : "border-borde bg-superficie-2"}`;
          return real && termino ? (
            <span key={n} className={`${clase} opacity-60`} title="La jugaste ese día">
              #{n} {marca}
            </span>
          ) : (
            <Link key={n} href={`/juego?dia=${n}`} className={`${clase} hover:border-violeta-suave`}>
              #{n} {marca}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
