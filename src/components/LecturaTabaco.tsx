"use client";

import { useState } from "react";
import { LecturaEnVivo } from "./LecturaEnVivo";
import { FotoAnotada } from "./FotoAnotada";
import { separarTabaco, type AnexoTabaco, type MarcaTabaco, type ParteTabaco, type Veredicto } from "@/lib/tabaco/senales";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

type T = Diccionario["tabaco"];

const COLOR: Record<ParteTabaco, string> = { ceniza: "#e8e4dc", quema: "#ff8a5b", capa: "#d9b45a", punta: "#8fc7ff", humo: "#c9d6f2" };
const COLOR_CENIZA = { blanca: "#ece8df", gris: "#a7a29a", negra: "#55504b" };
const LARGO_CENIZA = { larga: 112, media: 64, cayo: 10 };
const COLOR_VEREDICTO: Record<Veredicto, string> = { abierto: "#9be0b0", esfuerzo: "#f2b134", espera: "#8fc7ff" };
const VEREDICTOS: Veredicto[] = ["abierto", "esfuerzo", "espera"];
/** Dónde se dibujan las marcas de la capa (ojos o grietas). */
const OJOS: [number, number][] = [[118, 64], [158, 80], [196, 66]];

/**
 * El tabaco dibujado de lado: la capa con su anillo y sus marcas, la brasa
 * (recta o en canoa), la ceniza con su color y su largo, y el humo si se vio.
 */
function DibujoTabaco({ anexo, marcasCapa, punta, t }: { anexo: AnexoTabaco; marcasCapa: number; punta: boolean; t: T }) {
  const B = 232;
  const canoa = anexo.quema === "canoa";
  const arriba = canoa ? B + 14 : B;
  const abajo = canoa ? B - 12 : B;
  const largo = LARGO_CENIZA[anexo.largo ?? "media"];
  const ceniza = COLOR_CENIZA[anexo.ceniza ?? "gris"];
  const apagada = anexo.quema === "apagada";
  const fin = Math.max(arriba, abajo) + largo;
  return (
    <svg viewBox="0 0 400 150" className="mx-auto w-full max-w-xl" role="img" aria-label={t.dibujoTitulo}>
      <defs>
        <linearGradient id="tabaco-capa" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a34" />
          <stop offset="0.45" stopColor="#6b4226" />
          <stop offset="1" stopColor="#3f2614" />
        </linearGradient>
        <linearGradient id="tabaco-anillo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1d99a" />
          <stop offset="1" stopColor="#b8892e" />
        </linearGradient>
        <filter id="tabaco-difuso" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {/* Humo */}
      {anexo.humo === "claro" && (
        <g fill="none" stroke={COLOR.humo} strokeLinecap="round" strokeOpacity="0.7">
          <path d={`M ${fin - 4} 58 C ${fin - 16} 40 ${fin + 6} 28 ${fin - 8} 6`} strokeWidth="2.2" className="tabaco-humo" />
          <path d={`M ${fin + 2} 62 C ${fin + 14} 44 ${fin - 4} 26 ${fin + 10} 4`} strokeWidth="1.5" className="tabaco-humo" style={{ animationDelay: "1.2s" }} />
        </g>
      )}
      {anexo.humo === "espeso" && (
        <g filter="url(#tabaco-difuso)" className="huevo-nube">
          <path d={`M ${fin - 40} 52 C ${fin - 10} 30 ${fin + 10} 54 ${Math.min(396, fin + 40)} 34`} fill="none" stroke="#a8a2b8" strokeWidth="14" strokeOpacity="0.45" strokeLinecap="round" />
        </g>
      )}
      {/* La capa, con el pie redondeado a la izquierda */}
      <path d={`M ${arriba} 52 L 44 52 A 20 20 0 0 0 44 92 L ${abajo} 92 Z`} fill="url(#tabaco-capa)" />
      <g fill="none" stroke="#2a170a" strokeOpacity="0.35" strokeWidth="1">
        <path d="M 40 60 C 90 56 140 66 210 58" />
        <path d="M 52 84 C 110 90 160 78 220 86" />
        <path d="M 100 52 C 112 66 104 80 118 92" />
      </g>
      <rect x="72" y="52" width="24" height="40" fill="url(#tabaco-anillo)" />
      <circle cx="84" cy="72" r="5" fill="#6b4226" stroke="#f1d99a" strokeWidth="1" />
      {OJOS.slice(0, marcasCapa).map(([cx, cy], i) => (
        <g key={i} className="aparecer" style={{ animationDelay: `${0.5 + i * 0.2}s` }}>
          <ellipse cx={cx} cy={cy} rx="7" ry="3" fill="#1e1008" stroke={COLOR.capa} strokeWidth="1" />
        </g>
      ))}
      {/* La ceniza */}
      <path d={`M ${arriba} 53 L ${arriba + largo} 55 Q ${arriba + largo + 9} 72 ${abajo + largo} 89 L ${abajo} 91 Z`} fill={ceniza} className="tabaco-ceniza" />
      {Array.from({ length: Math.floor(largo / 14) }, (_, i) => {
        const d = 10 + i * 14;
        return <line key={i} x1={arriba + d} y1="55" x2={abajo + d} y2="89" stroke="#2a2420" strokeOpacity="0.18" />;
      })}
      {anexo.ceniza === "negra" &&
        largo > 20 &&
        [[0.3, 64], [0.55, 78], [0.75, 66], [0.45, 70]].map(([f, cy], i) => <circle key={i} cx={Math.min(arriba, abajo) + largo * f} cy={cy} r="2" fill="#1a1512" />)}
      {anexo.largo === "cayo" && (
        <g transform={`rotate(-8 ${B + 57} 131)`} opacity="0.85">
          <rect x={B + 40} y="124" width="34" height="14" rx="6" fill={ceniza} />
          {anexo.ceniza === "negra" && [[B + 48, 129], [B + 60, 133], [B + 66, 128]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="1.8" fill="#1a1512" />)}
        </g>
      )}
      {punta && <path d={`M ${fin + 2} 64 Q ${fin + 10} 72 ${fin + 2} 80`} fill="none" stroke={COLOR.punta} strokeWidth="2.5" strokeLinecap="round" className="aparecer" style={{ animationDelay: "1.1s" }} />}
      {/* La brasa */}
      <line x1={arriba} y1="52" x2={abajo} y2="92" stroke={apagada ? "#6b6560" : "#ff7a3d"} strokeWidth="5" strokeLinecap="round" className={apagada ? undefined : "tabaco-brasa"} />
      {anexo.quema === "rapida" &&
        [[10, 46], [22, 40], [4, 36]].map(([dx, cy], i) => <circle key={i} cx={arriba + dx} cy={cy} r="1.8" fill="#ffb36b" className="huevo-burbuja" style={{ animationDelay: `${i * 0.4}s` }} />)}
    </svg>
  );
}

