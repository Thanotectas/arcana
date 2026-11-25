import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getUsuarioOpcional } from "@/lib/dal";
import { IDIOMAS, type Idioma } from "@/lib/i18n/idiomas";
import { CURSOS, type Curso } from "@/lib/lista-espera/textos";

const CORREO = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

/** Anotarse en la lista de espera de un curso: POST { curso, correo, idioma, origen }. Repetir no duplica. */
export async function POST(request: Request) {
  const cuerpo = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const curso = String(cuerpo.curso ?? "");
  const correo = String(cuerpo.correo ?? "").trim().toLowerCase();
  if (!(CURSOS as readonly string[]).includes(curso) || !CORREO.test(correo)) return NextResponse.json({ ok: false }, { status: 400 });
  const idioma = (IDIOMAS as readonly string[]).includes(String(cuerpo.idioma)) ? (String(cuerpo.idioma) as Idioma) : "es";
  const origen = typeof cuerpo.origen === "string" ? cuerpo.origen.slice(0, 80) : null;
  const usuario = await getUsuarioOpcional();
  const { error } = await getSupabaseAdmin()
    .from("lista_espera")
    .upsert({ curso: curso as Curso, correo, idioma, origen, usuario_id: usuario?.id ?? null }, { onConflict: "curso,correo", ignoreDuplicates: true });
  if (error) {
    console.error("[lista-espera]", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
