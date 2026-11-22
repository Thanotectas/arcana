import "server-only";
import { generarTexto } from "@/lib/ia";
import { sintetizar } from "@/lib/redes/voz";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Audio de Sibila para las lecturas pagas, en el idioma de la lectura (ElevenLabs, voz de Sibila).
 * - «mensaje»: Sibila escribe y graba un mensaje de voz de ~1 minuto con lo esencial (incluido).
 * - «completo»: la lectura entera, leída por Sibila (se paga con créditos según su largo).
 * Se guarda en el bucket privado «audios»; nunca se genera dos veces.
 */
export const BUCKET_AUDIOS = "audios";
export type TipoAudio = "mensaje" | "completo";

export function audioConfigurado() {
  return Boolean((process.env.ELEVENLABS_API_KEY ?? "").trim() && (process.env.ELEVENLABS_VOICE_ID ?? "").trim()) && process.env.AUDIO_LECTURAS !== "0";
}

/** El texto de la lectura tal como se lee en voz alta: sin Markdown, sin viñetas ni símbolos. */
export function textoParaVoz(texto: string) {
  return texto
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[*_`>|]/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Créditos de la lectura completa en audio, según su largo (lo que cuesta narrarla). */
export function creditosAudioCompleto(texto: string) {
  const n = textoParaVoz(texto).length;
  return n <= 4000 ? 1 : n <= 9000 ? 2 : 3;
}

/** Corta el texto en trozos que la voz acepta de una vez, por párrafos y, si hace falta, por frases. */
export function trozos(texto: string, maximo = 2400) {
  const salida: string[] = [];
  let actual = "";
  const meter = (parte: string) => {
    if ((actual + "\n\n" + parte).length > maximo && actual) {
      salida.push(actual);
      actual = parte;
    } else actual = actual ? `${actual}\n\n${parte}` : parte;
  };
  for (const parrafo of texto.split(/\n{2,}/)) {
    if (parrafo.length <= maximo) meter(parrafo);
    else for (const frase of parrafo.match(/[^.!?。؟।]+[.!?。؟।]*\s*/g) ?? [parrafo]) meter(frase.trim());
  }
  if (actual) salida.push(actual);
  return salida;
}

/** Narra un texto largo por trozos y une los MP3 (los cuadros MP3 se pueden concatenar). */
export async function narrar(texto: string): Promise<Buffer> {
  const partes: Buffer[] = [];
  for (const t of trozos(texto)) partes.push(await sintetizar(t));
  return Buffer.concat(partes);
}

/** El mensaje de voz: Sibila resume la lectura en ~1 minuto, hablando a la persona, en el idioma de la lectura. */
export async function escribirMensaje(interpretacion: string, nombre: string | null, idioma: Idioma) {
  const texto = await generarTexto(
    `Lectura escrita que la persona acaba de recibir:\n\n${interpretacion.slice(0, 12000)}`,
    `Ahora vas a grabar un mensaje de voz para esta persona${nombre ? ` (se llama ${nombre})` : ""}: lo esencial de su lectura en unos 60 segundos (entre 120 y 150 palabras), como una nota de voz cálida y cercana.
- Habla en primera persona como Sibila, directo a la persona. Empieza por su nombre si lo sabes.
- Lo más importante de la lectura: qué está pasando, qué viene y un consejo concreto. Nada nuevo que no esté en la lectura.
- Se va a escuchar, no a leer: frases cortas y naturales, sin títulos, listas, emojis, Markdown ni comillas.
- Sin miedo, sin promesas de dinero o salud. Cierra con calidez, sin despedidas largas.`,
    { idioma, effort: "low", maxTokens: 700 },
  );
  return textoParaVoz(texto);
}
