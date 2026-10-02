import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import type { IdMazo } from "@/lib/tarot/mazos";

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
