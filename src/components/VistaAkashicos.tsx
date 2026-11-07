import type { Diccionario } from "@/lib/i18n/diccionarios";
import type { EntradaAkashicos, ResultadoAkashicos } from "@/lib/akashicos";

/** Resultado guardado de los registros akáshicos: la pregunta, los números del alma y la carta de los guías. */
export function VistaAkashicos({ entrada: e, resultado: r, t }: { entrada: EntradaAkashicos; resultado: ResultadoAkashicos; t: Diccionario }) {
  const a = t.akashicos;
  const temas = a.temas as Record<string, string>;
  return (
    <section className="space-y-4">
      <div className="tarjeta p-5 sm:p-6">
        <p className="text-xs uppercase tracking-widest text-violeta-suave">{temas[e.tema] ?? e.tema}</p>
        <p className="mt-1 text-xs uppercase tracking-widest text-texto-suave">{a.tuPregunta}</p>
        <p className="font-display mt-1 text-2xl italic">«{e.pregunta}»</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="tarjeta p-5 sm:p-6">
          <h2 className="font-display text-2xl">{a.numeros}</h2>
          <dl className="mt-3 grid grid-cols-2 gap-3">
            {[
              [a.camino, r.caminoDeVida],
              [a.alma, r.alma],
            ].map(([k, v]) => (
              <div key={String(k)} className="rounded-2xl bg-white/5 p-3 text-center">
                <dt className="text-xs uppercase tracking-widest text-texto-suave">{k}</dt>
                <dd className="font-display mt-1 text-4xl text-oro-suave">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="tarjeta p-5 text-center sm:w-48">
          <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{a.guias}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- carta estática */}
          <img src={`/cartas/angeles/${r.guia.id}.webp`} alt={r.guia.nombre} className="mx-auto w-32 rounded-xl border border-oro/40 shadow-lg" />
          <figcaption className="mt-2 text-sm">{r.guia.nombre}</figcaption>
        </figure>
      </div>
      <p className="text-center text-xs text-texto-suave">{a.aviso}</p>
    </section>
  );
}
