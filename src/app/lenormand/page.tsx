import type { Metadata } from "next";
import { getT } from "@/lib/i18n/servidor";
import { PaginaOraculo } from "@/components/PaginaOraculo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.lenormand.titulo, description: t.lenormand.intro };
}

export default function PaginaLenormand() {
  return <PaginaOraculo tipo="lenormand" />;
}
