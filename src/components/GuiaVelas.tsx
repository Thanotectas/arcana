"use client";

import { useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { INTENCIONES, FICHA_INTENCION, TONO_COLOR, type Intencion } from "@/lib/velas";
import type { FaseClave } from "@/lib/astro/lunaciones";

/**
 * Guía gratuita: la persona elige una intención y ve el color de vela, por
 * qué, cómo prepararla, qué día y en qué fase lunar (con la próxima fecha).
 */
export function GuiaVelas({ proximas }: { proximas: Record<FaseClave, string> }) {
  const { t } = useT();
  const [intencion, setIntencion] = useState<Intencion>("amor");
  const ficha = FICHA_INTENCION[intencion];
  const intenciones = t.velas.intenciones as Record<Intencion, { nombre: string; porque: string }>;
  const colores = t.velas.colores as Record<string, { nombre: string; significado: string }>;
  const fases = t.luna.fases as Record<FaseClave, { nombre: string }>;
  const dias = t.velas.dias as unknown as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.velas.eligeIntencion}>
        {INTENCIONES.map((i) => {
          const activa = i === intencion;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={activa}
              onClick={() => setIntencion(i)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${activa ? "border-oro/70 bg-oro/15 text-oro-suave" : "border-borde text-texto-suave hover:border-oro/40 hover:text-texto"}`}
            >
              <span className="inline-block h-3 w-3 rounded-full border border-white/20" style={{ background: TONO_COLOR[FICHA_INTENCION[i].color] }} aria-hidden />
              {intenciones[i].nombre}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-borde bg-white/5 p-5 text-center">
          <div className="relative h-32 w-12 rounded-md shadow-[0_0_40px_rgba(241,217,154,0.25)]" style={{ background: TONO_COLOR[ficha.color] }} aria-hidden>
            <span className="absolute -top-5 left-1/2 h-7 w-4 -translate-x-1/2 rounded-full bg-gradient-to-t from-oro to-white opacity-90 blur-[1px]" />
          </div>
          <p className="font-display text-2xl text-oro-suave">{colores[ficha.color].nombre}</p>
          <p className="text-xs text-texto-suave">{plantilla(t.velas.oBien, { color: colores[ficha.alterno].nombre })}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-texto">{intenciones[intencion].porque}</p>
          <p className="text-texto-suave">{colores[ficha.color].significado}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <p className="rounded-xl border border-borde p-3">
              <span className="block text-[11px] uppercase tracking-widest text-violeta-suave">{t.velas.mejorDia}</span>
              {dias[ficha.dia]}
            </p>
            <p className="rounded-xl border border-borde p-3">
              <span className="block text-[11px] uppercase tracking-widest text-violeta-suave">{t.velas.mejorLuna}</span>
              {fases[ficha.fase].nombre} · {proximas[ficha.fase]}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-2xl">{t.velas.pasosTitulo}</h3>
        <ol className="mt-2 space-y-2 text-sm text-texto-suave">
          {(t.velas.pasos as unknown as string[]).map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-display text-xl text-oro-suave">{i + 1}</span>
              <span className="pt-1">{p}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-texto-suave">{t.velas.seguridad}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {Object.entries(colores).map(([id, c]) => (
          <div key={id} className="flex items-start gap-3 rounded-xl border border-borde p-3 text-xs">
            <span className="mt-0.5 inline-block h-4 w-4 shrink-0 rounded-full border border-white/20" style={{ background: TONO_COLOR[id as keyof typeof TONO_COLOR] }} aria-hidden />
            <span><strong className="text-texto">{c.nombre}</strong> <span className="text-texto-suave">{c.significado}</span></span>
          </div>
        ))}
      </div>

      <p className="text-sm text-texto-suave">
        {t.velas.lunaNota} <Link href="/luna" className="text-oro-suave underline">{t.nav.luna}</Link>
      </p>
    </div>
  );
}
