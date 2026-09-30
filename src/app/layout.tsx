import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { Encabezado } from "@/components/Encabezado";
import { PiePagina } from "@/components/PiePagina";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcana — Tarot, carta astral y numerología",
    template: "%s · Arcana",
  },
  description:
    "Lecturas de tarot, carta astral completa, numerología, compatibilidad y horóscopo diario, interpretadas para ti.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "Arcana",
    description: "Tarot, carta astral y numerología con interpretación personalizada.",
    type: "website",
    locale: "es_CO",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <div className="estrellas" aria-hidden />
        <Encabezado />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
        <PiePagina />
      </body>
    </html>
  );
}
