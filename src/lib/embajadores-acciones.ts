"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { correosAdmin } from "./admin";
import { enviarCorreo, escaparHtml, sitio } from "./correo";
import { formatoCOP } from "./creditos";
import { EMBAJADORES, METODOS_PAGO, type MetodoPago } from "./embajadores";

/** Códigos de error que el panel traduce (t.embajadores.errores). */
export interface EstadoEmbajador {
  error?: "sesion" | "condiciones" | "datos" | "monto" | "minimo" | "saldo" | "sinDatosPago" | "general";
  mensaje?: "unido" | "datosGuardados" | "canjeado" | "solicitado";
  creditos?: number;
}

async function usuario() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

function monto(formData: FormData, disponible: number) {
  const crudo = String(formData.get("monto") ?? "").replace(/[^\d]/g, "");
  if (formData.get("todo") === "1") return disponible;
  return crudo ? Number(crudo) : NaN;
}

export async function accionUnirmeEmbajadores(_prev: EstadoEmbajador, formData: FormData): Promise<EstadoEmbajador> {
  const { supabase, user } = await usuario();
  if (!user) return { error: "sesion" };
  if (formData.get("acepto") !== "on") return { error: "condiciones" };
  const { data, error } = await supabase.rpc("unirme_embajadores");
  if (error || !data) return { error: "general" };
  const [para] = correosAdmin();
  if (para) {
    await enviarCorreo({
      para,
      asunto: "Nuevo Embajador de Arcana",
      html: `<p>${escaparHtml(user.email ?? user.id)} se unió al programa de Embajadores.</p><p><a href="${sitio()}/admin/embajadores">Ver embajadores</a></p>`,
      texto: `${user.email ?? user.id} se unió al programa de Embajadores. ${sitio()}/admin/embajadores`,
      etiqueta: "embajadores",
    }).catch(() => undefined);
  }
  revalidatePath("/invitar");
  return { mensaje: "unido" };
}

export async function accionDatosPago(_prev: EstadoEmbajador, formData: FormData): Promise<EstadoEmbajador> {
  const { supabase, user } = await usuario();
  if (!user) return { error: "sesion" };
  const metodo = String(formData.get("metodo") ?? "") as MetodoPago;
  const datos = String(formData.get("datos") ?? "").trim();
  const titular = String(formData.get("titular") ?? "").trim();
  if (!METODOS_PAGO.includes(metodo) || datos.length < 6 || titular.length < 3) return { error: "datos" };
  const { data, error } = await supabase.rpc("guardar_pago_embajador", { p_metodo: metodo, p_datos: datos, p_titular: titular });
  if (error || !data) return { error: "general" };
  revalidatePath("/invitar");
  return { mensaje: "datosGuardados" };
}

export async function accionCanjearCreditos(_prev: EstadoEmbajador, formData: FormData): Promise<EstadoEmbajador> {
  const { supabase, user } = await usuario();
  if (!user) return { error: "sesion" };
  const disponible = Number(formData.get("disponible") ?? 0);
  const valor = monto(formData, disponible);
  if (!Number.isFinite(valor)) return { error: "monto" };
  if (valor < EMBAJADORES.pesosPorCredito) return { error: "minimo" };
  const { data, error } = await supabase.rpc("canjear_saldo_creditos", { p_monto_cop: Math.floor(valor) });
  if (error) return { error: "general" };
  if (!data) return { error: "saldo" };
  revalidatePath("/invitar");
  return { mensaje: "canjeado", creditos: data };
}

export async function accionSolicitarRetiro(_prev: EstadoEmbajador, formData: FormData): Promise<EstadoEmbajador> {
  const { supabase, user } = await usuario();
  if (!user) return { error: "sesion" };
  const disponible = Number(formData.get("disponible") ?? 0);
  const valor = monto(formData, disponible);
  if (!Number.isFinite(valor)) return { error: "monto" };
  if (valor < EMBAJADORES.retiroMinimo) return { error: "minimo" };
  const { data: datosPago } = await supabase.from("embajadores").select("metodo_pago, datos_pago, titular").maybeSingle();
  if (!datosPago?.metodo_pago || !datosPago.datos_pago || !datosPago.titular) return { error: "sinDatosPago" };
  const { data, error } = await supabase.rpc("solicitar_retiro_embajador", { p_monto_cop: Math.floor(valor) });
  if (error) return { error: "general" };
  if (!data) return { error: "saldo" };
  const [para] = correosAdmin();
  if (para) {
    const detalle = `${formatoCOP(Math.floor(valor))} a ${datosPago.metodo_pago} ${datosPago.datos_pago} (${datosPago.titular}) · ${user.email ?? user.id}`;
    await enviarCorreo({
      para,
      asunto: `Retiro de Embajador: ${formatoCOP(Math.floor(valor))}`,
      html: `<p>Nueva solicitud de retiro:</p><p><b>${escaparHtml(detalle)}</b></p><p><a href="${sitio()}/admin/embajadores">Pagar y marcar como pagado</a></p>`,
      texto: `Nueva solicitud de retiro: ${detalle}. ${sitio()}/admin/embajadores`,
      etiqueta: "embajadores",
    }).catch(() => undefined);
  }
  revalidatePath("/invitar");
  return { mensaje: "solicitado" };
}
