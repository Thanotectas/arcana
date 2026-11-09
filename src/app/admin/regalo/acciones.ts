"use server";

import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/admin";
import { correoConfigurado } from "@/lib/correo";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { destinosRegalo, enviadosHoy, enviarRegaloVaso } from "@/lib/correos/regalo";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";

/** Cupo diario de Resend gratuito (100) menos un margen para los correos de la cuenta (confirmaciones, avisos). */
const CUPO_DIARIO = 90;

/** Prueba: el correo de regalo a la cuenta de quien administra, con su propio enlace (no cuenta para el envío). */
export async function accionPruebaRegalo() {
  const usuario = await requerirAdmin();
  if (!correoConfigurado()) redirect("/admin/regalo?error=sin_resend");
  const { data: perfil } = await getSupabaseAdmin().from("perfiles").select("nombre, idioma").eq("id", usuario.id).maybeSingle();
  const r = await enviarRegaloVaso(
    { id: usuario.id, correo: usuario.email ?? "", nombre: perfil?.nombre ?? null, idioma: esIdioma(perfil?.idioma) ? perfil.idioma : IDIOMA_PREDETERMINADO },
    false,
  );
  redirect(r.ok ? `/admin/regalo?prueba=${encodeURIComponent(usuario.email ?? "")}` : `/admin/regalo?error=${encodeURIComponent(r.error.slice(0, 120))}`);
}

/** Envía el regalo a la siguiente tanda (lo que quede del cupo de hoy, máximo `cantidad`). */
export async function accionEnviarRegalo(formData: FormData) {
  await requerirAdmin();
  if (!correoConfigurado()) redirect("/admin/regalo?error=sin_resend");
  const pedido = Math.max(1, Math.min(90, Number(formData.get("cantidad")) || 20));
  const cupo = Math.max(0, CUPO_DIARIO - (await enviadosHoy()));
  const lote = (await destinosRegalo()).slice(0, Math.min(pedido, cupo));
  let enviados = 0;
  let fallidos = 0;
  for (const d of lote) {
    const r = await enviarRegaloVaso(d);
    if (r.ok) enviados++;
    else {
      fallidos++;
      console.error("[regalo vaso] envío fallido", d.id, r.error);
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    // Resend admite 2 peticiones por segundo.
    await new Promise((res) => setTimeout(res, 600));
  }
  redirect(`/admin/regalo?enviados=${enviados}&fallidos=${fallidos}${cupo === 0 ? "&sin_cupo=1" : ""}`);
}
