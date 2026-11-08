"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { huellaDe } from "@/lib/chat-visitas";
import { detectarSigno } from "@/lib/redes/sibila-redes";
import { BUCKET_FOTOS, MARCA_HUEVO, escenarioActivo, tipoDeMensaje, type TipoLectura } from "@/lib/en-vivo";
import { normalizarCodigo } from "@/lib/pagos/codigos";
import { estadoTikTok } from "@/lib/marca/directo";

export interface EstadoEnVivo {
  error?: string;
  mensaje?: string;
}

const POR_HORA = 2;

/**
 * Foto de la taza de chocolate, de la mano o del vaso de la limpia con huevo enviada desde /vivo durante un
 * directo: se limpia (sin metadatos, máximo 1.024 px), se guarda y entra a la
 * cola de Sibila. Solo mientras el escenario está transmitiendo, y máximo dos
 * por hora por persona.
 */
export async function accionFotoEnVivo(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  const elegido = formData.get("tipo");
  const tipo: TipoLectura = elegido === "mano" ? "mano" : elegido === "huevo" ? "huevo" : "chocolate";
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 40);
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 200);
  const foto = formData.get("foto");
  if (formData.get("acepto") !== "on") return { error: "Para leerla en el directo, acepta que se muestren tu foto y tu nombre." };
  if (nombre.length < 2) return { error: "Escribe tu nombre (o como quieres que Sibila te llame)." };
  if (!(foto instanceof File) || !foto.size) return { error: "Toma o elige la foto." };
  if (foto.size > 4 * 1024 * 1024) return { error: "La foto pesa demasiado." };

  const admin = getSupabaseAdmin();
  // Durante el directo, o desde antes el día de un directo de TikTok (la foto espera en la fila).
  if (!estadoTikTok() && !(await escenarioActivo(admin))) return { error: "En este momento no hay directo. Mira los horarios en Instagram @miarcana.oficial, o haz tu lectura en miarcana.com." };

  const h = await headers();
  const huella = huellaDe(h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "desconocida");
  const { count } = await admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("huella", huella).gte("creado_en", new Date(Date.now() - 3_600_000).toISOString());
  if ((count ?? 0) >= POR_HORA) return { error: "Ya enviaste tus fotos de esta hora. ¡Gracias! Sibila las está leyendo en orden." };

  let limpia: Buffer;
  try {
    limpia = await sharp(Buffer.from(await foto.arrayBuffer())).rotate().resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return { error: "No pudimos abrir esa imagen. Prueba con otra foto." };
  }
  const ruta = `en-vivo/fotos/${randomUUID()}.jpg`;
  const { error: errorSubida } = await admin.storage.from(BUCKET_FOTOS).upload(ruta, limpia, { contentType: "image/jpeg", cacheControl: "300" });
  if (errorSubida) return { error: "No se pudo guardar la foto. Intenta de nuevo." };
  const fila = { origen: "pagina" as const, tipo, autor: nombre, texto: pregunta, signo: detectarSigno(pregunta)?.id ?? null, imagen: ruta, huella };
  let { error } = await admin.from("en_vivo_preguntas").insert(fila);
  // Sin la migración 0043 no existe el tipo «huevo»: entra como chocolate con la marca y se lee igual.
  if (error?.code === "23514" && tipo === "huevo") ({ error } = await admin.from("en_vivo_preguntas").insert({ ...fila, tipo: "chocolate", texto: `${MARCA_HUEVO}${pregunta}`.trim() }));
  if (error) return { error: "No se pudo enviar. Intenta de nuevo." };
  const { count: antes } = await admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("estado", "pendiente");
  return { mensaje: `¡Listo, ${nombre}! Tu ${tipo === "mano" ? "mano" : tipo === "huevo" ? "vaso" : "taza"} está en la fila${antes && antes > 1 ? ` (hay ${antes - 1} antes de ti)` : ""}. Mira el directo: Sibila te va a nombrar.` };
}

const TIPOS: TipoLectura[] = ["tarot", "aura", "numerologia", "horoscopo", "carta", "sinastria", "pendulo", "iching", "runas", "lenormand", "baraja", "chino"];

