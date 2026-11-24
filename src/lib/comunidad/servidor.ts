import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { IDIOMAS, IDIOMA_PARA_IA, type Idioma } from "@/lib/i18n/idiomas";
import { idiomaDeTexto } from "@/lib/en-vivo";
import { cartaDelDia, frase } from "@/lib/redes/carta-dia";
import { enviarPush, pushConfigurado } from "@/lib/push";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { TEXTOS_COMUNIDAD } from "./textos";

/**
 * Comunidad Arcana: un hilo por día alrededor de la carta del día. Cada mensaje se guarda en su idioma y se traduce
 * una sola vez a cada idioma que lo lee (modelo estándar: una traducción torpe es lo que hace desconfiar). Antes de
 * publicarse, cada mensaje pasa por una moderación con el modelo; Sibila abre el hilo y responde algunos mensajes.
 */
type Admin = SupabaseClient<Database>;
type Mensaje = Database["public"]["Tables"]["comunidad_mensajes"]["Row"];

export const LARGO_MAXIMO = 600;
const MENSAJES_POR_DIA = 20;
const ESPERA_SEGUNDOS = 20;
const RESPUESTAS_SIBILA_DIA = 60;
const REPORTES_PARA_OCULTAR = 3;
export const EMOJIS = ["✨", "🔮", "🙏"] as const;
export type Emoji = (typeof EMOJIS)[number];

export function esIdioma(v: unknown): v is Idioma {
  return typeof v === "string" && (IDIOMAS as readonly string[]).includes(v);
}

/** Nombre visible: el nombre de pila del perfil o, si no hay, «Alma» con unas cifras fijas de la cuenta. */
export function nombreVisible(nombre: string | null | undefined, usuarioId: string) {
  const pila = (nombre ?? "").trim().split(/\s+/)[0];
  return pila ? pila.slice(0, 24) : `Alma ${parseInt(usuarioId.replace(/-/g, "").slice(0, 6), 16) % 10000}`;
}

/** El primer mensaje del día lo escribe Sibila con la carta del día (una vez; si dos llegan a la vez, queda uno). */
export async function asegurarApertura(admin: Admin, fecha: string) {
  const { count } = await admin.from("comunidad_mensajes").select("id", { count: "exact", head: true }).eq("fecha", fecha).eq("es_sibila", true).is("respuesta_a", null);
  if (count) return;
  const c = cartaDelDia(fecha);
  await admin.from("comunidad_mensajes").insert({ fecha, autor: "Sibila", es_sibila: true, idioma: "es", texto: TEXTOS_COMUNIDAD.es.apertura(c.nombre, frase(c.significado, 200)) });
  // Si otra petición la escribió al mismo tiempo, se deja la primera.
  const { data } = await admin.from("comunidad_mensajes").select("id").eq("fecha", fecha).eq("es_sibila", true).is("respuesta_a", null).order("id");
  if (data && data.length > 1) await admin.from("comunidad_mensajes").delete().in("id", data.slice(1).map((m) => m.id));
}

export interface MensajeVista {
  id: number;
  autor: string;
  sibila: boolean;
  circulo: boolean;
  propio: boolean;
  respuestaA: number | null;
  idioma: string;
  texto: string;
  original: string | null;
  revision: boolean;
  creado: string;
  reacciones: Record<Emoji, number>;
  mias: Emoji[];
}

