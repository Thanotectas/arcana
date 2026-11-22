import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { PaginaOraculo } from "@/components/PaginaOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { alternates: alternativas("/runas", await getIdioma()), title: t.runas.titulo, description: t.runas.intro };
}

export default function PaginaRunas() {
  return <PaginaOraculo tipo="runas" />;
}