/** Ficha de una parte del tabaco: qué se vio y qué dice; apagada si la foto no lo muestra. */
function Ficha({ titulo, color, lineas, t }: { titulo: string; color: string; lineas: string[]; t: T }) {
  return (
    <div className={`rounded-xl border border-borde bg-superficie-2/60 p-4 ${lineas.length ? "" : "opacity-60"}`}>
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-texto-suave">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} aria-hidden />
        {titulo}
      </p>
      {lineas.length ? (
        <ul className="mt-2 space-y-1 text-sm text-texto">
          {lineas.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-texto-suave">{t.sinDato}</p>
      )}
    </div>
  );
}

/** El tabaco dibujado y las cuatro fichas: ceniza, quema, capa y humo. */
function TabacoPartes({ anexo, t }: { anexo: AnexoTabaco; t: T }) {
  const marcasCapa = anexo.marcas.filter((m) => m.tipo === "capa").length;
  const punta = anexo.marcas.some((m) => m.tipo === "punta");
  const e = t.estados;
  const capa = [marcasCapa === 0 ? t.capaLimpia : marcasCapa === 1 ? t.capaMarca : plantilla(t.capaMarcas, { n: marcasCapa }), ...(punta ? [t.puntaAbierta] : [])];
  return (
    <section className="tarjeta space-y-5 p-5 sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.dibujoTitulo}</p>
        <p className="text-sm text-texto-suave">{t.dibujoNota}</p>
      </div>
      <DibujoTabaco anexo={anexo} marcasCapa={marcasCapa} punta={punta} t={t} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Ficha titulo={t.partes.ceniza} color={anexo.ceniza ? COLOR_CENIZA[anexo.ceniza] : COLOR.ceniza} lineas={[...(anexo.ceniza ? [e.ceniza[anexo.ceniza]] : []), ...(anexo.largo ? [e.largo[anexo.largo]] : [])]} t={t} />
        <Ficha titulo={t.partes.quema} color={COLOR.quema} lineas={anexo.quema ? [e.quema[anexo.quema]] : []} t={t} />
        <Ficha titulo={t.partes.capa} color={COLOR.capa} lineas={capa} t={t} />
        <Ficha titulo={t.partes.humo} color={COLOR.humo} lineas={anexo.humo && anexo.humo !== "noSeVe" ? [e.humo[anexo.humo]] : []} t={t} />
      </div>
    </section>
  );
}

/** Lo que dice el tabaco en conjunto, en tres pasos: abierto, con esfuerzo o todavía no. */
function VeredictoTabaco({ veredicto, t }: { veredicto: Veredicto; t: T }) {
  return (
    <section className="tarjeta space-y-4 p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.veredictoTitulo}</p>
      <div className="grid grid-cols-3 gap-2" aria-hidden>
        {VEREDICTOS.map((v) => (
          <div key={v} className="space-y-1.5 text-center">
            <div className={`h-2 rounded-full transition ${v === veredicto ? "tarot-barra" : "opacity-20"}`} style={{ background: COLOR_VEREDICTO[v] }} />
            <p className={`text-xs ${v === veredicto ? "font-semibold" : "text-texto-suave"}`} style={{ color: v === veredicto ? COLOR_VEREDICTO[v] : undefined }}>
              {t.veredictos[v].nombre}
            </p>
          </div>
        ))}
      </div>
      <div>
        <p className="font-display text-2xl" style={{ color: COLOR_VEREDICTO[veredicto] }}>{t.veredictos[veredicto].nombre}</p>
        <p className="text-sm text-texto">{t.veredictos[veredicto].texto}</p>
      </div>
    </section>
  );
}

/**
 * Lectura del tabaco: la foto con las señales numeradas, el texto en vivo, el
 * tabaco dibujado parte por parte y lo que dice en conjunto. Las señales
 * llegan al final del texto como un anexo JSON que se oculta (las lecturas
 * anteriores no lo tienen: se ve solo la foto).
 */
export function LecturaTabaco({ id, estadoInicial, textoInicial, urlFoto }: { id: string; estadoInicial: "pendiente" | "generando" | "lista" | "error"; textoInicial: string | null; urlFoto: string | null }) {
  const { t } = useT();
  const [anexo, setAnexo] = useState<AnexoTabaco | null>(() => (textoInicial ? separarTabaco(textoInicial) : null));
  const [activa, setActiva] = useState<number | null>(null);
  const marcas = anexo?.marcas ?? [];
  const conDibujo = anexo && (marcas.length > 0 || anexo.ceniza || anexo.quema);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-2 md:sticky md:top-24 md:self-start">
          <h2 className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{marcas.length ? t.tabaco.marcasTitulo : t.tabaco.tuTabaco}</h2>
          {marcas.length > 0 && <p className="text-xs text-texto-suave">{t.tabaco.marcasNota}</p>}
          {urlFoto ? (
            <FotoAnotada<MarcaTabaco> urlFoto={urlFoto} alt={t.tabaco.tuTabaco} marcas={marcas} activa={activa} elegir={setActiva} color={(m) => COLOR[m.tipo]} />
          ) : (
            <p className="text-sm text-texto-suave">—</p>
          )}
        </aside>
        <section className="tarjeta p-6 sm:p-8">
          <LecturaEnVivo
            id={id}
            estadoInicial={estadoInicial}
            textoInicial={textoInicial}
            transformar={(s) => separarTabaco(s).cuerpo.replace(/```json[\s\S]*$/, "")}
            alTexto={(texto, terminado) => {
              if (terminado) setAnexo(separarTabaco(texto));
            }}
          />
        </section>
      </div>
      {conDibujo && <TabacoPartes anexo={anexo} t={t.tabaco} />}
      {anexo?.veredicto && <VeredictoTabaco veredicto={anexo.veredicto} t={t.tabaco} />}
    </div>
  );
}
