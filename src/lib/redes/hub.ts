import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { CANALES_HUB, refHubValido } from "@/lib/marca/redes";
import { fechaBogota } from "./carta-dia";
import { sumarDias } from "./calendario";
import { resolverPagina } from "./pagina";
import { tokenVigente as tokenYoutube, youtubeConfigurado } from "./youtube";
import { tiktokConfigurado, tokenVigenteTiktok } from "./tiktok";

/**
 * Hub de redes (miarcana.com/redes): registro de cada clic hacia un canal,
 * seguidores por día de cada red y el resumen que muestra /admin/hub.
 * Tablas `clics_redes` y `seguidores_redes` (migración 0049). Si la migración
 * no está aplicada, nada falla: los clics se pierden y el panel sale vacío.
 */
type Admin = SupabaseClient<Database>;
type Clic = Database["public"]["Tables"]["clics_redes"]["Insert"];

const IDS = new Set(CANALES_HUB.map((c) => c.id));
export const ORIGEN_DIRECTO = "directo";
const API_META = "https://graph.facebook.com/v25.0";

/** Acepta solo lo que la página envía: un canal del hub, un código de origen válido (o ninguno) y el dispositivo. */
export function validarClic(cuerpo: unknown): Pick<Clic, "red" | "origen" | "dispositivo"> | null {
  if (!cuerpo || typeof cuerpo !== "object") return null;
  const b = cuerpo as Record<string, unknown>;
  if (typeof b.red !== "string" || !IDS.has(b.red)) return null;
  const crudo = typeof b.origen === "string" ? b.origen : "";
  const origen = crudo ? refHubValido(crudo) : ORIGEN_DIRECTO;
  if (!origen) return null;
  return { red: b.red, origen, dispositivo: b.dispositivo === "movil" ? "movil" : "escritorio" };
}

export async function registrarClic(admin: Admin, clic: Pick<Clic, "red" | "origen" | "dispositivo">) {
  const { error } = await admin.from("clics_redes").insert({ ...clic, fecha: fechaBogota() });
  if (error) throw new Error(error.message);
}

// --- Seguidores -----------------------------------------------------------------------------

export interface Seguidores {
  fecha: string;
  redes: { red: string; seguidores: number | null; detalle: string | null }[];
}

function tokenMeta() {
  return (process.env.FB_PAGE_TOKEN ?? process.env.META_PAGE_TOKEN ?? process.env.IG_PAGE_TOKEN ?? "").trim();
}

