import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { Migas } from "@/components/seo/BloquesSeo";
import { IconoCatalogo } from "@/components/IconoCatalogo";
import type { IconoCatalogo as ClaveIcono } from "@/lib/catalogo";
import { after } from "next/server";
import { BIBLIOTECA, fichaEn } from "@/lib/biblioteca/fichas";
import { traduccionesGuardadas, traducirFaltantes } from "@/lib/biblioteca/traducciones";
import { TEXTOS_ARCANO } from "@/lib/biblioteca/textos";

export const maxDuration = 300;

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = TEXTOS_ARCANO[idioma];
  return { title: `${t.nombre}: ${t.antetitulo.toLowerCase()}`, description: t.descripcion, alternates: alternativas("/biblioteca", idioma) };
}

/** Portada del Arcano de Sibila: una ficha por práctica, la más reciente primero. */
export default async function PaginaBiblioteca() {
  const idioma = await getIdioma();
  const t = TEXTOS_ARCANO[idioma];
  // Todas las fichas, traducidas a su idioma (los videos de cada ficha se ven solo en el idioma de quien entra).
  const entradas = [...BIBLIOTECA].sort((a, b) => b.publicada.localeCompare(a.publicada));
  const traducidas = await traduccionesGuardadas(idioma, entradas);
  const faltan = idioma === "es" ? [] : entradas.filter((e) => !e.textos[idioma] && !traducidas.has(e.slug));
  if (faltan.length) after(() => traducirFaltantes(idioma, faltan));
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Migas items={[{ nombre: t.inicio, href: "/" }, { nombre: t.nombre, href: "/biblioteca" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.antetitulo}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{t.nombre}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{t.intro}</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {entradas.map((e) => {
          const f = traducidas.get(e.slug) ?? fichaEn(e, idioma);
          return (
            <Link key={e.slug} href={`/biblioteca/${e.slug}`} className="tarjeta group flex flex-col p-5 transition hover:-translate-y-1 hover:border-oro/40">
              {e.portada ? (
                // eslint-disable-next-line @next/next/no-img-element -- portada estática del video
                <img src={e.portada} alt="" loading="lazy" className="mb-1 aspect-[4/5] w-full rounded-xl border border-borde object-cover" />
              ) : (
                <span className="w-fit rounded-full bg-oro/10 p-2 text-oro"><IconoCatalogo clave={e.clave as ClaveIcono} className="h-5 w-5" /></span>
              )}
              <h2 className="font-display mt-3 text-2xl">{f.titulo}</h2>
              <p className="mt-1 text-xs text-violeta-suave">{f.nombres}</p>
              <p className="mt-2 flex-1 text-sm text-texto-suave">{f.descripcion}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-oro-suave">
                {t.leer} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
