import { ImageResponse } from "next/og";
import { simboloDataUri } from "./simbolo";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const TAMANO_OG = { width: 1200, height: 630 };

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

function MarcaOG({ tamano }: { tamano: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image
  return <img src={simboloDataUri()} width={tamano} height={tamano} alt="" />;
}

/**
 * Imagen de vista previa (WhatsApp, redes, buscadores). Fondo noche con
 * resplandor violeta, marca, título grande en Cormorant y subtítulo.
 */
export async function imagenOG({ titulo, subtitulo, pie = "miarcana.com" }: { titulo: string; subtitulo?: string; pie?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "radial-gradient(900px 500px at 20% 0%, rgba(139,108,246,0.35), transparent 60%), radial-gradient(700px 400px at 100% 100%, rgba(217,180,90,0.16), transparent 60%), #0b0716",
          color: "#ece6f7",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <MarcaOG tamano={84} />
          <span style={{ fontFamily: "Cormorant", fontSize: 64, color: "#f1d99a", letterSpacing: 2 }}>Arcana</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontFamily: "Cormorant", fontSize: titulo.length > 40 ? 68 : 84, lineHeight: 1.05, color: "#ffffff", maxWidth: 1000 }}>{titulo}</div>
          {subtitulo && <div style={{ fontSize: 30, color: "#b7a5ff", maxWidth: 1000, lineHeight: 1.35 }}>{subtitulo}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 24, color: "#a89fc0" }}>
          <span>{pie}</span>
          <span style={{ color: "#f1d99a", letterSpacing: 6, fontSize: 20 }}>TAROT · ASTROLOGÍA · NUMEROLOGÍA · QUIROMANCIA</span>
        </div>
      </div>
    ),
    { ...TAMANO_OG, fonts: await fuentes() },
  );
}
