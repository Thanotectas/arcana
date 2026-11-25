"use client";

/** Pantalla de materiales (antes de la apertura). */
const MATERIALES = -2;

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Hand, Music2, Volume2, VolumeX, X } from "lucide-react";
import type { PasoRitual } from "@/lib/escuela/tipos";

type Paso = Exclude<PasoRitual, string>;
const comoObjeto = (p: PasoRitual): Paso => (typeof p === "string" ? { texto: p } : p);

/** Índices especiales de la voz: la apertura y el cierre del ritual. */
export const PASO_APERTURA = -1;
export const PASO_CIERRE = -2;

interface Ambiente {
  detener: () => void;
  cuenco: () => void;
}

/**
 * El fondo sonoro, hecho en el navegador sin archivos: dos notas graves que respiran, el crepitar suave de una llama
 * (ruido filtrado en chasquidos al azar) y un cuenco que suena al cambiar de paso.
 */
function crearAmbiente(): Ambiente | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const salida = ctx.createGain();
  salida.gain.value = 0;
  salida.connect(ctx.destination);

  // Notas graves que respiran.
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 600;
  filtro.connect(salida);
  const notas = [110, 164.81, 220.5].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i === 2 ? 0.1 : 0.26;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07 + i * 0.03;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain).connect(g.gain);
    o.connect(g).connect(filtro);
    o.start();
    lfo.start();
    return [o, lfo];
  });

  // Crepitar de la llama: chasquidos cortos de ruido, al azar.
  const largo = ctx.sampleRate * 2;
  const ruido = ctx.createBuffer(1, largo, ctx.sampleRate);
  const datos = ruido.getChannelData(0);
  for (let i = 0; i < largo; i++) datos[i] = Math.random() * 2 - 1;
  const fuego = ctx.createGain();
  fuego.gain.value = 0.5;
  fuego.connect(salida);
  let vivo = true;
  const chasquido = () => {
    if (!vivo) return;
    const fuente = ctx.createBufferSource();
    fuente.buffer = ruido;
    const pasa = ctx.createBiquadFilter();
    pasa.type = "bandpass";
    pasa.frequency.value = 1500 + Math.random() * 3500;
    pasa.Q.value = 1.2;
    const env = ctx.createGain();
    const t = ctx.currentTime;
    const fuerza = 0.05 + Math.random() * 0.18;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(fuerza, t + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.03 + Math.random() * 0.08);
    fuente.connect(pasa).connect(env).connect(fuego);
    fuente.start(t, Math.random() * 1.5, 0.15);
    setTimeout(chasquido, 60 + Math.random() * (Math.random() < 0.2 ? 900 : 260));
  };
  chasquido();

  salida.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 3);
  return {
    cuenco: () => {
      // Un cuenco: fundamental con armónicos inarmónicos que se apagan despacio.
      const t = ctx.currentTime;
      [220, 220 * 2.71, 220 * 5.2].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime([0.5, 0.18, 0.07][i], t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + [5, 3, 1.6][i]);
        o.connect(g).connect(salida);
        o.start(t);
        o.stop(t + 5.2);
      });
    },
    detener: () => {
      vivo = false;
      salida.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      setTimeout(() => {
        notas.flat().forEach((n) => n.stop());
        void ctx.close();
      }, 900);
    },
  };
}

