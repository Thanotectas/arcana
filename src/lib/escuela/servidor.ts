import "server-only";
import { createHash } from "node:crypto";
import { generarTexto } from "@/lib/ia";
import { esAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { esIntencion, type Intencion } from "@/lib/velas";
import type { Json } from "@/types/database";
import { vozPaso, type Curso, type Leccion, type PreguntaTest } from "./tipos";
import { narrarEscuela } from "./voz";

export type EstadoLeccion = "hecha" | "abierta" | "manana" | "cerrada";

/** Lo que la persona contó al empezar: así cada lección le habla a ella. */
export interface PerfilAlumno {
  nombre: string;
  /** Zona horaria del navegador (America/Bogota, Europe/Istanbul…): la Luna y los días se calculan en su hora. */
  zona: string;
  intencionCierre: string;
  intencionVela: Intencion | null;
  trato: "a" | "o" | "e" | null;
}

export interface LecturaCurso {
  id: string;
  tipo: string;
  titulo: string;
  estado: string;
  creado: string;
  resumen: string | null;
  foto: string | null;
}

export interface ProgresoLeccion {
  respuestas: Record<string, unknown>;
  comentario: string | null;
  comentarioAudio: string | null;
  notas: Record<string, string>;
  hecha: boolean;
}

export interface Avance {
  inscrito: boolean;
  /** Puede verlo aunque el curso no esté abierto (cuentas administradoras). */
  vistaPrevia: boolean;
  estados: EstadoLeccion[];
  /** Cuándo se abre la próxima lección, si espera. */
  proxima: string | null;
  carta: string | null;
  cartaAudio: string | null;
  inscritoEn: string | null;
  perfil: PerfilAlumno | null;
  progreso: Map<number, ProgresoLeccion>;
}

/** Inscripción, perfil, lecciones hechas y cuáles están abiertas (una por día: la siguiente se abre horas después). */
export async function avanceDe(curso: Curso, usuario: { id: string; email?: string | null } | null): Promise<Avance> {
  const vistaPrevia = Boolean(usuario && esAdmin(usuario.email));
  const vacio: Avance = { inscrito: false, vistaPrevia, estados: curso.lecciones.map(() => "cerrada"), proxima: null, carta: null, cartaAudio: null, inscritoEn: null, perfil: null, progreso: new Map() };
  if (!usuario) return vacio;
  const admin = getSupabaseAdmin();
  const [{ data: insc }, { data: filas }] = await Promise.all([
    admin.from("escuela_inscripciones").select("carta, carta_audio, creado_en, nombre, zona, intencion_cierre, intencion_vela, trato").eq("usuario_id", usuario.id).eq("curso", curso.slug).maybeSingle(),
    admin.from("escuela_progreso").select("leccion, respuestas, comentario, comentario_audio, notas, completada_en").eq("usuario_id", usuario.id).eq("curso", curso.slug),
  ]);
  if (!insc && !vistaPrevia) return vacio;
  const filasPorLeccion = new Map((filas ?? []).map((f) => [f.leccion, f]));
  const completada = (n: number) => filasPorLeccion.get(n)?.completada_en ?? null;
  let proxima: string | null = null;
  const estados = curso.lecciones.map((l, i): EstadoLeccion => {
    if (completada(l.numero)) return "hecha";
    if (i === 0 || vistaPrevia) return "abierta";
    const anterior = completada(curso.lecciones[i - 1].numero);
    if (!anterior) return "cerrada";
    const abre = new Date(new Date(anterior).getTime() + curso.horasEntreLecciones * 3600_000);
    if (abre.getTime() <= Date.now()) return "abierta";
    proxima = abre.toISOString();
    return "manana";
  });
  const perfil: PerfilAlumno | null = insc?.nombre
    ? { nombre: insc.nombre, zona: insc.zona || "America/Bogota", intencionCierre: insc.intencion_cierre ?? "", intencionVela: esIntencion(insc.intencion_vela) ? insc.intencion_vela : null, trato: insc.trato === "a" || insc.trato === "o" || insc.trato === "e" ? insc.trato : null }
    : null;
  return {
    inscrito: Boolean(insc),
    vistaPrevia,
    estados,
    proxima,
    carta: insc?.carta ?? null,
    cartaAudio: insc?.carta_audio ?? null,
    inscritoEn: insc?.creado_en ?? null,
    perfil,
    progreso: new Map(
      [...filasPorLeccion].map(([k, f]) => [
        k,
        {
          respuestas: (f.respuestas ?? {}) as Record<string, unknown>,
          comentario: f.comentario,
          comentarioAudio: f.comentario_audio,
          notas: (f.notas ?? {}) as Record<string, string>,
          hecha: Boolean(f.completada_en),
        },
      ]),
    ),
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

/** Guarda lo que la persona cuenta al empezar (y lo puede cambiar después). Solo con inscripción. */
export async function guardarPerfil(curso: Curso, usuario: { id: string }, datos: Record<string, unknown>) {
  const nombre = String(datos.nombre ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
  const intencionCierre = String(datos.intencionCierre ?? "").trim().slice(0, 600);
  const zona = String(datos.zona ?? "").trim();
  const zonaValida = /^[A-Za-z_]+(\/[A-Za-z0-9_+-]+){0,2}$/.test(zona) && zona.length <= 50 ? zona : "America/Bogota";
  const intencionVela = esIntencion(datos.intencionVela) ? datos.intencionVela : null;
  const trato = datos.trato === "a" || datos.trato === "o" || datos.trato === "e" ? datos.trato : null;
  if (!nombre) return false;
  const { data } = await getSupabaseAdmin()
    .from("escuela_inscripciones")
    .update({ nombre, zona: zonaValida, intencion_cierre: intencionCierre || null, intencion_vela: intencionVela, trato })
    .eq("usuario_id", usuario.id)
    .eq("curso", curso.slug)
    .select("curso");
  return Boolean(data?.length);
}

/** Lo que la persona escribe en el ritual guiado (queda en su grimorio). No marca la lección como hecha. */
export async function guardarNota(curso: Curso, leccion: Leccion, usuario: { id: string }, paso: number, texto: string) {
  const admin = getSupabaseAdmin();
  const { data: fila } = await admin.from("escuela_progreso").select("notas").eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion.numero).maybeSingle();
  const notas = { ...((fila?.notas ?? {}) as Record<string, string>), [String(paso)]: texto.trim().slice(0, 3000) };
  if (fila) await admin.from("escuela_progreso").update({ notas: notas as Json, actualizado_en: new Date().toISOString() }).eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion.numero);
  else await admin.from("escuela_progreso").insert({ usuario_id: usuario.id, curso: curso.slug, leccion: leccion.numero, notas: notas as Json, intentos: 0 });
}

/** Un texto del curso en la voz de Sibila, el mismo audio para todas las personas (se narra la primera vez). */
async function audioCompartido(curso: Curso, leccion: Leccion, parte: string, texto: string) {
  const huella = createHash("sha1").update(texto).digest("hex").slice(0, 12);
  const clave = `${curso.slug}:${leccion.numero}:${parte}:${huella}`;
  const admin = getSupabaseAdmin();
  const { data: hecho } = await admin.from("escuela_audios").select("url").eq("clave", clave).maybeSingle();
  if (hecho) return hecho.url;
  const url = await narrarEscuela(texto);
  if (url) await admin.from("escuela_audios").upsert({ clave, url }, { onConflict: "clave", ignoreDuplicates: true });
  return url;
}

/** La voz de Sibila en el ritual guiado: la apertura (-1), cada paso (0…) o el cierre (-2). */
export async function audioPaso(curso: Curso, leccion: Leccion, paso: number) {
  const ritual = leccion.bloques.find((b) => b.tipo === "ritual");
  if (!ritual || ritual.tipo !== "ritual") return null;
  const texto = paso === -1 ? ritual.apertura : paso === -2 ? ritual.cierre : ritual.pasos[paso] !== undefined ? vozPaso(ritual.pasos[paso]) : undefined;
  if (!texto) return null;
  return audioCompartido(curso, leccion, paso === -1 ? "apertura" : paso === -2 ? "cierre" : String(paso), texto);
}

/** Un texto de la lección leído por Sibila («Escuchar la lección»). */
export async function audioTexto(curso: Curso, leccion: Leccion, bloque: number) {
  const b = leccion.bloques[bloque];
  if (!b || b.tipo !== "texto") return null;
  return audioCompartido(curso, leccion, `texto${bloque}`, [b.titulo, ...b.parrafos].filter(Boolean).join("… "));
}

/** Las lecturas que la persona hizo desde que se inscribió (las entregas del curso), la más reciente de cada tipo. */
export async function lecturasDelCurso(usuarioId: string, desde: string | null, tipos: string[]): Promise<Map<string, LecturaCurso>> {
  const salida = new Map<string, LecturaCurso>();
  if (!tipos.length) return salida;
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("lecturas")
    .select("id, tipo, titulo, estado, creado_en, interpretacion, entrada")
    .eq("usuario_id", usuarioId)
    .in("tipo", tipos)
    .gte("creado_en", desde ?? new Date(Date.now() - 30 * 86400_000).toISOString())
    .order("creado_en", { ascending: false });
  for (const l of data ?? []) {
    if (salida.has(l.tipo)) continue;
    const entrada = (l.entrada ?? {}) as Record<string, unknown>;
    let foto: string | null = null;
    if (typeof entrada.foto === "string") {
      const { data: firmada } = await admin.storage.from("palmas").createSignedUrl(entrada.foto, 3600);
      foto = firmada?.signedUrl ?? null;
    }
    const limpia = (l.interpretacion ?? "").replace(/[#*_>`]/g, "").replace(/\s+/g, " ").trim();
    salida.set(l.tipo, { id: l.id, tipo: l.tipo, titulo: l.titulo, estado: l.estado, creado: l.creado_en, resumen: limpia ? limpia.slice(0, 420) + (limpia.length > 420 ? "…" : "") : null, foto });
  }
  return salida;
}

export interface ResultadoTest {
  correctas: number;
  total: number;
  detalle: { indice: number; acierto: boolean | null; porque?: string }[];
  comentario: string | null;
}

/** Quién es la persona para Sibila (nombre e intención), si lo contó. */
function contexto(perfil: PerfilAlumno | null) {
  if (!perfil) return "";
  return `\nLa persona se llama ${perfil.nombre}.${perfil.intencionCierre ? ` Al empezar el curso dijo que quiere cerrar: «${perfil.intencionCierre}».` : ""}`;
}

/** Corrige las preguntas de opción; las abiertas las comenta Sibila (máximo 5 intentos con comentario por lección). */
export async function completarLeccion(curso: Curso, leccion: Leccion, usuario: { id: string; email?: string | null }, respuestas: Record<string, unknown>, perfil: PerfilAlumno | null): Promise<ResultadoTest> {
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

  const { data: previa } = await admin.from("escuela_progreso").select("intentos, comentario, respuestas, notas, completada_en").eq("usuario_id", usuario.id).eq("curso", curso.slug).eq("leccion", leccion.numero).maybeSingle();
  const abiertas = preguntas.map((p, i) => (p.tipo === "abierta" && limpias[String(i)] ? `Pregunta: ${p.p}\nRespuesta: ${limpias[String(i)]}` : null)).filter(Boolean) as string[];
  const notas = Object.values((previa?.notas ?? {}) as Record<string, string>).filter(Boolean);
  const mismas = previa?.completada_en && JSON.stringify(previa.respuestas) === JSON.stringify(limpias);
  let comentario: string | null = previa?.comentario ?? null;
  if (abiertas.length && !mismas && (previa?.intentos ?? 0) < 5) {
    comentario = await generarTexto(
      `Lección ${leccion.numero} del curso «${curso.titulo}»: «${leccion.titulo}».${contexto(perfil)}\n\n${notas.length ? `Lo que escribió durante el ritual:\n${notas.join("\n")}\n\n` : ""}${abiertas.join("\n\n")}`,
      "Eres Sibila acompañando a una alumna o alumno del curso de rituales de Arcana. Comenta lo que escribió en 3 o 4 frases cálidas y concretas, con lo que dice la tradición, como una maestra cercana: reconoce lo que compartió, ofrece una idea o un gesto para su ritual y anímale a seguir con la próxima lección. Si sabes su nombre, puedes llamarle por su nombre una vez. Escribe para ser leído en voz alta: sin listas, sin títulos, sin emojis. Nada de promesas de resultados, salud ni dinero; no inventes datos de su vida. Si lo que escribe sugiere una crisis o un riesgo para su salud, invítale con delicadeza a buscar a alguien de confianza o a un profesional.",
      { effort: "low", maxTokens: 700, nivel: "estandar", idioma: "es" },
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
      completada_en: previa?.completada_en ?? ahora,
      actualizado_en: ahora,
      // Si Sibila escribió otro comentario, el audio anterior ya no corresponde.
      ...(comentario !== (previa?.comentario ?? null) ? { comentario_audio: null } : {}),
    },
    { onConflict: "usuario_id,curso,leccion" },
  );
  return { correctas, total: opciones, detalle, comentario };
}

/** Al terminar la última lección: la carta de cierre de ciclo, escrita por Sibila con lo que la persona compartió. */
export async function cartaDeCierre(curso: Curso, usuario: { id: string }, perfil: PerfilAlumno | null) {
  const admin = getSupabaseAdmin();
  const { data: insc } = await admin.from("escuela_inscripciones").select("carta").eq("usuario_id", usuario.id).eq("curso", curso.slug).maybeSingle();
  if (!insc || insc.carta) return insc?.carta ?? null;
  const { data: filas } = await admin.from("escuela_progreso").select("leccion, respuestas, notas").eq("usuario_id", usuario.id).eq("curso", curso.slug).order("leccion");
  const compartido = (filas ?? [])
    .flatMap((f) => {
      const l = curso.lecciones.find((x) => x.numero === f.leccion);
      const ps = l?.bloques.flatMap((b) => (b.tipo === "test" ? b.preguntas : [])) ?? [];
      const r = (f.respuestas ?? {}) as Record<string, unknown>;
      const notas = Object.values((f.notas ?? {}) as Record<string, string>).filter(Boolean).map((n) => `Día ${f.leccion} · escribió en su ritual:\n${n}`);
      return [...notas, ...ps.map((p, i) => (p.tipo === "abierta" && typeof r[String(i)] === "string" && r[String(i)] ? `Día ${f.leccion} · ${p.p}\n${r[String(i)]}` : null))];
    })
    .filter(Boolean)
    .join("\n\n");
  const carta = await generarTexto(
    `Esto es lo que la persona compartió durante los siete días del curso «${curso.titulo}»:${contexto(perfil)}\n\n${compartido || "(no escribió respuestas abiertas)"}`,
    "Eres Sibila. Escribe la carta de cierre de ciclo para esta persona que terminó el curso de rituales: 3 o 4 párrafos cálidos, en segunda persona, que recojan lo que quiso cerrar, lo que soltó, lo que agradece y lo que quiere sembrar, con imágenes de la tradición (la vela, el agua, el humo, la semilla). Si sabes su nombre, empieza la carta con él. Con estos siete días recibió las siete llaves y llega al grado de Maestra o Maestro de rituales del Primer Círculo (o «Maestría», si no usa género): reconócelo con solemnidad y ternura, como una iniciación simbólica, sin prometer poderes. Escribe para ser leída en voz alta: sin títulos, listas ni emojis. Termina con una bendición sencilla para el año nuevo y firma «Sibila». Nada de promesas de resultados, salud ni dinero; no inventes datos que no estén en lo que compartió.",
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
