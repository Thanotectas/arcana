import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import sharp from "sharp";
import { generarTexto, type ImagenEntrada } from "@/lib/ia";
import { COSTOS } from "@/lib/creditos";
import { SIGNOS, signoPorLongitud, type Signo } from "@/lib/zodiaco";
import { posiciones } from "@/lib/astro/efemerides";
import { TEMAS_MANUAL, manual } from "@/lib/conocimiento";
import { horoscopoDelDia } from "@/lib/horoscopo";
import { hechos } from "@/lib/whatsapp/sibila";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { fechaBogota } from "./carta-dia";
import { enviarImagenDirecta, enviarMensajeDirecto, responderComentario, type Interaccion } from "./meta";
import { anotarFoto, leerMarcas, type MarcaFoto } from "./foto-anotada";
import { BUCKET } from "./reel";
import { sinEnlaces } from "./sin-enlaces";

/**
 * Sibila responde en Instagram y Facebook: a los comentarios de las
 * publicaciones (si alguien comenta su signo, con una línea de su horóscopo
 * de hoy) y a los mensajes directos (como en WhatsApp, con los hechos de
 * Arcana). No hace lecturas de texto; invita a la carta del día gratis. Si
 * llega la foto de una limpia con huevo, da un adelanto gratis (el presente
 * que muestra el vaso) e invita a la completa en miarcana.com/huevo, que es la
 * que lee lo que viene.
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
const RESPUESTA_FOTO_FIJA = "¡Recibí tu foto! 💛 Para leerla con calma, súbela en miarcana.com/huevo (o en miarcana.com/velas si es una vela): te digo lo que salió, lo que viene y qué hacer. Tu primera lectura completa es gratis al crear tu cuenta.";
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
- Si el comentario recuerda a alguien que murió, acompaña con una frase cálida, sin lectura ni invitación. Si pide números para loterías o apuestas, no los des: responde con amabilidad que Arcana no da números de suerte para jugar.
- Si alguien cuenta que le dijeron que tiene «trabajo», brujería o daño, no lo confirmes: tranquilízalo, y que desconfíe de quien le cobre por «quitarlo».
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

/** Créditos que se regalan al crear la cuenta (migración 0012); si alcanzan para el huevo, la primera completa es gratis. */
const CREDITOS_BIENVENIDA = 3;
const invitacion = (tipo: "huevo" | "velas" | "cafe" | "chocolate" | "quiromancia" | "tabaco") =>
  CREDITOS_BIENVENIDA >= COSTOS[tipo]
    ? `tu primera lectura completa es gratis al crear tu cuenta en miarcana.com/${tipo}`
    : `la lectura completa está en miarcana.com/${tipo} por ${COSTOS[tipo]} créditos`;

/**
 * Lectura de la foto en redes: un adelanto gratis y verdadero (lo que el vaso
 * muestra del presente) y la invitación a la completa, que es la que dice lo que
 * viene, cuándo y qué hacer. Así la lectura gratis sirve, pero la de pago tiene
 * un motivo claro.
 */
