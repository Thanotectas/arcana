import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Códigos de oferta: créditos extra en una compra, sin cambiar el precio
 * (tabla `codigos_oferta`, migración 0034). La orden guarda el código y los
 * créditos ya sumados; el pago sigue igual y acreditar_orden entrega todo.
 */
export type CodigoOferta = Database["public"]["Tables"]["codigos_oferta"]["Row"];
const COOKIE = "arcana_codigo";

export function normalizarCodigo(texto: string | null | undefined) {
  return (texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 24);
}

export const COOKIE_CODIGO = COOKIE;

export interface ResultadoCodigo {
  valido: boolean;
  codigo: string;
  creditosExtra: number;
  /** Por qué no sirve: no existe, venció, se agotó o no aplica a ese paquete. */
  motivo?: "no_existe" | "vencido" | "agotado" | "paquete";
}

/** Órdenes que ya usan el código: aprobadas más pendientes de las últimas 2 horas (reserva). */
async function usos(admin: SupabaseClient<Database>, codigo: string) {
  const hace2h = new Date(Date.now() - 2 * 3_600_000).toISOString();
  const { count } = await admin.from("ordenes").select("id", { count: "exact", head: true }).eq("codigo", codigo).or(`estado.eq.aprobada,and(estado.eq.pendiente,creado_en.gte.${hace2h})`);
  return count ?? 0;
}

/** Valida un código para un paquete (o en general si no se pasa paquete). */
export async function validarCodigo(admin: SupabaseClient<Database>, texto: string | null | undefined, paquete?: string): Promise<ResultadoCodigo> {
  const codigo = normalizarCodigo(texto);
  if (!codigo) return { valido: false, codigo, creditosExtra: 0, motivo: "no_existe" };
  const { data: c } = await admin.from("codigos_oferta").select("*").eq("codigo", codigo).eq("activo", true).maybeSingle();
  if (!c) return { valido: false, codigo, creditosExtra: 0, motivo: "no_existe" };
  if (c.vence_en && Date.parse(c.vence_en) < Date.now()) return { valido: false, codigo, creditosExtra: c.creditos_extra, motivo: "vencido" };
  if (paquete && c.paquetes?.length && !c.paquetes.includes(paquete)) return { valido: false, codigo, creditosExtra: c.creditos_extra, motivo: "paquete" };
  if (c.cupo != null && (await usos(admin, codigo)) >= c.cupo) return { valido: false, codigo, creditosExtra: c.creditos_extra, motivo: "agotado" };
  return { valido: true, codigo, creditosExtra: c.creditos_extra };
}

/** Códigos con sus usos, para el panel. */
export async function listarCodigos(admin: SupabaseClient<Database>) {
  const { data } = await admin.from("codigos_oferta").select("*").order("creado_en", { ascending: false }).limit(20);
  return Promise.all((data ?? []).map(async (c) => ({ ...c, usos: await usos(admin, c.codigo) })));
}

/** El código vigente más reciente (para que Sibila lo diga en el directo). */
export async function codigoVigente(admin: SupabaseClient<Database>) {
  const { data } = await admin.from("codigos_oferta").select("*").eq("activo", true).or(`vence_en.is.null,vence_en.gte.${new Date().toISOString()}`).order("creado_en", { ascending: false }).limit(3);
  for (const c of data ?? []) {
    if (c.cupo == null || (await usos(admin, c.codigo)) < c.cupo) return c;
  }
  return null;
}

/** Sugerencia de vencimiento para un código nuevo: el próximo domingo a las 11:59 p.m. de Bogotá (formato datetime-local). */
export function venceSugerido() {
  const d = new Date(Date.now() - 5 * 3_600_000);
  d.setUTCDate(d.getUTCDate() + ((7 - d.getUTCDay()) % 7 || 7));
  return `${d.toISOString().slice(0, 10)}T23:59`;
}
