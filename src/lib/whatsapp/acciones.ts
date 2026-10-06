"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { enviarTexto, registrarNumero, whatsappConfigurado } from "./api";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface EstadoRegistro {
  error?: string;
  mensaje?: string;
}

/** Registra el número en la API de la nube con el PIN de seis dígitos. */
export async function accionRegistrarNumero(_prev: EstadoRegistro, formData: FormData): Promise<EstadoRegistro> {
  await requerirAdmin();
  if (!whatsappConfigurado()) return { error: "Faltan las variables WA_* en Vercel." };
  const pin = String(formData.get("pin") ?? "").trim();
  if (!/^\d{6}$/.test(pin)) return { error: "El PIN debe tener seis dígitos." };
  try {
    await registrarNumero(pin);
    revalidatePath("/admin/whatsapp");
    return { mensaje: "Número registrado. Guarda el PIN: Meta lo pedirá si alguna vez mueves el número." };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar." };
  }
}

/**
 * Respuesta escrita por una persona del equipo desde el panel. Meta solo
 * permite texto libre dentro de las 24 horas siguientes al último mensaje de
 * la persona; pasado ese plazo exige una plantilla aprobada.
 */
export async function accionResponder(_prev: EstadoRegistro, formData: FormData): Promise<EstadoRegistro> {
  await requerirAdmin();
  if (!whatsappConfigurado()) return { error: "Faltan las variables WA_* en Vercel." };
  const telefono = String(formData.get("telefono") ?? "").replace(/\D/g, "");
  const texto = String(formData.get("texto") ?? "").trim().slice(0, 4000);
  if (!/^\d{8,15}$/.test(telefono) || !texto) return { error: "Falta el texto." };
  try {
    await enviarTexto(telefono, texto);
    await getSupabaseAdmin().from("mensajes_whatsapp").insert({ telefono, rol: "asistente", contenido: texto, tipo: "humano" });
    revalidatePath("/admin/whatsapp");
    return { mensaje: "Enviado." };
  } catch (e) {
    const detalle = e instanceof Error ? e.message : "No se pudo enviar.";
    return { error: /131047|24 ?h|re-engagement/i.test(detalle) ? "Pasaron más de 24 horas desde su último mensaje: WhatsApp ya no permite texto libre. Espera a que vuelva a escribir." : detalle };
  }
}
