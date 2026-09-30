"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { accionNumerologia, type EstadoAccion } from "@/lib/lecturas/acciones";
import { calcularPerfil, SIGNIFICADO_NUMERO } from "@/lib/numerologia";
import { letrasConValor, pasoFecha, pasoSuma } from "@/lib/numerologia-detalle";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { textoErrorLectura } from "@/lib/i18n/errores";

/**
 * Numerología en vivo: los números aparecen mientras la persona escribe, con
 * el cálculo desplegable letra por letra. El botón envía la lectura de IA.
 */
export function NumerologiaInteractiva({ nombreInicial, fechaInicial }: { nombreInicial: string; fechaInicial: string }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionNumerologia, {});
  const [nombre, setNombre] = useState(nombreInicial);
  const [fecha, setFecha] = useState(fechaInicial);
  const [verCalculo, setVerCalculo] = useState(false);

  const letras = useMemo(() => letrasConValor(nombre), [nombre]);
  const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const perfil = useMemo(
    () => (nombre.trim().length >= 3 && fechaValida ? calcularPerfil(nombre, new Date(fecha + "T12:00:00Z")) : null),
    [nombre, fecha, fechaValida],
  );
  const pasos = useMemo(() => (fechaValida ? pasoFecha(fecha) : null), [fecha, fechaValida]);
  const sumaTodas = pasoSuma(letras.map((l) => l.valor));
  const sumaVocales = pasoSuma(letras.filter((l) => l.vocal).map((l) => l.valor));
  const sumaConsonantes = pasoSuma(letras.filter((l) => !l.vocal).map((l) => l.valor));

  const claves = ["caminoDeVida", "expresion", "almaOImpulso", "personalidad", "cumpleanos", "anioPersonal"] as const;
  const sinCreditos = estado.error === "SIN_CREDITOS";

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="etiqueta" htmlFor="nombre">{t.numerologia.nombre}</label>
          <input id="nombre" name="nombre" className="campo" required minLength={3} value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="etiqueta" htmlFor="fecha">{t.numerologia.fecha}</label>
          <input id="fecha" name="fecha" type="date" className="campo" required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </div>
      </div>

      {letras.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label={t.numerologia.letras}>
          {letras.map((l, i) => (
            <span
              key={`${l.letra}-${i}`}
              className={`aparecer flex h-9 w-8 flex-col items-center justify-center rounded-md border text-xs ${l.vocal ? "border-violeta/50 bg-violeta/15 text-violeta-suave" : "border-oro/30 bg-oro/5 text-oro-suave"}`}
              style={{ animationDelay: `${Math.min(i, 30) * 25}ms` }}
            >
              <span className="font-display text-sm uppercase leading-none">{l.letra}</span>
              <span className="leading-none">{l.valor}</span>
            </span>
          ))}
        </div>
      )}

      {perfil ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {claves.map((k, i) => (
            <div key={k} className="tarjeta aparecer p-4 text-center" style={{ animationDelay: `${i * 80}ms` }}>
              <p key={perfil[k]} className="numero-brota font-display text-5xl text-oro-suave">{perfil[k]}</p>
              <p className="mt-1 text-sm font-medium">{t.numerologia.numeros[k]}</p>
              <p className="text-xs text-texto-suave">{SIGNIFICADO_NUMERO[perfil[k]]?.titulo}</p>
              {[11, 22, 33].includes(perfil[k]) && <p className="mt-1 text-[10px] uppercase tracking-widest text-violeta-suave">{t.numerologia.maestro}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-borde p-6 text-center text-sm text-texto-suave">{t.numerologia.escribeParaVer}</p>
      )}

      {perfil && (
        <div>
          <button type="button" className="text-sm text-violeta-suave underline-offset-4 hover:underline" onClick={() => setVerCalculo((v) => !v)} aria-expanded={verCalculo}>
            {verCalculo ? t.numerologia.ocultarCalculo : t.numerologia.verCalculo}
          </button>
          {verCalculo && pasos && (
            <dl className="aparecer mt-3 grid gap-2 rounded-xl border border-borde bg-superficie-2/60 p-4 text-sm sm:grid-cols-2">
              <Paso titulo={t.numerologia.numeros.caminoDeVida} detalle={`${pasos.dia.reducido} + ${pasos.mes.reducido} + ${pasos.anio.reducido} = ${pasos.camino.total} → ${pasos.camino.reducido}`} nota={t.numerologia.explicaciones.caminoDeVida} />
              <Paso titulo={t.numerologia.numeros.expresion} detalle={`${t.numerologia.suma} ${sumaTodas.total} → ${sumaTodas.reducido}`} nota={t.numerologia.explicaciones.expresion} />
              <Paso titulo={t.numerologia.numeros.almaOImpulso} detalle={`${t.numerologia.vocales}: ${sumaVocales.total} → ${sumaVocales.reducido}`} nota={t.numerologia.explicaciones.almaOImpulso} />
              <Paso titulo={t.numerologia.numeros.personalidad} detalle={`${t.numerologia.consonantes}: ${sumaConsonantes.total} → ${sumaConsonantes.reducido}`} nota={t.numerologia.explicaciones.personalidad} />
              <Paso titulo={t.numerologia.numeros.cumpleanos} detalle={`${pasos.dia.total} → ${pasos.dia.reducido}`} nota={t.numerologia.explicaciones.cumpleanos} />
              <Paso titulo={t.numerologia.numeros.anioPersonal} detalle={`${pasos.dia.reducido} + ${pasos.mes.reducido} + ${new Date().getFullYear()} → ${perfil.anioPersonal}`} nota={t.numerologia.explicaciones.anioPersonal} />
            </dl>
          )}
        </div>
      )}

      <BotonEnviar cargando={t.comun.unMomento}>{t.numerologia.calcular}</BotonEnviar>
    </form>
  );
}

function Paso({ titulo, detalle, nota }: { titulo: string; detalle: string; nota: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-violeta-suave">{titulo}</dt>
      <dd className="font-medium text-oro-suave">{detalle}</dd>
      <dd className="text-xs text-texto-suave">{nota}</dd>
    </div>
  );
}
