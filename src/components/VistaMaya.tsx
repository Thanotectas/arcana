import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import type { ResultadoMaya } from "@/lib/oraculos/maya";
import { CruzOraculo, EncabezadoKin, MatrizTzolkin } from "./GraficosMaya";

/** Resultado guardado del calendario maya: el kin, la cruz del oráculo y la matriz del Tzolkin. */
export function VistaMaya({ resultado: r, t, idioma }: { resultado: ResultadoMaya; t: Diccionario; idioma: Idioma }) {
  return (
    <section className="space-y-4">
      <div className="tarjeta grid gap-6 p-5 sm:p-6 md:grid-cols-2 md:items-center">
        <EncabezadoKin r={r} t={t.maya} idioma={idioma} />
        <CruzOraculo r={r} t={t.maya} idioma={idioma} />
      </div>
      <div className="tarjeta p-5 sm:p-6">
        <MatrizTzolkin r={r} t={t.maya} idioma={idioma} />
      </div>
    </section>
  );
}
