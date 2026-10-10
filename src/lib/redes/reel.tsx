import "server-only";
import { ImageResponse } from "next/og";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { simboloDataUri } from "@/lib/marca/simbolo";
import { MAZOS } from "@/lib/tarot/mazos";
import { PAQUETE_PRUEBA, formatoCOP } from "@/lib/creditos";
import { cartaDelDia, frase, mazoDelDia } from "./carta-dia";
import { fechaLargaEs } from "./calendario";

/**
 * Reel de la carta del día (1080×1920, 10 s): la carta aparece sobre el cielo
 * con un acercamiento lento, estrellas que suben, el nombre y la frase, y al
 * final la invitación a una tirada de pago. Las capas se dibujan con
 * ImageResponse (como las tarjetas) y ffmpeg las anima. El video se guarda en
 * el bucket público "redes" de Supabase para que Meta lo descargue.
 */
const ANCHO = 1080;
const ALTO = 1920;
const FPS = 24;
const DURACION = 10;
const BUCKET = "redes";

const ejecutar = promisify(execFile);

function rutaFfmpeg(): string {
  if (process.env.FFMPEG_PATH) return process.env.FFMPEG_PATH;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- el paquete resuelve el binario de la plataforma en tiempo de ejecución
  return (require("@ffmpeg-installer/ffmpeg") as { path: string }).path;
}

async function fuentes() {
  const leer = (f: string) => readFile(join(process.cwd(), "src/app/fuentes", f));
  const [cormorant, inter, interSemi] = await Promise.all([leer("CormorantGaramond-SemiBold.ttf"), leer("Inter-Medium.ttf"), leer("Inter-SemiBold.ttf")]);
  return [
    { name: "Cormorant", data: cormorant, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: interSemi, weight: 600 as const, style: "normal" as const },
  ];
}

async function png(nodo: React.ReactElement, alto = ALTO): Promise<Buffer> {
  const r = new ImageResponse(nodo, { width: ANCHO, height: alto, fonts: await fuentes() });
  return Buffer.from(await r.arrayBuffer());
}

/** Estrellas deterministas (misma fecha, mismo cielo). */
function estrellas(semilla: number, cantidad: number, alto: number) {
  let s = semilla || 1;
  const azar = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: cantidad }, () => ({ x: azar() * ANCHO, y: azar() * alto, r: 1 + azar() * 3, o: 0.25 + azar() * 0.6 }));
}

async function capas(fecha: string) {
  const carta = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  const nombreMazo = mazo === "arcana" ? "Tarot Arcana" : MAZOS[mazo].nombre;
  const semilla = Number(fecha.replace(/-/g, "")) % 2147483647;

  // Ilustración a 900 px de alto (las de Rider-Waite son más angostas).
  const original = await readFile(join(process.cwd(), "public", "cartas", mazo, `${carta.id}.webp`));
  const imagen = await sharp(original).resize({ height: 900 }).png().toBuffer();
  const { width: anchoCarta = 600 } = await sharp(imagen).metadata();
  const cartaUri = `data:image/png;base64,${imagen.toString("base64")}`;
  const logo = simboloDataUri();

  const fondo = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "radial-gradient(900px 900px at 50% 38%, rgba(139,108,246,0.42), rgba(11,7,22,0) 70%), linear-gradient(180deg, #1a0f3a 0%, #0b0716 70%)" }}>
      {estrellas(semilla, 140, ALTO).map((e, i) => (
        <div key={i} style={{ position: "absolute", left: e.x, top: e.y, width: e.r * 2, height: e.r * 2, borderRadius: 999, background: "#fff6d8", opacity: e.o }} />
      ))}
      <div style={{ position: "absolute", left: (ANCHO - anchoCarta) / 2 - 40, top: 330, width: anchoCarta + 80, height: 980, borderRadius: 60, background: "radial-gradient(closest-side, rgba(241,217,154,0.45), rgba(241,217,154,0))" }} />
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
      <img src={cartaUri} width={anchoCarta} height={900} alt="" style={{ position: "absolute", left: (ANCHO - anchoCarta) / 2, top: 370, borderRadius: 26, border: "5px solid rgba(241,217,154,0.85)", boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }} />
    </div>,
  );

  const cabecera = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
        <img src={logo} width={76} height={76} alt="" />
        <span style={{ fontFamily: "Cormorant", fontSize: 60, color: "#f1d99a" }}>Arcana</span>
      </div>
      <span style={{ marginTop: 22, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#b7a5ff" }}>Carta del día</span>
      <span style={{ marginTop: 8, fontSize: 32, color: "#ece6f7" }}>{`${fechaLargaEs(fecha)} · ${nombreMazo}`}</span>
    </div>,
  );

  const texto = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 960, padding: "34px 48px", borderRadius: 36, background: "rgba(11,7,22,0.72)", border: "1px solid rgba(241,217,154,0.3)" }}>
        <span style={{ fontFamily: "Cormorant", fontSize: carta.nombre.length > 22 ? 70 : 86, color: "#f1d99a", textAlign: "center", lineHeight: 1.05 }}>{carta.nombre}</span>
        <span style={{ marginTop: 16, fontSize: 34, lineHeight: 1.4, color: "#ece6f7", textAlign: "center" }}>{frase(carta.significado, 150)}</span>
      </div>
    </div>,
  );

  const precio = formatoCOP(PAQUETE_PRUEBA.precioCOP);
  const cta = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 940, padding: "40px 48px", borderRadius: 40, background: "rgba(11,7,22,0.82)", border: "2px solid rgba(241,217,154,0.55)" }}>
        <span style={{ fontSize: 34, color: "#b7a5ff", letterSpacing: 2 }}>¿Quieres tu propia tirada?</span>
        <span style={{ marginTop: 14, fontFamily: "Cormorant", fontSize: 78, color: "#f1d99a", textAlign: "center", lineHeight: 1.05 }}>{`Sibila te lee tres cartas por ${precio}`}</span>
        <div style={{ marginTop: 28, display: "flex", padding: "20px 56px", borderRadius: 999, background: "linear-gradient(135deg, #f1d99a, #d9b45a)", color: "#0b0716", fontSize: 40, fontWeight: 600 }}>miarcana.com</div>
        <span style={{ marginTop: 18, fontSize: 28, color: "#a89fc0" }}>Tu carta del día es gratis, todos los días</span>
      </div>
    </div>,
  );

  const capaEstrellas = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative" }}>
      {estrellas(semilla + 7, 70, 2400).map((e, i) => (
        <div key={i} style={{ position: "absolute", left: e.x, top: e.y, width: e.r * 2.4, height: e.r * 2.4, borderRadius: 999, background: "radial-gradient(circle, #fff6d8 0%, rgba(241,217,154,0) 70%)", opacity: e.o }} />
      ))}
    </div>,
    2400,
  );

  return { fondo, cabecera, texto, cta, capaEstrellas };
}

