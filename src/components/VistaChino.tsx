import type { Diccionario } from "@/lib/i18n/diccionarios";
import { FICHA, type Animal, type ResultadoChino } from "@/lib/chino";
import { CicloElementos, LeyendaRueda, PilarChino, RuedaAnimales } from "./GraficosChino";

/** Resultado guardado del calendario chino: pilar, rueda con afinidades y los cinco elementos. */
export function VistaChino({ resultado: r, t }: { resultado: ResultadoChino; t: Diccionario }) {
  return (
    <section className="space-y-4">
      <div className="tarjeta space-y-5 p-5 sm:p-6">
        <PilarChino r={r} t={t.chino} />
        <div className="grid items-center gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <RuedaAnimales r={r} t={t.chino} className="mx-auto block w-full max-w-[400px]" />
          <div className="space-y-4">
            <p className="text-sm">
              <span className="text-xs uppercase tracking-widest text-violeta-suave">{t.chino.rasgos}</span>
              <span className="mt-1 block text-oro-suave">{(t.chino.rasgosAnimal as Record<Animal, string>)[r.pilar.animal]}</span>
              <span className="mt-1 block text-texto-suave">{t.chino.horasAnimal}: {FICHA[r.pilar.animal].horas}</span>
            </p>
            <LeyendaRueda r={r} t={t.chino} />
          </div>
        </div>
      </div>
      <div className="tarjeta p-5">
        <CicloElementos r={r} t={t.chino} />
      </div>
    </section>
  );
}
