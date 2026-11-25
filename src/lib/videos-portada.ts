import type { Idioma } from "@/lib/i18n/idiomas";
import type { VideoCarrusel } from "@/components/CarruselVideos";

/**
 * Carrusel «Sibila en video» de la portada: cada idioma ve solo los videos grabados en su idioma (archivos livianos
 * en /public/videos/portada, 540×960). Si un idioma aún no tiene videos, la sección no se muestra.
 */
export const VIDEOS_PORTADA: Record<Idioma, VideoCarrusel[]> = {
  es: [
    { id: "mal-de-ojo", titulo: "El mal de ojo en el mundo", href: "/biblioteca/mal-de-ojo" },
    { id: "yildizname", titulo: "El Yıldızname: tu estrella", href: "/yildizname" },
    { id: "geomancia", titulo: "La ciencia de la arena", href: "/geomancia" },
    { id: "comunidad", titulo: "La Comunidad Arcana", href: "/comunidad" },
    { id: "runas", titulo: "Las runas de Sibila", href: "/runas" },
    { id: "abundancia", titulo: "El ritual de la abundancia", href: "/rituales" },
    { id: "mano", titulo: "¿Qué dice tu mano?", href: "/quiromancia" },
    { id: "trabajo", titulo: "Ritual para atraer trabajo", href: "/rituales" },
    { id: "chocolate", titulo: "Lo que dice tu taza de chocolate", href: "/chocolate" },
    { id: "velas", titulo: "Qué vela encender", href: "/velas" },
    { id: "aura", titulo: "¿De qué color está tu aura?", href: "/aura" },
    { id: "suenos", titulo: "Lo que dicen tus sueños", href: "/suenos" },
    { id: "carta-astral", titulo: "Tu carta astral", href: "/carta-astral" },
  ],
  pt: [
    { id: "pt/mal-de-ojo", titulo: "O mau-olhado pelo mundo", href: "/biblioteca/mal-de-ojo" },
    { id: "pt/limpieza-huevo", titulo: "A limpeza com ovo", href: "/biblioteca/limpia-con-huevo" },
  ],
  en: [{ id: "en/mal-de-ojo", titulo: "The evil eye around the world", href: "/biblioteca/mal-de-ojo" }],
  fr: [
    { id: "fr/mal-de-ojo", titulo: "Le mauvais œil dans le monde", href: "/biblioteca/mal-de-ojo" },
    { id: "fr/cafe", titulo: "La lecture du café", href: "/biblioteca/lectura-del-cafe" },
    { id: "fr/yildizname", titulo: "Le Yıldızname : ton étoile", href: "/yildizname" },
  ],
  tr: [
    { id: "tr/mal-de-ojo", titulo: "Dünyada nazar", href: "/biblioteca/mal-de-ojo" },
    { id: "tr/cafe", titulo: "Kahve falı", href: "/biblioteca/lectura-del-cafe" },
    { id: "tr/yildizname", titulo: "Yıldızname: yıldızın", href: "/yildizname" },
  ],
  ar: [
    { id: "ar/mal-de-ojo", titulo: "العين حول العالم", href: "/biblioteca/mal-de-ojo" },
    { id: "ar/cafe", titulo: "قراءة الفنجان", href: "/biblioteca/lectura-del-cafe" },
    { id: "ar/yildizname", titulo: "يلدز نامه: نجمك", href: "/yildizname" },
    { id: "ar/geomancia", titulo: "علم الرمل", href: "/geomancia" },
    { id: "ar/comunidad", titulo: "مجتمع أركانا", href: "/comunidad" },
  ],
  id: [],
  hi: [],
};
