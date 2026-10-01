import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Perfil } from "../dal";
import { calcularCarta, resumenCarta } from "../astro/carta";
import { calcularPerfil, SIGNIFICADO_NUMERO } from "../numerologia";
import { calcularChino, resumenChino } from "../chino";
import { resumenTirada, type CartaTirada, type TipoTirada } from "../tarot/tiradas";
import { esMazo, type IdMazo } from "../tarot/mazos";
import { resumenIChing, type ResultadoIChing } from "../iching";
import { resumenQuiromancia, type EntradaQuiromancia } from "../quiromancia";
import { extractoPlano } from "../lecturas/memoria";
import { datosNacimientoDePerfil } from "../diario";
import { datoDeUsuario } from "../seguridad";
import { resumenSueno, type EntradaSueno } from "../suenos";
import { resumenChocolate, type EntradaChocolate } from "../chocolate";
import { resumenSinastria, type ResultadoSinastria } from "../astro/sinastria";

/**
 * Lecturas cruzadas: dos sistemas sobre la misma persona. Los sistemas que
 * salen de los datos de nacimiento se calculan al momento; los que nacen de
 * un ritual (tarot, I Ching, mano, sueños, chocolate, sinastría) usan la
 * última lectura terminada.
 */
export const SISTEMAS = ["carta_astral", "numerologia", "chino", "tarot", "iching", "quiromancia", "suenos", "chocolate", "sinastria"] as const;
export type Sistema = (typeof SISTEMAS)[number];

export function esSistema(v: unknown): v is Sistema {
  return typeof v === "string" && (SISTEMAS as readonly string[]).includes(v);
}

export interface Disponibilidad {
  sistema: Sistema;
  /** "datos": se calcula con el perfil; "lectura": usa una lectura previa; null: no disponible. */
  origen: "datos" | "lectura" | null;
  lecturaId?: string;
  lecturaTitulo?: string;
  lecturaFecha?: string;
}

interface LecturaBreve {
  id: string;
  tipo: string;
  titulo: string;
  entrada: Record<string, unknown>;
  resultado: Record<string, unknown>;
  interpretacion: string | null;
  creado_en: string;
}

const TIPOS_POR_SISTEMA: Record<Sistema, string[]> = {
  carta_astral: ["carta_astral"],
  numerologia: ["numerologia"],
  chino: ["chino"],
  tarot: ["tarot_tres", "tarot_celta", "tarot_carta"],
  iching: ["iching"],
  quiromancia: ["quiromancia"],
  suenos: ["suenos"],
  chocolate: ["chocolate"],
  sinastria: ["sinastria"],
};

async function ultimasLecturas(supabase: SupabaseClient<Database>, usuarioId: string): Promise<LecturaBreve[]> {
  const { data } = await supabase
    .from("lecturas")
    .select("id, tipo, titulo, entrada, resultado, interpretacion, creado_en")
    .eq("usuario_id", usuarioId)
    .eq("estado", "lista")
    .order("creado_en", { ascending: false })
    .limit(60);
  return (data ?? []) as LecturaBreve[];
}

function ultimaDe(lecturas: LecturaBreve[], sistema: Sistema) {
  const tipos = TIPOS_POR_SISTEMA[sistema];
  // Para tarot preferimos una tirada completa antes que la carta del día.
  return lecturas.find((l) => tipos.slice(0, sistema === "tarot" ? 2 : 1).includes(l.tipo)) ?? lecturas.find((l) => tipos.includes(l.tipo));
}

/** Qué sistemas puede cruzar la persona hoy y de dónde saldría cada uno. */
export async function disponibilidadCruce(supabase: SupabaseClient<Database>, perfil: Perfil): Promise<Disponibilidad[]> {
  const lecturas = await ultimasLecturas(supabase, perfil.id);
  const natal = datosNacimientoDePerfil(perfil);
  return SISTEMAS.map((sistema) => {
    const previa = ultimaDe(lecturas, sistema);
    if (previa) return { sistema, origen: "lectura", lecturaId: previa.id, lecturaTitulo: previa.titulo, lecturaFecha: previa.creado_en };
    if (sistema === "carta_astral" && natal) return { sistema, origen: "datos" };
    if (sistema === "numerologia" && perfil.nombre && perfil.fecha_nacimiento) return { sistema, origen: "datos" };
    if (sistema === "chino" && perfil.fecha_nacimiento) return { sistema, origen: "datos" };
    return { sistema, origen: null };
  });
}

