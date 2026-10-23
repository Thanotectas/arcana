"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { sitio } from "@/lib/correo";
import { conectarWebhook, enviarTexto, telegramConfigurado } from "./api";

export interface EstadoTelegram {
  error?: string;
  mensaje?: string;
}

/** Registra el webhook y el menú de comandos del bot. */
export async function accionConectarTelegram(): Promise<EstadoTelegram> {
  await requerirAdmin();
  if (!telegramConfigurado()) return { error: "Falta TELEGRAM_BOT_TOKEN en Vercel." };
  try {
    await conectarWebhook(`${sitio()}/api/webhooks/telegram`);
    revalidatePath("/admin/telegram");
    return { mensaje: "Bot conectado: Telegram ya manda los mensajes a Sibila y el menú de comandos quedó listo." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo conectar." };
  }
}

/** Respuesta escrita por una persona del equipo desde el panel (Telegram no tiene ventana de 24 horas). */
export async function accionResponderTelegram(_prev: EstadoTelegram, formData: FormData): Promise<EstadoTelegram> {
  await requerirAdmin();
  if (!telegramConfigurado()) return { error: "Falta TELEGRAM_BOT_TOKEN en Vercel." };
  const chatId = Number(formData.get("chat"));
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 4000);
  if (!Number.isSafeInteger(chatId) || !texto) return { error: "Falta el texto." };
  try {
    await enviarTexto(chatId, texto);
    await getSupabaseAdmin().from("mensajes_telegram").insert({ chat_id: chatId, rol: "asistente", contenido: texto, tipo: "humano" });
    revalidatePath("/admin/telegram");
    return { mensaje: "Enviado." };
  } catch (e) {
    const detalle = e instanceof Error ? e.message : "No se pudo enviar.";
    return { error: /blocked|deactivated/i.test(detalle) ? "La persona bloqueó al bot o borró el chat: ya no se le puede escribir." : detalle };
  }
}