function Vela({ encendida }: { encendida: boolean }) {
  return (
    <svg viewBox="0 0 60 160" className="h-56 w-auto overflow-visible" aria-hidden>
      <defs>
        <linearGradient id="mr-cera" x1="0" x2="1">
          <stop offset="0" stopColor="#efe3c8" />
          <stop offset="0.55" stopColor="#fff8e8" />
          <stop offset="1" stopColor="#d9c9a6" />
        </linearGradient>
        <radialGradient id="mr-llama" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.45" stopColor="#ffd36b" />
          <stop offset="1" stopColor="#ff8a1f" stopOpacity="0.2" />
        </radialGradient>
      </defs>
      {encendida && <circle cx="30" cy="30" r="34" fill="rgba(255,196,90,0.25)" className="escuela-halo" />}
      <rect x="16" y="56" width="28" height="96" rx="4" fill="url(#mr-cera)" />
      <ellipse cx="30" cy="56" rx="14" ry="3.5" fill="#fff3d6" />
      <line x1="30" y1="56" x2="30" y2="46" stroke="#2a2338" strokeWidth="2.2" strokeLinecap="round" />
      {encendida && (
        <g className="escuela-encender">
          <g className="escuela-llama">
            <path d="M30 6 C 41 22, 40 36, 30 46 C 20 36, 19 22, 30 6 Z" fill="url(#mr-llama)" />
            <path d="M30 22 C 34 30, 34 37, 30 43 C 26 37, 26 30, 30 22 Z" fill="#fffdf2" opacity="0.9" />
          </g>
        </g>
      )}
      <ellipse cx="30" cy="153" rx="25" ry="5" fill="#c9a24e" />
    </svg>
  );
}

function Respiracion({ segundos, alTerminar }: { segundos: number; alTerminar: () => void }) {
  const [t, setT] = useState(0);
  const avisado = useRef(false);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 0.25), 250);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (t >= segundos && !avisado.current) {
      avisado.current = true;
      alTerminar();
    }
  }, [t, segundos, alTerminar]);
  const ciclo = t % 12;
  const fase = ciclo < 4 ? "Inhala…" : ciclo < 6 ? "Sostén…" : "Exhala…";
  const queda = Math.max(0, Math.ceil(segundos - t));
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex h-56 w-56 items-center justify-center">
        <div className="escuela-respirar absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(241,217,154,.55),rgba(139,108,246,.35)_55%,transparent_70%)] shadow-[0_0_80px_rgba(241,217,154,.35)]" />
        <span className="relative font-display text-3xl">{queda > 0 ? fase : "Bien ✦"}</span>
      </div>
      <p className="text-sm text-texto-suave">{queda > 0 ? `${queda} s` : "Cuando quieras, sigue."}</p>
    </div>
  );
}

