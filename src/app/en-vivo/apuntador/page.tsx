import type { Metadata } from "next";
import { claveValida } from "@/lib/en-vivo";
import { Apuntador } from "@/components/ApuntadorEnVivo";

export const metadata: Metadata = { title: "Apuntador del directo", robots: { index: false } };

/**
 * Apuntador del presentador: muestra en grande lo que Sibila escribe en el escenario (la lectura completa y sus
 * frases) para leerlo en voz alta con &voz=presentador. Solo con la clave de /admin/en-vivo.
 */
export default async function PaginaApuntador({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams;
  if (!claveValida(clave ?? null)) return <p className="p-10 text-center text-texto-suave">Falta la clave: copia la dirección completa desde /admin/en-vivo.</p>;
  return <Apuntador clave={clave as string} />;
}
