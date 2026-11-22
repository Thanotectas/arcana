import "server-only";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { ALTO, ANCHO, BUCKET, FPS, asegurarBucket, ejecutar, estrellas, png, rutaFfmpeg } from "@/lib/redes/reel";
import { duracion, filtroAudio, paraLeer, sintetizar, tiemposConVoz, vozConfigurada, type Narracion } from "@/lib/redes/voz";
import type { Idioma } from "@/lib/i18n/idiomas";
import { MAX_INTENTOS, codigoResultado, type ResultadoCompartido } from "./carta-escondida";

/**
 * Video vertical del resultado (1080×1920, ~9 s) para TikTok, Reels y estados: la carta escondida flotando, los
 * cuadritos apareciendo uno a uno y el resultado, con la voz de Sibila. No revela la carta (como el texto
 * para compartir): es un reto para quien lo ve. Se guarda en el bucket «redes» y se reutiliza.
 */
const TEXTOS: Record<Idioma, { titulo: string; gano: (n: number) => string; perdio: string; racha: (n: number) => string; reto: string; voz1: string; vozGano: (n: number) => string; vozPerdio: string }> = {
  es: {
    titulo: "Así me fue hoy",
    gano: (n) => `La encontré en ${n}/${MAX_INTENTOS}`,
    perdio: "Hoy se me escondió",
    racha: (n) => `${n} días seguidos jugando`,
    reto: "¿Y tú? Juega gratis en miarcana.com/juego",
    voz1: "Así me fue hoy en El Camino del Loco.",
    vozGano: (n) => (n === 1 ? "¡La encontré a la primera! ¿Y tú, la encuentras?" : `La encontré en ${n} intentos. ¿Y tú, la encuentras?`),
    vozPerdio: "Hoy la carta se me escondió. ¿Tú la encuentras?",
  },
  en: {
    titulo: "My game today",
    gano: (n) => `Found it in ${n}/${MAX_INTENTOS}`,
    perdio: "It hid from me today",
    racha: (n) => `${n}-day streak`,
    reto: "Your turn! Play free at miarcana.com/juego",
    voz1: "Here's how I did today on The Fool's Journey.",
    vozGano: (n) => (n === 1 ? "I found it on the first try! Can you find it?" : `I found it in ${n} tries. Can you find it?`),
    vozPerdio: "The card hid from me today. Can you find it?",
  },
  pt: {
    titulo: "Meu jogo de hoje",
    gano: (n) => `Encontrei em ${n}/${MAX_INTENTOS}`,
    perdio: "Hoje ela se escondeu",
    racha: (n) => `${n} dias seguidos jogando`,
    reto: "E você? Jogue grátis em miarcana.com/juego",
    voz1: "Foi assim o meu jogo de hoje no Caminho do Louco.",
    vozGano: (n) => (n === 1 ? "Encontrei de primeira! E você, encontra?" : `Encontrei em ${n} tentativas. E você, encontra?`),
    vozPerdio: "Hoje a carta se escondeu de mim. Você encontra?",
  },
  fr: {
    titulo: "Ma partie du jour",
    gano: (n) => `Trouvée en ${n}/${MAX_INTENTOS}`,
    perdio: "Elle m'a échappé aujourd'hui",
    racha: (n) => `${n} jours d'affilée`,
    reto: "Et toi ? Joue gratuitement sur miarcana.com/juego",
    voz1: "Voici ma partie du jour au Chemin du Fou.",
    vozGano: (n) => (n === 1 ? "Je l'ai trouvée du premier coup ! Et toi, tu la trouves ?" : `Je l'ai trouvée en ${n} essais. Et toi, tu la trouves ?`),
    vozPerdio: "Aujourd'hui, la carte m'a échappé. Et toi, tu la trouves ?",
  },
  tr: {
    titulo: "Bugünkü oyunum",
    gano: (n) => `${n}/${MAX_INTENTOS} denemede buldum`,
    perdio: "Bugün benden saklandı",
    racha: (n) => `${n} gündür üst üste oynuyorum`,
    reto: "Sıra sende! miarcana.com/juego adresinde ücretsiz oyna",
    voz1: "Deli'nin Yolculuğu'nda bugün böyle geçti.",
    vozGano: (n) => (n === 1 ? "İlk denemede buldum! Sen de bulabilir misin?" : `${n} denemede buldum. Sen de bulabilir misin?`),
    vozPerdio: "Bugün kart benden saklandı. Sen bulabilir misin?",
  },
};
const NOMBRE_JUEGO: Record<Idioma, string> = { es: "EL CAMINO DEL LOCO", en: "THE FOOL'S JOURNEY", pt: "O CAMINHO DO LOUCO", fr: "LE CHEMIN DU FOU", tr: "DELİ'NİN YOLCULUĞU" };

const capa = { width: "100%", height: "100%", display: "flex", position: "relative" } as const;

