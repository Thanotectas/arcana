"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { imagenCarta } from "@/components/CartaVisual";
import { AvisoDiario } from "@/components/AvisoDiario";
import { estaInstalada, pedirInstalacion, usePuedeInstalar } from "@/lib/instalar";
import { medir } from "@/lib/marca/medicion";
import type { CartaTarot } from "@/lib/tarot/deck";
import {
  GRUPOS,
  MAX_INTENTOS,
  PROGRESO_VACIO,
  RACHA_PREMIO,
  buscarCartas,
  cartaDelJuego,
  cartaPorId,
  cartasDelGrupo,
  comparar,
  diaAnterior,
  fechaBogota,
  grupo,
  mensajeDelDia,
  msHastaNuevaCarta,
  nombreGrupo,
  numeroDeJuego,
  pistas,
  posibles,
  rotuloCasilla,
  terminarPartida,
  textoParaCompartir,
  type Comparacion,
  type IdGrupo,
  type Progreso,
} from "@/lib/juego/carta-escondida";

const CLAVE = "arcana-camino-del-loco-v1";

/** Lo que devuelve /api/juego (el progreso guardado en la cuenta). */
interface ProgresoCuenta {
  racha: number;
  mejorRacha: number;
  jugadas: number;
  ganadas: number;
  album: string[];
  hoy: string[] | null;
  creditosGanados: number;
}
type Sesion = "?" | "si" | "no";

/** Guarda en la cuenta la partida terminada de hoy. null: sin sesión; undefined: falló. */
async function enviarPartida(fecha: string, intentos: string[]): Promise<{ progreso: ProgresoCuenta; premio: boolean } | null | undefined> {
  try {
    const r = await fetch("/api/juego", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ fecha, intentos }) });
    if (r.status === 401) return null;
    const d = (await r.json()) as { ok: boolean; progreso?: ProgresoCuenta; premio?: boolean };
    return d.ok && d.progreso ? { progreso: d.progreso, premio: Boolean(d.premio) } : undefined;
  } catch {
    return undefined;
  }
}
const DORSO = "/cartas/arcana/dorso.webp";

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
export function CaminoDelLoco({ clavePublica }: { clavePublica: string | null }) {
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
  return <Juego clavePublica={clavePublica} />;
}

