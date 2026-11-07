import type { Metadata } from "next";
import Link from "next/link";
import { TestAlma } from "@/components/seo/TestAlma";
import { Migas, Preguntas } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "¿Eres alma vieja? Test gratis",
  description: "Responde 7 preguntas y descubre la edad de tu alma: alma nueva, joven, madura, vieja o ancestral. Señales de un alma vieja y qué dice tu carta astral. Gratis, en 1 minuto.",
  alternates: { canonical: "/alma-vieja" },
  openGraph: {
    title: "¿Eres alma vieja?",
    description: "7 preguntas, 1 minuto. Descubre la edad de tu alma.",
    images: [{ url: "/api/test-alma/vieja", width: 1080, height: 1350 }],
  },
};

function limpiarCodigo(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  const limpio = (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return limpio.length >= 4 ? limpio : null;
}

export default async function PaginaAlmaVieja({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const inv = limpiarCodigo((await searchParams).inv);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "¿Eres alma vieja?", href: "/alma-vieja" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Test gratis · 1 minuto</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">¿Eres alma vieja?</h1>
        <p className="mx-auto mt-3 max-w-xl text-texto-suave">
          Según la tradición de la reencarnación, cada alma ha vivido un número distinto de vidas. Responde con el corazón y
          Sibila te dice la edad de la tuya.
        </p>
      </header>
      <TestAlma invitacion={inv} />
      <section className="tarjeta space-y-3 p-6">
        <h2 className="font-display text-2xl">Señales de un alma vieja</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>De niña te decían que eras «madura para tu edad».</li>
          <li>Necesitas soledad para recargarte y prefieres pocos amigos de verdad.</li>
          <li>Sientes nostalgia de épocas o lugares que no viviste.</li>
          <li>Tu intuición casi nunca falla y la gente te busca para pedirte consejo.</li>
          <li>Te importan más el sentido y la paz que la fama o el dinero.</li>
          <li>A veces te sientes extranjera en este mundo.</li>
        </ul>
        <p className="text-sm text-texto-suave">
          En la carta astral se ve en el <Link href="/reencarnacion" className="text-oro-suave hover:text-texto">Nodo Sur</Link>,
          la casa 12, un Saturno fuerte y los planetas retrógrados; en la numerología, en el camino de vida 7 o 9 y los números
          maestros 11, 22 y 33.
        </p>
      </section>
      <Preguntas
        items={[
          { p: "¿Qué es un alma vieja?", r: "Según quienes creen en la reencarnación, es un alma que ya ha vivido muchas vidas. Por eso llega a esta con más calma, intuición, empatía y necesidad de encontrar sentido." },
          { p: "¿Cómo saber si soy alma vieja?", r: "Se reconoce por señales como la madurez temprana, la necesidad de soledad, la intuición fuerte, la nostalgia de otras épocas y que la gente te busque para pedir consejo. La astrología kármica lo mira en el Nodo Sur, la casa 12 y Saturno." },
          { p: "¿Qué número es de alma vieja en numerología?", r: "Se asocia con el camino de vida 7 (el buscador) y el 9 (el que cierra ciclos), y con los números maestros 11, 22 y 33." },
        ]}
      />
    </div>
  );
}
