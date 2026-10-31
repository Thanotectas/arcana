import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MAZO, cartaPorId, type CartaTarot } from "@/lib/tarot/deck";
import { Migas, CtaLectura, Preguntas, JsonLd } from "@/components/seo/BloquesSeo";

export const dynamicParams = false;

export function generateStaticParams() {
  return MAZO.map((c) => ({ carta: c.id }));
}

const NOMBRE_PALO = { bastos: "Bastos", copas: "Copas", espadas: "Espadas", oros: "Oros" } as const;
const ELEMENTO: Record<CartaTarot["elemento"], string> = { fuego: "Fuego", agua: "Agua", aire: "Aire", tierra: "Tierra", espiritu: "Espíritu" };

function grupo(c: CartaTarot) {
  return c.arcano === "mayor" ? `Arcano mayor ${c.numero === 0 ? "0" : romano(c.numero)}` : `Arcano menor · ${NOMBRE_PALO[c.palo!]}`;
}

function romano(n: number) {
  const t: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = "";
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
}

function descripcion(c: CartaTarot) {
  return `Significado de ${c.nombre} en el tarot: ${c.palabrasClave.slice(0, 3).join(", ")}. Qué significa en el amor, en el trabajo y cuando sale invertida.`;
}

export async function generateMetadata({ params }: { params: Promise<{ carta: string }> }): Promise<Metadata> {
  const { carta } = await params;
  const c = cartaPorId(carta);
  if (!c) return {};
  const titulo = `${c.nombre}: significado en el tarot, amor e invertida`;
  return {
    title: titulo,
    description: descripcion(c),
    alternates: { canonical: `/significado-tarot/${c.id}` },
    openGraph: { title: titulo, description: descripcion(c), images: [{ url: `/cartas/rider/${c.id}.webp`, alt: c.nombre }], type: "article" },
  };
}

export default async function PaginaCarta({ params }: { params: Promise<{ carta: string }> }) {
  const { carta } = await params;
  const c = cartaPorId(carta);
  if (!c) notFound();
  const i = MAZO.indexOf(c);
  const anterior = MAZO[(i - 1 + MAZO.length) % MAZO.length];
  const siguiente = MAZO[(i + 1) % MAZO.length];
  const relacionadas = MAZO.filter((o) => o.id !== c.id && (c.arcano === "mayor" ? o.arcano === "mayor" : o.palo === c.palo)).slice(0, 6);

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Significado de las cartas del tarot", href: "/significado-tarot" }, { nombre: c.nombre, href: `/significado-tarot/${c.id}` }]} />
      <header className="grid items-center gap-6 sm:grid-cols-[180px_1fr]">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen estática de la carta */}
        <img src={`/cartas/rider/${c.id}.webp`} alt={`Carta ${c.nombre} del tarot Rider-Waite`} className="mx-auto w-40 rounded-xl border border-oro/40 shadow-lg sm:w-full" />
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{grupo(c)} · {ELEMENTO[c.elemento]}</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">{c.nombre}: significado en el tarot</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {c.palabrasClave.map((p) => (
              <span key={p} className="rounded-full border border-oro/40 px-3 py-1 text-xs text-oro-suave">{p}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">¿Qué significa {c.nombre}?</h2>
        <p>{c.significado}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💜 En el amor</h2>
          <p className="mt-2">{c.amor}</p>
        </section>
        <section className="tarjeta p-6">
          <h2 className="font-display text-2xl">💼 En el trabajo y el dinero</h2>
          <p className="mt-2">{c.trabajo}</p>
        </section>
      </div>

      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">{c.nombre} invertida</h2>
        <p>{c.significadoInvertido}</p>
        <p className="text-sm text-texto-suave">Palabras clave invertida: {c.palabrasClaveInvertida.join(", ")}.</p>
      </section>

      <CtaLectura
        titulo={`¿Te salió ${c.nombre}?`}
        texto="Una carta sola dice poco: su sentido real depende de tu pregunta y de las cartas que la acompañan. Haz tu tirada con Sibila y recibe la lectura completa, escrita para ti."
        boton="Hacer mi tirada de tarot"
      />

      <Preguntas
        items={[
          { p: `¿Qué significa ${c.nombre} en el tarot?`, r: c.significado },
          { p: `¿Qué significa ${c.nombre} en el amor?`, r: c.amor },
          { p: `¿Qué significa ${c.nombre} invertida?`, r: c.significadoInvertido },
        ]}
      />

      <section>
        <h2 className="font-display text-2xl">{c.arcano === "mayor" ? "Otros arcanos mayores" : `Más cartas de ${NOMBRE_PALO[c.palo!]}`}</h2>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {relacionadas.map((o) => (
            <Link key={o.id} href={`/significado-tarot/${o.id}`} className="group text-center text-xs text-texto-suave hover:text-texto">
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura estática */}
              <img src={`/cartas/rider/${o.id}.webp`} alt="" loading="lazy" className="mb-1 w-full rounded-lg border border-borde transition group-hover:border-oro/50" />
              {o.nombre}
            </Link>
          ))}
        </div>
      </section>

      <nav className="flex justify-between text-sm">
        <Link href={`/significado-tarot/${anterior.id}`} className="text-oro-suave hover:text-texto">← {anterior.nombre}</Link>
        <Link href={`/significado-tarot/${siguiente.id}`} className="text-oro-suave hover:text-texto">{siguiente.nombre} →</Link>
      </nav>

      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: `${c.nombre}: significado en el tarot`,
          description: descripcion(c),
          image: `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "")}/cartas/rider/${c.id}.webp`,
          author: { "@type": "Organization", name: "Arcana" },
          publisher: { "@type": "Organization", name: "Arcana" },
          inLanguage: "es",
        }}
      />
    </article>
  );
}
