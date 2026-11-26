"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import type { PreguntaTest } from "@/lib/escuela/tipos";
import { EscucharSibila } from "./EscucharSibila";

interface Resultado {
  correctas: number;
  total: number;
  detalle: { indice: number; acierto: boolean | null; porque?: string }[];
  comentario: string | null;
  aprobada: boolean;
  minimo?: number;
  faltaProyecto?: boolean;
}

/** Preguntas de la lección: se corrigen las de opción, Sibila comenta las abiertas y la lección queda hecha. */
export function TestLeccion({
  curso,
  leccion,
  preguntas,
  previas,
  comentarioPrevio,
  audioPrevio,
  siguiente,
  ultima,
  llave,
  yaHecha,
  gradoNuevo,
  prueba = false,
}: {
  curso: string;
  leccion: number;
  preguntas: PreguntaTest[];
  previas: Record<string, unknown>;
  comentarioPrevio: string | null;
  audioPrevio: string | null;
  siguiente: string | null;
  ultima: boolean;
  /** La llave que recibe al completar la lección por primera vez (con su ceremonia). */
  llave: { nombre: string; simbolo: string; saber: string };
  yaHecha: boolean;
  /** El grado al que sube con esta llave, si cambia (Iniciada, Adepto, Maestra de rituales…). */
  gradoNuevo: string | null;
  /** La prueba del Círculo: el comentario de Sibila es la revisión del proyecto (se muestra allá, no aquí). */
  prueba?: boolean;
}) {
  const router = useRouter();
  const [respuestas, setRespuestas] = useState<Record<string, unknown>>(previas);
  const [estado, setEstado] = useState<"" | "enviando" | "error">("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carta, setCarta] = useState<string | null>(null);
  const [cartaAudio, setCartaAudio] = useState<string | null>(null);
  const comentario = prueba ? null : (resultado?.comentario ?? comentarioPrevio);
  const aprobada = resultado ? resultado.aprobada : yaHecha;
  const completo = preguntas.every((p, i) => p.tipo !== "opcion" || typeof respuestas[String(i)] === "number");

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    const r = await fetch("/api/escuela", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "leccion", curso, leccion, respuestas }) }).catch(() => null);
    const datos = (await r?.json().catch(() => null)) as { ok?: boolean; resultado?: Resultado; carta?: string | null; cartaAudio?: string | null } | null;
    if (!datos?.ok || !datos.resultado) return setEstado("error");
    setResultado(datos.resultado);
    setCarta(datos.carta ?? null);
    setCartaAudio(datos.cartaAudio ?? null);
    setEstado("");
    router.refresh();
  };

  return (
    <form onSubmit={enviar} className="space-y-5">
      {preguntas.map((p, i) => {
        const d = resultado?.detalle.find((x) => x.indice === i);
        return (
          <fieldset key={i} className="space-y-2">
            <legend className="font-medium">{p.p}</legend>
            {p.tipo === "opcion" ? (
              <div className="space-y-2">
                {p.opciones.map((o, j) => (
                  <label key={j} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${respuestas[String(i)] === j ? "border-oro/60 bg-oro/10" : "border-borde hover:border-oro/30"}`}>
                    <input type="radio" name={`p${i}`} checked={respuestas[String(i)] === j} onChange={() => setRespuestas({ ...respuestas, [String(i)]: j })} className="accent-[#f1d99a]" />
                    {o}
                  </label>
                ))}
                {d && (
                  <p className={`flex items-start gap-2 text-sm ${d.acierto ? "text-oro-suave" : "text-texto-suave"}`}>
                    {d.acierto ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                    {d.porque}
                  </p>
                )}
              </div>
            ) : (
              <>
                {p.ayuda && <p className="text-xs text-texto-suave">{p.ayuda}</p>}
                <textarea rows={4} maxLength={1500} value={String(respuestas[String(i)] ?? "")} onChange={(e) => setRespuestas({ ...respuestas, [String(i)]: e.target.value })} className="campo w-full" />
              </>
            )}
          </fieldset>
        );
      })}

      <button type="submit" disabled={!completo || estado === "enviando"} className="boton boton-primario">
        {estado === "enviando" ? "Sibila está leyendo…" : prueba ? (aprobada ? "Enviar de nuevo" : resultado ? "Intentar de nuevo" : "Presentar la prueba") : resultado || comentarioPrevio ? "Enviar de nuevo" : "Terminar la lección"}
      </button>
      {estado === "error" && <p className="text-sm text-red-300">No se pudo guardar. Intenta de nuevo.</p>}

      {resultado && resultado.total > 0 && <p className="text-sm text-texto-suave">Acertaste {resultado.correctas} de {resultado.total}.</p>}
      {resultado && !resultado.aprobada && (
        <div className="tarjeta border-violeta/40 p-5 text-sm">
          {resultado.faltaProyecto ? (
            <p>Antes de la prueba, diseña tu propio ritual (arriba) y envíaselo a Sibila.</p>
          ) : (
            <p>
              Para cerrar el Círculo necesitas {resultado.minimo} aciertos de {resultado.total}. Lee las explicaciones, repasa tu grimorio y el libro de
              correspondencias, y vuelve a intentarlo cuando quieras: no hay límite.
            </p>
          )}
        </div>
      )}
      {/* La ceremonia de la llave: solo la primera vez que se completa la lección. */}
      {resultado?.aprobada && !yaHecha && (
        <div className="tarjeta relative overflow-hidden border-oro/60 p-8 text-center">
          <div className="escuela-cielo pointer-events-none absolute inset-0" aria-hidden />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_50%_at_50%_35%,rgba(241,217,154,.25),transparent_70%)]" aria-hidden />
          <span className="escuela-encender relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-oro bg-oro/15 text-5xl shadow-[0_0_60px_rgba(241,217,154,.55)]">{llave.simbolo}</span>
          <p className="relative mt-4 text-xs uppercase tracking-[0.35em] text-oro-suave">Recibiste</p>
          <p className="relative font-display text-4xl">{llave.nombre}</p>
          <p className="relative mx-auto mt-2 max-w-sm text-sm text-texto-suave">Ahora sabes: {llave.saber}</p>
          {gradoNuevo && (
            <p className="relative mt-4 font-display text-2xl italic text-violeta-suave">
              Tu grado en el camino: <span className="not-italic text-oro-suave">{gradoNuevo}</span>
            </p>
          )}
        </div>
      )}
      {comentario && (
        <div className="tarjeta border-oro/40 bg-oro/5 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Sibila te responde</p>
          {comentario.split(/\n{2,}/).map((x, k) => (
            <p key={k} className="mt-2 leading-relaxed">{x}</p>
          ))}
          {/* Un comentario nuevo necesita su propio audio: la clave reinicia el botón. */}
          <EscucharSibila key={comentario} curso={curso} leccion={leccion} audioInicial={resultado ? null : audioPrevio} />
        </div>
      )}
      {carta && (
        <div className="tarjeta border-oro/50 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave">Tu carta de cierre de ciclo</p>
          {cartaAudio && <audio controls autoPlay src={cartaAudio} className="mt-3 w-full" />}
          <p className="mt-4 text-sm">
            <Link href={`/escuela/${curso}/grimorio`} className="text-oro-suave underline">Abrir mi grimorio y compartir mi sello de cierre ✦</Link>
          </p>
          {carta.split(/\n{2,}/).map((x, k) => (
            <p key={k} className="font-display mt-3 text-xl leading-relaxed">{x}</p>
          ))}
        </div>
      )}
      {aprobada && (resultado || comentarioPrevio) && (
        <p className="text-sm">
          {ultima ? (
            <Link href={`/escuela/${curso}`} className="text-oro-suave underline">Volver al curso</Link>
          ) : siguiente ? (
            <Link href={siguiente} className="text-oro-suave underline">Ir a la siguiente lección</Link>
          ) : (
            <span className="text-texto-suave">La siguiente lección se abre mañana 🕯️</span>
          )}
        </p>
      )}
    </form>
  );
}