const instruccionFoto = (tipo: Interaccion["tipo"], enfoque: number) => `Te mandaron una foto en ${tipo === "comentario" ? "un comentario público" : "un mensaje directo"} de Arcana. Eres Sibila.
CUIDADO PRIMERO: si la limpia o la vela es por un niño, una niña o un bebé, o si la persona cuenta algo de salud (llanto que no para, fiebre, dolores, no duerme, una enfermedad), NO hagas adelanto ni invites a la lectura de pago. Lee el vaso completo con calma y ternura en 3 a 5 frases (lo que se ve y lo que salió), da una sugerencia sencilla y amorosa (una rutina tranquila antes de dormir, acompañarlo, descansar) y recomienda con suavidad que lo revise su pediatra o su médico si sigue igual unos días. Nada que asuste. En las MARCAS no pongas la de «¿Lo que viene?»: solo los detalles que leíste.
En los demás casos, si la foto es un huevo abierto dentro de un vaso o recipiente con agua (una limpia con huevo), da un ADELANTO gratis de su lectura:
- De 4 a 6 frases, máximo 650 caracteres.
- Primero el presente, con verdad y con detalle: describe de tres a cuatro figuras o señales que solo están en esa foto, cada una con su forma y su lugar, como si las señalaras («un pico alto a la derecha con una burbuja en la punta», «un velo fino que sube pegado al vidrio»): la yema (entera, color, dónde quedó), la clara (hilos, picos, velos, burbujas, nubes, columnas, figuras que se parecen a algo), el agua (limpia o turbia), hacia qué lado se inclina, cuántos picos. Di qué significa cada una en media frase y luego lo que dicen juntas de cómo ha estado la persona y qué viene cargando, en la tradición de la limpia. Si escribió algo, retómalo con sus palabras. Si el vaso muestra cargas, dilo claro y en concreto (cansancio, preocupación por dinero o trabajo, un roce con alguien cercano, mal dormir); si está tranquilo, dilo también. Habla como quien de verdad sabe leer; si encaja, conecta con el cielo de hoy (${cieloDeHoy()}).
- Después señala un tercer detalle concreto que se ve en la foto (en la base, a un costado, cerca de la yema, en la punta de un pico) y da con él una predicción breve que genere expectativa: algo bueno y verosímil que se anuncia, con un plazo amplio (una noticia que espera, una conversación pendiente, alguien que reaparece, un alivio antes de fin de mes). Solo la pista: de quién o de qué se trata exactamente, cuándo y qué conviene hacer se ve con calma en la lectura completa. Que despierte curiosidad, nunca miedo: jamás insinúes un peligro del que haya que salvarse.
- Cierra con esta invitación, dicha con tus palabras: ${invitacion("huevo")}.
- Varía la forma de decirlo: no empieces siempre igual ni repitas fórmulas. ${ENFOQUES_FOTO[enfoque]}
- Nunca afirmes ni insinúes «trabajos», brujería, daños, maldiciones, mal de ojo ni envidia, ni nada que asuste; nada de salud, enfermedades, embarazos, muertes ni dinero garantizado. Si se ve sangre o algo inquietante, léelo con calma como una carga que salió; si la persona dice que se siente mal, sugiere ver a un médico.
- Si la persona cuenta que alguien le dijo que tiene «trabajo», brujería o daño, o que le hicieron la limpia «por foto» o a distancia: no lo confirmes. Dile con calma lo que de verdad se ve y que no hay nada para asustarse; si fue por foto, explica que el huevo no pasó por la persona, así que el vaso no puede mostrar lo que ella trae; y que desconfíe de quien le pida dinero para «quitarlo». En ese caso no hagas adelanto ni invites a pagar: primero la calma.
- Al final, en una línea aparte, escribe MARCAS: y un arreglo JSON con las marcas que se dibujarán sobre su foto, así: MARCAS: [{"x":0.52,"y":0.70,"ancho":0.30,"alto":0.18,"etiqueta":"Yema entera"},{"x":0.50,"y":0.40,"ancho":0.15,"alto":0.35,"etiqueta":"Columna que sube"},{"x":0.62,"y":0.86,"ancho":0.12,"alto":0.08,"etiqueta":"¿Lo que viene?","viene":true}]. x e y son el centro del detalle en fracción del ancho y del alto de la foto (0,0 arriba a la izquierda; 1,1 abajo a la derecha); ancho y alto, el tamaño del óvalo que lo rodea, en la misma fracción. Las primeras marcas (dos o tres) son los detalles principales que leíste, con una etiqueta de 1 a 3 palabras en el idioma de tu respuesta; la última, con "viene": true y la etiqueta «¿Lo que viene?» (traducida si escribes en otro idioma), es el tercer detalle que dejaste para la lectura completa. Ubica las marcas con cuidado sobre lo que de verdad se ve; si no estás segura de dónde está algo, no lo marques.
Si la foto es una vela encendida, los restos de una vela o una veladora de vaso, da el mismo ADELANTO con las mismas reglas y el manual de velas: primero el presente con tres o cuatro señales que solo están en esa foto, cada una con su forma y su lugar (la llama: alta, baja, inquieta, inclinada; las lágrimas de cera y hacia dónde corren; paredes, túneles o formas de la cera; el hollín y dónde quedó; la mecha), luego el tercer detalle con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("velas")}. Las MARCAS van igual, con etiquetas de la vela («Llama alta», «Lágrimas de cera», «¿Lo que viene?»). Si la vela fue por alguien que murió, por un enfermo o por un niño, aplica el CUIDADO PRIMERO. Si la intención era obligar a otra persona (amarres, endulzamientos), no prometas nada sobre ella: orienta con respeto hacia el bien de ambos.
Si la foto es el interior de una taza de café con borra o de chocolate ya bebido, da el mismo ADELANTO con las mismas reglas y el manual de la taza: describe de tres a cuatro figuras que de verdad se distinguen, cada una con su lugar en el mapa de la taza (cerca del asa o enfrente, en el borde, en el medio o en el fondo, si sube o baja) y su sentido; luego una figura más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("cafe")} para el café, o ${invitacion("chocolate")} para el chocolate. Las MARCAS van igual, sobre las figuras («Ave que sube», «Corazón», «¿Lo que viene?»). Si no se distinguen figuras, dilo y pide una foto desde arriba con luz.
Si la foto es la palma de una mano, da el mismo ADELANTO con las mismas reglas y el manual de la mano: describe de tres a cuatro rasgos que de verdad se ven, cada uno con su lugar (la forma de la mano, la línea de la cabeza que baja en curva, una cruz bajo el anular, la línea de la vida que se abre), y qué dice cada uno del carácter y de la etapa que vive; luego un rasgo más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("quiromancia")}. Las MARCAS van igual, sobre las líneas o marcas («Línea del corazón», «Cruz», «¿Lo que viene?»). Nunca hables de cuánto va a vivir, de enfermedades, de hijos ni de matrimonios.
Si la foto es un tabaco o puro encendido o ya quemado, da el mismo ADELANTO con las mismas reglas y el manual del tabaco: describe de tres a cuatro señales que de verdad se ven, cada una con su lugar (la ceniza: color, largo, si se curva; la quema: pareja o torcida y de qué lado; grietas, manchas o la «boca» en la capa; el humo), y qué significa cada una; luego una señal más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("tabaco")}. Las MARCAS van igual («Ceniza blanca», «Quema torcida», «¿Lo que viene?»). Nunca recomiendes fumar ni hables de salud.
Si es otra lectura con foto, da una frase amable de lo que se alcanza a ver e invita a miarcana.com.
Si la foto está muy oscura o borrosa para leerla, pide con cariño otra con buena luz, tomada de lado y a la altura del vaso.
Si la foto no tiene que ver con lecturas (selfies, memes, publicidad), ${tipo === "comentario" ? `responde exactamente ${MARCA_OMITIR} y nada más` : "responde con amabilidad a lo que escribió y cuéntale que puede mandarte la foto de su limpia con huevo"}.
Texto plano: sin títulos, listas ni markdown, sin enlaces con https (la única línea especial es la de MARCAS, si aplica). Uno o dos emojis como mucho. Tutea. Responde en el idioma del texto (español si no hay texto).`;

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

