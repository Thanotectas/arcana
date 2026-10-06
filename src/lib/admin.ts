import "server-only";
import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/dal";

/**
 * Personas administradoras (acceso a /admin/*): correos en ADMIN_CORREOS
 * (separados por coma; también se acepta ARCANA_ADMINS). Si no hay variable,
 * solo la cuenta del dueño. Quien no lo sea recibe un 404.
 */
export function correosAdmin() {
  return (process.env.ADMIN_CORREOS ?? process.env.ARCANA_ADMINS ?? "lualzaja@gmail.com")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
}

export function esAdmin(correo: string | null | undefined) {
  return Boolean(correo && correosAdmin().includes(correo.toLowerCase()));
}

/** Usuario autenticado y administrador, o 404. */
export async function requerirAdmin() {
  const usuario = await requerirUsuario();
  if (!esAdmin(usuario.email)) notFound();
  return usuario;
}
