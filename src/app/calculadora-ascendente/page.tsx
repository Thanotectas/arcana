import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma } from "@/lib/i18n/servidor";
import { SIGNOS } from "@/lib/zodiaco";
import { SIGNOS_IDIOMA } from "@/lib/juego/textos";
import { NAKSHATRAS, NAKSHATRAS_HI, RASHIS } from "@/lib/herramientas/sideral";
import { TEXTOS_ASCENDENTE, type IdSigno } from "@/lib/herramientas/ascendente-textos";
import { CalculadoraAscendente } from "@/components/herramientas/CalculadoraAscendente";
import { ComoFunciona, CtaHerramienta } from "@/components/herramientas/CtaHerramienta";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const tx = TEXTOS_ASCENDENTE[idioma];
  return {
    title: tx.meta.titulo,
    description: tx.meta.descripcion,
    alternates: alternativas("/calculadora-ascendente", idioma),
    openGraph: { title: tx.meta.titulo, description: tx.meta.descripcion, type: "website", siteName: "Arcana" },
  };
}

export default async function PaginaCalculadoraAscendente() {
  const idioma = await getIdioma();
  const tx = TEXTOS_ASCENDENTE[idioma];
  const nombresSigno = Object.fromEntries(SIGNOS.map((s) => [s.id, idioma === "es" ? s.nombre : SIGNOS_IDIOMA[idioma][s.id]])) as Record<IdSigno, string>;
  // Rashi: en hindi el nombre de siempre (मेष, वृषभ…); en los demás idiomas, el sánscrito con el signo al lado.
  const rashis = Object.fromEntries(SIGNOS.map((s, i) => [s.id, idioma === "hi" ? nombresSigno[s.id as IdSigno] : `${RASHIS[i]} · ${nombresSigno[s.id as IdSigno]}`])) as Record<IdSigno, string>;
  const enlaces = [{ href: "/carta-astral", texto: tx.cta.boton }];
  if (tx.cta.botonKundli) enlaces.unshift({ href: "/kundli", texto: tx.cta.botonKundli });

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <PortadaProducto clave="ascendente" />
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{tx.seccion}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{tx.titulo}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-texto-suave">{tx.intro}</p>
      </header>
      <div className="tarjeta p-5 sm:p-6">
        <CalculadoraAscendente
          textos={{ formulario: tx.formulario, resultado: tx.resultado, vedica: tx.vedica, ascendentes: tx.ascendentes, lunas: tx.lunas }}
          idioma={idioma}
          nombresSigno={nombresSigno}
          rashis={rashis}
          nakshatras={idioma === "hi" ? NAKSHATRAS_HI : NAKSHATRAS}
        />
      </div>
      <ComoFunciona titulo={tx.comoFunciona.titulo} parrafos={tx.comoFunciona.parrafos} />
      <CtaHerramienta titulo={tx.cta.titulo} texto={tx.cta.texto} enlaces={enlaces} />
    </div>
  );
}
