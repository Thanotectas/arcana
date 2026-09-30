import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { TipoLectura } from "./creditos";

export interface Perfil {
  id: string;
  nombre: string | null;
  fecha_nacimiento: string | null;
  hora_nacimiento: string | null;
  lugar_nacimiento: string | null;
  latitud: number | null;
  longitud: number | null;
  zona_horaria: string | null;
  creditos: number;
  creado_en: string;
}

export interface Lectura {
  id: string;
  usuario_id: string;
  tipo: TipoLectura;
  titulo: string;
  entrada: Record<string, unknown>;
  resultado: Record<string, unknown>;
  interpretacion: string | null;
  creditos_usados: number;
  creado_en: string;
}

export interface Orden {
  id: string;
  paquete: string;
  creditos: number;
  monto_centavos: number;
  moneda: string;
  referencia: string;
  estado: string;
  transaccion_id: string | null;
  creado_en: string;
}

/** Usuario autenticado o redirección a /entrar. Cacheado por request. */
export const requerirUsuario = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");
  return user;
});

export const getUsuarioOpcional = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getPerfil = cache(async (): Promise<Perfil | null> => {
  const user = await getUsuarioOpcional();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("perfiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Perfil | null) ?? null;
});

export async function getLecturas(limite = 20): Promise<Lectura[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lecturas")
    .select("id, usuario_id, tipo, titulo, entrada, resultado, interpretacion, creditos_usados, creado_en")
    .order("creado_en", { ascending: false })
    .limit(limite);
  return (data as Lectura[] | null) ?? [];
}

export async function getLectura(id: string): Promise<Lectura | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("lecturas").select("*").eq("id", id).maybeSingle();
  return (data as Lectura | null) ?? null;
}

/** Cuántas cartas del día ha sacado el usuario hoy (fecha UTC). */
export async function cartasDelDiaHoy(): Promise<number> {
  const supabase = await createClient();
  const inicio = new Date();
  inicio.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from("lecturas")
    .select("id", { count: "exact", head: true })
    .eq("tipo", "tarot_carta")
    .gte("creado_en", inicio.toISOString());
  return count ?? 0;
}

export async function getOrdenes(limite = 20): Promise<Orden[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordenes")
    .select("id, paquete, creditos, monto_centavos, moneda, referencia, estado, transaccion_id, creado_en")
    .order("creado_en", { ascending: false })
    .limit(limite);
  return (data as Orden[] | null) ?? [];
}

export async function getOrdenPorReferencia(referencia: string): Promise<Orden | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ordenes")
    .select("id, paquete, creditos, monto_centavos, moneda, referencia, estado, transaccion_id, creado_en")
    .eq("referencia", referencia)
    .maybeSingle();
  return (data as Orden | null) ?? null;
}
