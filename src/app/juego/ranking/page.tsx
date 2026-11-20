import type { Metadata } from "next";
import Link from "next/link";
import { Migas } from "@/components/seo/BloquesSeo";
import { RankingSemanal } from "@/components/juego/Ranking";

export const metadata: Metadata = {
  title: "Ranking de la semana · El Camino del Loco",
  description: "Quién encontró la carta escondida en menos intentos esta semana. Elige tu apodo y entra a la tabla.",
  alternates: { canonical: "/juego/ranking" },
};

export default function PaginaRanking() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Migas
        items={[
          { nombre: "Inicio", href: "/" },
          { nombre: "El Camino del Loco", href: "/juego" },
          { nombre: "Ranking", href: "/juego/ranking" },
        ]}
      />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">El Camino del Loco</p>
        <h1 className="font-display text-4xl font-semibold">Ranking de la semana</h1>
        <p className="mx-auto mt-2 max-w-xl text-texto-suave">Cada día suma: juega la carta escondida, supera el reto maestro y sube en la tabla. Se reinicia cada lunes.</p>
      </header>
      <RankingSemanal />
      <p className="text-center">
        <Link href="/juego" className="boton boton-primario inline-flex">
          Jugar la carta de hoy
        </Link>
      </p>
    </div>
  );
}
