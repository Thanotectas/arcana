import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { DATOS_PALO, nombreCartaIskambil } from "@/lib/iskambil/mazo";
import { analizarIskambil, leerResultadoIskambil } from "@/lib/iskambil/tirada";
import { TEXTOS_ISKAMBIL } from "@/lib/iskambil/textos";
import { CartaIskambil } from "@/components/iskambil/CartaIskambil";

/** Las cartas de un iskambil falı en sus posiciones, con el palo dominante y la carta del deseo si salió. */
export function VistaIskambil({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  const r = leerResultadoIskambil(resultado);
  if (!r) return null;
  const textos = TEXTOS_ISKAMBIL[idioma];
  const tirada = textos.tiradas[r.tirada];
  const pregunta = typeof entrada.pregunta === "string" ? entrada.pregunta : "";
  const a = analizarIskambil(r.cartas.map((c) => c.id));

  return (
    <section className="tarjeta space-y-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{textos.vista.titulo} · {tirada.nombre}</p>
        {pregunta && (
          <p className="mt-2 text-sm text-texto-suave">
            <span className="text-oro-suave">{textos.vista.tuPregunta}:</span> {pregunta}
          </p>
        )}
      </div>
      <ol className="flex flex-wrap items-start justify-center gap-4 sm:gap-6">
        {r.cartas.map((c) => {
          const nombre = nombreCartaIskambil(c.id, idioma);
          const posicion = tirada.posiciones[c.posicion] ?? "";
          return (
            <li key={c.posicion} className="flex w-[clamp(84px,24vw,128px)] flex-col items-center gap-1.5 text-center">
              <CartaIskambil id={c.id} alt={`${posicion}: ${nombre}`} />
              <span className="text-[11px] uppercase tracking-widest text-violeta-suave">{posicion}</span>
              <span className="text-xs font-semibold sm:text-sm">{nombre}</span>
            </li>
          );
        })}
      </ol>
      {(a.dominante || a.dilek) && (
        <p className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-center text-sm text-oro-suave">
          {a.dominante && <span>{plantilla(textos.vista.dominante, { palo: DATOS_PALO[a.dominante].nombre[idioma] })}</span>}
          {a.dilek && <span>✦ {textos.vista.dilek}</span>}
        </p>
      )}
    </section>
  );
}
