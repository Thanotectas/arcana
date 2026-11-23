import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { esIdioma, type Idioma } from "@/lib/i18n/idiomas";
import { carpetaVoz, narrarGuion, traducirGuion } from "@/lib/voz-sibila";
import { getUsuarioOpcional } from "@/lib/dal";
import { esAdmin } from "@/lib/admin";

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
 * Sesión de administrador (la misma cookie de /admin). Solo desde una página de miarcana.com: el navegador manda el
 * origen en todo POST, y uno de otro sitio no puede usar la cookie para gastar créditos de voz.
 */
async function adminDeLaPagina(request: NextRequest) {
  const origen = request.headers.get("origin");
  if (!origen || origen !== request.nextUrl.origin) return false;
  const usuario = await getUsuarioOpcional().catch(() => null);
  return esAdmin(usuario?.email);
}

/**
 * Voz de Sibila para otros asistentes (el que arma los videos): POST con «Authorization: Bearer <SIBILA_VOZ_TOKEN>» y
 * { "guion": "…en español…", "idiomas": ["es", "pt"], "nombre": "49 limpia" }. Devuelve, por idioma, el guion
 * traducido y la dirección del MP3. También acepta la sesión de administrador desde una pestaña de miarcana.com
 * (fetch con la cookie, sin clave).
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!tokenValido(token) && !(await adminDeLaPagina(request))) return NextResponse.json({ error: "no_autorizado" }, { status: 401 });
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
