import type { Metadata } from "next";
import { Migas } from "@/components/seo/BloquesSeo";
import { LigaDetalle } from "@/components/juego/Ligas";
import { datosLiga, normalizarCodigoLiga } from "@/lib/juego/ligas";

type Parametros = { params: Promise<{ codigo: string }> };

export async function generateMetadata({ params }: Parametros): Promise<Metadata> {
  const liga = await datosLiga((await params).codigo, null).catch(() => null);
  const titulo = liga ? `Únete a «${liga.nombre}» · El Camino del Loco` : "Liga de El Camino del Loco";
  return {
    title: titulo,
    description: "Te invitaron a una liga del juego diario de tarot de Arcana: adivina la carta escondida y compite en la tabla de la semana.",
    robots: { index: false },
    openGraph: { title: titulo, description: "¿Adivinas la carta de hoy? Únete a la liga y compitamos esta semana.", images: [{ url: "/juego/og.jpg", width: 1200, height: 630 }] },
  };
}

export default async function PaginaLiga({ params }: Parametros) {
  const codigo = normalizarCodigoLiga((await params).codigo);
  const liga = await datosLiga(codigo, null).catch(() => null);
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
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Liga de El Camino del Loco</p>
        <h1 className="font-display text-4xl font-semibold">{liga?.nombre ?? "Liga"}</h1>
      </header>
      <LigaDetalle codigo={codigo} />
    </div>
  );
}