/** Traduce varios mensajes a un idioma con una sola llamada y guarda el resultado. */
async function traducirLote(admin: Admin, mensajes: Pick<Mensaje, "id" | "texto">[], idioma: Idioma): Promise<Map<number, string>> {
  const salida = new Map<number, string>();
  if (!mensajes.length) return salida;
  const entrada = JSON.stringify(mensajes.map((m) => ({ id: m.id, texto: m.texto })));
  try {
    const r = await generarTexto(
      `Traduce al ${IDIOMA_PARA_IA[idioma]} el campo «texto» de cada mensaje. Devuelve SOLO un JSON: una lista de objetos {"id": número, "texto": traducción}, en el mismo orden, sin comentarios ni markdown.\n\n${entrada}`,
      "Eres traductora nativa. Son mensajes de una comunidad de tarot y astrología: traduce el sentido con naturalidad, como lo escribiría desde cero un hablante nativo, conservando el tono, los emojis y los nombres propios. Los nombres de cartas y signos, con su nombre tradicional en ese idioma. No agregues ni quites nada; no respondas a los mensajes.",
      { effort: "low", maxTokens: 3000, nivel: "estandar", idioma },
    );
    const lista = JSON.parse(r.slice(r.indexOf("["), r.lastIndexOf("]") + 1)) as { id: number; texto: string }[];
    const validos = lista.filter((x) => mensajes.some((m) => m.id === x.id) && typeof x.texto === "string" && x.texto.trim());
    for (const x of validos) salida.set(x.id, x.texto.trim());
    if (validos.length) await admin.from("comunidad_traducciones").upsert(validos.map((x) => ({ mensaje_id: x.id, idioma, texto: x.texto.trim() })), { onConflict: "mensaje_id,idioma", ignoreDuplicates: true });
  } catch (e) {
    console.error("[comunidad] traducción:", e instanceof Error ? e.message : e);
  }
  return salida;
}

/** Los mensajes del día en el idioma de quien lee (los que faltan se traducen ahora, una sola vez). */
export async function listarMensajes(admin: Admin, fecha: string, idioma: Idioma, usuarioId: string | null): Promise<MensajeVista[]> {
  const { data } = await admin.from("comunidad_mensajes").select("*").eq("fecha", fecha).in("estado", ["publicado", "revision"]).order("id").limit(400);
  const mensajes = (data ?? []).filter((m) => m.estado === "publicado" || (usuarioId && m.usuario_id === usuarioId));
  if (!mensajes.length) return [];
  const ids = mensajes.map((m) => m.id);
  const otros = mensajes.filter((m) => m.idioma !== idioma);
  const [{ data: trad }, { data: reac }, { data: autores }] = await Promise.all([
    otros.length ? admin.from("comunidad_traducciones").select("mensaje_id, texto").eq("idioma", idioma).in("mensaje_id", otros.map((m) => m.id)) : Promise.resolve({ data: [] as { mensaje_id: number; texto: string }[] }),
    admin.from("comunidad_reacciones").select("mensaje_id, usuario_id, emoji").in("mensaje_id", ids),
    admin.from("perfiles").select("id, circulo_hasta, ilimitado").in("id", [...new Set(mensajes.map((m) => m.usuario_id).filter((x): x is string => Boolean(x)))]),
  ]);
  const traducidos = new Map((trad ?? []).map((t) => [t.mensaje_id, t.texto]));
  const faltan = otros.filter((m) => !traducidos.has(m.id));
  for (let i = 0; i < faltan.length; i += 25) for (const [k, v] of await traducirLote(admin, faltan.slice(i, i + 25), idioma)) traducidos.set(k, v);
  const ahora = Date.now();
  const enCirculo = new Set((autores ?? []).filter((a) => a.ilimitado || (a.circulo_hasta && Date.parse(a.circulo_hasta) > ahora)).map((a) => a.id));
  return mensajes.map((m) => {
    const propias = (reac ?? []).filter((r) => r.mensaje_id === m.id);
    const traducido = m.idioma !== idioma ? traducidos.get(m.id) : undefined;
    return {
      id: m.id,
      autor: m.autor,
      sibila: m.es_sibila,
      circulo: Boolean(m.usuario_id && enCirculo.has(m.usuario_id)),
      propio: Boolean(usuarioId && m.usuario_id === usuarioId),
      respuestaA: m.respuesta_a,
      idioma: m.idioma,
      texto: traducido ?? m.texto,
      original: traducido ? m.texto : null,
      revision: m.estado === "revision",
      creado: m.creado_en,
      reacciones: Object.fromEntries(EMOJIS.map((e) => [e, propias.filter((r) => r.emoji === e).length])) as Record<Emoji, number>,
      mias: propias.filter((r) => r.usuario_id === usuarioId).map((r) => r.emoji as Emoji),
    };
  });
}

