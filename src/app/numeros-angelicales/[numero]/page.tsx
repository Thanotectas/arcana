import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { alternativas, rutaIdioma } from "@/lib/i18n/rutas";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { JsonLd } from "@/components/seo/BloquesSeo";
import { NUMEROS_ANGELICALES, RELACIONADOS, contenidoNumeros, esNumeroAngelical, normalizarNumero, reducir, type NumeroAngelical } from "@/lib/numeros-angelicales";
import { TEXTOS_NUMEROS, type TextosNumeros } from "@/lib/numeros-angelicales/textos";
import { BASE_SITIO, CtaNumeros, MigasNumeros, TarjetaNumero } from "../bloques";

const RUTA = "/numeros-angelicales";

/** Los 30 números con contenido propio se generan de antemano; cualquier otra cifra se explica a partir de sus dígitos. */
export function generateStaticParams() {
  return NUMEROS_ANGELICALES.map((numero) => ({ numero }));
}

/** En el título el lema va tras dos puntos: en estos idiomas sigue en minúscula. */
function lemaEnTitulo(lema: string, idioma: string) {
  return ["es", "pt", "fr", "id"].includes(idioma) ? lema.charAt(0).toLocaleLowerCase(idioma) + lema.slice(1) : lema;
}

/** Primera frase (o un recorte) del significado, para la descripción de los buscadores. */
function resumen(texto: string) {
  const frase = texto.split(/(?<=[.!?।。])\s/)[0];
  const base = frase.length >= 80 ? frase : texto;
  return base.length > 158 ? base.slice(0, 155).replace(/\s+\S*$/, "") + "…" : base;
}

export async function generateMetadata({ params }: { params: Promise<{ numero: string }> }): Promise<Metadata> {
  const { numero } = await params;
  const idioma = await getIdioma();
  const t = TEXTOS_NUMEROS[idioma];
  const ruta = `${RUTA}/${numero}`;
  if (esNumeroAngelical(numero)) {
    const c = (await contenidoNumeros(idioma))[numero];
    const titulo = plantilla(t.metaTituloNumero, { n: numero, lema: lemaEnTitulo(c.lema, idioma) });
    const descripcion = resumen(c.significado);
    return { title: titulo, description: descripcion, alternates: alternativas(ruta, idioma), openGraph: { title: titulo, description: descripcion, type: "article", images: [{ url: "/og/numeros-angelicales.jpg", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/og/numeros-angelicales.jpg"] } };
  }
  if (normalizarNumero(numero) !== numero) return {};
  // Las lecturas por cifras se generan al vuelo: útiles para quien las busca, pero no para el índice de Google.
  return { title: plantilla(t.generico.metaTitulo, { n: numero }), description: t.generico.intro, robots: { index: false, follow: true } };
}

/** El número grande: las cifras suben una a una y luego queda respirando un halo dorado (CSS: .halo-angel, .cifra-angel). */
function CifrasAngel({ numero }: { numero: string }) {
  return (
    <p dir="ltr" className="halo-angel font-display text-7xl [font-variant-numeric:lining-nums] font-semibold text-oro-suave sm:text-8xl" aria-hidden>
      {[...numero].map((d, i) => (
        <span key={i} className="cifra-angel brillo-oro" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
          {d}
        </span>
      ))}
    </p>
  );
}

export default async function PaginaNumero({ params }: { params: Promise<{ numero: string }> }) {
  const { numero } = await params;
  const idioma = await getIdioma();
  const t = TEXTOS_NUMEROS[idioma];
  const contenido = await contenidoNumeros(idioma);
  const base = rutaIdioma(RUTA, idioma);
  const migas = (nombre: string) => [
    { nombre: t.inicio, href: rutaIdioma("/", idioma) },
    { nombre: t.nombreSeccion, href: base },
    { nombre, href: `${base}/${numero}` },
  ];

  if (!esNumeroAngelical(numero)) {
    if (normalizarNumero(numero) !== numero) notFound();
    return <LecturaPorCifras numero={numero} t={t} base={base} lemas={contenido} migas={migas(numero)} />;
  }

  const c = contenido[numero];
  const apartado = (titulo: string, texto: string, icono: string, destacado = false) => (
    <section className={`tarjeta space-y-2 p-6 ${destacado ? "border-violeta/40 bg-violeta/5" : ""}`}>
      <h2 className="font-display text-2xl"><span aria-hidden>{icono}</span> {titulo}</h2>
      <p className="leading-relaxed">{texto}</p>
    </section>
  );

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <MigasNumeros items={migas(numero)} />

      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.etiquetaNumero}</p>
        <CifrasAngel numero={numero} />
        <h1 className="font-display text-3xl font-semibold [font-variant-numeric:lining-nums] sm:text-4xl">{plantilla(t.tituloNumero, { n: numero })}</h1>
        <p className="mt-1 text-lg text-texto-suave">{c.lema}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {c.claves.map((k) => (
            <span key={k} className="rounded-full border border-oro/40 px-3 py-1 text-xs text-oro-suave">{k}</span>
          ))}
        </div>
      </header>

      {apartado(t.apartados.significado, c.significado, "✨")}
      <div className="grid gap-4 sm:grid-cols-2">
        {apartado(t.apartados.amor, c.amor, "💜")}
        {apartado(t.apartados.trabajo, c.trabajo, "💼")}
      </div>
      {apartado(t.apartados.llamaGemela, c.llamaGemela, "🔥")}
      {apartado(t.apartados.queHacer, c.queHacer, "🕯️", true)}

      <Relacionados titulo={t.apartados.relacionados} numeros={RELACIONADOS[numero]} lemas={contenido} base={base} />

      <CtaNumeros t={t.cta} />

      <p className="text-center text-sm">
        <Link href={base} className="text-oro-suave hover:text-texto">{t.volver}</Link>
      </p>
      <p className="text-center text-xs text-texto-suave">{t.aviso}</p>

      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: plantilla(t.metaTituloNumero, { n: numero, lema: lemaEnTitulo(c.lema, idioma) }),
          description: resumen(c.significado),
          url: BASE_SITIO + `${base}/${numero}`,
          author: { "@type": "Organization", name: "Arcana" },
          publisher: { "@type": "Organization", name: "Arcana" },
          inLanguage: idioma,
        }}
      />
    </article>
  );
}

