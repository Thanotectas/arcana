import { NextResponse, type NextRequest } from "next/server";
import { guardarInvitacion } from "@/lib/invitaciones";

/** Enlace de invitación: guarda el código y lleva al registro. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const { codigo } = await params;
  const limpio = codigo.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (limpio.length >= 4) await guardarInvitacion(limpio);
  const url = request.nextUrl.clone();
  url.pathname = "/registro";
  url.search = limpio ? `?inv=${limpio}` : "";
  return NextResponse.redirect(url);
}
