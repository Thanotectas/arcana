import "server-only";
import { join } from "node:path";
import sharp from "sharp";
import { MAZOS, type IdMazo } from "@/lib/tarot/mazos";
import { SIGNOS } from "@/lib/zodiaco";
import { ANIMALES } from "@/lib/chino";
import { COLORES_AURA, type ColorAura } from "@/lib/aura";
import { COLORES, TONO_COLOR, type ColorVela } from "@/lib/velas";
import { auraComoDataUri, cartaComoDataUri, monedaComoDataUri, webpComoDataUri } from "@/lib/marca/imagenes";
import type { DatosTarjeta } from "@/lib/marca/tarjeta";

/**
 * Imagen principal de una publicación del agente de redes. La columna `carta`
 * de `publicaciones_programadas` la describe con un texto corto:
 *
 *   rider/la-estrella     carta de un mazo
 *   signos/leo            moneda de un signo (o animales/dragon)
 *   rueda/signos          rueda con las doce monedas (o rueda/animales)
 *   duo/tauro+escorpio    dos signos frente a frente
 *   cruce/leo+dragon      un signo y un animal
 *   aura/violeta+dorado   dos halos de aura
 *   vela/verde            una vela encendida
 *   hexagrama/101101      seis líneas, de abajo hacia arriba
 *   numeros/3·7·11        tres números
 *   luna                  luna creciente
 *   glifo/✋              un símbolo grande
 *
 * El reel (`reel-publicacion.tsx`) lo dibuja en grande; la tarjeta fija
 * (`/api/redes/publicacion`) lo traduce a lo que admite `imagenTarjeta`.
 */
export type Visual =
  | { tipo: "carta"; mazo: IdMazo; id: string }
  | { tipo: "moneda"; carpeta: "signos" | "animales"; id: string }
  | { tipo: "rueda"; carpeta: "signos" | "animales" }
  | { tipo: "duo"; a: string; b: string; glifo: string }
  | { tipo: "cruce"; signo: string; animal: string }
  | { tipo: "aura"; a: ColorAura; b: ColorAura }
  | { tipo: "vela"; color: ColorVela }
  | { tipo: "hexagrama"; lineas: (0 | 1)[] }
  | { tipo: "numeros"; numeros: string[] }
  | { tipo: "luna" }
  | { tipo: "glifo"; glifo: string };

const ID = /^[a-z0-9-]{1,40}$/;
const esSigno = (id: string) => SIGNOS.some((s) => s.id === id);
const esAnimal = (id: string) => (ANIMALES as readonly string[]).includes(id);
const esMazo = (id: string): id is IdMazo => id === "arcana" || id in MAZOS;

/** Traduce el texto de `carta` (y los símbolos de respaldo) a un visual válido. */
export function interpretarVisual(carta: string | null, simbolos: string[]): Visual {
  const glifo = simbolos[0] ?? "✦";
  const [tipo, resto = ""] = (carta ?? "").split("/");
  const [a = "", b = ""] = resto.split("+");
  switch (tipo) {
    case "signos":
    case "animales":
      if ((tipo === "signos" && esSigno(a)) || (tipo === "animales" && esAnimal(a))) return { tipo: "moneda", carpeta: tipo, id: a };
      break;
    case "rueda":
      if (a === "signos" || a === "animales") return { tipo: "rueda", carpeta: a };
      break;
    case "duo":
      if (esSigno(a) && esSigno(b)) return { tipo: "duo", a, b, glifo };
      break;
    case "cruce":
      if (esSigno(a) && esAnimal(b)) return { tipo: "cruce", signo: a, animal: b };
      break;
    case "aura":
      if ((COLORES_AURA as readonly string[]).includes(a) && (COLORES_AURA as readonly string[]).includes(b)) return { tipo: "aura", a: a as ColorAura, b: b as ColorAura };
      break;
    case "vela":
      if ((COLORES as readonly string[]).includes(a)) return { tipo: "vela", color: a as ColorVela };
      break;
    case "hexagrama":
      if (/^[01]{6}$/.test(a)) return { tipo: "hexagrama", lineas: a.split("").map((c) => (c === "1" ? 1 : 0)) };
      break;
    case "numeros": {
      const numeros = resto.split("·").filter((x) => /^\d{1,2}$/.test(x)).slice(0, 3);
      if (numeros.length) return { tipo: "numeros", numeros };
      break;
    }
    case "luna":
      return { tipo: "luna" };
    case "glifo":
      if (resto) return { tipo: "glifo", glifo: [...resto][0] };
      break;
    default:
      if (tipo && esMazo(tipo) && ID.test(a)) return { tipo: "carta", mazo: tipo, id: a };
  }
  // La luna no está en la fuente de símbolos: se dibuja.
  if (glifo === "☾" || glifo === "☽") return { tipo: "luna" };
  return { tipo: "glifo", glifo };
}

