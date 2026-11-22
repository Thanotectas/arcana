import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma } from "@/lib/i18n/servidor";
import { TEXTOS_NOMBRES } from "@/lib/herramientas/nombres-textos";
import { CompatibilidadNombres } from "@/components/herramientas/CompatibilidadNombres";
import { ComoFunciona, CtaHerramienta } from "@/components/herramientas/CtaHerramienta";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const tx = TEXTOS_NOMBRES[idioma];
  return {
    title: tx.meta.titulo,
    description: tx.meta.descripcion,
    alternates: alternativas("/compatibilidad-nombres", idioma),
    openGraph: { title: tx.meta.titulo, description: tx.meta.descripcion, type: "website", siteName: "Arcana" },
  };
}

export default async function PaginaCompatibilidadNombres() {
  const idioma = await getIdioma();
  const { comoFunciona, cta, ...textos } = TEXTOS_NOMBRES[idioma];
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PortadaProducto clave="nombres" />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{textos.titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{textos.intro}</p>
      </header>
      <div className="tarjeta p-5 sm:p-6">
        <CompatibilidadNombres textos={textos} />
      </div>
      <ComoFunciona titulo={comoFunciona.titulo} parrafos={comoFunciona.parrafos} />
      <CtaHerramienta titulo={cta.titulo} texto={cta.texto} enlaces={[{ href: "/compatibilidad", texto: cta.boton }]} />
    </div>
  );
}
