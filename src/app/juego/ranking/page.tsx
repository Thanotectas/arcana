import type { Metadata } from "next";
import Link from "next/link";
import { Migas } from "@/components/seo/BloquesSeo";
import { RankingSemanal } from "@/components/juego/Ranking";
import { getIdioma } from "@/lib/i18n/servidor";
import { traducir } from "@/lib/juego/textos";

export const metadata: Metadata = {
  title: "Ranking de la semana · El Camino del Loco",
  description: "Quién encontró la carta escondida en menos intentos esta semana. Elige tu apodo y entra a la tabla.",
  alternates: { canonical: "/juego/ranking" },
};

export default async function PaginaRanking() {
  const idioma = await getIdioma();
  const t = (es: string) => traducir(idioma, es);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Migas
        items={[
          { nombre: t("Inicio"), href: "/" },
          { nombre: t("El Camino del Loco"), href: "/juego" },
          { nombre: "Ranking", href: "/juego/ranking" },
        ]}
      />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t("El Camino del Loco")}</p>
        <h1 className="font-display text-4xl font-semibold">{t("Ranking de la semana")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-texto-suave">{t("Cada día suma: juega la carta escondida, supera el reto maestro y sube en la tabla. Se reinicia cada lunes.")}</p>
      </header>
      <RankingSemanal />
      <p className="text-center">
        <Link href="/juego" className="boton boton-primario inline-flex">
          {t("Jugar la carta de hoy")}
        </Link>
      </p>
    </div>
  );
}
