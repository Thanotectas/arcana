"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { requerirAdmin } from "@/lib/admin";
import { huellaDe } from "@/lib/chat-visitas";
import { detectarSigno } from "@/lib/redes/sibila-redes";
import { BUCKET_FOTOS, escenarioActivo, type TipoLectura } from "@/lib/en-vivo";
import { normalizarCodigo } from "@/lib/pagos/codigos";

export interface EstadoEnVivo {
  error?: string;
  mensaje?: string;
}

const POR_HORA = 2;

/**
 * Foto de la taza de chocolate o de la mano enviada desde /vivo durante un
 * directo: se limpia (sin metadatos, máximo 1.024 px), se guarda y entra a la
 * cola de Sibila. Solo mientras el escenario está transmitiendo, y máximo dos
 * por hora por persona.
 */
export async function accionFotoEnVivo(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  const tipo = formData.get("tipo") === "mano" ? "mano" : "chocolate";
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 40);
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 200);
  const foto = formData.get("foto");
  if (formData.get("acepto") !== "on") return { error: "Para leerla en el directo, acepta que se muestren tu foto y tu nombre." };
  if (nombre.length < 2) return { error: "Escribe tu nombre (o como quieres que Sibila te llame)." };
  if (!(foto instanceof File) || !foto.size) return { error: "Toma o elige la foto." };
  if (foto.size > 4 * 1024 * 1024) return { error: "La foto pesa demasiado." };

  const admin = getSupabaseAdmin();
  if (!(await escenarioActivo(admin))) return { error: "En este momento no hay directo. Mira los horarios en Instagram @miarcana.oficial, o haz tu lectura en miarcana.com." };

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
  const { error } = await admin.from("en_vivo_preguntas").insert({ origen: "pagina", tipo, autor: nombre, texto: pregunta, signo: detectarSigno(pregunta)?.id ?? null, imagen: ruta, huella });
  if (error) return { error: "No se pudo enviar. Intenta de nuevo." };
  const { count: antes } = await admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("estado", "pendiente");
  return { mensaje: `¡Listo, ${nombre}! Tu ${tipo === "mano" ? "mano" : "taza"} está en la fila${antes && antes > 1 ? ` (hay ${antes - 1} antes de ti)` : ""}. Mira el directo: Sibila te va a nombrar.` };
}

const TIPOS: TipoLectura[] = ["tarot", "aura", "numerologia", "horoscopo"];

/** Consulta agregada a mano desde /admin/en-vivo (pasa primero en la fila). */
export async function accionPreguntaManual(_prev: EstadoEnVivo, formData: FormData): Promise<EstadoEnVivo> {
  await requerirAdmin();
  const autor = String(formData.get("autor") ?? "").trim().slice(0, 40);
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 300);
  const tipo = String(formData.get("tipo") ?? "tarot") as TipoLectura;
  if (!autor || texto.length < 3 || !TIPOS.includes(tipo)) return { error: "Escribe el nombre, el tipo y la consulta." };
  const { error } = await getSupabaseAdmin().from("en_vivo_preguntas").insert({ origen: "manual", tipo, autor, texto, signo: detectarSigno(texto)?.id ?? null });
  if (error) return { error: error.message };
  revalidatePath("/admin/en-vivo");
  return { mensaje: "Agregada: es la siguiente que lee Sibila." };
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
