import { RuedaAstral } from "./RuedaAstral";
import { NOMBRES_CUERPO, type Cuerpo } from "@/lib/astro/efemerides";
import { NOMBRES_ASPECTO, SIMBOLOS_ASPECTO, type Aspecto } from "@/lib/astro/carta";
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

export function VistaCartaAstral({ resultado, entrada, t }: { resultado: Record<string, unknown>; entrada: Record<string, unknown>; t: Diccionario }) {
  const r = resultado as unknown as ResultadoAstral;
  const horaDesconocida = Boolean(entrada.horaDesconocida);
  const asc = signoPorLongitud(r.casas.ascendente);
  const mc = signoPorLongitud(r.casas.medioCielo);
  return (
    <section className="space-y-6">
      <div className="tarjeta p-4 sm:p-6">
        <RuedaAstral planetas={r.planetas} cuspides={r.casas.cuspides} ascendente={r.casas.ascendente} aspectos={r.aspectos} mostrarCasas={!horaDesconocida} />
        {!horaDesconocida && (
          <p className="mt-3 text-center text-sm text-texto-suave">
            {t.astral.ascendente} {asc.simbolo} {asc.nombre} {formatoGrado(r.casas.ascendente)} · {t.astral.medioCielo} {mc.simbolo} {mc.nombre} {formatoGrado(r.casas.medioCielo)} · {t.astral.casas} {r.casas.sistema}
          </p>
        )}
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
                    <td className="py-1.5">{NOMBRES_CUERPO[p.cuerpo]}</td>
                    <td className="py-1.5">{s.simbolo} {s.nombre} {formatoGrado(p.longitud)}{p.retrogrado && p.cuerpo !== "nodo_norte" ? " ℞" : ""}</td>
                    <td className="py-1.5 text-right text-texto-suave">{horaDesconocida ? "" : plantilla(t.astral.casaN, { n: p.casa })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="tarjeta p-5">
          <h2 className="font-display mb-3 text-2xl">{t.astral.aspectos}</h2>
          <ul className="space-y-1 text-sm">
            {r.aspectos.slice(0, 14).map((a, i) => (
              <li key={i} className="flex justify-between border-t border-borde py-1.5">
                <span>{NOMBRES_CUERPO[a.a]} {SIMBOLOS_ASPECTO[a.tipo]} {NOMBRES_CUERPO[a.b]}</span>
                <span className="text-texto-suave">{NOMBRES_ASPECTO[a.tipo]} · {a.orbe}°</span>
              </li>
            ))}
          </ul>
          <h3 className="font-display mb-2 mt-5 text-xl">{t.astral.elementos}</h3>
          <div className="grid grid-cols-4 gap-2 text-center text-sm">
            {Object.entries(r.elementos).map(([k, v]) => (
              <div key={k} className="rounded-lg bg-superficie-2 p-2">
                <p className="text-lg font-semibold text-oro-suave">{v}</p>
                <p className="text-xs capitalize text-texto-suave">{t.horoscopo.elementos[k as keyof typeof t.horoscopo.elementos] ?? k}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
