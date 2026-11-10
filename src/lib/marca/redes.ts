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

/** Grupo de Facebook de la comunidad; miarcana.com/grupo redirige aquí (next.config.ts). */
export const GRUPO_FACEBOOK = { nombre: "Carta Astral y Tarot en Español · Arcana", corto: "miarcana.com/grupo", url: "https://www.facebook.com/groups/881840954952633" } as const;

/** Canal de WhatsApp (carta del día, avisos de los directos); miarcana.com/canal redirige aquí (next.config.ts). */
export const CANAL_WHATSAPP = { nombre: "Arcana · Sibila te lee", corto: "miarcana.com/canal", url: "https://whatsapp.com/channel/0029Vb8bJ1b2UPBE8HCj9L0o" } as const;

/** Mensaje directo de Instagram (lo responde Sibila): respaldo de la atención por WhatsApp. */
export const MENSAJE_INSTAGRAM = { usuario: "@miarcana.oficial", url: "https://ig.me/m/miarcana.oficial" } as const;

// ---------------------------------------------------------------------------
// Hub de redes (miarcana.com/redes): una sola página con todos los canales,
// para la biografía de cada red, los correos, los videos y el QR impreso.
// ---------------------------------------------------------------------------

export type IconoCanal = "instagram" | "tiktok" | "facebook" | "whatsapp" | "youtube" | "telegram" | "carta" | "mensaje";

export interface CanalHub {
  /** Id corto: es lo que se guarda por cada clic. */
  id: string;
  icono: IconoCanal;
  url: string;
  /** Botón destacado (el primero). */
  principal?: boolean;
  /** Color del icono (CSS). */
  color: string;
}

/** Canales del hub, en el orden en que se muestran. Los textos viven en el diccionario (t.hub.canales). */
export const CANALES_HUB: CanalHub[] = [
  { id: "carta", icono: "carta", url: "https://miarcana.com/", principal: true, color: "#d9b45a" },
  ...(TELEGRAM.activo ? [{ id: "telegram", icono: "telegram" as const, url: TELEGRAM.url, color: "#229ED9" }] : []),
  { id: "canal", icono: "whatsapp", url: CANAL_WHATSAPP.url, color: "#25D366" },
  { id: "instagram", icono: "instagram", url: REDES[0].url, color: "#E1306C" },
  { id: "tiktok", icono: "tiktok", url: REDES[1].url, color: "#69C9D0" },
  { id: "youtube", icono: "youtube", url: REDES[3].url, color: "#FF0000" },
  { id: "facebook", icono: "facebook", url: REDES[2].url, color: "#1877F2" },
  { id: "grupo", icono: "facebook", url: GRUPO_FACEBOOK.url, color: "#1877F2" },
  { id: "mensaje", icono: "mensaje", url: MENSAJE_INSTAGRAM.url, color: "#E1306C" },
];

/** Código de origen del hub (?ref=instagram-bio): minúsculas, números y guiones, de 2 a 40. */
export const REF_HUB = /^[a-z0-9][a-z0-9_-]{1,39}$/;

export function refHubValido(v: string | null | undefined): string {
  const c = (v ?? "").trim().toLowerCase();
  return REF_HUB.test(c) ? c : "";
}

/** Enlace del hub con su código de origen, para pegar en cada sitio. */
export function enlaceHub(ref: string, base = "https://miarcana.com") {
  return `${base.replace(/\/$/, "")}/redes${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;
}

/**
 * El código del hub se escribe «red-lugar» (instagram-bio, youtube-descripcion,
 * video-qr): la red es lo que va antes del primer guion y se convierte en el
 * origen de la visita (utm_source), igual que los enlaces cortos /ig, /yt…
 */
export function origenDesdeRef(ref: string): { fuente: string; medio: string } {
  const [fuente, ...resto] = ref.split("-");
  return { fuente: fuente || "hub", medio: resto.join("-") || "hub" };
}
