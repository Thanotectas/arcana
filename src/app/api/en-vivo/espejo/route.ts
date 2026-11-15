import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { claveValida } from "@/lib/en-vivo";
import type { Json } from "@/types/database";

/**
 * Escenario espejo. POST (el escenario principal): publica lo que muestra y dice ahora (lectura, frase, pausa,
 * cierre). GET ?desde=N (el espejo): si hay algo más nuevo que N lo devuelve; si no, solo el número. Las dos con
 * la clave del escenario. Sin la migración 0051 el principal sigue igual y el espejo se queda esperando.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  if (!claveValida(q.get("clave"))) return NextResponse.json({ error: "clave" }, { status: 401 });
  const desde = Number(q.get("desde") ?? -1);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.from("en_vivo_espejo").select("seq").eq("id", 1).maybeSingle();
  if (error || !data) return NextResponse.json({ seq: -1, error: error ? "migracion" : "vacio" }, { headers: { "Cache-Control": "no-store" } });
  if (data.seq <= desde) return NextResponse.json({ seq: data.seq }, { headers: { "Cache-Control": "no-store" } });
  const { data: fila } = await admin.from("en_vivo_espejo").select("seq, evento").eq("id", 1).maybeSingle();
  return NextResponse.json({ seq: fila?.seq ?? data.seq, evento: fila?.evento ?? null }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  if (!claveValida(request.nextUrl.searchParams.get("clave"))) return NextResponse.json({ error: "clave" }, { status: 401 });
  let evento: Json;
  try {
    evento = (await request.json()) as Json;
  } catch {
    return NextResponse.json({ error: "cuerpo" }, { status: 400 });
  }
  const admin = getSupabaseAdmin();
  const { data } = await admin.from("en_vivo_espejo").select("seq").eq("id", 1).maybeSingle();
  const seq = (data?.seq ?? 0) + 1;
  const { error } = await admin.from("en_vivo_espejo").upsert({ id: 1, seq, evento, actualizado_en: new Date().toISOString() });
  return NextResponse.json({ ok: !error, seq });
}
