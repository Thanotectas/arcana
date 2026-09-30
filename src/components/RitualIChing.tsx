"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { accionIChing, type EstadoAccion } from "@/lib/lecturas/acciones";
import { valorDeMonedas, esYang, esMutante, hexagramaPorLineas, type ValorLinea } from "@/lib/iching";
import { HexagramaVisual } from "./HexagramaVisual";
import { BotonEnviar } from "./BotonEnviar";
import { Aviso } from "./Aviso";
import { useT } from "@/lib/i18n/cliente";
import { plantilla } from "@/lib/i18n/formato";
import { textoErrorLectura } from "@/lib/i18n/errores";

interface Tiro {
  monedas: [boolean, boolean, boolean];
  valor: ValorLinea;
}

/**
 * Ritual del I Ching: la persona escribe su pregunta y lanza tres monedas
 * seis veces. Las monedas giran, caen, y cada resultado añade una línea al
 * hexagrama de abajo hacia arriba. Con seis líneas se envía la consulta.
 */
export function RitualIChing({ nombresHexagramas }: { nombresHexagramas: Record<string, string> }) {
  const { t } = useT();
  const [estado, enviar] = useActionState<EstadoAccion, FormData>(accionIChing, {});
  const [pregunta, setPregunta] = useState("");
  const [tiros, setTiros] = useState<Tiro[]>([]);
  const [girando, setGirando] = useState(false);
  const [monedasVista, setMonedasVista] = useState<[boolean, boolean, boolean] | null>(null);

  const completo = tiros.length === 6;
  const lineas = tiros.map((x) => (esYang(x.valor) ? 1 : 0)) as (0 | 1)[];
  const mutantes = tiros.map((x, i) => (esMutante(x.valor) ? i : -1)).filter((i) => i >= 0);
  const presente = completo ? hexagramaPorLineas(lineas) : undefined;
  const futuro =
    completo && mutantes.length
      ? hexagramaPorLineas(tiros.map((x) => (esMutante(x.valor) ? (esYang(x.valor) ? 0 : 1) : esYang(x.valor) ? 1 : 0)) as (0 | 1)[])
      : undefined;
  const sinCreditos = estado.error === "SIN_CREDITOS";

  function lanzar() {
    if (girando || completo || !pregunta.trim()) return;
    setGirando(true);
    const monedas: [boolean, boolean, boolean] = [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5];
    setMonedasVista(null);
    window.setTimeout(() => {
      setMonedasVista(monedas);
      setTiros((v) => [...v, { monedas, valor: valorDeMonedas(monedas) }]);
      setGirando(false);
    }, 1100);
  }

  function reiniciar() {
    setTiros([]);
    setMonedasVista(null);
  }

  return (
    <form action={enviar} className="space-y-6">
      {estado.error && (
        <Aviso>
          {textoErrorLectura(estado.error, t)} {sinCreditos && <Link href="/creditos" className="underline">{t.comun.comprarCreditos}</Link>}
        </Aviso>
      )}
      <input type="hidden" name="pregunta" value={pregunta} />
      <input type="hidden" name="valores" value={JSON.stringify(tiros.map((x) => x.valor))} />

      <div>
        <label className="etiqueta" htmlFor="pregunta-iching">{t.iching.tuPregunta}</label>
        <textarea
          id="pregunta-iching"
          rows={2}
          maxLength={300}
          className="campo"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          placeholder={t.iching.ejemplo}
          disabled={tiros.length > 0}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="tarjeta flex flex-col items-center gap-5 p-6">
          <div className="flex items-center gap-4" aria-live="polite">
            {[0, 1, 2].map((i) => {
              const cara = monedasVista ? monedasVista[i] : null;
              return (
                <div key={i} className={`moneda ${girando ? "girando" : ""} ${cara === false ? "cruz" : ""}`} style={{ animationDelay: `${i * 90}ms` }}>
                  <span className="moneda-cara">陽</span>
                  <span className="moneda-cruz">陰</span>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-texto-suave">
            {completo ? t.iching.listo : girando ? t.iching.lanzando : plantilla(t.iching.lineaN, { n: tiros.length + 1 })}
          </p>
          {!completo && (
            <button type="button" className="boton boton-primario" onClick={lanzar} disabled={girando || !pregunta.trim()}>
              {t.iching.lanzar}
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <HexagramaVisual lineas={lineas} mutantes={mutantes} tamano={140} animado />
          <ol className="text-center text-[11px] text-texto-suave">
            {tiros.map((x, i) => (
              <li key={i}>
                {i + 1}: {x.monedas.map((c) => (c ? t.iching.cara : t.iching.cruz)).join(" · ")} → {x.valor}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {completo && presente && (
        <div className="tarjeta aparecer space-y-2 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.iching.hexagrama} {presente.numero}</p>
          <p className="font-display text-3xl text-oro-suave">
            {nombresHexagramas[String(presente.numero)] ?? presente.nombre} <span className="text-lg text-texto-suave">{presente.chino}</span>
          </p>
          <p className="text-sm text-texto-suave">
            {mutantes.length === 0
              ? t.iching.sinMutantes
              : `${mutantes.length} ${mutantes.length === 1 ? t.iching.mutante : t.iching.mutantes}${futuro ? ` · ${t.iching.seConvierte} ${futuro.numero}. ${nombresHexagramas[String(futuro.numero)] ?? futuro.nombre}` : ""}`}
          </p>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3">
        {completo && <BotonEnviar cargando={t.comun.unMomento}>{t.iching.consultar}</BotonEnviar>}
        {tiros.length > 0 && (
          <button type="button" className="boton boton-fantasma" onClick={reiniciar}>
            {t.iching.volverEmpezar}
          </button>
        )}
      </div>
    </form>
  );
}
