import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { SIGNOS, type Signo } from "@/lib/zodiaco";
import { horoscopoDelDia } from "@/lib/horoscopo";
import { hechos } from "@/lib/whatsapp/sibila";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { fechaBogota } from "./carta-dia";
import { enviarMensajeDirecto, responderComentario, type Interaccion } from "./meta";

/**
 * Sibila responde en Instagram y Facebook: a los comentarios de las
 * publicaciones (si alguien comenta su signo, con una línea de su horóscopo
 * de hoy) y a los mensajes directos (como en WhatsApp, con los hechos de
 * Arcana). Nunca hace lecturas; invita a la carta del día gratis.
 */
const MARCA_OMITIR = "«OMITIR»";
const MARCA_HUMANO = "«PASAR_A_PERSONA»";

/** Topes diarios por red y tipo: frenan el gasto si una publicación se dispara. */
const MAXIMO_DIA = { comentario: 200, mensaje: 150 } as const;
/** Respuestas a una misma persona en una misma publicación por día. */
const MAXIMO_POR_PERSONA_Y_PUBLICACION = 2;
/** Mensajes directos previos que entran como contexto. */
const CONTEXTO = 10;

const INSTRUCCION_COMENTARIO = `Estás respondiendo un comentario público en una publicación de Arcana en redes sociales, como Sibila.
Reglas:
- Una respuesta de 1 a 3 frases, máximo 260 caracteres, cálida y concreta. Un emoji como mucho. Sin hashtags, sin enlaces con https (escribe miarcana.com a secas si invitas).
- Si la persona menciona su signo, dale una línea personal para su signo hoy apoyándote en el horóscopo que te doy (no lo copies: una idea, con tu voz) y cierra invitando a sacar su carta del día gratis en miarcana.com.
- Si pregunta por precios, cómo entrar o qué es Arcana, responde con los hechos, breve, y ofrece escribir por mensaje directo si quiere más detalle.
- Si solo agradece o reacciona (un emoji, «me encanta»), agradece en una frase.
- No hagas lecturas ni predicciones; no prometas resultados; nada de salud, dinero garantizado ni miedo.
- Si el comentario es spam, publicidad ajena, insulto, burla, tema ajeno a Arcana o no tiene sentido, responde exactamente ${MARCA_OMITIR} y nada más.
- Responde en el idioma del comentario (español por defecto). Tutea.`;

const INSTRUCCION_MENSAJE = `Estás atendiendo los mensajes directos de Arcana en Instagram y Facebook, como Sibila, cálida y breve.
Reglas:
- Máximo 4 líneas o 450 caracteres. Sin títulos ni listas largas. Un emoji como mucho. Enlaces sin https (miarcana.com/...).
- No hagas lecturas por mensaje (ni tarot, ni carta astral, ni sueños): explica con cariño que las lecturas se hacen en la app, di cuánto cuesta y manda el enlace. Si menciona su signo, puedes darle una línea de su horóscopo de hoy.
- Si pide hablar con una persona, tiene un problema de pago o de cuenta que no puedas resolver con los hechos, o se molesta, escribe exactamente ${MARCA_HUMANO} al final y dile que alguien del equipo le escribirá por aquí.
- Si el mensaje es spam o publicidad ajena, responde exactamente ${MARCA_OMITIR}.
- No inventes precios ni funciones. No pidas datos sensibles.
- Responde en el idioma en que te escriben (español por defecto). Tutea.`;

