import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { IdMazo } from "@/lib/tarot/mazos";
import { TONO_AURA, type ColorAura } from "@/lib/aura";

/** Un WebP de public/ como data URI PNG (el motor de las tarjetas no lee WebP). Si falta, "". */
export async function webpComoDataUri(ruta: string, opciones: { lado?: number; alto?: number } = {}) {
  try {
    const webp = await readFile(ruta);
    const base = sharp(webp);
    const png = await (opciones.lado ? base.resize(opciones.lado, opciones.lado) : opciones.alto ? base.resize({ height: opciones.alto }) : base).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return "";
  }
}

/** Ilustración de una carta de un mazo con imágenes (public/cartas/<mazo>/<id>.webp). */
export function cartaComoDataUri(mazo: IdMazo, id: string) {
  return webpComoDataUri(path.join(process.cwd(), "public", "cartas", mazo, `${id}.webp`), { alto: 527 });
}

/** Moneda dorada (signo occidental o animal chino), reducida para la tarjeta. */
export function monedaComoDataUri(carpeta: "signos" | "animales", id: string) {
  return webpComoDataUri(path.join(process.cwd(), "public", carpeta, `${id}.webp`), { lado: 260 });
}

/** El aura (dos colores en halos difusos) como data URI PNG de 520 px. */
export async function auraComoDataUri(principal: ColorAura, secundario: ColorAura) {
  const a = TONO_AURA[principal];
  const b = TONO_AURA[secundario];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520" viewBox="0 0 520 520">
    <defs>
      <radialGradient id="p" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${a}" stop-opacity="0.95"/><stop offset="0.55" stop-color="${a}" stop-opacity="0.45"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
      <radialGradient id="s" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${b}" stop-opacity="0.9"/><stop offset="0.6" stop-color="${b}" stop-opacity="0.3"/><stop offset="1" stop-color="${b}" stop-opacity="0"/></radialGradient>
      <radialGradient id="n" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.95"/><stop offset="0.35" stop-color="#f1d99a" stop-opacity="0.5"/><stop offset="1" stop-color="#f1d99a" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="260" cy="260" r="250" fill="url(#p)"/>
    <circle cx="300" cy="215" r="170" fill="url(#s)"/>
    <circle cx="225" cy="300" r="150" fill="url(#s)" opacity="0.7"/>
    <circle cx="260" cy="260" r="95" fill="url(#n)"/>
  </svg>`;
  try {
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return "";
  }
}
