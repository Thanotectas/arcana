import "server-only";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { simboloDataUri } from "@/lib/marca/simbolo";
import { ALTO, ANCHO, BUCKET, FPS, asegurarBucket, ejecutar, estrellas, png, rutaFfmpeg } from "./reel";
import { CENTRO_REEL, interpretarVisual, visualParaReel } from "./visual";
import { LIENZO, cuadrosRueda } from "./rueda-animada";
import type { PublicacionProgramada } from "./calendario";
import { filtroAudio, frases, narrar, tiemposConVoz } from "./voz";

/**
 * Reel (1080×1920, 12 s) de una publicación del agente de redes: el visual de
 * la función (carta, monedas, rueda que gira, vela, aura…) sobre el cielo con
 * un acercamiento lento, la cabecera con la etiqueta, el título y la frase de
 * Sibila, y al final el pie con el enlace. Mismo motor que la carta del día
 * (`reel.tsx`): capas con ImageResponse y ffmpeg.
 */
const DURACION = 12;

type Datos = Pick<PublicacionProgramada, "id" | "etiqueta" | "titulo" | "extracto" | "enlace" | "pie" | "carta" | "simbolos" | "actualizado_en">;

async function capas(p: Datos) {
  const visual = await visualParaReel(interpretarVisual(p.carta, p.simbolos));
  const semilla = (parseInt(p.id.slice(0, 8), 16) || 7) % 2147483647;
  const logo = simboloDataUri();

  const fondo = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: `radial-gradient(900px 900px at 50% ${Math.round((CENTRO_REEL.y / ALTO) * 100)}%, rgba(139,108,246,0.42), rgba(11,7,22,0) 70%), linear-gradient(180deg, #1a0f3a 0%, #0b0716 70%)` }}>
      {estrellas(semilla, 140, ALTO).map((e, i) => (
        <div key={i} style={{ position: "absolute", left: e.x, top: e.y, width: e.r * 2, height: e.r * 2, borderRadius: 999, background: "#fff6d8", opacity: e.o }} />
      ))}
      {visual.fondo}
    </div>,
  );

  const anillo = visual.anillo ? await png(<div style={{ width: "100%", height: "100%", display: "flex" }}>{visual.anillo}</div>, 1080, 1080) : null;

  const cabecera = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
        <img src={logo} width={76} height={76} alt="" />
        <span style={{ fontFamily: "Cormorant", fontSize: 60, color: "#f1d99a" }}>Arcana</span>
      </div>
      <span style={{ marginTop: 22, fontSize: 30, letterSpacing: 8, textTransform: "uppercase", color: "#b7a5ff", textAlign: "center", maxWidth: 940 }}>{p.etiqueta}</span>
    </div>,
  );

  const tamanoTitulo = p.titulo.length > 48 ? 66 : p.titulo.length > 30 ? 78 : 92;
  const texto = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 960, padding: "34px 48px", borderRadius: 36, background: "rgba(11,7,22,0.72)", border: "1px solid rgba(241,217,154,0.3)" }}>
        <span style={{ fontFamily: "Cormorant", fontSize: tamanoTitulo, color: "#f1d99a", textAlign: "center", lineHeight: 1.05 }}>{p.titulo}</span>
        <span style={{ marginTop: 18, fontSize: 34, lineHeight: 1.4, color: "#ece6f7", textAlign: "center", fontStyle: "italic" }}>{`“${p.extracto}”`}</span>
      </div>
    </div>,
  );

  const cta = await png(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 940, padding: "40px 48px", borderRadius: 40, background: "rgba(11,7,22,0.82)", border: "2px solid rgba(241,217,154,0.55)" }}>
        <span style={{ fontFamily: "Cormorant", fontSize: 72, color: "#f1d99a", textAlign: "center", lineHeight: 1.05 }}>{p.etiqueta}</span>
        <div style={{ marginTop: 28, display: "flex", padding: "20px 56px", borderRadius: 999, background: "linear-gradient(135deg, #f1d99a, #d9b45a)", color: "#0b0716", fontSize: 40, fontWeight: 600 }}>{p.enlace}</div>
        <span style={{ marginTop: 18, fontSize: 28, color: "#a89fc0", textAlign: "center" }}>{p.pie}</span>
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

  return { fondo, anillo, cabecera, texto, cta, capaEstrellas, animacion: visual.animacion };
}

