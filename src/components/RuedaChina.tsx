"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { accionChino, type EstadoAccion } from "@/lib/lecturas/acciones";
import { ANIMALES, FICHA, COLOR_ELEMENTO, CARACTER_ELEMENTO, calcularChino, type Animal, type ElementoChino, type PilarAnio } from "@/lib/chino";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";
import { plantilla } from "@/lib/i18n/formato";

/**
 * Rueda de los doce animales: al escribir la fecha, el animal del año se
 * ilumina con su elemento; con la hora aparece el "animal secreto".
 */
export function RuedaChina({ nombreInicial, fechaInicial, horaInicial }: { nombreInicial: string; fechaInicial: string; horaInicial: string | null | undefined }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionChino, {});
  const [nombre, setNombre] = useState(nombreInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial ?? "");
  const [sinHora, setSinHora] = useState(horaInicial === null);

  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha) && Number(fecha.slice(0, 4)) >= 1900;
  const r = useMemo(() => (fechaValida ? calcularChino(fecha, !sinHora && /^\d{2}:\d{2}$/.test(hora) ? hora : null) : null), [fecha, hora, sinHora, fechaValida]);
  const animal = r?.pilar.animal ?? null;
  const nombres = t.chino.animales as Record<Animal, string>;
  const elementos = t.chino.elementos as Record<ElementoChino, string>;
  const pilar = (p: PilarAnio) => plantilla(t.chino.pilar, { animal: nombres[p.animal], elemento: elementos[p.elemento] });
  const sinCreditos = estado.error === "SIN_CREDITOS";

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="etiqueta" htmlFor="nombre">{t.chino.nombre}</label>
          <input id="nombre" name="nombre" className="campo" required value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="given-name" />
        </div>
        <div className="sm:col-span-2">
          <label className="etiqueta" htmlFor="fecha">{t.chino.fecha}</label>
          <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
        <div>
          <label className="etiqueta" htmlFor="hora">{t.chino.hora}</label>
          <input id="hora" name="hora" type="time" className="campo" disabled={sinHora} value={hora} onChange={(e) => setHora(e.target.value)} />
          <label className="mt-2 flex items-center gap-2 text-xs text-texto-suave">
            <input type="checkbox" name="hora_desconocida" checked={sinHora} onChange={(e) => setSinHora(e.target.checked)} />
            {t.chino.sinHora}
          </label>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label={t.chino.rueda}>
          <circle cx="200" cy="200" r="190" fill="rgba(255,255,255,0.02)" stroke="rgba(217,180,90,0.45)" />
          <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(255,255,255,0.1)" />
          {ANIMALES.map((a, i) => {
            const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x = 200 + Math.cos(ang) * 155;
            const y = 200 + Math.sin(ang) * 155;
            const activo = a === animal;
            const secreto = r?.animalHora === a && !activo;
            const color = activo && r ? COLOR_ELEMENTO[r.pilar.elemento] : secreto ? "#b7a5ff" : "rgba(236,230,247,0.55)";
            return (
              <g key={a} style={{ transition: "all .4s" }}>
                {activo && <circle cx={x} cy={y} r="30" fill={color} opacity="0.18" />}
                {secreto && <circle cx={x} cy={y} r="24" fill="none" stroke="#b7a5ff" strokeDasharray="3 3" />}
                <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle" fontSize={activo ? 34 : 24} fill={color} style={{ transition: "all .4s" }}>
                  {FICHA[a].caracter}
                </text>
                <text x={x} y={y + 30} textAnchor="middle" fontSize="10" fill="rgba(168,159,192,0.9)">{nombres[a]}</text>
              </g>
            );
          })}
          {r ? (
            <g>
              <text x="200" y="178" textAnchor="middle" fontSize="54" fill={COLOR_ELEMENTO[r.pilar.elemento]}>{FICHA[r.pilar.animal].caracter}</text>
              <text x="200" y="212" textAnchor="middle" fontSize="20" fill="#f1d99a" fontFamily="var(--font-cormorant)">{pilar(r.pilar)}</text>
              <text x="200" y="236" textAnchor="middle" fontSize="12" fill="rgba(168,159,192,0.9)">
                {CARACTER_ELEMENTO[r.pilar.elemento]} {elementos[r.pilar.elemento]} · {r.pilar.polaridad} · {r.pilar.anio}
              </text>
            </g>
          ) : (
            <text x="200" y="205" textAnchor="middle" fontSize="13" fill="rgba(168,159,192,0.9)">{t.chino.escribeFecha}</text>
          )}
        </svg>
      </div>

      {r && (
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="tarjeta p-4">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.chino.rasgos}</p>
            <p className="mt-1 text-oro-suave">{(t.chino.rasgosAnimal as Record<Animal, string>)[r.pilar.animal]}</p>
            <p className="mt-2 text-texto-suave">{t.chino.horasAnimal}: {FICHA[r.pilar.animal].horas}</p>
          </div>
          <div className="tarjeta p-4">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.chino.afinidades}</p>
            <p className="mt-1">{t.chino.trino}: {r.companeros.map((a) => nombres[a]).join(" · ")}</p>
            <p>{t.chino.amigo}: {nombres[r.amigo]}</p>
            <p>{t.chino.choque}: {nombres[r.choque]}</p>
            {r.animalHora && <p className="mt-2 text-violeta-suave">{t.chino.animalSecreto}: {nombres[r.animalHora]}</p>}
          </div>
          <p className="text-texto-suave sm:col-span-2">
            {t.chino.anioActual}: <strong className="text-oro-suave">{r.anioActual.anio}, {pilar(r.anioActual)}</strong> · {(t.chino.relaciones as Record<string, string>)[r.relacionAnioActual]}
          </p>
        </div>
      )}

      <BotonEnviar className="boton boton-primario w-full" cargando={t.chino.leyendo}>{t.chino.interpretar}</BotonEnviar>
    </form>
  );
}
