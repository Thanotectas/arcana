import type { NextRequest } from "next/server";
import { ENLACES_CORTOS, redirigirConOrigen } from "@/lib/origen";

/** miarcana.com/wa[/ruta]: enlace para WhatsApp que recuerda por dónde llegó la persona. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ ruta?: string[] }> }) {
  return redirigirConOrigen(request, ENLACES_CORTOS.wa, (await params).ruta);
}