/** La voz de una frase, guardada una sola vez en el bucket (son pocas frases distintas). */
async function vozGuardada(dir: string, nombre: string, texto: string): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const ruta = `juego/video-voz/${nombre}.mp3`;
  const local = join(dir, `${nombre}.mp3`);
  const { data } = await admin.storage.from(BUCKET).download(ruta);
  if (data) {
    await writeFile(local, Buffer.from(await data.arrayBuffer()));
    return local;
  }
  const audio = await sintetizar(paraLeer(texto));
  await admin.storage.from(BUCKET).upload(ruta, audio, { contentType: "audio/mpeg", upsert: true, cacheControl: "31536000" });
  await writeFile(local, audio);
  return local;
}

async function narracion(dir: string, r: ResultadoCompartido, idioma: Idioma): Promise<Narracion | null> {
  if (!vozConfigurada()) return null;
  try {
    const t = TEXTOS[idioma];
    const clave = r.gano ? `gano-${r.filas.length}` : "perdio";
    const archivos = await Promise.all([vozGuardada(dir, `intro-${idioma}`, t.voz1), vozGuardada(dir, `${clave}-${idioma}`, r.gano ? t.vozGano(r.filas.length) : t.vozPerdio)]);
    if (archivos.some((a) => !a)) return null;
    const rutas = archivos as string[];
    return { archivos: rutas, segundos: await Promise.all(rutas.map(duracion)) };
  } catch (e) {
    console.error("[juego video] voz", e instanceof Error ? e.message : e);
    return null;
  }
}

