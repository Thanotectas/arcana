/** Cuentas oficiales de Arcana en redes. */
export const REDES = [
  { id: "instagram", nombre: "Instagram", usuario: "@miarcana.oficial", url: "https://www.instagram.com/miarcana.oficial" },
  { id: "tiktok", nombre: "TikTok", usuario: "@miarcana4", url: "https://www.tiktok.com/@miarcana4" },
  { id: "facebook", nombre: "Facebook", usuario: "Mi Arcana", url: "https://www.facebook.com/profile.php?id=61594894293890" },
  { id: "youtube", nombre: "YouTube", usuario: "@miarcana", url: "https://www.youtube.com/@miarcana" },
] as const;

/**
 * Línea de WhatsApp de atención (la responde Sibila; ver docs/WHATSAPP.md).
 * `activo: false`: Meta desactivó la cuenta el 12 oct 2026 y la revisión
 * confirmó la decisión (permanente, 23 oct). El botón «Escríbenos» lleva a
 * los mensajes de Instagram, que también responde Sibila.
 */
export const WHATSAPP = {
  activo: false,
  numero: "573001277552",
  visible: "+57 300 127 7552",
  url: "https://wa.me/573001277552?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20de%20Arcana",
} as const;

/**
 * Bot de Telegram de Sibila (reemplaza a WhatsApp; ver docs/TELEGRAM.md). El
 * usuario del bot va en NEXT_PUBLIC_TELEGRAM_BOT (sin @); sin él no se muestra.
 */
const BOT_TELEGRAM = (process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "").replace(/^@/, "").trim();
export const TELEGRAM = { activo: Boolean(BOT_TELEGRAM), usuario: BOT_TELEGRAM ? `@${BOT_TELEGRAM}` : "", url: BOT_TELEGRAM ? `https://t.me/${BOT_TELEGRAM}` : "" } as const;

/** Mensaje directo de Instagram (lo responde Sibila): respaldo de la atención por WhatsApp. */
export const MENSAJE_INSTAGRAM = { usuario: "@miarcana.oficial", url: "https://ig.me/m/miarcana.oficial" } as const;
