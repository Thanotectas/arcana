import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Encabezado } from "@/components/Encabezado";
import { PiePagina } from "@/components/PiePagina";
import { ProveedorIdioma } from "@/lib/i18n/cliente";
import { getIdioma, getT } from "@/lib/i18n/servidor";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: { default: t.meta.tituloPredeterminado, template: "%s · Arcana" },
    description: t.meta.descripcion,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    openGraph: { title: "Arcana", description: t.meta.descripcion, type: "website" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [idioma, t] = await Promise.all([getIdioma(), getT()]);
  return (
    <html lang={idioma} className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <ProveedorIdioma idioma={idioma} t={t}>
          <div className="estrellas" aria-hidden />
          <Encabezado />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
          <PiePagina />
        </ProveedorIdioma>
      </body>
    </html>
  );
}
