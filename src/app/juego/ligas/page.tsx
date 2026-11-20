import type { Metadata } from "next";
import { Migas } from "@/components/seo/BloquesSeo";
import { MisLigas } from "@/components/juego/Ligas";
import { getIdioma } from "@/lib/i18n/servidor";
import { traducir } from "@/lib/juego/textos";

export const metadata: Metadata = {
  title: "Ligas de amigos · El Camino del Loco",
  description: "Crea una liga privada con tu familia, tu oficina o tus amigas y compitan cada semana adivinando la carta escondida del tarot.",
  alternates: { canonical: "/juego/ligas" },
};

export default async function PaginaLigas() {
  const idioma = await getIdioma();
  const t = (es: string) => traducir(idioma, es);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Migas
        items={[
          { nombre: t("Inicio"), href: "/" },
          { nombre: t("El Camino del Loco"), href: "/juego" },
          { nombre: t("Ligas"), href: "/juego/ligas" },
        ]}
      />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t("El Camino del Loco")}</p>
        <h1 className="font-display text-4xl font-semibold">{t("Ligas de amigos")}</h1>
        <p className="mx-auto mt-2 max-w-xl text-texto-suave">
          {t("Tu propia tabla de la semana con tu gente: familia, oficina, amigas. Crea una liga, comparte el enlace y que gane quien mejor lea las pistas de Sibila.")}
        </p>
      </header>
      <MisLigas />
    </div>
  );
}
