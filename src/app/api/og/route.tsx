import type { NextRequest } from "next/server";
import { imagenOG } from "@/lib/marca/og";

/**
 * Vista previa dinámica: /api/og?t=Título&s=Subtítulo
 * Se usa en enlaces personalizados (por ejemplo, invitaciones).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const limpiar = (v: string | null, max: number) =>
    (v ?? "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, max);
  const titulo = limpiar(q.get("t"), 90) || "Arcana";
  const subtitulo = limpiar(q.get("s"), 160) || undefined;
  const respuesta = await imagenOG({ titulo, subtitulo });
  respuesta.headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
  return respuesta;
}
