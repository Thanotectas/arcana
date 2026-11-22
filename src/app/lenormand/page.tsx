import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { PaginaOraculo } from "@/components/PaginaOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { alternates: alternativas("/lenormand", await getIdioma()), title: t.lenormand.titulo, description: t.lenormand.intro };
}

export default function PaginaLenormand() {
  return <PaginaOraculo tipo="lenormand" />;
}