/** Genera el MP4 del reel de esa fecha y lo devuelve como Buffer. */
export async function generarReel(fecha: string): Promise<Buffer> {
  const c = await capas(fecha);
  const dir = await mkdtemp(join(tmpdir(), "reel-"));
  try {
    await Promise.all([
      writeFile(join(dir, "fondo.png"), c.fondo),
      writeFile(join(dir, "cabecera.png"), c.cabecera),
      writeFile(join(dir, "texto.png"), c.texto),
      writeFile(join(dir, "cta.png"), c.cta),
      writeFile(join(dir, "estrellas.png"), c.capaEstrellas),
    ]);
    const salida = join(dir, "reel.mp4");
    const marcos = FPS * DURACION;
    const filtro = [
      // Acercamiento lento sobre el fondo con la carta (se escala al doble para que no tiemble).
      `[0:v]scale=${ANCHO * 2}:${ALTO * 2},zoompan=z='1+0.09*on/${marcos}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${ANCHO}x${ALTO}:fps=${FPS},fade=t=in:st=0:d=0.8[base]`,
      `[1:v]format=rgba,fade=t=in:st=0.5:d=0.7:alpha=1[cab]`,
      `[2:v]format=rgba,fade=t=in:st=1.6:d=0.7:alpha=1,fade=t=out:st=6.4:d=0.5:alpha=1[txt]`,
      `[3:v]format=rgba,fade=t=in:st=6.9:d=0.6:alpha=1[cta]`,
      `[4:v]format=rgba[est]`,
      `[base][est]overlay=x=0:y='-t*28':eval=frame[b1]`,
      `[b1][cab]overlay=0:0[b2]`,
      `[b2][txt]overlay=0:0[b3]`,
      `[b3][cta]overlay=0:0,format=yuv420p[v]`,
      // Fondo sonoro suave: acorde en La con eco, entra y sale despacio.
      `[5:a][6:a][7:a][8:a]amix=inputs=4,volume=4,aecho=0.8:0.6:350|700:0.35|0.2,lowpass=f=1800,afade=t=in:st=0:d=1.5,afade=t=out:st=${DURACION - 2}:d=2[a]`,
    ].join(";");
    const imagen = (archivo: string) => ["-loop", "1", "-framerate", String(FPS), "-t", String(DURACION), "-i", join(dir, archivo)];
    const tono = (f: number) => ["-f", "lavfi", "-t", String(DURACION), "-i", `sine=frequency=${f}:sample_rate=44100`];
    await ejecutar(
      rutaFfmpeg(),
      [
        "-v", "error", "-y",
        ...imagen("fondo.png"), ...imagen("cabecera.png"), ...imagen("texto.png"), ...imagen("cta.png"), ...imagen("estrellas.png"),
        ...tono(110), ...tono(164.81), ...tono(220), ...tono(277.18),
        "-filter_complex", filtro,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", String(FPS),
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-t", String(DURACION), "-movflags", "+faststart",
        salida,
      ],
      { timeout: 240_000, maxBuffer: 10 * 1024 * 1024 },
    );
    return await readFile(salida);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function asegurarBucket(admin: SupabaseClient<Database>) {
  const { data } = await admin.storage.getBucket(BUCKET);
  if (data) return;
  const { error } = await admin.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "50MB", allowedMimeTypes: ["video/mp4", "image/png", "image/jpeg"] });
  if (error && !/already exists/i.test(error.message)) throw new Error(`bucket ${BUCKET}: ${error.message}`);
}

/**
 * URL pública del reel de esa fecha. Si ya se generó, la reutiliza (la
 * corrida de la tarde no lo vuelve a fabricar).
 */
export async function reelCartaDelDia(admin: SupabaseClient<Database>, fecha: string, opciones: { regenerar?: boolean } = {}): Promise<string> {
  await asegurarBucket(admin);
  const ruta = `reels/carta-dia-${fecha}.mp4`;
  const { data: url } = admin.storage.from(BUCKET).getPublicUrl(ruta);
  if (!opciones.regenerar) {
    const { data: existentes } = await admin.storage.from(BUCKET).list("reels", { search: `carta-dia-${fecha}.mp4` });
    if (existentes?.some((f) => f.name === `carta-dia-${fecha}.mp4`)) return url.publicUrl;
  }
  const video = await generarReel(fecha);
  const { error } = await admin.storage.from(BUCKET).upload(ruta, video, { contentType: "video/mp4", upsert: true, cacheControl: "86400" });
  if (error) throw new Error(`subir reel: ${error.message}`);
  return url.publicUrl;
}
