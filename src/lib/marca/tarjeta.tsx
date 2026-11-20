import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { simboloDataUri } from "./simbolo";

export const TAMANO_TARJETA = { width: 1080, height: 1350 };
/** Historia de Instagram, Facebook o estado de WhatsApp (9:16). */
export const TAMANO_HISTORIA = { width: 1080, height: 1920 };

async function fuentes() {
  const [cormorant, inter, simbolos] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fuentes/CormorantGaramond-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/Inter-Medium.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/NotoSansSymbols2.ttf")),
  ]);
  return [
    { name: "Cormorant", data: cormorant, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 500 as const, style: "normal" as const },
    { name: "Simbolos", data: simbolos, weight: 400 as const, style: "normal" as const },
  ];
}

export interface DatosTarjeta {
  etiqueta: string; // tipo de lectura
  titulo: string; // p.ej. nombres de cartas o hexagrama
  simbolos: string[]; // glifos grandes (☉ ♌, ✦, ☰...)
  extracto: string; // frase de la lectura
  enlace: string; // miarcana.com/r/CODIGO
  pie: string; // "Con mi enlace recibes créditos extra"
  /** Líneas de hexagrama (abajo→arriba), si aplica. */
  hexagrama?: (0 | 1)[];
  /** Ilustraciones de cartas (data URI); si hay, reemplazan los glifos. */
  imagenes?: string[];
  /** Las imágenes son monedas redondas (signos, animales): sin marco de carta. */
  monedas?: boolean;
  /** Alto ÷ ancho de las cartas (1.5 por defecto; el Lenormand es 1.2). */
  proporcion?: number;
  /** Foto de la persona (mano, taza, huevo…) con las marcas de lo que se leyó; si hay, va en lugar de las imágenes. */
  foto?: { src: string; ancho: number; alto: number; marcas?: { x: number; y: number; etiqueta: string }[] };
  /** "historia" = 1080×1920 con márgenes para los controles de Instagram; por defecto publicación 1080×1350. */
  formato?: "publicacion" | "historia";
}

