import type { Metadata } from "next";
import { Migas } from "@/components/seo/BloquesSeo";
import { MisLigas } from "@/components/juego/Ligas";

export const metadata: Metadata = {
  title: "Ligas de amigos · El Camino del Loco",
  description: "Crea una liga privada con tu familia, tu oficina o tus amigas y compitan cada semana adivinando la carta escondida del tarot.",
  alternates: { canonical: "/juego/ligas" },
};

export default function PaginaLigas() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Migas
        items={[
          { nombre: "Inicio", href: "/" },
          { nombre: "El Camino del Loco", href: "/juego" },
          { nombre: "Ligas", href: "/juego/ligas" },
        ]}
      />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">El Camino del Loco</p>
        <h1 className="font-display text-4xl font-semibold">Ligas de amigos</h1>
        <p className="mx-auto mt-2 max-w-xl text-texto-suave">Tu propia tabla de la semana con tu gente: familia, oficina, amigas. Crea una liga, comparte el enlace y que gane quien mejor lea las pistas de Sibila.</p>
      </header>
      <MisLigas />
    </div>
  );
}
