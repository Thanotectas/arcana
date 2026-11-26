import "server-only";
import { randomUUID } from "node:crypto";
import { sintetizar, vozConfigurada } from "@/lib/redes/voz";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/correo";

/** Texto para decir en voz alta: sin marcas de formato y con la dirección como se pronuncia. */
function paraDecir(texto: string) {
  return texto.replace(/[#*_`>]/g, "").replace(/miarcana\.com/gi, "mi arcana punto com").trim();
}

/** Parte un texto largo en trozos de hasta `max` caracteres, cortando entre frases (la voz tiene un límite por pedido). */
function trozos(texto: string, max = 2400) {
  const salida: string[] = [];
  let actual = "";
  for (const frase of texto.match(/[^.!?…]+[.!?…]+["»”]?\s*|[^.!?…]+$/g) ?? [texto]) {
    if (actual && actual.length + frase.length > max) {
      salida.push(actual.trim());
      actual = "";
    }
    actual += frase.length > max ? frase.slice(0, max) : frase;
  }
  if (actual.trim()) salida.push(actual.trim());
  return salida.slice(0, 6);
}

/**
 * Narra un texto de la escuela con la voz de Sibila y devuelve la dirección del MP3 (servida por miarcana.com/voz-sibila).
 * La carpeta lleva una parte aleatoria: el audio es de una sola persona y no se puede adivinar su dirección.
 */
export async function narrarEscuela(texto: string): Promise<string | null> {
  if (!vozConfigurada()) return null;
  // Los textos largos («Para profundizar», la carta) se narran por partes y se unen en un solo MP3.
  const partes: Buffer[] = [];
  for (const t of trozos(paraDecir(texto))) partes.push(await sintetizar(t));
  const audio = Buffer.concat(partes);
  const carpeta = `escuela-${randomUUID().replace(/-/g, "").slice(0, 24)}`;
  const { error } = await getSupabaseAdmin().storage.from("redes").upload(`voz-sibila/${carpeta}/es.mp3`, audio, { contentType: "audio/mpeg", upsert: true, cacheControl: "86400" });
  if (error) throw new Error(`No se guardó el audio: ${error.message}`);
  return `${sitio()}/voz-sibila/${carpeta}/es.mp3`;
}
