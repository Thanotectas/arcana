"use server";

import { requerirAdmin } from "@/lib/admin";
import { esIdioma } from "@/lib/i18n/idiomas";
import { carpetaVoz, narrarGuion, traducirGuion } from "@/lib/voz-sibila";

export interface ResultadoVoz {
  idioma: string;
  guion?: string;
  url?: string;
  error?: string;
}

/** Un idioma por llamada (así cada una cabe en el tiempo de una función y la página muestra el avance). */
export async function accionVozSibila(entrada: { guion: string; idioma: string; nombre: string; guionTraducido?: string; soloTexto?: boolean }): Promise<ResultadoVoz> {
  await requerirAdmin();
  const { idioma } = entrada;
  if (!esIdioma(idioma)) return { idioma, error: "Idioma no válido." };
  if (entrada.guion.trim().length < 10) return { idioma, error: "Escribe el guion." };
  try {
    const guion = entrada.guionTraducido?.trim() || (await traducirGuion(entrada.guion, idioma));
    if (entrada.soloTexto) return { idioma, guion };
    const url = await narrarGuion(guion, idioma, carpetaVoz(entrada.nombre));
    return { idioma, guion, url };
  } catch (e) {
    return { idioma, error: e instanceof Error ? e.message : String(e) };
  }
}
