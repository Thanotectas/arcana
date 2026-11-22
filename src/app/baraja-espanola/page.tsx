import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { PaginaOraculo } from "@/components/PaginaOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { alternates: alternativas("/baraja-espanola", await getIdioma()), title: t.baraja.titulo, description: t.baraja.intro };
}

export default function PaginaBaraja() {
  return <PaginaOraculo tipo="baraja_espanola" />;
}
