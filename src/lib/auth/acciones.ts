"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "../supabase/server";

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

function destinoSeguro(v: FormDataEntryValue | null) {
  const s = String(v ?? "");
  return s.startsWith("/") && !s.startsWith("//") ? s : "/inicio";
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
  if (!email || !password) return { error: "Escribe tu correo y contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect(destinoSeguro(formData.get("volver")));
}

export async function accionRegistrar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const acepta = formData.get("acepta") === "on";

  if (!nombre) return { error: "Escribe tu nombre." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Correo no válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  if (!acepta) return { error: "Debes aceptar los términos y la política de privacidad." };

  const supabase = await createClient();
  const h = await headers();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
      emailRedirectTo: `${urlBase(h)}/auth/callback?siguiente=/inicio`,
    },
  });
  if (error) {
    return { error: error.message.includes("already") ? "Ese correo ya está registrado." : "No se pudo crear la cuenta." };
  }
  if (data.session) redirect("/inicio");
  return { mensaje: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja de entrada." };
}

export async function accionSalir() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function accionRecuperar(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return { error: "Escribe tu correo." };
  const supabase = await createClient();
  const h = await headers();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${urlBase(h)}/auth/callback?siguiente=/cuenta`,
  });
  return { mensaje: "Si el correo existe, recibirás un enlace para restablecer tu contraseña." };
}

export async function accionActualizarPerfil(_prev: EstadoAuth, formData: FormData): Promise<EstadoAuth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const password = String(formData.get("password") ?? "");
  if (!nombre) return { error: "El nombre no puede estar vacío." };

  const { error } = await supabase.from("perfiles").update({ nombre }).eq("id", user.id);
  if (error) return { error: "No se pudo guardar el perfil." };

  if (password) {
    if (password.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres." };
    const { error: e2 } = await supabase.auth.updateUser({ password });
    if (e2) return { error: "No se pudo cambiar la contraseña." };
  }
  return { mensaje: "Perfil actualizado." };
}
