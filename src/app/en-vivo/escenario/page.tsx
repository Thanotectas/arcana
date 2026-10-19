import type { Metadata } from "next";
import QRCode from "qrcode";
import { statSync } from "node:fs";
import { join } from "node:path";
import { claveValida } from "@/lib/en-vivo";
import { sitio } from "@/lib/correo";
import { EscenarioEnVivo } from "@/components/EscenarioEnVivo";

export const metadata: Metadata = { title: "Sibila en vivo", robots: { index: false, follow: false } };

/** Escenario de «Sibila en vivo» para OBS (fuente de navegador 1920×1080). Solo con la clave de /admin/en-vivo. */
export default async function PaginaEscenario({ searchParams }: { searchParams: Promise<{ clave?: string }> }) {
  const { clave } = await searchParams;
  if (!claveValida(clave ?? null)) {
    return <p className="p-10 text-center text-texto-suave">Falta la clave del escenario: copia la dirección completa desde /admin/en-vivo.</p>;
  }
  const qr = await QRCode.toString(`${sitio()}/vivo`, { type: "svg", margin: 1, color: { dark: "#0b0716", light: "#f1d99a" } });
  // Retrato realista (public/marca/sibila/{base,habla,ojos}.jpg); si falta alguno, el rostro vectorial.
  let retrato: string | null = null;
  try {
    const fechas = ["base", "habla", "ojos"].map((n) => statSync(join(process.cwd(), "public", "marca", "sibila", `${n}.jpg`)).mtimeMs);
    retrato = String(Math.floor(Math.max(...fechas)));
  } catch {
    retrato = null;
  }
  return <EscenarioEnVivo clave={clave as string} qr={qr} retrato={retrato} />;
}
