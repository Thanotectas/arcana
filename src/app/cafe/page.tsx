import type { Metadata } from "next";
import { getT } from "@/lib/i18n/servidor";
import { PaginaFotoOraculo } from "@/components/PaginaFotoOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.cafe.titulo, description: t.cafe.intro };
}

export default function PaginaCafe() {
  return <PaginaFotoOraculo tipo="cafe" />;
}
