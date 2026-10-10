"use server";

import { revalidatePath } from "next/cache";
import { requerirAdmin } from "./admin";
import { getSupabaseAdmin } from "./supabase/admin";
import { enviarCorreo, sitio } from "./correo";
import { formatoCOP } from "./creditos";

export interface EstadoRetiroAdmin {
  error?: string;
  mensaje?: string;
}

/** Marca un retiro en dinero como pagado o rechazado (el rechazado devuelve el saldo). */
export async function accionResolverRetiro(_prev: EstadoRetiroAdmin, formData: FormData): Promise<EstadoRetiroAdmin> {
  await requerirAdmin();
  const id = Number(formData.get("id"));
  const decision = formData.get("decision") === "pagado" ? "pagado" : "rechazado";
  const nota = String(formData.get("nota") ?? "").trim().slice(0, 300) || null;
  if (!Number.isInteger(id)) return { error: "Retiro no válido." };
  const admin = getSupabaseAdmin();
  const { data: retiro, error } = await admin
    .from("retiros_embajador")
    .update({ estado: decision, nota, resuelto_en: new Date().toISOString() })
    .eq("id", id)
    .eq("estado", "solicitado")
    .select("embajador_id, monto_cop")
    .maybeSingle();
  if (error) return { error: error.message };
  if (!retiro) return { error: "Ese retiro ya estaba resuelto." };
  const { data: u } = await admin.auth.admin.getUserById(retiro.embajador_id);
  if (u.user?.email) {
    const pagado = decision === "pagado";
    await enviarCorreo({
      para: u.user.email,
      asunto: pagado ? `Te enviamos ${formatoCOP(retiro.monto_cop)} de tus comisiones` : "Tu solicitud de retiro no se pudo pagar",
      html: `<p>${pagado ? `Ya te enviamos <b>${formatoCOP(retiro.monto_cop)}</b> de tus comisiones como Embajador de Arcana. ¡Gracias por recomendarnos!` : `No pudimos enviar tu retiro de ${formatoCOP(retiro.monto_cop)}; el saldo volvió a tu panel.`}${nota ? `<br><br>${nota.replace(/</g, "&lt;")}` : ""}</p><p><a href="${sitio()}/invitar#embajadores">Ver mi panel</a></p>`,
      texto: `${pagado ? `Ya te enviamos ${formatoCOP(retiro.monto_cop)} de tus comisiones.` : `No pudimos enviar tu retiro de ${formatoCOP(retiro.monto_cop)}; el saldo volvió a tu panel.`} ${nota ?? ""} ${sitio()}/invitar#embajadores`,
      etiqueta: "embajadores",
    }).catch(() => undefined);
  }
  revalidatePath("/admin/embajadores");
  return { mensaje: decision === "pagado" ? "Marcado como pagado y avisado por correo." : "Rechazado; el saldo volvió al embajador." };
}
