import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { imagenSigno } from "@/lib/zodiaco";
import { compatibilidadPareja, leerPareja, rankingDe, slugPareja, todasLasParejas } from "@/lib/seo/compatibilidad";
import { Migas, CtaLectura, Preguntas } from "@/components/seo/BloquesSeo";

export function generateStaticParams() {
  return todasLasParejas().map(([a, b]) => ({ pareja: slugPareja(a, b) }));
}

export async function generateMetadata({ params }: { params: Promise<{ pareja: string }> }): Promise<Metadata> {
  const { pareja } = await params;
  const p = leerPareja(pareja);
  if (!p) return {};
  const r = compatibilidadPareja(p.a, p.b);
  const titulo = `Compatibilidad ${p.a.nombre} y ${p.b.nombre}: ${r.porcentaje}% en el amor`;
  const descripcion = `¿${p.a.nombre} y ${p.b.nombre} son compatibles? ${r.titular}: ${r.porcentaje}%. Cómo son en el amor, sus retos y el consejo de las estrellas para esta pareja.`;
  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical: `/compatibilidad-signos/${p.canonico}` },
    openGraph: { title: titulo, description: descripcion, type: "article" },
  };
}

export default async function PaginaPareja({ params }: { params: Promise<{ pareja: string }> }) {
  const { pareja } = await params;
  const p = leerPareja(pareja);
  if (!p) notFound();
  if (p.canonico !== pareja) permanentRedirect(`/compatibilidad-signos/${p.canonico}`);
  const r = compatibilidadPareja(p.a, p.b);
  const otrasA = rankingDe(p.a).mejores;
  const otrasB = rankingDe(p.b).mejores;
  const nombre = `${p.a.nombre} y ${p.b.nombre}`;

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Compatibilidad de signos", href: "/compatibilidad-signos" }, { nombre, href: `/compatibilidad-signos/${p.canonico}` }]} />
      <header className="text-center">
        <div className="flex items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
          <img src={imagenSigno(p.a.id)} alt={p.a.nombre} width={96} height={96} className="moneda-signo" />
          <span className="font-display text-4xl text-oro">+</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- moneda estática */}
          <img src={imagenSigno(p.b.id)} alt={p.b.nombre} width={96} height={96} className="moneda-signo" />
        </div>
        <h1 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Compatibilidad {nombre}</h1>
        <p className="mt-3 font-display text-6xl text-oro">{r.porcentaje}%</p>
        <p className="text-texto-suave">{r.titular}</p>
        <div className="mx-auto mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-borde">
          <div className="h-full rounded-full bg-oro" style={{ width: `${r.porcentaje}%` }} />
        </div>
      </header>

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">¿Cómo es la relación entre {nombre}?</h2>
        <p>{r.general}</p>
        {r.extra && <p>{r.extra}</p>}
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💜 En el amor</h2>
          <p className="mt-2">{r.amor}</p>
        </section>
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">⚡ Sus retos</h2>
          <p className="mt-2">{r.reto}</p>
        </section>
      </div>
      <section className="tarjeta border-violeta/40 p-6">
        <h2 className="font-display text-2xl">El consejo de Sibila</h2>
        <p className="mt-2">{r.consejo}</p>
      </section>

      <CtaLectura
        titulo="El signo solar es solo el comienzo"
        texto={`Esta compatibilidad mira solo el Sol. La sinastría compara las dos cartas astrales completas (Luna, Venus, Marte, ascendente) y te dice cómo es de verdad su relación.`}
        boton="Hacer nuestra sinastría"
      />

      <Preguntas
        items={[
          { p: `¿${p.a.nombre} y ${p.b.nombre} son compatibles?`, r: `${r.titular}: ${r.porcentaje}% de compatibilidad. ${r.general}` },
          { p: `¿Cómo son ${nombre} en el amor?`, r: r.amor },
          { p: `¿Qué problemas tienen ${nombre}?`, r: r.reto },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2">
        {[{ s: p.a, l: otrasA }, { s: p.b, l: otrasB }].map(({ s, l }) => (
          <div key={s.id} className="tarjeta p-5">
            <h2 className="font-display text-xl">Las mejores parejas de {s.nombre}</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {l.map((o) => (
                <li key={o.signo.id}>
                  <Link href={`/compatibilidad-signos/${slugPareja(s, o.signo)}`} className="text-oro-suave hover:text-texto">
                    {s.nombre} y {o.signo.nombre} · {o.porcentaje}%
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/signos-zodiacales/${s.id}`} className="mt-2 inline-block text-xs text-texto-suave hover:text-texto">Cómo es {s.nombre} →</Link>
          </div>
        ))}
      </section>
    </article>
  );
}
