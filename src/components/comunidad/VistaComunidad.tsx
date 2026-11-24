"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Flag, Languages, Reply, Send, Sparkles, X } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { TEXTOS_COMUNIDAD } from "@/lib/comunidad/textos";
import type { Emoji, MensajeVista } from "@/lib/comunidad/servidor";

const EMOJIS: Emoji[] = ["✨", "🔮", "🙏"];
const LARGO = 600;
/** Cada cuánto se buscan mensajes nuevos mientras la página está abierta y visible. */
const CADA_MS = 9000;

export function VistaComunidad({ fecha, esHoy, conCuenta, inicial }: { fecha: string; esHoy: boolean; conCuenta: boolean; inicial: MensajeVista[] }) {
  const { idioma } = useT();
  const t = TEXTOS_COMUNIDAD[idioma];
  const [mensajes, setMensajes] = useState(inicial);
  const [texto, setTexto] = useState("");
  const [respondiendo, setRespondiendo] = useState<MensajeVista | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [originales, setOriginales] = useState<Set<number>>(new Set());
  const caja = useRef<HTMLTextAreaElement>(null);

  const cargar = useCallback(async () => {
    const r = await fetch(`/api/comunidad?fecha=${fecha}&idioma=${idioma}`, { cache: "no-store" }).catch(() => null);
    if (!r?.ok) return;
    const d = (await r.json()) as { mensajes: MensajeVista[] };
    setMensajes(d.mensajes);
  }, [fecha, idioma]);

  useEffect(() => {
    if (!esHoy) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void cargar();
    }, CADA_MS);
    return () => window.clearInterval(id);
  }, [cargar, esHoy]);

  // Hilos: cada mensaje principal con sus respuestas debajo.
  const hilos = useMemo(() => {
    const principales = mensajes.filter((m) => !m.respuestaA);
    return principales.map((p) => ({ principal: p, respuestas: mensajes.filter((m) => m.respuestaA === p.id) }));
  }, [mensajes]);
  const hayDeOtros = mensajes.some((m) => !m.sibila);

  async function publicar() {
    if (enviando) return;
    setError(null);
    setAviso(null);
    setEnviando(true);
    try {
      const r = await fetch("/api/comunidad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "publicar", texto, respuestaA: respondiendo?.id ?? null, idioma }) });
      const d = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: keyof typeof t.errores; revision?: boolean };
      if (!d.ok) {
        setError(t.errores[d.error ?? "general"] ?? t.errores.general);
        return;
      }
      setTexto("");
      setRespondiendo(null);
      if (d.revision) setAviso(t.enRevision);
      await cargar();
      // Sibila suele responder en unos segundos.
      window.setTimeout(() => void cargar(), 7000);
    } finally {
      setEnviando(false);
    }
  }

  async function reaccionar(m: MensajeVista, emoji: Emoji) {
    if (!conCuenta) return;
    const tengo = m.mias.includes(emoji);
    setMensajes((v) => v.map((x) => (x.id === m.id ? { ...x, mias: tengo ? x.mias.filter((e) => e !== emoji) : [...x.mias, emoji], reacciones: { ...x.reacciones, [emoji]: x.reacciones[emoji] + (tengo ? -1 : 1) } } : x)));
    await fetch("/api/comunidad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "reaccion", mensajeId: m.id, emoji }) }).catch(() => null);
  }

  async function reportar(m: MensajeVista) {
    await fetch("/api/comunidad", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "reportar", mensajeId: m.id }) }).catch(() => null);
    setAviso(t.reportado);
  }

  function responder(m: MensajeVista) {
    setRespondiendo(m);
    caja.current?.focus();
    caja.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const Mensaje = ({ m, respuesta }: { m: MensajeVista; respuesta?: boolean }) => {
    const verOriginal = originales.has(m.id);
    return (
      <div id={`m${m.id}`} className={`rounded-2xl border p-4 ${m.sibila ? "border-oro/40 bg-oro/5" : "border-borde bg-superficie-2/50"} ${respuesta ? "ms-6 sm:ms-10" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className={`font-semibold ${m.sibila ? "text-oro-suave" : "text-texto"}`}>{m.sibila ? `🔮 ${t.sibila}` : m.autor}</span>
          {m.circulo && <span className="rounded-full border border-violeta-suave/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-violeta-suave">✦ {t.circulo}</span>}
          {m.original && (
            <button type="button" onClick={() => setOriginales((s) => { const n = new Set(s); if (n.has(m.id)) n.delete(m.id); else n.add(m.id); return n; })} className="inline-flex items-center gap-1 text-xs text-texto-suave hover:text-texto">
              <Languages className="h-3.5 w-3.5" aria-hidden /> {verOriginal ? t.verTraduccion : `${t.traducido} · ${t.verOriginal}`}
            </button>
          )}
        </div>
        <p className="mt-2 whitespace-pre-line text-[0.97rem] leading-relaxed text-texto" dir="auto">{verOriginal && m.original ? m.original : m.texto}</p>
        {m.revision && <p className="mt-2 text-xs text-advertencia">{t.enRevision}</p>}
        {!m.revision && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => void reaccionar(m, e)} disabled={!conCuenta} className={`rounded-full border px-2.5 py-0.5 text-sm transition ${m.mias.includes(e) ? "border-oro/60 bg-oro/10" : "border-borde hover:border-oro/40"} disabled:cursor-default`}>
                {e}
                {m.reacciones[e] > 0 && <span className="ms-1 text-xs text-texto-suave">{m.reacciones[e]}</span>}
              </button>
            ))}
            {esHoy && conCuenta && (
              <button type="button" onClick={() => responder(m)} className="inline-flex items-center gap-1 text-xs text-texto-suave hover:text-texto">
                <Reply className="h-3.5 w-3.5" aria-hidden /> {t.responder}
              </button>
            )}
            {conCuenta && !m.sibila && !m.propio && (
              <button type="button" onClick={() => void reportar(m)} className="ms-auto inline-flex items-center gap-1 text-xs text-texto-suave/70 hover:text-peligro" title={t.reportar}>
                <Flag className="h-3.5 w-3.5" aria-hidden /> <span className="sr-only sm:not-sr-only">{t.reportar}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {hilos.map(({ principal, respuestas }) => (
          <div key={principal.id} className="space-y-2">
            <Mensaje m={principal} />
            {respuestas.map((r) => (
              <Mensaje key={r.id} m={r} respuesta />
            ))}
          </div>
        ))}
        {!hayDeOtros && esHoy && <p className="text-center text-sm text-texto-suave">{t.vacio}</p>}
      </div>

      {esHoy ? (
        conCuenta ? (
          <div className="tarjeta sticky bottom-3 space-y-2 p-3 sm:p-4">
            {respondiendo && (
              <div className="flex items-center gap-2 text-xs text-texto-suave">
                <Reply className="h-3.5 w-3.5" aria-hidden /> {t.respondiendoA} <strong className="text-texto">{respondiendo.sibila ? t.sibila : respondiendo.autor}</strong>
                <button type="button" onClick={() => setRespondiendo(null)} className="ms-auto inline-flex items-center gap-1 hover:text-texto">
                  <X className="h-3.5 w-3.5" aria-hidden /> {t.cancelar}
                </button>
              </div>
            )}
            <textarea
              ref={caja}
              value={texto}
              onChange={(e) => setTexto(e.target.value.slice(0, LARGO))}
              rows={3}
              dir="auto"
              placeholder={respondiendo ? t.placeholderRespuesta : t.placeholder}
              className="campo w-full resize-none text-[0.97rem]"
            />
            <div className="flex items-center gap-3">
              <span className="text-xs text-texto-suave">{t.normas}</span>
              <span className="ms-auto text-xs text-texto-suave">{texto.length}/{LARGO}</span>
              <button type="button" onClick={() => void publicar()} disabled={enviando || texto.trim().length < 2} className="boton boton-primario inline-flex items-center gap-1.5 px-4 py-2 text-sm disabled:opacity-40">
                {enviando ? <Sparkles className="h-4 w-4 animate-pulse" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} {enviando ? t.publicando : t.publicar}
              </button>
            </div>
            {error && <p className="text-sm text-peligro">{error}</p>}
            {aviso && <p className="text-sm text-exito">{aviso}</p>}
          </div>
        ) : (
          <div className="tarjeta space-y-3 p-5 text-center">
            <p className="text-texto-suave">{t.entraParaEscribir}</p>
            <div className="flex justify-center gap-3">
              <Link href="/registro" className="boton boton-primario">{t.crearCuenta}</Link>
              <Link href="/entrar?volver=/comunidad" className="boton boton-fantasma">{t.entrar}</Link>
            </div>
          </div>
        )
      ) : (
        <p className="text-center text-sm text-texto-suave">{t.soloLectura}</p>
      )}
    </div>
  );
}
