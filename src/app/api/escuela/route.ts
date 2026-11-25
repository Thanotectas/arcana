import { NextResponse } from "next/server";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { avanceDe, cartaDeCierre, completarLeccion, inscribir } from "@/lib/escuela/servidor";

// El comentario de Sibila y la carta de cierre tardan unos segundos.
export const maxDuration = 120;

/** Escuela de Sibila: POST { accion: "inscribir", curso } o { accion: "leccion", curso, leccion, respuestas }. */
export async function POST(request: Request) {
  const usuario = await getUsuarioOpcional();
  if (!usuario) return NextResponse.json({ ok: false, error: "sesion" }, { status: 401 });
  const cuerpo = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const curso = cursoPorSlug(String(cuerpo.curso ?? ""));
  if (!curso) return NextResponse.json({ ok: false, error: "curso" }, { status: 404 });

  if (cuerpo.accion === "inscribir") {
    const r = await inscribir(curso, usuario).catch(() => "error");
    return NextResponse.json({ ok: r === "ok" || r === "ya_inscrito", estado: r }, { status: r === "error" ? 500 : 200 });
  }

  if (cuerpo.accion === "leccion") {
    const leccion = curso.lecciones.find((l) => l.numero === Number(cuerpo.leccion));
    if (!leccion) return NextResponse.json({ ok: false, error: "leccion" }, { status: 404 });
    const avance = await avanceDe(curso, usuario);
    const estado = avance.estados[curso.lecciones.indexOf(leccion)];
    if (!(avance.inscrito || avance.vistaPrevia) || (estado !== "abierta" && estado !== "hecha")) return NextResponse.json({ ok: false, error: "cerrada" }, { status: 403 });
    const respuestas = cuerpo.respuestas && typeof cuerpo.respuestas === "object" ? (cuerpo.respuestas as Record<string, unknown>) : {};
    const resultado = await completarLeccion(curso, leccion, usuario, respuestas);
    const ultima = leccion.numero === curso.lecciones[curso.lecciones.length - 1].numero;
    const carta = ultima && avance.inscrito ? await cartaDeCierre(curso, usuario).catch(() => null) : null;
    return NextResponse.json({ ok: true, resultado, carta });
  }

  return NextResponse.json({ ok: false, error: "accion" }, { status: 400 });
}