function Juego({ clavePublica }: { clavePublica: string | null }) {
  const [fecha] = useState(() => fechaBogota());
  const numero = numeroDeJuego(fecha);
  const escondida = useMemo(() => cartaDelJuego(numero), [numero]);
  const [progreso, setProgreso] = useState(leerProgreso);
  const [intentos, setIntentos] = useState<string[]>(() => leerProgreso().partidas[fecha] ?? []);
  const [sesion, setSesion] = useState<Sesion>("?");
  const [cuenta, setCuenta] = useState<ProgresoCuenta | null>(null);
  const [premioNuevo, setPremioNuevo] = useState(false);

  // Con sesión: trae el progreso de la cuenta. Si hoy ya jugó en otro dispositivo, muestra esa partida; si jugó
  // aquí antes de entrar, la guarda en la cuenta.
  useEffect(() => {
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
          const r2 = await enviarPartida(fecha, locales);
          if (vivo && r2) {
            setCuenta(r2.progreso);
            setPremioNuevo(r2.premio);
          }
        }
      })
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, [fecha]);

  const cartasIntento = intentos.map((id) => cartaPorId(id)).filter((c) => c !== undefined);
  const comparaciones = cartasIntento.map((c) => comparar(c, escondida));
  const gano = comparaciones.some((c) => c.acierto);
  const termino = gano || intentos.length >= MAX_INTENTOS;
  const fallos = comparaciones.filter((c) => !c.acierto).length;
  const pistasVisibles = pistas(escondida).slice(0, termino ? 6 : 1 + fallos);
  const rachaLocal = progreso.ultima === fecha || progreso.ultima === diaAnterior(fecha) ? progreso.racha : 0;
  const racha = cuenta ? cuenta.racha : rachaLocal;
  const quedan = posibles(cartasIntento, comparaciones);

  function adivinar(id: string) {
    if (termino || intentos.includes(id)) return;
    const nuevos = [...intentos, id];
    const acierta = id === escondida.id;
    const siguiente =
      acierta || nuevos.length >= MAX_INTENTOS
        ? terminarPartida(progreso, fecha, nuevos, acierta, escondida.id)
        : { ...progreso, partidas: { ...progreso.partidas, [fecha]: nuevos } };
    if (acierta) navigator.vibrate?.([40, 60, 40, 60, 120]);
    if (acierta || nuevos.length >= MAX_INTENTOS) {
      // Para los anuncios (solo si la persona aceptó la medición): quién jugó, sin decir qué carta.
      medir("JuegoTerminado", { gano: acierta ? 1 : 0, intentos: nuevos.length });
      void enviarPartida(fecha, nuevos).then((r) => {
        if (r === null) setSesion("no");
        else if (r) {
          setSesion("si");
          setCuenta(r.progreso);
          setPremioNuevo(r.premio);
        }
      });
    }
    setIntentos(nuevos);
    setProgreso(siguiente);
    guardarProgreso(siguiente);
  }

  return (
    <div className="space-y-6">
      <div className="tarjeta space-y-5 p-4 sm:p-7">
        <div className="flex items-center justify-between text-sm text-texto-suave">
          <span className="rounded-full bg-superficie-2 px-3 py-1">Carta #{numero}</span>
          <Vidas usados={intentos.length} gano={gano} />
          <span className="rounded-full bg-superficie-2 px-3 py-1" title="Días seguidos jugando">
            🔥 {racha}
          </span>
        </div>

        <div className="flex justify-center py-1">
          {termino ? (
            // eslint-disable-next-line @next/next/no-img-element -- ilustración estática de la carta
            <img src={imagenCarta(escondida) ?? DORSO} alt={escondida.nombre} className="voltear-carta w-40 rounded-xl sm:w-48" />
          ) : (
            <div className="flotar-carta relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- dorso estático */}
              <img src={DORSO} alt="Carta escondida" className="w-28 rounded-xl border border-oro/50 shadow-[0_0_40px_rgba(139,108,246,0.45)] sm:w-36" />
              <span className="absolute inset-0 flex items-center justify-center font-display text-6xl text-oro drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">?</span>
            </div>
          )}
        </div>

        <ul className="space-y-2">
          {pistasVisibles.map((p, i) => (
            <li key={i} className={`aparecer flex gap-2 rounded-lg px-3 py-2 text-sm ${i === pistasVisibles.length - 1 && !termino ? "border border-oro/40 bg-superficie-2" : "bg-superficie-2/70"}`}>
              <span className="text-oro">✦</span>
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {cartasIntento.length > 0 && <Intentos cartas={cartasIntento} comparaciones={comparaciones} />}

        {!termino && <Selector intentados={new Set(intentos)} quedan={quedan} sugerido={cartasIntento.length ? null : "mayor"} onElegir={adivinar} />}
      </div>

      {termino && (
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
          clavePublica={clavePublica}
        />
      )}

      <Instalar />

      <details className="tarjeta p-5 text-sm text-texto-suave">
        <summary className="cursor-pointer font-semibold text-texto">¿Cómo se juega?</summary>
        <div className="mt-3 space-y-2">
          <p>Cada día Sibila esconde una de las 78 cartas del tarot. Es la misma para todos y cambia a medianoche (hora de Colombia).</p>
          <p>
            Tienes {MAX_INTENTOS} intentos. Elige un grupo (Mayores, Bastos, Copas, Espadas u Oros) y una carta. Verás si acertaste el grupo y si el número de la
            escondida es mayor ⬆️ o menor ⬇️. Las cartas que ya no pueden ser se apagan. En los menores, el As es 1, la Sota 11, el Caballo 12, la Reina 13 y el Rey 14.
          </p>
          <p>Con cada fallo, Sibila te da una pista más. Cada carta que descubres entra en tu álbum, y si juegas {RACHA_PREMIO} días seguidos te regalamos 1 crédito para tus lecturas.</p>
        </div>
      </details>
    </div>
  );
}

/** Seis estrellas: se apagan con cada intento. */
function Vidas({ usados, gano }: { usados: number; gano: boolean }) {
  return (
    <span className="flex gap-1" aria-label={`${MAX_INTENTOS - usados} intentos restantes`}>
      {Array.from({ length: MAX_INTENTOS }, (_, i) => (
        <span key={i} className={`text-base transition-opacity ${i < usados ? (gano && i === usados - 1 ? "text-oro" : "opacity-25") : "text-oro"}`}>
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

function Intentos({ cartas, comparaciones }: { cartas: CartaTarot[]; comparaciones: Comparacion[] }) {
  return (
    <div className="space-y-2">
      {cartas.map((c, i) => {
        const r = comparaciones[i];
        return (
          <div key={c.id} className={`aparecer flex items-center gap-2 rounded-xl p-1.5 pr-2 ${r.acierto ? "bg-violeta/30 ring-1 ring-oro/60" : "bg-superficie-2"}`}>
            <Miniatura carta={c} />
            <span className={`min-w-0 flex-1 truncate text-sm ${r.acierto ? "font-semibold" : ""}`}>{c.nombre}</span>
            <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] ${r.grupo ? "bg-violeta text-white" : "bg-noche/60 text-texto-suave"}`}>{nombreGrupo(c)}</span>
            <span className={`w-14 shrink-0 rounded-md px-1 py-1 text-center text-sm ${r.numero === "igual" ? "bg-violeta text-white" : "bg-noche/60"}`}>
              {c.numero} {r.numero === "mayor" ? "⬆️" : r.numero === "menor" ? "⬇️" : "✓"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Selector visual: pestañas por grupo y una casilla por carta. Las que ya no pueden ser se apagan. */
function Selector({ intentados, quedan, sugerido, onElegir }: { intentados: ReadonlySet<string>; quedan: ReadonlySet<string>; sugerido: IdGrupo | null; onElegir: (id: string) => void }) {
  const [pestana, setPestana] = useState<IdGrupo>(sugerido ?? "mayor");
  const [elegida, setElegida] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const cartaElegida = elegida ? cartaPorId(elegida) : undefined;
  const sugerencias = buscarCartas(texto, intentados, 6);
  const cartas = cartasDelGrupo(pestana);
  const posiblesPorGrupo = (g: IdGrupo) => cartasDelGrupo(g).filter((c) => quedan.has(c.id)).length;

  function seleccionar(c: CartaTarot) {
    setElegida(c.id);
    setPestana(grupo(c) as IdGrupo);
    setTexto("");
  }

  return (
    <div className="space-y-3 border-t border-borde pt-4">
      <p className="text-center text-sm text-texto-suave">¿Qué carta es? Elige un grupo y toca una carta.</p>

      <div className="grid grid-cols-5 gap-1 rounded-xl bg-noche/60 p-1">
        {GRUPOS.map((g) => {
          const n = posiblesPorGrupo(g.id);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setPestana(g.id)}
              className={`flex flex-col items-center rounded-lg px-1 py-1.5 text-[11px] transition ${pestana === g.id ? "bg-violeta text-white shadow" : n ? "text-texto hover:bg-superficie-2" : "text-texto-suave opacity-40"}`}
            >
              <span className="text-base leading-none">{g.icono}</span>
              <span className="mt-1">{g.nombre}</span>
            </button>
          );
        })}
      </div>

      <div className={`grid gap-1.5 ${pestana === "mayor" ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-5 sm:grid-cols-7"}`}>
        {cartas.map((c) => {
          const r = rotuloCasilla(c);
          const usada = intentados.has(c.id);
          const descartada = !quedan.has(c.id);
          const activa = elegida === c.id;
          return (
            <button
              key={c.id}
              type="button"
              disabled={usada}
              onClick={() => seleccionar(c)}
              title={c.nombre}
              className={`flex h-14 flex-col items-center justify-center rounded-lg border px-0.5 text-center transition active:scale-95 ${
                activa
                  ? "border-oro bg-oro/15 shadow-[0_0_16px_rgba(241,217,154,0.35)]"
                  : usada
                    ? "border-transparent bg-noche/40 opacity-30"
                    : descartada
                      ? "border-transparent bg-noche/40 opacity-35"
                      : "border-borde bg-superficie-2 hover:border-violeta-suave"
              }`}
            >
              <span className={`font-display text-lg leading-none ${descartada && !activa ? "line-through" : ""}`}>{r.numero}</span>
              {r.nombre && <span className="mt-0.5 w-full truncate text-[9.5px] leading-tight text-texto-suave">{r.nombre}</span>}
            </button>
          );
        })}
      </div>

      {cartaElegida ? (
        <div className="aparecer flex items-center gap-3 rounded-xl border border-oro/40 bg-superficie-2 p-2">
          <Miniatura carta={cartaElegida} className="w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{cartaElegida.nombre}</p>
            {!quedan.has(cartaElegida.id) && <p className="text-xs text-texto-suave">Según tus pistas, esta ya no puede ser.</p>}
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
      ) : (
        <p className="text-center text-xs text-texto-suave">Quedan {quedan.size} cartas posibles.</p>
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
  clavePublica: string | null;
}) {
  const [copiado, setCopiado] = useState(false);
  const texto = textoParaCompartir(numero, comparaciones, gano, racha, window.location.origin);
  const faltan = RACHA_PREMIO - (racha % RACHA_PREMIO);
  const stats = cuenta ?? { jugadas: progreso.jugadas, ganadas: progreso.ganadas, mejorRacha: progreso.mejorRacha, album: progreso.album, creditosGanados: 0 };

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
        <p className="text-sm uppercase tracking-[0.25em] text-violeta-suave">
          {gano ? (comparaciones.length === 1 ? "¡A la primera!" : `La encontraste en ${comparaciones.length}`) : "Hoy se escondió muy bien"}
        </p>
        <h2 className="brillo-oro font-display text-4xl font-semibold">{escondida.nombre}</h2>
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
        <p className="text-texto-suave">
          Tu álbum: {stats.album.length} de 78 cartas descubiertas.
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

      {sesion === "si" && (
        <div className="space-y-2 rounded-xl bg-superficie-2 p-4 text-sm">
          <p>🔔 Activa los avisos y te recuerdo cuando haya carta nueva y tu racha esté en riesgo.</p>
          <AvisoDiario clavePublica={clavePublica} />
        </div>
      )}

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
