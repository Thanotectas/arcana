"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { accionCompatibilidad, type EstadoAccion } from "@/lib/lecturas/acciones";
import { SIGNOS, compatibilidadSignos, imagenSigno, signoPorFecha, signoPorId, type Signo } from "@/lib/zodiaco";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

const COLOR_ELEMENTO: Record<string, string> = { fuego: "#ff8a5b", tierra: "#9ad07f", aire: "#8fc7ff", agua: "#b28dff" };

/**
 * Compatibilidad en vivo: dos ruedas zodiacales para elegir los signos (o
 * fechas que los deducen) y un medidor de afinidad que se actualiza al instante.
 */
export function CompatibilidadInteractiva({ nombreInicial }: { nombreInicial: string }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionCompatibilidad, {});
  const [a, setA] = useState<Persona>({ nombre: nombreInicial, fecha: "", signo: "" });
  const [b, setB] = useState<Persona>({ nombre: "", fecha: "", signo: "" });

  const signoA = resolver(a);
  const signoB = resolver(b);
  const puntaje = useMemo(() => (signoA && signoB ? compatibilidadSignos(signoA, signoB) : null), [signoA, signoB]);
  const sinCreditos = estado.error === "SIN_CREDITOS";

  const nivel =
    puntaje === null ? "" : puntaje >= 90 ? t.compatibilidad.niveles.muyAlta : puntaje >= 75 ? t.compatibilidad.niveles.alta : puntaje >= 60 ? t.compatibilidad.niveles.media : t.compatibilidad.niveles.baja;
  const nota = (() => {
    if (!signoA || !signoB) return "";
    const ia = SIGNOS.indexOf(signoA);
    const ib = SIGNOS.indexOf(signoB);
    if (Math.abs(ia - ib) === 6) return t.compatibilidad.opuestos;
    if (signoA.elemento === signoB.elemento) return t.compatibilidad.mismoElemento;
    const amigos = (signoA.elemento === "fuego" && signoB.elemento === "aire") || (signoA.elemento === "aire" && signoB.elemento === "fuego") || (signoA.elemento === "tierra" && signoB.elemento === "agua") || (signoA.elemento === "agua" && signoB.elemento === "tierra");
    return amigos ? t.compatibilidad.elementosAmigos : t.compatibilidad.elementosTension;
  })();

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <PanelPersona sufijo="a" titulo={t.compatibilidad.tu} persona={a} setPersona={setA} signo={signoA} />
        <PanelPersona sufijo="b" titulo={t.compatibilidad.otraPersona} persona={b} setPersona={setB} signo={signoB} />
      </div>

      <div className="tarjeta flex flex-col items-center gap-3 p-6 text-center">
        <div className="flex items-center gap-6">
          <MonedaSigno signo={signoA} />
          <Medidor valor={puntaje ?? 0} activo={puntaje !== null} etiqueta={t.compatibilidad.afinidad} />
          <MonedaSigno signo={signoB} />
        </div>
        {puntaje !== null && (
          <div className="aparecer" key={`${signoA?.id}-${signoB?.id}`}>
            <p className="font-display text-2xl text-oro-suave">{nivel}</p>
            <p className="text-sm text-texto-suave">{nota}</p>
          </div>
        )}
      </div>

      <BotonEnviar cargando={t.comun.unMomento}>{t.compatibilidad.analizar}</BotonEnviar>
    </form>
  );
}

interface Persona {
  nombre: string;
  fecha: string;
  signo: string;
}

function resolver(p: Persona): Signo | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(p.fecha)) {
    const [, m, d] = p.fecha.split("-").map(Number);
    return signoPorFecha(m, d);
  }
  return p.signo ? signoPorId(p.signo) : undefined;
}