/** Consulta agregada a mano desde /admin/en-vivo (pasa primero en la fila). */
export async function accionPreguntaManual(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const autor = String(formData.get("autor") ?? "").trim().slice(0, 40);
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 300);
  const elegido = String(formData.get("tipo") ?? "auto");
  const foto = formData.get("foto");
  const conFoto = foto instanceof File && foto.size > 0;
  // Con foto (por ejemplo, la de un vaso que mandaron por Facebook): huevo, taza o mano; sin límite por hora.
  if (conFoto) return agregarFotoManual(autor, texto, elegido, foto);
  // «auto» clasifica el texto igual que el chat (carta astral, sinastría, aura…); lo que pide foto queda en tarot.
  const tipo = (elegido === "auto" ? (tipoDeMensaje(texto) ?? "tarot") : elegido) as TipoLectura;
  if (!autor || texto.length < 3 || !TIPOS.includes(tipo)) return { error: "Escribe el nombre, el tipo y la consulta." };
  const fila = { origen: "manual" as const, tipo, autor, texto, signo: detectarSigno(texto)?.id ?? null };
  let { error } = await getSupabaseAdmin().from("en_vivo_preguntas").insert(fila);
  // Sin la migración 0044 los oráculos nuevos van como tarot con su marca y se leen igual.
  if (error?.code === "23514" && !TIPOS.slice(0, 6).includes(tipo)) ({ error } = await getSupabaseAdmin().from("en_vivo_preguntas").insert({ ...fila, tipo: "tarot", texto: `[${tipo}] ${texto}` }));
  if (error) return { error: error.message };
  revalidatePath("/admin/en-vivo");
  return { mensaje: "Agregada: es la siguiente que lee Sibila." };
}

/** Foto agregada desde /admin/en-vivo (vasos o tazas que llegaron por Facebook o WhatsApp): se limpia igual que en /vivo. */
async function agregarFotoManual(autor: string, texto: string, elegido: string, foto: File): Promise<EstadoEnVivo> {
  if (!autor) return { error: "Escribe el nombre de la persona." };
  if (foto.size > 4 * 1024 * 1024) return { error: "La foto pesa demasiado (máximo 4 MB)." };
  const tipo: TipoLectura = elegido === "mano" ? "mano" : elegido === "chocolate" ? "chocolate" : "huevo";
  let limpia: Buffer;
  try {
    limpia = await sharp(Buffer.from(await foto.arrayBuffer())).rotate().resize({ width: 1024, height: 1024, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  } catch {
    return { error: "No pudimos abrir esa imagen. Prueba con otra." };
  }
  const admin = getSupabaseAdmin();
  const ruta = `en-vivo/fotos/${randomUUID()}.jpg`;
  const { error: errorSubida } = await admin.storage.from(BUCKET_FOTOS).upload(ruta, limpia, { contentType: "image/jpeg", cacheControl: "300" });
  if (errorSubida) return { error: `No se pudo guardar la foto: ${errorSubida.message}` };
  const fila = { origen: "manual" as const, tipo, autor, texto, signo: detectarSigno(texto)?.id ?? null, imagen: ruta };
  let { error } = await admin.from("en_vivo_preguntas").insert(fila);
  if (error?.code === "23514" && tipo === "huevo") ({ error } = await admin.from("en_vivo_preguntas").insert({ ...fila, tipo: "chocolate", texto: `${MARCA_HUEVO}${texto}`.trim() }));
  if (error) return { error: error.message };
  revalidatePath("/admin/en-vivo");
  return { mensaje: `Foto de ${autor} agregada: es la siguiente que lee Sibila.` };
}

/** Saca de la fila todo lo pendiente (por ejemplo, al empezar un directo nuevo). */
export async function accionVaciarCola(): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("en_vivo_preguntas").update({ estado: "omitida", detalle: "Fila vaciada" }).in("estado", ["pendiente", "leyendo"]).select("id");
  await admin.from("en_vivo_estado").update({ live_chat_id: null, page_token: null }).eq("id", 1);
  revalidatePath("/admin/en-vivo");
  return { mensaje: `${data?.length ?? 0} consultas fuera de la fila.` };
}

/** Crea (o reemplaza) un código de oferta desde /admin/en-vivo. */
export async function accionCrearCodigo(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const codigo = normalizarCodigo(String(formData.get("codigo") ?? ""));
  const extra = Number(formData.get("extra") ?? 0);
  const cupo = Number(formData.get("cupo") ?? 0);
  const vence = String(formData.get("vence") ?? "").trim();
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 120);
  if (codigo.length < 3) return { error: "El código necesita al menos 3 letras o números." };
  if (!Number.isInteger(extra) || extra < 1 || extra > 50) return { error: "Los créditos extra van de 1 a 50." };
  // La fecha llega como «AAAA-MM-DDTHH:MM» en hora de Bogotá.
  const venceEn = vence ? new Date(`${vence}:00-05:00`) : null;
  if (venceEn && Number.isNaN(venceEn.getTime())) return { error: "La fecha de vencimiento no es válida." };
  const { error } = await getSupabaseAdmin()
    .from("codigos_oferta")
    .upsert({ codigo, creditos_extra: extra, cupo: cupo > 0 ? Math.floor(cupo) : null, vence_en: venceEn?.toISOString() ?? null, activo: true, nota: nota || null }, { onConflict: "codigo" });
  if (error) return { error: error.message };
  revalidatePath("/admin/en-vivo");
  return { mensaje: `Código ${codigo} listo: miarcana.com/c/${codigo}` };
}

