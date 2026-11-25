import { NextResponse, type NextRequest } from "next/server";
import { confirmarOrdenPaypal } from "@/lib/pagos/paypal";

/**
 * PayPal vuelve aquí tras aprobar el pago (return_url). Capturamos y
 * acreditamos de inmediato y mostramos la página de retorno de siempre.
 * Es seguro llamarla varias veces: confirmarOrdenPaypal consulta PayPal y
 * acredita una sola vez.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") ?? "";
  if (/^[A-Za-z0-9_-]{6,80}$/.test(ref)) await confirmarOrdenPaypal(ref);
  return NextResponse.redirect(new URL(`/creditos/retorno?ref=${encodeURIComponent(ref)}`, request.nextUrl.origin));
}
