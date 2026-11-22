import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { PaginaFotoOraculo } from "@/components/PaginaFotoOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { alternates: alternativas("/huevo", await getIdioma()), title: t.huevo.titulo, description: t.huevo.intro };
}

export default function PaginaHuevo() {
  return <PaginaFotoOraculo tipo="huevo" />;
}
