import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getT } from "@/lib/i18n/servidor";
import { getUsuarioOpcional } from "@/lib/dal";
import { catalogoConTextos, GRUPOS_CATALOGO, type GrupoCatalogo } from "@/lib/catalogo";
import { IconoCatalogo } from "@/components/IconoCatalogo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.explorar.titulo, description: t.explorar.intro };
}

/** Todos los productos de Arcana, por grupo, con su descripción y su costo. Pública. */
export default async function PaginaExplorar() {
  const [t, usuario] = await Promise.all([getT(), getUsuarioOpcional()]);
  const items = catalogoConTextos(t, { conCuenta: true });
  const grupos = t.nav.grupos as Record<GrupoCatalogo, string>;
  const descripciones = t.explorar.grupos as Record<GrupoCatalogo, string>;
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.explorar.seccion}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{t.explorar.titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{t.explorar.intro}</p>
      </div>
      {GRUPOS_CATALOGO.map((g) => (
        <section key={g}>
          <h2 className="font-display text-3xl">{grupos[g]}</h2>
          <p className="mt-1 text-sm text-texto-suave">{descripciones[g]}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.filter((i) => i.grupo === g).map((i) => (
              <Link key={i.href} href={usuario || !i.requiereCuenta ? i.href : "/registro"} className="tarjeta tarjeta-modulo group flex flex-col p-5 transition hover:-translate-y-1 hover:border-oro/40">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-oro/10 p-2 text-oro"><IconoCatalogo clave={i.clave} className="h-5 w-5" /></span>
                  <span className="text-xs text-texto-suave">{i.costoTexto}</span>
                </div>
                <h3 className="font-display mt-3 text-2xl">{i.nombre}</h3>
                <p className="mt-1 flex-1 text-sm text-texto-suave">{i.descripcion}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm text-oro-suave">
                  {t.explorar.abrir} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
      {!usuario && (
        <section className="tarjeta border-oro/40 bg-oro/5 p-8 text-center">
          <h2 className="font-display text-3xl">{t.explorar.ctaTitulo}</h2>
          <p className="mt-2 text-texto-suave">{t.explorar.ctaTexto}</p>
          <Link href="/registro" className="boton boton-primario mt-5">{t.comun.crearCuenta}</Link>
        </section>
      )}
    </div>
  );
}
