"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { getSupabaseAdmin } from "../supabase/admin";
import { COSTOS, CARTAS_DIA_GRATIS, type TipoLectura } from "../creditos";
import { generarTexto } from "../ia";
import { TIRADAS, tirarCartas, resumenTirada, type TipoTirada } from "../tarot/tiradas";
import { calcularCarta, resumenCarta, type DatosNacimiento } from "../astro/carta";
import { calcularPerfil, SIGNIFICADO_NUMERO } from "../numerologia";
import { signoPorFecha, signoPorId, compatibilidadSignos } from "../zodiaco";
import { cartasDelDiaHoy } from "../dal";
import type { Json } from "@/types/database";

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
 * Cobra los créditos de forma atómica. Devuelve una función para reembolsar
 * si la generación posterior falla.
 */
async function cobrar(tipo: TipoLectura, referencia: string) {
  const { supabase, user } = await usuarioActual();
  const costo = COSTOS[tipo];
  if (costo === 0) return async () => {};

  const { data: ok, error } = await supabase.rpc("consumir_creditos", {
    p_cantidad: costo,
    p_motivo: `lectura:${tipo}`,
    p_referencia: referencia,
  });
  if (error) throw new Error("No se pudo procesar el cobro. Intenta de nuevo.");
  if (!ok) throw new Error("SIN_CREDITOS");

  return async () => {
    const admin = getSupabaseAdmin();
    const { data: perfil } = await admin.from("perfiles").select("creditos").eq("id", user.id).single();
    if (perfil) {
      await admin
        .from("perfiles")
        .update({ creditos: (perfil.creditos as number) + costo })
        .eq("id", user.id);
      await admin.from("movimientos_creditos").insert({
        usuario_id: user.id,
        cantidad: costo,
        motivo: `reembolso:${tipo}`,
        referencia,
      });
    }
  };
}

