import { NextResponse, type NextRequest } from "next/server";
import { buscarLugares } from "@/lib/astro/geocodificar";
import { createClient } from "@/lib/supabase/server";

/** Autocompletado de lugares de nacimiento (solo con sesión; evita que terceros gasten la cuota). */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ lugares: [] }, { status: 401 });
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 64);
  if (q.length < 2) return NextResponse.json({ lugares: [] });
  const lugares = await buscarLugares(q);
  return NextResponse.json({ lugares }, { headers: { "Cache-Control": "private, max-age=3600" } });
}
