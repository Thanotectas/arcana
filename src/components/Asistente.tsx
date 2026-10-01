"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Send, X } from "lucide-react";
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
  codigo?: string;
}

/**
 * Chat flotante con Sibila. El historial se carga al abrir; cada envío
 * transmite la respuesta mientras se escribe. El servidor decide el cobro.
 */
export function Asistente({ nombre, gratisPorDia, circuloPorDia, costo, enCirculo, ilimitado, usadosHoy }: { nombre: string; gratisPorDia: number; circuloPorDia: number; costo: number; enCirculo: boolean; ilimitado: boolean; usadosHoy: number }) {
  const { t } = useT();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoy, setHoy] = useState(usadosHoy);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto || cargado) return;
    let activo = true;
    fetch("/api/asistente")
      .then((r) => (r.ok ? r.json() : { mensajes: [], hoy: usadosHoy }))
      .then((d: { mensajes: Mensaje[]; hoy: number }) => {
        if (!activo) return;
        setMensajes(d.mensajes.map((m) => ({ ...m, estado: "lista" })));
        setHoy(d.hoy);
        setCargado(true);
      })
      .catch(() => {
        if (activo) setCargado(true);
      });
    return () => {
      activo = false;
    };
  }, [abierto, cargado, usadosHoy]);

  useEffect(() => {
    if (abierto) fin.current?.scrollIntoView({ block: "end" });
  }, [mensajes, abierto]);

  const tope = ilimitado ? Infinity : enCirculo ? circuloPorDia : gratisPorDia;
  const gratisRestantes = Math.max(0, tope - hoy);
  const gratis = gratisRestantes > 0;

  async function enviar(contenido?: string) {
    const msg = (contenido ?? texto).trim();
    if (msg.length < 2 || enviando) return;
    setEnviando(true);
    setError(null);
    const idPersona = `p-${Date.now()}`;
    const idRespuesta = `a-${Date.now()}`;
    setMensajes((v) => [...v, { id: idPersona, rol: "persona", contenido: msg, estado: "lista" }, { id: idRespuesta, rol: "asistente", contenido: "", estado: "escribiendo" }]);
    setTexto("");
    try {
      const res = await fetch("/api/asistente", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ texto: msg }) });
      if (res.status === 402) {
        setMensajes((v) => v.filter((x) => x.id !== idPersona && x.id !== idRespuesta));
        setError("sin_creditos");
        return;
      }
      if (!res.ok || !res.body) {
        setMensajes((v) => v.filter((x) => x.id !== idRespuesta));
        setError("generico");
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
        setMensajes((v) => v.map((x) => (x.id === idRespuesta ? { ...x, contenido: limpio } : x)));
      }
      const codigo = extraerError(acumulado);
      setMensajes((v) => v.map((x) => (x.id === idRespuesta ? { ...x, estado: codigo ? "error" : "lista", codigo: codigo ?? undefined } : x)));
      if (!codigo) setHoy((h) => h + 1);
      router.refresh();
    } catch {
      setMensajes((v) => v.map((x) => (x.id === idRespuesta ? { ...x, estado: "error" } : x)));
    } finally {
      setEnviando(false);
    }
  }

  const notaCosto = ilimitado
    ? t.comun.usoIlimitado
    : gratis
      ? plantilla(enCirculo ? t.asistente.circuloRestantes : t.asistente.gratisRestantes, { n: gratisRestantes })
      : plantilla(t.asistente.cuesta, { n: costo });

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-label={plantilla(t.asistente.abrir, { nombre })}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full border border-oro/50 bg-noche/90 py-2 pl-2 pr-4 text-sm text-oro-suave shadow-[0_10px_40px_rgba(0,0,0,0.5),0_0_30px_rgba(139,108,246,0.25)] backdrop-blur transition hover:bg-noche"
      >
        <Marca tamano={30} />
        <span className="font-display text-lg">{nombre}</span>
      </button>

      {abierto && (
        <section
          role="dialog"
          aria-label={nombre}
          className="fixed bottom-20 right-4 z-30 flex h-[min(620px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-borde bg-noche/95 shadow-[0_30px_80px_rgba(0,0,0,0.6)] backdrop-blur aparecer"
        >
          <header className="flex items-center justify-between gap-3 border-b border-borde px-4 py-3">
            <div className="flex items-center gap-3">
              <Marca tamano={34} />
              <div>
                <p className="font-display text-xl text-oro-suave">{nombre}</p>
                <p className="text-[11px] text-texto-suave">{t.asistente.subtitulo}</p>
              </div>
            </div>
            <button type="button" onClick={() => setAbierto(false)} className="rounded-full p-1.5 text-texto-suave hover:text-texto" aria-label={t.comun.cerrar}>
              <X className="h-5 w-5" aria-hidden />
            </button>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
            {!cargado ? (
              <p className="animate-pulse text-texto-suave">{t.comun.unMomento}</p>
            ) : mensajes.length === 0 ? (
              <div className="space-y-3">
                <p className="text-texto-suave">{plantilla(t.asistente.bienvenida, { nombre })}</p>
                <div className="flex flex-wrap gap-2">
                  {t.asistente.sugerencias.map((s) => (
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
                      <p className="text-peligro">{m.codigo ? t.lecturas.detalle.causas[m.codigo as keyof typeof t.lecturas.detalle.causas] : t.asistente.fallo}</p>
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
            {error && (
              <p className="mb-2 text-xs text-peligro">
                {error === "sin_creditos" ? t.preguntas.sinCreditos : t.asistente.fallo}{" "}
                {error === "sin_creditos" && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
              </p>
            )}
            <div className="flex items-end gap-2">
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                rows={1}
                maxLength={600}
                placeholder={t.asistente.placeholder}
                className="campo max-h-28 min-h-[44px] flex-1 resize-none py-2.5 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    enviar();
                  }
                }}
              />
              <button type="submit" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-oro-suave to-oro text-noche shadow-[0_8px_24px_rgba(217,180,90,0.35)] transition disabled:opacity-40" disabled={enviando || texto.trim().length < 2} aria-label={t.asistente.enviar}>
                <Send className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 flex items-center gap-1 text-[11px] text-texto-suave">
              <Sparkles className="h-3 w-3 text-oro" aria-hidden /> {notaCosto}
              {!gratis && !ilimitado && !enCirculo && (
                <>
                  {" · "}
                  <Link href="/creditos#circulo" className="text-oro-suave underline">{t.crecimiento.preguntaCirculo}</Link>
                </>
              )}
            </p>
          </form>
        </section>
      )}
    </>
  );
}