function Espera({ segundos, alTerminar }: { segundos: number; alTerminar: () => void }) {
  const [queda, setQueda] = useState(segundos);
  useEffect(() => {
    const id = setInterval(() => setQueda((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (queda === 0) alTerminar();
  }, [queda, alTerminar]);
  const r = 70;
  const largo = 2 * Math.PI * r;
  const m = Math.floor(queda / 60);
  const s = String(queda % 60).padStart(2, "0");
  return (
    <div className="relative flex h-48 w-48 items-center justify-center">
      <svg viewBox="0 0 160 160" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1d99a" strokeWidth="4" strokeLinecap="round" strokeDasharray={largo} strokeDashoffset={largo * (queda / segundos)} style={{ transition: "stroke-dashoffset 1s linear" }} />
      </svg>
      <span className="font-display text-4xl tabular-nums">{queda > 0 ? `${m}:${s}` : "✦"}</span>
    </div>
  );
}

/**
 * El ritual guiado a pantalla completa, como una meditación: primero los materiales; luego Sibila abre el ritual, guía
 * cada paso con su voz (respirar, encender, escribir, esperar) y lo cierra. De fondo, el video del ritual, el crepitar
 * de la llama y un cuenco entre pasos; el teléfono vibra suave en cada paso. En «sin manos», los pasos avanzan solos
 * cuando Sibila termina de hablar (salvo los de escribir y encender). Lo que escribe queda en su grimorio.
 */
export function ModoRitual({
  curso,
  leccion,
  titulo,
  materiales,
  pasos,
  cuidado,
  apertura,
  cierre,
  fondo,
  notasIniciales,
  nombre,
}: {
  curso: string;
  leccion: number;
  titulo: string;
  materiales: string[];
  pasos: PasoRitual[];
  cuidado?: string;
  apertura?: string;
  cierre?: string;
  fondo?: string;
  notasIniciales: Record<string, string>;
  nombre: string | null;
}) {
  // Pantallas: -2 materiales, -1 apertura, 0..n-1 pasos, n cierre.
  const total = pasos.length;

  const APERTURA = -1;
  const [abierto, setAbierto] = useState(false);
  const [i, setI] = useState(MATERIALES);
  const [conVoz, setConVoz] = useState(true);
  const [conAmbiente, setConAmbiente] = useState(true);
  const [sinManos, setSinManos] = useState(false);
  const [marcados, setMarcados] = useState<boolean[]>(() => materiales.map(() => false));
  const [encendidas, setEncendidas] = useState<Record<number, boolean>>({});
  const [notas, setNotas] = useState<Record<string, string>>(notasIniciales);
  // Guardan en qué pantalla terminó la voz o la acción: al cambiar de pantalla, dejan de valer solas.
  const [vozHecha, setVozHecha] = useState<number | null>(null);
  const [accionHecha, setAccionHecha] = useState<number | null>(null);
  const audios = useRef(new Map<number, string | null>());
  const reproductor = useRef<HTMLAudioElement | null>(null);
  const ambiente = useRef<Ambiente | null>(null);
  const paso = i >= 0 && i < total ? comoObjeto(pasos[i]) : null;
  const claveVoz = i === APERTURA ? PASO_APERTURA : i === total ? PASO_CIERRE : i;
  const conTexto = (i === APERTURA && apertura) || (i === total && cierre) || paso;

  const cerrar = useCallback(() => {
    setAbierto(false);
    reproductor.current?.pause();
    ambiente.current?.detener();
    ambiente.current = null;
  }, []);

  const terminarAccion = useCallback(() => setAccionHecha(i), [i]);

  // Al cambiar de pantalla: cuenco, vibración y la voz de Sibila.
  useEffect(() => {
    if (!abierto || i === MATERIALES) return;
    ambiente.current?.cuenco();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(35);
    if (!conVoz || !conTexto) return;
    let vigente = true;
    reproductor.current?.pause();
    const tocar = (url: string | null) => {
      if (!vigente) return;
      if (!url) return setVozHecha(i);
      const a = reproductor.current ?? new Audio();
      reproductor.current = a;
      a.onended = () => vigente && setVozHecha(i);
      a.src = url;
      // Un respiro después del cuenco antes de que Sibila hable.
      setTimeout(() => vigente && a.play().catch(() => setVozHecha(i)), 900);
    };
    if (audios.current.has(claveVoz)) tocar(audios.current.get(claveVoz) ?? null);
    else
      fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "paso", curso, leccion, paso: claveVoz }) })
        .then((r) => r.json())
        .then((d: { audio?: string | null }) => {
          audios.current.set(claveVoz, d.audio ?? null);
          tocar(d.audio ?? null);
        })
        .catch(() => {
          audios.current.set(claveVoz, null);
          tocar(null);
        });
    return () => {
      vigente = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se reproduce al cambiar de pantalla o al activar la voz
  }, [abierto, i, conVoz]);

  // El fondo sonoro, mientras el ritual está abierto y la persona lo quiere.
  useEffect(() => {
    if (!abierto) return;
    if (conAmbiente && !ambiente.current) ambiente.current = crearAmbiente();
    if (!conAmbiente && ambiente.current) {
      ambiente.current.detener();
      ambiente.current = null;
    }
  }, [abierto, conAmbiente]);

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    window.addEventListener("keydown", tecla);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", tecla);
      document.body.style.overflow = "";
    };
  }, [abierto, cerrar]);

  const guardarNota = (indice: number) => {
    const texto = notas[String(indice)];
    if (texto === undefined || texto === notasIniciales[String(indice)]) return;
    void fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "nota", curso, leccion, paso: indice, texto }) });
  };

  const ir = useCallback(
    (nuevo: number) => {
      if (paso?.accion === "escribir") guardarNota(i);
      let destino = Math.max(MATERIALES, Math.min(total, nuevo));
      if (destino === APERTURA && !apertura) destino = nuevo > i ? 0 : MATERIALES;
      setI(destino);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- guardarNota lee el estado actual
    [i, paso, total, apertura, notas],
  );

  // Sin manos: cuando Sibila termina (y la respiración o la espera también), se pasa solo al siguiente paso.
  const requiereManos = paso?.accion === "escribir" || (paso?.accion === "encender" && !encendidas[i]);
  const tieneAccion = paso?.accion === "respirar" || paso?.accion === "esperar";
  const vozTermino = !conVoz || !conTexto || vozHecha === i;
  const accionTermino = accionHecha === i;
  useEffect(() => {
    if (!abierto || !sinManos || i === MATERIALES || i >= total || requiereManos) return;
    if (!vozTermino || (tieneAccion && !accionTermino)) return;
    const id = setTimeout(() => ir(i + 1), 2500);
    return () => clearTimeout(id);
  }, [abierto, sinManos, i, total, requiereManos, vozTermino, tieneAccion, accionTermino, ir]);

  if (!abierto)
    return (
      <button
        type="button"
        onClick={() => {
          setAbierto(true);
          setI(MATERIALES);
        }}
        className="group relative w-full overflow-hidden rounded-3xl border border-oro/50 p-8 text-center transition hover:border-oro"
      >
        {fondo && (
          <video autoPlay muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-40" aria-hidden>
            <source src={fondo} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/60 to-noche/30" aria-hidden />
        <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <span className="relative block text-xs uppercase tracking-[0.35em] text-oro-suave">Ritual guiado por Sibila</span>
        <span className="relative mt-2 block font-display text-4xl">Entrar al ritual</span>
        <span className="relative mx-auto mt-2 block max-w-md text-sm text-texto-suave">Pantalla completa, con su voz, el sonido de la llama y el cuenco. Usa audífonos si puedes, baja las luces y prepara tus materiales.</span>
      </button>
    );

  const puedeSeguir = !(paso?.accion === "encender" && !encendidas[i]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-noche text-texto" role="dialog" aria-modal="true" aria-label={titulo}>
      {fondo && (
        <video autoPlay muted loop playsInline className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" aria-hidden>
          <source src={fondo} type="video/mp4" />
        </video>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-noche/70 via-noche/40 to-noche/80" aria-hidden />
      <div className="escuela-cielo pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgba(241,217,154,.12),transparent_70%)]" aria-hidden />

      <header className="relative flex items-center justify-between gap-2 p-4">
        <div className="flex gap-1.5" aria-label={`Paso ${Math.max(0, i + 1)} de ${total}`}>
          {pasos.map((_, k) => (
            <span key={k} className={`h-1.5 w-5 rounded-full transition sm:w-6 ${k < i ? "bg-oro" : k === i ? "bg-oro-suave" : "bg-white/15"}`} />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setSinManos((x) => !x)} className={`rounded-full p-2 ${sinManos ? "text-oro" : "text-texto-suave"}`} aria-pressed={sinManos} aria-label={sinManos ? "Desactivar el modo sin manos" : "Modo sin manos: los pasos avanzan solos"} title="Sin manos: los pasos avanzan solos">
            <Hand className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setConAmbiente((x) => !x)} className={`rounded-full p-2 ${conAmbiente ? "text-oro" : "text-texto-suave"}`} aria-label={conAmbiente ? "Quitar el sonido de fondo" : "Poner sonido de fondo"}>
            <Music2 className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setConVoz((x) => !x);
              reproductor.current?.pause();
            }}
            className={`rounded-full p-2 ${conVoz ? "text-oro" : "text-texto-suave"}`}
            aria-label={conVoz ? "Silenciar la voz de Sibila" : "Activar la voz de Sibila"}
          >
            {conVoz ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </button>
          <button type="button" onClick={cerrar} className="rounded-full p-2 text-texto-suave hover:text-texto" aria-label="Cerrar el ritual">
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col items-center justify-center gap-8 overflow-y-auto px-6 pb-6 text-center">
        {i === MATERIALES && (
          <div className="w-full max-w-md space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Antes de entrar</p>
            <h2 className="font-display text-4xl leading-tight">{titulo}</h2>
            {nombre && <p className="font-display text-xl italic text-violeta-suave">{nombre}, reúne lo que vas a necesitar:</p>}
            <ul className="space-y-2 text-start">
              {materiales.map((m, k) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => setMarcados((x) => x.map((v, j) => (j === k ? !v : v)))}
                    className={`flex w-full items-center gap-3 rounded-xl border bg-noche/60 p-3 transition ${marcados[k] ? "border-oro/60 bg-oro/10" : "border-borde"}`}
                    aria-pressed={marcados[k]}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${marcados[k] ? "border-oro bg-oro text-noche" : "border-white/30"}`}>{marcados[k] ? "✓" : ""}</span>
                    {m}
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-texto-suave">Usa audífonos si puedes. Toca la mano ✋ arriba para que los pasos avancen solos y puedas dejar el teléfono.</p>
            {cuidado && <p className="text-xs text-texto-suave">{cuidado}</p>}
          </div>
        )}

        {i === APERTURA && apertura && (
          <div key="apertura" className="aparecer flex max-w-xl flex-col items-center gap-8">
            <Vela encendida />
            <p className="font-display text-3xl italic leading-snug text-texto/90 sm:text-4xl">{nombre ? `${nombre}…` : ""} {apertura.split("…")[0]}…</p>
            <p className="text-sm text-texto-suave">Escucha a Sibila. Respira.</p>
          </div>
        )}

        {paso && (
          <div key={i} className="aparecer flex w-full max-w-xl flex-col items-center gap-8">
            <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Paso {i + 1} de {total}</p>
            {paso.accion === "respirar" && <Respiracion segundos={paso.segundos ?? 36} alTerminar={terminarAccion} />}
            {paso.accion === "encender" && (
              <button type="button" onClick={() => setEncendidas((x) => ({ ...x, [i]: true }))} disabled={encendidas[i]} className="flex flex-col items-center gap-3" aria-label="Encender la vela">
                <Vela encendida={Boolean(encendidas[i])} />
                {!encendidas[i] && <span className="animate-pulse text-sm text-oro-suave">Toca la llama cuando enciendas la tuya</span>}
              </button>
            )}
            {paso.accion === "esperar" && <Espera segundos={paso.segundos ?? 60} alTerminar={terminarAccion} />}
            <p className="font-display text-3xl leading-snug drop-shadow-[0_2px_16px_rgba(0,0,0,.9)] sm:text-4xl">{paso.texto}</p>
            {paso.ayuda && <p className="max-w-md text-sm text-texto-suave">{paso.ayuda}</p>}
            {paso.accion === "escribir" && (
              <textarea
                rows={5}
                maxLength={3000}
                value={notas[String(i)] ?? ""}
                onChange={(e) => setNotas((x) => ({ ...x, [String(i)]: e.target.value }))}
                onBlur={() => guardarNota(i)}
                className="campo w-full bg-noche/80 font-display text-xl"
                placeholder="Escribe aquí…"
              />
            )}
          </div>
        )}

        {i === total && (
          <div key="cierre" className="aparecer space-y-5">
            <Vela encendida />
            <h2 className="font-display text-4xl">Tu ritual está hecho ✦</h2>
            {cierre && <p className="mx-auto max-w-md font-display text-xl italic text-texto/90">{cierre.split("…")[0]}…</p>}
            <p className="mx-auto max-w-md text-sm text-texto-suave">Quédate un momento en silencio. Cuando quieras, vuelve a la lección: te esperan tu llave, tu foto para Sibila y tus preguntas.</p>
            <button type="button" onClick={cerrar} className="boton boton-primario">Volver a la lección</button>
          </div>
        )}
      </div>

      {i < total && (
        <footer className="relative flex items-center justify-between gap-3 p-4">
          <button type="button" onClick={() => ir(i - 1)} disabled={i === MATERIALES} className="boton boton-secundario inline-flex items-center gap-1 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" aria-hidden /> Atrás
          </button>
          {sinManos && i >= 0 && !requiereManos && <span className="text-xs text-oro-suave">Sin manos ✦</span>}
          <button type="button" onClick={() => ir(i + 1)} disabled={!puedeSeguir} className="boton boton-primario inline-flex items-center gap-1 disabled:opacity-40">
            {i === MATERIALES ? "Entrar al ritual" : i === total - 1 ? "Cerrar el ritual" : "Siguiente"} <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </footer>
      )}
    </div>
  );
}
