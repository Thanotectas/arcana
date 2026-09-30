"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../supabase/server";
import { getSupabaseAdmin } from "../supabase/admin";
import { COSTOS, CARTAS_DIA_GRATIS, type TipoLectura } from "../creditos";
import { TIRADAS, cartasDesdeAbanico, type TipoTirada } from "../tarot/tiradas";
import { calcularCarta, type DatosNacimiento } from "../astro/carta";
import { calcularPerfil } from "../numerologia";
import { signoPorFecha, signoPorId, compatibilidadSignos } from "../zodiaco";
import { cartasDelDiaHoy, getPerfil } from "../dal";
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
 * Cobra la lectura y la guarda en estado 'pendiente'. La interpretación la
 * escribe después /api/lecturas/[id]/generar mientras la persona la ve.
 * Solo el servidor crea lecturas (la tabla no admite inserts de usuarios).
 */
async function crearLectura(datos: { tipo: TipoLectura; titulo: string; entrada: unknown; resultado: unknown }) {
  const { supabase, user } = await usuarioActual();
  const perfil = await getPerfil();
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
      entrada: datos.entrada as Json,
      resultado: datos.resultado as Json,
      creditos_usados: costo,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error || !data) {
    if (costo > 0) {
      const { data: perfil } = await admin.from("perfiles").select("creditos").eq("id", user.id).single();
      if (perfil) {
        await admin.from("perfiles").update({ creditos: perfil.creditos + costo }).eq("id", user.id);
        await admin.from("movimientos_creditos").insert({ usuario_id: user.id, cantidad: costo, motivo: `reembolso:${datos.tipo}`, referencia });
      }
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
    return { error: "No tienes créditos suficientes para esta lectura." };
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
  if (!TIRADAS[tipo]) return { error: "Tirada no válida." };

  let posiciones: number[];
  try {
    posiciones = JSON.parse(String(formData.get("posiciones") ?? "[]"));
    if (!Array.isArray(posiciones)) throw new Error();
  } catch {
    return { error: "Elige tus cartas antes de continuar." };
  }

  let id: string;
  try {
    const ilimitado = (await getPerfil())?.ilimitado;
    if (tipo === "tarot_carta" && !ilimitado && (await cartasDelDiaHoy()) >= CARTAS_DIA_GRATIS) {
      return { error: "Ya sacaste tu carta gratuita de hoy. Vuelve mañana o prueba una tirada completa." };
    }
    const cartas = cartasDesdeAbanico(tipo, posiciones);
    id = await crearLectura({
      tipo,
      titulo: pregunta ? `${TIRADAS[tipo].nombre}: ${pregunta}` : TIRADAS[tipo].nombre,
      entrada: { pregunta },
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