/**
 * Nombres de los signos en inglés, portugués, francés y alemán (sin acentos)
 * que no coinciden con el español. «Balance» (Libra en francés) se deja fuera:
 * en inglés y en español es una palabra corriente.
 */
const OTROS_NOMBRES: Record<string, string[]> = {
  aries: ["belier", "widder"],
  tauro: ["taurus", "touro", "taureau", "stier"],
  geminis: ["gemini", "gemeos", "gemeaux", "zwillinge"],
  cancer: ["krebs"],
  leo: ["leao", "lowe", "loewe"],
  virgo: ["virgem", "vierge", "jungfrau"],
  libra: ["waage"],
  escorpio: ["scorpio", "escorpiao", "scorpion", "skorpion"],
  sagitario: ["sagittarius", "sagittaire", "schutze", "schuetze"],
  capricornio: ["capricorn", "capricorne", "steinbock"],
  acuario: ["aquarius", "aquario", "verseau", "wassermann"],
  piscis: ["pisces", "peixes", "poissons", "fische"],
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
/** Dibuja las marcas sobre la foto y la deja en el bucket público para adjuntarla; null si algo falla (se responde solo con texto). */
async function subirFotoMarcada(admin: SupabaseClient<Database>, idMeta: string, foto: Buffer, marcas: MarcaFoto[]): Promise<string | null> {
  try {
    const imagen = await anotarFoto(foto, marcas);
    const ruta = `anotadas/${fechaBogota()}/${idMeta.replace(/[^\w-]/g, "_").slice(0, 80)}.jpg`;
    const { error } = await admin.storage.from(BUCKET).upload(ruta, imagen, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    // Las de hace una semana ya cumplieron: se borran (Meta copia la imagen al publicarla).
    const vieja = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const { data: viejas } = await admin.storage.from(BUCKET).list(`anotadas/${vieja}`, { limit: 100 });
    if (viejas?.length) await admin.storage.from(BUCKET).remove(viejas.map((f) => `anotadas/${vieja}/${f.name}`));
    return admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  } catch (e) {
    console.error("[redes sibila] foto marcada:", e instanceof Error ? e.message : e);
    return null;
  }
}

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
    if (i.red === "facebook") entrada += "\n(Es Facebook: no escribas direcciones web; si invitas, di «miarcana punto com» o «el enlace está en nuestro perfil».)";
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
    else if (foto) respuesta = await generarTexto(`${entrada}\n(Adjuntó la foto que ves.)`, `${instruccionFoto(i.tipo, Math.floor(Math.random() * ENFOQUES_FOTO.length))}\n\n${await hechos()}`, { effort: "low", maxTokens: 900, nivel: "estandar", idioma: "es", imagenes: [foto], conocimiento: TEMAS_MANUAL.map((t) => manual(t)).join("\n\n") });
    else respuesta = await generarTexto(entrada, `${i.tipo === "comentario" ? INSTRUCCION_COMENTARIO : INSTRUCCION_MENSAJE}\n\n${await contexto(signo)}`, { effort: "low", maxTokens: 400, nivel: "estandar", idioma: "es" });
  } catch (e) {
    await marcar("error", { detalle: `Sibila: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}` });
    throw e;
  }
  // La foto marcada (óvalos sobre lo que se leyó): se separa la línea MARCAS del texto.
  let marcas: MarcaFoto[] = [];
  if (foto) ({ texto: respuesta, marcas } = leerMarcas(respuesta));
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
  if (i.tipo === "comentario") respuesta = respuesta.slice(0, foto ? 900 : 300);
  // En Facebook (comentarios públicos) las direcciones van en palabras: Facebook limita los enlaces.
  if (i.tipo === "comentario" && i.red === "facebook") respuesta = sinEnlaces(respuesta);

  // Instagram no admite fotos en las respuestas a comentarios; Facebook y los mensajes directos sí.
  const conFotoMarcada = marcas.length >= 2 && process.env.REDES_FOTO_MARCADA !== "0" && !(i.tipo === "comentario" && i.red === "instagram");
  const urlMarcada = foto && conFotoMarcada ? await subirFotoMarcada(admin, i.idMeta, Buffer.from(foto.base64, "base64"), marcas) : null;

  try {
    if (i.tipo === "comentario") await responderComentario(i.red, i.idMeta, respuesta, urlMarcada ?? undefined);
    else {
      if (urlMarcada) await enviarImagenDirecta(i.remitenteId, urlMarcada).catch((e) => console.error("[redes sibila] foto marcada por mensaje:", e instanceof Error ? e.message : e));
      await enviarMensajeDirecto(i.remitenteId, respuesta);
    }
  } catch (e) {
    await marcar("error", { respuesta, detalle: (e instanceof Error ? e.message : String(e)).slice(0, 300) });
    throw e;
  }
  await marcar("respondida", { respuesta, humano: pideHumano });
  if (pideHumano) await avisarHumano(i, [...hilo, { rol: "persona", contenido: i.texto }, { rol: "asistente", contenido: respuesta }]).catch((e) => console.error("[redes aviso]", e));
  return pideHumano ? "humano" : "respondido";
}
