"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Marca } from "./Logo";
import { CieloEnVivo } from "./CieloEnVivo";
import { RostroSibila } from "./RostroSibila";

interface Carta {
  id: string;
  nombre: string;
  posicion: string;
}

type TipoLectura = "tarot" | "aura" | "numerologia" | "horoscopo" | "chocolate" | "mano";

interface Lectura {
  clase: "lectura";
  id: number;
  tipo: TipoLectura;
  autor: string;
  signo: string | null;
  pregunta: string;
  cartas: Carta[] | null;
  imagen: string | null;
  color: string | null;
  numero: number | null;
  etiquetaNumero: string | null;
  simbolo: string | null;
  texto: string;
  audio: string | null;
}

type Respuesta = Lectura | { clase: "espera" } | { clase: "puente"; texto: string; audio: string | null };

const NOMBRE_TIPO: Record<TipoLectura, string> = {
  tarot: "Tarot",
  aura: "Lectura de aura",
  numerologia: "Numerología",
  horoscopo: "Horóscopo",
  chocolate: "Lectura del chocolate",
  mano: "Lectura de la mano",
};

const COLOR_AURA: Record<string, string> = {
  violeta: "#8b6cf6",
  dorado: "#f1d99a",
  azul: "#4f8cf7",
  verde: "#43c59e",
  rosa: "#f28dc4",
  rojo: "#ef5b5b",
  naranja: "#f59e42",
  blanco: "#f4f1ff",
  índigo: "#5b4bd1",
  turquesa: "#38d6d0",
};

const ANCHO = 1920;
const ALTO = 1080;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

function frasesDe(texto: string) {
  return texto.match(/[^.!?¿¡]+[.!?]+|[^.!?]+$/g)?.map((f) => f.trim()).filter(Boolean) ?? [texto];
}

/**
 * Escenario de «Sibila en vivo» (1920×1080) para transmitir con OBS: pide al
 * servidor la siguiente lectura mientras suena la actual, voltea las tres
 * cartas, reproduce la voz de Sibila con subtítulos y hace latir su símbolo con
 * el volumen. Sin preguntas, Sibila dice frases de invitación de vez en cuando.
 */
