"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { LOCALE_INTL } from "@/lib/i18n/idiomas";

/** Subconjunto de la Web Speech API que usamos (no está en los tipos de TS por defecto). */
interface Reconocimiento {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

function constructorVoz(): (new () => Reconocimiento) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconocimiento; webkitSpeechRecognition?: new () => Reconocimiento };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Dictado por voz, como una nota de voz de WhatsApp pero convertida en texto
 * al instante: lo reconocido se añade a `valor`. Usa el reconocimiento de
 * voz del navegador (Chrome, Safari y la app de Android); si no existe, no
 * se muestra nada.
 */
export function BotonVoz({ valor, onChange, disabled, compacto = false }: { valor: string; onChange: (nuevo: string) => void; disabled?: boolean; compacto?: boolean }) {
  const { t, idioma } = useT();
  // En el servidor no hay reconocimiento; en el cliente depende del navegador.
  const soportado = useSyncExternalStore(() => () => {}, () => constructorVoz() !== null, () => false);
  const [grabando, setGrabando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rec = useRef<Reconocimiento | null>(null);
  const base = useRef("");
  const finales = useRef("");

  useEffect(() => () => rec.current?.abort(), []);

  function componer(parcial: string) {
    const dictado = (finales.current + " " + parcial).replace(/\s+/g, " ").trim();
    const b = base.current.trim();
    return b ? `${b} ${dictado}` : dictado;
  }

  function empezar() {
    const C = constructorVoz();
    if (!C) return;
    setError(null);
    const r = new C();
    r.lang = LOCALE_INTL[idioma];
    r.continuous = true;
    r.interimResults = true;
    base.current = valor;
    finales.current = "";
    r.onresult = (e) => {
      let parcial = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const texto = res[0]?.transcript ?? "";
        if (res.isFinal) finales.current = (finales.current + " " + texto).trim();
        else parcial += texto;
      }
      onChange(componer(parcial));
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? t.voz.sinPermiso : t.voz.fallo);
      setGrabando(false);
    };
    r.onend = () => {
      setGrabando(false);
      onChange(componer(""));
      rec.current = null;
    };
    rec.current = r;
    try {
      r.start();
      setGrabando(true);
    } catch {
      setError(t.voz.fallo);
    }
  }

  function parar() {
    rec.current?.stop();
  }

  if (!soportado) return null;
  return (
    <div className={compacto ? "shrink-0" : "flex flex-wrap items-center gap-3"}>
      <button
        type="button"
        onClick={grabando ? parar : empezar}
        disabled={disabled}
        aria-pressed={grabando}
        aria-label={grabando ? t.voz.detener : t.voz.dictar}
        className={
          compacto
            ? `flex h-11 w-11 items-center justify-center rounded-full border transition disabled:opacity-40 ${grabando ? "animate-pulse border-red-400/70 bg-red-500/20 text-red-200" : "border-borde text-texto-suave hover:border-oro/50 hover:text-oro-suave"}`
            : `flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${grabando ? "animate-pulse border-red-400/70 bg-red-500/20 text-red-200" : "border-borde text-texto-suave hover:border-oro/50 hover:text-oro-suave"}`
        }
      >
        {grabando ? <Square className="h-4 w-4" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />}
        {!compacto && (grabando ? t.voz.detener : t.voz.dictar)}
      </button>
      {!compacto && grabando && <span className="text-xs text-texto-suave">{t.voz.escuchando}</span>}
      {!compacto && error && <span className="text-xs text-red-300">{error}</span>}
    </div>
  );
}
