import type { Metadata } from "next";
import { getT } from "@/lib/i18n/servidor";
import { PaginaFotoOraculo } from "@/components/PaginaFotoOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.huevo.titulo, description: t.huevo.intro };
}

export default function PaginaHuevo() {
  return <PaginaFotoOraculo tipo="huevo" />;
}
