import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const TAMANO_OG = { width: 1200, height: 630 };

async function fuentes() {
  const [cormorant, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fuentes/CormorantGaramond-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/Inter-Medium.ttf")),
  ]);
  return [
    { name: "Cormorant", data: cormorant, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 500 as const, style: "normal" as const },
  ];
}

function MarcaOG({ tamano }: { tamano: number }) {
  return (
    <svg viewBox="0 0 64 64" width={tamano} height={tamano}>
      <circle cx="32" cy="32" r="29" fill="none" stroke="#e2bd63" strokeWidth="2" />
      <path d="M32 3a29 29 0 0 0 0 58 23 23 0 0 1 0-58z" fill="#e2bd63" opacity="0.18" />
      <path d="M32 12l3.2 14.8L50 32l-14.8 5.2L32 52l-3.2-14.8L14 32l14.8-5.2z" fill="#e8c76f" />
      <path d="M32 22l1.3 8.7L42 32l-8.7 1.3L32 42l-1.3-8.7L22 32l8.7-1.3z" fill="#0b0716" opacity="0.55" />
      <circle cx="49" cy="15" r="1.6" fill="#f1d99a" />
      <circle cx="53" cy="47" r="1.2" fill="#f1d99a" />
      <circle cx="13" cy="50" r="1" fill="#f1d99a" />
    </svg>
  );
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
