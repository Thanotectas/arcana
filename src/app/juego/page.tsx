import type { Metadata } from "next";
import { Migas } from "@/components/seo/BloquesSeo";
import { CaminoDelLoco } from "@/components/juego/CaminoDelLoco";

export const metadata: Metadata = {
  title: "El Camino del Loco: adivina la carta escondida de hoy",
  description: "Juego diario de tarot: Sibila esconde una de las 78 cartas y tienes 6 intentos para descubrirla con sus pistas. Comparte tu resultado, arma tu álbum y gana créditos con tu racha.",
  alternates: { canonical: "/juego" },
  openGraph: {
    title: "El Camino del Loco · La carta escondida de hoy",
    description: "¿Adivinas la carta del tarot que Sibila escondió hoy? 6 intentos.",
  },
};

export default function PaginaJuego() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "El Camino del Loco", href: "/juego" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Juego diario · gratis</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">El Camino del Loco</h1>
        <p className="mx-auto mt-3 max-w-xl text-texto-suave">
          Cada día Sibila esconde una carta del tarot. Tienes 6 intentos para descubrirla con sus pistas. Cuando la encuentres, te
          dice su mensaje para tu día.
        </p>
      </header>
      <CaminoDelLoco />
    </div>
  );
}
