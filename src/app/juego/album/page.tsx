import type { Metadata } from "next";
import { Migas } from "@/components/seo/BloquesSeo";
import { AlbumCamino } from "@/components/juego/AlbumCamino";

export const metadata: Metadata = {
  title: "Mi álbum de cartas · El Camino del Loco",
  description: "Las 78 cartas del tarot que vas descubriendo en El Camino del Loco, el juego diario de Arcana, y el camino de los 22 Arcanos Mayores.",
  alternates: { canonical: "/juego/album" },
};

export default function PaginaAlbum() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "El Camino del Loco", href: "/juego" }, { nombre: "Mi álbum", href: "/juego/album" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">El Camino del Loco</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Mi álbum de cartas</h1>
        <p className="mx-auto mt-3 max-w-xl text-texto-suave">Cada carta que descubres en el juego se ilumina aquí. Recorre el camino de los 22 Arcanos Mayores y completa las 78.</p>
      </header>
      <AlbumCamino />
    </div>
  );
}
