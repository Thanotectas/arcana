"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "../supabase/server";
import { aplicarInvitacionPendiente } from "../invitaciones";
import { rutaInterna, zonaHorariaValida } from "../seguridad";

export interface EstadoAuth {
  error?: string;
  mensaje?: string;
}

function urlBase(h: Headers) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`
  );
}

/** Token de Turnstile del formulario (lo verifica Supabase Auth). */
function tokenCaptcha(formData: FormData) {
  const v = String(formData.get("captcha") ?? "").trim();
  return v ? v.slice(0, 4096) : undefined;
}

function esErrorCaptcha(mensaje: string) {
  return /captcha/i.test(mensaje);
}

function destinoSeguro(v: FormDataEntryValue | null) {
  return rutaInterna(String(v ?? ""));
}

/** Inicia sesión (o crea la cuenta) con Google y vuelve a /auth/callback. */
export async function accionGoogle(formData: FormData) {
  const volver = destinoSeguro(formData.get("volver"));
  const supabase = await createClient();
  const h = await headers();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${urlBase(h)}/auth/callback?siguiente=${encodeURIComponent(volver)}` },
  });
  if (error || !data.url) redirect("/entrar?error=google");
  redirect(data.url);
}

export async function accionEntrar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "campos" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: tokenCaptcha(formData) } });
  if (error) return { error: esErrorCaptcha(error.message) ? "captcha" : "credenciales" };
  redirect(destinoSeguro(formData.get("volver")));
}

export async function accionRegistrar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const acepta = formData.get("acepta") === "on";

  if (!nombre) return { error: "nombre" };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "correo" };
  if (password.length < 8) return { error: "contrasena" };
  if (!acepta) return { error: "terminos" };

  const supabase = await createClient();
  const h = await headers();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${urlBase(h)}/auth/callback?siguiente=/inicio`,
      captchaToken: tokenCaptcha(formData),
    },
  });
  if (error) {
    if (esErrorCaptcha(error.message)) return { error: "captcha" };
    return { error: error.message.includes("already") ? "yaRegistrado" : "noCrear" };
  }
  if (data.session) {
    await aplicarInvitacionPendiente();
    redirect("/inicio");
  }
  return { mensaje: "revisaCorreo" };
}

export async function accionSalir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function accionRecuperar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "escribeCorreo" };
  const supabase = await createClient();
  const h = await headers();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${urlBase(h)}/auth/callback?siguiente=/cuenta`,
    captchaToken: tokenCaptcha(formData),
  });
  if (error && esErrorCaptcha(error.message)) return { error: "captcha" };
  return { mensaje: "enlaceEnviado" };
}

export async function accionActualizarPerfil(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const password = String(formData.get("password") ?? "");
  if (!nombre) return { error: "nombreVacio" };

  const { error } = await supabase.from("perfiles").update({ nombre }).eq("id", user.id);
  if (error) return { error: "noGuardar" };

  if (password) {
    if (password.length < 8) return { error: "contrasena" };
    const { error: e2 } = await supabase.auth.updateUser({ password });
    if (e2) return { error: "noCambiarContrasena" };
  }
  return { mensaje: "perfilActualizado" };
}

/** Preferencia de correos de Sibila (campañas: carta del día y regreso). */
export async function accionCorreos(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  const recibe = formData.get("recibe") === "on";
  const { error } = await supabase.from("perfiles").update({ recibe_correos: recibe }).eq("id", user.id);
  if (error) return { error: "noGuardar" };
  revalidatePath("/cuenta");
  return { mensaje: "perfilActualizado" };
}

/** Datos de nacimiento del perfil (memoria para el cielo diario y las cartas). */
export async function accionGuardarNacimiento(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const fecha = String(formData.get("fecha") ?? "");
  const horaDesconocida = formData.get("hora_desconocida") === "on";
  const hora = String(formData.get("hora") ?? "12:00") || "12:00";
  const lugar = String(formData.get("lugar") ?? "").trim().slice(0, 120);
  const latitud = Number(formData.get("latitud"));
  const longitud = Number(formData.get("longitud"));
  const zonaHoraria = String(formData.get("zona_horaria") ?? "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "nacimientoFecha" };
  const anio = Number(fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return { error: "nacimientoFecha" };
  if (!horaDesconocida && !/^\d{2}:\d{2}$/.test(hora)) return { error: "nacimientoHora" };
  if (!lugar || Number.isNaN(latitud) || Number.isNaN(longitud) || !zonaHorariaValida(zonaHoraria)) return { error: "nacimientoLugar" };
  if (Math.abs(latitud) > 90 || Math.abs(longitud) > 180) return { error: "nacimientoLugar" };

  const { error } = await supabase
    .from("perfiles")
    .update({
      fecha_nacimiento: fecha,
      hora_nacimiento: horaDesconocida ? null : hora,
      lugar_nacimiento: lugar,
      latitud,
      longitud,
      zona_horaria: zonaHoraria,
    })
    .eq("id", user.id);
  if (error) return { error: "noGuardar" };
  return { mensaje: "nacimientoGuardado" };
}
