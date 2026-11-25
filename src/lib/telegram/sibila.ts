import "server-only";
import { VOZ_NATURAL } from "@/lib/redes/voz-sibila";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { cartaDelDia, fechaBogota, frase, mazoDelDia } from "@/lib/redes/carta-dia";
import { MAZOS } from "@/lib/tarot/mazos";
import { hechos } from "@/lib/whatsapp/sibila";
import { enviarFoto, enviarTexto, escribiendo, type AvisoTelegram } from "./api";
import { IDIOMAS, IDIOMA_PARA_IA, type Idioma } from "@/lib/i18n/idiomas";
import { nombreCarta } from "@/lib/juego/cartas-idiomas";
import { idiomaConversacion } from "@/lib/redes/respuestas-fijas";
import { TEXTOS_TELEGRAM } from "./textos";

/**
 * Sibila en Telegram: el mismo agente de atención que tenía WhatsApp (dudas
 * sobre Arcana, precios, cómo entrar y pagar), la carta del día gratis y la
 * suscripción para recibirla cada mañana. No hace lecturas: viven en la app.
 */
type Admin = SupabaseClient<Database>;

const MARCA_CARTA = "«ENVIAR_CARTA»";
const MARCA_HUMANO = "«PASAR_A_PERSONA»";
const MAXIMO_POR_DIA = 40;
const CONTEXTO = 16;

const INSTRUCCIONES = `Estás atendiendo el chat de Telegram de Arcana (@ del bot de Sibila). Responde como Sibila, cálida y breve.
Reglas de este canal:
- Mensajes cortos: máximo 5 líneas o 500 caracteres. Sin títulos, sin tablas, sin listas largas, sin Markdown. Un emoji como mucho.
- Escribe SIEMPRE en el idioma en que te escriben (árabe, turco, inglés, francés, portugués, indonesio, hindi o el que sea); español solo si no se nota. Nunca digas que solo atiendes en algunos idiomas. Tutea.
- Cuando des un enlace a la app, escríbelo con /tg delante de la ruta para que sepamos que la persona vino de Telegram, y con el prefijo de su idioma si no es español: https://miarcana.com/tg/tarot (español), https://miarcana.com/tg/ar/tarot (árabe), https://miarcana.com/tg/tr/creditos (turco), https://miarcana.com/tg/en (inglés, inicio), etc. Te digo abajo cuál es su enlace de inicio.
- No hagas lecturas por aquí (ni tarot, ni carta astral, ni interpretar sueños o fotos): explica con cariño que las lecturas se hacen en la app, di cuánto cuesta esa lectura y manda el enlace. La única excepción es la carta del día para todos.
- Si la persona pide su carta del día, o pregunta qué carta salió hoy, escribe exactamente ${MARCA_CARTA} al final de tu respuesta y se enviará la imagen. Puedes contarle que con /diaria la recibe cada mañana.
- Si pide hablar con una persona, tiene un problema de pago o de cuenta que no puedas resolver con los hechos, o se molesta, escribe exactamente ${MARCA_HUMANO} al final: avisaremos a una persona del equipo, y dile que le escribirán por este mismo chat.
- Cuando la persona se despida o te agradezca al terminar, invítala una sola vez en la conversación a seguir a Arcana en redes: https://miarcana.com/redes?ref=telegram (todas las redes en una página). Sin insistir y nunca en medio de una duda.
- No inventes precios, funciones ni plazos. Si algo no está en los hechos, dilo.
- No pidas datos sensibles (contraseñas, números de tarjeta). Para la fecha de nacimiento o datos de la cuenta, remite a la app.
${VOZ_NATURAL}`;

/** Enlace de inicio con el prefijo del idioma (miarcana.com/tg, /tg/ar…). */
const enlaceInicio = (idioma: Idioma) => `https://miarcana.com/tg${idioma === "es" ? "" : `/${idioma}`}`;

function nombreDe(from: NonNullable<AvisoTelegram["message"]>["from"]) {
  const n = [from?.first_name, from?.last_name].filter(Boolean).join(" ").trim();
  return n ? n.slice(0, 80) : null;
}

const esIdioma = (v: unknown): v is Idioma => typeof v === "string" && (IDIOMAS as readonly string[]).includes(v);

/** Significado de la carta del día traducido una vez por idioma y día (en memoria: la carta diaria lo pide para muchos). */
const traducciones = new Map<string, Promise<string>>();
function significadoEn(fecha: string, idioma: Idioma): Promise<string> {
  const c = cartaDelDia(fecha);
  const original = frase(c.significado, 260);
  if (idioma === "es") return Promise.resolve(original);
  const clave = `${fecha}:${idioma}`;
  if (!traducciones.has(clave)) {
    traducciones.set(
      clave,
      generarTexto(
        `Traduce al ${IDIOMA_PARA_IA[idioma]} este significado de la carta del tarot «${nombreCarta(c, idioma)}». Devuelve solo la traducción, sin comillas ni comentarios.\n\n${original}`,
        "Eres traductora nativa de textos de tarot: traduce el sentido con naturalidad, como lo escribiría desde cero un hablante nativo. No agregues ni quites ideas.",
        { effort: "low", maxTokens: 600, nivel: "estandar", idioma },
      )
        .then((t) => t.trim() || original)
        .catch(() => {
          traducciones.delete(clave);
          return original;
        }),
    );
  }
  return traducciones.get(clave)!;
}

