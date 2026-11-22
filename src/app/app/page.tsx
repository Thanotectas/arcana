import type { Metadata } from "next";
import QRCode from "qrcode";
import { GuiaInstalar } from "@/components/GuiaInstalar";
import { sitio } from "@/lib/correo";
import { getIdioma } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import { TEXTOS_INSTALAR } from "@/lib/instalar-textos";

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const { meta } = TEXTOS_INSTALAR[idioma];
  return {
    title: meta.titulo,
    description: meta.descripcion,
    alternates: alternativas("/app", idioma),
    openGraph: { title: meta.titulo, description: meta.ogDescripcion },
  };
}

const ICONOS = ["🔮", "🔔", "🎁", "⚡"];

export default async function PaginaApp() {
  const tx = TEXTOS_INSTALAR[await getIdioma()];
  const qr = await QRCode.toString(`${sitio()}/app`, { type: "svg", margin: 1, color: { dark: "#0b0716", light: "#f1d99a" } });
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header className="space-y-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático */}
        <img src="/marca/icono-512.png" alt="" className="mx-auto h-24 w-24 rounded-3xl shadow-[0_0_60px_rgba(139,108,246,0.5)]" />
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave rtl:tracking-normal">{tx.etiqueta}</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{tx.titulo}</h1>
        <p className="mx-auto max-w-md text-texto-suave">{tx.subtitulo}</p>
      </header>

      <GuiaInstalar qr={qr} />

      <ul className="grid gap-3 sm:grid-cols-2">
        {tx.ventajas.map((b, n) => (
          <li key={b.t} className="tarjeta flex gap-3 p-4">
            <span className="text-2xl">{ICONOS[n]}</span>
            <div>
              <p className="font-semibold">{b.t}</p>
              <p className="text-sm text-texto-suave">{b.d}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
