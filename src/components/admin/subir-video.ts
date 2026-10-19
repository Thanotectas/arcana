"use client";

import { createClient } from "@/lib/supabase/client";
import { accionSubidaTiktok } from "@/lib/redes/acciones-tiktok";

/**
 * Si en el formulario se eligió "subida", sube el MP4 directo al bucket de
 * redes (URL firmada) y cambia la fuente a "subida:<ruta>". Devuelve un
 * mensaje de error para mostrar, o null si el formulario quedó listo.
 */
export async function prepararSubida(fd: FormData, alSubir: (subiendo: boolean) => void): Promise<string | null> {
  if (fd.get("fuente") === "subida") {
    const archivo = fd.get("archivo");
    if (!(archivo instanceof File) || !archivo.size) return "Elige un video MP4.";
    if (archivo.type !== "video/mp4") return "El video debe ser MP4.";
    if (archivo.size > 50 * 1024 * 1024) return "El video pesa más de 50 MB.";
    alSubir(true);
    try {
      const permiso = await accionSubidaTiktok();
      if (!permiso.ruta || !permiso.token) return permiso.error ?? "No se pudo preparar la subida.";
      const { error } = await createClient().storage.from("redes").uploadToSignedUrl(permiso.ruta, permiso.token, archivo, { contentType: "video/mp4" });
      if (error) return `Subida: ${error.message}`;
      fd.set("fuente", `subida:${permiso.ruta}`);
    } finally {
      alSubir(false);
    }
  }
  fd.delete("archivo");
  return null;
}
