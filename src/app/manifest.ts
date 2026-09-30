import type { MetadataRoute } from "next";

/** Manifiesto PWA: permite instalar Arcana y recibir avisos push (en iPhone, solo instalada). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Arcana",
    short_name: "Arcana",
    description: "Tarot, carta astral, numerología y quiromancia con lecturas escritas para ti.",
    start_url: "/hoy",
    scope: "/",
    display: "standalone",
    background_color: "#0b0716",
    theme_color: "#0b0716",
    lang: "es",
    icons: [
      { src: "/marca/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marca/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
