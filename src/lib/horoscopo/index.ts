import "server-only";
import { getSupabaseAdmin } from "../supabase/admin";
import { generarTexto } from "../ia";
import { SIGNOS, type Signo } from "../zodiaco";
import { IDIOMA_PREDETERMINADO, LOCALE_INTL, type Idioma } from "../i18n/idiomas";

/** Fecha de hoy en Bogotá (YYYY-MM-DD). */
export function fechaHoy(zona = "America/Bogota") {
  return new Intl.DateTimeFormat("en-CA", { timeZone: zona, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const enCurso = new Map<string, Promise<string>>();

/**
 * Horóscopo diario por signo, generado una sola vez por día y cacheado en la
 * tabla `horoscopos`. Es gratuito: sirve para atraer tráfico y registros.
 */
export async function horoscopoDelDia(signo: Signo, idioma: Idioma = IDIOMA_PREDETERMINADO, fecha = fechaHoy()): Promise<string> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("horoscopos")
    .select("contenido")
    .eq("signo", signo.id)
    .eq("fecha", fecha)
    .eq("idioma", idioma)
    .maybeSingle();
  if (data?.contenido) return data.contenido as string;

  const clave = `${signo.id}:${fecha}:${idioma}`;
  const pendiente = enCurso.get(clave);
  if (pendiente) return pendiente;

  const tarea = (async () => {
    const fechaLegible = new Date(fecha + "T12:00:00Z").toLocaleDateString(LOCALE_INTL[idioma], {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });
    const texto = await generarTexto(
      `Escribe el horóscopo de ${signo.nombre} para el ${fechaLegible}. ` +
        `Rasgos del signo: ${signo.rasgos.join(", ")}; elemento ${signo.elemento}; regente ${signo.regente}. ` +
        `Estructura: un párrafo general (60-80 palabras), luego ## Amor, ## Trabajo y dinero, ## Bienestar (40-60 palabras cada uno) y una línea final "Consejo del día:". Sin título general. Total: 220 a 300 palabras.`,
      "",
      { effort: "low", maxTokens: 900, idioma },
    );
    await admin
      .from("horoscopos")
      .upsert({ signo: signo.id, fecha, idioma, contenido: texto }, { onConflict: "signo,fecha,idioma" });
    return texto;
  })();

  enCurso.set(clave, tarea);
  try {
    return await tarea;
  } finally {
    enCurso.delete(clave);
  }
}

export { SIGNOS };
