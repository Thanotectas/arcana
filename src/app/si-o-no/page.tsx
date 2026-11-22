import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma } from "@/lib/i18n/servidor";
import { MAZO } from "@/lib/tarot/deck";
import { nombreCarta } from "@/lib/juego/cartas-idiomas";
import { imagenCarta, rotuloCarta } from "@/components/CartaVisual";
import { MAYORES_SI_NO, RESPUESTA_CARTA, TEXTOS_SI_O_NO, type IdMayor } from "@/lib/herramientas/si-o-no-textos";
import { SiONo, type CartaSiNo } from "@/components/herramientas/SiONo";
import { ComoFunciona, CtaHerramienta } from "@/components/herramientas/CtaHerramienta";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const tx = TEXTOS_SI_O_NO[idioma];
  return {
    title: tx.meta.titulo,
    description: tx.meta.descripcion,
    alternates: alternativas("/si-o-no", idioma),
    openGraph: { title: tx.meta.titulo, description: tx.meta.descripcion, type: "website", images: [{ url: "/og/si-o-no.jpg", width: 1200, height: 630 }], siteName: "Arcana" },
  };
}

export default async function PaginaSiONo() {
  const idioma = await getIdioma();
  const { explicaciones, comoFunciona, cta, ...textos } = TEXTOS_SI_O_NO[idioma];
  const ids = new Set<string>(MAYORES_SI_NO);
  // Solo los datos de las 22 cartas en el idioma de la página: el componente no carga el mazo entero.
  const cartas: CartaSiNo[] = MAZO.filter((c) => c.arcano === "mayor" && ids.has(c.id)).map((c) => ({
    id: c.id,
    nombre: nombreCarta(c, idioma),
    etiqueta: rotuloCarta(c).etiqueta,
    imagen: imagenCarta(c, "rider"),
    respuesta: RESPUESTA_CARTA[c.id as IdMayor],
    explicacion: explicaciones[c.id as IdMayor],
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <PortadaProducto clave="si-o-no" />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{textos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{textos.titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{textos.intro}</p>
      </header>
      <div className="tarjeta p-5 sm:p-6">
        <SiONo textos={textos} cartas={cartas} />
      </div>
      <ComoFunciona titulo={comoFunciona.titulo} parrafos={comoFunciona.parrafos} />
      <CtaHerramienta titulo={cta.titulo} texto={cta.texto} enlaces={[{ href: "/tarot", texto: cta.boton }]} />
    </div>
  );
}