/** Envía la carta del día de hoy (imagen y texto corto) a un chat, en su idioma. */
export async function enviarCartaDelDia(chatId: number, idioma: Idioma = "es") {
  const fecha = fechaBogota();
  const c = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  const t = TEXTOS_TELEGRAM[idioma];
  const pie = `✨ ${t.carta}: ${nombreCarta(c, idioma)} (${mazo === "arcana" ? "Tarot Arcana" : MAZOS[mazo].nombre})\n\n${await significadoEn(fecha, idioma)}\n\n${t.paraTi(enlaceInicio(idioma))}`;
  await enviarFoto(chatId, `${sitio()}/api/redes/carta-dia?fecha=${fecha}`, pie.slice(0, 1024));
}

/** Idioma de la persona: el de su texto si se reconoce; si no, el de su Telegram; si no, el de la conversación previa. */
function idiomaDe(texto: string, codigo: string | undefined, anteriores: string[]): Idioma {
  const delTexto = texto.startsWith("/") ? null : idiomaConversacion(texto);
  if (delTexto && delTexto !== "es") return delTexto;
  const delTelegram = (codigo ?? "").slice(0, 2).toLowerCase();
  if (texto.startsWith("/") && esIdioma(delTelegram)) return delTelegram;
  const previo = idiomaConversacion("", anteriores);
  if (previo !== "es") return previo;
  if (delTexto === "es") return "es";
  return esIdioma(delTelegram) ? delTelegram : "es";
}

async function guardar(admin: Admin, fila: Database["public"]["Tables"]["mensajes_telegram"]["Insert"]) {
  const { error } = await admin.from("mensajes_telegram").insert(fila);
  if (error && error.code !== "23505") console.error("[telegram] no se pudo guardar:", error.message);
  return error?.code === "23505" ? "duplicado" : "ok";
}

