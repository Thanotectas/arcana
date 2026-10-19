import "server-only";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ejecutar, rutaFfmpeg } from "./reel";

/**
 * Voz de Sibila para los reels (ElevenLabs). Cada reel se narra en dos
 * partes: el mensaje (la carta o el tema del día) y la invitación final, para
 * que la voz vaya con lo que se ve. Si falta la configuración o la API falla,
 * el reel sale como siempre, solo con el fondo musical.
 *
 * Variables: ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID (la voz elegida en
 * ElevenLabs); opcional ELEVENLABS_MODEL (por defecto eleven_multilingual_v2).
 * REDES_VOZ=0 la apaga sin quitar las claves.
 */
const API = "https://api.elevenlabs.io/v1";

const clave = () => (process.env.ELEVENLABS_API_KEY ?? "").trim();
const voz = () => (process.env.ELEVENLABS_VOICE_ID ?? "").trim();

export function vozConfigurada() {
  return Boolean(clave() && voz()) && process.env.REDES_VOZ !== "0";
}

/** "miarcana.com" se lee mal: se escribe como se dice. */
export function paraLeer(texto: string) {
  return texto
    .replace(/https?:\/\//g, "")
    .replace(/miarcana\.com(\/[\w-]+)*/gi, "mi arcana punto com")
    .replace(/\s+/g, " ")
    .trim();
}

/** Une frases para leer en voz alta: punto entre ellas, salvo que ya terminen en signo. */
export function frases(...partes: (string | null | undefined)[]) {
  return partes
    .map((p) => (p ?? "").trim())
    .filter(Boolean)
    .map((p) => (/[.?!…:]$/.test(p) ? p : `${p}.`))
    .join(" ");
}

const MODELO_BASE = "eleven_multilingual_v2";

async function pedirAudio(texto: string, modelo: string) {
  return fetch(`${API}/text-to-speech/${encodeURIComponent(voz())}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": clave(), "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({
      text: paraLeer(texto),
      model_id: modelo,
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.25, use_speaker_boost: true },
    }),
    cache: "no-store",
  });
}

/** Si el modelo de ELEVENLABS_MODEL no sirve (nombre mal escrito, plan que no lo incluye), se usa el clásico. */
export async function sintetizar(texto: string): Promise<Buffer> {
  const modelo = (process.env.ELEVENLABS_MODEL ?? "").trim() || MODELO_BASE;
  let res = await pedirAudio(texto, modelo);
  if (!res.ok && modelo !== MODELO_BASE && res.status >= 400 && res.status < 500 && res.status !== 401) {
    console.warn(`[voz de Sibila] el modelo ${modelo} respondió ${res.status}; se usa ${MODELO_BASE}`);
    res = await pedirAudio(texto, MODELO_BASE);
  }
  if (!res.ok) {
    const detalle = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${detalle.slice(0, 200)}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Duración en segundos de un audio (ffmpeg la escribe al leerlo). */
async function duracion(ruta: string): Promise<number> {
  const { stderr } = await ejecutar(rutaFfmpeg(), ["-hide_banner", "-i", ruta, "-f", "null", "-"], { timeout: 30_000, maxBuffer: 4 * 1024 * 1024 });
  const m = /Duration: (\d+):(\d+):([\d.]+)/.exec(stderr);
  if (!m) throw new Error("No se pudo medir la narración.");
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

export interface Narracion {
  /** Rutas de los MP3 escritos en `dir`, en orden. */
  archivos: string[];
  segundos: number[];
}

/** Frase corta para /admin/redes: el audio, o el error de ElevenLabs tal cual. */
export async function probarVoz(): Promise<{ audio?: Buffer; error?: string }> {
  if (!clave() || !voz()) return { error: `Falta ${!clave() ? "ELEVENLABS_API_KEY" : "ELEVENLABS_VOICE_ID"} en Vercel (o falta el Redeploy).` };
  if (process.env.REDES_VOZ === "0") return { error: "La voz está apagada (REDES_VOZ=0)." };
  try {
    return { audio: await sintetizar("Hola, soy Sibila. Así sonará mi voz en los videos de Arcana.") };
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

/** Narra cada parte con la voz de Sibila y deja los MP3 en `dir`; null si no hay voz. */
export async function narrar(dir: string, partes: string[]): Promise<Narracion | null> {
  if (!vozConfigurada()) return null;
  try {
    const audios = await Promise.all(partes.map((p) => sintetizar(p)));
    const archivos = await Promise.all(
      audios.map(async (a, i) => {
        const ruta = join(dir, `voz-${i}.mp3`);
        await writeFile(ruta, a);
        return ruta;
      }),
    );
    const segundos = await Promise.all(archivos.map(duracion));
    return { archivos, segundos };
  } catch (e) {
    console.error("[voz de Sibila]", e instanceof Error ? e.message : e);
    return null;
  }
}

/**
 * Tiempos de un reel con voz: la primera parte suena desde `inicio`, el
 * cierre (la invitación) aparece cuando ella termina —nunca antes de
 * `cierreMinimo`— y el video dura lo necesario para que la segunda parte
 * termine con un respiro, entre `duracionMinima` y 25 s.
 */
export function tiemposConVoz(n: Narracion | null, base: { inicio: number; cierreMinimo: number; duracionMinima: number }) {
  if (!n) return { cierre: base.cierreMinimo, duracion: base.duracionMinima, vozCierre: 0 };
  const cierre = Math.max(base.cierreMinimo, base.inicio + n.segundos[0] + 0.4);
  const vozCierre = cierre + 0.4;
  const duracion = Math.min(25, Math.max(base.duracionMinima, Math.ceil(vozCierre + (n.segundos[1] ?? 0) + 1.5)));
  return { cierre, duracion, vozCierre };
}

/**
 * Cadena de audio del reel: el acorde de fondo (entradas `indice`..`indice+3`)
 * y, si hay voz (entradas siguientes), la música baja y la narración encima.
 */
export function filtroAudio(indice: number, duracion: number, n: Narracion | null, tiempos: { inicio: number; vozCierre: number }) {
  const musica = `[${indice}:a][${indice + 1}:a][${indice + 2}:a][${indice + 3}:a]amix=inputs=4,volume=${n ? 1.6 : 4},aecho=0.8:0.6:350|700:0.35|0.2,lowpass=f=1800,afade=t=in:st=0:d=1.5,afade=t=out:st=${duracion - 2}:d=2,aformat=sample_rates=44100:channel_layouts=stereo`;
  if (!n) return `${musica}[a]`;
  const ms = (s: number) => Math.round(s * 1000);
  const v0 = indice + 4;
  return [
    `${musica}[mus]`,
    `[${v0}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms(tiempos.inicio)}|${ms(tiempos.inicio)},apad[voz0]`,
    `[${v0 + 1}:a]aformat=sample_rates=44100:channel_layouts=stereo,adelay=${ms(tiempos.vozCierre)}|${ms(tiempos.vozCierre)},apad[voz1]`,
    // amix divide entre las entradas (las voces siguen en silencio con apad para que
    // la música no suba cuando terminan): se compensa con volume.
    `[mus][voz0][voz1]amix=inputs=3:duration=first:dropout_transition=0,volume=3[a]`,
  ].join(";");
}
