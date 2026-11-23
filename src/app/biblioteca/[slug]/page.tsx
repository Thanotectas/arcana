import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { sitio } from "@/lib/correo";
import { CtaLectura, JsonLd, Migas, Preguntas } from "@/components/seo/BloquesSeo";
import { BIBLIOTECA, entradaPorSlug, fichaEn } from "@/lib/biblioteca/fichas";

export function generateStaticParams() {
  return BIBLIOTECA.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = entradaPorSlug((await params).slug);
  if (!e) return {};
  const idioma = await getIdioma();
  const f = fichaEn(e, idioma);
  return { title: f.titulo, description: f.descripcion, alternates: alternativas(`/biblioteca/${e.slug}`, idioma), openGraph: { type: "article", title: f.titulo, description: f.descripcion } };
}

/** Una ficha de la Biblioteca de Sibila: historia, práctica, símbolos, preguntas, fuentes y la lectura con Sibila. */
export default async function PaginaFicha({ params }: { params: Promise<{ slug: string }> }) {
  const e = entradaPorSlug((await params).slug);
  if (!e) notFound();
  const idioma = await getIdioma();
  const f = fichaEn(e, idioma);
  const url = `${sitio()}/biblioteca/${e.slug}`;
  return (
    <article className="mx-auto max-w-3xl space-y-10">
      <JsonLd datos={{ "@context": "https://schema.org", "@type": "Article", headline: f.titulo, description: f.descripcion, datePublished: e.publicada, inLanguage: idioma, mainEntityOfPage: url, author: { "@type": "Organization", name: "Arcana" }, publisher: { "@type": "Organization", name: "Arcana" } }} />
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Biblioteca de Sibila", href: "/biblioteca" }, { nombre: f.titulo, href: `/biblioteca/${e.slug}` }]} />
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">
          <Link href="/biblioteca" className="hover:text-texto">Biblioteca de Sibila</Link>
        </p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{f.titulo}</h1>
        <p className="text-sm text-oro-suave">{f.nombres}</p>
      </header>
      <p className="font-display text-2xl leading-snug">{f.entrada}</p>

      {f.secciones.map((s) => (
        <section key={s.titulo} className="space-y-3">
          <h2 className="font-display text-3xl">{s.titulo}</h2>
          {s.parrafos.map((p, i) => (
            <p key={i} className="leading-relaxed text-texto/90">{p}</p>
          ))}
        </section>
      ))}

      {f.simbolos && (
        <section className="tarjeta space-y-3 p-6">
          <h2 className="font-display text-3xl">{f.simbolos.titulo}</h2>
          <p className="text-sm text-texto-suave">{f.simbolos.intro}</p>
          <dl className="grid gap-3 sm:grid-cols-2">
            {f.simbolos.lista.map((x) => (
              <div key={x.s} className="rounded-xl border border-borde p-3">
                <dt className="font-display text-xl text-oro-suave">{x.s}</dt>
                <dd className="text-sm">{x.d}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <CtaLectura titulo={f.cta.titulo} texto={f.cta.texto} href={e.href} boton={f.cta.boton} />

      <Preguntas items={f.preguntas} />

      <section className="space-y-2 border-t border-borde pt-6 text-sm text-texto-suave">
        <h2 className="font-display text-xl text-texto">Fuentes</h2>
        <ul className="list-disc space-y-1 ps-5">
          {e.fuentes.map((x) => (
            <li key={x.url}>
              <a href={x.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-texto">{x.titulo}</a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
