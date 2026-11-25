import "server-only";
import { generarTexto } from "@/lib/ia";
import { esAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Json } from "@/types/database";
import type { Curso, Leccion, PreguntaTest } from "./tipos";
import { narrarEscuela } from "./voz";

export type EstadoLeccion = "hecha" | "abierta" | "manana" | "cerrada";

export interface Avance {
  inscrito: boolean;
  /** Puede verlo aunque el curso no esté abierto (cuentas administradoras). */
  vistaPrevia: boolean;
  estados: EstadoLeccion[];
  /** Cuándo se abre la próxima lección, si espera. */
  proxima: string | null;
  carta: string | null;
  cartaAudio: string | null;
  progreso: Map<number, { respuestas: Record<string, unknown>; comentario: string | null; comentarioAudio: string | null }>;
}

/** Inscripción, lecciones hechas y cuáles están abiertas (una por día: la siguiente se abre horas después). */
export async function avanceDe(curso: Curso, usuario: { id: string; email?: string | null } | null): Promise<Avance> {
  const vistaPrevia = Boolean(usuario && esAdmin(usuario.email));
  const vacio: Avance = { inscrito: false, vistaPrevia, estados: curso.lecciones.map(() => "cerrada"), proxima: null, carta: null, cartaAudio: null, progreso: new Map() };
  if (!usuario) return vacio;
  const admin = getSupabaseAdmin();
  const [{ data: insc }, { data: filas }] = await Promise.all([
    admin.from("escuela_inscripciones").select("carta, carta_audio").eq("usuario_id", usuario.id).eq("curso", curso.slug).maybeSingle(),
    admin.from("escuela_progreso").select("leccion, respuestas, comentario, comentario_audio, completada_en").eq("usuario_id", usuario.id).eq("curso", curso.slug),
  ]);
  if (!insc && !vistaPrevia) return vacio;
  const hechas = new Map((filas ?? []).map((f) => [f.leccion, f]));
  let proxima: string | null = null;
  const estados = curso.lecciones.map((l, i): EstadoLeccion => {
    if (hechas.has(l.numero)) return "hecha";
    if (i === 0 || vistaPrevia) return "abierta";
    const anterior = hechas.get(curso.lecciones[i - 1].numero);
    if (!anterior) return "cerrada";
    const abre = new Date(new Date(anterior.completada_en).getTime() + curso.horasEntreLecciones * 3600_000);
    if (abre.getTime() <= Date.now()) return "abierta";
    proxima = abre.toISOString();
    return "manana";
  });
  return {
    inscrito: Boolean(insc),
    vistaPrevia,
    estados,
    proxima,
    carta: insc?.carta ?? null,
    cartaAudio: insc?.carta_audio ?? null,
    progreso: new Map([...hechas].map(([k, f]) => [k, { respuestas: (f.respuestas ?? {}) as Record<string, unknown>, comentario: f.comentario, comentarioAudio: f.comentario_audio }])),
  };
}

/** Precio para esta persona: el de fundadores si se anotó en la lista de espera (con su cuenta o su correo). */
export async function precioPara(curso: Curso, usuario: { id: string; email?: string | null } | null) {
  if (!usuario || curso.costoFundadores === undefined) return curso.costo;
  const filtros = [`usuario_id.eq.${usuario.id}`, ...(usuario.email ? [`correo.eq.${usuario.email.toLowerCase()}`] : [])].join(",");
  const { count } = await getSupabaseAdmin().from("lista_espera").select("id", { count: "exact", head: true }).eq("curso", curso.slug).or(filtros);
  return count ? curso.costoFundadores : curso.costo;
}

/** Inscribe con cobro (o gratis en vista previa). Devuelve 'ok', 'ya_inscrito', 'sin_creditos' o 'cerrado'. */
export async function inscribir(curso: Curso, usuario: { id: string; email?: string | null }) {
  const vistaPrevia = esAdmin(usuario.email);
  if (!curso.abierto && !vistaPrevia) return "cerrado";
  const costo = vistaPrevia ? 0 : await precioPara(curso, usuario);
  const { data, error } = await getSupabaseAdmin().rpc("inscribir_curso", {
    p_usuario: usuario.id,
    p_curso: curso.slug,
    p_costo: costo,
    p_incluidos: vistaPrevia ? 0 : curso.creditosIncluidos,
  });
  if (error) throw new Error(error.message);
  return String(data);
}

export interface ResultadoTest {
  correctas: number;
  total: number;
  detalle: { indice: number; acierto: boolean | null; porque?: string }[];
  comentario: string | null;
}

