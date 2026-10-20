import type { NextRequest } from "next/server";
import { ENLACES_CORTOS, redirigirConOrigen } from "@/lib/origen";

/** miarcana.com/fb[/ruta]: enlace para Facebook que recuerda por dónde llegó la persona. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ ruta?: string[] }> }) {
  return redirigirConOrigen(request, ENLACES_CORTOS.fb, (await params).ruta);
}
