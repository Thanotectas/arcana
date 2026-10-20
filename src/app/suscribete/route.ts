import { NextResponse } from "next/server";
import { REDES } from "@/lib/marca/redes";

/**
 * miarcana.com/suscribete: abre el canal de YouTube con el aviso de
 * suscripción ya desplegado (fácil de decir en el directo y de poner en
 * estados y mensajes).
 */
export function GET() {
  const youtube = REDES.find((r) => r.id === "youtube")?.url ?? "https://www.youtube.com/@miarcana";
  return NextResponse.redirect(`${youtube}?sub_confirmation=1`, 307);
}
