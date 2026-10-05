"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { getSupabaseAdmin } from "../supabase/admin";
import { COSTOS, type TipoLectura } from "../creditos";
import { TIRADAS, cartasDesdeAbanico, type TipoTirada } from "../tarot/tiradas";
import { calcularCarta, type DatosNacimiento } from "../astro/carta";
import { calcularPerfil } from "../numerologia";
import { signoPorFecha, signoPorId, compatibilidadSignos } from "../zodiaco";
import { getPerfil } from "../dal";
import { getIdioma } from "../i18n/servidor";
import { MAZOS, esMazo, type IdMazo } from "../tarot/mazos";
import type { EntradaQuiromancia, Mano } from "../quiromancia";
import { resolverHexagramas, hexagramaPorNumero, type ValorLinea } from "../iching";
import { calcularChino, nombrePilar, FICHA } from "../chino";
import { esSistema, fuenteDe, type Sistema } from "../cruce";
import { SUENO_MAX, SUENO_MIN, esEmocion, tituloDeSueno, type EntradaSueno, type ResultadoSueno } from "../suenos";
import { extractoPlano } from "./memoria";
import { calcularSinastria } from "../astro/sinastria";
import type { EntradaChocolate } from "../chocolate";
import { esColor, esIntencion, esSenal, type EntradaVelas, type Senal } from "../velas";
import { calcularAura, esRespuestasValidas, PREGUNTAS } from "../aura";
import type { EntradaTabaco } from "../tabaco";
import type { Json } from "@/types/database";
import { tipoImagenReal, zonaHorariaValida } from "../seguridad";

export interface EstadoAccion {
  error?: string;
}

async function usuarioActual() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return { supabase, user };
}

/**
 * Cobra la lectura y la guarda en estado 'pendiente'. La interpretación la
 * escribe después /api/lecturas/[id]/generar mientras la persona la ve.
 * Solo el servidor crea lecturas (la tabla no admite inserts de usuarios).
 */