async function svgComoPng(svg: string) {
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

/** Luna creciente dorada con estrellas, en un cuadrado de `lado` px. */
export function lunaSvg(lado: number) {
  const r = lado * 0.36;
  const c = lado / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
    <defs>
      <linearGradient id="oro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2c4"/><stop offset="0.5" stop-color="#f1d99a"/><stop offset="1" stop-color="#c9992e"/></linearGradient>
      <radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#f1d99a" stop-opacity="0.55"/><stop offset="0.6" stop-color="#8b6cf6" stop-opacity="0.18"/><stop offset="1" stop-color="#8b6cf6" stop-opacity="0"/></radialGradient>
      <mask id="creciente"><rect width="100%" height="100%" fill="#fff"/><circle cx="${c + r * 0.55}" cy="${c - r * 0.25}" r="${r * 0.88}" fill="#000"/></mask>
    </defs>
    <circle cx="${c}" cy="${c}" r="${lado * 0.5}" fill="url(#halo)"/>
    <circle cx="${c}" cy="${c}" r="${r}" fill="url(#oro)" mask="url(#creciente)"/>
    <circle cx="${c + r * 0.95}" cy="${c - r * 0.9}" r="${lado * 0.018}" fill="#fff6d8"/>
    <circle cx="${c + r * 1.25}" cy="${c - r * 0.35}" r="${lado * 0.011}" fill="#fff6d8"/>
    <circle cx="${c + r * 0.7}" cy="${c + r * 0.75}" r="${lado * 0.014}" fill="#fff6d8"/>
  </svg>`;
}

/** Vela encendida del color pedido, en un cuadrado de `lado` px. */
export function velaSvg(color: ColorVela, lado: number) {
  const tono = TONO_COLOR[color];
  const oscuro = color === "negro";
  const ancho = lado * 0.3;
  const x = (lado - ancho) / 2;
  const topeVela = lado * 0.4;
  const alto = lado * 0.55;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">
    <defs>
      <radialGradient id="luz" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffe9a8" stop-opacity="0.75"/><stop offset="0.45" stop-color="#f1b24a" stop-opacity="0.22"/><stop offset="1" stop-color="#f1b24a" stop-opacity="0"/></radialGradient>
      <radialGradient id="llama" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff8dc"/><stop offset="0.35" stop-color="#ffd25e"/><stop offset="0.75" stop-color="#f08a24" stop-opacity="0.9"/><stop offset="1" stop-color="#f08a24" stop-opacity="0"/></radialGradient>
      <linearGradient id="cuerpo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${tono}" stop-opacity="0.75"/><stop offset="0.45" stop-color="${tono}"/><stop offset="1" stop-color="${tono}" stop-opacity="0.6"/></linearGradient>
    </defs>
    <circle cx="${lado / 2}" cy="${topeVela - lado * 0.08}" r="${lado * 0.3}" fill="url(#luz)"/>
    <rect x="${x}" y="${topeVela}" width="${ancho}" height="${alto}" rx="${ancho * 0.12}" fill="url(#cuerpo)" stroke="${oscuro ? "#8b6cf6" : "rgba(255,255,255,0.35)"}" stroke-width="${lado * 0.006}"/>
    <ellipse cx="${lado / 2}" cy="${topeVela}" rx="${ancho / 2}" ry="${ancho * 0.14}" fill="${oscuro ? "#2a2a33" : "rgba(255,255,255,0.45)"}"/>
    <rect x="${lado / 2 - lado * 0.006}" y="${topeVela - lado * 0.07}" width="${lado * 0.012}" height="${lado * 0.075}" fill="#2a1a0a"/>
    <ellipse cx="${lado / 2}" cy="${topeVela - lado * 0.13}" rx="${lado * 0.055}" ry="${lado * 0.1}" fill="url(#llama)"/>
  </svg>`;
}

function coin(carpeta: "signos" | "animales", id: string, lado: number) {
  return webpComoDataUri(join(process.cwd(), "public", carpeta, `${id}.webp`), { lado });
}

const RUEDA_MUESTRA = { signos: ["aries", "leo", "sagitario"], animales: ["dragon", "tigre", "caballo"] } as const;

/** Lo que `imagenTarjeta` necesita para dibujar el visual en la tarjeta fija (1080×1350). */
export async function visualParaTarjeta(v: Visual): Promise<Pick<DatosTarjeta, "imagenes" | "monedas" | "hexagrama" | "simbolos">> {
  switch (v.tipo) {
    case "carta":
      return { imagenes: [await cartaComoDataUri(v.mazo, v.id)].filter(Boolean), simbolos: ["✦"] };
    case "moneda":
      return { imagenes: [await monedaComoDataUri(v.carpeta, v.id)].filter(Boolean), monedas: true, simbolos: ["✦"] };
    case "rueda":
      return { imagenes: (await Promise.all(RUEDA_MUESTRA[v.carpeta].map((id) => monedaComoDataUri(v.carpeta, id)))).filter(Boolean), monedas: true, simbolos: ["☉"] };
    case "duo":
      return { imagenes: (await Promise.all([monedaComoDataUri("signos", v.a), monedaComoDataUri("signos", v.b)])).filter(Boolean), monedas: true, simbolos: [v.glifo] };
    case "cruce":
      return { imagenes: (await Promise.all([monedaComoDataUri("signos", v.signo), monedaComoDataUri("animales", v.animal)])).filter(Boolean), monedas: true, simbolos: ["✦"] };
    case "aura":
      return { imagenes: [await auraComoDataUri(v.a, v.b)].filter(Boolean), monedas: true, simbolos: ["✦"] };
    case "vela":
      return { imagenes: [await svgComoPng(velaSvg(v.color, 260))], monedas: true, simbolos: ["✦"] };
    case "luna":
      return { imagenes: [await svgComoPng(lunaSvg(260))], monedas: true, simbolos: ["✦"] };
    case "hexagrama":
      return { hexagrama: v.lineas, simbolos: ["☰"] };
    case "numeros":
      return { simbolos: v.numeros };
    case "glifo":
      return { simbolos: [v.glifo] };
  }
}

/** Coordenadas del visual dentro del reel (1080×1920): centrado en x, zona alta. */
export const CENTRO_REEL = { x: 540, y: 760 };

export interface VisualReel {
  /** Capa fija dentro del fondo (hijos absolutos). */
  fondo: React.ReactNode;
  /** Capa de 1080×1080 (transparente) que gira despacio alrededor del centro, si la hay. */
  anillo?: React.ReactNode;
}

/** Resplandor suave (los degradados radiales de CSS salen planos en el motor de imágenes: se dibuja en SVG). */
async function halo(radio: number, color = "#f1d99a", opacidad = 0.45) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${radio * 2}" height="${radio * 2}"><defs><radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${color}" stop-opacity="${opacidad}"/><stop offset="0.55" stop-color="${color}" stop-opacity="${opacidad * 0.35}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><circle cx="${radio}" cy="${radio}" r="${radio}" fill="url(#h)"/></svg>`;
  const src = await svgComoPng(svg);
  // eslint-disable-next-line @next/next/no-img-element -- ImageResponse no usa next/image
  return <img src={src} width={radio * 2} height={radio * 2} alt="" style={{ position: "absolute", left: CENTRO_REEL.x - radio, top: CENTRO_REEL.y - radio }} />;
}

function Glifo({ glifo, tamano, x = CENTRO_REEL.x, y = CENTRO_REEL.y, color = "#f1d99a" }: { glifo: string; tamano: number; x?: number; y?: number; color?: string }) {
  return (
    <div style={{ position: "absolute", left: x - tamano, top: y - tamano, width: tamano * 2, height: tamano * 2, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Simbolos", fontSize: tamano * 1.1, lineHeight: 1, color, textShadow: "0 0 60px rgba(241,217,154,0.7)" }}>
      {glifo}
    </div>
  );
}

/* eslint-disable @next/next/no-img-element -- ImageResponse no usa next/image */
function Imagen({ src, lado, x = CENTRO_REEL.x, y = CENTRO_REEL.y, sombra = true }: { src: string; lado: number; x?: number; y?: number; sombra?: boolean }) {
  if (!src) return null;
  // Satori no admite propiedades con valor undefined: la sombra se agrega solo si va.
  return <img src={src} width={lado} height={lado} alt="" style={{ position: "absolute", left: x - lado / 2, top: y - lado / 2, ...(sombra ? { filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.65))" } : {}) }} />;
}

/** Dibuja el visual en grande para el reel. */
export async function visualParaReel(v: Visual): Promise<VisualReel> {
  switch (v.tipo) {
    case "carta": {
      const uri = await webpComoDataUri(join(process.cwd(), "public", "cartas", v.mazo, `${v.id}.webp`), { alto: 860 });
      if (!uri) return visualParaReel({ tipo: "glifo", glifo: "✦" });
      const { width: ancho = 573 } = await sharp(Buffer.from(uri.split(",")[1], "base64")).metadata();
      return {
        fondo: (
          <>
            {await halo(520)}
            <img src={uri} width={ancho} height={860} alt="" style={{ position: "absolute", left: CENTRO_REEL.x - ancho / 2, top: CENTRO_REEL.y - 430, borderRadius: 26, border: "5px solid rgba(241,217,154,0.85)", boxShadow: "0 40px 90px rgba(0,0,0,0.7)" }} />
          </>
        ),
      };
    }
    case "moneda":
      return { fondo: (<>{await halo(480)}<Imagen src={await coin(v.carpeta, v.id, 640)} lado={640} /></>) };
    case "rueda": {
      const ids: readonly string[] = v.carpeta === "signos" ? SIGNOS.map((s) => s.id) : ANIMALES;
      const monedas = await Promise.all(ids.map((id) => coin(v.carpeta, id, 170)));
      const radio = 400;
      return {
        fondo: (<>{await halo(500, "#8b6cf6", 0.5)}<Glifo glifo={v.carpeta === "signos" ? "☉" : "✦"} tamano={120} /></>),
        anillo: (
          <div style={{ position: "relative", width: 1080, height: 1080, display: "flex" }}>
            <div style={{ position: "absolute", left: 540 - radio - 6, top: 540 - radio - 6, width: radio * 2 + 12, height: radio * 2 + 12, borderRadius: 999, border: "2px solid rgba(241,217,154,0.35)" }} />
            {monedas.map((src, i) => {
              const angulo = (-90 + i * 30) * (Math.PI / 180);
              return <Imagen key={i} src={src} lado={170} x={540 + Math.cos(angulo) * radio} y={540 + Math.sin(angulo) * radio} />;
            })}
          </div>
        ),
      };
    }
    case "duo": {
      const [a, b] = await Promise.all([coin("signos", v.a, 440), coin("signos", v.b, 440)]);
      return { fondo: (<>{await halo(520)}<Imagen src={a} lado={440} x={CENTRO_REEL.x - 270} /><Imagen src={b} lado={440} x={CENTRO_REEL.x + 270} /><Glifo glifo={v.glifo} tamano={60} color="#ece6f7" /></>) };
    }
    case "cruce": {
      const [a, b] = await Promise.all([coin("signos", v.signo, 440), coin("animales", v.animal, 440)]);
      return { fondo: (<>{await halo(520)}<Imagen src={a} lado={440} x={CENTRO_REEL.x - 270} /><Imagen src={b} lado={440} x={CENTRO_REEL.x + 270} /><Glifo glifo="✦" tamano={60} color="#ece6f7" /></>) };
    }
    case "aura":
      return { fondo: <Imagen src={await auraComoDataUri(v.a, v.b)} lado={900} sombra={false} /> };
    case "vela":
      return { fondo: <Imagen src={await svgComoPng(velaSvg(v.color, 900))} lado={900} sombra={false} /> };
    case "luna":
      return { fondo: <Imagen src={await svgComoPng(lunaSvg(900))} lado={900} sombra={false} /> };
    case "hexagrama":
      return {
        fondo: (
          <>
            {await halo(460, "#8b6cf6", 0.45)}
            <div style={{ position: "absolute", left: CENTRO_REEL.x - 240, top: CENTRO_REEL.y - 215, width: 480, display: "flex", flexDirection: "column-reverse", gap: 34 }}>
              {v.lineas.map((l, i) =>
                l === 1 ? (
                  <div key={i} style={{ width: 480, height: 40, borderRadius: 20, background: "#e8c76f", boxShadow: "0 0 30px rgba(241,217,154,0.5)" }} />
                ) : (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", width: 480 }}>
                    <div style={{ width: 200, height: 40, borderRadius: 20, background: "#b7a5ff" }} />
                    <div style={{ width: 200, height: 40, borderRadius: 20, background: "#b7a5ff" }} />
                  </div>
                ),
              )}
            </div>
          </>
        ),
      };
    case "numeros":
      return {
        fondo: (
          <>
            {await halo(460)}
            <div style={{ position: "absolute", left: 0, top: CENTRO_REEL.y - 160, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 40, fontFamily: "Cormorant", fontSize: 250, lineHeight: 1, color: "#f1d99a", textShadow: "0 0 50px rgba(241,217,154,0.6)" }}>
              {v.numeros.map((n, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 40 }}>
                  {i > 0 && <span style={{ fontSize: 120, color: "#b7a5ff" }}>·</span>}
                  <span>{n}</span>
                </div>
              ))}
            </div>
          </>
        ),
      };
    case "glifo":
      return {
        fondo: (
          <>
            {await halo(480)}
            <div style={{ position: "absolute", left: CENTRO_REEL.x - 290, top: CENTRO_REEL.y - 290, width: 580, height: 580, borderRadius: 999, border: "6px solid rgba(241,217,154,0.75)", background: "rgba(139,108,246,0.16)" }} />
            <Glifo glifo={v.glifo} tamano={200} />
          </>
        ),
      };
  }
}
/* eslint-enable @next/next/no-img-element */