/** Idioma del mensaje: el que se reconoce en el texto o, si no se nota (texto corto, español), el de la página. */
function idiomaDelMensaje(texto: string, idiomaPagina: Idioma): Idioma {
  const d = idiomaDeTexto(texto)?.codigo;
  return esIdioma(d) ? d : idiomaPagina;
}

const ENLACES = /(https?:\/\/|www\.|\b[\w-]+\.(com|net|org|co|me|ly|io|link|shop|store|info)\b|@\w{3,}|wa\.me|t\.me|(?:\+?\d[\s().-]?){9,})/i;

type Veredicto = { decision: "publicar" | "revisar" | "rechazar"; motivo: string };

/** Moderación con el modelo antes de publicar. Ante la duda, a revisión (no se pierde el mensaje). */
async function moderar(texto: string): Promise<Veredicto> {
  try {
    const r = await generarTexto(
      `Mensaje para la comunidad pública de Arcana (tarot, astrología, rituales; personas de muchos países y religiones):\n«${texto.replace(/»/g, "”")}»\n\nDevuelve SOLO un JSON {"decision": "publicar" | "revisar" | "rechazar", "motivo": "una palabra"}.`,
      `Eres moderadora de una comunidad amable. Criterio:
- publicar: experiencias, opiniones, preguntas, agradecimientos, desacuerdos respetuosos (también opiniones religiosas dichas con respeto), tristeza o dolor contados con calma.
- rechazar: insultos o burlas a personas, odio por religión, origen, género u orientación, contenido sexual, spam, publicidad o venta de servicios (otras tarotistas, «amarres», «trabajos»), pedir dinero, estafas.
- revisar: alguien que habla de hacerse daño o de quitarse la vida, amenazas, violencia, menores en riesgo, o algo que no tengas claro.
No censures por idioma, faltas de ortografía ni por ser breve.`,
      { effort: "low", maxTokens: 200, nivel: "estandar", idioma: "es" },
    );
    const v = JSON.parse(r.slice(r.indexOf("{"), r.lastIndexOf("}") + 1)) as Partial<Veredicto>;
    if (v.decision === "publicar" || v.decision === "rechazar" || v.decision === "revisar") return { decision: v.decision, motivo: String(v.motivo ?? "").slice(0, 40) };
  } catch (e) {
    console.error("[comunidad] moderación:", e instanceof Error ? e.message : e);
  }
  return { decision: "revisar", motivo: "sin_moderacion" };
}

export type ErrorPublicar = keyof (typeof TEXTOS_COMUNIDAD)["es"]["errores"];

/** Publica un mensaje (o lo deja en revisión). Devuelve el mensaje guardado o la clave del error para la persona. */
export async function publicarMensaje(
  admin: Admin,
  p: { usuarioId: string; nombre: string | null; texto: string; respuestaA: number | null; idiomaPagina: Idioma; fecha: string },
): Promise<{ ok: true; mensaje: Mensaje } | { ok: false; error: ErrorPublicar }> {
  const texto = p.texto.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (texto.replace(/\s/g, "").length < 2) return { ok: false, error: "corto" };
  if (texto.length > LARGO_MAXIMO) return { ok: false, error: "largo" };
  if (ENLACES.test(texto) && !/miarcana/i.test(texto)) return { ok: false, error: "enlaces" };

  const { data: ultimos } = await admin.from("comunidad_mensajes").select("creado_en").eq("usuario_id", p.usuarioId).gte("creado_en", new Date(Date.now() - 86_400_000).toISOString()).order("creado_en", { ascending: false });
  if (ultimos?.[0] && Date.now() - Date.parse(ultimos[0].creado_en) < ESPERA_SEGUNDOS * 1000) return { ok: false, error: "rapido" };
  if ((ultimos?.length ?? 0) >= MENSAJES_POR_DIA) return { ok: false, error: "limite" };

  // Las respuestas cuelgan del mensaje principal (hilos de un solo nivel).
  let respuestaA: number | null = null;
  if (p.respuestaA) {
    const { data: padre } = await admin.from("comunidad_mensajes").select("id, respuesta_a, fecha, estado").eq("id", p.respuestaA).maybeSingle();
    if (padre && padre.fecha === p.fecha && padre.estado === "publicado") respuestaA = padre.respuesta_a ?? padre.id;
  }

  const veredicto = await moderar(texto);
  if (veredicto.decision === "rechazar") return { ok: false, error: "moderacion" };
  const { data, error } = await admin
    .from("comunidad_mensajes")
    .insert({ fecha: p.fecha, usuario_id: p.usuarioId, autor: nombreVisible(p.nombre, p.usuarioId), respuesta_a: respuestaA, idioma: idiomaDelMensaje(texto, p.idiomaPagina), texto, estado: veredicto.decision === "publicar" ? "publicado" : "revision", motivo: veredicto.decision === "publicar" ? null : veredicto.motivo })
    .select("*")
    .single();
  if (error || !data) {
    console.error("[comunidad] guardar:", error?.message);
    return { ok: false, error: "general" };
  }
  return { ok: true, mensaje: data };
}