function PanelPersona({
  sufijo,
  titulo,
  persona,
  setPersona,
  signo,
}: {
  sufijo: "a" | "b";
  titulo: string;
  persona: Persona;
  setPersona: (p: Persona) => void;
  signo?: Signo;
}) {
  const { t } = useT();
  return (
    <fieldset className="space-y-3 rounded-xl border border-borde p-4">
      <legend className="px-2 font-display text-xl">{titulo}</legend>
      <input type="hidden" name={`signo_${sufijo}`} value={persona.signo} />
      <div>
        <label className="etiqueta" htmlFor={`nombre_${sufijo}`}>{t.compatibilidad.nombre}</label>
        <input id={`nombre_${sufijo}`} name={`nombre_${sufijo}`} className="campo" value={persona.nombre} onChange={(e) => setPersona({ ...persona, nombre: e.target.value })} />
      </div>
      <div>
        <label className="etiqueta" htmlFor={`fecha_${sufijo}`}>{t.compatibilidad.fecha}</label>
        <input id={`fecha_${sufijo}`} name={`fecha_${sufijo}`} type="date" className="campo" value={persona.fecha} onChange={(e) => setPersona({ ...persona, fecha: e.target.value, signo: "" })} />
      </div>
      <p className="text-xs text-texto-suave">{t.compatibilidad.oSigno}</p>
      <RuedaSignos seleccionado={signo?.id} alElegir={(id) => setPersona({ ...persona, signo: id, fecha: "" })} />
    </fieldset>
  );
}

/** Rueda de 12 signos en SVG; tocar un signo lo selecciona. */
function RuedaSignos({ seleccionado, alElegir }: { seleccionado?: string; alElegir: (id: string) => void }) {
  const S = 220;
  const c = S / 2;
  const r = 84;
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-[220px]" role="radiogroup">
      <circle cx={c} cy={c} r={r + 22} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
      {SIGNOS.map((s, i) => {
        const ang = ((i * 30 - 90) * Math.PI) / 180;
        const x = c + r * Math.cos(ang);
        const y = c + r * Math.sin(ang);
        const activo = s.id === seleccionado;
        return (
          <g
            key={s.id}
            role="radio"
            aria-checked={activo}
            aria-label={s.nombre}
            tabIndex={0}
            className="cursor-pointer outline-none"
            onClick={() => alElegir(s.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && alElegir(s.id)}
          >
            {activo && <circle cx={x} cy={y} r={21} fill={COLOR_ELEMENTO[s.elemento]} fillOpacity={0.25} stroke={COLOR_ELEMENTO[s.elemento]} strokeOpacity={0.7} />}
            <image href={imagenSigno(s.id)} x={x - (activo ? 18 : 13)} y={y - (activo ? 18 : 13)} width={activo ? 36 : 26} height={activo ? 36 : 26} className={activo ? "animal-oro-vivo" : "animal-oro"} style={{ transition: "all .3s" }} />
          </g>
        );
      })}
      {seleccionado && (
        <text x={c} y={c} textAnchor="middle" dominantBaseline="central" fontSize={14} fill="#f1d99a" className="font-display">
          {signoPorId(seleccionado)?.nombre}
        </text>
      )}
    </svg>
  );
}

/** Arco de afinidad 0-100 con animación de trazo. */
function Medidor({ valor, activo, etiqueta }: { valor: number; activo: boolean; etiqueta: string }) {
  const r = 44;
  const largo = Math.PI * r; // semicírculo
  const progreso = activo ? (valor / 100) * largo : 0;
  const color = valor >= 75 ? "#7fd6a4" : valor >= 60 ? "#d9b45a" : "#ff9f6b";
  return (
    <div className="relative h-[70px] w-[120px]">
      <svg viewBox="0 0 120 70" className="h-full w-full">
        <path d="M 16 62 A 44 44 0 0 1 104 62" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
        <path
          d="M 16 62 A 44 44 0 0 1 104 62"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progreso} ${largo}`}
          style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.2,0.8,0.2,1), stroke 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="font-display text-3xl text-oro-suave">{activo ? `${valor}%` : "—"}</span>
        <span className="block text-[10px] uppercase tracking-widest text-texto-suave">{etiqueta}</span>
      </div>
    </div>
  );
}

function MonedaSigno({ signo }: { signo: Signo | null | undefined }) {
  if (!signo) return <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20 text-2xl text-texto-suave">?</span>;
  // eslint-disable-next-line @next/next/no-img-element -- moneda estática pequeña
  return <img src={imagenSigno(signo.id)} alt={signo.nombre} width={64} height={64} className="moneda-signo" />;
}