function Relacionados({ titulo, numeros, lemas, base }: { titulo: string; numeros: NumeroAngelical[]; lemas: Record<NumeroAngelical, { lema: string }>; base: string }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-2xl">{titulo}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {numeros.map((n) => (
          <TarjetaNumero key={n} numero={n} lema={lemas[n].lema} href={`${base}/${n}`} />
        ))}
      </div>
    </section>
  );
}

/** Números sin página propia: lectura cifra a cifra, su repetición y su raíz numérica. */
function LecturaPorCifras({ numero, t, base, lemas, migas }: { numero: string; t: TextosNumeros; base: string; lemas: Record<NumeroAngelical, { lema: string }>; migas: { nombre: string; href: string }[] }) {
  const g = t.generico;
  const cifras = numero.split("") as (keyof TextosNumeros["digitos"])[];
  const unicas = [...new Set(cifras)];
  const { pasos, raiz } = reducir(numero);
  const operacion = [cifras.join(" + ") + (cifras.length > 1 ? ` = ${pasos[0]}` : ""), ...pasos.slice(1).map((p, i) => `${String(pasos[i]).split("").join(" + ")} = ${p}`)].join(" → ");
  const digitoRaiz = t.digitos[String(raiz) as keyof TextosNumeros["digitos"]];
  // Números con página propia que comparten más cifras con este.
  const cercanos = NUMEROS_ANGELICALES.map((n) => ({ n, comunes: unicas.filter((d) => n.includes(d)).length }))
    .filter((x) => x.comunes > 0)
    .sort((a, b) => b.comunes - a.comunes || a.n.length - b.n.length)
    .slice(0, 4)
    .map((x) => x.n);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <MigasNumeros items={migas} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{g.etiqueta}</p>
        <CifrasAngel numero={numero} />
        <h1 className="font-display text-3xl font-semibold [font-variant-numeric:lining-nums] sm:text-4xl">{plantilla(g.titulo, { n: numero })}</h1>
        <p className="mx-auto mt-2 max-w-xl text-texto-suave">{g.intro}</p>
      </header>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">{g.cifrasTitulo}</h2>
        <ul className="mt-3 space-y-3">
          {unicas.map((d) => {
            const veces = cifras.filter((x) => x === d).length;
            return (
              <li key={d} className="flex gap-3">
                <span dir="ltr" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-oro/40 font-display text-xl [font-variant-numeric:lining-nums] text-oro-suave">{d}</span>
                <div>
                  <p><span className="font-semibold">{t.digitos[d].clave}.</span> {t.digitos[d].texto}</p>
                  {veces > 1 && <p className="text-sm text-violeta-suave">{plantilla(g.repetida, { d, veces })}</p>}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="tarjeta space-y-2 p-6">
        <h2 className="font-display text-2xl">{g.raizTitulo}</h2>
        <p dir="ltr" className="text-center font-display text-xl [font-variant-numeric:lining-nums] text-oro-suave">{operacion}</p>
        <p>{plantilla(g.raizTexto, { raiz })} <span className="font-semibold">{digitoRaiz.clave}:</span> {digitoRaiz.texto}</p>
      </section>

      <section className="tarjeta space-y-2 border-violeta/40 bg-violeta/5 p-6">
        <h2 className="font-display text-2xl"><span aria-hidden>🕯️</span> {g.queHacerTitulo}</h2>
        <p>{digitoRaiz.accion}</p>
      </section>

      {cercanos.length > 0 && <Relacionados titulo={g.cercanos} numeros={cercanos} lemas={lemas} base={base} />}

      <CtaNumeros t={t.cta} />

      <p className="text-center text-sm">
        <Link href={base} className="text-oro-suave hover:text-texto">{t.volver}</Link>
      </p>
      <p className="text-center text-xs text-texto-suave">{t.aviso}</p>
    </article>
  );
}
