"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { accionChino, type EstadoAccion } from "@/lib/lecturas/acciones";
import { FICHA, calcularChino, type Animal } from "@/lib/chino";
import { CicloElementos, LeyendaRueda, PilarChino, RuedaAnimales } from "./GraficosChino";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

/**
 * Formulario del calendario chino con la rueda de los doce animales: al
 * escribir la fecha, el animal del año se ilumina con su elemento y se trazan
 * sus afinidades; con la hora aparece el "animal secreto".
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

      {r && <PilarChino key={`${r.pilar.anio}`} r={r} t={t.chino} />}

      <RuedaAnimales r={r} t={t.chino} className="mx-auto block w-full max-w-[440px]" />

      {r && (
        <div className="space-y-4">
          <LeyendaRueda r={r} t={t.chino} />
          <div className="tarjeta p-4 text-sm">
            <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.chino.rasgos}</p>
            <p className="mt-1 text-oro-suave">{(t.chino.rasgosAnimal as Record<Animal, string>)[r.pilar.animal]}</p>
            <p className="mt-2 text-texto-suave">{t.chino.horasAnimal}: {FICHA[r.pilar.animal].horas}</p>
          </div>
          <div className="tarjeta p-4">
            <CicloElementos r={r} t={t.chino} />
          </div>
        </div>
      )}

      <BotonEnviar className="boton boton-primario w-full" cargando={t.chino.leyendo}>{t.chino.interpretar}</BotonEnviar>
    </form>
  );
}
