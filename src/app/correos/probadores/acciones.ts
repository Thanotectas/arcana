"use server";

import { redirect } from "next/navigation";
import { requerirUsuario } from "@/lib/dal";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { correoConfigurado, enviarCorreo, urlBaja } from "@/lib/correo";
import { correoProbador, esAdministrador, probadores } from "@/lib/correos/probadores";

/** Envía el agradecimiento a los probadores que aún no lo recibieron. */
export async function accionEnviarProbadores() {
  const usuario = await requerirUsuario();
  if (!esAdministrador(usuario.email)) redirect("/inicio");
  if (!correoConfigurado()) redirect("/correos/probadores?error=sin_resend");

  const admin = getSupabaseAdmin();
  const pendientes = (await probadores()).filter((p) => p.recibeCorreos && !p.yaEnviado);
  let enviados = 0;
  let fallidos = 0;
  for (const p of pendientes) {
    const baja = urlBaja(p.id);
    const correo = correoProbador(p, baja);
    const r = await enviarCorreo({
      para: p.correo,
      asunto: correo.asunto,
      html: correo.html,
      texto: correo.texto,
      etiqueta: "probadores",
      cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
    await admin.from("correos").insert({
      usuario_id: p.id,
      tipo: "probadores",
      asunto: correo.asunto,
      estado: r.ok ? "enviado" : "error",
      id_proveedor: r.ok ? r.id : null,
      detalle: r.ok ? null : r.error,
    });
    if (r.ok) enviados++;
    else {
      fallidos++;
      console.error("[correos probadores] envío fallido", p.id, r.error);
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    // Resend admite 2 peticiones por segundo.
    await new Promise((res) => setTimeout(res, 600));
  }
  redirect(`/correos/probadores?enviados=${enviados}&fallidos=${fallidos}`);
}
