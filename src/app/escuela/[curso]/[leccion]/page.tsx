import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, Clapperboard, Sparkles } from "lucide-react";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe } from "@/lib/escuela/servidor";
import { TestLeccion } from "@/components/escuela/TestLeccion";

export async function generateMetadata({ params }: { params: Promise<{ curso: string; leccion: string }> }): Promise<Metadata> {
  const { curso: slug, leccion } = await params;
  const l = cursoPorSlug(slug)?.lecciones.find((x) => x.numero === Number(leccion));
  return l ? { title: `Día ${l.numero} · ${l.titulo}`, robots: { index: false } } : {};
}

/** Una lección: sus bloques en orden (video, texto, ritual, entrega y test). Solo con inscripción y si ya se abrió. */
export default async function PaginaLeccion({ params }: { params: Promise<{ curso: string; leccion: string }> }) {
  const { curso: slug, leccion: num } = await params;
  const curso = cursoPorSlug(slug);
  const leccion = curso?.lecciones.find((x) => x.numero === Number(num));
  if (!curso || !leccion) notFound();
  const usuario = await getUsuarioOpcional();
  const avance = await avanceDe(curso, usuario);
  const i = curso.lecciones.indexOf(leccion);
  const estado = avance.estados[i];
  if (!(avance.inscrito || avance.vistaPrevia) || (estado !== "abierta" && estado !== "hecha")) redirect(`/escuela/${curso.slug}`);
  const previo = avance.progreso.get(leccion.numero);
  const sig = curso.lecciones[i + 1];
  const siguiente = sig && (avance.estados[i + 1] === "abierta" || avance.estados[i + 1] === "hecha") ? `/escuela/${curso.slug}/${sig.numero}` : null;

  return (
    <article className="mx-auto max-w-2xl space-y-8" lang="es">
      <p className="text-sm text-texto-suave">
        <Link href={`/escuela/${curso.slug}`} className="hover:text-texto">{curso.titulo}</Link> › Día {leccion.numero}
      </p>
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Día {leccion.numero} de {curso.lecciones.length} · {leccion.minutos} min</p>
        <h1 className="font-display text-4xl font-semibold">{leccion.titulo}</h1>
        <p className="text-texto-suave">{leccion.resumen}</p>
      </header>

      {leccion.bloques.map((b, k) => {
        if (b.tipo === "video")
          return b.src ? (
            <figure key={k} className="mx-auto w-full max-w-sm">
              <video controls playsInline preload="metadata" poster={b.poster} className="aspect-[9/16] w-full rounded-2xl border border-borde bg-black">
                <source src={b.src} type="video/mp4" />
              </video>
              <figcaption className="mt-2 text-center text-sm text-texto-suave">{b.titulo}</figcaption>
            </figure>
          ) : (
            <div key={k} className="tarjeta flex items-center gap-4 p-5 text-sm text-texto-suave">
              <Clapperboard className="h-6 w-6 shrink-0 text-oro" aria-hidden />
              <span><span className="font-display block text-lg text-texto">{b.titulo}</span>El video de Sibila de esta lección se está grabando.</span>
            </div>
          );
        if (b.tipo === "texto")
          return (
            <section key={k} className="space-y-3">
              {b.titulo && <h2 className="font-display text-3xl">{b.titulo}</h2>}
              {b.parrafos.map((p, j) => <p key={j} className="leading-relaxed text-texto/90">{p}</p>)}
            </section>
          );
        if (b.tipo === "ritual")
          return (
            <section key={k} className="tarjeta space-y-4 p-6">
              <h2 className="font-display text-3xl">{b.titulo}</h2>
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-violeta-suave">Necesitas</h3>
                <ul className="mt-2 list-disc space-y-1 ps-5 text-sm">{b.materiales.map((m) => <li key={m}>{m}</li>)}</ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-[0.2em] text-violeta-suave">Paso a paso</h3>
                <ol className="mt-2 list-decimal space-y-2 ps-5">{b.pasos.map((p) => <li key={p} className="leading-relaxed">{p}</li>)}</ol>
              </div>
              {b.cuidado && <p className="flex gap-2 rounded-xl border border-oro/30 p-3 text-sm text-texto-suave"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{b.cuidado}</p>}
              {b.herramienta && <Link href={b.herramienta.href} className="boton boton-secundario">{b.herramienta.texto}</Link>}
            </section>
          );
        if (b.tipo === "entrega")
          return (
            <section key={k} className="tarjeta border-oro/40 bg-oro/5 p-6 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-oro" aria-hidden />
              <h2 className="font-display mt-2 text-2xl">{b.titulo}</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-texto-suave">{b.texto}</p>
              <Link href={b.href} className="boton boton-primario mt-4">{b.boton}</Link>
            </section>
          );
        return (
          <section key={k} className="tarjeta space-y-4 p-6">
            <h2 className="font-display text-3xl">{b.titulo ?? "Para ti"}</h2>
            <TestLeccion curso={curso.slug} leccion={leccion.numero} preguntas={b.preguntas} previas={previo?.respuestas ?? {}} comentarioPrevio={previo?.comentario ?? null} audioPrevio={previo?.comentarioAudio ?? null} siguiente={siguiente} ultima={!sig} />
          </section>
        );
      })}
    </article>
  );
}
