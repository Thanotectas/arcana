import type { Metadata } from "next";
import Link from "next/link";
import { Migas } from "@/components/seo/BloquesSeo";
import { CaminoDelLoco } from "@/components/juego/CaminoDelLoco";
import { MAX_INTENTOS, fechaBogota, leerResultado, numeroDeJuego } from "@/lib/juego/carta-escondida";

type Busqueda = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const BASE: Metadata = {
  title: "El Camino del Loco: adivina la carta escondida de hoy",
  description: "Juego diario de tarot: Sibila esconde una de las 78 cartas y tienes 6 intentos para descubrirla con sus pistas. Comparte tu resultado, arma tu álbum y gana créditos con tu racha.",
  alternates: { canonical: "/juego" },
  openGraph: {
    title: "El Camino del Loco · La carta escondida de hoy",
    description: "¿Adivinas la carta del tarot que Sibila escondió hoy? 6 intentos.",
  },
};

/** Si llega con un resultado compartido (?n=&f=&ra=), la vista previa del enlace muestra esos cuadritos. */
export async function generateMetadata({ searchParams }: { searchParams: Busqueda }): Promise<Metadata> {
  const q = await searchParams;
  const r = leerResultado(uno(q.n), uno(q.f), uno(q.ra));
  if (!r) return BASE;
  const titulo = r.gano ? `La encontré en ${r.filas.length}/${MAX_INTENTOS} · ¿Y tú?` : "Hoy se me escondió · ¿Tú la encuentras?";
  const imagen = `/api/juego/imagen?n=${r.numero}&f=${uno(q.f)}&ra=${r.racha}&formato=og`;
  return {
    ...BASE,
    openGraph: { title: `${titulo} · El Camino del Loco`, description: "Sibila escondió una carta del tarot. Tienes 6 intentos para descubrirla.", images: [{ url: imagen, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", images: [imagen] },
  };
}

export default async function PaginaJuego({ searchParams }: { searchParams: Busqueda }) {
  const q = await searchParams;
  const numeroHoy = numeroDeJuego(fechaBogota());
  const dia = Number(uno(q.dia));
  const diaPractica = Number.isInteger(dia) && dia >= 1 && dia < numeroHoy ? dia : null;
  const reto = leerResultado(uno(q.n), uno(q.f), uno(q.ra));
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
        <Link href="/juego/album" className="mt-3 inline-block text-sm text-oro-suave underline">
          Ver mi álbum de cartas
        </Link>
      </header>
      {/* key: al cambiar de día de práctica se vuelve a montar el juego con esa carta. */}
      <CaminoDelLoco key={diaPractica ?? "hoy"} clavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} diaPractica={diaPractica} reto={reto} />
    </div>
  );
}
