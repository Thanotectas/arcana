"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Send, Sparkles, X } from "lucide-react";
import { Markdown } from "./Markdown";
import { Marca } from "./Logo";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { extraerError, limpiarMarcas } from "@/lib/lecturas/marcas";

interface Mensaje {
  id: string;
  rol: "persona" | "asistente";
  contenido: string;
  estado?: "escribiendo" | "lista" | "error";
}

const CLAVE = "arcana-chat-visita";

function leerGuardado(): Mensaje[] {
  try {
    const crudo = sessionStorage.getItem(CLAVE);
    const lista = crudo ? (JSON.parse(crudo) as Mensaje[]) : [];
    return Array.isArray(lista) ? lista.filter((m) => m.estado !== "escribiendo").slice(-20) : [];
  } catch {
    return [];
  }
}

/**
 * Burbuja de Sibila para visitantes sin cuenta: responde dudas sobre Arcana
 * sin cobrar, con un tope diario por persona que decide el servidor. La
 * conversación vive solo en esta pestaña (sessionStorage).
 */
export function ChatVisitante({ nombre, tope }: { nombre: string; tope: number }) {
  const { t } = useT();
  const v = t.asistente.visita;
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [restantes, setRestantes] = useState<number | null>(null);
  const [aviso, setAviso] = useState<"limite" | "ocupado" | "fallo" | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  const [cargado, setCargado] = useState(false);

  /** Al abrir por primera vez: la conversación de esta pestaña y los mensajes que quedan hoy. */
  function alternar() {
    setAbierto((x) => !x);
    if (cargado) return;
    setCargado(true);
    setMensajes(leerGuardado());
    fetch("/api/chat-visita")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { restantes: number } | null) => setRestantes(d ? d.restantes : tope))
      .catch(() => setRestantes(tope));
  }

  useEffect(() => {
    if (abierto) fin.current?.scrollIntoView({ block: "end" });
    try {
      if (mensajes.length) sessionStorage.setItem(CLAVE, JSON.stringify(mensajes.filter((m) => m.estado !== "escribiendo").slice(-20)));
    } catch {
      /* sin almacenamiento */
    }
  }, [mensajes, abierto]);

  async function enviar(contenido?: string) {
    const msg = (contenido ?? texto).trim();
    if (msg.length < 2 || enviando) return;
    setEnviando(true);
    setAviso(null);
    const historial = mensajes.filter((m) => m.estado === "lista").map((m) => ({ rol: m.rol, contenido: m.contenido }));
    const idPersona = `p-${Date.now()}`;
    const idRespuesta = `a-${Date.now()}`;
    setMensajes((lista) => [...lista, { id: idPersona, rol: "persona", contenido: msg, estado: "lista" }, { id: idRespuesta, rol: "asistente", contenido: "", estado: "escribiendo" }]);
    setTexto("");
    try {
      const res = await fetch("/api/chat-visita", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto: msg, historial }) });
      if (res.status === 409) {
        // Ya hay sesión: recargar para usar el chat de la cuenta.
        window.location.reload();
        return;
      }
      if (res.status === 429) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        setMensajes((lista) => lista.filter((x) => x.id !== idPersona && x.id !== idRespuesta));
        setTexto(msg);
        setAviso(d.error === "limite_total" ? "ocupado" : "limite");
        if (d.error !== "limite_total") setRestantes(0);
        return;
      }
      if (!res.ok || !res.body) {
        setMensajes((lista) => lista.filter((x) => x.id !== idRespuesta));
        setAviso("fallo");
        return;
      }
      const lector = res.body.getReader();
      const dec = new TextDecoder();
      let acumulado = "";
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        acumulado += dec.decode(value, { stream: true });
        const limpio = limpiarMarcas(acumulado);
        setMensajes((lista) => lista.map((x) => (x.id === idRespuesta ? { ...x, contenido: limpio } : x)));
      }
      const codigo = extraerError(acumulado);
      setMensajes((lista) => lista.map((x) => (x.id === idRespuesta ? { ...x, estado: codigo ? "error" : "lista" } : x)));
      setRestantes((r) => (r === null ? r : Math.max(0, r - 1)));
    } catch {
      setMensajes((lista) => lista.map((x) => (x.id === idRespuesta ? { ...x, estado: "error" } : x)));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        aria-label={plantilla(t.asistente.abrir, { nombre })}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-oro/50 bg-noche/90 py-2 pl-2 pr-4 text-sm text-oro-suave shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(139,108,246,0.25)] backdrop-blur transition hover:bg-noche"
      >
        <Marca tamano={30} />
        <span className="font-display text-lg">{v.boton}</span>
      </button>

      {abierto && (
        <section
          role="dialog"
          aria-label={nombre}
          className="fixed bottom-20 right-4 z-30 flex h-[min(600px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-borde bg-noche/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur aparecer"
        >
          <header className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
            <div className="flex items-center gap-3">
              <Marca tamano={34} />
              <div>
                <p className="font-display text-xl text-oro-suave">{nombre}</p>
                <p className="text-[11px] text-texto-suave">{v.subtitulo}</p>
              </div>
            </div>
            <button type="button" onClick={() => setAbierto(false)} className="rounded-full p-1.5 text-texto-suave hover:text-texto" aria-label={t.comun.cerrar}>
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {mensajes.length === 0 ? (
              <div className="space-y-3">
                <p className="text-texto-suave">{plantilla(v.bienvenida, { nombre })}</p>
                <div className="flex flex-wrap gap-2">
                  {v.sugerencias.map((s) => (
                    <button key={s} type="button" onClick={() => enviar(s)} className="rounded-full border border-violeta/40 bg-violeta/10 px-3 py-1.5 text-left text-xs text-violeta-suave hover:bg-violeta/20">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              mensajes.map((m) =>
                m.rol === "persona" ? (
                  <div key={m.id} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-violeta/20 px-3.5 py-2">{m.contenido}</div>
                ) : (
                  <div key={m.id} className="max-w-[92%] rounded-2xl rounded-bl-sm border border-borde bg-superficie-2/60 px-3.5 py-2.5">
                    {m.estado === "error" ? (
                      <p className="text-peligro">{v.fallo}</p>
                    ) : m.contenido ? (
                      <div>
                        <Markdown texto={m.contenido} />
                        {m.estado === "escribiendo" && <span className="cursor-escritura" aria-hidden />}
                      </div>
                    ) : (
                      <p className="animate-pulse text-texto-suave">{plantilla(t.asistente.escribiendo, { nombre })}</p>
                    )}
                  </div>
                ),
              )
            )}
            <div ref={fin} />
          </div>

          <form
            className="border-t border-borde p-3"
            onSubmit={(e) => {
              e.preventDefault();
              enviar();
            }}
          >
            {aviso && (
              <p className="mb-2 text-xs text-peligro">
                {aviso === "limite" ? v.limite : aviso === "ocupado" ? v.ocupado : v.fallo}{" "}
                {aviso === "limite" && (
                  <Link href="/registro" className="text-oro-suave underline">
                    {t.comun.crearCuenta}
                  </Link>
                )}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={1}
                maxLength={500}
                placeholder={t.asistente.placeholder}
                className="campo max-h-28 min-h-[44px] flex-1 resize-none py-2.5 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
              />
              <button type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-oro-suave to-oro text-noche shadow-[0_8px_24px_rgba(217,180,90,0.35)] transition disabled:opacity-40" disabled={enviando || texto.trim().length < 2 || restantes === 0} aria-label={t.asistente.enviar}>
                <Send className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-texto-suave">
              <Sparkles className="h-3 w-3 text-oro" aria-hidden /> {restantes === null ? v.gratis : plantilla(v.restantes, { n: restantes })}
              {" · "}
              <Link href="/registro" className="text-oro-suave underline">
                {v.regalo}
              </Link>
            </p>
          </form>
        </section>
      )}
    </>
  );
}
