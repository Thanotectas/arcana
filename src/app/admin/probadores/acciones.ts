"use server";

import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { correoConfigurado, enviarCorreo, urlBaja } from "@/lib/correo";
import { correoProbador, probadores } from "@/lib/correos/probadores";
import { correoInvitacionProbador, correoProbadorAgregado } from "@/lib/correos/invitacion-probador";
import { ENLACE_PRUEBA_PLAY } from "@/lib/marca/play";

const esperar = (ms: number) => new Promise((res) => setTimeout(res, ms));
const primerNombre = (n: string | null | undefined) => (n?.trim().split(/\s+/)[0] ?? "").replace(/^./, (c) => c.toUpperCase());

/** Datos para escribirle a cada cuenta: correo y primer nombre. */
async function destinatarios(ids: string[]) {
  const admin = getSupabaseAdmin();
  const { data: perfiles } = await admin.from("perfiles").select("id, nombre, recibe_correos").in("id", ids);
  const salida: { id: string; correo: string; nombre: string }[] = [];
  for (const p of perfiles ?? []) {
    if (!p.recibe_correos) continue;
    const { data } = await admin.auth.admin.getUserById(p.id);
    if (data.user?.email) salida.push({ id: p.id, correo: data.user.email, nombre: primerNombre(p.nombre) });
  }
  return salida;
}

async function enviarYRegistrar(id: string, para: string, tipo: string, correo: { asunto: string; html: string; texto: string }, baja: string) {
  const r = await enviarCorreo({ para, asunto: correo.asunto, html: correo.html, texto: correo.texto, etiqueta: tipo, cabeceras: { "List-Unsubscribe": `<${baja}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
  await getSupabaseAdmin().from("correos").insert({ usuario_id: id, tipo, asunto: correo.asunto, estado: r.ok ? "enviado" : "error", id_proveedor: r.ok ? r.id : null, detalle: r.ok ? null : r.error });
  return r;
}

/** Invita a la prueba de Android a las cuentas elegidas (como mucho 20 por vez). */
export async function accionInvitarProbadores(formData: FormData) {
  await requerirAdmin();
  if (!correoConfigurado()) redirect("/admin/probadores?error=sin_resend");
  const ids = formData.getAll("id").map(String).filter((x) => /^[0-9a-f-]{36}$/.test(x)).slice(0, 20);
  const admin = getSupabaseAdmin();
  let invitados = 0;
  let fallidos = 0;
  for (const d of await destinatarios(ids)) {
    const { error } = await admin.from("probadores_invitaciones").insert({ usuario_id: d.id });
    if (error) continue; // ya estaba invitado
    const baja = urlBaja(d.id);
    const r = await enviarYRegistrar(d.id, d.correo, "invitacion_probador", correoInvitacionProbador(d.nombre, baja), baja);
    if (r.ok) invitados++;
    else {
      fallidos++;
      await admin.from("probadores_invitaciones").delete().eq("usuario_id", d.id);
      if (/^(401|403|422|429)/.test(r.error)) break;
    }
    await esperar(600);
  }
  redirect(`/admin/probadores?invitados=${invitados}&fallidos=${fallidos}`);
}

/** Ya están en la lista de verificadores de Play Console: se marcan y, con el enlace configurado, se les avisa. */
export async function accionMarcarAgregados(formData: FormData) {
  await requerirAdmin();
  const ids = formData.getAll("agregado").map(String).filter((x) => /^[0-9a-f-]{36}$/.test(x));
  if (!ids.length) redirect("/admin/probadores");
  const admin = getSupabaseAdmin();
  await admin.from("probadores_invitaciones").update({ agregado_en: new Date().toISOString() }).in("usuario_id", ids);
  let avisados = 0;
  if (ENLACE_PRUEBA_PLAY && correoConfigurado()) {
    for (const d of await destinatarios(ids)) {
      const baja = urlBaja(d.id);
      const r = await enviarYRegistrar(d.id, d.correo, "probador_agregado", correoProbadorAgregado(d.nombre, ENLACE_PRUEBA_PLAY, baja), baja);
      if (r.ok) avisados++;
      await esperar(600);
    }
  }
  redirect(`/admin/probadores?agregados=${ids.length}&avisados=${avisados}`);
}

/** Envía el agradecimiento a los probadores que aún no lo recibieron. */
export async function accionEnviarProbadores() {
  await requerirAdmin();
  if (!correoConfigurado()) redirect("/admin/probadores?error=sin_resend");

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
  redirect(`/admin/probadores?enviados=${enviados}&fallidos=${fallidos}`);
}
