import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe } from "@/lib/escuela/servidor";
import { LibroDelCurso } from "@/components/escuela/LibroDelCurso";

export async function generateMetadata({ params }: { params: Promise<{ curso: string }> }): Promise<Metadata> {
  const c = cursoPorSlug((await params).curso);
  return c ? { title: `Libro de consulta · ${c.titulo}`, robots: { index: false } } : {};
}

/** El libro de consulta del curso, para quien está inscrito: correspondencias, glosario y cuidados. */
export default async function PaginaLibro({ params }: { params: Promise<{ curso: string }> }) {
  const curso = cursoPorSlug((await params).curso);
  if (!curso?.libro) notFound();
  const usuario = await getUsuarioOpcional();
  const avance = await avanceDe(curso, usuario);
  if (!usuario || !(avance.inscrito || avance.vistaPrevia)) redirect(`/escuela/${curso.slug}`);
  return (
    <article className="mx-auto max-w-3xl space-y-10" lang="es">
      <header className="relative overflow-hidden rounded-3xl border border-oro/40 px-6 py-12 text-center">
        <div className="escuela-cielo absolute inset-0" aria-hidden />
        <div className="relative space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-oro-suave">{curso.titulo}</p>
          <h1 className="font-display text-5xl font-semibold leading-tight">Libro de consulta</h1>
          <p className="mx-auto max-w-lg text-texto-suave">Lo que una iniciada o un iniciado tiene siempre a mano: qué color, qué día, qué Luna, qué planta; qué significa cada palabra; cómo cuidar el fuego y a las personas.</p>
          <nav className="flex flex-wrap justify-center gap-2 pt-2 text-sm">
            {[["#correspondencias", "Correspondencias"], ["#glosario", "Glosario"], ["#cuidado", "Cuidado y ética"]].map(([h, t]) => (
              <a key={h} href={h} className="rounded-full border border-oro/40 px-3 py-1 text-oro-suave hover:border-oro hover:text-texto">{t}</a>
            ))}
          </nav>
        </div>
      </header>
      <LibroDelCurso libro={curso.libro} />
      <p className="text-center text-sm"><Link href={`/escuela/${curso.slug}`} className="text-oro-suave hover:text-texto">Volver al camino</Link></p>
    </article>
  );
}
