import { NextResponse } from "next/server";
import { getUsuarioOpcional } from "@/lib/dal";
import { cursoPorSlug } from "@/lib/escuela/cursos";
import { audioCarta, audioComentario, audioPaso, audioTexto, avanceDe, cartaDeCierre, completarLeccion, guardarNota, guardarPerfil, inscribir, reembolsar } from "@/lib/escuela/servidor";

// El comentario de Sibila, su voz y la carta de cierre tardan unos segundos.
export const maxDuration = 120;

/**
 * Escuela de Sibila: POST { accion, curso, ... }
 * - inscribir
 * - garantia: devuelve los créditos (primeros días, antes de la segunda lección, una sola vez)
 * - perfil { nombre, zona, intencionCierre, intencionVela }
 * - leccion { leccion, respuestas }: corrige, Sibila comenta y la lección queda hecha
 * - nota { leccion, paso, texto }: lo que escribe en el ritual guiado
 * - paso { leccion, paso }: la voz de Sibila para un paso del ritual
 * - escuchar { leccion }: el comentario de la lección en la voz de Sibila
 */
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

  if (cuerpo.accion === "garantia") {
    const r = await reembolsar(curso, usuario).catch(() => null);
    return NextResponse.json(r ?? { ok: false, motivo: "error" }, { status: r ? 200 : 500 });
  }

  const avance = await avanceDe(curso, usuario);
  if (!(avance.inscrito || avance.vistaPrevia)) return NextResponse.json({ ok: false, error: "inscripcion" }, { status: 403 });

  if (cuerpo.accion === "perfil") {
    const ok = await guardarPerfil(curso, usuario, cuerpo);
    return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
  }

  const leccion = curso.lecciones.find((l) => l.numero === Number(cuerpo.leccion));
  if (!leccion) return NextResponse.json({ ok: false, error: "leccion" }, { status: 404 });
  const estado = avance.estados[curso.lecciones.indexOf(leccion)];
  if (estado !== "abierta" && estado !== "hecha") return NextResponse.json({ ok: false, error: "cerrada" }, { status: 403 });

  if (cuerpo.accion === "leccion") {
    const respuestas = cuerpo.respuestas && typeof cuerpo.respuestas === "object" ? (cuerpo.respuestas as Record<string, unknown>) : {};
    const resultado = await completarLeccion(curso, leccion, usuario, respuestas, avance.perfil);
    const ultima = leccion.numero === curso.lecciones[curso.lecciones.length - 1].numero;
    const carta = ultima && avance.inscrito ? await cartaDeCierre(curso, usuario, avance.perfil).catch(() => null) : null;
    const cartaAudio = carta ? await audioCarta(curso, usuario) : null;
    return NextResponse.json({ ok: true, resultado, carta, cartaAudio });
  }

  if (cuerpo.accion === "nota") {
    const paso = Number(cuerpo.paso);
    if (!Number.isInteger(paso) || paso < 0 || paso > 30) return NextResponse.json({ ok: false }, { status: 400 });
    await guardarNota(curso, leccion, usuario, paso, String(cuerpo.texto ?? ""));
    return NextResponse.json({ ok: true });
  }

  if (cuerpo.accion === "paso") {
    const audio = await audioPaso(curso, leccion, Number(cuerpo.paso)).catch((e) => {
      console.error("[escuela] voz del paso:", e instanceof Error ? e.message : e);
      return null;
    });
    return NextResponse.json({ ok: Boolean(audio), audio });
  }

  if (cuerpo.accion === "texto") {
    const audio = await audioTexto(curso, leccion, Number(cuerpo.bloque)).catch((e) => {
      console.error("[escuela] voz de la lección:", e instanceof Error ? e.message : e);
      return null;
    });
    return NextResponse.json({ ok: Boolean(audio), audio });
  }

  // «Escuchar a Sibila»: el comentario de una lección en su voz (se narra una sola vez).
  if (cuerpo.accion === "escuchar") {
    const audio = await audioComentario(curso, leccion.numero, usuario).catch((e) => {
      console.error("[escuela] voz del comentario:", e instanceof Error ? e.message : e);
      return null;
    });
    return NextResponse.json({ ok: Boolean(audio), audio });
  }

  return NextResponse.json({ ok: false, error: "accion" }, { status: 400 });
}