/** Corrige las preguntas de opción; las abiertas las comenta Sibila (máximo 5 intentos con comentario por lección). */
export async function completarLeccion(curso: Curso, leccion: Leccion, usuario: { id: string; email?: string | null }, respuestas: Record<string, unknown>): Promise<ResultadoTest> {
  const admin = getSupabaseAdmin();
  const preguntas: PreguntaTest[] = leccion.bloques.flatMap((b) => (b.tipo === "test" ? b.preguntas : []));
  const limpias: Record<string, string | number> = {};
  const detalle: ResultadoTest["detalle"] = [];
  let correctas = 0;
  let opciones = 0;
  preguntas.forEach((p, i) => {
    const r = respuestas[String(i)];
    if (p.tipo === "opcion") {
      opciones++;
      const n = typeof r === "number" && Number.isInteger(r) ? r : -1;
      limpias[String(i)] = n;
      const acierto = n === p.correcta;
      if (acierto) correctas++;
      detalle.push({ indice: i, acierto, porque: p.porque });
    } else {
      limpias[String(i)] = typeof r === "string" ? r.trim().slice(0, 1500) : "";
      detalle.push({ indice: i, acierto: null });
    }
  });

  const { data: previa } = await admin.from("escuela_progreso").select("intentos, comentario, respuestas").eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion.numero).maybeSingle();
  const abiertas = preguntas.map((p, i) => (p.tipo === "abierta" && limpias[String(i)] ? `Pregunta: ${p.p}\nRespuesta: ${limpias[String(i)]}` : null)).filter(Boolean) as string[];
  const mismas = previa && JSON.stringify(previa.respuestas) === JSON.stringify(limpias);
  let comentario: string | null = previa?.comentario ?? null;
  if (abiertas.length && !mismas && (previa?.intentos ?? 0) < 5) {
    comentario = await generarTexto(
      `Lección ${leccion.numero} del curso «${curso.titulo}»: «${leccion.titulo}».\n\n${abiertas.join("\n\n")}`,
      "Eres Sibila acompañando a una alumna o alumno del curso de rituales de Arcana. Comenta lo que escribió en 3 o 4 frases cálidas y concretas, con lo que dice la tradición, como una maestra cercana: reconoce lo que compartió, ofrece una idea o un gesto para su ritual y anímale a seguir con la próxima lección. Nada de promesas de resultados, salud ni dinero; no inventes datos de su vida ni uses su nombre. Si lo que escribe sugiere una crisis o un riesgo para su salud, invítale con delicadeza a buscar a alguien de confianza o a un profesional.",
      { effort: "low", maxTokens: 600, nivel: "estandar", idioma: "es" },
    ).catch(() => comentario);
  }

  const ahora = new Date().toISOString();
  await admin.from("escuela_progreso").upsert(
    {
      usuario_id: usuario.id,
      curso: curso.slug,
      leccion: leccion.numero,
      respuestas: limpias as Json,
      comentario,
      intentos: (previa?.intentos ?? 0) + 1,
      actualizado_en: ahora,
      // Si Sibila escribió otro comentario, el audio anterior ya no corresponde.
      ...(comentario !== (previa?.comentario ?? null) ? { comentario_audio: null } : {}),
    },
    { onConflict: "usuario_id,curso,leccion" },
  );
  return { correctas, total: opciones, detalle, comentario };
}

/** Al terminar la última lección: la carta de cierre de ciclo, escrita por Sibila con lo que la persona compartió. */
export async function cartaDeCierre(curso: Curso, usuario: { id: string }) {
  const admin = getSupabaseAdmin();
  const { data: insc } = await admin.from("escuela_inscripciones").select("carta").eq("usuario_id", usuario.id).eq("curso", curso.slug).maybeSingle();
  if (!insc || insc.carta) return insc?.carta ?? null;
  const { data: filas } = await admin.from("escuela_progreso").select("leccion, respuestas").eq("usuario_id", usuario.id).eq("curso", curso.slug).order("leccion");
  const compartido = (filas ?? [])
    .flatMap((f) => {
      const l = curso.lecciones.find((x) => x.numero === f.leccion);
      const ps = l?.bloques.flatMap((b) => (b.tipo === "test" ? b.preguntas : [])) ?? [];
      const r = (f.respuestas ?? {}) as Record<string, unknown>;
      return ps.map((p, i) => (p.tipo === "abierta" && typeof r[String(i)] === "string" && r[String(i)] ? `Día ${f.leccion} · ${p.p}\n${r[String(i)]}` : null));
    })
    .filter(Boolean)
    .join("\n\n");
  const carta = await generarTexto(
    `Estas son las respuestas que la persona compartió durante los siete días del curso «${curso.titulo}»:\n\n${compartido || "(no escribió respuestas abiertas)"}`,
    "Eres Sibila. Escribe la carta de cierre de ciclo para esta persona que terminó el curso de rituales: 3 o 4 párrafos cálidos, en segunda persona, que recojan lo que quiso cerrar, lo que soltó, lo que agradece y lo que quiere sembrar, con imágenes de la tradición (la vela, el agua, el humo, la semilla). Termina con una bendición sencilla para el año nuevo y firma «Sibila». Nada de promesas de resultados, salud ni dinero; no inventes datos que no estén en sus respuestas ni uses su nombre.",
    { effort: "low", maxTokens: 1500, nivel: "estandar", idioma: "es" },
  );
  // La carta de cierre siempre va con la voz de Sibila (si la voz falla, queda el texto).
  const audio = await narrarEscuela(carta).catch((e) => {
    console.error("[escuela] voz de la carta:", e instanceof Error ? e.message : e);
    return null;
  });
  await admin.from("escuela_inscripciones").update({ carta, carta_audio: audio }).eq("usuario_id", usuario.id).eq("curso", curso.slug).is("carta", null);
  return carta;
}

/** El comentario de una lección en la voz de Sibila: se narra la primera vez que la persona lo pide y queda guardado. */
export async function audioComentario(curso: Curso, leccion: number, usuario: { id: string }) {
  const admin = getSupabaseAdmin();
  const { data: fila } = await admin.from("escuela_progreso").select("comentario, comentario_audio").eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion).maybeSingle();
  if (!fila?.comentario) return null;
  if (fila.comentario_audio) return fila.comentario_audio;
  const audio = await narrarEscuela(fila.comentario);
  if (audio) await admin.from("escuela_progreso").update({ comentario_audio: audio }).eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion).eq("comentario", fila.comentario);
  return audio;
}

/** La dirección del audio de la carta (después de cartaDeCierre). */
export async function audioCarta(curso: Curso, usuario: { id: string }) {
  const { data } = await getSupabaseAdmin().from("escuela_inscripciones").select("carta_audio").eq("usuario_id", usuario.id).eq("curso", curso.slug).maybeSingle();
  return data?.carta_audio ?? null;
}
