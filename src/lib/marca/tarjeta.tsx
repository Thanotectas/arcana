import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { simboloDataUri } from "./simbolo";

export const TAMANO_TARJETA = { width: 1080, height: 1350 };

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
  const tamanoTitulo = d.titulo.length > 60 ? 48 : d.titulo.length > 34 ? 60 : 76;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 72px 64px",
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
          ) : (
            <div style={{ display: "flex", gap: 28, fontSize: 132, color: "#f1d99a", lineHeight: 1, fontFamily: "Simbolos" }}>
              {d.simbolos.slice(0, 4).map((s, i) => (
                <span key={i} style={{ textShadow: "0 0 40px rgba(241,217,154,0.6)" }}>{s}</span>
              ))}
            </div>
          )}
          <div style={{ fontFamily: "Cormorant", fontSize: tamanoTitulo, lineHeight: 1.1, color: "#ffffff", maxWidth: 900 }}>{d.titulo}</div>
          <div style={{ fontSize: 30, lineHeight: 1.45, color: "#d9d2ea", maxWidth: 880, fontStyle: "italic" }}>{`“${d.extracto}”`}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: 28 }}>
          <span style={{ fontSize: 30, color: "#f1d99a" }}>{d.enlace}</span>
          <span style={{ fontSize: 22, color: "#a89fc0" }}>{d.pie}</span>
        </div>
      </div>
    ),
    { ...TAMANO_TARJETA, fonts: await fuentes() },
  );
}
