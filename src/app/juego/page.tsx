import type { Metadata } from "next";
import Link from "next/link";
import { Migas } from "@/components/seo/BloquesSeo";
import { CaminoDelLoco } from "@/components/juego/CaminoDelLoco";
import { MAX_INTENTOS, fechaBogota, leerResultado, numeroDeJuego } from "@/lib/juego/carta-escondida";
import { getIdioma } from "@/lib/i18n/servidor";
import { traducir } from "@/lib/juego/textos";

type Busqueda = Promise<Record<string, string | string[] | undefined>>;
const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

const BASE: Metadata = {
  title: "El Camino del Loco: adivina la carta escondida de hoy",
  description: "Juego diario de tarot: Sibila esconde una de las 78 cartas y tienes 6 intentos para descubrirla con sus pistas. Comparte tu resultado, arma tu álbum y gana créditos con tu racha.",
  alternates: { canonical: "/juego" },
  openGraph: {
    title: "El Camino del Loco · La carta escondida de hoy",
    description: "¿Adivinas la carta del tarot que Sibila escondió hoy? 6 intentos.",
    images: [{ url: "/juego/og.jpg", width: 1200, height: 630 }],
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
  const idioma = await getIdioma();
  const t = (es: string) => traducir(idioma, es);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Migas items={[{ nombre: t("Inicio"), href: "/" }, { nombre: t("El Camino del Loco"), href: "/juego" }]} />
      <header className="text-center">
        <div className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-3xl sm:border sm:border-oro/30">
          {/* eslint-disable-next-line @next/next/no-img-element -- ilustración estática */}
          <img src="/juego/cabecera.webp" alt={t("El Loco y su perrito caminan por un sendero de cartas doradas hacia una estrella")} className="aspect-[2000/1091] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-noche via-noche/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-violeta-suave sm:text-sm">{t("Juego diario · gratis")}</p>
            <h1 className="font-display text-4xl font-semibold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] sm:text-5xl">{t("El Camino del Loco")}</h1>
          </div>
        </div>
        <p className="mx-auto mt-4 max-w-xl text-texto-suave">
          {t("Cada día Sibila esconde una carta del tarot. Tienes 6 intentos para descubrirla con sus pistas. Cuando la encuentres, te dice su mensaje para tu día.")}
        </p>
        <p className="mt-3 flex justify-center gap-4 text-sm">
          <Link href="/juego/album" className="text-oro-suave underline">
            {t("📖 Mi álbum")}
          </Link>
          <Link href="/juego/ranking" className="text-oro-suave underline">
            {t("🏆 Ranking")}
          </Link>
          <Link href="/juego/ligas" className="text-oro-suave underline">
            {t("👥 Ligas")}
          </Link>
        </p>
      </header>
      {/* key: al cambiar de día de práctica se vuelve a montar el juego con esa carta. */}
      <CaminoDelLoco key={diaPractica ?? "hoy"} clavePublica={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} diaPractica={diaPractica} reto={reto} />
    </div>
  );
}
