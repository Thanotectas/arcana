import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { BUCKET_FOTOS } from "@/lib/en-vivo";

/**
 * Audio de la Sala de Sibila servido desde Vercel: Supabase lo entrega una sola vez y el CDN de Vercel lo guarda un
 * día, así cientos de personas escuchando no gastan la transferencia del plan de Supabase.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ archivo: string }> }) {
  const { archivo } = await params;
  if (!/^\d+-(es|en|pt|fr|tr|ar|id|hi)\.mp3$/.test(archivo)) return NextResponse.json({ error: "archivo" }, { status: 404 });
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET_FOTOS).download(`en-vivo/sala/${archivo}`);
  if (error || !data) return NextResponse.json({ error: "no existe" }, { status: 404 });
  return new NextResponse(await data.arrayBuffer(), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable" },
  });
}
