"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { IDIOMAS, LOCALE_INTL, NOMBRES_IDIOMA, type Idioma } from "@/lib/i18n/idiomas";
import { TEXTOS_SALA, type TextosSala } from "@/lib/en-vivo-sala-textos";
import { accionPreguntaSala, type EstadoSalaPregunta } from "@/lib/en-vivo-acciones";
import type { EstadoSala, EventoSala } from "@/lib/en-vivo-sala";

export interface ProductoSala {
  clave: string;
  nombre: string;
  descripcion: string;
  href: string;
  costoTexto: string;
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));
const frasesDe = (texto: string) => texto.match(/[^.!?¿¡。]+[.!?。]+|[^.!?。]+$/g)?.map((f) => f.trim()).filter(Boolean) ?? [texto];

/**
 * Sala de Sibila: la persona ve lo que Sibila lee en el directo, con su voz y subtítulos en el idioma que elija,
 * pide su lectura desde el menú y ve los productos de Arcana. La página pregunta cada segundo por el paso actual
 * (/api/en-vivo/sala); cada paso se reproduce una vez, en orden.
 */
export function SalaEnVivo({ idiomaInicial, productos, verTodo, proximo }: { idiomaInicial: Idioma; productos: ProductoSala[]; verTodo: string; proximo: string | null }) {
  const [idioma, setIdioma] = useState<Idioma>(idiomaInicial);
  const t: TextosSala = TEXTOS_SALA[idioma];
  const [sonido, setSonido] = useState(false);
  const [activo, setActivo] = useState<boolean | null>(null);
  const [evento, setEvento] = useState<EventoSala | null>(null);
  const [pendiente, setPendiente] = useState(false);
  const [pausa, setPausa] = useState(false);
  const [fin, setFin] = useState(false);
  const [subtitulo, setSubtitulo] = useState("");
  const [hablando, setHablando] = useState(false);
  const [boca, setBoca] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const idiomaRef = useRef(idioma);

  /** Reproduce el audio con subtítulos por frase (sin audio, el texto se muestra al ritmo de la lectura). */
  const hablar = useCallback(async (texto: string, url: string | null, deIdioma: Idioma) => {
    const frases = frasesDe(texto);
    const total = frases.reduce((s, f) => s + f.length, 0) || 1;
    const el = audio.current;
    setHablando(true);
    try {
      if (url && el) {
        el.src = url;
        await el.play().catch(() => null);
        await new Promise<void>((listo) => {
          const tick = () => {
            if (idiomaRef.current !== deIdioma) return listo();
            const d = el.duration || 1;
            const avance = (el.currentTime / d) * total;
            let acum = 0;
            const actual = frases.find((f) => (acum += f.length) >= avance) ?? frases[frases.length - 1];
            setSubtitulo(actual);
          };
          el.ontimeupdate = tick;
          el.onended = () => listo();
          el.onerror = () => listo();
          // Si el navegador no deja sonar (sin tocar «Escuchar»), el texto avanza solo.
          if (el.paused) {
            (async () => {
              for (const f of frases) {
                if (idiomaRef.current !== deIdioma) break;
                setSubtitulo(f);
                await esperar(Math.max(1800, f.length * 65));
              }
              listo();
            })();
          }
        });
        el.ontimeupdate = null;
      } else {
        for (const f of frases) {
          if (idiomaRef.current !== deIdioma) break;
          setSubtitulo(f);
          await esperar(Math.max(1800, f.length * 65));
        }
      }
    } finally {
      setHablando(false);
    }
  }, []);

  // La boca de Sibila mientras habla.
  useEffect(() => {
    if (!hablando) return;
    const id = setInterval(() => setBoca((b) => (Math.random() < 0.55 ? !b : b)), 170);
    return () => clearInterval(id);
  }, [hablando]);

  // Pide el paso actual cada segundo y reproduce los nuevos, uno tras otro.
  useEffect(() => {
    idiomaRef.current = idioma;
    let vivo = true;
    (async () => {
      let visto = -1;
      while (vivo) {
        let r: EstadoSala | null = null;
        try {
          const res = await fetch(`/api/en-vivo/sala?idioma=${idioma}`);
          r = res.ok ? ((await res.json()) as EstadoSala) : null;
        } catch {
          r = null;
        }
        if (!vivo) break;
        if (r) {
          setActivo(r.activo);
          setPendiente(Boolean(r.pendiente) && r.seq !== visto);
          if (r.seq !== visto && !r.pendiente) {
            visto = r.seq;
            const e = r.evento;
            if (e?.t === "pausa") setPausa(e.on);
            else if (e?.t === "cierre") setFin(e.estado === "fin");
            else if (e?.t === "frase") {
              setPausa(false);
              setFin(e.cierre === "fin");
              setEvento(e);
              await hablar(e.texto, e.audio, idioma);
            } else if (e?.t === "lectura") {
              setPausa(false);
              setFin(false);
              setEvento(e);
              await esperar(1200);
              await hablar(e.texto, e.audio, idioma);
            }
          }
        }
        await esperar(1000);
      }
    })();
    return () => {
      vivo = false;
    };
  }, [idioma, hablar]);

  const escuchar = () => {
    // El toque desbloquea el audio en el celular.
    const el = audio.current;
    if (el) {
      el.muted = false;
      el.play().catch(() => null);
    }
    setSonido(true);
  };

  const lectura = evento?.t === "lectura" ? evento : null;
  const estadoTexto = fin ? t.fin : pausa ? t.pausa : pendiente ? t.traduciendo : !lectura && !subtitulo ? t.esperando : null;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <audio ref={audio} preload="auto" playsInline />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-violeta-suave">
            {activo && <span className="inline-flex items-center gap-2 rounded-full bg-[#e0453a] px-3 py-0.5 text-xs font-semibold tracking-[0.2em] text-white"><span className="h-2 w-2 animate-pulse rounded-full bg-white" />{t.enVivo}</span>}
            Arcana
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{t.titulo}</h1>
          <p className="mt-1 max-w-xl text-texto-suave">{t.bajada}</p>
        </div>
        <label className="text-sm">
          <span className="block text-texto-suave">{t.idioma}</span>
          <select className="campo mt-1" value={idioma} onChange={(e) => {
            audio.current?.pause();
            setSubtitulo("");
            setIdioma(e.target.value as Idioma);
          }}>
            {IDIOMAS.map((i) => (
              <option key={i} value={i}>{NOMBRES_IDIOMA[i]}</option>
            ))}
          </select>
        </label>
      </header>

      {activo === false && !lectura ? (
        <section className="tarjeta p-6 text-center">
          <h2 className="font-display text-3xl">{t.noEnVivo}</h2>
          {proximo && (
            <p className="mt-3 text-lg">
              {t.proximo}: <strong className="text-oro-suave" suppressHydrationWarning>{new Intl.DateTimeFormat(LOCALE_INTL[idioma], { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(new Date(proximo))}</strong>
            </p>
          )}
          <p className="mt-2 text-texto-suave">{t.noEnVivoTexto}</p>
        </section>
      ) : (
        <section className="tarjeta relative overflow-hidden p-4 sm:p-6">
          <div className="grid items-center gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="relative mx-auto w-full max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element -- retrato estático de Sibila */}
              <img src={hablando && boca ? "/marca/sibila/habla.jpg" : "/marca/sibila/base.jpg"} alt="Sibila" className={`aspect-[3/4] w-full rounded-2xl border object-cover transition ${hablando ? "border-oro shadow-[0_0_40px_rgba(241,217,154,.35)]" : "border-borde"}`} />
              {!sonido && (
                <button type="button" onClick={escuchar} className="boton boton-primario absolute inset-x-4 bottom-4 justify-center">
                  {t.escuchar}
                </button>
              )}
            </div>
            <div className="space-y-4">
              {lectura && (
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-violeta-suave">
                    {t.para} <span className="text-oro-suave">{lectura.autor}</span>
                    {lectura.signo ? ` · ${lectura.signo}` : ""}
                  </p>
                  {lectura.pregunta && <p className="mt-1 text-texto-suave">«{lectura.pregunta}»</p>}
                </div>
              )}
              {lectura?.cartas?.length ? (
                <div className="grid grid-cols-3 gap-3">
                  {lectura.cartas.map((c) => (
                    <figure key={`${c.id}-${c.posicion}`} className="text-center text-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element -- carta estática */}
                      <img src={c.imagen ?? `/cartas/rider/${c.id}.webp`} alt={c.nombre} className="mx-auto w-full max-w-[140px] rounded-lg border border-oro/40" />
                      <figcaption className="mt-1">
                        <span className="block text-oro-suave">{c.nombre}</span>
                        <span className="text-texto-suave">{c.posicion}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : lectura?.imagen ? (
                // eslint-disable-next-line @next/next/no-img-element -- foto de la consulta
                <img src={lectura.imagen} alt="" className="mx-auto max-h-64 rounded-xl border border-borde" />
              ) : null}
              {lectura?.respuesta && <p className="font-display text-5xl text-oro-suave">{lectura.respuesta}</p>}
              {lectura?.numero != null && (
                <p className="font-display text-4xl text-oro-suave">
                  {lectura.numero} <span className="text-base text-texto-suave">{lectura.etiquetaNumero}</span>
                </p>
              )}
              <p className="min-h-[5rem] font-display text-2xl leading-snug sm:text-3xl" aria-live="polite">
                {subtitulo || (estadoTexto && <span className="text-texto-suave">{estadoTexto}</span>)}
              </p>
            </div>
          </div>
        </section>
      )}

      <FormularioSala t={t} idioma={idioma} />

      <section className="space-y-4">
        <div>
          <h2 className="font-display text-3xl">{t.productos}</h2>
          <p className="text-texto-suave">{t.productosTexto}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <a key={p.clave} href={p.href} target="_blank" rel="noopener" className="tarjeta block p-4 transition hover:border-oro/60">
              <span className="flex items-baseline justify-between gap-2">
                <span className="font-display text-xl">{p.nombre}</span>
                <span className="text-xs text-oro-suave">{p.costoTexto}</span>
              </span>
              <span className="mt-1 block text-sm text-texto-suave">{p.descripcion}</span>
            </a>
          ))}
        </div>
        <a href={verTodo} target="_blank" rel="noopener" className="boton boton-secundario inline-flex">{t.verTodo} →</a>
      </section>
    </div>
  );
}

function FormularioSala({ t, idioma }: { t: TextosSala; idioma: Idioma }) {
  const [tipo, setTipo] = useState<keyof TextosSala["tipos"]>("tarot");
  const [estado, enviar, enviando] = useActionState<EstadoSalaPregunta, FormData>(accionPreguntaSala, {});
  // Estas lecturas se hacen con la fecha de nacimiento: la pregunta queda opcional.
  const conFecha = ["carta", "sinastria", "numerologia", "horoscopo", "chino"].includes(tipo);
  const mensaje =
    estado.codigo === "ok"
      ? estado.antes
        ? t.okAntes.replace("{n}", String(estado.antes))
        : t.ok
      : estado.codigo
        ? t.errores[estado.codigo as keyof TextosSala["errores"]] ?? t.errores.error
        : null;
  return (
    <section className="tarjeta space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-3xl">{t.pedir}</h2>
      <form action={enviar} className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-texto-suave">{t.nombre}</span>
          <input name="nombre" required maxLength={40} className="campo w-full" autoComplete="given-name" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="text-texto-suave">{t.tipo}</span>
          <select name="tipo" className="campo w-full" value={tipo} onChange={(e) => setTipo(e.target.value as keyof TextosSala["tipos"])}>
            {(Object.keys(t.tipos) as (keyof TextosSala["tipos"])[]).map((k) => (
              <option key={k} value={k}>{t.tipos[k]}</option>
            ))}
          </select>
        </label>
        <input type="hidden" name="idioma" value={idioma} />
        <p className="rounded-xl border border-oro/30 bg-oro/5 p-3 text-sm sm:col-span-2">💡 {t.pistas[tipo]}</p>
        {conFecha && (
          <label className="space-y-1 text-sm">
            <span className="text-texto-suave">{t.campos.fecha}</span>
            <input name="fecha" type="date" required className="campo w-full" min="1900-01-01" />
          </label>
        )}
        {tipo === "carta" && (
          <>
            <label className="space-y-1 text-sm">
              <span className="text-texto-suave">{t.campos.hora}</span>
              <input name="hora" type="time" className="campo w-full" />
            </label>
            <label className="space-y-1 text-sm sm:col-span-2">
              <span className="text-texto-suave">{t.campos.ciudad}</span>
              <input name="ciudad" required maxLength={80} className="campo w-full" />
            </label>
          </>
        )}
        {tipo === "sinastria" && (
          <>
            <label className="space-y-1 text-sm">
              <span className="text-texto-suave">{t.campos.fecha2}</span>
              <input name="fecha2" type="date" required className="campo w-full" min="1900-01-01" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-texto-suave">{t.campos.pareja}</span>
              <input name="pareja" maxLength={40} className="campo w-full" />
            </label>
          </>
        )}
        {tipo === "numerologia" && (
          <label className="space-y-1 text-sm">
            <span className="text-texto-suave">{t.campos.completo}</span>
            <input name="completo" required maxLength={80} className="campo w-full" autoComplete="name" />
          </label>
        )}
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="text-texto-suave">{conFecha ? t.campos.preguntaOpcional : t.pregunta}</span>
          <textarea name="pregunta" required={!conFecha} minLength={conFecha ? undefined : 6} maxLength={300} rows={3} className="campo w-full" />
        </label>
        <label className="flex items-start gap-2 text-sm sm:col-span-2">
          <input type="checkbox" name="acepto" required className="mt-1" />
          <span>{t.acepto}</span>
        </label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button type="submit" className="boton boton-primario" disabled={enviando}>{enviando ? t.enviando : t.enviar}</button>
          {mensaje && <p role="status" className={estado.codigo === "ok" ? "text-oro-suave" : "text-peligro"}>{mensaje}</p>}
        </div>
      </form>
    </section>
  );
}
