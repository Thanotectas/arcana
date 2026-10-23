import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Bot de Telegram (Bot API). Se crea con @BotFather y su token va en
 * TELEGRAM_BOT_TOKEN (Vercel, sensible). El webhook se registra desde
 * /admin/telegram; Telegram manda en cada aviso el encabezado
 * X-Telegram-Bot-Api-Secret-Token, que se deriva del token (no hay que
 * guardar otra variable).
 * Documentación: https://core.telegram.org/bots/api
 */
export function telegramConfigurado() {
  return Boolean(token());
}

function token() {
  return (process.env.TELEGRAM_BOT_TOKEN ?? "").trim();
}

/** Secreto del webhook: derivado del token, solo letras y números como pide Telegram. */
export function secretoWebhook() {
  return createHash("sha256").update(`arcana-telegram:${token()}`).digest("hex").slice(0, 48);
}

export function secretoValido(recibido: string | null) {
  if (!recibido || !telegramConfigurado()) return false;
  const a = Buffer.from(secretoWebhook());
  const b = Buffer.from(recibido);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function llamar<T>(metodo: string, cuerpo?: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${token()}/${metodo}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo ?? {}),
    cache: "no-store",
  });
  const d = (await res.json().catch(() => ({}))) as { ok?: boolean; result?: T; description?: string; error_code?: number };
  if (!res.ok || !d.ok) throw new Error(`Telegram ${metodo}: ${d.description ?? res.status}`);
  return d.result as T;
}

export interface BotTelegram {
  id: number;
  username?: string;
  first_name?: string;
}

export function datosBot() {
  return llamar<BotTelegram>("getMe");
}

export interface EstadoWebhook {
  url: string;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
}

export function estadoWebhook() {
  return llamar<EstadoWebhook>("getWebhookInfo");
}

/** Registra el webhook y los comandos del menú del bot. */
export async function conectarWebhook(url: string) {
  await llamar("setWebhook", { url, secret_token: secretoWebhook(), allowed_updates: ["message"], drop_pending_updates: false, max_connections: 20 });
  await llamar("setMyCommands", {
    commands: [
      { command: "carta", description: "Tu carta del día (gratis)" },
      { command: "diaria", description: "Recibir la carta del día cada mañana" },
      { command: "parar", description: "Dejar de recibir la carta diaria" },
      { command: "persona", description: "Hablar con alguien del equipo" },
    ],
    language_code: "es",
  });
  await llamar("setMyDescription", {
    description: "Soy Sibila, la guía de Arcana 🔮 Te cuento cómo funciona la app, te mando la carta del día gratis y, si quieres, te la envío cada mañana. Las lecturas personales están en miarcana.com.",
  });
  await llamar("setMyShortDescription", { short_description: "Sibila, de Arcana: carta del día gratis y respuestas sobre tarot y astrología 🔮" });
}

export function enviarTexto(chatId: number, texto: string) {
  return llamar<{ message_id: number }>("sendMessage", { chat_id: chatId, text: texto.slice(0, 4000), link_preview_options: { is_disabled: true } });
}

export function enviarFoto(chatId: number, foto: string, pie: string) {
  return llamar<{ message_id: number }>("sendPhoto", { chat_id: chatId, photo: foto, caption: pie.slice(0, 1000) });
}

export function escribiendo(chatId: number) {
  return llamar("sendChatAction", { chat_id: chatId, action: "typing" }).catch(() => null);
}

/** Lo que nos interesa de un aviso de Telegram (solo mensajes de texto en chats privados). */
export interface AvisoTelegram {
  update_id: number;
  message?: {
    message_id: number;
    text?: string;
    chat: { id: number; type: string };
    from?: { id: number; is_bot?: boolean; first_name?: string; last_name?: string; username?: string; language_code?: string };
  };
}