export function EscenarioEnVivo({ clave, qr }: { clave: string; qr: string }) {
  const [escala, setEscala] = useState(1);
  const [lectura, setLectura] = useState<Lectura | null>(null);
  const [volteadas, setVolteadas] = useState(0);
  const [subtitulo, setSubtitulo] = useState("");
  const [nivel, setNivel] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sinVoz, setSinVoz] = useState(false);
  const contexto = useRef<AudioContext | null>(null);
  const desbloquear = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ajustar = () => setEscala(Math.min(window.innerWidth / ANCHO, window.innerHeight / ALTO));
    ajustar();
    window.addEventListener("resize", ajustar);
    return () => window.removeEventListener("resize", ajustar);
  }, []);

  const pedir = useCallback(
    async (modo: "lectura" | "puente", i = 0): Promise<Respuesta | null> => {
      try {
        const res = await fetch(`/api/en-vivo/siguiente?modo=${modo}&i=${i}&clave=${encodeURIComponent(clave)}`, { cache: "no-store" });
        if (res.status === 401) {
          setAviso("Clave del escenario inválida: copia otra vez la dirección desde /admin/en-vivo.");
          return null;
        }
        return res.ok ? ((await res.json()) as Respuesta) : null;
      } catch {
        return null;
      }
    },
    [clave],
  );

  /** Reproduce la voz (o simula su duración si no hay) con subtítulos y el latido del símbolo. */
  const hablar = useCallback(async (texto: string, audio: string | null) => {
    const frases = frasesDe(texto);
    const total = frases.reduce((s, f) => s + f.length, 0) || 1;
    const fraseEn = (progreso: number) => {
      let acumulado = 0;
      for (const f of frases) {
        acumulado += f.length;
        if (acumulado / total >= progreso) return f;
      }
      return frases[frases.length - 1];
    };
    setSubtitulo(frases[0]);
    if (!audio) {
      const duracion = Math.max(4000, (texto.split(/\s+/).length / 2.6) * 1000);
      const inicio = Date.now();
      while (Date.now() - inicio < duracion) {
        setSubtitulo(fraseEn((Date.now() - inicio) / duracion));
        setNivel(0.3 + Math.random() * 0.4);
        await esperar(150);
      }
      setNivel(0);
      return;
    }
    const elemento = new Audio(`data:audio/mpeg;base64,${audio}`);
    let analizador: AnalyserNode | null = null;
    try {
      contexto.current ??= new AudioContext();
      const fuente = contexto.current.createMediaElementSource(elemento);
      analizador = contexto.current.createAnalyser();
      analizador.fftSize = 256;
      fuente.connect(analizador);
      analizador.connect(contexto.current.destination);
      if (contexto.current.state === "suspended") await contexto.current.resume().catch(() => null);
      if (contexto.current.state === "suspended") {
        // El navegador exige un clic antes de sonar (en OBS no pasa).
        setBloqueado(true);
        await new Promise<void>((r) => (desbloquear.current = r));
        setBloqueado(false);
        await contexto.current.resume().catch(() => null);
      }
    } catch {
      analizador = null;
    }
    const datos = new Uint8Array(128);
    let marco = 0;
    const latir = () => {
      if (analizador) {
        analizador.getByteFrequencyData(datos);
        setNivel(Math.min(1, datos.reduce((s, v) => s + v, 0) / datos.length / 90));
      }
      if (elemento.duration) setSubtitulo(fraseEn(elemento.currentTime / elemento.duration));
      marco = requestAnimationFrame(latir);
    };
    await new Promise<void>((listo) => {
      elemento.onended = () => listo();
      elemento.onerror = () => listo();
      elemento.play().then(
        () => {
          marco = requestAnimationFrame(latir);
        },
        async () => {
          // El navegador bloqueó el sonido: se espera un clic (en OBS no pasa).
          setBloqueado(true);
          await new Promise<void>((r) => (desbloquear.current = r));
          setBloqueado(false);
          await contexto.current?.resume();
          elemento.play().then(() => (marco = requestAnimationFrame(latir)), () => listo());
        },
      );
    });
    cancelAnimationFrame(marco);
    setNivel(0);
  }, []);

  useEffect(() => {
    let activo = true;
    const puentes = new Map<number, { texto: string; audio: string | null }>();
    (async () => {
      let siguiente: Promise<Respuesta | null> | null = null;
      let quietos = 0;
      let puente = 0;
      while (activo) {
        const r = await (siguiente ?? pedir("lectura"));
        siguiente = null;
        if (!activo) break;
        if (r?.clase === "lectura") {
          quietos = 0;
          setSinVoz(!r.audio);
          setLectura(r);
          setVolteadas(0);
          setSubtitulo("");
          for (let n = 1; n <= (r.cartas ? 3 : 1); n++) {
            await esperar(900);
            setVolteadas(n);
          }
          await esperar(600);
          siguiente = pedir("lectura");
          await hablar(r.texto, r.audio);
          await esperar(2500);
          continue;
        }
        quietos++;
        // Sin preguntas: una frase de Sibila cada tres vueltas (unos 25 s).
        if (quietos % 3 === 1) {
          const i = puente++ % 5;
          let frase = puentes.get(i) ?? null;
          if (!frase) {
            const r2 = await pedir("puente", i);
            if (r2?.clase === "puente") frase = { texto: r2.texto, audio: r2.audio };
          }
          if (frase) {
            puentes.set(i, frase);
            setSinVoz(!frase.audio);
            setLectura(null);
            await hablar(frase.texto, frase.audio);
            setSubtitulo("");
          }
        }
        await esperar(8000);
      }
    })();
    return () => {
      activo = false;
    };
  }, [pedir, hablar]);

  const tipo = lectura?.tipo ?? "tarot";
  const cartas = lectura?.cartas ?? [
    { id: "", nombre: "", posicion: "Lo que te rodea" },
    { id: "", nombre: "", posicion: "Lo que se mueve" },
    { id: "", nombre: "", posicion: "Tu consejo" },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-[#07040f]"
      onClick={() => {
        contexto.current?.resume().catch(() => null);
        desbloquear.current?.();
        desbloquear.current = null;
      }}
    >
      <div
        className="absolute left-1/2 top-1/2 overflow-hidden text-texto"
        style={{
          width: ANCHO,
          height: ALTO,
          transform: `translate(-50%, -50%) scale(${escala})`,
          background: "linear-gradient(180deg, #160d33 0%, #0b0716 75%)",
        }}
      >
        <CieloEnVivo ancho={ANCHO} alto={ALTO} centro={{ x: 64 + 280, y: 180 + 165 }} nivel={nivel} />
        {/* Encabezado */}
        <div className="absolute left-16 right-16 top-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Marca tamano={64} />
            <div>
              <p className="font-display text-5xl text-oro-suave">Arcana</p>
              <p className="text-xl uppercase tracking-[0.35em] text-violeta-suave">Sibila en vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-red-400/50 bg-red-500/15 px-6 py-3 text-2xl font-semibold text-red-200">
            <span className="h-4 w-4 animate-pulse rounded-full bg-red-500" /> EN VIVO
          </div>
        </div>

        {/* QR para subir la foto de la taza o de la mano */}
        <div className="absolute bottom-[245px] left-16 flex w-[560px] items-center gap-5 rounded-3xl border border-oro/30 bg-black/35 p-5">
          <div className="h-[150px] w-[150px] shrink-0 overflow-hidden rounded-xl" dangerouslySetInnerHTML={{ __html: qr }} />
          <p className="text-2xl leading-snug text-texto">
            ¿Tu <span className="text-oro-suave">taza de chocolate</span> o tu <span className="text-oro-suave">mano</span>? Sube la foto en <span className="text-oro-suave">miarcana.com/vivo</span>
          </p>
        </div>

        {/* Sibila */}
        <div className="absolute left-16 top-[180px] flex w-[560px] flex-col items-center">
          <div className="relative flex h-[330px] w-[330px] items-center justify-center">
            {/* Anillos que giran en sentidos opuestos */}
            <div className="absolute inset-[-28px] rounded-full border border-dashed border-oro/30 vivo-girar" />
            <div className="absolute inset-[-10px] rounded-full border border-violeta/40 vivo-girar-inverso" />
            <div
              className="flex h-full w-full items-center justify-center rounded-full border-2 border-oro/60 vivo-respirar"
              style={{
                transform: `scale(${1 + nivel * 0.05})`,
                transition: "transform 80ms linear",
                background: "radial-gradient(circle, rgba(139,108,246,0.55), rgba(26,15,58,0.9) 70%)",
                boxShadow: `0 0 ${60 + nivel * 140}px rgba(241,217,154,${0.25 + nivel * 0.45}), inset 0 0 80px rgba(0,0,0,0.6)`,
              }}
            >
              <div className="vivo-flotar">
                <RostroSibila tamano={318} nivel={nivel} />
              </div>
            </div>
          </div>
          <p className="mt-5 font-display text-5xl text-oro-suave">Sibila</p>
          <p className="mt-1 text-xl text-texto-suave">Lecturas en vivo · Arcana</p>
        </div>

        {/* Pregunta */}
        <div key={lectura?.id ?? "espera"} className="absolute left-[700px] right-16 top-[180px] rounded-3xl border border-oro/30 bg-black/35 px-10 py-6 aparecer">
          {lectura ? (
            <>
              <p className="text-2xl text-violeta-suave">
                {NOMBRE_TIPO[lectura.tipo]} · {lectura.autor}
                {lectura.signo ? ` · ${lectura.signo}` : ""}
              </p>
              <p className="mt-2 line-clamp-2 font-display text-[44px] leading-tight text-oro-suave">{lectura.pregunta ? `«${lectura.pregunta}»` : `Lectura para ${lectura.autor}`}</p>
            </>
          ) : (
            <>
              <p className="text-2xl text-violeta-suave">Tarot · Aura · Numerología · Horóscopo · Chocolate · Mano</p>
              <p className="mt-2 font-display text-[44px] leading-tight text-oro-suave">Escribe en el chat tu signo y lo que quieres saber</p>
            </>
          )}
        </div>

        {/* Lo que se lee: cartas, foto, aura, número o signo */}
        {tipo === "tarot" || !lectura ? (
        <div className="absolute left-[700px] right-16 top-[400px] flex justify-center gap-12">
          {cartas.map((c, i) => {
            const visible = Boolean(lectura && c.id && volteadas > i);
            return (
              <div key={i} className="flex w-[250px] flex-col items-center">
                <p className="mb-3 text-xl uppercase tracking-[0.2em] text-violeta-suave">{c.posicion}</p>
                <div className="relative h-[400px] w-[230px] vivo-carta" style={{ perspective: 1200, animationDelay: `${i * 0.7}s` }}>
                  <div className="absolute inset-0 transition-transform duration-700" style={{ transformStyle: "preserve-3d", transform: visible ? "rotateY(180deg)" : "none" }}>
                    <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-4 border-oro/70" style={{ backfaceVisibility: "hidden", background: "repeating-linear-gradient(45deg, #2a1a5e 0 14px, #21134d 14px 28px)" }}>
                      <span className="text-8xl text-oro-suave">✦</span>
                    </div>
                    {c.id && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/cartas/rider/${c.id}.webp`} alt={c.nombre} className="absolute inset-0 h-full w-full rounded-2xl border-4 border-oro/80 object-cover" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
                    )}
                  </div>
                  {visible && <div key={`${lectura?.id}-${i}`} className="pointer-events-none absolute inset-[-30px] rounded-3xl vivo-destello" />}
                </div>
                <p className="mt-3 h-9 font-display text-3xl text-oro-suave">{visible ? c.nombre : ""}</p>
              </div>
            );
          })}
        </div>
        ) : (
          <div className="absolute left-[700px] right-16 top-[400px] flex h-[460px] items-center justify-center" style={{ opacity: volteadas > 0 ? 1 : 0, transition: "opacity 700ms" }}>
            {(tipo === "chocolate" || tipo === "mano") && lectura.imagen && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lectura.imagen} alt="" className="h-[440px] max-w-[720px] rounded-3xl border-4 border-oro/70 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.6)]" />
            )}
            {tipo === "aura" && (
              <div className="flex flex-col items-center">
                <div
                  className="flex h-[380px] w-[380px] items-center justify-center rounded-full"
                  style={{ background: `radial-gradient(circle, ${COLOR_AURA[lectura.color ?? "violeta"] ?? "#8b6cf6"} 0%, rgba(11,7,22,0) 70%)`, boxShadow: `0 0 ${80 + nivel * 120}px ${COLOR_AURA[lectura.color ?? "violeta"] ?? "#8b6cf6"}` }}
                >
                  <span className="font-display text-6xl text-white drop-shadow-lg">{lectura.autor.split(" ")[0]}</span>
                </div>
                <p className="mt-6 font-display text-5xl capitalize text-oro-suave">Aura {lectura.color ?? ""}</p>
              </div>
            )}
            {tipo === "numerologia" && lectura.numero != null && (
              <div className="flex flex-col items-center">
                <div className="flex h-[340px] w-[340px] items-center justify-center rounded-full border-4 border-oro/70 bg-black/30">
                  <span className="font-display text-[200px] leading-none text-oro-suave">{lectura.numero}</span>
                </div>
                <p className="mt-6 text-3xl uppercase tracking-[0.25em] text-violeta-suave">{lectura.etiquetaNumero}</p>
              </div>
            )}
            {tipo === "horoscopo" && (
              <div className="flex flex-col items-center">
                <span className="font-display text-[260px] leading-none text-oro-suave">{`${lectura.simbolo ?? "✦"}\uFE0E`}</span>
                <p className="mt-4 font-display text-6xl text-oro-suave">{lectura.signo}</p>
              </div>
            )}
          </div>
        )}

        {/* Subtítulos */}
        <div className="absolute bottom-[110px] left-16 right-16 flex min-h-[120px] items-center justify-center rounded-3xl bg-black/45 px-12 py-5">
          <p key={subtitulo} className="text-center text-[38px] leading-snug text-texto aparecer">{subtitulo}</p>
        </div>

        {/* Pie */}
        <div className="absolute bottom-8 left-0 right-0 text-center text-2xl text-violeta-suave">
          ✦ Escribe en el chat tu signo y tu pregunta ✦ ¿Taza de chocolate o tu mano? Sube la foto en <span className="text-oro-suave">miarcana.com/vivo</span> ✦ Lecturas de entretenimiento ✦
        </div>

        {aviso && <div className="absolute inset-x-0 top-1/2 mx-auto w-fit rounded-2xl bg-red-900/90 px-8 py-5 text-3xl">{aviso}</div>}
        {sinVoz && <div className="absolute right-16 top-[120px] rounded-full bg-red-900/80 px-5 py-2 text-xl text-red-100">Esta lectura llegó sin voz (ElevenLabs): revisa «Probar la voz» en /admin/redes</div>}
        {bloqueado && <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-5xl text-oro-suave">Toca la pantalla para activar el sonido</div>}
      </div>
    </div>
  );
}