async function avisarHumano(chatId: number, nombre: string | null, usuario: string | null, hilo: { rol: string; contenido: string }[]) {
  const [para] = correosAdmin();
  if (!para) return;
  const quien = nombre ?? (usuario ? `@${usuario}` : `chat ${chatId}`);
  const url = `${sitio()}/admin/telegram`;
  const texto = hilo.map((m) => `${m.rol === "persona" ? quien : "Sibila"}: ${m.contenido}`).join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Telegram</p>
<h1 style="font-size:22px;color:#f1d99a;margin:0 0 12px">${escaparHtml(quien)} quiere hablar con una persona</h1>
<pre style="white-space:pre-wrap;font-family:inherit;color:#d9d2ea;line-height:1.5">${escaparHtml(texto)}</pre>
<p style="margin:20px 0 0"><a href="${url}" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Responder desde el panel</a></p>
</div>`;
  await enviarCorreo({ para, asunto: `Telegram: ${quien} pide hablar con alguien`, html, texto: `${quien} pide hablar con alguien.\n\n${texto}\n\n${url}`, etiqueta: "telegram_humano" });
}

async function suscribir(admin: Admin, chatId: number, nombre: string | null, activo: boolean, idioma: Idioma) {
  await admin.from("suscriptores_telegram").upsert({ chat_id: chatId, nombre, activo, idioma, actualizado_en: new Date().toISOString() }, { onConflict: "chat_id" });
}

/**
 * Atiende un aviso de Telegram: comandos (/start, /carta, /diaria, /parar,
 * /persona) sin IA; cualquier otro texto, con Sibila y el hilo reciente.
 */
export async function atenderTelegram(admin: Admin, aviso: AvisoTelegram): Promise<string> {
  const m = aviso.message;
  if (!m?.text || m.chat.type !== "private" || m.from?.is_bot) return "ignorado";
  const chatId = m.chat.id;
  const nombre = nombreDe(m.from);
  const usuario = m.from?.username ?? null;
  const texto = m.text.trim().slice(0, 4000);
  const comando = /^\/([a-z]+)/i.exec(texto)?.[1]?.toLowerCase() ?? null;

  if ((await guardar(admin, { chat_id: chatId, nombre, usuario, rol: "persona", contenido: texto, update_id: aviso.update_id, tipo: comando ? "comando" : "text" })) === "duplicado") return "duplicado";

  const responder = async (respuesta: string, tipo = "text", humano = false) => {
    await enviarTexto(chatId, respuesta);
    await guardar(admin, { chat_id: chatId, nombre, usuario, rol: "asistente", contenido: respuesta, tipo, humano });
  };

  // Idioma: el del texto, el de su Telegram o el de sus mensajes anteriores.
  const { data: anteriores } = await admin.from("mensajes_telegram").select("contenido").eq("chat_id", chatId).eq("rol", "persona").neq("tipo", "comando").order("creado_en", { ascending: false }).limit(6);
  const idioma = idiomaDe(texto, m.from?.language_code, (anteriores ?? []).map((x) => x.contenido));
  const t = TEXTOS_TELEGRAM[idioma];

  if (comando === "start") {
    await responder(t.bienvenida(m.from?.first_name ?? null, enlaceInicio(idioma)), "comando");
    return "bienvenida";
  }
  if (comando === "carta") {
    await enviarCartaDelDia(chatId, idioma);
    await guardar(admin, { chat_id: chatId, nombre, usuario, rol: "asistente", contenido: "(carta del día)", tipo: "comando" });
    return "carta";
  }
  if (comando === "diaria") {
    await suscribir(admin, chatId, nombre, true, idioma);
    await responder(t.diaria, "comando");
    return "suscrito";
  }
  if (comando === "parar") {
    await suscribir(admin, chatId, nombre, false, idioma);
    await responder(t.parar, "comando");
    return "baja";
  }
  if (comando === "persona") {
    await admin.from("mensajes_telegram").update({ humano: true }).eq("update_id", aviso.update_id);
    await responder(t.persona, "comando", true);
    await avisarHumano(chatId, nombre, usuario, [{ rol: "persona", contenido: texto }]).catch((e) => console.error("[telegram aviso]", e));
    return "humano";
  }

  const inicio = `${fechaBogota()}T05:00:00.000Z`;
  const { count } = await admin.from("mensajes_telegram").select("id", { count: "exact", head: true }).eq("chat_id", chatId).eq("rol", "persona").gte("creado_en", inicio);
  if ((count ?? 0) > MAXIMO_POR_DIA) {
    await responder(t.limite);
    return "limite";
  }

  await escribiendo(chatId);
  const { data: previos } = await admin.from("mensajes_telegram").select("rol, contenido").eq("chat_id", chatId).order("creado_en", { ascending: false }).limit(CONTEXTO + 1);
  const hilo = (previos ?? []).reverse();
  const conversacion = hilo.slice(0, -1).map((x) => `${x.rol === "persona" ? "Persona" : "Sibila"}: «${x.contenido.replace(/»/g, "”")}»`).join("\n");
  const entrada = `${conversacion ? `Conversación reciente:\n${conversacion}\n\n` : ""}Nuevo mensaje de ${nombre ? `«${nombre}»` : "la persona"}: «${texto.replace(/»/g, "”")}»\n(Su enlace de inicio: ${enlaceInicio(idioma)})`;

  // Modelo estándar: es la conversación con la persona, y la calidad es lo que da confianza.
  let respuesta = await generarTexto(entrada, `${INSTRUCCIONES}\n\n${await hechos()}`, { effort: "low", maxTokens: 500, nivel: "estandar", idioma: idioma === "es" ? "auto" : idioma });
  const mandaCarta = respuesta.includes(MARCA_CARTA);
  const pideHumano = respuesta.includes(MARCA_HUMANO);
  respuesta = respuesta.replace(MARCA_CARTA, "").replace(MARCA_HUMANO, "").replace(/^#+\s*/gm, "").replace(/\*\*/g, "").trim();
  if (!respuesta) respuesta = t.vacio;

  await responder(respuesta, "text", pideHumano);
  if (mandaCarta) await enviarCartaDelDia(chatId, idioma).catch((e) => console.error("[telegram carta]", e));
  if (pideHumano) {
    await admin.from("mensajes_telegram").update({ humano: true }).eq("update_id", aviso.update_id);
    await avisarHumano(chatId, nombre, usuario, [...hilo, { rol: "asistente", contenido: respuesta }]).catch((e) => console.error("[telegram aviso]", e));
  }
  return pideHumano ? "humano" : mandaCarta ? "carta" : "respondido";
}

/** Carta del día a quienes se suscribieron con /diaria. Devuelve cuántas se enviaron y cuántas fallaron. */
export async function cartaDiariaTelegram(admin: Admin) {
  const { data } = await admin.from("suscriptores_telegram").select("chat_id, idioma").eq("activo", true).limit(5000);
  let enviadas = 0;
  const errores: string[] = [];
  for (const s of data ?? []) {
    try {
      await enviarCartaDelDia(s.chat_id, esIdioma(s.idioma) ? s.idioma : "es");
      enviadas++;
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      // Quien bloqueó al bot o borró el chat ya no puede recibir: se le da de baja.
      if (/blocked|deactivated|chat not found|403/i.test(detalle)) await admin.from("suscriptores_telegram").update({ activo: false, actualizado_en: new Date().toISOString() }).eq("chat_id", s.chat_id);
      else errores.push(detalle);
    }
    // Telegram admite unos 30 mensajes por segundo: se va con calma.
    await new Promise((r) => setTimeout(r, 60));
  }
  return { suscriptores: data?.length ?? 0, enviadas, errores: errores.slice(0, 5) };
}
