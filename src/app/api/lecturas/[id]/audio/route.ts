import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";
import { BUCKET_AUDIOS, audioConfigurado, creditosAudioCompleto, escribirMensaje, narrar, textoParaVoz, type TipoAudio } from "@/lib/lecturas/audio";
import type { TipoLectura } from "@/lib/creditos";

export const maxDuration = 300;

/** Si un audio quedó «generando» más de 5 minutos, la generación se cayó: se puede intentar de nuevo. */
const VENCE_GENERANDO = 5 * 60_000;

async function lecturaPropia(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: Response.json({ error: "no_autenticado" }, { status: 401 }) } as const;
  const { data: lectura } = await supabase.from("lecturas").select("id, usuario_id, tipo, entrada, interpretacion, estado").eq("id", id).maybeSingle();
  if (!lectura || lectura.estado !== "lista" || !lectura.interpretacion) return { error: Response.json({ error: "lectura_no_lista" }, { status: 409 }) } as const;
  return { supabase, user, lectura } as const;
}

async function urlFirmada(ruta: string) {
  const { data } = await getSupabaseAdmin().storage.from(BUCKET_AUDIOS).createSignedUrl(ruta, 60 * 60 * 6);
  return data?.signedUrl ?? null;
}

/** Estado de los dos audios de una lectura (y lo que cuesta el completo). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await lecturaPropia(id);
  if ("error" in r) return r.error;
  const { data: filas } = await getSupabaseAdmin().from("lecturas_audio").select("tipo, estado, ruta, texto, creado_en").eq("lectura_id", id);
  const vista = async (tipo: TipoAudio) => {
    const f = (filas ?? []).find((x) => x.tipo === tipo);
    if (!f) return null;
    const vencido = f.estado === "generando" && Date.now() - Date.parse(f.creado_en) > VENCE_GENERANDO;
    return { estado: vencido ? "error" : f.estado, url: f.estado === "listo" && f.ruta ? await urlFirmada(f.ruta) : null, texto: f.texto };
  };
  return Response.json(
    {
      disponible: audioConfigurado(),
      pagada: (COSTOS[r.lectura.tipo as TipoLectura] ?? 0) > 0,
      creditosCompleto: creditosAudioCompleto(r.lectura.interpretacion ?? ""),
      mensaje: await vista("mensaje"),
      completo: await vista("completo"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

/** Genera (una sola vez) el mensaje de voz o la lectura completa en audio. El completo se cobra; si falla, se devuelve. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await lecturaPropia(id);
  if ("error" in r) return r.error;
  if (!audioConfigurado()) return Response.json({ error: "no_disponible" }, { status: 503 });
  const cuerpo = (await req.json().catch(() => ({}))) as { tipo?: string };
  const tipo: TipoAudio = cuerpo.tipo === "completo" ? "completo" : "mensaje";
  const { lectura, supabase, user } = r;
  if ((COSTOS[lectura.tipo as TipoLectura] ?? 0) <= 0) return Response.json({ error: "solo_pagas" }, { status: 403 });
  const admin = getSupabaseAdmin();
  const entrada = (lectura.entrada ?? {}) as Record<string, unknown>;
  const idioma = esIdioma(entrada.idioma) ? entrada.idioma : IDIOMA_PREDETERMINADO;

  // Reserva: la fila (lectura, tipo) es única, así dos clics no generan ni cobran dos veces.
  const { data: previa } = await admin.from("lecturas_audio").select("estado, ruta, texto, creado_en").eq("lectura_id", id).eq("tipo", tipo).maybeSingle();
  if (previa?.estado === "listo" && previa.ruta) return Response.json({ estado: "listo", url: await urlFirmada(previa.ruta), texto: previa.texto });
  if (previa?.estado === "generando" && Date.now() - Date.parse(previa.creado_en) < VENCE_GENERANDO) return Response.json({ estado: "generando" }, { status: 202 });
  if (previa) {
    const { data: tomada } = await admin.from("lecturas_audio").update({ estado: "generando", creado_en: new Date().toISOString() }).eq("lectura_id", id).eq("tipo", tipo).eq("estado", previa.estado).select("lectura_id");
    if (!tomada?.length) return Response.json({ estado: "generando" }, { status: 202 });
  } else {
    const { error } = await admin.from("lecturas_audio").insert({ lectura_id: id, tipo, estado: "generando" });
    if (error) return Response.json({ estado: "generando" }, { status: 202 });
  }

  // El completo se cobra según su largo (las cuentas ilimitadas no pagan).
  let cobrado = 0;
  const referencia = `audio-${tipo}-${id}`;
  if (tipo === "completo") {
    const perfil = await getPerfil();
    const creditos = creditosAudioCompleto(lectura.interpretacion ?? "");
    if (!perfil?.ilimitado) {
      const { data: ok, error } = await supabase.rpc("consumir_creditos", { p_cantidad: creditos, p_motivo: "audio:completo", p_referencia: referencia });
      if (error || !ok) {
        await admin.from("lecturas_audio").delete().eq("lectura_id", id).eq("tipo", tipo);
        return Response.json({ error: error ? "cobro" : "sin_creditos" }, { status: error ? 500 : 402 });
      }
      cobrado = creditos;
    }
  }

  try {
    const perfil = tipo === "mensaje" ? await getPerfil() : null;
    const texto = tipo === "mensaje" ? await escribirMensaje(lectura.interpretacion ?? "", perfil?.nombre?.split(" ")[0] ?? null, idioma) : textoParaVoz(lectura.interpretacion ?? "");
    const audio = await narrar(texto);
    const ruta = `${user.id}/${id}-${tipo}.mp3`;
    const { error: subida } = await admin.storage.from(BUCKET_AUDIOS).upload(ruta, audio, { contentType: "audio/mpeg", upsert: true });
    if (subida) throw new Error(subida.message);
    await admin.from("lecturas_audio").update({ estado: "listo", ruta, texto: tipo === "mensaje" ? texto : null, caracteres: texto.length, creditos: cobrado }).eq("lectura_id", id).eq("tipo", tipo);
    return Response.json({ estado: "listo", url: await urlFirmada(ruta), texto: tipo === "mensaje" ? texto : null });
  } catch (e) {
    console.error("[audio de lectura]", e instanceof Error ? e.message : e);
    await admin.from("lecturas_audio").update({ estado: "error" }).eq("lectura_id", id).eq("tipo", tipo);
    if (cobrado > 0) await admin.rpc("devolver_creditos", { p_usuario: user.id, p_cantidad: cobrado, p_motivo: "reembolso:audio", p_referencia: referencia });
    return Response.json({ error: "generar" }, { status: 500 });
  }
}
