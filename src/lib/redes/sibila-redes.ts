import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import sharp from "sharp";
import { generarTexto, type ImagenEntrada } from "@/lib/ia";
import { SIGNOS, signoPorLongitud, type Signo } from "@/lib/zodiaco";
import { posiciones } from "@/lib/astro/efemerides";
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
 * Arcana). No hace lecturas de texto; invita a la carta del día gratis. Si
 * llega la foto de una limpia con huevo, da una lectura corta y gratis del
 * vaso e invita a la completa en miarcana.com/huevo.
 */
const MARCA_OMITIR = "«OMITIR»";
const MARCA_HUMANO = "«PASAR_A_PERSONA»";

/** Topes diarios por red y tipo: frenan el gasto si una publicación se dispara. */
const MAXIMO_DIA = { comentario: 200, mensaje: 150 } as const;
/** Respuestas a una misma persona en una misma publicación por día. */
const MAXIMO_POR_PERSONA_Y_PUBLICACION = 2;
/** Fotos que Sibila lee al día entre todas las redes (cada una cuesta unos centavos). REDES_FOTOS_DIA lo cambia; REDES_FOTOS=0 lo apaga. */
const MAXIMO_FOTOS_DIA = Number(process.env.REDES_FOTOS_DIA) || 50;
/** Prefijo del texto guardado cuando la interacción trae foto (así se cuentan sin otra columna). */
const MARCA_FOTO = "[foto]";
/** Respuesta sin IA cuando no se puede leer la foto (tope del día, lectura apagada, descarga fallida). */
const RESPUESTA_FOTO_FIJA = "¡Recibí tu foto! 💛 Para que la lea con calma, súbela en miarcana.com/huevo y te digo lo que soltaste y lo que viene para ti.";
/** Hosts de donde Meta sirve las fotos adjuntas; cualquier otra URL se ignora. */
const HOSTS_FOTOS = ["fbcdn.net", "fbsbx.com", "cdninstagram.com", "facebook.com", "instagram.com"];
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

/**
 * El cielo de hoy en una línea (fase y signo de la Luna, Mercurio retrógrado),
 * para que Sibila pueda conectar la lectura con el momento en vez de sonar a fórmula.
 */
export function cieloDeHoy(ahora = new Date()) {
  const pos = posiciones(ahora);
  const sol = pos.find((p) => p.cuerpo === "sol")!.longitud;
  const luna = pos.find((p) => p.cuerpo === "luna")!.longitud;
  const angulo = (((luna - sol) % 360) + 360) % 360;
  const fase = angulo < 22 || angulo >= 338 ? "Luna nueva" : angulo < 158 ? "Luna creciente" : angulo < 202 ? "Luna llena" : "Luna menguante";
  const mercurio = pos.find((p) => p.cuerpo === "mercurio");
  const retro = mercurio?.retrogrado ? ` Mercurio está retrógrado en ${signoPorLongitud(mercurio.longitud).nombre} (tiempo de retomar conversaciones y revisar lo pendiente).` : "";
  return `${fase} en ${signoPorLongitud(luna).nombre}.${retro}`;
}

/** Formas de empezar una lectura de foto: se elige una al azar para que no suenen todas iguales. */
const ENFOQUES_FOTO = [
  "Empieza por la figura que más llama la atención, como si la señalaras.",
  "Empieza con una pregunta a la persona sobre cómo se ha sentido.",
  "Empieza por lo difícil que muestra el vaso y luego ve a lo bueno.",
  "Empieza por la yema y lo que dice de su fuerza, y después sube por la clara.",
  "Empieza con una imagen o comparación (como un árbol, un velo, una montaña, humo) para describir la figura.",
];

const instruccionFoto = (tipo: Interaccion["tipo"], enfoque: number, gancho: boolean) => `Te mandaron una foto en ${tipo === "comentario" ? "un comentario público" : "un mensaje directo"} de Arcana. Eres Sibila.
Si la foto es un huevo abierto dentro de un vaso o recipiente con agua (una limpia con huevo):
- Haz una lectura corta y gratis: de 3 a 5 frases, máximo 550 caracteres. Nombra lo que de verdad se ve (la yema: entera, color, dónde quedó; la clara: hilos, picos, velos, burbujas, nubes, columnas, espirales, figuras; el agua: limpia o turbia) y lo que se interpreta en la tradición de la limpia, con palabras propias y variadas: no empieces siempre igual ni repitas fórmulas.
- Que se sienta suya, no una fórmula: nombra al menos dos detalles que solo están en esa foto (dónde quedó cada cosa, hacia qué lado se inclina, cuántos picos o burbujas, el color exacto) y, si la persona escribió algo, retómalo con sus palabras.
- Habla con el conocimiento de quien de verdad lee: si encaja, explica en media frase por qué una figura significa lo que significa, o conecta la lectura con el cielo de hoy (${cieloDeHoy()}). Nada de frases que le sirvan a cualquiera.
- Sé honesta: si el vaso muestra cargas, dilo claro y en concreto (cansancio, preocupación por dinero o trabajo, un roce con alguien cercano, una etapa pesada, mal dormir), sin suavizarlo todo. Lo difícil siempre va con una salida: qué hacer y cuándo se alivia. Si el vaso está tranquilo, dilo también.
- Incluye un anuncio de lo que viene, concreto y verosímil (es probable, se anuncia, en las próximas semanas): una conversación, una noticia, alguien que reaparece, un cambio.
- Nunca hables de «trabajos», brujería, daños, maldiciones, mal de ojo ni envidia, ni de nada que asuste; nada de salud, enfermedades, embarazos, muertes ni dinero garantizado. Si se ve sangre o algo inquietante, léelo con calma como una carga que salió; si la persona dice que se siente mal, sugiere ver a un médico.
- ${gancho ? "Antes de cerrar, deja una puerta abierta: menciona un detalle más que se alcanza a ver (en la base, a un costado, cerca de la yema) y que habla de algo bueno o interesante (el amor, una noticia, una fecha, una decisión), y di que en la lectura completa se ve con calma. Que despierte curiosidad, nunca miedo: jamás insinúes un peligro del que haya que salvarse." : "Cierra invitando a la lectura completa, con más detalle, en miarcana.com/huevo."}
- ${ENFOQUES_FOTO[enfoque]}
Si es otra lectura, da una frase amable de lo que se alcanza a ver e invita a la completa: borra de café en una taza → miarcana.com/cafe; taza de chocolate → miarcana.com/chocolate; palma de la mano → miarcana.com/quiromancia; restos de velas → miarcana.com/velas; tabaco → miarcana.com/tabaco.
Si la foto está muy oscura o borrosa para leerla, pide con cariño otra con buena luz, tomada de lado y a la altura del vaso.
Si la foto no tiene que ver con lecturas (selfies, memes, publicidad), ${tipo === "comentario" ? `responde exactamente ${MARCA_OMITIR} y nada más` : "responde con amabilidad a lo que escribió y cuéntale que puede mandarte la foto de su limpia con huevo"}.
Texto plano: sin títulos, listas ni markdown, sin enlaces con https. Uno o dos emojis como mucho. Tutea. Responde en el idioma del texto (español si no hay texto).`;

