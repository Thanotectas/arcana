import "server-only";
import { generarTexto } from "@/lib/ia";
import { IDIOMA_PARA_IA, type Idioma } from "@/lib/i18n/idiomas";
import { sintetizar, vozConfigurada } from "@/lib/redes/voz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/correo";

/**
 * Voz de Sibila en cualquier idioma para los videos: el guion se escribe una vez en español, se traduce con su tono
 * (respetando las pausas «…») y se narra con la voz de ElevenLabs configurada en Vercel. Los audios quedan en el
 * bucket «redes» (voz-sibila/<carpeta>/<idioma>.mp3) y se sirven por miarcana.com/voz-sibila/<carpeta>/<idioma>.mp3.
 */

/** Cómo se dice miarcana.com en cada idioma (la voz lee mal la dirección escrita). */
const DIRECCION_DICHA: Record<Idioma, string> = {
  es: "mi arcana punto com",
  en: "my arcana dot com",
  pt: "mi arcana ponto com",
  fr: "mi arcana point com",
  tr: "miarcana nokta kom",
  ar: "ماي أركانا دوت كوم",
  id: "mi arcana titik kom",
  hi: "माई अर्काना डॉट कॉम",
};

/** El guion en el idioma pedido; en español se devuelve tal cual (solo con la dirección dicha). */
export async function traducirGuion(guion: string, idioma: Idioma): Promise<string> {
  const limpio = guion.trim().slice(0, 4000);
  if (idioma === "es") return limpio.replace(/miarcana\.com(\/[\w-]+)*/gi, DIRECCION_DICHA.es);
  const sistema =
    `Eres la traductora de Sibila, la lectora de Arcana. Traduce al ${IDIOMA_PARA_IA[idioma]} este guion que Sibila va a decir en voz alta en un video. ` +
    `Conserva el tono cálido, cercano y místico, y que suene natural dicho en voz alta en ese idioma (no literal). ` +
    `Conserva cada «…» exactamente en el mismo lugar (son pausas donde cambia la imagen) y los mismos saltos de línea, una frase por línea como en el original. ` +
    `Los nombres de prácticas, cartas, signos y lugares van con su nombre tradicional en ese idioma. ` +
    `Si aparece la dirección miarcana.com o «mi arcana punto com», escríbela como se pronuncia: «${DIRECCION_DICHA[idioma]}». ` +
    `No agregues ni quites nada. Responde solo con el guion traducido, sin comillas ni comentarios.`;
  const limpiar = (t: string) => t.replace(/^```\w*\n?|```$/g, "").replace(/[#*_`]/g, "").trim();
  let salida = limpiar(await generarTexto(limpio, sistema, { effort: "low", maxTokens: 2000, idioma, nivel: "economico" }));
  // Una traducción mucho más larga o más corta que el guion trae algo de más (el original repetido, notas) o le falta:
  // se pide otra vez, más estricta.
  const proporcion = salida.length / limpio.length;
  if (proporcion > 1.5 || proporcion < 0.5) {
    salida = limpiar(await generarTexto(limpio, `${sistema} IMPORTANTE: tu respuesta anterior tenía ${proporcion > 1 ? "texto de más" : "texto de menos"}. Devuelve exactamente una traducción, del mismo largo aproximado que el original.`, { effort: "low", maxTokens: 2000, idioma, nivel: "economico" }));
  }
  return salida;
}

/** Carpeta segura para guardar los audios de un video. */
export function carpetaVoz(nombre: string) {
  const base = nombre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  return `${new Date().toISOString().slice(0, 10)}-${base || "video"}`;
}

/** Narra el guion con la voz de Sibila y devuelve la dirección pública del MP3. */
export async function narrarGuion(guion: string, idioma: Idioma, carpeta: string): Promise<string> {
  if (!vozConfigurada()) throw new Error("Falta configurar ElevenLabs (ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID).");
  let audio = await sintetizar(guion);
  // Un MP3 de 128 kbps lleva ~1 KB por carácter narrado; si pesa mucho más, la voz se alargó (se repitió o divagó):
  // se narra otra vez y se queda el más corto.
  if (audio.length > guion.length * 1600) {
    const otro = await sintetizar(guion);
    if (otro.length < audio.length) audio = otro;
  }
  const ruta = `voz-sibila/${carpeta}/${idioma}.mp3`;
  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from("redes").upload(ruta, audio, { contentType: "audio/mpeg", upsert: true, cacheControl: "3600" });
  if (error) throw new Error(`No se guardó el audio: ${error.message}`);
  // Se sirve por miarcana.com/voz-sibila/… (puente con caché), no por la dirección de Supabase.
  return `${sitio()}/voz-sibila/${carpeta}/${idioma}.mp3?v=${Date.now()}`;
}
