import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { fechaLargaEs, generarSemana, lunesDe, sumarDias, NOMBRE_TIPO, type ResultadoGeneracion } from "./calendario";

/**
 * Pieza automática del agente de redes (la llama el cron diario):
 * - Si la semana en curso no tiene borradores, los crea para los días que quedan
 *   (primer arranque).
 * - De viernes a domingo, si la próxima semana no tiene nada, la redacta.
 * Cada vez que genera algo avisa por correo a la administración.
 */
export async function asegurarBorradores(admin: SupabaseClient<Database>, hoy: string): Promise<ResultadoGeneracion[]> {
  const lunes = lunesDe(hoy);
  const diaSemana = Math.round((Date.parse(`${hoy}T12:00:00Z`) - Date.parse(`${lunes}T12:00:00Z`)) / 86_400_000); // 0 = lunes
  const semanas = [lunes];
  if (diaSemana >= 4) semanas.push(sumarDias(lunes, 7));

  const generadas: ResultadoGeneracion[] = [];
  for (const semana of semanas) {
    const { count } = await admin.from("publicaciones_programadas").select("id", { count: "exact", head: true }).eq("semana", semana);
    if (count) continue;
    const r = await generarSemana(admin, semana, hoy);
    if (r.creadas) generadas.push(r);
  }
  if (generadas.length) await avisarAdmin(admin, generadas);
  return generadas;
}

async function avisarAdmin(admin: SupabaseClient<Database>, generadas: ResultadoGeneracion[]) {
  const [para] = correosAdmin();
  if (!para) return;
  const semanas = generadas.map((g) => g.semana);
  const { data } = await admin.from("publicaciones_programadas").select("fecha, tipo, titulo").in("semana", semanas).eq("estado", "borrador").order("fecha");
  const filas = data ?? [];
  const url = `${sitio()}/admin/redes`;
  const lista = filas.map((f) => `${fechaLargaEs(f.fecha)} · ${NOMBRE_TIPO[f.tipo]}: ${f.titulo}`);
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Agente de redes</p>
<h1 style="font-size:26px;color:#f1d99a;margin:0 0 16px">${filas.length} publicaciones por aprobar</h1>
<ul style="padding-left:18px;line-height:1.6;color:#d9d2ea">${lista.map((l) => `<li>${escaparHtml(l)}</li>`).join("")}</ul>
<p style="margin:24px 0 0"><a href="${url}" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Revisar y aprobar</a></p>
<p style="margin:18px 0 0;font-size:13px;color:#a89fc0">Lo que apruebes sale a mediodía (hora de Bogotá) en Instagram y Facebook. Lo que no apruebes no se publica.</p>
</div>`;
  const texto = `${filas.length} publicaciones por aprobar en ${url}\n\n${lista.join("\n")}`;
  await enviarCorreo({ para, asunto: `Sibila dejó ${filas.length} publicaciones por aprobar`, html, texto, etiqueta: "agente_redes" });
}