/** Apaga o prende un código. */
export async function accionAlternarCodigo(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const codigo = normalizarCodigo(String(formData.get("codigo") ?? ""));
  const activo = formData.get("activo") === "1";
  const { error } = await getSupabaseAdmin().from("codigos_oferta").update({ activo }).eq("codigo", codigo);
  if (error) return { error: error.message };
  revalidatePath("/admin/en-vivo");
  return { mensaje: activo ? `Código ${codigo} activo.` : `Código ${codigo} apagado.` };
}

/**
 * Hora a la que Sibila se despide esta noche («HH:MM», hora de Bogotá), o
 * «ahora». Borra la marca de despedida: si ya se había despedido y se corre la
 * hora, el escenario vuelve a leer solo.
 */
export async function accionCierre(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const ahora = formData.get("ahora") === "1";
  const hora = String(formData.get("hora") ?? "").trim();
  let cierre: Date;
  if (ahora) cierre = new Date();
  else {
    if (!/^\d{2}:\d{2}$/.test(hora)) return { error: "Elige la hora de cierre." };
    const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
    cierre = new Date(`${hoy}T${hora}:00-05:00`);
    // Pasada la medianoche, una hora de la noche se refiere a la noche que sigue en curso.
    if (cierre.getTime() < Date.now() - 12 * 3_600_000) cierre = new Date(cierre.getTime() + 86_400_000);
  }
  const { error } = await getSupabaseAdmin().from("en_vivo_estado").update({ cierre_en: cierre.toISOString(), despedida_en: null }).eq("id", 1);
  if (error) return { error: error.message.includes("cierre_en") ? "Falta aplicar la migración 0039 (cierre del directo)." : error.message };
  revalidatePath("/admin/en-vivo");
  const texto = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(cierre);
  return { mensaje: ahora ? "Sibila se despide al terminar la lectura que está en curso." : `Sibila se despide a las ${texto}.` };
}

/**
 * Pausa para el presentador: el escenario termina la frase que está diciendo y queda en silencio, sin tomar la
 * siguiente consulta, hasta que pase el tiempo o se reanude. «segundos» = 0 la quita.
 */
export async function accionPausa(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const segundos = Number(formData.get("segundos") ?? 0);
  if (!Number.isFinite(segundos) || segundos < 0 || segundos > 3 * 3600) return { error: "Duración no válida." };
  const hasta = segundos ? new Date(Date.now() + segundos * 1000).toISOString() : null;
  const { error } = await getSupabaseAdmin().from("en_vivo_estado").update({ pausa_hasta: hasta }).eq("id", 1);
  if (error) return { error: error.message.includes("pausa_hasta") ? "Falta aplicar la migración 0045 (pausa del presentador)." : error.message };
  return { mensaje: !segundos ? "Sibila sigue leyendo." : segundos >= 3600 ? "Sibila espera en silencio hasta que toques «Reanudar»." : `Sibila espera en silencio ${segundos} segundos, después de la frase que está diciendo.` };
}
