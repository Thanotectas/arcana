"use server";

import { correosAdmin, requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { correoConfigurado, enviarCorreo } from "@/lib/correo";
import { calcularResumen, correoResumen } from "./semanal";

export interface EstadoResumen {
  error?: string;
  mensaje?: string;
}

/** Envía ahora mismo el resumen semanal a la administración (sin esperar al lunes). */
export async function accionEnviarResumen(): Promise<EstadoResumen> {
  await requerirAdmin();
  if (!correoConfigurado()) return { error: "Falta RESEND_API_KEY en Vercel." };
  try {
    const correo = correoResumen(await calcularResumen(getSupabaseAdmin()));
    const envios = await Promise.all(correosAdmin().map((para) => enviarCorreo({ para, ...correo, etiqueta: "resumen_semanal" })));
    const fallidos = envios.filter((e) => !e.ok);
    return fallidos.length ? { error: `No se pudo enviar: ${fallidos.map((f) => (f.ok ? "" : f.error)).join(", ")}` } : { mensaje: `Enviado a ${envios.length} ${envios.length === 1 ? "correo" : "correos"}.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo calcular." };
  }
}
