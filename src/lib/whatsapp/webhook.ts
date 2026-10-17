import "server-only";
import { after } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { extraerMensajes, marcarLeido, enviarTexto, whatsappConfigurado, type AvisoWhatsapp } from "./api";
import { atender } from "./sibila";

/**
 * Atiende un aviso de WhatsApp ya verificado (firma) y parseado: responde a
 * Meta de inmediato y deja a Sibila trabajando con `after`. Lo usan
 * /api/webhooks/whatsapp y, por si el webhook de WhatsApp quedó apuntando
 * allí, /api/webhooks/meta.
 */
export function atenderAvisoWhatsapp(aviso: AvisoWhatsapp): { status: number; cuerpo: Record<string, unknown> } {
  if (!whatsappConfigurado()) return { status: 503, cuerpo: { ok: false, motivo: "sin_configurar" } };
  const mensajes = extraerMensajes(aviso);
  console.info(`[whatsapp] aviso recibido: ${mensajes.length} mensaje(s)`);
  if (!mensajes.length) return { status: 200, cuerpo: { ok: true, ignorado: "sin_mensajes" } };

  const trabajo = (async () => {
    const admin = getSupabaseAdmin();
    for (const { mensaje, nombre } of mensajes) {
      try {
        await marcarLeido(mensaje.id);
        if (mensaje.type === "text" && mensaje.text?.body?.trim()) {
          await atender(admin, mensaje.from, nombre, mensaje.id, mensaje.text.body.trim());
        } else {
          await admin.from("mensajes_whatsapp").insert({ telefono: mensaje.from, nombre, rol: "persona", contenido: `[${mensaje.type}]`, id_meta: mensaje.id, tipo: mensaje.type });
          await enviarTexto(mensaje.from, "Por aquí solo leo texto 🌙 Las fotos y audios van en la app: miarcana.com. ¿En qué te ayudo?");
        }
      } catch (e) {
        console.error("[whatsapp]", mensaje.id, e instanceof Error ? e.message : e);
      }
    }
  })();
  after(() => trabajo);
  return { status: 200, cuerpo: { ok: true, recibidos: mensajes.length } };
}
