import type { LibroCurso } from "@/lib/escuela/tipos";

/** El libro de consulta del curso: tablas de correspondencias, glosario y cuidados del ritual. */
export function LibroDelCurso({ libro }: { libro: LibroCurso }) {
  return (
    <div className="space-y-12">
      <section id="correspondencias" className="space-y-8">
        <h3 className="text-center font-display text-3xl">Correspondencias</h3>
        {libro.correspondencias.map((t) => (
          <div key={t.titulo} className="space-y-2">
            <h4 className="font-display text-2xl text-oro-suave">{t.titulo}</h4>
            {t.nota && <p className="text-sm text-texto-suave">{t.nota}</p>}
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[34rem] border-collapse text-sm">
                <thead>
                  <tr>
                    {t.columnas.map((c) => (
                      <th key={c} className="border-b border-oro/40 px-2 py-2 text-start text-xs font-medium uppercase tracking-[0.15em] text-violeta-suave">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {t.filas.map((f) => (
                    <tr key={f[0]} className="align-top">
                      {f.map((celda, j) => (
                        <td key={j} className={`border-b border-borde px-2 py-2 ${j === 0 ? "font-display text-base text-texto" : "text-texto/85"}`}>{celda}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </section>

      <section id="glosario" className="space-y-4">
        <h3 className="text-center font-display text-3xl">Glosario</h3>
        <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {libro.glosario.map((g) => (
            <div key={g.termino}>
              <dt className="font-display text-xl text-oro-suave">
                {g.termino}
                {g.origen && <span className="ms-2 text-xs italic text-texto-suave">{g.origen}</span>}
              </dt>
              <dd className="text-sm leading-relaxed text-texto/85">{g.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="cuidado" className="space-y-4">
        <h3 className="text-center font-display text-3xl">Cuidado y ética del ritual</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {libro.cuidado.map((c) => (
            <div key={c.titulo} className="tarjeta p-4">
              <p className="font-display text-xl">{c.titulo}</p>
              <p className="mt-1 text-sm leading-relaxed text-texto/85">{c.texto}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
