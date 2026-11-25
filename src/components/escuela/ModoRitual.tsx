"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Music2, Volume2, VolumeX, X } from "lucide-react";
import type { PasoRitual } from "@/lib/escuela/tipos";

type Paso = Exclude<PasoRitual, string>;
const comoObjeto = (p: PasoRitual): Paso => (typeof p === "string" ? { texto: p } : p);

/** Un fondo sonoro suave hecho en el navegador (dos notas graves que respiran), sin archivos. */
function crearAmbiente() {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const salida = ctx.createGain();
  salida.gain.value = 0;
  const filtro = ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 600;
  filtro.connect(salida).connect(ctx.destination);
  const notas = [110, 164.81, 220.5].map((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = ctx.createGain();
    g.gain.value = i === 2 ? 0.12 : 0.3;
    // Cada nota respira a su ritmo.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07 + i * 0.03;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain).connect(g.gain);
    o.connect(g).connect(filtro);
    o.start();
    lfo.start();
    return [o, lfo];
  });
  salida.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 3);
  return {
    detener: () => {
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

function Respiracion({ segundos }: { segundos: number }) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 0.25), 250);
    return () => clearInterval(id);
  }, []);
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

function Espera({ segundos }: { segundos: number }) {
  const [queda, setQueda] = useState(segundos);
  useEffect(() => {
    const id = setInterval(() => setQueda((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, []);
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
 * El ritual guiado a pantalla completa: primero los materiales (para marcar), luego un paso por pantalla con la voz de
 * Sibila, y las acciones de cada paso (respirar, encender, escribir, esperar). Lo que escribe queda en su grimorio.
 */
export function ModoRitual({
  curso,
  leccion,
  titulo,
  materiales,
  pasos,
  cuidado,
  notasIniciales,
  nombre,
}: {
  curso: string;
  leccion: number;
  titulo: string;
  materiales: string[];
  pasos: PasoRitual[];
  cuidado?: string;
  notasIniciales: Record<string, string>;
  nombre: string | null;
}) {
  const [abierto, setAbierto] = useState(false);
  const [i, setI] = useState(-1);
  const [conVoz, setConVoz] = useState(true);
  const [conAmbiente, setConAmbiente] = useState(true);
  const [marcados, setMarcados] = useState<boolean[]>(() => materiales.map(() => false));
  const [encendidas, setEncendidas] = useState<Record<number, boolean>>({});
  const [notas, setNotas] = useState<Record<string, string>>(notasIniciales);
  const audios = useRef(new Map<number, string | null>());
  const reproductor = useRef<HTMLAudioElement | null>(null);
  const ambiente = useRef<ReturnType<typeof crearAmbiente>>(null);
  const total = pasos.length;
  const paso = i >= 0 && i < total ? comoObjeto(pasos[i]) : null;

  const cerrar = useCallback(() => {
    setAbierto(false);
    reproductor.current?.pause();
    ambiente.current?.detener();
    ambiente.current = null;
  }, []);

  // La voz de Sibila para el paso actual (se pide una vez y queda en memoria).
  useEffect(() => {
    if (!abierto || !conVoz || i < 0 || i >= total) return;
    let vigente = true;
    reproductor.current?.pause();
    const tocar = (url: string | null) => {
      if (!vigente || !url) return;
      const a = reproductor.current ?? new Audio();
      reproductor.current = a;
      a.src = url;
      a.play().catch(() => null);
    };
    if (audios.current.has(i)) tocar(audios.current.get(i) ?? null);
    else
      fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "paso", curso, leccion, paso: i }) })
        .then((r) => r.json())
        .then((d: { audio?: string | null }) => {
          audios.current.set(i, d.audio ?? null);
          tocar(d.audio ?? null);
        })
        .catch(() => audios.current.set(i, null));
    return () => {
      vigente = false;
    };
  }, [abierto, conVoz, i, total, curso, leccion]);

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

  const ir = (nuevo: number) => {
    if (paso?.accion === "escribir") guardarNota(i);
    setI(Math.max(-1, Math.min(total, nuevo)));
  };

  if (!abierto)
    return (
      <button
        type="button"
        onClick={() => {
          setAbierto(true);
          setI(-1);
        }}
        className="group relative w-full overflow-hidden rounded-2xl border border-oro/50 bg-gradient-to-br from-oro/15 via-violeta/10 to-transparent p-6 text-center transition hover:border-oro"
      >
        <div className="escuela-cielo pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <span className="relative block text-xs uppercase tracking-[0.35em] text-oro-suave">Ritual guiado</span>
        <span className="relative mt-1 block font-display text-3xl">Hacer el ritual con Sibila</span>
        <span className="relative mt-1 block text-sm text-texto-suave">Pantalla completa, paso a paso, con su voz. Ponte cómoda o cómodo y prepara tus materiales.</span>
      </button>
    );

  const puedeSeguir = !(paso?.accion === "encender" && !encendidas[i]);

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-noche text-texto" role="dialog" aria-modal="true" aria-label={titulo}>
      <div className="escuela-cielo pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_45%,rgba(241,217,154,.12),transparent_70%)]" aria-hidden />

      <header className="relative flex items-center justify-between gap-2 p-4">
        <div className="flex gap-1.5" aria-label={`Paso ${Math.max(0, i + 1)} de ${total}`}>
          {pasos.map((_, k) => (
            <span key={k} className={`h-1.5 w-6 rounded-full transition ${k < i ? "bg-oro" : k === i ? "bg-oro-suave" : "bg-white/15"}`} />
          ))}
        </div>
        <div className="flex items-center gap-1">
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
        {i === -1 && (
          <div className="w-full max-w-md space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Antes de empezar</p>
            <h2 className="font-display text-4xl leading-tight">{titulo}</h2>
            {nombre && <p className="font-display text-xl italic text-violeta-suave">{nombre}, reúne lo que vas a necesitar:</p>}
            <ul className="space-y-2 text-start">
              {materiales.map((m, k) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => setMarcados((x) => x.map((v, j) => (j === k ? !v : v)))}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 transition ${marcados[k] ? "border-oro/60 bg-oro/10" : "border-borde"}`}
                    aria-pressed={marcados[k]}
                  >
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${marcados[k] ? "border-oro bg-oro text-noche" : "border-white/30"}`}>{marcados[k] ? "✓" : ""}</span>
                    {m}
                  </button>
                </li>
              ))}
            </ul>
            {cuidado && <p className="text-xs text-texto-suave">{cuidado}</p>}
          </div>
        )}

        {paso && (
          <div key={i} className="aparecer flex w-full max-w-xl flex-col items-center gap-8">
            <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Paso {i + 1} de {total}</p>
            {paso.accion === "respirar" && <Respiracion segundos={paso.segundos ?? 36} />}
            {paso.accion === "encender" && (
              <button type="button" onClick={() => setEncendidas((x) => ({ ...x, [i]: true }))} disabled={encendidas[i]} className="flex flex-col items-center gap-3" aria-label="Encender la vela">
                <Vela encendida={Boolean(encendidas[i])} />
                {!encendidas[i] && <span className="animate-pulse text-sm text-oro-suave">Toca la vela cuando enciendas la tuya</span>}
              </button>
            )}
            {paso.accion === "esperar" && <Espera segundos={paso.segundos ?? 60} />}
            <p className="font-display text-3xl leading-snug sm:text-4xl">{paso.texto}</p>
            {paso.ayuda && <p className="max-w-md text-sm text-texto-suave">{paso.ayuda}</p>}
            {paso.accion === "escribir" && (
              <textarea
                rows={5}
                maxLength={3000}
                autoFocus
                value={notas[String(i)] ?? ""}
                onChange={(e) => setNotas((x) => ({ ...x, [String(i)]: e.target.value }))}
                onBlur={() => guardarNota(i)}
                className="campo w-full bg-noche/70 font-display text-xl"
                placeholder="Escribe aquí…"
              />
            )}
          </div>
        )}

        {i === total && (
          <div className="aparecer space-y-5">
            <Vela encendida />
            <h2 className="font-display text-4xl">Tu ritual está hecho ✦</h2>
            <p className="mx-auto max-w-md text-texto-suave">{nombre ? `${nombre}, ` : ""}quédate un momento en silencio. Cuando quieras, vuelve a la lección: falta tu foto para Sibila y tus preguntas.</p>
            <button type="button" onClick={cerrar} className="boton boton-primario">Volver a la lección</button>
          </div>
        )}
      </div>

      {i < total && (
        <footer className="relative flex items-center justify-between gap-3 p-4">
          <button type="button" onClick={() => ir(i - 1)} disabled={i === -1} className="boton boton-secundario inline-flex items-center gap-1 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" aria-hidden /> Atrás
          </button>
          <button type="button" onClick={() => ir(i + 1)} disabled={!puedeSeguir} className="boton boton-primario inline-flex items-center gap-1 disabled:opacity-40">
            {i === -1 ? "Comenzar" : i === total - 1 ? "Terminar" : "Siguiente"} <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </footer>
      )}
    </div>
  );
}
