import type { Metadata } from "next";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas, rutaIdioma } from "@/lib/i18n/rutas";
import { catalogoConTextos } from "@/lib/catalogo";
import { TEXTOS_SALA } from "@/lib/en-vivo-sala-textos";
import { SalaEnVivo } from "@/components/SalaEnVivo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const t = TEXTOS_SALA[idioma];
  return { title: t.titulo, description: t.bajada, alternates: alternativas("/en-vivo", idioma) };
}

/** Sala de Sibila: el directo en la página, con la voz de Sibila en el idioma de cada persona. */
export default async function PaginaSala() {
  const [idioma, t] = await Promise.all([getIdioma(), getT()]);
  const productos = catalogoConTextos(t, { conCuenta: false, idioma })
    .filter((p) => p.clave !== "hoy")
    .slice(0, 8)
    .map((p) => ({ clave: p.clave, nombre: p.nombre, descripcion: p.descripcion, href: rutaIdioma(p.href, idioma), costoTexto: p.costoTexto }));
  return <SalaEnVivo idiomaInicial={idioma} productos={productos} verTodo={rutaIdioma("/explorar", idioma)} />;
}