async function crearLectura(datos: { tipo: TipoLectura; titulo: string; entrada: unknown; resultado: unknown }) {
  const { supabase, user } = await usuarioActual();
  const perfil = await getPerfil();
  const idioma = await getIdioma();
  const entrada = { ...(datos.entrada as Record<string, unknown>), idioma };
  // Las cuentas ilimitadas pasan por el cobro (queda registro) sin pagar nada.
  const costo = perfil?.ilimitado ? 0 : COSTOS[datos.tipo];
  const costoTarifa = COSTOS[datos.tipo];
  const referencia = `${datos.tipo}-${Date.now()}`;

  if (costoTarifa > 0) {
    const { data: ok, error } = await supabase.rpc("consumir_creditos", {
      p_cantidad: costoTarifa,
      p_motivo: `lectura:${datos.tipo}`,
      p_referencia: referencia,
    });
    if (error) throw new Error("No se pudo procesar el cobro. Intenta de nuevo.");
    if (!ok) throw new Error("SIN_CREDITOS");
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lecturas")
    .insert({
      usuario_id: user.id,
      tipo: datos.tipo,
      titulo: datos.titulo,
      entrada: entrada as Json,
      resultado: datos.resultado as Json,
      creditos_usados: costo,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (costo > 0) {
      await admin.rpc("devolver_creditos", { p_usuario: user.id, p_cantidad: costo, p_motivo: `reembolso:${datos.tipo}`, p_referencia: referencia });
    }
    throw new Error("No se pudo guardar la lectura. No se cobró nada.");
  }

  revalidatePath("/inicio");
  revalidatePath("/lecturas");
  return data.id as string;
}

function manejarError(e: unknown): EstadoAccion {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado.";
  if (msg === "SIN_CREDITOS") {
    return { error: "SIN_CREDITOS" };
  }
  console.error("[lecturas]", e);
  return { error: msg };
}

// ---------------------------------------------------------------------------
// Tarot: la persona elige posiciones del abanico; el servidor decide las cartas.
// ---------------------------------------------------------------------------
export async function accionTarot(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const tipo = String(formData.get("tipo") ?? "") as TipoTirada;
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  const mazoId = String(formData.get("mazo") ?? "rider");
  if (!TIRADAS[tipo]) return { error: "Tirada no válida." };
  if (!esMazo(mazoId)) return { error: "Mazo no válido." };
  const mazo: IdMazo = mazoId;

  let posiciones: number[];
  try {
    posiciones = JSON.parse(String(formData.get("posiciones") ?? "[]"));
    if (!Array.isArray(posiciones)) throw new Error();
  } catch {
    return { error: "Elige tus cartas antes de continuar." };
  }

  let id: string;
  try {
    if (tipo === "tarot_carta") {
      // Reserva atómica en la base: una carta gratis por persona y día local.
      const { supabase } = await usuarioActual();
      const { data: reservada, error } = await supabase.rpc("reservar_carta_dia");
      if (error) throw new Error("No se pudo reservar tu carta del día. Intenta de nuevo.");
      if (!reservada) return { error: "Ya sacaste tu carta gratuita de hoy. Vuelve mañana o prueba una tirada completa." };
    }
    const cartas = cartasDesdeAbanico(tipo, posiciones, mazo);
    id = await crearLectura({
      tipo,
      titulo: pregunta ? `${TIRADAS[tipo].nombre}: ${pregunta}` : `${TIRADAS[tipo].nombre} · ${MAZOS[mazo].nombre}`,
      entrada: { pregunta, mazo },
      resultado: { cartas },
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Carta astral
// ---------------------------------------------------------------------------
/**
 * Vista previa gratuita de la carta astral: valida los datos, los guarda en el
 * perfil y lleva a /carta-astral?vista=1&… donde se calcula sin cobrar. La
 * lectura escrita por Sibila se desbloquea después con accionCartaAstral.
 */
export async function accionVistaPreviaAstral(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const d = leerNacimiento(formData, "");
  const error = errorNacimiento(d, "astral");
  if (error) return { error };
  await guardarNacimiento(d);
  const q = new URLSearchParams({
    vista: "1",
    nombre: d.nombre,
    fecha: d.fecha,
    hora: d.horaDesconocida ? "" : d.hora,
    lugar: d.lugar,
    lat: String(d.latitud),
    lon: String(d.longitud),
    zona: d.zonaHoraria,
  });
  redirect(`/carta-astral?${q.toString()}#vista`);
}

export async function accionCartaAstral(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const datos: DatosNacimiento = {
    nombre: String(formData.get("nombre") ?? "").trim().slice(0, 80),
    fecha: String(formData.get("fecha") ?? ""),
    hora: String(formData.get("hora") ?? "12:00") || "12:00",
    horaDesconocida: formData.get("hora_desconocida") === "on",
    lugar: String(formData.get("lugar") ?? "").trim().slice(0, 120),
    latitud: Number(formData.get("latitud")),
    longitud: Number(formData.get("longitud")),
    zonaHoraria: String(formData.get("zona_horaria") ?? ""),
  };

  if (!datos.nombre) return { error: "astral.nombre" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) return { error: "astral.fecha" };
  if (!datos.horaDesconocida && !/^\d{2}:\d{2}$/.test(datos.hora)) return { error: "astral.hora" };
  if (!datos.lugar || Number.isNaN(datos.latitud) || Number.isNaN(datos.longitud) || !zonaHorariaValida(datos.zonaHoraria)) {
    return { error: "astral.lugar" };
  }
  if (Math.abs(datos.latitud) > 90 || Math.abs(datos.longitud) > 180) return { error: "astral.lugar" };
  const anio = Number(datos.fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return { error: "astral.anio" };

  let id: string;
  try {
    const carta = calcularCarta(datos);
    id = await crearLectura({
      tipo: "carta_astral",
      titulo: `Carta astral de ${datos.nombre}`,
      entrada: datos,
      resultado: {
        fechaUtc: carta.fechaUtc,
        planetas: carta.planetas.map((p) => ({
          cuerpo: p.cuerpo,
          longitud: p.longitud,
          retrogrado: p.retrogrado,
          casa: p.casa,
          signo: p.signo.id,
        })),
        casas: carta.casas,
        aspectos: carta.aspectos,
        elementos: carta.elementos,
        modalidades: carta.modalidades,
      },
    });
    await guardarNacimiento(datos);
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

/** Memoria: el perfil recuerda los datos de nacimiento para el cielo diario. */
async function guardarNacimiento(datos: DatosNacimiento) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { error } = await supabase
    .from("perfiles")
    .update({
      fecha_nacimiento: datos.fecha,
      hora_nacimiento: datos.horaDesconocida ? null : datos.hora,
      lugar_nacimiento: datos.lugar,
      latitud: datos.latitud,
      longitud: datos.longitud,
      zona_horaria: datos.zonaHoraria,
    })
    .eq("id", user.id);
  if (error) console.error("[perfil] no se guardaron los datos de nacimiento", error.message);
}

// ---------------------------------------------------------------------------
// Numerología
// ---------------------------------------------------------------------------
export async function accionNumerologia(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 120);
  const fecha = String(formData.get("fecha") ?? "");
  if (nombre.length < 3) return { error: "numerologia.nombre" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "numerologia.fecha" };

  let id: string;
  try {
    id = await crearLectura({
      tipo: "numerologia",
      titulo: `Perfil numerológico de ${nombre}`,
      entrada: { nombre, fecha },
      resultado: calcularPerfil(nombre, new Date(fecha + "T12:00:00Z")),
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Calendario chino
// ---------------------------------------------------------------------------
export async function accionChino(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "").trim();
  const horaDesconocida = formData.get("hora_desconocida") === "on" || !hora;
  if (!nombre) return { error: "chino.nombre" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "chino.fecha" };
  const anio = Number(fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return { error: "chino.fecha" };
  if (!horaDesconocida && !/^\d{2}:\d{2}$/.test(hora)) return { error: "chino.hora" };

  let id: string;
  try {
    const r = calcularChino(fecha, horaDesconocida ? null : hora);
    id = await crearLectura({
      tipo: "chino",
      titulo: `${nombre}: ${nombrePilar(r.pilar)}${r.animalHora ? ` · ${FICHA[r.animalHora].nombre} de hora` : ""}`,
      entrada: { nombre, fecha, hora: horaDesconocida ? null : hora },
      resultado: r,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Sinastría: dos cartas completas (premium)
// ---------------------------------------------------------------------------
function leerNacimiento(formData: FormData, sufijo: string): DatosNacimiento {
  const v = (campo: string) => formData.get(`${campo}${sufijo}`);
  return {
    nombre: String(v("nombre") ?? "").trim().slice(0, 80),
    fecha: String(v("fecha") ?? ""),
    hora: String(v("hora") ?? "12:00") || "12:00",
    horaDesconocida: v("hora_desconocida") === "on",
    lugar: String(v("lugar") ?? "").trim().slice(0, 120),
    latitud: Number(v("latitud")),
    longitud: Number(v("longitud")),
    zonaHoraria: String(v("zona_horaria") ?? ""),
  };
}

function errorNacimiento(d: DatosNacimiento, grupo: string): string | null {
  if (!d.nombre) return `${grupo}.nombre`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha)) return `${grupo}.fecha`;
  if (!d.horaDesconocida && !/^\d{2}:\d{2}$/.test(d.hora)) return `${grupo}.hora`;
  if (!d.lugar || Number.isNaN(d.latitud) || Number.isNaN(d.longitud) || !zonaHorariaValida(d.zonaHoraria)) return `${grupo}.lugar`;
  if (Math.abs(d.latitud) > 90 || Math.abs(d.longitud) > 180) return `${grupo}.lugar`;
  const anio = Number(d.fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return `${grupo}.anio`;
  return null;
}

export async function accionSinastria(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const a = leerNacimiento(formData, "");
  const b = leerNacimiento(formData, "_b");
  const errorA = errorNacimiento(a, "astral");
  if (errorA) return { error: errorA };
  const errorB = errorNacimiento(b, "sinastria");
  if (errorB) return { error: errorB };

  let id: string;
  try {
    const r = calcularSinastria(a, b);
    id = await crearLectura({
      tipo: "sinastria",
      titulo: `${a.nombre} y ${b.nombre}: ${r.puntaje}% de afinidad`,
      entrada: { a, b },
      resultado: r,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Sueños: la persona cuenta su sueño; se guardan los anteriores como diario
// ---------------------------------------------------------------------------
export async function accionSuenos(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const texto = String(formData.get("texto") ?? "").replace(/\r/g, "").trim().slice(0, SUENO_MAX);
  const emocionCruda = String(formData.get("emocion") ?? "");
  const recurrente = formData.get("recurrente") === "on";
  const fecha = String(formData.get("fecha") ?? "").trim();
  if (texto.length < SUENO_MIN) return { error: "suenos.texto" };
  if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "suenos.fecha" };

  const { supabase, user } = await usuarioActual();
  // Diario: los últimos sueños ya interpretados, resumidos, para dar continuidad.
  const { data: anteriores } = await supabase
    .from("lecturas")
    .select("titulo, interpretacion, entrada, creado_en")
    .eq("usuario_id", user.id)
    .eq("tipo", "suenos")
    .eq("estado", "lista")
    .order("creado_en", { ascending: false })
    .limit(5);
  const previos = (anteriores ?? []).map((l) => {
    const e = (l.entrada ?? {}) as Partial<EntradaSueno>;
    return { fecha: e.fecha || l.creado_en.slice(0, 10), titulo: l.titulo, extracto: extractoPlano(l.interpretacion ?? "", 220) };
  });

  const entrada: EntradaSueno = { texto, emocion: esEmocion(emocionCruda) ? emocionCruda : null, recurrente, fecha: fecha || null };
  const resultado: ResultadoSueno = { previos };
  let id: string;
  try {
    id = await crearLectura({ tipo: "suenos", titulo: tituloDeSueno(texto), entrada, resultado });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Lectura cruzada: dos sistemas sobre la misma persona (premium)
// ---------------------------------------------------------------------------
export async function accionCruce(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const elegidos = formData.getAll("sistema").map(String).filter(esSistema);
  const sistemas = Array.from(new Set(elegidos)) as Sistema[];
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (sistemas.length !== 2) return { error: "cruce.dos" };

  const { supabase } = await usuarioActual();
  const perfil = await getPerfil();
  if (!perfil) redirect("/entrar");

  let id: string;
  try {
    const fuentes = await Promise.all(sistemas.map((s) => fuenteDe(supabase, perfil, s)));
    if (fuentes.some((f) => !f)) return { error: "cruce.faltaFuente" };
    const listas = fuentes.filter((f): f is NonNullable<typeof f> => Boolean(f));
    id = await crearLectura({
      tipo: "cruce",
      titulo: `${NOMBRE_SISTEMA[sistemas[0]]} × ${NOMBRE_SISTEMA[sistemas[1]]}${pregunta ? `: ${pregunta}` : ""}`,
      entrada: { sistemas, pregunta },
      resultado: { fuentes: listas },
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

const NOMBRE_SISTEMA: Record<Sistema, string> = {
  carta_astral: "Carta astral",
  numerologia: "Numerología",
  chino: "Calendario chino",
  tarot: "Tarot",
  iching: "I Ching",
  quiromancia: "Mano",
  suenos: "Sueño",
  chocolate: "Chocolate",
  sinastria: "Sinastría",
};

// ---------------------------------------------------------------------------
// Compatibilidad
// ---------------------------------------------------------------------------
export async function accionCompatibilidad(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const nombreA = String(formData.get("nombre_a") ?? "").trim().slice(0, 60) || "Persona A";
  const nombreB = String(formData.get("nombre_b") ?? "").trim().slice(0, 60) || "Persona B";
  const fechaA = String(formData.get("fecha_a") ?? "");
  const fechaB = String(formData.get("fecha_b") ?? "");
  const signoIdA = String(formData.get("signo_a") ?? "");
  const signoIdB = String(formData.get("signo_b") ?? "");

  const resolver = (fecha: string, signoId: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      const [, m, d] = fecha.split("-").map(Number);
      return signoPorFecha(m, d);
    }
    return signoPorId(signoId);
  };
  const a = resolver(fechaA, signoIdA);
  const b = resolver(fechaB, signoIdB);
  if (!a || !b) return { error: "compatibilidad.faltan" };

  let id: string;
  try {
    const puntaje = compatibilidadSignos(a, b);
    id = await crearLectura({
      tipo: "compatibilidad",
      titulo: `${nombreA} (${a.nombre}) y ${nombreB} (${b.nombre})`,
      entrada: { nombreA, nombreB, signoA: a.id, signoB: b.id },
      resultado: { puntaje, signoA: a.id, signoB: b.id },
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Quiromancia: la foto se guarda en el bucket privado y la lectura se cobra.
// ---------------------------------------------------------------------------
const TAMANO_MAX_FOTO = 4 * 1024 * 1024;
const TIPOS_FOTO = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function accionQuiromancia(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const { user } = await usuarioActual();
  const foto = formData.get("foto");
  const mano = (String(formData.get("mano") ?? "derecha") === "izquierda" ? "izquierda" : "derecha") as Mano;
  const dominante = (String(formData.get("dominante") ?? "derecha") === "izquierda" ? "izquierda" : "derecha") as Mano;
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);

  if (!(foto instanceof File) || foto.size === 0) return { error: "FOTO_FALTA" };
  if (!TIPOS_FOTO.has(foto.type)) return { error: "FOTO_FORMATO" };
  if (foto.size > TAMANO_MAX_FOTO) return { error: "FOTO_TAMANO" };
  // El tipo declarado lo controla el navegador: comprobamos los bytes reales.
  const tipoReal = tipoImagenReal(new Uint8Array(await foto.slice(0, 16).arrayBuffer()));
  if (!tipoReal || tipoReal !== foto.type) return { error: "FOTO_FORMATO" };

  const admin = getSupabaseAdmin();
  const extension = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: errorSubida } = await admin.storage
    .from("palmas")
    .upload(ruta, foto, { contentType: foto.type, upsert: false });
  if (errorSubida) {
    console.error("[quiromancia] subida fallida", errorSubida);
    return { error: "FOTO_SUBIR" };
  }

  let id: string;
  try {
    const entrada: EntradaQuiromancia = { foto: ruta, mano, dominante, pregunta };
    id = await crearLectura({
      tipo: "quiromancia",
      titulo: pregunta ? `Lectura de la mano: ${pregunta}` : "Lectura de la mano",
      entrada,
      resultado: {},
    });
  } catch (e) {
    await admin.storage.from("palmas").remove([ruta]);
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Lectura del chocolate: foto del interior de la taza (mismo bucket que las palmas)
// ---------------------------------------------------------------------------
export async function accionChocolate(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const { user } = await usuarioActual();
  const foto = formData.get("foto");
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);

  if (!(foto instanceof File) || foto.size === 0) return { error: "chocolate.foto" };
  if (!TIPOS_FOTO.has(foto.type)) return { error: "FOTO_FORMATO" };
  if (foto.size > TAMANO_MAX_FOTO) return { error: "FOTO_TAMANO" };
  const tipoReal = tipoImagenReal(new Uint8Array(await foto.slice(0, 16).arrayBuffer()));
  if (!tipoReal || tipoReal !== foto.type) return { error: "FOTO_FORMATO" };

  const admin = getSupabaseAdmin();
  const extension = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${user.id}/taza-${crypto.randomUUID()}.${extension}`;
  const { error: errorSubida } = await admin.storage.from("palmas").upload(ruta, foto, { contentType: foto.type, upsert: false });
  if (errorSubida) {
    console.error("[chocolate] subida fallida", errorSubida);
    return { error: "FOTO_SUBIR" };
  }

  let id: string;
  try {
    const entrada: EntradaChocolate = { foto: ruta, pregunta };
    id = await crearLectura({
      tipo: "chocolate",
      titulo: pregunta ? `Lectura del chocolate: ${pregunta}` : "Lectura del chocolate",
      entrada,
      resultado: {},
    });
  } catch (e) {
    await admin.storage.from("palmas").remove([ruta]);
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Ritual de velas: foto de los restos + intención, color y señales observadas
// ---------------------------------------------------------------------------
export async function accionVelas(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const { user } = await usuarioActual();
  const foto = formData.get("foto");
  const intencion = String(formData.get("intencion") ?? "");
  const color = String(formData.get("color") ?? "");
  const senales = Array.from(new Set(formData.getAll("senal").map(String).filter(esSenal))) as Senal[];
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);

  if (!esIntencion(intencion)) return { error: "velas.intencion" };
  if (!esColor(color)) return { error: "velas.color" };
  if (!(foto instanceof File) || foto.size === 0) return { error: "velas.foto" };
  if (!TIPOS_FOTO.has(foto.type)) return { error: "FOTO_FORMATO" };
  if (foto.size > TAMANO_MAX_FOTO) return { error: "FOTO_TAMANO" };
  const tipoReal = tipoImagenReal(new Uint8Array(await foto.slice(0, 16).arrayBuffer()));
  if (!tipoReal || tipoReal !== foto.type) return { error: "FOTO_FORMATO" };

  const admin = getSupabaseAdmin();
  const extension = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${user.id}/vela-${crypto.randomUUID()}.${extension}`;
  const { error: errorSubida } = await admin.storage.from("palmas").upload(ruta, foto, { contentType: foto.type, upsert: false });
  if (errorSubida) {
    console.error("[velas] subida fallida", errorSubida);
    return { error: "FOTO_SUBIR" };
  }

  let id: string;
  try {
    const entrada: EntradaVelas = { foto: ruta, intencion, color, senales, pregunta };
    id = await crearLectura({
      tipo: "velas",
      titulo: pregunta ? `Ritual de velas: ${pregunta}` : `Ritual de velas (${intencion})`,
      entrada,
      resultado: {},
    });
  } catch (e) {
    await admin.storage.from("palmas").remove([ruta]);
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Test de aura: doce respuestas + Sol natal
// ---------------------------------------------------------------------------
export async function accionAura(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const respuestas = Array.from({ length: PREGUNTAS }, (_, i) => Number(formData.get(`r${i}`)));
  if (!esRespuestasValidas(respuestas)) return { error: "aura.incompleto" };
  const perfil = await getPerfil();
  const nombre = String(formData.get("nombre") ?? perfil?.nombre ?? "").trim().slice(0, 80);
  let signoSol = null;
  if (perfil?.fecha_nacimiento && /^\d{4}-\d{2}-\d{2}$/.test(perfil.fecha_nacimiento)) {
    const [, m, d] = perfil.fecha_nacimiento.split("-").map(Number);
    signoSol = signoPorFecha(m, d);
  }
  let id: string;
  try {
    const r = calcularAura(respuestas, signoSol);
    id = await crearLectura({
      tipo: "aura",
      titulo: `Aura ${r.principal} con ${r.secundario}${nombre ? ` · ${nombre}` : ""}`,
      entrada: { nombre, respuestas },
      resultado: r,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Lectura del tabaco: foto del puro (mismo bucket que las palmas)
// ---------------------------------------------------------------------------
export async function accionTabaco(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const { user } = await usuarioActual();
  const foto = formData.get("foto");
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (formData.get("mayor") !== "on") return { error: "tabaco.mayor" };
  if (!(foto instanceof File) || foto.size === 0) return { error: "tabaco.foto" };
  if (!TIPOS_FOTO.has(foto.type)) return { error: "FOTO_FORMATO" };
  if (foto.size > TAMANO_MAX_FOTO) return { error: "FOTO_TAMANO" };
  const tipoReal = tipoImagenReal(new Uint8Array(await foto.slice(0, 16).arrayBuffer()));
  if (!tipoReal || tipoReal !== foto.type) return { error: "FOTO_FORMATO" };

  const admin = getSupabaseAdmin();
  const extension = foto.type === "image/png" ? "png" : foto.type === "image/webp" ? "webp" : "jpg";
  const ruta = `${user.id}/tabaco-${crypto.randomUUID()}.${extension}`;
  const { error: errorSubida } = await admin.storage.from("palmas").upload(ruta, foto, { contentType: foto.type, upsert: false });
  if (errorSubida) {
    console.error("[tabaco] subida fallida", errorSubida);
    return { error: "FOTO_SUBIR" };
  }
  let id: string;
  try {
    const entrada: EntradaTabaco = { foto: ruta, pregunta };
    id = await crearLectura({ tipo: "tabaco", titulo: pregunta ? `Lectura del tabaco: ${pregunta}` : "Lectura del tabaco", entrada, resultado: {} });
  } catch (e) {
    await admin.storage.from("palmas").remove([ruta]);
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Reintento: una lectura fallida (ya reembolsada) vuelve a cobrarse y a
// quedar pendiente para que la ruta de generación la escriba de nuevo.
// ---------------------------------------------------------------------------
export async function accionReintentarLectura(formData: FormData): Promise<void> {
  const { supabase, user } = await usuarioActual();
  const id = String(formData.get("id") ?? "");
  const { data: lectura } = await supabase.from("lecturas").select("id, tipo, estado").eq("id", id).eq("usuario_id", user.id).maybeSingle();
  if (!lectura || lectura.estado !== "error") return;

  // Cobro y vuelta a 'pendiente' en una sola operación (dos clics no cobran dos veces).
  const { data: ok, error } = await supabase.rpc("reintentar_lectura", { p_lectura: id, p_costo: COSTOS[lectura.tipo as TipoLectura] });
  if (error || !ok) redirect(`/lecturas/${id}?error=SIN_CREDITOS`);
  revalidatePath(`/lecturas/${id}`);
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// I Ching: los valores de las monedas los genera el navegador (es un ritual
// de la persona); el servidor valida y resuelve los hexagramas.
// ---------------------------------------------------------------------------
export async function accionIChing(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (!pregunta) return { error: "iching.pregunta" };
  let valores: ValorLinea[];
  try {
    const crudo = JSON.parse(String(formData.get("valores") ?? "[]"));
    if (!Array.isArray(crudo) || crudo.length !== 6 || !crudo.every((v) => [6, 7, 8, 9].includes(v))) throw new Error();
    valores = crudo as ValorLinea[];
  } catch {
    return { error: "iching.lanzamientos" };
  }

  let id: string;
  try {
    const resultado = resolverHexagramas(valores);
    const presente = hexagramaPorNumero(resultado.presente)!;
    id = await crearLectura({
      tipo: "iching",
      titulo: `${presente.numero}. ${presente.nombre}: ${pregunta}`,
      entrada: { pregunta },
      resultado,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
