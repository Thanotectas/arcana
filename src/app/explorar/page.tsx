import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import Link from "next/link";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { getUsuarioOpcional } from "@/lib/dal";
import { catalogoConTextos } from "@/lib/catalogo";
import { ExplorarCatalogo } from "@/components/ExplorarCatalogo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { alternates: alternativas("/explorar", await getIdioma()), title: t.explorar.titulo, description: t.explorar.intro };
}

/** La biblioteca de Arcana: buscar por lo que quieres, por práctica, por tradición o país; guía para novatos. Pública. */
export default async function PaginaExplorar() {
  const [t, usuario, idioma] = await Promise.all([getT(), getUsuarioOpcional(), getIdioma()]);
  const items = catalogoConTextos(t, { conCuenta: true, idioma });
  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.explorar.seccion}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{t.explorar.titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{t.explorar.intro}</p>
      </div>
      {idioma === "es" && (
        <Link href="/biblioteca" className="tarjeta flex items-center justify-between gap-4 border-violeta/40 p-5 transition hover:border-oro">
          <span>
            <span className="font-display block text-2xl">El Arcano de Sibila</span>
            <span className="text-sm text-texto-suave">La historia, los símbolos y la forma de practicar cada tradición del mundo.</span>
          </span>
          <span className="text-oro-suave">Entrar →</span>
        </Link>
      )}
      <ExplorarCatalogo
        idioma={idioma}
        abrir={t.explorar.abrir}
        items={items.map((i) => ({
          clave: i.clave,
          href: usuario || !i.requiereCuenta ? i.href : "/registro",
          nombre: i.nombre,
          descripcion: i.descripcion,
          costoTexto: i.costoTexto,
          gratis: i.costo === null || i.costo === 0,
          destacado: Boolean(i.destacadoEn?.includes(idioma)),
          deOtroMercado: Boolean(i.destacadoEn?.length && !i.destacadoEn.includes(idioma)),
        }))}
      />
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