async function guardarLectura(datos: {
  tipo: TipoLectura;
  titulo: string;
  entrada: unknown;
  resultado: unknown;
  interpretacion: string;
}) {
  const { supabase, user } = await usuarioActual();
  const { data, error } = await supabase
    .from("lecturas")
    .insert({
      usuario_id: user.id,
      tipo: datos.tipo,
      titulo: datos.titulo,
      entrada: datos.entrada as Json,
      resultado: datos.resultado as Json,
      interpretacion: datos.interpretacion,
      creditos_usados: COSTOS[datos.tipo],
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("No se pudo guardar la lectura.");
  revalidatePath("/inicio");
  revalidatePath("/lecturas");
  return data.id as string;
}

function manejarError(e: unknown): EstadoAccion {
  const msg = e instanceof Error ? e.message : "Ocurrió un error inesperado.";
  if (msg === "SIN_CREDITOS") {
    return { error: "No tienes créditos suficientes para esta lectura." };
  }
  console.error("[lecturas]", e);
  return { error: msg };
}

// ---------------------------------------------------------------------------
// Tarot
// ---------------------------------------------------------------------------
export async function accionTarot(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const tipo = String(formData.get("tipo") ?? "") as TipoTirada;
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (!TIRADAS[tipo]) return { error: "Tirada no válida." };

  let id: string;
  const referencia = `tarot-${Date.now()}`;
  try {
    if (tipo === "tarot_carta") {
      const hoy = await cartasDelDiaHoy();
      if (hoy >= CARTAS_DIA_GRATIS) {
        return { error: "Ya sacaste tu carta gratuita de hoy. Vuelve mañana o prueba una tirada completa." };
      }
    }
    const reembolsar = await cobrar(tipo, referencia);
    try {
      const cartas = tirarCartas(tipo);
      const interpretacion = await generarTexto(
        `Interpreta esta tirada de tarot para la persona.\n\n${resumenTirada(tipo, cartas, pregunta)}\n\n` +
          `Estructura: un breve encuadre, luego una sección por posición (## nombre de la posición — carta), y un cierre con síntesis y un consejo práctico.` +
          (tipo === "tarot_carta" ? " Sé breve: máximo 250 palabras." : tipo === "tarot_tres" ? " Extensión: 400 a 550 palabras." : " Extensión: 800 a 1100 palabras."),
        "",
        { effort: tipo === "tarot_celta" ? "medium" : "low", maxTokens: tipo === "tarot_celta" ? 3500 : 1500 },
      );
      id = await guardarLectura({
        tipo,
        titulo: pregunta ? `${TIRADAS[tipo].nombre}: ${pregunta}` : TIRADAS[tipo].nombre,
        entrada: { pregunta },
        resultado: { cartas },
        interpretacion,
      });
    } catch (e) {
      await reembolsar();
      throw e;
    }
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Carta astral
// ---------------------------------------------------------------------------
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

  if (!datos.nombre) return { error: "Escribe tu nombre." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) return { error: "Fecha de nacimiento no válida." };
  if (!datos.horaDesconocida && !/^\d{2}:\d{2}$/.test(datos.hora)) return { error: "Hora no válida." };
  if (!datos.lugar || Number.isNaN(datos.latitud) || Number.isNaN(datos.longitud) || !datos.zonaHoraria) {
    return { error: "Selecciona el lugar de nacimiento de la lista de sugerencias." };
  }
  const anio = Number(datos.fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear()) return { error: "El año debe estar entre 1900 y hoy." };

  let id: string;
  const referencia = `astral-${Date.now()}`;
  try {
    const reembolsar = await cobrar("carta_astral", referencia);
    try {
      const carta = calcularCarta(datos);
      const interpretacion = await generarTexto(
        `Interpreta esta carta astral natal.\n\n${resumenCarta(carta)}\n\n` +
          `Estructura sugerida: ## Tu esencia (Sol, Luna y Ascendente como trío), ## Cómo piensas y te comunicas (Mercurio), ## Amor y valores (Venus), ## Energía y deseo (Marte), ## Expansión y límites (Júpiter y Saturno), ## Aspectos que marcan tu carta (los 3 o 4 más relevantes), ## Balance de elementos, ## Tu camino (Nodo Norte y Medio Cielo), ## Síntesis.` +
          (datos.horaDesconocida ? " La hora es desconocida: no interpretes casas ni Ascendente, y menciona brevemente por qué." : "") +
          ` Extensión: 1100 a 1500 palabras.`,
        "",
        { effort: "medium", maxTokens: 5000 },
      );
      id = await guardarLectura({
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
        interpretacion,
      });
    } catch (e) {
      await reembolsar();
      throw e;
    }
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Numerología
// ---------------------------------------------------------------------------
export async function accionNumerologia(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 120);
  const fecha = String(formData.get("fecha") ?? "");
  if (nombre.length < 3) return { error: "Escribe tu nombre completo tal como aparece en tu documento." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return { error: "Fecha de nacimiento no válida." };

  let id: string;
  const referencia = `numero-${Date.now()}`;
  try {
    const reembolsar = await cobrar("numerologia", referencia);
    try {
      const perfil = calcularPerfil(nombre, new Date(fecha + "T12:00:00Z"));
      const describir = (n: number) => `${n} (${SIGNIFICADO_NUMERO[n]?.titulo ?? ""}: ${SIGNIFICADO_NUMERO[n]?.resumen ?? ""})`;
      const interpretacion = await generarTexto(
        `Interpreta este perfil numerológico pitagórico.\n\nNombre: ${nombre}\nFecha de nacimiento: ${fecha}\n` +
          `Camino de vida: ${describir(perfil.caminoDeVida)}\nNúmero de expresión: ${describir(perfil.expresion)}\n` +
          `Impulso del alma: ${describir(perfil.almaOImpulso)}\nPersonalidad: ${describir(perfil.personalidad)}\n` +
          `Número de cumpleaños: ${describir(perfil.cumpleanos)}\nAño personal actual: ${perfil.anioPersonal}\n\n` +
          `Estructura: una sección por número (## Camino de vida N, etc.), cómo interactúan entre sí, y un cierre con el tema del año personal. Extensión: 600 a 800 palabras.`,
        "",
        { effort: "low", maxTokens: 2500 },
      );
      id = await guardarLectura({
        tipo: "numerologia",
        titulo: `Perfil numerológico de ${nombre}`,
        entrada: { nombre, fecha },
        resultado: perfil,
        interpretacion,
      });
    } catch (e) {
      await reembolsar();
      throw e;
    }
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

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
  if (!a || !b) return { error: "Indica la fecha de nacimiento o el signo de ambas personas." };

  let id: string;
  const referencia = `compat-${Date.now()}`;
  try {
    const reembolsar = await cobrar("compatibilidad", referencia);
    try {
      const puntaje = compatibilidadSignos(a, b);
      const interpretacion = await generarTexto(
        `Analiza la compatibilidad astrológica entre ${nombreA} (${a.nombre}, ${a.elemento}, ${a.modalidad}, regente ${a.regente}) y ${nombreB} (${b.nombre}, ${b.elemento}, ${b.modalidad}, regente ${b.regente}). ` +
          `Afinidad calculada por elementos y modalidades: ${puntaje}/100.\n\n` +
          `Estructura: ## Lo que los une, ## Dónde chocan, ## En el amor, ## En la amistad y el trabajo, ## Consejo para que funcione. Usa los nombres. Extensión: 500 a 650 palabras.`,
        "",
        { effort: "low", maxTokens: 2200 },
      );
      id = await guardarLectura({
        tipo: "compatibilidad",
        titulo: `${nombreA} (${a.nombre}) y ${nombreB} (${b.nombre})`,
        entrada: { nombreA, nombreB, signoA: a.id, signoB: b.id },
        resultado: { puntaje, signoA: a.id, signoB: b.id },
        interpretacion,
      });
    } catch (e) {
      await reembolsar();
      throw e;
    }
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

