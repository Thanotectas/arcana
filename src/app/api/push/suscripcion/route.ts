import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { getIdioma } from "@/lib/i18n/servidor";
import { pushConfigurado } from "@/lib/push";

interface CuerpoSuscripcion {
  endpoint?: string;
  keys?: { p256dh?: string; auth?: string };
}

/** Guarda la suscripción push del navegador (una por endpoint) y recuerda el idioma. */
export async function POST(request: Request) {
  if (!pushConfigurado()) return Response.json({ error: "sin_configurar" }, { status: 503 });
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });

  let cuerpo: CuerpoSuscripcion = {};
  try {
    cuerpo = (await request.json()) as CuerpoSuscripcion;
  } catch {
    /* sin cuerpo */
  }
  const endpoint = String(cuerpo.endpoint ?? "");
  const p256dh = String(cuerpo.keys?.p256dh ?? "");
  const auth = String(cuerpo.keys?.auth ?? "");
  if (!/^https:\/\//.test(endpoint) || !p256dh || !auth) return Response.json({ error: "suscripcion_invalida" }, { status: 400 });

  const [idioma, h] = await Promise.all([getIdioma(), headers()]);
  const agente = (h.get("user-agent") ?? "").slice(0, 200);

  // registrar_push: reemplaza el endpoint aunque fuera de otra cuenta (el navegador cambió de dueño) y limita a 10 dispositivos.
  const { error } = await supabase.rpc("registrar_push", { p_endpoint: endpoint, p_p256dh: p256dh, p_auth: auth, p_idioma: idioma, p_agente: agente });
  if (error) {
    console.error("[push] no se guardó la suscripción", error.message);
    return Response.json({ error: "guardar" }, { status: 500 });
  }
  await supabase.from("perfiles").update({ idioma }).eq("id", user.id);
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "no_autenticado" }, { status: 401 });
  let endpoint = "";
  try {
    endpoint = String(((await request.json()) as CuerpoSuscripcion).endpoint ?? "");
  } catch {
    /* sin cuerpo */
  }
  if (!endpoint) return Response.json({ error: "suscripcion_invalida" }, { status: 400 });
  await supabase.from("suscripciones_push").delete().eq("endpoint", endpoint);
  return Response.json({ ok: true });
}
