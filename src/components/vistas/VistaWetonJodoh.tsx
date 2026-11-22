import type { Idioma } from "@/lib/i18n/idiomas";
import { jodohDeGuardado, NOMBRE_JODOH, ORDEN_JODOH } from "@/lib/weton/calculo";
import { textosWeton } from "@/lib/weton/textos";
import { FichaWeton } from "./VistaWeton";

function nombreDe(x: unknown): string | undefined {
  const n = (x as Record<string, unknown> | undefined)?.nombre;
  return typeof n === "string" ? n : undefined;
}

/** Resultado guardado del weton jodoh: los dos weton, la suma de neptu y su lugar en el ciclo de 8. */
export function VistaWetonJodoh({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  const j = jodohDeGuardado(resultado);
  if (!j) return null;
  const t = textosWeton(idioma);
  const nombreA = nombreDe(entrada.a) ?? t.persona1;
  const nombreB = nombreDe(entrada.b) ?? t.persona2;
  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="tarjeta p-5">
          <FichaWeton r={j.a} t={t} nombre={nombreA} idioma={idioma} compacta />
        </div>
        <div className="tarjeta p-5">
          <FichaWeton r={j.b} t={t} nombre={nombreB} idioma={idioma} compacta />
        </div>
      </div>

      <div className="tarjeta fondo-batik space-y-5 p-5 text-center sm:p-6">
        <div className="flex flex-wrap items-center justify-center gap-3 font-display text-3xl font-semibold" dir="ltr">
          <span className="rounded-xl border border-borde px-3 py-1">{j.a.neptu}</span>
          <span className="text-texto-suave">+</span>
          <span className="rounded-xl border border-borde px-3 py-1">{j.b.neptu}</span>
          <span className="text-texto-suave">=</span>
          <span className="rounded-xl border border-oro/50 bg-oro/10 px-3 py-1 text-oro">{j.total}</span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-texto-suave">{t.sumaNeptu}</p>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.resultado}</p>
          <p className="font-display text-5xl font-semibold text-oro">{j.nombre}</p>
          <p className="mx-auto mt-2 max-w-xl text-texto">{t.jodoh[j.clave]}</p>
        </div>
      </div>

      <div className="tarjeta space-y-3 p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-texto-suave">{t.cicloJodoh}</p>
        <ol className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {ORDEN_JODOH.map((c, i) => {
            const es = c === j.clave;
            return (
              <li key={c} aria-current={es ? "true" : undefined} className={`rounded-xl border px-1 py-2 text-center ${es ? "border-oro bg-oro/20 text-oro" : "border-borde text-texto-suave"}`}>
                <span className="block text-[10px]">{(i + 1) % 8}</span>
                <span className={`block text-xs ${es ? "font-semibold" : ""}`}>{NOMBRE_JODOH[c]}</span>
              </li>
            );
          })}
        </ol>
        <p className="text-sm text-texto-suave">{t.cicloJodohNota}</p>
        <p className="rounded-xl border border-dashed border-borde px-3 py-2 text-sm text-texto-suave">{t.notaCultural}</p>
      </div>
    </section>
  );
}
