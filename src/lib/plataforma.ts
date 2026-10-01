import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

export type Plataforma = "web" | "pwa" | "android";

/** Desde dónde abrió la persona: la app de Google Play, la PWA instalada o el navegador. */
export const getPlataforma = cache(async (): Promise<Plataforma> => {
  const v = (await cookies()).get("plataforma")?.value;
  return v === "android" || v === "pwa" ? v : "web";
});

/**
 * En la app de Google Play no se venden créditos (Play exige su propia
 * facturación para bienes digitales): se ocultan los botones de compra.
 */
export async function comprasVisibles() {
  return (await getPlataforma()) !== "android";
}
