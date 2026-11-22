import { NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { encolarMensajes, faltaFecha } from "@/lib/en-vivo";
import { claveComentario, leerChatDePantalla } from "@/lib/en-vivo-pantalla";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** La fila de Sibila y la última lectura, para leerlas desde la misma página. */
export async function GET() {
  await requerirAdmin();
  const admin = getSupabaseAdmin();
  const [{ data: fila }, { data: ultima }] = await Promise.all([
    admin.from("en_vivo_preguntas").select("id, tipo, autor, texto, estado").in("estado", ["pendiente", "leyendo"]).order("creado_en").limit(30),
    admin.from("en_vivo_preguntas").select("id, tipo, autor, texto, lectura, leida_en").eq("estado", "leida").order("leida_en", { ascending: false }).limit(1).maybeSingle(),
  ]);
  return NextResponse.json({ fila: (fila ?? []).map((f) => ({ ...f, esperaFecha: faltaFecha(f.tipo, f.texto) })), ultima: ultima ?? null }, { headers: { "Cache-Control": "no-store" } });
}

/**
 * Recibe una captura del chat de TikTok (desde /admin/en-vivo/pantalla), saca los comentarios con Claude y pone en la
 * fila los que son consultas. `vistos` son las claves de los comentarios que ya se procesaron en esta sesión.
 */
export async function POST(req: Request) {
  await requerirAdmin();
  const cuerpo = (await req.json().catch(() => null)) as { imagen?: string; vistos?: string[] } | null;
  const imagen = cuerpo?.imagen?.replace(/^data:image\/\w+;base64,/, "") ?? "";
  if (!imagen || imagen.length > 6_000_000) return NextResponse.json({ error: "Falta la imagen o es muy grande." }, { status: 400 });
  const vistos = new Set((cuerpo?.vistos ?? []).slice(-600));
  try {
    const comentarios = await leerChatDePantalla(imagen);
    const nuevos = comentarios.map((c) => ({ ...c, clave: claveComentario(c) })).filter((c) => !vistos.has(c.clave));
    const { nuevas, sumadas } = nuevos.length
      ? await encolarMensajes(
          getSupabaseAdmin(),
          nuevos.map((c) => ({ id: `pantalla:${c.clave}`, autor: c.autor, texto: c.texto })),
        )
      : { nuevas: 0, sumadas: 0 };
    return NextResponse.json({ leidos: comentarios.length, nuevos: nuevos.map(({ autor, texto, clave }) => ({ autor, texto, clave })), nuevas, sumadas }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
