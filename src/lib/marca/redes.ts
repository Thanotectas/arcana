/** Cuentas oficiales de Arcana en redes. */
export const REDES = [
  { id: "instagram", nombre: "Instagram", usuario: "@miarcana.oficial", url: "https://www.instagram.com/miarcana.oficial" },
  { id: "tiktok", nombre: "TikTok", usuario: "@miarcana4", url: "https://www.tiktok.com/@miarcana4" },
  { id: "facebook", nombre: "Facebook", usuario: "Mi Arcana", url: "https://www.facebook.com/profile.php?id=61594894293890" },
] as const;

/**
 * Línea de WhatsApp de atención (la responde Sibila; ver docs/WHATSAPP.md).
 * `activo: false` mientras Meta tenga la cuenta inhabilitada (desde el 12 oct
 * 2026, revisión pedida el 17 oct): el botón «Escríbenos» lleva entonces a
 * los mensajes de Instagram, que también responde Sibila. Al recuperarla,
 * volver a `true`.
 */
export const WHATSAPP = {
  activo: false,
  numero: "573001277552",
  visible: "+57 300 127 7552",
  url: "https://wa.me/573001277552?text=Hola%2C%20quiero%20saber%20m%C3%A1s%20de%20Arcana",
} as const;

/** Mensaje directo de Instagram (lo responde Sibila): respaldo de la atención por WhatsApp. */
export const MENSAJE_INSTAGRAM = { usuario: "@miarcana.oficial", url: "https://ig.me/m/miarcana.oficial" } as const;
