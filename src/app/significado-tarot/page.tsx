import Link from "next/link";
import type { Metadata } from "next";
import { MAZO, type Palo } from "@/lib/tarot/deck";
import { Migas, CtaLectura } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "Significado de las 78 cartas del tarot",
  description:
    "Qué significa cada carta del tarot: los 22 arcanos mayores y los 56 menores (bastos, copas, espadas y oros), en el amor, en el trabajo y cuando salen invertidas.",
  alternates: { canonical: "/significado-tarot" },
};

const PALOS: { id: Palo; nombre: string; texto: string }[] = [
  { id: "bastos", nombre: "Bastos", texto: "Fuego: la acción, los proyectos, la pasión y la energía." },
  { id: "copas", nombre: "Copas", texto: "Agua: las emociones, el amor, la familia y la intuición." },
  { id: "espadas", nombre: "Espadas", texto: "Aire: la mente, las decisiones, los conflictos y la verdad." },
  { id: "oros", nombre: "Oros", texto: "Tierra: el dinero, el trabajo, el cuerpo y lo material." },
];

function Rejilla({ ids }: { ids: typeof MAZO }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
      {ids.map((c) => (
        <Link key={c.id} href={`/significado-tarot/${c.id}`} className="group text-center text-xs text-texto-suave hover:text-texto">
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura estática */}
          <img src={`/cartas/rider/${c.id}.webp`} alt={c.nombre} loading="lazy" className="mb-1 w-full rounded-lg border border-borde transition group-hover:-translate-y-1 group-hover:border-oro/50" />
          {c.nombre}
        </Link>
      ))}
    </div>
  );
}

export default function PaginaSignificadoTarot() {
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "Significado de las cartas del tarot", href: "/significado-tarot" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Guía del tarot</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Significado de las 78 cartas del tarot</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          El tarot tiene 22 arcanos mayores, que hablan de las grandes etapas de la vida, y 56 arcanos menores, que hablan
          del día a día. Toca una carta para ver su significado, en el amor, en el trabajo y cuando sale invertida.
        </p>
      </header>

      <section>
        <h2 className="font-display text-3xl">Los 22 arcanos mayores</h2>
        <Rejilla ids={MAZO.filter((c) => c.arcano === "mayor")} />
      </section>

      {PALOS.map((p) => (
        <section key={p.id}>
          <h2 className="font-display text-3xl">Arcanos menores: {p.nombre}</h2>
          <p className="text-sm text-texto-suave">{p.texto}</p>
          <Rejilla ids={MAZO.filter((c) => c.palo === p.id)} />
        </section>
      ))}

      <CtaLectura
        titulo="Pregúntale al tarot lo que necesitas saber"
        texto="Elige tu tirada, saca tus cartas y Sibila te las interpreta juntas, según tu pregunta."
        boton="Hacer mi tirada gratis"
      />
    </div>
  );
}
