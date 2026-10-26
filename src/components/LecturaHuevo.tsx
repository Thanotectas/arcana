"use client";

import { useState } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { FotoAnotada } from "./FotoAnotada";
import { SENALES_HUEVO, separarSenales, type AnexoHuevo, type MarcaHuevo, type SenalHuevo } from "@/lib/oraculos/huevo";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

type T = Diccionario["huevo"];

const COLOR: Record<SenalHuevo, string> = { yema: "#f2b134", burbujas: "#8fc7ff", hilos: "#c9d6f2", clara: "#b9a8e8", manchas: "#ff8a5b", figura: "#f1d99a" };
/** Altura de la yema en el dibujo según dónde quedó. */
const ALTURA_YEMA = { fondo: 222, sube: 168, flota: 100 };
const BURBUJAS: [number, number, number][] = [[70, 200, 4], [128, 192, 5], [86, 154, 3], [118, 134, 4], [100, 112, 3], [76, 122, 3.5], [134, 160, 3]];
const MANCHAS: [number, number][] = [[66, 178], [134, 214], [114, 92], [84, 234], [124, 120]];

/**
 * El vaso dibujado de lado: el agua (clara o turbia), la yema a la altura en
 * que quedó y solo las señales que aparecieron en la foto, animadas.
 */
