"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { registrarNumero, whatsappConfigurado } from "./api";

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
