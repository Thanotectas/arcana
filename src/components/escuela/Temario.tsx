import { ChevronDown } from "lucide-react";
import type { Curso } from "@/lib/escuela/tipos";
import { grado } from "@/lib/escuela/personal";

/**
 * El temario completo, visible antes de inscribirse: qué se aprende cada día, las tradiciones que recorre, el ritual
 * que se hace y la llave que se recibe. Al final, los grados del camino y lo que la persona sabrá hacer.
 */
export function Temario({ curso }: { curso: Curso }) {
  const lecciones = curso.lecciones;
  const total = lecciones.filter((l) => !l.final).length;
  const hayPrueba = lecciones.some((l) => l.final);
  const minutos = lecciones.reduce((s, l) => s + l.minutos, 0);
  const contar = (tipo: "saberes" | "tradiciones") =>
    lecciones.reduce((s, l) => s + l.bloques.reduce((t, b) => t + (b.tipo === tipo ? b.items.length : 0), 0), 0);
  const culturas = new Set(lecciones.flatMap((l) => l.bloques.flatMap((b) => (b.tipo === "tradiciones" ? b.items.map((it) => it.lugar) : []))));
  const grados = [0, 1, 3, 5, total].map((n, k) => ({ n, g: grado(n, "e", total, k === 4) }));
  const nombres = (n: number) => {
    const a = grado(n, "a", total, n === total).titulo;
    const o = grado(n, "o", total, n === total).titulo;
    return a === o ? a : `${a} / ${o}`;
  };

  return (
    <section className="space-y-8">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Temario</p>
        <h2 className="font-display text-4xl sm:text-5xl">Lo que aprenderás, noche por noche</h2>
      </div>

      <dl className="mx-auto grid max-w-3xl grid-cols-2 gap-3 text-center sm:grid-cols-4">
        {[
          [`${total}${hayPrueba ? " + 1" : ""}`, hayPrueba ? "noches de ritual y la noche del Círculo" : "lecciones con ritual guiado"],
          [`${(Math.round(minutos / 6) / 10).toLocaleString("es")} h`, "de lecciones y rituales"],
          [`${contar("saberes")}`, "saberes de la tradición"],
          [`${culturas.size || contar("tradiciones")}`, "tradiciones del mundo"],
        ].map(([n, t]) => (
          <div key={t} className="tarjeta p-4">
            <dt className="sr-only">{t}</dt>
            <dd className="font-display text-4xl text-oro-suave">{n}</dd>
            <dd className="text-xs text-texto-suave">{t}</dd>
          </div>
        ))}
      </dl>

      <ol className="mx-auto max-w-2xl space-y-3">
        {lecciones.map((l) => {
          const saberes = l.bloques.flatMap((b) => (b.tipo === "saberes" ? b.items.map((it) => it.titulo) : []));
          const tradiciones = l.bloques.flatMap((b) => (b.tipo === "tradiciones" ? b.items : []));
          const ritual = l.bloques.find((b) => b.tipo === "ritual");
          const profundizar = l.bloques.find((b) => b.tipo === "profundizar");
          const practica = l.bloques.find((b) => b.tipo === "practica");
          const proyecto = l.bloques.find((b) => b.tipo === "proyecto");
          const prueba = l.bloques.find((b) => b.tipo === "test" && b.aprobar);
          return (
            <li key={l.numero}>
              <details className="tarjeta group overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-oro/50 bg-oro/10 text-2xl" aria-hidden>{l.llave.simbolo}</span>
                  <span className="flex-1">
                    <span className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{l.final ? "La noche del Círculo" : `Día ${l.numero}`} · {l.llave.nombre}</span>
                    <span className="font-display block text-xl leading-tight sm:text-2xl">{l.titulo}</span>
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-oro transition group-open:rotate-180" aria-hidden />
                </summary>
                <div className="space-y-4 border-t border-borde px-5 pb-5 pt-4 text-sm">
                  <p className="text-texto/90">{l.resumen}</p>
                  {saberes.length > 0 && (
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-oro-suave">Saberes</p>
                      <ul className="list-inside list-disc space-y-0.5 text-texto-suave marker:text-oro/60">
                        {saberes.map((s) => <li key={s}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {tradiciones.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-oro-suave">Tradiciones que recorres</p>
                      <ul className="flex flex-wrap gap-2">
                        {tradiciones.map((t) => (
                          <li key={t.nombre} className="rounded-full border border-borde px-3 py-1 text-xs text-texto-suave">
                            <span aria-hidden>{t.emoji} </span>{t.nombre} <span className="opacity-60">· {t.lugar}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {ritual?.tipo === "ritual" && (
                    <p><span className="text-xs uppercase tracking-[0.2em] text-oro-suave">Ritual guiado · </span>{ritual.titulo}</p>
                  )}
                  {profundizar?.tipo === "profundizar" && (
                    <p><span className="text-xs uppercase tracking-[0.2em] text-oro-suave">Para profundizar · </span>{profundizar.titulo}</p>
                  )}
                  {practica?.tipo === "practica" && (
                    <p><span className="text-xs uppercase tracking-[0.2em] text-oro-suave">Práctica entre lunas · </span>{practica.titulo}</p>
                  )}
                  {proyecto?.tipo === "proyecto" && (
                    <p><span className="text-xs uppercase tracking-[0.2em] text-oro-suave">Tu obra · </span>{proyecto.titulo}</p>
                  )}
                  {prueba?.tipo === "test" && (
                    <p><span className="text-xs uppercase tracking-[0.2em] text-oro-suave">La prueba · </span>{prueba.preguntas.length} preguntas sobre los siete días; se aprueba con {prueba.aprobar}.</p>
                  )}
                  <p className="rounded-xl bg-oro/10 p-3 text-texto/90">
                    <span className="font-display text-lg text-oro-suave">Al terminar sabrás: </span>{l.llave.saber.charAt(0).toLowerCase() + l.llave.saber.slice(1)}
                  </p>
                </div>
              </details>
            </li>
          );
        })}
      </ol>

      {/* Los grados del camino */}
      <div className="mx-auto max-w-2xl space-y-4 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-violeta-suave">Los grados del camino</p>
        <ol className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {grados.map(({ n, g }, k) => (
            <li key={n} className="flex items-center gap-2">
              <span className={`rounded-full border px-3 py-1.5 ${g.completo ? "border-oro bg-oro/15 text-oro-suave shadow-[0_0_18px_rgba(241,217,154,.35)]" : "border-borde text-texto-suave"}`}>
                {nombres(n)}
                <span className="block text-[10px] opacity-70">{n === 0 ? "al empezar" : n === total ? (hayPrueba ? "superas la prueba del Círculo" : `${total} llaves · Primer Círculo`) : `${n}+ llaves`}</span>
              </span>
              {k < grados.length - 1 && <span className="text-oro/60" aria-hidden>→</span>}
            </li>
          ))}
        </ol>
        <p className="text-sm text-texto-suave">
          Cada lección completa te da una llave. Con las siete llegas a la noche del Círculo: diseñas tu propio ritual, Sibila lo revisa y presentas la prueba.
          Al superarla cierras el Primer Círculo y recibes tu sello, tu grimorio y una carta de Sibila.
          Es un camino de aprendizaje de las tradiciones: no promete resultados.
        </p>
      </div>
    </section>
  );
}
