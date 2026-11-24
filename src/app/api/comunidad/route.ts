import { after, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUsuarioOpcional } from "@/lib/dal";
import { fechaBogota, esFecha } from "@/lib/redes/carta-dia";
import { EMOJIS, alternarReaccion, asegurarApertura, despuesDePublicar, esIdioma, listarMensajes, publicarMensaje, reportarMensaje, type Emoji } from "@/lib/comunidad/servidor";

// Traducir los mensajes nuevos y moderar toman unos segundos.
export const maxDuration = 60;

/** Mensajes del día en el idioma de quien lee: GET /api/comunidad?fecha=AAAA-MM-DD&idioma=xx */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const hoy = fechaBogota();
  const fecha = esFecha(q.get("fecha")) && q.get("fecha")! <= hoy ? q.get("fecha")! : hoy;
  const idioma = esIdioma(q.get("idioma")) ? q.get("idioma")! : "es";
  const admin = getSupabaseAdmin();
  const usuario = await getUsuarioOpcional();
  if (fecha === hoy) await asegurarApertura(admin, fecha);
  const mensajes = await listarMensajes(admin, fecha, idioma as Parameters<typeof listarMensajes>[2], usuario?.id ?? null);
  return NextResponse.json({ fecha, mensajes }, { headers: { "Cache-Control": "no-store" } });
}

/** Publicar, reaccionar o reportar (con sesión): POST { accion, ... } */
export async function POST(request: Request) {
  const usuario = await getUsuarioOpcional();
  if (!usuario) return NextResponse.json({ ok: false, error: "sesion" }, { status: 401 });
  const cuerpo = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const admin = getSupabaseAdmin();
  const id = Number(cuerpo.mensajeId);

  if (cuerpo.accion === "publicar") {
    const idiomaPagina = esIdioma(cuerpo.idioma) ? cuerpo.idioma : "es";
    const { data: perfil } = await admin.from("perfiles").select("nombre").eq("id", usuario.id).maybeSingle();
    const r = await publicarMensaje(admin, {
      usuarioId: usuario.id,
      nombre: perfil?.nombre ?? null,
      texto: String(cuerpo.texto ?? ""),
      respuestaA: Number.isInteger(Number(cuerpo.respuestaA)) && Number(cuerpo.respuestaA) > 0 ? Number(cuerpo.respuestaA) : null,
      idiomaPagina,
      fecha: fechaBogota(),
    });
    if (!r.ok) return NextResponse.json(r, { status: 400 });
    after(() => despuesDePublicar(admin, r.mensaje));
    return NextResponse.json({ ok: true, id: r.mensaje.id, revision: r.mensaje.estado === "revision" });
  }
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "general" }, { status: 400 });
  if (cuerpo.accion === "reaccion" && EMOJIS.includes(cuerpo.emoji as Emoji)) {
    return NextResponse.json({ ok: await alternarReaccion(admin, usuario.id, id, cuerpo.emoji as Emoji) });
  }
  if (cuerpo.accion === "reportar") {
    await reportarMensaje(admin, usuario.id, id);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, error: "general" }, { status: 400 });
}
