import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { NOMBRES_LECTURA } from "@/lib/creditos";
import { datoDeUsuario } from "@/lib/seguridad";

/**
 * Memoria de la persona para el modelo: nombre, cielo natal (si dio sus
 * datos) y un extracto de sus últimas lecturas. Se añade al sistema para
 * que Arcana hable con continuidad, sin repetir lo ya dicho.
 */

/** Quita marcas de Markdown y recorta a `max` caracteres. */
export function extractoPlano(texto: string, max = 260) {
  const sintesis = texto.match(/##\s*(S[ií]ntesis|Synthesis|S[ií]ntese)[^\n]*\n+([\s\S]*?)(?=\n##|$)/i);
  const base = (sintesis ? sintesis[2] : texto)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s.*$/gm, " ")
    .replace(/[*_>`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (base.length <= max) return base;
  const corte = base.slice(0, max);
  const fin = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf(", "), corte.lastIndexOf(" "));
  return corte.slice(0, fin > 80 ? fin : max).trim() + "…";
}

export async function memoriaDeLaPersona(
  supabase: SupabaseClient<Database>,
  usuarioId: string,
  opciones: { excluirLectura?: string; maximo?: number } = {},
): Promise<string> {
  const maximo = opciones.maximo ?? 3;
  const [{ data: perfil }, { data: lecturas }] = await Promise.all([
    supabase.from("perfiles").select("nombre, fecha_nacimiento, lugar_nacimiento").eq("id", usuarioId).maybeSingle(),
    supabase
      .from("lecturas")
      .select("id, tipo, titulo, interpretacion, creado_en")
      .eq("usuario_id", usuarioId)
      .eq("estado", "lista")
      .not("interpretacion", "is", null)
      .order("creado_en", { ascending: false })
      .limit(maximo + 1),
  ]);

  const previas = (lecturas ?? []).filter((l) => l.id !== opciones.excluirLectura).slice(0, maximo);
  const lineas: string[] = [];
  if (perfil?.nombre) {
    lineas.push(
      `Nombre de la persona: ${datoDeUsuario(perfil.nombre, 80)}` +
        (perfil.fecha_nacimiento ? `, nacida el ${perfil.fecha_nacimiento}` : "") +
        (perfil.lugar_nacimiento ? ` en ${datoDeUsuario(perfil.lugar_nacimiento, 120)}` : "") +
        ".",
    );
  }
  if (previas.length) {
    lineas.push("Consultas anteriores de esta persona (de la más reciente a la más antigua):");
    for (const l of previas) {
      const tipo = NOMBRES_LECTURA[l.tipo as keyof typeof NOMBRES_LECTURA] ?? l.tipo;
      lineas.push(`- ${l.creado_en.slice(0, 10)} · ${datoDeUsuario(l.titulo, 120)} (${tipo}): ${extractoPlano(l.interpretacion ?? "")}`);
    }
  }
  if (!lineas.length) return "";
  return (
    "MEMORIA DE LA PERSONA (úsala con discreción: da continuidad, alude a lo que ya exploró si viene al caso, " +
    "pero no repitas ni resumas esas lecturas y no menciones esta memoria como tal):\n" +
    lineas.join("\n")
  );
}