/** Recorta el Markdown a una frase limpia para la tarjeta. */
export function extractoDe(interpretacion: string, max = 230) {
  const sinMarcas = interpretacion
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s.*$/gm, " ")
    .replace(/[*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  // Preferimos la síntesis (suele ir al final).
  const sintesis = interpretacion.match(/##\s*(S[ií]ntesis|Synthesis|S[ií]ntese)[^\n]*\n+([\s\S]*?)(?=\n##|$)/i);
  const base = sintesis ? sintesis[2].replace(/[*_>`]/g, "").replace(/\s+/g, " ").trim() : sinMarcas;
  if (base.length <= max) return base;
  const corte = base.slice(0, max);
  const fin = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf(", "), corte.lastIndexOf(" "));
  return corte.slice(0, fin > 80 ? fin : max).trim() + "…";
}

export async function imagenTarjeta(d: DatosTarjeta) {
  const historia = d.formato === "historia";
  // En la historia todo crece un poco y se deja aire arriba y abajo (ahí van los controles de Instagram).
  const escala = historia ? 1.18 : 1;
  const tamanoTitulo = Math.round((d.titulo.length > 60 ? 48 : d.titulo.length > 34 ? 60 : 76) * escala);
  const unaImagen = d.imagenes?.length === 1;
  const ladoMoneda = Math.round((unaImagen ? 260 : 220) * escala);
  const anchoCarta = Math.round((unaImagen ? 300 : 230) * escala);
  const altoCarta = Math.round(anchoCarta * (d.proporcion ?? 527 / 300));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: historia ? "200px 72px 250px" : "72px 72px 64px",
          background:
            "radial-gradient(800px 600px at 50% 0%, rgba(139,108,246,0.35), transparent 60%), radial-gradient(700px 500px at 100% 100%, rgba(217,180,90,0.18), transparent 60%), #0b0716",
          color: "#ece6f7",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
            <img src={simboloDataUri()} width={64} height={64} alt="" />
            <span style={{ fontFamily: "Cormorant", fontSize: 48, color: "#f1d99a", letterSpacing: 2 }}>Arcana</span>
          </div>
          <span style={{ fontSize: 22, color: "#b7a5ff", letterSpacing: 5, textTransform: "uppercase" }}>{d.etiqueta}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, textAlign: "center" }}>
          {d.hexagrama ? (
            <div style={{ display: "flex", flexDirection: "column-reverse", gap: 14 }}>
              {d.hexagrama.map((l, i) =>
                l === 1 ? (
                  <div key={i} style={{ width: 260, height: 22, borderRadius: 11, background: "#e8c76f" }} />
                ) : (
                  <div key={i} style={{ display: "flex", gap: 40 }}>
                    <div style={{ width: 110, height: 22, borderRadius: 11, background: "#b7a5ff" }} />
                    <div style={{ width: 110, height: 22, borderRadius: 11, background: "#b7a5ff" }} />
                  </div>
                ),
              )}
            </div>
          ) : d.foto ? (
            (() => {
              // La foto entra en una caja máxima conservando su forma; las marcas (en % de la foto) van encima.
              const maxW = historia ? 820 : 640;
              const maxH = historia ? 820 : 500;
              const k = Math.min(maxW / d.foto.ancho, maxH / d.foto.alto);
              const w = Math.round(d.foto.ancho * k);
              const h = Math.round(d.foto.alto * k);
              const lado = Math.round(Math.min(w, h) * 0.17);
              return (
                <div style={{ display: "flex", position: "relative", width: w, height: h, borderRadius: 22, border: "4px solid rgba(241,217,154,0.75)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)", overflow: "hidden" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
                  <img src={d.foto.src} width={w} height={h} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
                  {(d.foto.marcas ?? []).slice(0, 4).map((m, i) => {
                    const cx = (m.x / 100) * w;
                    const cy = (m.y / 100) * h;
                    const abajo = cy + lado / 2 + 46 < h;
                    return (
                      <div key={i} style={{ display: "flex", position: "absolute", left: 0, top: 0, width: w, height: h }}>
                        <div style={{ position: "absolute", left: cx - lado / 2, top: cy - lado / 2, width: lado, height: lado, borderRadius: lado, border: "4px solid #f1d99a", boxShadow: "0 0 18px rgba(241,217,154,0.8)" }} />
                        <div
                          style={{
                            position: "absolute",
                            left: Math.min(w - 230, Math.max(8, cx - 115)),
                            top: abajo ? cy + lado / 2 + 6 : cy - lado / 2 - 44,
                            width: 230,
                            display: "flex",
                            justifyContent: "center",
                          }}
                        >
                          <span style={{ fontSize: 22, color: "#1b1230", background: "#f1d99a", padding: "4px 12px", borderRadius: 999 }}>{m.etiqueta.slice(0, 22)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          ) : d.imagenes && d.imagenes.length ? (
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {/* eslint-disable @next/next/no-img-element -- ImageResponse no usa next/image */}
              {d.imagenes.slice(0, 3).map((src, i) =>
                d.monedas ? (
                  <img key={i} src={src} width={ladoMoneda} height={ladoMoneda} alt="" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }} />
                ) : (
                  <img key={i} src={src} width={anchoCarta} height={altoCarta} alt="" style={{ borderRadius: 18, border: "4px solid rgba(241,217,154,0.7)", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }} />
                ),
              )}
              {/* eslint-enable @next/next/no-img-element */}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 28, fontSize: 132, color: "#f1d99a", lineHeight: 1, fontFamily: "Simbolos" }}>
              {d.simbolos.slice(0, 4).map((s, i) => (
                <span key={i} style={{ textShadow: "0 0 40px rgba(241,217,154,0.6)" }}>{s}</span>
              ))}
            </div>
          )}
          <div style={{ fontFamily: "Cormorant", fontSize: tamanoTitulo, lineHeight: 1.1, color: "#ffffff", maxWidth: 900 }}>{d.titulo}</div>
          <div style={{ fontSize: Math.round(30 * escala), lineHeight: 1.45, color: "#d9d2ea", maxWidth: 880, fontStyle: "italic" }}>{`“${d.extracto}”`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 28 }}>
          {historia ? (
            <span style={{ fontSize: 38, color: "#0b0716", background: "linear-gradient(135deg, #f1d99a, #d9b45a)", padding: "16px 44px", borderRadius: 999 }}>{d.enlace}</span>
          ) : (
            <span style={{ fontSize: 30, color: "#f1d99a" }}>{d.enlace}</span>
          )}
          <span style={{ fontSize: historia ? 28 : 22, color: "#a89fc0", marginTop: historia ? 8 : 0 }}>{d.pie}</span>
        </div>
      </div>
    ),
    { ...(historia ? TAMANO_HISTORIA : TAMANO_TARJETA), fonts: await fuentes() },
  );
}