async function generar(r: ResultadoCompartido, idioma: Idioma): Promise<Buffer> {
  const t = TEXTOS[idioma];
  const dir = await mkdtemp(join(tmpdir(), "juego-video-"));
  try {
    const ALTO_CARTA = 400;
    const dorso = await sharp(await readFile(join(process.cwd(), "public", "cartas", "arcana", "dorso.webp"))).resize({ height: ALTO_CARTA }).png().toBuffer();
    const { width: ANCHO_CARTA = 230 } = await sharp(dorso).metadata();
    const dorsoUri = `data:image/png;base64,${dorso.toString("base64")}`;
    const semilla = (r.numero * 7919) % 2147483647;
    const Y0 = 890;
    const PASO = 88;
    const LADO = 76;

    const fondo = await png(
      <div style={{ ...capa, background: "radial-gradient(900px 900px at 50% 36%, rgba(139,108,246,0.45), rgba(11,7,22,0) 70%), linear-gradient(180deg, #1a0f3a 0%, #0b0716 72%)" }}>
        {estrellas(semilla, 150, ALTO).map((e, i) => (
          <div key={i} style={{ position: "absolute", left: e.x, top: e.y, width: e.r * 2, height: e.r * 2, borderRadius: 99, background: "#f1d99a", opacity: e.o * 0.7 }} />
        ))}
      </div>,
    );
    const cabecera = await png(
      <div style={{ ...capa, flexDirection: "column", alignItems: "center", paddingTop: 210 }}>
        <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 34, letterSpacing: 10, color: "#b69cff" }}>{`${NOMBRE_JUEGO[idioma]} · #${r.numero}`}</div>
        <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 104, color: "#f7f1e3", marginTop: 18 }}>{t.titulo}</div>
      </div>,
    );
    const carta = await png(
      <div style={{ ...capa, justifyContent: "center", paddingTop: 440 }}>
        <div style={{ display: "flex", position: "relative", width: ANCHO_CARTA, height: ALTO_CARTA, borderRadius: 24, boxShadow: "0 0 90px rgba(139,108,246,0.85)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- capa del video */}
          <img src={dorsoUri} width={ANCHO_CARTA} height={ALTO_CARTA} style={{ position: "absolute", top: 0, left: 0, borderRadius: 22, border: "3px solid rgba(241,217,154,0.7)" }} alt="" />
          <div style={{ position: "absolute", top: 0, left: 0, width: ANCHO_CARTA, height: ALTO_CARTA, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: 150, height: 150, borderRadius: 999, background: "rgba(11,7,22,0.7)", border: "2px solid rgba(241,217,154,0.6)", alignItems: "center", justifyContent: "center", fontFamily: "Cormorant", fontSize: 130, color: "#f1d99a" }}>
              ?
            </div>
          </div>
        </div>
      </div>,
    );
    const filas = await Promise.all(
      r.filas.map((f, i) =>
        png(
          <div style={{ ...capa, justifyContent: "center", paddingTop: Y0 + i * PASO }}>
            <div style={{ display: "flex", gap: 14 }}>
              {/* Tres casillas siempre (la tercera es el destello del acierto), para que las filas queden alineadas. */}
              <div style={{ display: "flex", width: LADO, height: LADO }} />
              <div style={{ display: "flex", width: LADO, height: LADO, borderRadius: 14, background: f.grupo ? "#8b6cf6" : "#2a2440" }} />
              <div
                style={{ display: "flex", width: LADO, height: LADO, borderRadius: 14, background: f.numero === "igual" ? "#8b6cf6" : "#2a2440", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 600, fontSize: 46, color: "#f1d99a" }}
              >
                {f.numero === "igual" ? "" : f.numero === "mayor" ? "↑" : "↓"}
              </div>
              <div style={{ display: "flex", width: LADO, height: LADO, alignItems: "center", justifyContent: "center", fontFamily: "Simbolos", fontSize: 60, color: "#f1d99a" }}>{f.acierto ? "✦" : ""}</div>
            </div>
          </div>,
        ),
      ),
    );
    const final = await png(
      <div style={{ ...capa, flexDirection: "column", alignItems: "center", justifyContent: "flex-end", paddingBottom: 230 }}>
        <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 92, color: "#f1d99a" }}>{r.gano ? t.gano(r.filas.length) : t.perdio}</div>
        {r.racha > 1 && <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 500, fontSize: 38, color: "#cbbcf6", marginTop: 6 }}>{t.racha(r.racha)}</div>}
        <div style={{ display: "flex", fontFamily: "Inter", fontWeight: 600, fontSize: 40, color: "#f7f1e3", marginTop: 26, padding: "18px 34px", borderRadius: 999, background: "rgba(139,108,246,0.35)", border: "2px solid rgba(241,217,154,0.6)" }}>
          {t.reto}
        </div>
      </div>,
    );
    const capas = [["fondo.png", fondo], ["cabecera.png", cabecera], ["carta.png", carta], ...filas.map((f, i) => [`fila-${i}.png`, f] as const), ["final.png", final]] as const;
    await Promise.all(capas.map(([nombre, datos]) => writeFile(join(dir, nombre), datos)));

    const voz = await narracion(dir, r, idioma);
    const aparece = (i: number) => 1.3 + i * 0.45;
    const tiempos = tiemposConVoz(voz, { inicio: 0.5, cierreMinimo: aparece(r.filas.length) + 0.4, duracionMinima: 8 });
    const dur = tiempos.duracion;
    const marcos = FPS * dur;
    const nFilas = r.filas.length;
    const iFinal = 3 + nFilas;
    const filtro = [
      `[0:v]scale=${ANCHO * 2}:${ALTO * 2},zoompan=z='1+0.07*on/${marcos}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${ANCHO}x${ALTO}:fps=${FPS},fade=t=in:st=0:d=0.6[base]`,
      `[1:v]format=rgba,fade=t=in:st=0.2:d=0.6:alpha=1[cab]`,
      `[2:v]format=rgba,fade=t=in:st=0.5:d=0.7:alpha=1[car]`,
      ...r.filas.map((_, i) => `[${3 + i}:v]format=rgba,fade=t=in:st=${aparece(i).toFixed(2)}:d=0.3:alpha=1[f${i}]`),
      `[${iFinal}:v]format=rgba,fade=t=in:st=${tiempos.cierre.toFixed(2)}:d=0.6:alpha=1[fin]`,
      `[base][cab]overlay=0:0[b0]`,
      `[b0][car]overlay=x=0:y='12*sin(t*2.2)':eval=frame[b1]`,
      ...r.filas.map((_, i) => `[b${i + 1}][f${i}]overlay=0:0[b${i + 2}]`),
      `[b${nFilas + 1}][fin]overlay=0:0,format=yuv420p[v]`,
      filtroAudio(iFinal + 1, dur, voz, { inicio: 0.5, vozCierre: tiempos.vozCierre }),
    ].join(";");
    const imagen = (archivo: string) => ["-loop", "1", "-framerate", String(FPS), "-t", String(dur), "-i", join(dir, archivo)];
    const tono = (f: number) => ["-f", "lavfi", "-t", String(dur), "-i", `sine=frequency=${f}:sample_rate=44100`];
    const salida = join(dir, "resultado.mp4");
    await ejecutar(
      rutaFfmpeg(),
      [
        "-v", "error", "-y",
        ...capas.flatMap(([nombre]) => imagen(nombre)),
        ...tono(130.81), ...tono(196), ...tono(261.63), ...tono(329.63),
        ...(voz ? voz.archivos.flatMap((a) => ["-i", a]) : []),
        "-filter_complex", filtro,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", "-r", String(FPS),
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-t", String(dur), "-movflags", "+faststart",
        salida,
      ],
      { timeout: 110_000, maxBuffer: 10 * 1024 * 1024 },
    );
    return await readFile(salida);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** El video de ese resultado: si ya existe se reutiliza; si no, se fabrica y se guarda. Devuelve los bytes. */
export async function videoResultado(r: ResultadoCompartido, idioma: Idioma): Promise<{ url: string; video?: Buffer }> {
  const admin = getSupabaseAdmin();
  await asegurarBucket(admin);
  const nombre = `${r.numero}-${codigoResultado(r.filas)}-${Math.min(r.racha, 999)}-${idioma}.mp4`;
  const ruta = `juego/videos/${nombre}`;
  const url = admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  const { data: existentes } = await admin.storage.from(BUCKET).list("juego/videos", { search: nombre, limit: 1 });
  if (existentes?.some((f) => f.name === nombre)) return { url };
  const video = await generar(r, idioma);
  const { error } = await admin.storage.from(BUCKET).upload(ruta, video, { contentType: "video/mp4", upsert: true, cacheControl: "31536000" });
  if (error) console.error("[juego video] subir", error.message);
  return { url, video };
}

/** Solo para probar sin Supabase: los bytes del video. */
export const generarVideoResultado = generar;