function DibujoVaso({ vistas, yema, turbia, t }: { vistas: Set<SenalHuevo>; yema: keyof typeof ALTURA_YEMA; turbia: boolean; t: T }) {
  const y = ALTURA_YEMA[yema];
  return (
    <svg viewBox="0 0 200 260" className="mx-auto w-full max-w-[14rem]" role="img" aria-label={t.vasoTitulo}>
      <defs>
        <clipPath id="huevo-vaso">
          <path d="M 38 18 L 162 18 L 148.5 238 Q 147.5 248 137 248 L 63 248 Q 52.5 248 51.5 238 Z" />
        </clipPath>
        <linearGradient id="huevo-agua" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={turbia ? "#b9a8e8" : "#8fc7ff"} stopOpacity={turbia ? 0.28 : 0.14} />
          <stop offset="1" stopColor={turbia ? "#8a7bb0" : "#8fc7ff"} stopOpacity={turbia ? 0.42 : 0.26} />
        </linearGradient>
        <radialGradient id="huevo-yema" cx="0.4" cy="0.35">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.6" stopColor="#f2b134" />
          <stop offset="1" stopColor="#d9861a" />
        </radialGradient>
        <filter id="huevo-difuso" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      <g clipPath="url(#huevo-vaso)">
        <rect x="0" y="58" width="200" height="200" fill="url(#huevo-agua)" />
        {vistas.has("clara") && (
          <g filter="url(#huevo-difuso)" className="huevo-nube">
            <ellipse cx="96" cy="128" rx="40" ry="22" fill="#ece6fb" fillOpacity="0.35" />
            <ellipse cx="118" cy="168" rx="30" ry="18" fill="#ece6fb" fillOpacity="0.28" />
          </g>
        )}
        {/* La clara alrededor de la yema */}
        <path d={`M ${62} ${y + 8} Q ${70} ${y - 16} ${100} ${y - 14} Q ${134} ${y - 16} ${140} ${y + 6} Q ${132} ${y + 22} ${100} ${y + 20} Q ${68} ${y + 22} ${62} ${y + 8} Z`} fill="#ffffff" fillOpacity="0.16" stroke="#ffffff" strokeOpacity="0.25" />
        {vistas.has("hilos") &&
          [
            `M 92 ${y - 14} C 84 ${y - 44} 98 ${y - 70} 88 ${Math.max(64, y - 104)}`,
            `M 104 ${y - 16} C 112 ${y - 50} 100 ${y - 80} 110 ${Math.max(62, y - 118)}`,
            `M 116 ${y - 12} C 126 ${y - 36} 120 ${y - 58} 130 ${Math.max(66, y - 86)}`,
          ].map((d, i) => (
            <path key={i} d={d} fill="none" stroke={COLOR.hilos} strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" pathLength={1} className="huevo-hilo" style={{ animationDelay: `${0.4 + i * 0.3}s` }} />
          ))}
        {vistas.has("burbujas") &&
          BURBUJAS.map(([cx, cy, r], i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={COLOR.burbujas} strokeWidth="1.2" className="huevo-burbuja" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        {vistas.has("manchas") && MANCHAS.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="2.4" fill={COLOR.manchas} fillOpacity="0.85" className="aparecer" style={{ animationDelay: `${0.6 + i * 0.15}s` }} />)}
        {vistas.has("figura") && (
          <g className="aparecer" style={{ animationDelay: "1s" }} stroke={COLOR.figura} fill="none" strokeWidth="1.4">
            <path d="M 118 92 Q 132 80 146 92 Q 132 104 118 92 Z" />
            <circle cx="132" cy="92" r="3.5" fill={COLOR.figura} />
          </g>
        )}
        <circle cx="100" cy={y} r="16" fill="url(#huevo-yema)" className={yema === "fondo" ? undefined : "huevo-flota"} />
        <ellipse cx="95" cy={y - 6} rx="5" ry="3" fill="#fff" fillOpacity="0.45" />
      </g>
      {/* Superficie del agua y el vaso */}
      <ellipse cx="100" cy="58" rx="60" ry="4" fill="none" stroke="#c9d6f2" strokeOpacity="0.5" />
      <path d="M 38 18 L 162 18 L 148.5 238 Q 147.5 248 137 248 L 63 248 Q 52.5 248 51.5 238 Z" fill="none" stroke="#c9d6f2" strokeOpacity="0.7" strokeWidth="2" />
      <ellipse cx="100" cy="18" rx="62" ry="5" fill="none" stroke="#c9d6f2" strokeOpacity="0.7" strokeWidth="1.5" />
      <path d="M 48 36 L 58 220" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** El vaso dibujado junto a la lista de las seis señales: cuáles aparecieron y qué dicen. */
function VasoHuevo({ anexo, t }: { anexo: AnexoHuevo; t: T }) {
  const cuantas = (s: SenalHuevo) => anexo.marcas.filter((m) => m.tipo === s).length;
  const turbia = anexo.agua === "turbia";
  const vistas = new Set<SenalHuevo>(SENALES_HUEVO.filter((s) => cuantas(s) > 0 || (s === "clara" && turbia) || (s === "yema" && anexo.yema)));
  return (
    <section className="tarjeta space-y-5 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.vasoTitulo}</p>
        <p className="text-sm text-texto-suave">{t.vasoNota}</p>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,14rem)_1fr]">
        <DibujoVaso vistas={vistas} yema={anexo.yema ?? "fondo"} turbia={turbia} t={t} />
        <div className="space-y-4 text-sm">
          {(anexo.yema || anexo.agua) && (
            <div className="space-y-1 rounded-xl border border-borde bg-superficie-2/60 p-4">
              {anexo.yema && <p className="text-texto">{t.yema[anexo.yema]}</p>}
              {anexo.agua && <p className="text-texto">{t.agua[anexo.agua]}</p>}
            </div>
          )}
          <ul className="space-y-2.5">
            {SENALES_HUEVO.map((s) => {
              const n = cuantas(s);
              const vista = vistas.has(s);
              return (
                <li key={s} className={`flex gap-3 ${vista ? "" : "opacity-50"}`}>
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLOR[s] }} aria-hidden />
                  <span className="min-w-0">
                    <span className="text-texto">{t.tipos[s].nombre}</span>
                    <span className={vista ? "text-oro-suave" : "text-texto-suave"}> · {vista ? (n > 1 ? plantilla(t.vistas, { n }) : t.vista) : t.noVista}</span>
                    <span className="block text-texto-suave">{t.tipos[s].sentido}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Cuánto soltó la limpia, en una barra de «poco» a «mucho», con su lectura. */
function Soltado({ soltado, t }: { soltado: number; t: T }) {
  const nivel = soltado < 34 ? "poco" : soltado < 67 ? "medio" : "mucho";
  return (
    <section className="tarjeta space-y-3 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.soltadoTitulo}</p>
        <p className="text-sm text-texto-suave">{t.soltadoNota}</p>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-white/5" aria-hidden>
        <div className="tarot-barra h-full rounded-full bg-gradient-to-r from-[#8fc7ff] via-violeta-suave to-oro" style={{ width: `${Math.max(soltado, 4)}%` }} />
      </div>
      <p className="flex justify-between text-xs text-texto-suave">
        <span>{t.poco}</span>
        <span className="font-semibold text-oro-suave">{soltado}%</span>
        <span>{t.mucho}</span>
      </p>
      <p className="text-sm text-texto">{t.niveles[nivel]}</p>
    </section>
  );
}

/** Los tres gestos para cerrar la limpia. */
function Cierre({ t }: { t: T }) {
  return (
    <section className="tarjeta space-y-3 p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.cierreTitulo}</p>
      <ol className="space-y-2 text-sm">
        {t.cierre.map((paso, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-oro/50 text-xs font-bold tabular-nums text-oro">{i + 1}</span>
            <span className="text-texto">{paso}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * Lectura de la limpia con huevo: la foto del vaso con las señales numeradas,
 * el texto en vivo, el vaso dibujado con lo que apareció, cuánto soltó la
 * limpia y cómo cerrarla. Las señales llegan al final del texto como un anexo
 * JSON que se oculta (las lecturas anteriores no lo tienen: se ven la foto y
 * el cierre).
 */
export function LecturaHuevo({ id, estadoInicial, textoInicial, urlFoto }: { id: string; estadoInicial: "pendiente" | "generando" | "lista" | "error"; textoInicial: string | null; urlFoto: string | null }) {
  const { t } = useT();
  const [anexo, setAnexo] = useState<AnexoHuevo | null>(() => (textoInicial ? separarSenales(textoInicial) : null));
  const [lista, setLista] = useState(estadoInicial === "lista");
  const [activa, setActiva] = useState<number | null>(null);
  const marcas = anexo?.marcas ?? [];
  const conDibujo = anexo && (marcas.length > 0 || anexo.yema || anexo.agua);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-2 md:sticky md:top-24 md:self-start">
          <h2 className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{marcas.length ? t.huevo.marcasTitulo : t.huevo.tuFoto}</h2>
          {marcas.length > 0 && <p className="text-xs text-texto-suave">{t.huevo.marcasNota}</p>}
          {urlFoto ? (
            <FotoAnotada<MarcaHuevo> urlFoto={urlFoto} alt={t.huevo.tuFoto} marcas={marcas} activa={activa} elegir={setActiva} color={(m) => COLOR[m.tipo]} />
          ) : (
            <p className="text-sm text-texto-suave">—</p>
          )}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarSenales(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (!terminado) return;
              setAnexo(separarSenales(texto));
              setLista(true);
            }}
          />
        </section>
      </div>
      {conDibujo && <VasoHuevo anexo={anexo} t={t.huevo} />}
      {lista && (
        <div className="grid gap-6 sm:grid-cols-2">
          {anexo?.soltado != null && <Soltado soltado={anexo.soltado} t={t.huevo} />}
          <Cierre t={t.huevo} />
        </div>
      )}
    </div>
  );
}
