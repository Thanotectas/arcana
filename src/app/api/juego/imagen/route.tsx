import type { NextRequest } from "next/server";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { webpComoDataUri } from "@/lib/marca/imagenes";
import { MAX_INTENTOS, leerResultado, type Comparacion } from "@/lib/juego/carta-escondida";

/**
 * Imagen del resultado de El Camino del Loco, sin revelar la carta: los cuadritos de cada intento, la racha y Sibila.
 * ?n=&f=&ra= (como el enlace compartido) y ?formato=historia (1080×1920, estados e historias) u og (1200×630, la
 * vista previa del enlace en WhatsApp y Facebook).
 */
async function fuentes() {
  const [cormorant, inter, simbolos] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fuentes/CormorantGaramond-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/Inter-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/NotoSansSymbols2.ttf")),
  ]);
  return [
    { name: "Cormorant", data: cormorant, weight: 600 as const, style: "normal" as const },
    { name: "Inter", data: inter, weight: 600 as const, style: "normal" as const },
    { name: "Simbolos", data: simbolos, weight: 400 as const, style: "normal" as const },
  ];
}

const VIOLETA = "#8b6cf6";
const APAGADO = "#231a3b";
const ORO = "#f1d99a";

function Cuadritos({ filas, lado }: { filas: Comparacion[]; lado: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: Math.round(lado * 0.16) }}>
      {filas.map((f, i) => (
        <div key={i} style={{ display: "flex", gap: Math.round(lado * 0.16), alignItems: "center" }}>
          <div style={{ width: lado, height: lado, borderRadius: lado * 0.18, background: f.grupo ? VIOLETA : APAGADO, border: `2px solid ${f.grupo ? "#b9a6ff" : "#3a2d5c"}` }} />
          <div
            style={{
              width: lado,
              height: lado,
              borderRadius: lado * 0.18,
              background: f.numero === "igual" ? VIOLETA : APAGADO,
              border: `2px solid ${f.numero === "igual" ? "#b9a6ff" : "#3a2d5c"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: lado * 0.55,
              fontFamily: "Inter, Simbolos",
            }}
          >
            {f.numero === "igual" ? "✓" : f.numero === "mayor" ? "↑" : "↓"}
          </div>
          {f.acierto && <div style={{ display: "flex", color: ORO, fontSize: lado * 0.6, fontFamily: "Simbolos", marginLeft: lado * 0.1 }}>✦</div>}
        </div>
      ))}
    </div>
  );
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const r = leerResultado(q.get("n"), q.get("f"), q.get("ra"));
  if (!r) return new Response("Resultado no válido", { status: 400 });
  const historia = q.get("formato") === "historia";
  const [sibila, dorso, tipos] = await Promise.all([
    webpComoDataUri(join(process.cwd(), "public/juego/sibila.webp"), { lado: 360 }),
    webpComoDataUri(join(process.cwd(), "public/cartas/arcana/dorso.webp"), { alto: 420 }),
    fuentes(),
  ]);
  const titulo = r.gano ? `La encontré en ${r.filas.length}/${MAX_INTENTOS}` : "Hoy se me escondió";
  const fondo =
    "radial-gradient(900px 700px at 50% 0%, rgba(139,108,246,0.42), transparent 60%), radial-gradient(700px 600px at 100% 100%, rgba(217,180,90,0.18), transparent 60%), #0b0716";

  const retrato = (lado: number) => (
    <div style={{ display: "flex", position: "relative", width: lado * 1.9, height: lado * 1.25 }}>
      {dorso && (
        // eslint-disable-next-line @next/next/no-img-element -- imagen del motor de tarjetas
        <img src={dorso} alt="" width={lado * 0.8} height={lado * 1.25} style={{ position: "absolute", right: 0, top: 0, borderRadius: 18, border: `3px solid ${ORO}`, transform: "rotate(6deg)" }} />
      )}
      <div style={{ position: "absolute", right: lado * 0.22, top: lado * 0.38, display: "flex", fontFamily: "Cormorant", fontSize: lado * 0.55, color: ORO }}>?</div>
      {sibila && (
        // eslint-disable-next-line @next/next/no-img-element -- imagen del motor de tarjetas
        <img src={sibila} alt="" width={lado} height={lado} style={{ position: "absolute", left: 0, top: lado * 0.12, borderRadius: lado, border: `5px solid ${ORO}`, boxShadow: "0 0 60px rgba(139,108,246,0.6)" }} />
      )}
    </div>
  );

  if (!historia) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", background: fondo, color: "#ece6f7", padding: "56px 64px", fontFamily: "Inter" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 24, letterSpacing: 6, color: "#b9a6ff" }}>{`EL CAMINO DEL LOCO · CARTA #${r.numero}`}</div>
              <div style={{ fontFamily: "Cormorant", fontSize: 76, color: ORO, marginTop: 8 }}>{titulo}</div>
            </div>
            <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
              <Cuadritos filas={r.filas} lado={r.filas.length > 4 ? 46 : 58} />
              {r.racha > 1 && <div style={{ display: "flex", fontSize: 30, color: "#fff" }}>{`${r.racha} días seguidos`}</div>}
            </div>
            <div style={{ display: "flex", fontSize: 30 }}>
              <span style={{ color: "#ece6f7" }}>¿Adivinas la de hoy?</span>
              <span style={{ color: ORO, marginLeft: 14 }}>miarcana.com/juego</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>{retrato(250)}</div>
        </div>
      ),
      { width: 1200, height: 630, fonts: tipos, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", background: fondo, color: "#ece6f7", padding: "190px 72px 240px", fontFamily: "Inter" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontSize: 30, letterSpacing: 8, color: "#b9a6ff" }}>EL CAMINO DEL LOCO</div>
          <div style={{ fontFamily: "Cormorant", fontSize: 108, color: ORO, marginTop: 14, textAlign: "center", lineHeight: 1 }}>{titulo}</div>
          <div style={{ fontSize: 32, color: "#cdbfff", marginTop: 16 }}>{`Carta escondida #${r.numero}`}</div>
        </div>
        {retrato(300)}
        <Cuadritos filas={r.filas} lado={r.filas.length > 4 ? 76 : 96} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          {r.racha > 1 && <div style={{ display: "flex", fontSize: 40, color: "#fff" }}>{`${r.racha} días seguidos jugando`}</div>}
          <div style={{ display: "flex", fontFamily: "Cormorant", fontSize: 64, color: "#fff" }}>¿Adivinas la de hoy?</div>
          <div style={{ display: "flex", padding: "18px 46px", borderRadius: 999, background: "linear-gradient(180deg,#f6e2a8,#d6b065)", color: "#1b1230", fontSize: 46 }}>miarcana.com/juego</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1920, fonts: tipos, headers: { "Cache-Control": "public, max-age=86400, immutable", "Content-Disposition": `inline; filename="camino-del-loco-${r.numero}.png"` } },
  );
}
