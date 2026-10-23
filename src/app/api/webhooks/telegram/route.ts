import { after, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { secretoValido, type AvisoTelegram } from "@/lib/telegram/api";
import { atenderTelegram } from "@/lib/telegram/sibila";

// Sibila tarda unos segundos en responder; Telegram solo espera el 200.
export const maxDuration = 60;

/**
 * Webhook del bot de Telegram. Se registra desde /admin/telegram («Conectar
 * el bot»), que le da a Telegram la URL https://miarcana.com/api/webhooks/telegram
 * y el secreto que vuelve en X-Telegram-Bot-Api-Secret-Token.
 */
export async function POST(request: Request) {
  if (!secretoValido(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let aviso: AvisoTelegram;
  try {
    aviso = (await request.json()) as AvisoTelegram;
  } catch {
    return NextResponse.json({ ok: true });
  }
  // Respondemos de inmediato y atendemos después (Telegram reintenta si tardamos).
  after(async () => {
    try {
      const r = await atenderTelegram(getSupabaseAdmin(), aviso);
      console.info(`[telegram] ${aviso.update_id}: ${r}`);
    } catch (e) {
      console.error("[telegram]", aviso.update_id, e instanceof Error ? e.message : e);
    }
  });
  return NextResponse.json({ ok: true });
}
