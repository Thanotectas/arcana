"use client";

import { useState } from "react";
import { plantilla } from "@/lib/i18n/formato";
import { compatibilidadNombres, type Compatibilidad, type NumerosNombre } from "@/lib/herramientas/nombres-numerologia";
import type { TextosNombres } from "@/lib/herramientas/nombres-textos";

type TextosCliente = Omit<TextosNombres, "meta" | "comoFunciona" | "cta">;

/** Dos nombres → sus números pitagóricos y un porcentaje de afinidad (se calcula en el navegador, sin guardar nada). */
export function CompatibilidadNombres({ textos }: { textos: TextosCliente }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Compatibilidad | null>(null);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const r = compatibilidadNombres(a, b);
    if (!r) {
      setError(textos.errorVacio);
      return;
    }
    setError(null);
    setResultado(r);
  }

  if (resultado) {
    const nivel = textos.niveles[resultado.nivel];
    const { familiaA, familiaB } = resultado;
    const porQue = familiaA === familiaB ? textos.misma[familiaA] : textos.mezcla[[familiaA, familiaB].sort().join("") as "ab" | "ac" | "bc"];
    return (
      <div className="space-y-6" aria-live="polite">
        <div className="aparecer text-center">
          <p className="font-display text-2xl">{plantilla(textos.pareja, { a: resultado.a.original, b: resultado.b.original })}</p>
          <Medidor porcentaje={resultado.porcentaje} />
          <p className="font-display text-3xl text-oro-suave">{nivel.titulo}</p>
          <p className="mx-auto mt-2 max-w-lg text-texto-suave">{nivel.texto}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FichaNombre n={resultado.a} textos={textos} retraso={150} />
          <FichaNombre n={resultado.b} textos={textos} retraso={300} />
        </div>
        <section className="tarjeta aparecer p-5" style={{ animationDelay: "450ms" }}>
          <h3 className="font-display text-xl">{textos.porQue}</h3>
          <p className="mt-2 leading-relaxed">{porQue}</p>
          <p className="mt-3 text-xs text-texto-suave">{textos.aviso}</p>
        </section>
        <div className="text-center">
          <button type="button" className="boton boton-secundario" onClick={() => setResultado(null)}>
            {textos.otraVez}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="etiqueta" htmlFor="nombre-a">{textos.nombre1}</label>
          <input id="nombre-a" className="campo" value={a} maxLength={60} autoComplete="off" placeholder={textos.placeholder1} onChange={(e) => setA(e.target.value)} required />
        </div>
        <div>
          <label className="etiqueta" htmlFor="nombre-b">{textos.nombre2}</label>
          <input id="nombre-b" className="campo" value={b} maxLength={60} autoComplete="off" placeholder={textos.placeholder2} onChange={(e) => setB(e.target.value)} required />
        </div>
      </div>
      {error && <p className="text-sm text-peligro" role="alert">{error}</p>}
      <div className="text-center">
        <button type="submit" className="boton boton-primario">{textos.calcular}</button>
      </div>
    </form>
  );
}

function Medidor({ porcentaje }: { porcentaje: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative mx-auto my-4 h-36 w-36" dir="ltr">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(139,108,246,0.2)" strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--oro)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - porcentaje / 100)} style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <p className="absolute inset-0 flex items-center justify-center font-display text-4xl font-semibold">{porcentaje}%</p>
    </div>
  );
}

function FichaNombre({ n, textos, retraso }: { n: NumerosNombre; textos: TextosCliente; retraso: number }) {
  const vocales = n.letras.filter((l) => l.vocal);
  return (
    <article className="tarjeta aparecer p-5" style={{ animationDelay: `${retraso}ms` }}>
      <p className="font-display text-2xl">{n.original}</p>
      {n.transliterado && <p className="text-xs text-texto-suave">{plantilla(textos.transliterado, { latino: n.transliterado })}</p>}
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-4xl text-oro-suave">{n.expresion}</span>
        <span>
          <span className="block text-sm font-semibold">{textos.numeroNombre} · {textos.arquetipos[n.expresion]}</span>
          <span className="block text-xs text-texto-suave">{textos.explicaNombre}</span>
        </span>
      </div>
      <p className="mt-1 break-words text-xs text-texto-suave" dir="ltr">
        {n.letras.map((l) => `${l.letra}${l.valor}`).join(" + ")} = {n.suma}
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-4xl text-violeta-suave">{n.alma}</span>
        <span>
          <span className="block text-sm font-semibold">{textos.numeroAlma} · {textos.arquetipos[n.alma]}</span>
          <span className="block text-xs text-texto-suave">{n.almaSinVocales ? textos.sinVocales : textos.explicaAlma}</span>
        </span>
      </div>
      {!n.almaSinVocales && (
        <p className="mt-1 text-xs text-texto-suave" dir="ltr">
          {vocales.map((l) => `${l.letra}${l.valor}`).join(" + ")} = {n.sumaVocales}
        </p>
      )}
      {n.aproximado && <p className="mt-2 text-xs italic text-texto-suave">{textos.aproximado}</p>}
    </article>
  );
}
