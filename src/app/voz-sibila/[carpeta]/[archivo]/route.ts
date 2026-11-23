import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * miarcana.com/voz-sibila/<carpeta>/<idioma>.mp3: el audio de la voz de Sibila (bucket «redes», voz-sibila/) servido
 * por el sitio, con caché en el CDN de Vercel. Así las direcciones son de miarcana.com y no gastan la transferencia
 * de Supabase. «?v=…» cambia cuando se vuelve a narrar la misma carpeta e idioma.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ carpeta: string; archivo: string }> }) {
  const { carpeta, archivo } = await params;
  if (!/^[0-9a-z-]{1,80}$/.test(carpeta) || !/^(es|en|pt|fr|tr|ar|id|hi)\.mp3$/.test(archivo)) {
    return NextResponse.json({ error: "no_existe" }, { status: 404 });
  }
  const { data, error } = await getSupabaseAdmin().storage.from("redes").download(`voz-sibila/${carpeta}/${archivo}`);
  if (error || !data) return NextResponse.json({ error: "no_existe" }, { status: 404 });
  const descargar = request.nextUrl.searchParams.has("descargar");
  return new NextResponse(await data.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=300, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
      ...(descargar ? { "Content-Disposition": `attachment; filename="${carpeta}-${archivo}"` } : {}),
    },
  });
}
