import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { Migas } from "@/components/seo/BloquesSeo";
import { IconoCatalogo } from "@/components/IconoCatalogo";
import type { IconoCatalogo as ClaveIcono } from "@/lib/catalogo";
import type { Idioma } from "@/lib/i18n/idiomas";
import { fichaEn, fichasDeIdioma } from "@/lib/biblioteca/fichas";

/** Lo que se ve cuando todavía no hay fichas en el idioma de quien entra. */
const PRONTO: Record<Idioma, string> = {
  es: "Muy pronto, nuevas tradiciones.",
  en: "New traditions are coming very soon in English.",
  pt: "Em breve, novas tradições em português.",
  fr: "Très bientôt, de nouvelles traditions en français.",
  tr: "Çok yakında Türkçe yeni gelenekler.",
  ar: "قريبًا جدًا، تقاليد جديدة بالعربية.",
  id: "Segera hadir, tradisi baru dalam bahasa Indonesia.",
  hi: "जल्द ही, हिंदी में नई परंपराएँ।",
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "El Arcano de Sibila: saberes del mundo",
    description: "La historia, los símbolos y la forma de practicar cada tradición: la lectura del café, el tarot, la limpia con huevo, el kundli, las runas y muchas más.",
    alternates: alternativas("/biblioteca", await getIdioma()),
  };
}

/** Portada del Arcano de Sibila: una ficha por práctica, la más reciente primero. */
export default async function PaginaBiblioteca() {
  const idioma = await getIdioma();
  // Cada quien ve solo las fichas de su idioma (no los videos de todos los idiomas).
  const entradas = fichasDeIdioma(idioma);
  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <Migas items={[{ nombre: "Inicio", href: "/" }, { nombre: "El Arcano de Sibila", href: "/biblioteca" }]} />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Tradiciones del mundo</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">El Arcano de Sibila</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">
          Cada práctica tiene una historia, un lenguaje y una forma de vivirse. Aquí guardamos la de cada una: de dónde viene,
          cómo se hace y qué dicen sus símbolos. Una nueva tradición cada día.
        </p>
      </header>
      {entradas.length === 0 && <p className="text-center text-texto-suave">{PRONTO[idioma]}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {entradas.map((e) => {
          const f = fichaEn(e, idioma);
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
                Leer <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 rtl:rotate-180" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
