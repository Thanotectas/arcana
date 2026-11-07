import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";
import { signoPorId, imagenSigno } from "@/lib/zodiaco";
import type { PuntoKarmico, ResultadoVidasPasadas } from "@/lib/astro/vidas-pasadas";

/** Resultado guardado de «Tus vidas pasadas»: los nodos, Saturno y Plutón, los números kármicos y las tres cartas. */
export function VistaVidasPasadas({ resultado: r, t }: { resultado: ResultadoVidasPasadas; t: Diccionario }) {
  const v = t.vidasPasadas;
  const punto = (etiqueta: string, p: PuntoKarmico, destacado = false) => {
    const s = signoPorId(p.signo);
    return (
      <div className={`flex items-center gap-3 rounded-2xl p-3 ${destacado ? "bg-oro/10" : "bg-white/5"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
        <img src={imagenSigno(p.signo)} alt="" width={48} height={48} className="moneda-signo h-12 w-12" />
        <div>
          <p className="text-xs uppercase tracking-widest text-texto-suave">{etiqueta}</p>
          <p className="font-display text-xl">
            {s?.nombre ?? p.signo} {p.grado}
            {p.casa ? <span className="text-sm text-texto-suave"> · {plantilla(v.casa, { n: p.casa })}</span> : null}
          </p>
        </div>
      </div>
    );
  };
  return (
    <section className="space-y-4">
      <div className="tarjeta grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {punto(v.nodoSur, r.nodoSur, true)}
        {punto(v.nodoNorte, r.nodoNorte)}
        {punto(v.saturno, r.saturno)}
        {punto(v.pluton, r.pluton)}
      </div>
      <div className="tarjeta p-5 sm:p-6">
        <h2 className="font-display text-2xl">{v.numeros}</h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            [v.camino, String(r.caminoDeVida)],
            [v.deudas, r.deudas.join(" · ") || v.ninguna],
            [v.lecciones, r.lecciones.join(" · ") || v.ninguna],
          ].map(([k, val]) => (
            <div key={k} className="rounded-2xl bg-white/5 p-3 text-center">
              <dt className="text-xs uppercase tracking-widest text-texto-suave">{k}</dt>
              <dd className="font-display mt-1 text-3xl text-oro-suave">{val}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="tarjeta p-5 sm:p-6">
        <h2 className="font-display text-2xl">{v.cartas}</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:gap-5">
          {r.cartas.map((c) => (
            <figure key={c.id} className="text-center">
              <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{c.posicion}</p>
              {/* eslint-disable-next-line @next/next/no-img-element -- carta estática */}
              <img src={`/cartas/rider/${c.id}.webp`} alt={c.nombre} className={`mx-auto w-full max-w-[160px] rounded-xl border border-oro/40 shadow-lg ${c.invertida ? "rotate-180" : ""}`} />
              <figcaption className="mt-2 text-sm">
                {c.nombre}
                {c.invertida && <span className="block text-xs text-texto-suave">{v.invertida}</span>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-texto-suave">{v.aviso}</p>
    </section>
  );
}