/** Genera el MP4 del reel de la publicación y lo devuelve como Buffer. */
export async function generarReelPublicacion(p: Datos): Promise<Buffer> {
  const c = await capas(p);
  const dir = await mkdtemp(join(tmpdir(), "reel-pub-"));
  try {
    const archivos: [string, Buffer][] = [
      ["fondo.png", c.fondo],
      ["cabecera.png", c.cabecera],
      ["texto.png", c.texto],
      ["cta.png", c.cta],
      ["estrellas.png", c.capaEstrellas],
      ...(c.anillo ? ([["anillo.png", c.anillo]] as [string, Buffer][]) : []),
    ];
    await Promise.all(archivos.map(([nombre, datos]) => writeFile(join(dir, nombre), datos)));
    // La rueda que se dibuja sola (carta astral, sinastría) va como secuencia de fotogramas.
    const rueda = c.animacion ? await cuadrosRueda(dir, c.animacion, FPS) : null;
    const voz = await narrar(dir, [frases(p.titulo, p.extracto), frases(p.etiqueta, p.pie, "Te espero en miarcana.com")]);
    // Con rueda, el cierre espera a que termine de dibujarse.
    const tiempos = tiemposConVoz(voz, { inicio: 0.9, cierreMinimo: rueda ? Math.max(8.5, rueda.segundos + 0.5) : 8.5, duracionMinima: rueda ? Math.max(DURACION, rueda.segundos + 4) : DURACION });
    const duracion = tiempos.duracion;
    const salida = join(dir, "reel.mp4");
    const marcos = FPS * duracion;
    const indiceAudio = archivos.length;
    const indiceRueda = archivos.length + 4 + (voz ? voz.archivos.length : 0);
    const filtro = [
      `[0:v]scale=${ANCHO * 2}:${ALTO * 2},zoompan=z='1+0.08*on/${marcos}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${ANCHO}x${ALTO}:fps=${FPS},fade=t=in:st=0:d=0.8[base]`,
      `[1:v]format=rgba,fade=t=in:st=0.5:d=0.7:alpha=1[cab]`,
      `[2:v]format=rgba,fade=t=in:st=1.4:d=0.7:alpha=1,fade=t=out:st=${tiempos.cierre - 0.5}:d=0.5:alpha=1[txt]`,
      `[3:v]format=rgba,fade=t=in:st=${tiempos.cierre}:d=0.6:alpha=1[cta]`,
      `[4:v]format=rgba[est]`,
      // La rueda gira una vuelta cada 80 s y aparece con el fondo.
      ...(c.anillo ? [`[5:v]format=rgba,rotate=a='t*${(2 * Math.PI) / 80}':c=none:ow=iw:oh=ih,fade=t=in:st=0.3:d=1:alpha=1[ani]`] : []),
      `[base][est]overlay=x=0:y='-t*28':eval=frame[b0]`,
      ...(rueda
        ? [`[${indiceRueda}:v]format=rgba,tpad=stop_mode=clone:stop_duration=${duracion}[rue]`, `[b0][rue]overlay=x=0:y=${CENTRO_REEL.y - LIENZO.centro}:eof_action=repeat[b1]`]
        : [`[b0]null[b1]`]),
      ...(c.anillo ? [`[b1][ani]overlay=x=${CENTRO_REEL.x - 540}:y=${CENTRO_REEL.y - 540}[b1r]`] : []),
      `[${c.anillo ? "b1r" : "b1"}][cab]overlay=0:0[b2]`,
      `[b2][txt]overlay=0:0[b3]`,
      `[b3][cta]overlay=0:0,format=yuv420p[v]`,
      filtroAudio(indiceAudio, duracion, voz, { inicio: 0.9, vozCierre: tiempos.vozCierre }),
    ].join(";");
    const imagen = (archivo: string) => ["-loop", "1", "-framerate", String(FPS), "-t", String(duracion), "-i", join(dir, archivo)];
    const tono = (f: number) => ["-f", "lavfi", "-t", String(duracion), "-i", `sine=frequency=${f}:sample_rate=44100`];
    await ejecutar(
      rutaFfmpeg(),
      [
        "-v", "error", "-y",
        ...archivos.flatMap(([nombre]) => imagen(nombre)),
        ...tono(110), ...tono(164.81), ...tono(220), ...tono(277.18),
        ...(voz ? voz.archivos.flatMap((a) => ["-i", a]) : []),
        ...(rueda ? ["-framerate", String(FPS), "-i", rueda.patron] : []),
        "-filter_complex", filtro,
        "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", String(FPS),
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100",
        "-t", String(duracion), "-movflags", "+faststart",
        salida,
      ],
      { timeout: 240_000, maxBuffer: 10 * 1024 * 1024 },
    );
    return await readFile(salida);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/**
 * URL pública del reel de la publicación. El nombre lleva la versión de la
 * fila (fecha de edición), así una publicación editada obtiene un video nuevo
 * y la corrida siguiente reutiliza el que ya existe.
 */
export async function reelPublicacion(admin: SupabaseClient<Database>, p: Datos, opciones: { regenerar?: boolean } = {}): Promise<string> {
  await asegurarBucket(admin);
  // El nombre depende del contenido: editar la publicación regenera el video;
  // cambiar solo su estado (aprobar, publicar) no.
  const huella = createHash("sha1").update(JSON.stringify([p.etiqueta, p.titulo, p.extracto, p.enlace, p.pie, p.carta, p.simbolos])).digest("hex").slice(0, 10);
  const nombre = `pub-${p.id}-${huella}.mp4`;
  const ruta = `reels/${nombre}`;
  const { data: url } = admin.storage.from(BUCKET).getPublicUrl(ruta);
  if (!opciones.regenerar) {
    const { data: existentes } = await admin.storage.from(BUCKET).list("reels", { search: nombre });
    if (existentes?.some((f) => f.name === nombre)) return url.publicUrl;
  }
  const video = await generarReelPublicacion(p);
  const { error } = await admin.storage.from(BUCKET).upload(ruta, video, { contentType: "video/mp4", upsert: true, cacheControl: "86400" });
  if (error) throw new Error(`subir reel: ${error.message}`);
  return url.publicUrl;
}
