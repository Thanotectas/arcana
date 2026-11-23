import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { esIdioma, type Idioma } from "@/lib/i18n/idiomas";
import { carpetaVoz, narrarGuion, traducirGuion } from "@/lib/voz-sibila";

export const maxDuration = 300;

/** Compara el token sin filtrar su largo por el tiempo de respuesta. */
function tokenValido(recibido: string | null) {
  const esperado = (process.env.SIBILA_VOZ_TOKEN ?? "").trim();
  if (!esperado || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Voz de Sibila para otros asistentes (el que arma los videos): POST con «Authorization: Bearer <SIBILA_VOZ_TOKEN>» y
 * { "guion": "…en español…", "idiomas": ["es", "pt"], "nombre": "49 limpia" }. Devuelve, por idioma, el guion
 * traducido y la dirección del MP3. Sin SIBILA_VOZ_TOKEN en Vercel no responde.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!tokenValido(token)) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
  const cuerpo = (await request.json().catch(() => null)) as { guion?: string; idiomas?: string[]; nombre?: string } | null;
  const guion = String(cuerpo?.guion ?? "").trim();
  const idiomas = [...new Set((cuerpo?.idiomas ?? ["es"]).filter(esIdioma))].slice(0, 8) as Idioma[];
  if (guion.length < 10 || !idiomas.length) return NextResponse.json({ error: "falta_guion_o_idiomas" }, { status: 400 });
  const carpeta = carpetaVoz(String(cuerpo?.nombre ?? "video"));
  const resultados = await Promise.all(
    idiomas.map(async (idioma) => {
      try {
        const texto = await traducirGuion(guion, idioma);
        return { idioma, guion: texto, url: await narrarGuion(texto, idioma, carpeta) };
      } catch (e) {
        return { idioma, error: e instanceof Error ? e.message : String(e) };
      }
    }),
  );
  return NextResponse.json({ resultados });
}