function sinAcentos(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Signo mencionado en el texto (por nombre, sin acentos); si hay varios, el que aparece primero. */
export function detectarSigno(texto: string): Signo | null {
  const t = ` ${sinAcentos(texto)} `;
  let mejor: { signo: Signo; pos: number } | null = null;
  for (const signo of SIGNOS) {
    const pos = t.search(new RegExp(`[^a-z]${sinAcentos(signo.nombre)}[^a-z]`));
    if (pos >= 0 && (!mejor || pos < mejor.pos)) mejor = { signo, pos };
  }
  return mejor?.signo ?? null;
}

async function contexto(signo: Signo | null) {
  let horoscopo = "";
  if (signo) {
    try {
      const texto = await horoscopoDelDia(signo, "es", fechaBogota());
      horoscopo = `\n\nHORÓSCOPO DE HOY DE ${signo.nombre.toUpperCase()} (resumen para apoyarte):\n${texto.replace(/^#+\s*/gm, "").slice(0, 700)}`;
    } catch (e) {
      console.error("[redes sibila] horóscopo:", e instanceof Error ? e.message : e);
    }
  }
  return `${await hechos()}${horoscopo}`;
}

async function cuantasHoy(admin: SupabaseClient<Database>, filtro: Record<string, string>) {
  const inicio = `${fechaBogota()}T05:00:00.000Z`;
  let consulta = admin.from("interacciones_redes").select("id", { count: "exact", head: true }).gte("creado_en", inicio).eq("estado", "respondida");
  for (const [k, v] of Object.entries(filtro)) consulta = consulta.eq(k, v);
  const { count } = await consulta;
  return count ?? 0;
}

async function avisarHumano(i: Interaccion, hilo: { rol: string; contenido: string }[]) {
  const [para] = correosAdmin();
  if (!para) return;
  const quien = i.remitente ?? `usuario ${i.remitenteId}`;
  const red = i.red === "instagram" ? "Instagram" : "Facebook";
  const texto = hilo.map((m) => `${m.rol === "persona" ? quien : "Sibila"}: ${m.contenido}`).join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">${red} · mensaje directo</p>
<h1 style="font-size:22px;color:#f1d99a;margin:0 0 12px">${escaparHtml(quien)} quiere hablar con una persona</h1>
<pre style="white-space:pre-wrap;font-family:inherit;color:#d9d2ea;line-height:1.5">${escaparHtml(texto)}</pre>
<p style="margin:20px 0 0;color:#a89fc0;font-size:14px">Respóndele desde la bandeja de ${red} (Meta Business Suite). El hilo también está en ${sitio()}/admin/redes.</p>
</div>`;
  await enviarCorreo({ para, asunto: `${red}: ${quien} pide hablar con alguien`, html, texto: `${quien} pide hablar con alguien por ${red}.\n\n${texto}`, etiqueta: "redes_humano" });
}

/**
 * Atiende un comentario o mensaje: lo guarda (si ya estaba, Meta reintentó y
 * no se responde dos veces), decide si toca responder, pide la respuesta a
 * Sibila, la publica y la guarda. Devuelve qué hizo.
 */
export async function atenderInteraccion(admin: SupabaseClient<Database>, i: Interaccion): Promise<string> {
  const { error } = await admin.from("interacciones_redes").insert({ red: i.red, tipo: i.tipo, id_meta: i.idMeta, remitente_id: i.remitenteId, remitente: i.remitente, objeto_id: i.objetoId, texto: i.texto.slice(0, 4000) });
  if (error) {
    if (error.code === "23505") return "duplicado";
    throw new Error(`guardar interacción: ${error.message}`);
  }
  const marcar = (estado: "respondida" | "omitida" | "error", extra: Partial<Database["public"]["Tables"]["interacciones_redes"]["Update"]> = {}) =>
    admin.from("interacciones_redes").update({ estado, ...extra }).eq("id_meta", i.idMeta);

  if (process.env.REDES_RESPUESTAS === "0") {
    await marcar("omitida", { detalle: "respuestas apagadas (REDES_RESPUESTAS=0)" });
    return "apagado";
  }
  if ((await cuantasHoy(admin, { red: i.red, tipo: i.tipo })) >= MAXIMO_DIA[i.tipo]) {
    await marcar("omitida", { detalle: "tope diario" });
    return "tope";
  }
  if (i.tipo === "comentario" && i.objetoId && (await cuantasHoy(admin, { red: i.red, remitente_id: i.remitenteId, objeto_id: i.objetoId })) >= MAXIMO_POR_PERSONA_Y_PUBLICACION) {
    await marcar("omitida", { detalle: "ya se le respondió en esta publicación" });
    return "repetido";
  }

  const signo = detectarSigno(i.texto);
  let hilo: { rol: string; contenido: string }[] = [];
  let entrada: string;
  if (i.tipo === "mensaje") {
    const { data: previos } = await admin
      .from("interacciones_redes")
      .select("texto, respuesta")
      .eq("red", i.red)
      .eq("tipo", "mensaje")
      .eq("remitente_id", i.remitenteId)
      .neq("id_meta", i.idMeta)
      .order("creado_en", { ascending: false })
      .limit(CONTEXTO);
    hilo = (previos ?? []).reverse().flatMap((m) => [{ rol: "persona", contenido: m.texto }, ...(m.respuesta ? [{ rol: "asistente", contenido: m.respuesta }] : [])]);
    const conversacion = hilo.map((m) => `${m.rol === "persona" ? "Persona" : "Sibila"}: «${m.contenido.replace(/»/g, "”")}»`).join("\n");
    entrada = `${conversacion ? `Conversación reciente:\n${conversacion}\n\n` : ""}Nuevo mensaje directo por ${i.red === "instagram" ? "Instagram" : "Facebook"}: «${i.texto.replace(/»/g, "”")}»`;
  } else {
    entrada = `Comentario de ${i.remitente ? `@${i.remitente}` : "una persona"} en ${i.red === "instagram" ? "Instagram" : "Facebook"}: «${i.texto.replace(/»/g, "”")}»${signo ? `\n(Menciona el signo ${signo.nombre}.)` : ""}`;
  }

  let respuesta: string;
  try {
    respuesta = await generarTexto(entrada, `${i.tipo === "comentario" ? INSTRUCCION_COMENTARIO : INSTRUCCION_MENSAJE}\n\n${await contexto(signo)}`, { effort: "low", maxTokens: 400, nivel: "estandar", idioma: "es" });
  } catch (e) {
    await marcar("error", { detalle: `Sibila: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}` });
    throw e;
  }
  if (respuesta.includes(MARCA_OMITIR)) {
    await marcar("omitida", { detalle: "Sibila decidió no responder" });
    return "omitido";
  }
  const pideHumano = respuesta.includes(MARCA_HUMANO);
  respuesta = respuesta.replace(MARCA_HUMANO, "").replace(/^#+\s*/gm, "").replace(/\*\*/g, "").trim();
  if (!respuesta) {
    await marcar("omitida", { detalle: "respuesta vacía" });
    return "vacio";
  }
  if (i.tipo === "comentario") respuesta = respuesta.slice(0, 300);

  try {
    if (i.tipo === "comentario") await responderComentario(i.red, i.idMeta, respuesta);
    else await enviarMensajeDirecto(i.remitenteId, respuesta);
  } catch (e) {
    await marcar("error", { respuesta, detalle: (e instanceof Error ? e.message : String(e)).slice(0, 300) });
    throw e;
  }
  await marcar("respondida", { respuesta, humano: pideHumano });
  if (pideHumano) await avisarHumano(i, [...hilo, { rol: "persona", contenido: i.texto }, { rol: "asistente", contenido: respuesta }]).catch((e) => console.error("[redes aviso]", e));
  return pideHumano ? "humano" : "respondido";
}
