import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { sitio } from "@/lib/correo";
import { CtaLectura, JsonLd, Migas, Preguntas } from "@/components/seo/BloquesSeo";
import { BIBLIOTECA, entradaPorSlug, videoEn } from "@/lib/biblioteca/fichas";
import { fichaTraducida, traducirFaltantes } from "@/lib/biblioteca/traducciones";
import { TEXTOS_ARCANO } from "@/lib/biblioteca/textos";
import { getUsuarioOpcional } from "@/lib/dal";
import { ListaEspera } from "@/components/ListaEspera";
import { TEXTOS_LISTA_ESPERA } from "@/lib/lista-espera/textos";

// La primera visita en un idioma deja traduciendo la ficha en segundo plano (puede tardar un par de minutos).
export const maxDuration = 300;

export function generateStaticParams() {
  return BIBLIOTECA.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const e = entradaPorSlug((await params).slug);
  if (!e) return {};
  const idioma = await getIdioma();
  const { ficha: f } = await fichaTraducida(e, idioma);
  return { title: f.titulo, description: f.descripcion, alternates: alternativas(`/biblioteca/${e.slug}`, idioma), openGraph: { type: "article", title: f.titulo, description: f.descripcion } };
}

/** Una ficha del Arcano de Sibila: historia, práctica, símbolos, preguntas, fuentes y la lectura con Sibila. */
export default async function PaginaFicha({ params }: { params: Promise<{ slug: string }> }) {
  const e = entradaPorSlug((await params).slug);
  if (!e) notFound();
  const idioma = await getIdioma();
  const { ficha: f, falta } = await fichaTraducida(e, idioma);
  if (falta) after(() => traducirFaltantes(idioma, [e]));
  const t = TEXTOS_ARCANO[idioma];
  const url = `${sitio()}/biblioteca/${e.slug}`;
  const video = videoEn(e, idioma);
  return (
    <article className="mx-auto max-w-3xl space-y-10" lang={falta ? "es" : idioma}>
      <JsonLd datos={{ "@context": "https://schema.org", "@type": "Article", headline: f.titulo, description: f.descripcion, datePublished: e.publicada, inLanguage: idioma, mainEntityOfPage: url, author: { "@type": "Organization", name: "Arcana" }, publisher: { "@type": "Organization", name: "Arcana" } }} />
      <Migas items={[{ nombre: t.inicio, href: "/" }, { nombre: t.nombre, href: "/biblioteca" }, { nombre: f.titulo, href: `/biblioteca/${e.slug}` }]} />
      <header className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">
          <Link href="/biblioteca" className="hover:text-texto">{t.nombre}</Link>
        </p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{f.titulo}</h1>
        <p className="text-sm text-oro-suave">{f.nombres}</p>
        {falta && <p className="text-xs text-texto-suave">{t.traduciendo}</p>}
      </header>
      {video && (
        <figure className="mx-auto w-full max-w-sm">
          <video controls playsInline preload="metadata" poster={e.portada} className="aspect-[9/16] w-full rounded-2xl border border-borde bg-black">
            <source src={video} type="video/mp4" />
          </video>
          {video && (
            <JsonLd datos={{ "@context": "https://schema.org", "@type": "VideoObject", name: f.titulo, description: f.descripcion, thumbnailUrl: `${sitio()}${e.portada ?? ""}`, uploadDate: e.publicada, contentUrl: `${sitio()}${video}`, inLanguage: idioma }} />
          )}
        </figure>
      )}
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

      <CtaLectura titulo={f.cta.titulo} texto={f.cta.texto} href={e.hrefs?.[idioma] ?? e.href} boton={f.cta.boton} nota={t.nota} />

      {e.curso && <ListaEspera curso={e.curso} idioma={idioma} origen={`arcano/${e.slug}`} textos={TEXTOS_LISTA_ESPERA[idioma]} correoInicial={(await getUsuarioOpcional())?.email ?? ""} />}

      <Preguntas items={f.preguntas} titulo={t.preguntas} />

      <section className="space-y-2 border-t border-borde pt-6 text-sm text-texto-suave">
        <h2 className="font-display text-xl text-texto">{t.fuentes}</h2>
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
