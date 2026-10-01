"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, Lock, Sparkles } from "lucide-react";
import { accionCruce, type EstadoAccion } from "@/lib/lecturas/acciones";
import type { Disponibilidad, Sistema } from "@/lib/cruce";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { plantilla } from "@/lib/i18n/formato";

const RUTA: Record<Sistema, string> = { carta_astral: "/carta-astral", numerologia: "/numerologia", chino: "/calendario-chino", tarot: "/tarot", iching: "/iching", quiromancia: "/quiromancia" };
const ICONO: Record<Sistema, string> = { carta_astral: "☉", numerologia: "#", chino: "龙", tarot: "✦", iching: "☰", quiromancia: "✋" };

/** Elige exactamente dos sistemas; cada tarjeta dice de dónde saldrán sus datos. */
export function CruceSelector({ disponibilidad, costo, fechas }: { disponibilidad: Disponibilidad[]; costo: number; fechas: Record<string, string> }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionCruce, {});
  const [elegidos, setElegidos] = useState<Sistema[]>([]);
  const nombres = t.cruce.sistemas as Record<Sistema, string>;
  const sinCreditos = estado.error === "SIN_CREDITOS";

  function alternar(s: Sistema) {
    setElegidos((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : prev.length < 2 ? [...prev, s] : [prev[1], s]));
  }

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}
      {elegidos.map((s) => (
        <input key={s} type="hidden" name="sistema" value={s} />
      ))}

      <div className="grid gap-3 sm:grid-cols-2">
        {disponibilidad.map((d) => {
          const activo = elegidos.includes(d.sistema);
          const bloqueado = d.origen === null;
          const nota =
            d.origen === "datos" ? t.cruce.desdeDatos
            : d.origen === "lectura" ? plantilla(t.cruce.desdeLectura, { fecha: fechas[d.lecturaId ?? ""] ?? "" })
            : t.cruce.noDisponible;
          return (
            <button
              key={d.sistema}
              type="button"
              disabled={bloqueado}
              onClick={() => alternar(d.sistema)}
              aria-pressed={activo}
              className={`tarjeta flex items-start gap-3 p-4 text-left transition ${activo ? "border-oro/60 bg-oro/5 shadow-[0_0_30px_rgba(217,180,90,0.12)]" : bloqueado ? "opacity-50" : "hover:border-violeta/50"}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg ${activo ? "border-oro bg-oro text-noche" : "border-borde text-oro"}`}>
                {activo ? <Check className="h-5 w-5" aria-hidden /> : bloqueado ? <Lock className="h-4 w-4" aria-hidden /> : ICONO[d.sistema]}
              </span>
              <span>
                <span className="block font-medium">{nombres[d.sistema]}</span>
                <span className="block text-xs text-texto-suave">{nota}</span>
                {bloqueado && (
                  <Link href={RUTA[d.sistema]} className="mt-1 block text-xs text-violeta-suave underline" onClick={(e) => e.stopPropagation()}>
                    {t.cruce.hacerPrimero}
                  </Link>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {elegidos.length === 2 && (
        <p className="flex items-center gap-2 text-sm text-oro-suave aparecer">
          <Sparkles className="h-4 w-4" aria-hidden /> {plantilla(t.cruce.elegidos, { a: nombres[elegidos[0]], b: nombres[elegidos[1]] })}
        </p>
      )}

      <div>
        <label className="etiqueta" htmlFor="pregunta">{t.cruce.pregunta}</label>
        <input id="pregunta" name="pregunta" className="campo" maxLength={300} placeholder={t.cruce.ejemplo} />
      </div>

      <BotonEnviar className="boton boton-primario w-full" cargando={t.cruce.leyendo}>
        {elegidos.length === 2 ? plantilla(t.cruce.cruzar, { n: costo }) : t.cruce.eligeDos}
      </BotonEnviar>
    </form>
  );
}