export interface FuenteCruce {
  sistema: Sistema;
  /** Datos del sistema en texto plano (lo que vería el modelo en una lectura simple). */
  resumen: string;
  /** Extracto de la interpretación previa, si la hubo. */
  extracto?: string;
  lecturaId?: string;
  titulo?: string;
}

/** Construye la fuente de un sistema: calcula con el perfil o toma la última lectura. */
export async function fuenteDe(supabase: SupabaseClient<Database>, perfil: Perfil, sistema: Sistema): Promise<FuenteCruce | null> {
  const lecturas = await ultimasLecturas(supabase, perfil.id);
  const previa = ultimaDe(lecturas, sistema);
  const nombre = datoDeUsuario(perfil.nombre, 80) || "la persona";

  if (previa) {
    const e = previa.entrada ?? {};
    const r = previa.resultado ?? {};
    let resumen = "";
    if (previa.tipo.startsWith("tarot")) {
      const mazo: IdMazo = esMazo(e.mazo) ? e.mazo : "rider";
      resumen = resumenTirada(previa.tipo as TipoTirada, (r.cartas as CartaTirada[]) ?? [], datoDeUsuario(e.pregunta, 300), mazo);
    } else if (previa.tipo === "iching") {
      resumen = resumenIChing(r as unknown as ResultadoIChing, datoDeUsuario(e.pregunta, 300));
    } else if (previa.tipo === "quiromancia") {
      resumen = resumenQuiromancia(e as unknown as EntradaQuiromancia);
    } else if (previa.tipo === "carta_astral") {
      resumen = resumenCarta(calcularCarta(e as never));
    } else if (previa.tipo === "numerologia") {
      resumen = resumenNumerologia(String(e.nombre ?? ""), String(e.fecha ?? ""));
    } else if (previa.tipo === "chino") {
      resumen = resumenChino(calcularChino(String(e.fecha ?? ""), (e.hora as string | null) ?? null), nombre);
    } else if (previa.tipo === "suenos") {
      resumen = resumenSueno(e as unknown as EntradaSueno, datoDeUsuario);
    } else if (previa.tipo === "chocolate") {
      resumen = resumenChocolate(e as unknown as EntradaChocolate) + "\n(La foto no se reenvía: las figuras leídas están en la síntesis de la lectura anterior.)";
    } else if (previa.tipo === "sinastria") {
      resumen = resumenSinastria(r as unknown as ResultadoSinastria);
    }
    return { sistema, resumen, extracto: extractoPlano(previa.interpretacion ?? "", 700), lecturaId: previa.id, titulo: previa.titulo };
  }

  const natal = datosNacimientoDePerfil(perfil);
  if (sistema === "carta_astral" && natal) return { sistema, resumen: resumenCarta(calcularCarta(natal)) };
  if (sistema === "numerologia" && perfil.nombre && perfil.fecha_nacimiento) return { sistema, resumen: resumenNumerologia(perfil.nombre, perfil.fecha_nacimiento) };
  if (sistema === "chino" && perfil.fecha_nacimiento) {
    return { sistema, resumen: resumenChino(calcularChino(perfil.fecha_nacimiento, perfil.hora_nacimiento ? perfil.hora_nacimiento.slice(0, 5) : null), nombre) };
  }
  return null;
}

function resumenNumerologia(nombre: string, fecha: string) {
  const p = calcularPerfil(nombre, new Date(fecha + "T12:00:00Z"));
  const d = (n: number) => `${n} (${SIGNIFICADO_NUMERO[n]?.titulo ?? ""}: ${SIGNIFICADO_NUMERO[n]?.resumen ?? ""})`;
  return (
    `Nombre: ${datoDeUsuario(nombre, 120)}. Fecha de nacimiento: ${fecha}.\n` +
    `Camino de vida: ${d(p.caminoDeVida)}\nExpresión: ${d(p.expresion)}\nImpulso del alma: ${d(p.almaOImpulso)}\nPersonalidad: ${d(p.personalidad)}\nCumpleaños: ${d(p.cumpleanos)}\nAño personal: ${p.anioPersonal}`
  );
}
