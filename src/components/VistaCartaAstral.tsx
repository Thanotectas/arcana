import { RuedaAstral } from "./RuedaAstral";
import { Aspectario, FigurasCarta, HemisferiosCarta, LeyendaAspectos, TemperamentoCarta, TrioEsencial, nombres } from "./CartaDetalle";
import type { Cuerpo } from "@/lib/astro/efemerides";
import { SIMBOLOS_ASPECTO, type Aspecto } from "@/lib/astro/carta";
import { figurasCarta, hemisferios, temperamento } from "@/lib/astro/figuras";
import type { Casas } from "@/lib/astro/casas";
import { signoPorId, signoPorLongitud, formatoGrado } from "@/lib/zodiaco";
import { plantilla } from "@/lib/i18n/formato";
import type { Diccionario } from "@/lib/i18n/diccionarios";

export interface ResultadoAstral {
  planetas: { cuerpo: Cuerpo; longitud: number; retrogrado: boolean; casa: number; signo: string }[];
  casas: Casas;
  aspectos: Aspecto[];
  elementos: Record<string, number>;
  modalidades: Record<string, number>;
}

/**
 * La carta natal completa: la rueda interactiva, el trío esencial (Sol, Luna
 * y Ascendente con el regente), las posiciones, el temperamento, las figuras
 * de aspectos, los hemisferios y el aspectario. Todo sale del resultado
 * guardado, así que también sirve para las cartas calculadas antes.
 */
export function VistaCartaAstral({ resultado, entrada, t }: { resultado: Record<string, unknown>; entrada: Record<string, unknown>; t: Diccionario }) {
  const r = resultado as unknown as ResultadoAstral;
  const horaDesconocida = Boolean(entrada.horaDesconocida);
  const n = nombres(t);
  const asc = signoPorLongitud(r.casas.ascendente);
  const mc = signoPorLongitud(r.casas.medioCielo);
  const tm = temperamento(r.planetas);
  const figuras = figurasCarta(r.planetas, r.aspectos, !horaDesconocida);
  const nombresAspecto = t.astral.aspectosNombres as Record<string, string>;
  return (
    <section className="space-y-6">
      <div className="tarjeta p-4 sm:p-6">
        <RuedaAstral planetas={r.planetas} cuspides={r.casas.cuspides} ascendente={r.casas.ascendente} aspectos={r.aspectos} mostrarCasas={!horaDesconocida} />
        {!horaDesconocida && (
          <p className="mt-3 text-center text-sm text-texto-suave">
            {t.astral.ascendente} {`${asc.simbolo}︎`} {n.signo(asc.id)} {formatoGrado(r.casas.ascendente)} · {t.astral.medioCielo} {`${mc.simbolo}︎`} {n.signo(mc.id)} {formatoGrado(r.casas.medioCielo)} · {t.astral.casas} {r.casas.sistema}
          </p>
        )}
      </div>

      <div className="tarjeta space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-2xl">{t.astral.trioTitulo}</h2>
          <p className="text-xs text-texto-suave">{t.astral.trioNota}</p>
        </div>
        <TrioEsencial planetas={r.planetas} ascendente={r.casas.ascendente} horaDesconocida={horaDesconocida} t={t} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.astral.posiciones}</h2>
          <table className="w-full text-sm">
            <tbody>
              {r.planetas.map((p) => {
                const s = signoPorId(p.signo)!;
                return (
                  <tr key={p.cuerpo} className="border-t border-borde">
                    <td className="py-1.5">{n.cuerpo(p.cuerpo)}</td>
                    <td className="py-1.5">{`${s.simbolo}︎`} {n.signo(s.id)} {formatoGrado(p.longitud)}{p.retrogrado && p.cuerpo !== "nodo_norte" ? " ℞" : ""}</td>
                    <td className="py-1.5 text-right text-texto-suave">{horaDesconocida ? "" : plantilla(t.astral.casaN, { n: p.casa })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tarjeta space-y-3 p-5">
          <div>
            <h2 className="font-display text-2xl">{t.astral.temperamentoTitulo}</h2>
            <p className="text-xs text-texto-suave">{t.astral.temperamentoNota}</p>
          </div>
          <TemperamentoCarta tm={tm} t={t} />
        </div>
      </div>

      <div className="tarjeta space-y-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-2xl">{t.astral.figurasTitulo}</h2>
          <p className="text-xs text-texto-suave">{t.astral.figurasNota}</p>
        </div>
        <FigurasCarta figuras={figuras} planetas={r.planetas} ascendente={r.casas.ascendente} t={t} />
      </div>

      <div className={`grid gap-6 ${horaDesconocida ? "" : "md:grid-cols-2"}`}>
        {!horaDesconocida && (
          <div className="tarjeta space-y-3 p-5">
            <div>
              <h2 className="font-display text-2xl">{t.astral.hemisferiosTitulo}</h2>
              <p className="text-xs text-texto-suave">{t.astral.hemisferiosNota}</p>
            </div>
            <HemisferiosCarta h={hemisferios(r.planetas)} planetas={r.planetas} ascendente={r.casas.ascendente} t={t} />
          </div>
        )}
        <div className="tarjeta space-y-3 p-5">
          <div>
            <h2 className="font-display text-2xl">{t.astral.aspectarioTitulo}</h2>
            <p className="text-xs text-texto-suave">{t.astral.aspectarioNota}</p>
          </div>
          <Aspectario planetas={r.planetas} aspectos={r.aspectos} t={t} />
          <LeyendaAspectos t={t} />
          <ul className="space-y-1 text-sm">
            {[...r.aspectos]
              .sort((a, b) => a.orbe - b.orbe)
              .slice(0, 5)
              .map((a, i) => (
                <li key={i} className="flex justify-between gap-2 border-t border-borde py-1.5">
                  <span>{n.cuerpo(a.a)} {`${SIMBOLOS_ASPECTO[a.tipo]}︎`} {n.cuerpo(a.b)}</span>
                  <span className="text-texto-suave">{nombresAspecto[a.tipo]} · {a.orbe}°</span>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
