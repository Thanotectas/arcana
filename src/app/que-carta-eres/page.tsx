import type { Metadata } from "next";
import { TestCarta } from "@/components/seo/TestCarta";
import { Migas } from "@/components/seo/BloquesSeo";

export const metadata: Metadata = {
  title: "¿Qué carta del tarot eres? Test gratis",
  description: "Responde 6 preguntas y descubre cuál de los 22 arcanos mayores del tarot eres: tu esencia, tu don y tu reto. Gratis, en 1 minuto.",
  alternates: { canonical: "/que-carta-eres" },
  openGraph: {
    title: "¿Qué carta del tarot eres?",
    description: "6 preguntas, 1 minuto. Descubre tu arcano mayor.",
    images: [{ url: "/api/test-carta/la-estrella", width: 1080, height: 1350 }],
  },
};

function limpiarCodigo(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  const limpio = (s ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  return limpio.length >= 4 ? limpio : null;
}

export default async function PaginaQueCartaEres({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const inv = limpiarCodigo((await searchParams).inv);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "¿Qué carta del tarot eres?", href: "/que-carta-eres" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Test gratis · 1 minuto</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">¿Qué carta del tarot eres?</h1>
        <p className="mx-auto mt-3 max-w-xl text-texto-suave">
          Responde con el corazón, sin pensarlo mucho. Al final, Sibila te revela cuál de los 22 arcanos mayores refleja tu
          esencia.
        </p>
      </header>
      <TestCarta invitacion={inv} />
    </div>
  );
}