async function meta<T>(ruta: string, token: string): Promise<T> {
  const res = await fetch(`${API_META}/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const d = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; code?: number } };
  if (!res.ok || d.error) throw new Error(`${d.error?.message ?? res.status}${d.error?.code ? ` (código ${d.error.code})` : ""}`);
  return d;
}

/** Qué redes se pueden consultar con lo configurado hoy. */
export function fuentesSeguidores() {
  const fuentes: string[] = [];
  if (process.env.IG_USER_ID && process.env.IG_PAGE_TOKEN) fuentes.push("instagram");
  if (tokenMeta()) fuentes.push("facebook");
  if (youtubeConfigurado()) fuentes.push("youtube");
  if (tiktokConfigurado()) fuentes.push("tiktok");
  fuentes.push("telegram");
  return fuentes;
}

/** Pregunta a cada red cuántos seguidores tiene; una que falle queda en null con el motivo y no tumba a las demás. */
export async function consultarSeguidores(admin: Admin, fecha = fechaBogota()): Promise<Seguidores> {
  const consultas: Record<string, () => Promise<number | null>> = {
    instagram: async () => {
      const r = await meta<{ followers_count?: number }>(`${process.env.IG_USER_ID}?fields=followers_count`, process.env.IG_PAGE_TOKEN!.trim());
      return r.followers_count ?? null;
    },
    facebook: async () => {
      const pagina = await resolverPagina(tokenMeta());
      const r = await meta<{ followers_count?: number; fan_count?: number }>(`${pagina.id}?fields=followers_count,fan_count`, pagina.token);
      return r.followers_count ?? r.fan_count ?? null;
    },
    youtube: async () => {
      const token = await tokenYoutube(admin);
      const res = await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const d = (await res.json().catch(() => ({}))) as { items?: { statistics?: { subscriberCount?: string } }[]; error?: { message?: string } };
      if (!res.ok || d.error) throw new Error(d.error?.message ?? String(res.status));
      const n = Number(d.items?.[0]?.statistics?.subscriberCount);
      return Number.isFinite(n) ? n : null;
    },
    tiktok: async () => {
      const token = await tokenVigenteTiktok(admin);
      const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=follower_count", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const d = (await res.json().catch(() => ({}))) as { data?: { user?: { follower_count?: number } }; error?: { code?: string; message?: string } };
      if (!res.ok || (d.error && d.error.code && d.error.code !== "ok")) {
        const m = d.error?.message ?? String(res.status);
        throw new Error(/scope/i.test(m) ? "Falta el permiso user.info.stats: vuelve a conectar TikTok en /admin/redes." : m);
      }
      return d.data?.user?.follower_count ?? null;
    },
    // Telegram no tiene «seguidores»: contamos a quienes reciben la carta cada mañana (/diaria).
    telegram: async () => {
      const { count, error } = await admin.from("suscriptores_telegram").select("chat_id", { count: "exact", head: true }).eq("activo", true);
      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  };
  const redes: Seguidores["redes"] = [];
  for (const red of fuentesSeguidores()) {
    try {
      redes.push({ red, seguidores: await consultas[red](), detalle: null });
    } catch (e) {
      redes.push({ red, seguidores: null, detalle: (e instanceof Error ? e.message : String(e)).slice(0, 200) });
    }
  }
  return { fecha, redes };
}

export async function guardarSeguidores(admin: Admin, s: Seguidores) {
  if (!s.redes.length) return;
  const { error } = await admin.from("seguidores_redes").upsert(s.redes.map((r) => ({ fecha: s.fecha, ...r })), { onConflict: "fecha,red" });
  if (error) throw new Error(error.message);
}

// --- Resumen para /admin/hub --------------------------------------------------------------------

export interface ResumenHub {
  hoy: string;
  dias: number;
  total: number;
  total7: number;
  porDia: { fecha: string; total: number }[];
  porRed: { red: string; clics: number; clics7: number; movil: number }[];
  porOrigen: { origen: string; clics: number }[];
  seguidores: { red: string; actual: number | null; hace30: number | null; detalle: string | null; historial: { fecha: string; n: number }[] }[];
  fuentes: string[];
  /** La migración 0049 no está aplicada (o la consulta falló). */
  error?: string;
}

export async function resumenHub(admin: Admin, dias = 30, hoy = fechaBogota()): Promise<ResumenHub> {
  const desde = sumarDias(hoy, 1 - dias);
  const desde7 = sumarDias(hoy, -6);
  const r: ResumenHub = { hoy, dias, total: 0, total7: 0, porDia: [], porRed: [], porOrigen: [], seguidores: [], fuentes: fuentesSeguidores() };
  const { data: clics, error } = await admin.from("clics_redes").select("fecha, red, origen, dispositivo").gte("fecha", desde).limit(20000);
  if (error) return { ...r, error: error.message };

  const porDia = new Map<string, number>(Array.from({ length: dias }, (_, i) => [sumarDias(desde, i), 0]));
  const porRed = new Map<string, { clics: number; clics7: number; movil: number }>(CANALES_HUB.map((c) => [c.id, { clics: 0, clics7: 0, movil: 0 }]));
  const porOrigen = new Map<string, number>();
  for (const c of clics ?? []) {
    r.total++;
    porDia.set(c.fecha, (porDia.get(c.fecha) ?? 0) + 1);
    const red = porRed.get(c.red) ?? { clics: 0, clics7: 0, movil: 0 };
    red.clics++;
    if (c.fecha >= desde7) { red.clics7++; r.total7++; }
    if (c.dispositivo === "movil") red.movil++;
    porRed.set(c.red, red);
    porOrigen.set(c.origen, (porOrigen.get(c.origen) ?? 0) + 1);
  }
  r.porDia = [...porDia].map(([fecha, total]) => ({ fecha, total }));
  r.porRed = [...porRed].map(([red, v]) => ({ red, ...v })).sort((a, b) => b.clics - a.clics);
  r.porOrigen = [...porOrigen].map(([origen, clics]) => ({ origen, clics })).sort((a, b) => b.clics - a.clics);

  const { data: seguidores } = await admin.from("seguidores_redes").select("fecha, red, seguidores, detalle").gte("fecha", sumarDias(hoy, -90)).order("fecha");
  const porRedSeg = new Map<string, { fecha: string; n: number | null; detalle: string | null }[]>();
  for (const s of seguidores ?? []) {
    const lista = porRedSeg.get(s.red) ?? [];
    lista.push({ fecha: s.fecha, n: s.seguidores, detalle: s.detalle });
    porRedSeg.set(s.red, lista);
  }
  const hace30 = sumarDias(hoy, -30);
  r.seguidores = [...porRedSeg].map(([red, lista]) => {
    const conDato = lista.filter((x): x is { fecha: string; n: number; detalle: string | null } => typeof x.n === "number");
    const ultimo = conDato.at(-1) ?? null;
    const antes = [...conDato].reverse().find((x) => x.fecha <= hace30) ?? null;
    return {
      red,
      actual: ultimo?.n ?? null,
      hace30: antes?.n ?? null,
      detalle: lista.at(-1)?.detalle ?? null,
      historial: conDato.map((x) => ({ fecha: x.fecha, n: x.n })),
    };
  });
  return r;
}
