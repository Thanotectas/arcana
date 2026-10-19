import { NextResponse, type NextRequest } from "next/server";
import { sitio } from "@/lib/correo";
import { COOKIE_CODIGO, normalizarCodigo } from "@/lib/pagos/codigos";

/**
 * Enlace corto de un código de oferta (miarcana.com/c/SIBILA): guarda el
 * código en una cookie por un día y lleva a los créditos. Si la persona no ha
 * entrado, /creditos la manda a entrar y, al volver, el código sigue ahí.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ codigo: string }> }) {
  const codigo = normalizarCodigo((await params).codigo);
  const res = NextResponse.redirect(`${sitio()}/creditos${codigo ? `?codigo=${codigo}` : ""}`);
  if (codigo) res.cookies.set(COOKIE_CODIGO, codigo, { path: "/", maxAge: 86_400, sameSite: "lax", httpOnly: true, secure: true });
  return res;
}
