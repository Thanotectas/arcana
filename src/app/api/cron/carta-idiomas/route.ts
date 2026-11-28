import { publicaIdiomaEn } from "@/lib/redes/idioma-red";
import { cronAutorizado } from "@/lib/cron";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { instagramConfigurado, publicarReel } from "@/lib/redes/instagram";
import { facebookConfigurado, publicarVideoFacebook } from "@/lib/redes/facebook";
import { reelCartaDelDia } from "@/lib/redes/reel";
import { fechaBogota } from "@/lib/redes/carta-dia";
import { IDIOMAS_CARTA, textoCartaIdioma, textosReelIdioma, traducirCarta, type IdiomaCarta } from "@/lib/redes/carta-dia-idiomas";
import { publicarUnaVez, type Resultado } from "@/lib/redes/reservas";

// Dos reels (turco y árabe), cada uno con su voz: generar y que Meta los procese toma tiempo.
export const maxDuration = 300;

/**
 * Carta del día en turco y árabe (vercel.json, 06:00 UTC = 09:00 en Estambul y Riad): un reel aparte por idioma en
 * las mismas cuentas de Instagram y Facebook. Si algo falla no se publica la imagen en español: ese día se omite y
 * queda el error en publicaciones_redes. CARTA_IDIOMAS (p. ej. «tr» o «tr,ar») limita los idiomas; «0» lo apaga.
 */
export async function GET(request: Request) {
  const rechazo = cronAutorizado(request);
  if (rechazo) return rechazo;
  const config = (process.env.CARTA_IDIOMAS ?? "").trim();
  if (config === "0") return Response.json({ omitida: "apagada" });
  const idiomas = IDIOMAS_CARTA.filter((i) => !config || config.split(",").map((x) => x.trim()).includes(i));
  if (!instagramConfigurado() && !facebookConfigurado()) return Response.json({ error: "redes_sin_configurar" }, { status: 503 });

  const fecha = fechaBogota();
  const admin = getSupabaseAdmin();
  const resultados: Record<string, { instagram: Resultado; facebook: Resultado }> = {};

  for (const idioma of idiomas as IdiomaCarta[]) {
    const tipo = `carta_dia_${idioma}` as const;
    // La traducción y el reel se preparan una sola vez por idioma, y solo si alguna red los necesita.
    let preparado: Promise<{ url: string; traduccion: Awaited<ReturnType<typeof traducirCarta>> }> | null = null;
    const preparar = () =>
      (preparado ??= (async () => {
        const traduccion = await traducirCarta(fecha, idioma);
        const url = await reelCartaDelDia(admin, fecha, { textos: textosReelIdioma(fecha, idioma, traduccion) });
        return { url, traduccion };
      })());
    const instagram: Resultado = instagramConfigurado() && publicaIdiomaEn("instagram", idioma)
      ? await publicarUnaVez(admin, "instagram", tipo, fecha, async () => {
          const p = await preparar();
          return publicarReel(p.url, textoCartaIdioma(fecha, idioma, "instagram", p.traduccion));
        })
      : { omitida: "sin_configurar" };
    const facebook: Resultado = facebookConfigurado() && publicaIdiomaEn("facebook", idioma)
      ? await publicarUnaVez(admin, "facebook", tipo, fecha, async () => {
          const p = await preparar();
          return publicarVideoFacebook(p.url, textoCartaIdioma(fecha, idioma, "facebook", p.traduccion));
        })
      : { omitida: "sin_configurar" };
    resultados[idioma] = { instagram, facebook };
  }

  const fallo = Object.values(resultados).some((r) => "error" in r.instagram || "error" in r.facebook);
  return Response.json({ fecha, resultados }, { status: fallo ? 502 : 200 });
}
