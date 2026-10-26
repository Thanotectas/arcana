"use client";

import { useState, type ReactNode } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { FotoAnotada } from "./FotoAnotada";
import { TONO_COLOR, type EntradaVelas, type Senal } from "@/lib/velas";
import { PLAZOS, separarRestos, type AnexoVelas, type MarcaResto, type TipoResto } from "@/lib/velas/restos";
import { useT } from "@/lib/i18n/cliente";
import type { Diccionario } from "@/lib/i18n/diccionarios";

type T = Diccionario["velas"];

const COLOR: Record<TipoResto, string> = { cera: "#f1d99a", hollin: "#a8a2b8", mecha: "#ff8a5b", figura: "#8fc7ff" };
const CHISPAS: [number, number][] = [[-16, -30], [15, -38], [-10, -50], [12, -18]];

/**
 * La vela dibujada en su color, tal como la persona la vio arder: la altura
 * según se consumió rápido o lento, la llama alta, baja, inquieta o apagada,
 * lágrimas de cera, humo, chispas y la cera en el plato.
 */
function DibujoVela({ color, senales, t }: { color: string; senales: Set<Senal>; t: T }) {
  const top = senales.has("rapida") ? 150 : senales.has("lenta") ? 92 : 118;
  const escala = senales.has("llama_alta") ? 1.35 : senales.has("llama_baja") ? 0.7 : 1;
  const apagada = senales.has("se_apago");
  const base = top - 12;
  return (
    <svg viewBox="0 0 200 260" className="mx-auto w-full max-w-[12rem]" role="img" aria-label={t.llamaTitulo}>
      <defs>
        <radialGradient id="vela-halo">
          <stop offset="0" stopColor="#ffd27a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vela-fuego" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ff6a2b" />
          <stop offset="0.45" stopColor="#ffb347" />
          <stop offset="1" stopColor="#fff6c8" />
        </linearGradient>
        <linearGradient id="vela-cuerpo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Plato y cera derramada */}
      <ellipse cx="100" cy="236" rx="72" ry="13" fill="#221a38" stroke="#d9b45a" strokeOpacity="0.5" />
      {!senales.has("cera_limpia") && <ellipse cx="100" cy="231" rx="42" ry="7" fill={color} opacity="0.9" />}
      {/* Cuerpo */}
      <rect x="74" y={top} width="52" height={230 - top} rx="3" fill={color} stroke="#ffffff" strokeOpacity="0.15" />
      <rect x="74" y={top} width="52" height={230 - top} rx="3" fill="url(#vela-cuerpo)" />
      <ellipse cx="100" cy={top} rx="26" ry="5" fill={color} stroke="#000" strokeOpacity="0.2" />
      {senales.has("lagrimas") && (
        <g fill={color} stroke="#ffffff" strokeOpacity="0.2">
          <path d={`M 76 ${top + 2} q -3 18 -1 34 a 3.5 3.5 0 0 0 7 0 q 1 -16 -2 -34 Z`} />
          <path d={`M 118 ${top + 3} q 3 12 1 22 a 3 3 0 0 0 6 0 q 1 -10 -1 -22 Z`} />
          <path d={`M 98 ${top + 4} q -2 10 0 16 a 2.5 2.5 0 0 0 5 0 q 0 -8 -1 -16 Z`} />
        </g>
      )}
      {/* Mecha */}
      <path d={`M 100 ${top - 1} q -1 -7 1 -${apagada ? 10 : 13}`} stroke="#2a1a10" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {apagada ? (
        <path d={`M 101 ${top - 12} C 92 ${top - 30} 112 ${top - 46} 100 ${top - 70}`} fill="none" stroke="#a8a2b8" strokeWidth="2" strokeOpacity="0.7" strokeLinecap="round" className="tabaco-humo" />
      ) : (
        <g transform={`translate(100 ${base}) scale(${escala})`}>
          <circle cx="0" cy="-18" r="30" fill="url(#vela-halo)" className="tabaco-brasa" style={{ filter: "none" }} />
          <g className={senales.has("llama_inquieta") ? "vela-inquieta" : "vela-llama"}>
            <path d="M 0 0 C -11 -8 -10 -24 0 -42 C 10 -24 11 -8 0 0 Z" fill="url(#vela-fuego)" />
            <ellipse cx="0" cy="-6" rx="3.5" ry="6" fill="#7fb6ff" opacity="0.8" />
          </g>
          {senales.has("chisporroteo") && CHISPAS.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.6" fill="#ffd27a" className="huevo-burbuja" style={{ animationDelay: `${i * 0.3}s` }} />)}
        </g>
      )}
      {senales.has("mucho_humo") && !apagada && (
        <path d={`M 100 ${base - 46 * escala} C 90 ${base - 60 * escala} 112 ${base - 74 * escala} 98 ${Math.max(4, base - 100 * escala)}`} fill="none" stroke="#5f5870" strokeWidth="4" strokeOpacity="0.6" strokeLinecap="round" className="tabaco-humo" />
      )}
    </svg>
  );
}

/** La vela dibujada junto a lo que la persona marcó mientras ardía, con su sentido. */
function VelaArdiendo({ entrada, t }: { entrada: EntradaVelas; t: T }) {
  const senales = new Set(entrada.senales ?? []);
  const colores = t.colores as Record<string, { nombre: string }>;
  const intenciones = t.intenciones as Record<string, { nombre: string }>;
  const nombres = t.senales as Record<string, string>;
  const sentidos = t.sentidos as Record<string, string>;
  return (
    <section className="tarjeta space-y-5 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.llamaTitulo}</p>
        <p className="text-sm text-texto-suave">{t.llamaNota}</p>
      </div>
      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,12rem)_1fr]">
        <DibujoVela color={TONO_COLOR[entrada.color] ?? TONO_COLOR.blanco} senales={senales} t={t} />
        <div className="space-y-4 text-sm">
          <p className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-borde px-3 py-1">
              <span className="inline-block h-3.5 w-3.5 rounded-full border border-white/20" style={{ background: TONO_COLOR[entrada.color] }} aria-hidden />
              {colores[entrada.color]?.nombre}
            </span>
            <span className="rounded-full border border-oro/40 bg-oro/10 px-3 py-1 text-oro-suave">{intenciones[entrada.intencion]?.nombre}</span>
          </p>
          {entrada.pregunta && <p className="text-texto-suave">«{entrada.pregunta}»</p>}
          {senales.size ? (
            <ul className="space-y-2">
              {[...senales].map((s) => (
                <li key={s} className="flex gap-3">
                  <span className="mt-1 text-oro" aria-hidden>✦</span>
                  <span>
                    <span className="text-texto">{nombres[s] ?? s}</span>
                    {sentidos[s] && <span className="block text-texto-suave">{sentidos[s]}</span>}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-texto-suave">{t.sinSenales}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function Ficha({ titulo, color, lineas, vacio, children }: { titulo: string; color: string; lineas: string[]; vacio: string; children?: ReactNode }) {
  const hay = lineas.length > 0 || Boolean(children);
  return (
    <div className={`rounded-xl border border-borde bg-superficie-2/60 p-4 ${hay ? "" : "opacity-60"}`}>
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-texto-suave">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
        {titulo}
      </p>
      {lineas.map((l) => (
        <p key={l} className="mt-2 text-sm text-texto">{l}</p>
      ))}
      {children}
      {!hay && <p className="mt-2 text-sm text-texto-suave">{vacio}</p>}
    </div>
  );
}

/** Las cuatro fichas de los restos: cera, hollín, mecha y figuras. */
function Restos({ anexo, t }: { anexo: AnexoVelas; t: T }) {
  const e = t.estados;
  const figuras = anexo.marcas.filter((m) => m.tipo === "figura");
  return (
    <section className="tarjeta space-y-4 p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.restosTitulo}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Ficha titulo={t.partes.cera} color={COLOR.cera} lineas={anexo.cera ? [e.cera[anexo.cera]] : []} vacio={t.sinDato} />
        <Ficha titulo={t.partes.hollin} color={COLOR.hollin} lineas={anexo.hollin ? [e.hollin[anexo.hollin]] : []} vacio={t.sinDato} />
        <Ficha titulo={t.partes.mecha} color={COLOR.mecha} lineas={anexo.mecha ? [e.mecha[anexo.mecha]] : []} vacio={t.sinDato}>
          {anexo.mecha && anexo.mecha !== "recta" && (
            <p className="mt-1 text-2xl text-oro" aria-hidden>{anexo.mecha === "derecha" ? "↗" : "↖"}</p>
          )}
        </Ficha>
        <Ficha titulo={t.partes.figura} color={COLOR.figura} lineas={[]} vacio={t.sinFiguras}>
          {figuras.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {figuras.map((f) => (
                <li key={f.nombre} className="rounded-full border border-borde px-3 py-1 text-sm text-texto first-letter:uppercase">
                  {f.nombre}
                  {f.sentido && <span className="text-texto-suave"> · {f.sentido}</span>}
                </li>
              ))}
            </ul>
          )}
        </Ficha>
      </div>
    </section>
  );
}

/** Cuánto avanza la intención (de «resiste» a «fluye») y en qué plazo se empezaría a notar. */
function Avance({ avance, plazo, color, t }: { avance: number | null; plazo: AnexoVelas["plazo"]; color: string; t: T }) {
  const nivel = avance == null ? null : avance < 35 ? "resiste" : avance < 65 ? "mixto" : "fluye";
  return (
    <section className="tarjeta grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
      {avance != null && nivel && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.avanceTitulo}</p>
          <div className="relative h-3 rounded-full bg-gradient-to-r from-violeta/50 via-white/10 to-oro/60" aria-hidden>
            <span className="tarot-barra absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg" style={{ left: `${avance}%`, background: color }} />
          </div>
          <p className="flex justify-between text-xs text-texto-suave">
            <span>{t.resiste}</span>
            <span>{t.fluye}</span>
          </p>
          <p className="text-sm text-texto">{t.niveles[nivel]}</p>
        </div>
      )}
      {plazo && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.plazoTitulo}</p>
          <div className="grid grid-cols-3 gap-2">
            {PLAZOS.map((p) => (
              <span key={p} className={`rounded-xl border px-2 py-3 text-center text-sm ${p === plazo ? "border-oro bg-oro/15 font-semibold text-oro-suave" : "border-borde text-texto-suave opacity-60"}`}>
                {t.plazos[p]}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/**
 * Lectura de los restos de una vela: la foto con las señales numeradas, el
 * texto en vivo, la vela dibujada como ardió, lo que dicen los restos y cómo
 * avanza la intención. Los restos llegan al final del texto como un anexo
 * JSON que se oculta (las lecturas anteriores no lo tienen: se ven la foto y
 * la vela dibujada).
 */
export function LecturaVelas({ id, estadoInicial, textoInicial, urlFoto, entrada }: { id: string; estadoInicial: "pendiente" | "generando" | "lista" | "error"; textoInicial: string | null; urlFoto: string | null; entrada: EntradaVelas }) {
  const { t } = useT();
  const [anexo, setAnexo] = useState<AnexoVelas | null>(() => (textoInicial ? separarRestos(textoInicial) : null));
  const [activa, setActiva] = useState<number | null>(null);
  const marcas = anexo?.marcas ?? [];
  const conRestos = anexo && (marcas.length > 0 || anexo.cera || anexo.hollin || anexo.mecha);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-2 md:sticky md:top-24 md:self-start">
          <h2 className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{marcas.length ? t.velas.marcasTitulo : t.velas.tuVela}</h2>
          {marcas.length > 0 && <p className="text-xs text-texto-suave">{t.velas.marcasNota}</p>}
          {urlFoto ? (
            <FotoAnotada<MarcaResto> urlFoto={urlFoto} alt={t.velas.tuVela} marcas={marcas} activa={activa} elegir={setActiva} color={(m) => COLOR[m.tipo]} />
          ) : (
            <p className="text-sm text-texto-suave">—</p>
          )}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarRestos(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (terminado) setAnexo(separarRestos(texto));
            }}
          />
        </section>
      </div>
      <VelaArdiendo entrada={entrada} t={t.velas} />
      {conRestos && <Restos anexo={anexo} t={t.velas} />}
      {anexo && (anexo.avance != null || anexo.plazo) && <Avance avance={anexo.avance} plazo={anexo.plazo} color={TONO_COLOR[entrada.color] ?? TONO_COLOR.blanco} t={t.velas} />}
    </div>
  );
}
