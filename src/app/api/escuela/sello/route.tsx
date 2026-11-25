import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe } from "@/lib/escuela/servidor";
import { simboloDataUri } from "@/lib/marca/simbolo";

/** Una vela encendida para el sello (solo cajas: lo que dibuja ImageResponse). */
function Vela({ alto }: { alto: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 56 }}>
      <div style={{ width: 70, height: 70, borderRadius: 999, background: "radial-gradient(circle, rgba(255,214,120,0.55), rgba(255,180,70,0) 70%)", marginBottom: -46, display: "flex" }} />
      <div style={{ width: 20, height: 40, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", background: "linear-gradient(180deg, #fff9e0, #ffd36b 55%, #ff9a2e)", display: "flex" }} />
      <div style={{ width: 2, height: 10, background: "#3a2e20", display: "flex" }} />
      <div style={{ width: 40, height: alto, borderRadius: 6, background: "linear-gradient(90deg, #e9dcc0, #fff8e8 55%, #d9c9a6)", display: "flex" }} />
      <div style={{ width: 70, height: 12, borderRadius: 999, background: "#c9a24e", display: "flex" }} />
    </div>
  );
}

/**
 * El sello de cierre de ciclo (1080×1350, para compartir en redes): siete velas encendidas, el nombre de la persona y
 * el curso. Solo para quien terminó las siete lecciones (o en vista previa).
 */
export async function GET(request: Request) {
  const usuario = await getUsuarioOpcional();
  const curso = cursoPorSlug(new URL(request.url).searchParams.get("curso") ?? "");
  if (!usuario || !curso) return NextResponse.json({ error: "no" }, { status: 404 });
  const avance = await avanceDe(curso, usuario);
  const terminado = avance.estados.every((e) => e === "hecha");
  if (!(terminado || avance.vistaPrevia)) return NextResponse.json({ error: "sin_terminar" }, { status: 403 });
  const nombre = avance.perfil?.nombre ?? "";
  const anio = new Date().getFullYear();
  const [cormorant, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/app/fuentes/CormorantGaramond-SemiBold.ttf")),
    readFile(join(process.cwd(), "src/app/fuentes/Inter-Medium.ttf")),
  ]);
  const altos = [120, 150, 175, 195, 175, 150, 120];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "80px 70px 70px",
          color: "#ece6f7",
          fontFamily: "Inter",
          background:
            "radial-gradient(700px 520px at 50% 62%, rgba(241,217,154,0.22), transparent 70%), radial-gradient(900px 600px at 50% 0%, rgba(139,108,246,0.35), transparent 65%), #0b0716",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image */}
          <img src={simboloDataUri()} width={96} height={96} alt="" />
          <div style={{ fontSize: 26, letterSpacing: 10, color: "#f1d99a" }}>LA ESCUELA DE SIBILA</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <div style={{ fontFamily: "Cormorant", fontSize: 74, color: "#b7a5ff" }}>Cerré mi ciclo</div>
          {nombre && <div style={{ fontFamily: "Cormorant", fontSize: nombre.length > 16 ? 120 : 150, lineHeight: 1, color: "#ffffff" }}>{nombre}</div>}
          <div style={{ fontFamily: "Cormorant", fontSize: 44, color: "#ece6f7", textAlign: "center" }}>{`7 días para cerrar el año · ${anio}`}</div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26 }}>
          {altos.map((a, i) => <Vela key={i} alto={a} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ fontFamily: "Cormorant", fontSize: 38, color: "#f1d99a" }}>Siete velas encendidas ✦</div>
          <div style={{ fontSize: 28, color: "#a89fc0", letterSpacing: 4 }}>miarcana.com/escuela</div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [
        { name: "Cormorant", data: cormorant, weight: 600, style: "normal" },
        { name: "Inter", data: inter, weight: 500, style: "normal" },
      ],
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
