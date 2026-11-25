import "server-only";
import { randomUUID } from "node:crypto";
import { sintetizar, vozConfigurada } from "@/lib/redes/voz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/correo";

/** Texto para decir en voz alta: sin marcas de formato y con la dirección como se pronuncia. */
function paraDecir(texto: string) {
  return texto.replace(/[#*_`>]/g, "").replace(/miarcana\.com/gi, "mi arcana punto com").trim().slice(0, 2500);
}

/**
 * Narra un texto de la escuela con la voz de Sibila y devuelve la dirección del MP3 (servida por miarcana.com/voz-sibila).
 * La carpeta lleva una parte aleatoria: el audio es de una sola persona y no se puede adivinar su dirección.
 */
export async function narrarEscuela(texto: string): Promise<string | null> {
  if (!vozConfigurada()) return null;
  const audio = await sintetizar(paraDecir(texto));
  const carpeta = `escuela-${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const { error } = await getSupabaseAdmin().storage.from("redes").upload(`voz-sibila/${carpeta}/es.mp3`, audio, { contentType: "audio/mpeg", upsert: true, cacheControl: "86400" });
  if (error) throw new Error(`No se guardó el audio: ${error.message}`);
  return `${sitio()}/voz-sibila/${carpeta}/es.mp3`;
}
