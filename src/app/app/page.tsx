import type { Metadata } from "next";
import QRCode from "qrcode";
import { GuiaInstalar } from "@/components/GuiaInstalar";
import { sitio } from "@/lib/correo";

export const metadata: Metadata = {
  title: "Instala Arcana en tu celular",
  description: "Arcana en tu pantalla de inicio: la carta escondida de cada día, tu cielo de hoy y Sibila a un toque. Gratis, casi no ocupa espacio y te regala 1 crédito.",
  alternates: { canonical: "/app" },
  openGraph: { title: "Instala Arcana en tu celular", description: "Tu carta escondida y tu cielo de hoy, a un toque. Y 1 crédito de regalo." },
};

export default async function PaginaApp() {
  const qr = await QRCode.toString(`${sitio()}/app`, { type: "svg", margin: 1, color: { dark: "#0b0716", light: "#f1d99a" } });
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <header className="space-y-3 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- ícono estático */}
        <img src="/marca/icono-512.png" alt="" className="mx-auto h-24 w-24 rounded-3xl shadow-[0_0_60px_rgba(139,108,246,0.5)]" />
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Gratis · casi no ocupa espacio</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Arcana en tu celular</h1>
        <p className="mx-auto max-w-md text-texto-suave">Tu carta escondida, tu cielo de hoy y Sibila, a un toque desde tu pantalla de inicio.</p>
      </header>

      <GuiaInstalar qr={qr} />

      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          { i: "🔮", t: "El Camino del Loco", d: "Adivina cada día la carta que Sibila escondió y no pierdas tu racha." },
          { i: "🔔", t: "Avisos a tiempo", d: "Te aviso cuando haya carta nueva y cuando tu racha esté en riesgo." },
          { i: "🎁", t: "1 crédito de regalo", d: "La primera vez que abres Arcana instalada, con tu cuenta." },
          { i: "⚡", t: "Abre al instante", d: "Sin buscarla en el navegador. Casi no ocupa espacio y se actualiza sola." },
        ].map((b) => (
          <li key={b.t} className="tarjeta flex gap-3 p-4">
            <span className="text-2xl">{b.i}</span>
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
