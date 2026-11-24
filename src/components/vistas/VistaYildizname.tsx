import type { Idioma } from "@/lib/i18n/idiomas";
import { SIGNOS } from "@/lib/zodiaco";
import { SIGNOS_IDIOMA } from "@/lib/juego/textos";
import { plantilla } from "@/lib/i18n/formato";
import type { ResultadoYildizname } from "@/lib/yildizname/calculo";
import { TEXTOS_YILDIZNAME } from "@/lib/yildizname/textos";

/** Resultado del yıldızname: la suma de los dos nombres, la división entre 12 y la estrella con su elemento, planeta y día. */
export function VistaYildizname({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  void entrada;
  const r = resultado as unknown as ResultadoYildizname;
  const signo = SIGNOS.find((s) => s.id === r?.signo);
  if (!signo || !r.abjad?.madre) return null;
  const t = TEXTOS_YILDIZNAME[idioma];
  const nombreSigno = idioma === "es" ? signo.nombre : (SIGNOS_IDIOMA[idioma][signo.id] ?? signo.nombre);
  const datos = [
    { etiqueta: t.elemento, valor: t.elementos[signo.elemento as keyof typeof t.elementos] },
    { etiqueta: t.planeta, valor: t.planetas[r.planeta] },
    { etiqueta: t.dia, valor: t.dias[r.dia] },
  ];
  return (
    <section className="tarjeta fondo-arabesco space-y-6 p-5 text-center sm:p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.tuEstrella}</p>
        <p className="brillo-oro font-display text-7xl leading-tight text-oro-suave" aria-hidden>{signo.simbolo}</p>
        <p className="font-display text-3xl font-semibold text-texto">{nombreSigno}</p>
      </div>
      <div className="space-y-1 rounded-2xl border border-oro/30 bg-oro/5 p-4">
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.suma}</p>
        <p className="font-display text-2xl text-oro-suave" dir="ltr">
          {r.abjad.persona.total} + {r.abjad.madre.total} = <span className="font-semibold">{r.total}</span>
        </p>
        <p className="text-sm text-texto-suave" dir="ltr">{plantilla(t.division, { total: r.total, c: r.cociente, r: r.resto })}</p>
        {r.resto === 0 && <p className="text-xs text-texto-suave">{t.restoCero}</p>}
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {datos.map((d) => (
          <div key={d.etiqueta} className="rounded-xl border border-borde bg-superficie-2/60 px-2 py-3">
            <dt className="text-[0.65rem] uppercase tracking-widest text-violeta-suave">{d.etiqueta}</dt>
            <dd className="mt-1 font-display text-lg text-texto">{d.valor}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
