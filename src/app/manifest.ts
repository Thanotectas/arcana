import type { MetadataRoute } from "next";

/** Manifiesto PWA: permite instalar Arcana y recibir avisos push (en iPhone, solo instalada). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Arcana: tarot, carta astral y más",
    short_name: "Arcana",
    description: "Tarot con cartas reales, carta astral calculada, numerología, lectura de la mano, I Ching y calendario chino, con lecturas escritas para ti y tu cielo de cada día.",
    start_url: "/inicio?app=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0716",
    theme_color: "#0b0716",
    lang: "es",
    categories: ["lifestyle", "entertainment"],
    icons: [
      { src: "/marca/icono-192.png", sizes: "192x192", type: "image/png" },
      { src: "/marca/icono-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/marca/icono-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Tu cielo hoy", url: "/hoy", icons: [{ src: "/marca/icono-192.png", sizes: "192x192" }] },
      { name: "Carta del día", url: "/tarot?tirada=tarot_carta", icons: [{ src: "/marca/icono-192.png", sizes: "192x192" }] },
      { name: "Hablar con Sibila", url: "/inicio?sibila=1", icons: [{ src: "/marca/icono-192.png", sizes: "192x192" }] },
    ],
  };
}