/** Descarga la foto adjunta (solo de los servidores de Meta) y la deja en JPEG de máximo 1280 px, para gastar menos. */
async function descargarFoto(url: string): Promise<ImagenEntrada | null> {
  try {
    const host = new URL(url).hostname;
    if (!HOSTS_FOTOS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const datos = Buffer.from(await res.arrayBuffer());
    if (!datos.length || datos.length > 15_000_000) return null;
    const jpeg = await sharp(datos).rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    return { mediaType: "image/jpeg", base64: jpeg.toString("base64") };
  } catch (e) {
    console.error("[redes sibila] foto:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Fotos leídas hoy por Sibila en todas las redes. */
async function fotosHoy(admin: SupabaseClient<Database>) {
  const { count } = await admin
    .from("interacciones_redes")
    .select("id", { count: "exact", head: true })
    .gte("creado_en", `${fechaBogota()}T05:00:00.000Z`)
    .eq("estado", "respondida")
    .like("texto", `${MARCA_FOTO}%`);
  return count ?? 0;
}

function sinAcentos(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Nombres de los signos en inglés y portugués (sin acentos) que no coinciden con el español. */
const OTROS_NOMBRES: Record<string, string[]> = {
  tauro: ["taurus", "touro"],
  geminis: ["gemini", "gemeos"],
  leo: ["leao"],
  virgo: ["virgem"],
  escorpio: ["scorpio", "escorpiao"],
  sagitario: ["sagittarius"],
  capricornio: ["capricorn"],
  acuario: ["aquarius", "aquario"],
  piscis: ["pisces", "peixes"],
};

/** Signo mencionado en el texto (por nombre, sin acentos, también en inglés o portugués); si hay varios, el que aparece primero. */
export function detectarSigno(texto: string): Signo | null {
  const t = ` ${sinAcentos(texto)} `;
  let mejor: { signo: Signo; pos: number } | null = null;
  for (const signo of SIGNOS) {
    const nombre = sinAcentos(signo.nombre);
    for (const n of [nombre, ...(OTROS_NOMBRES[nombre] ?? [])]) {
      const pos = t.search(new RegExp(`[^a-z]${n}[^a-z]`));
      if (pos >= 0 && (!mejor || pos < mejor.pos)) mejor = { signo, pos };
    }
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
  const textoGuardado = (i.imagen ? `${MARCA_FOTO} ${i.texto}` : i.texto).trim();
  const { error } = await admin.from("interacciones_redes").insert({ red: i.red, tipo: i.tipo, id_meta: i.idMeta, remitente_id: i.remitenteId, remitente: i.remitente, objeto_id: i.objetoId, texto: textoGuardado.slice(0, 4000) });
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

  // La foto (una limpia con huevo, casi siempre): lectura corta con la imagen, dentro del tope diario.
  let foto: ImagenEntrada | null = null;
  let respuestaFija = false;
  if (i.imagen) {
    if (process.env.REDES_FOTOS === "0" || (await fotosHoy(admin)) >= MAXIMO_FOTOS_DIA) respuestaFija = true;
    else foto = await descargarFoto(i.imagen);
    if (!foto && !i.texto.trim()) respuestaFija = true;
  }

  let respuesta: string;
  try {
    if (respuestaFija) respuesta = RESPUESTA_FOTO_FIJA;
    else if (foto) respuesta = await generarTexto(`${entrada}\n(Adjuntó la foto que ves.)`, `${instruccionFoto(i.tipo, Math.floor(Math.random() * ENFOQUES_FOTO.length), Math.random() < 0.35)}\n\n${await hechos()}`, { effort: "low", maxTokens: 900, nivel: "estandar", idioma: "es", imagenes: [foto] });
    else respuesta = await generarTexto(entrada, `${i.tipo === "comentario" ? INSTRUCCION_COMENTARIO : INSTRUCCION_MENSAJE}\n\n${await contexto(signo)}`, { effort: "low", maxTokens: 400, nivel: "estandar", idioma: "es" });
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
  if (i.tipo === "comentario") respuesta = respuesta.slice(0, foto ? 700 : 300);

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
