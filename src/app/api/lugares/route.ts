import { NextResponse, type NextRequest } from "next/server";
import { buscarLugares } from "@/lib/astro/geocodificar";

/** Autocompletado de lugares de nacimiento. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const lugares = await buscarLugares(q);
  return NextResponse.json({ lugares });
}