/** Después de publicar: Sibila responde si toca, se avisa a quien recibió la respuesta y, si quedó en revisión, al equipo. */
export async function despuesDePublicar(admin: Admin, m: Mensaje) {
  if (m.estado === "revision") {
    await avisarRevision(m).catch((e) => console.error("[comunidad] aviso de revisión:", e));
    return;
  }
  await Promise.all([responderComoSibila(admin, m).catch((e) => console.error("[comunidad] Sibila:", e instanceof Error ? e.message : e)), avisarRespuesta(admin, m).catch((e) => console.error("[comunidad] aviso:", e))]);
}

/**
 * Sibila responde el primer mensaje del día de cada persona, y los que la nombran o le preguntan algo. No responde a
 * conversaciones entre personas (salvo que la nombren) y tiene un tope diario.
 */
async function responderComoSibila(admin: Admin, m: Mensaje) {
  if (!m.usuario_id) return;
  const nombrada = /sibila|سيبيلا|सिबिला/i.test(m.texto);
  const { count: suyos } = await admin.from("comunidad_mensajes").select("id", { count: "exact", head: true }).eq("fecha", m.fecha).eq("usuario_id", m.usuario_id).lt("id", m.id);
  const primero = (suyos ?? 0) === 0;
  if (!primero && !nombrada) return;
  if (m.respuesta_a && !nombrada) {
    // Respuesta a otra persona: solo si respondía a Sibila.
    const { data: padre } = await admin.from("comunidad_mensajes").select("es_sibila").eq("id", m.respuesta_a).maybeSingle();
    if (!padre?.es_sibila) return;
  }
  const { count: hoy } = await admin.from("comunidad_mensajes").select("id", { count: "exact", head: true }).eq("fecha", m.fecha).eq("es_sibila", true).not("respuesta_a", "is", null);
  if ((hoy ?? 0) >= RESPUESTAS_SIBILA_DIA) return;

  const c = cartaDelDia(m.fecha);
  const idioma = esIdioma(m.idioma) ? m.idioma : "es";
  const texto = await generarTexto(
    `Carta del día en la comunidad: ${c.nombre}. ${frase(c.significado, 260)}\n\n${m.autor} escribió en la conversación de hoy: «${m.texto.replace(/»/g, "”")}»`,
    `Estás en la Comunidad Arcana, una conversación pública alrededor de la carta del día, como Sibila: cálida, cercana y breve.
- Responde en 1 a 3 frases (máximo 280 caracteres), llamando a la persona por su nombre una vez, retomando lo que contó con sus palabras y conectándolo con la carta de hoy.
- No hagas lecturas personales, predicciones con fechas ni promesas; nada de salud, embarazos, muertes, juicios ni dinero garantizado. Si cuenta un dolor, acompáñala con ternura.
- Si pregunta algo que necesita una lectura, dile con cariño que puede hacerla en miarcana.com. No vendas en cada respuesta.
- Sin markdown, sin hashtags, un emoji como mucho. Nunca expliques lo que vas a hacer: escribe solo la respuesta.`,
    { effort: "low", maxTokens: 500, nivel: "estandar", idioma },
  );
  const limpio = texto.replace(/^#+\s*/gm, "").replace(/\*\*/g, "").trim().slice(0, 500);
  if (!limpio) return;
  await admin.from("comunidad_mensajes").insert({ fecha: m.fecha, autor: "Sibila", es_sibila: true, respuesta_a: m.respuesta_a ?? m.id, idioma, texto: limpio });
}

/** Aviso (push) a la persona a la que respondieron, en el idioma de su perfil. */
async function avisarRespuesta(admin: Admin, m: Mensaje) {
  if (!m.respuesta_a || !pushConfigurado()) return;
  const { data: padre } = await admin.from("comunidad_mensajes").select("usuario_id").eq("id", m.respuesta_a).maybeSingle();
  if (!padre?.usuario_id || padre.usuario_id === m.usuario_id) return;
  const [{ data: perfil }, { data: subs }] = await Promise.all([
    admin.from("perfiles").select("idioma").eq("id", padre.usuario_id).maybeSingle(),
    admin.from("suscripciones_push").select("endpoint, p256dh, auth").eq("usuario_id", padre.usuario_id),
  ]);
  const idioma = esIdioma(perfil?.idioma) ? perfil.idioma : "es";
  const t = TEXTOS_COMUNIDAD[idioma];
  for (const s of subs ?? []) {
    const r = await enviarPush(s, { titulo: t.avisoTitulo, cuerpo: t.avisoCuerpo(m.autor), url: `${idioma === "es" ? "" : `/${idioma}`}/comunidad#m${m.id}`, tag: "comunidad" });
    if (r === "caducada") await admin.from("suscripciones_push").delete().eq("endpoint", s.endpoint);
  }
}

async function avisarRevision(m: Mensaje) {
  const [para] = correosAdmin();
  if (!para) return;
  await enviarCorreo({
    para,
    asunto: `Comunidad: mensaje en revisión (${m.motivo ?? "sin motivo"})`,
    html: `<p><strong>${escaparHtml(m.autor)}</strong> escribió en la comunidad y quedó en revisión (${escaparHtml(m.motivo ?? "")}):</p><blockquote>${escaparHtml(m.texto)}</blockquote><p>Revísalo en ${sitio()}/admin/comunidad</p>`,
    texto: `${m.autor} escribió en la comunidad y quedó en revisión (${m.motivo ?? ""}):\n\n${m.texto}\n\n${sitio()}/admin/comunidad`,
    etiqueta: "comunidad_revision",
  });
}

/** Pone o quita una reacción. */
export async function alternarReaccion(admin: Admin, usuarioId: string, mensajeId: number, emoji: Emoji) {
  const { data: m } = await admin.from("comunidad_mensajes").select("estado").eq("id", mensajeId).maybeSingle();
  if (m?.estado !== "publicado") return false;
  const { data: existe } = await admin.from("comunidad_reacciones").select("emoji").eq("mensaje_id", mensajeId).eq("usuario_id", usuarioId).eq("emoji", emoji).maybeSingle();
  if (existe) await admin.from("comunidad_reacciones").delete().eq("mensaje_id", mensajeId).eq("usuario_id", usuarioId).eq("emoji", emoji);
  else await admin.from("comunidad_reacciones").insert({ mensaje_id: mensajeId, usuario_id: usuarioId, emoji });
  return true;
}

/** Reporte de un mensaje: con tres reportes de personas distintas se oculta hasta que el equipo lo revise. */
export async function reportarMensaje(admin: Admin, usuarioId: string, mensajeId: number) {
  await admin.from("comunidad_reportes").upsert({ mensaje_id: mensajeId, usuario_id: usuarioId }, { onConflict: "mensaje_id,usuario_id", ignoreDuplicates: true });
  const { count } = await admin.from("comunidad_reportes").select("usuario_id", { count: "exact", head: true }).eq("mensaje_id", mensajeId);
  if ((count ?? 0) >= REPORTES_PARA_OCULTAR) await admin.from("comunidad_mensajes").update({ estado: "oculto", motivo: "reportes" }).eq("id", mensajeId).eq("es_sibila", false);
}
