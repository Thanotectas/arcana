"use server";
import { revalidatePath } from "next/cache";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { consultarSeguidores, guardarSeguidores } from "./hub";

export interface EstadoHub {
  error?: string;
  mensaje?: string;
}

/** Pregunta ya a cada red cuántos seguidores tiene (el cron lo hace cada mañana). */
export async function accionConsultarSeguidores(): Promise<EstadoHub> {
  await requerirAdmin();
  try {
    const admin = getSupabaseAdmin();
    const s = await consultarSeguidores(admin);
    await guardarSeguidores(admin, s);
    revalidatePath("/admin/hub");
    const ok = s.redes.filter((r) => r.seguidores !== null);
    const mal = s.redes.filter((r) => r.seguidores === null);
    if (!ok.length) return { error: mal.map((r) => `${r.red}: ${r.detalle}`).join(" · ") || "No hay redes configuradas." };
    return { mensaje: `${ok.map((r) => `${r.red} ${r.seguidores}`).join(" · ")}${mal.length ? ` · sin dato: ${mal.map((r) => r.red).join(", ")}` : ""}` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudieron consultar los seguidores." };
  }
}
