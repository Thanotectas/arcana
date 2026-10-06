/** Cuentas oficiales de Arcana en redes. */
export const REDES = [
  { id: "instagram", nombre: "Instagram", usuario: "@miarcana.oficial", url: "https://www.instagram.com/miarcana.oficial" },
  { id: "tiktok", nombre: "TikTok", usuario: "@miarcana4", url: "https://www.tiktok.com/@miarcana4" },
  { id: "facebook", nombre: "Facebook", usuario: "Mi Arcana", url: "https://www.facebook.com/profile.php?id=61594894293890" },
] as const;

/** Línea de WhatsApp de atención (la responde Sibila; ver docs/WHATSAPP.md). */
export const WHATSAPP = {
  numero: "573001277552",
  visible: "+57 300 127 7552",
  url: "https://wa.me/573001277552?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20de%20Arcana",
} as const;
