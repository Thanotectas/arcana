import type { Metadata } from "next";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { datosBot, estadoWebhook, telegramConfigurado, type BotTelegram, type EstadoWebhook } from "@/lib/telegram/api";
import { ConectarTelegram } from "@/components/admin/ConectarTelegram";
import { RespuestaTelegram } from "@/components/admin/RespuestaTelegram";

export const metadata: Metadata = { title: "Telegram", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface Mensaje {
  id: number;
  chat_id: number;
  nombre: string | null;
  usuario: string | null;
  rol: "persona" | "asistente";
  contenido: string;
  tipo: string;
  humano: boolean;
  creado_en: string;
}

function hora(iso: string) {
  return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(iso));
}

/** Bot de Telegram atendido por Sibila: estado, suscriptores de la carta diaria y conversaciones. Solo administración. */
export default async function PaginaTelegram() {
  await requerirAdmin();
  let bot: BotTelegram | null = null;
  let webhook: EstadoWebhook | null = null;
  let error: string | null = null;
  if (telegramConfigurado()) {
    try {
      [bot, webhook] = await Promise.all([datosBot(), estadoWebhook()]);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }
  const admin = getSupabaseAdmin();
  // Tablas de la migración 0038: si aún no existen, las secciones quedan vacías.
  const [{ data }, { count: suscriptores }] = await Promise.all([
    admin.from("mensajes_telegram").select("id, chat_id, nombre, usuario, rol, contenido, tipo, humano, creado_en").order("creado_en", { ascending: false }).limit(400),
    admin.from("suscriptores_telegram").select("chat_id", { count: "exact", head: true }).eq("activo", true),
  ]);
  const mensajes = (data ?? []) as Mensaje[];
  const porChat = new Map<number, Mensaje[]>();
  for (const m of mensajes) porChat.set(m.chat_id, [...(porChat.get(m.chat_id) ?? []), m]);
  const conversaciones = [...porChat.entries()].map(([chatId, lista]) => ({
    chatId,
    nombre: lista.find((m) => m.nombre)?.nombre ?? null,
    usuario: lista.find((m) => m.usuario)?.usuario ?? null,
    mensajes: lista.reverse(),
    pideHumano: lista.some((m) => m.humano),
  }));
  const conectado = Boolean(webhook?.url);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Telegram</h1>
        <p className="mt-2 text-texto-suave">
          Sibila atiende el bot con lo que sabe de Arcana, manda la carta del día (/carta) y cada mañana a quienes escribieron /diaria. Avisa por correo cuando alguien pide una persona.{" "}
          {!telegramConfigurado() && <span className="text-peligro">Falta TELEGRAM_BOT_TOKEN en Vercel (lo da @BotFather).</span>}
        </p>
      </div>

      {telegramConfigurado() && (
        <section className="tarjeta space-y-4 p-5">
          <h2 className="font-display text-2xl font-semibold">Estado del bot</h2>
          {error && <p className="text-sm text-peligro">{error}</p>}
          {bot && (
            <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              <dt className="text-texto-suave">Bot</dt>
              <dd>
                {bot.first_name}{" "}
                {bot.username && (
                  <a href={`https://t.me/${bot.username}`} target="_blank" rel="noopener noreferrer" className="text-oro-suave underline">
                    @{bot.username}
                  </a>
                )}
              </dd>
              <dt className="text-texto-suave">Webhook</dt>
              <dd className={conectado ? "text-exito" : "text-oro-suave"}>{conectado ? "conectado" : "sin conectar"}</dd>
              <dt className="text-texto-suave">Avisos en espera</dt>
              <dd>{webhook?.pending_update_count ?? 0}</dd>
              <dt className="text-texto-suave">Carta diaria</dt>
              <dd>{suscriptores ?? 0} suscriptores</dd>
              {webhook?.last_error_message && (
                <>
                  <dt className="text-texto-suave">Último error</dt>
                  <dd className="text-peligro">{webhook.last_error_message}</dd>
                </>
              )}
            </dl>
          )}
          <ConectarTelegram conectado={conectado} />
        </section>
      )}

      <h2 className="font-display text-2xl font-semibold">Conversaciones</h2>
      {conversaciones.length === 0 && <p className="text-sm text-texto-suave">Todavía no ha escrito nadie.</p>}
      {conversaciones.map((c) => (
        <details key={c.chatId} className="tarjeta p-5" open={c.pideHumano}>
          <summary className="flex cursor-pointer flex-wrap items-baseline justify-between gap-2">
            <span className="font-display text-xl font-semibold">{c.nombre ?? (c.usuario ? `@${c.usuario}` : c.chatId)}</span>
            <span className="text-xs text-texto-suave">
              {c.usuario && <span className="mr-3">@{c.usuario}</span>}
              {c.mensajes.length} mensajes · {hora(c.mensajes[c.mensajes.length - 1].creado_en)}
              {c.pideHumano && <span className="ml-3 uppercase tracking-[0.2em] text-peligro">pide persona</span>}
            </span>
          </summary>
          <div className="mt-4 space-y-2">
            {c.mensajes.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${m.rol === "persona" ? "bg-violeta/20" : m.tipo === "humano" ? "ml-auto border border-exito/40 bg-superficie" : "ml-auto border border-oro/30 bg-superficie"}`}>
                <p className="whitespace-pre-wrap">{m.contenido}</p>
                <p className="mt-1 text-[11px] text-texto-suave">{m.rol === "persona" ? c.nombre ?? "Persona" : m.tipo === "humano" ? "Tú" : "Sibila"} · {hora(m.creado_en)}</p>
              </div>
            ))}
            <RespuestaTelegram chatId={c.chatId} />
          </div>
        </details>
      ))}
    </div>
  );
}
