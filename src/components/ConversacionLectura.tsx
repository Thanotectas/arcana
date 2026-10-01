"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MessageCircleQuestion, Send } from "lucide-react";
import { Markdown } from "./Markdown";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { extraerError, limpiarMarcas } from "@/lib/lecturas/marcas";
import type { PreguntaLectura } from "@/lib/dal";

interface Turno {
  id: string;
  pregunta: string;
  respuesta: string;
  estado: "escribiendo" | "lista" | "error";
  codigo?: string;
}

/**
 * Conversación sobre una lectura terminada: la persona pregunta y la
 * respuesta se escribe en vivo. La primera pregunta es gratis; las demás
 * cuestan créditos (el servidor decide y cobra).
 */
export function ConversacionLectura({
  lecturaId,
  iniciales,
  costo,
  gratisRestantes,
  ilimitado,
  enCirculo = false,
  compras = true,
}: {
  lecturaId: string;
  iniciales: PreguntaLectura[];
  costo: number;
  gratisRestantes: number;
  ilimitado: boolean;
  /** Miembro del Círculo: las preguntas no se cobran (el servidor aplica el tope diario). */
  enCirculo?: boolean;
  /** false en la app de Google Play: sin enlaces a compras. */
  compras?: boolean;
}) {
  const { t } = useT();
  const router = useRouter();
  const [turnos, setTurnos] = useState<Turno[]>(() =>
    iniciales.filter((p) => p.estado === "lista").map((p) => ({ id: p.id, pregunta: p.pregunta, respuesta: p.respuesta ?? "", estado: "lista" })),
  );
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gratis = ilimitado || enCirculo || gratisRestantes - turnos.length > 0;

  async function preguntar() {
    const pregunta = texto.trim();
    if (pregunta.length < 3 || enviando) return;
    setEnviando(true);
    setError(null);
    const idLocal = `local-${Date.now()}`;
    setTurnos((v) => [...v, { id: idLocal, pregunta, respuesta: "", estado: "escribiendo" }]);
    setTexto("");
    try {
      const res = await fetch(`/api/lecturas/${lecturaId}/preguntar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta }),
      });
      if (res.status === 402) {
        setTurnos((v) => v.filter((x) => x.id !== idLocal));
        setError("SIN_CREDITOS");
        return;
      }
      if (!res.ok || !res.body) {
        setTurnos((v) => v.filter((x) => x.id !== idLocal));
        setError("generico");
        return;
      }
      const lector = res.body.getReader();
      const decodificador = new TextDecoder();
      let acumulado = "";
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        acumulado += decodificador.decode(value, { stream: true });
        const limpio = limpiarMarcas(acumulado);
        setTurnos((v) => v.map((x) => (x.id === idLocal ? { ...x, respuesta: limpio } : x)));
      }
      const codigo = extraerError(acumulado);
      setTurnos((v) => v.map((x) => (x.id === idLocal ? { ...x, estado: codigo ? "error" : "lista", codigo: codigo ?? undefined } : x)));
      router.refresh();
    } catch {
      setTurnos((v) => v.map((x) => (x.id === idLocal ? { ...x, estado: "error" } : x)));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="tarjeta space-y-5 border-violeta/30 p-6" id="preguntas">
      <div className="flex items-start gap-3">
        <MessageCircleQuestion className="mt-1 h-6 w-6 shrink-0 text-violeta-suave" aria-hidden />
        <div>
          <h2 className="font-display text-2xl font-semibold">{t.preguntas.titulo}</h2>
          <p className="text-sm text-texto-suave">{t.preguntas.intro}</p>
        </div>
      </div>

      {turnos.length > 0 && (
        <ol className="space-y-4">
          {turnos.map((x) => (
            <li key={x.id} className="space-y-2">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-violeta/20 px-4 py-2.5 text-sm">
                <span className="mb-0.5 block text-[10px] uppercase tracking-widest text-violeta-suave">{t.preguntas.tu}</span>
                {x.pregunta}
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-sm border border-borde bg-superficie-2/60 px-4 py-3 text-sm">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-oro-suave">{t.preguntas.arcana}</span>
                {x.estado === "error" ? (
                  <p className="text-peligro">{x.codigo ? t.lecturas.detalle.causas[x.codigo as keyof typeof t.lecturas.detalle.causas] : t.preguntas.fallo}</p>
                ) : x.respuesta ? (
                  <div>
                    <Markdown texto={x.respuesta} />
                    {x.estado === "escribiendo" && <span className="cursor-escritura" aria-hidden />}
                  </div>
                ) : (
                  <p className="animate-pulse text-texto-suave">{t.preguntas.escribiendo}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && (
        <p className="text-sm text-peligro" role="alert">
          {error === "SIN_CREDITOS" ? (
            <>
              {t.preguntas.sinCreditos} <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>
            </>
          ) : (
            t.preguntas.fallo
          )}
        </p>
      )}

      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          preguntar();
        }}
      >
        <textarea
          className="campo"
          rows={2}
          maxLength={400}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={t.preguntas.placeholder}
          disabled={enviando}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              preguntar();
            }
          }}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-texto-suave">
            {gratis ? t.preguntas.primeraGratis : plantilla(t.preguntas.cuesta, { n: costo })}
            {!gratis && compras && (
              <>
                {" "}
                <Link href="/creditos#circulo" className="text-oro-suave underline">{t.crecimiento.preguntaCirculo}</Link>
              </>
            )}
          </p>
          <button type="submit" className="boton boton-primario" disabled={enviando || texto.trim().length < 3}>
            <Send className="h-4 w-4" aria-hidden />
            {t.preguntas.preguntar} · {gratis ? t.preguntas.gratis : `${costo} ${t.comun.credito}`}
          </button>
        </div>
      </form>
    </section>
  );
}
