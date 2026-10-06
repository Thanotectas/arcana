import "server-only";
import { notFound } from "next/navigation";
import { requerirUsuario } from "@/lib/dal";

/**
 * Personas administradoras: correos en ADMIN_CORREOS (separados por coma).
 * Quien no lo sea recibe un 404 (la página no existe para el resto).
 */
export function correosAdmin() {
  return (process.env.ADMIN_CORREOS ?? "")
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
