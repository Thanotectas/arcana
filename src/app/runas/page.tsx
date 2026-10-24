import type { Metadata } from "next";
import { getT } from "@/lib/i18n/servidor";
import { PaginaOraculo } from "@/components/PaginaOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.runas.titulo, description: t.runas.intro };
}

export default function PaginaRunas() {
  return <PaginaOraculo tipo="runas" />;
}
