import type { Idioma } from "@/lib/i18n/idiomas";
import { ELEMENTOS, type Elemento, type PersonaAbjad, type ResultadoAbjad } from "@/lib/abjad/calculo";
import { TEXTOS_ABJAD, type TextosAbjad } from "@/lib/abjad/textos";

const COLOR_ELEMENTO: Record<Elemento, string> = {
  fuego: "#f28c28",
  aire: "#b7a5ff",
  agua: "#3b82f6",
  tierra: "#7fd6a4",
};

function Persona({ p, t, principal }: { p: PersonaAbjad; t: TextosAbjad; principal: boolean }) {
  const maximo = Math.max(1, ...ELEMENTOS.map((e) => p.elementos[e]));
  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{principal ? t.tuNombre : t.madreTitulo}</p>
          {p.nombre && <p className="font-display text-xl text-texto">{p.nombre}</p>}
          <p lang="ar" dir="rtl" className="font-display text-5xl leading-tight text-oro-suave">{p.escritura}</p>
          {p.transcrita && <p className="mt-1 text-xs text-texto-suave">{t.transcritaNota}</p>}
        </div>
        <div className="flex shrink-0 gap-3">
          <div className="rounded-2xl border border-oro/40 bg-oro/5 px-5 py-3 text-center">
            <p className="text-[0.65rem] uppercase tracking-widest text-violeta-suave">{t.valor}</p>
            <p className="font-display text-4xl font-semibold text-oro-suave">{p.total}</p>
          </div>
          <div className="rounded-2xl border border-violeta/40 bg-violeta/10 px-5 py-3 text-center">
            <p className="text-[0.65rem] uppercase tracking-widest text-violeta-suave">{t.raiz}</p>
            <p className="font-display text-4xl font-semibold text-texto">{p.raiz}</p>
            <p className="text-[0.7rem] text-texto-suave">{t.raices[p.raiz - 1] ?? ""}</p>
          </div>
        </div>
      </div>

      {p.reduccion.length > 1 && (
        <p className="text-center text-sm text-texto-suave sm:text-start" dir="ltr">
          {p.reduccion.join(" → ")}
        </p>
      )}

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{t.letras}</p>
        {/* Las letras van de derecha a izquierda, como se escribe el nombre en árabe. */}
        <ol dir="rtl" className="flex flex-wrap gap-2">
          {p.letras.map((l, i) => (
            <li key={i} className="flex w-16 flex-col items-center rounded-xl border border-borde bg-superficie-2/60 px-1 py-2" style={{ borderTopColor: COLOR_ELEMENTO[l.elemento], borderTopWidth: 3 }}>
              <span lang="ar" className="font-display text-3xl leading-none text-texto">{l.escrita}</span>
              {l.escrita !== l.base && <span lang="ar" className="text-[0.65rem] text-texto-suave">= {l.base}</span>}
              <span className="mt-1 text-sm font-semibold text-oro-suave">{l.valor}</span>
              <span className="text-[0.6rem] uppercase tracking-wider" style={{ color: COLOR_ELEMENTO[l.elemento] }}>{t.elemento[l.elemento]}</span>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{t.elementos}</p>
        <div className="space-y-1.5">
          {ELEMENTOS.map((e) => {
            const n = p.elementos[e];
            const dominante = p.dominantes.includes(e);
            return (
              <div key={e} className="flex items-center gap-3 text-sm">
                <span className={`w-20 shrink-0 ${dominante ? "font-semibold text-texto" : "text-texto-suave"}`}>{t.elemento[e]}</span>
                <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-superficie-2">
                  <span className="block h-full rounded-full" style={{ width: `${(n / maximo) * 100}%`, backgroundColor: COLOR_ELEMENTO[e], opacity: dominante ? 1 : 0.55 }} />
                </span>
                <span className="w-6 text-end tabular-nums text-texto">{n}</span>
                <span className="w-20 text-[0.65rem] uppercase tracking-widest text-oro-suave">{dominante ? t.dominante : ""}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Resultado guardado de la numerología abjad: el nombre en árabe, letra por letra, la raíz y los elementos. */
export function VistaAbjad({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  void entrada;
  const r = resultado as unknown as ResultadoAbjad;
  if (!r?.persona?.letras) return null;
  const t = TEXTOS_ABJAD[idioma];
  return (
    <section className="space-y-4">
      <div className="tarjeta p-5 sm:p-6">
        <Persona p={r.persona} t={t} principal />
      </div>
      {r.madre && (
        <div className="tarjeta space-y-5 p-5 sm:p-6">
          <Persona p={r.madre} t={t} principal={false} />
          {r.conMadre && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-oro/30 bg-oro/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.conMadre}</p>
                <p className="text-xs text-texto-suave">{t.conMadreNota}</p>
              </div>
              <p className="font-display text-3xl text-oro-suave" dir="ltr">
                {r.persona.total} + {r.madre.total} = <span className="font-semibold">{r.conMadre.total}</span>
                <span className="ms-3 text-lg text-texto-suave">({r.conMadre.reduccion.join(" → ")})</span>
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
