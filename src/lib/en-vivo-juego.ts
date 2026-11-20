import "server-only";
import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { MAZO, type CartaTarot } from "@/lib/tarot/deck";
import { mensajeDelDia, nombreGrupo } from "@/lib/juego/carta-escondida";
import { paraLeer, sintetizar, vozConfigurada } from "@/lib/redes/voz";

/**
 * «La carta escondida» en el directo: Sibila esconde una carta, da cuatro pistas en voz alta y el chat adivina.
 * Quien la nombra primero gana y su próxima pregunta pasa de primera en la fila.
 * El estado vive en en_vivo_estado (juego_*). Empieza cuando se pide desde el panel o, sin nadie en la fila,
 * como relleno (como mucho cada 20 minutos).
 */

type Admin = SupabaseClient<Database>;
const CADA_CUANTO = 20 * 60_000;
/** Pasado este tiempo, un juego sin terminar se da por perdido (el escenario se cayó). */
const DURACION_MAXIMA = 6 * 60_000;

export interface Frase {
  texto: string;
  audio: string | null;
}

export interface InicioJuego {
  clase: "juego";
  inicio: Frase;
  pistas: Frase[];
}

async function decir(texto: string): Promise<Frase> {
  if (!vozConfigurada()) return { texto, audio: null };
  try {
    return { texto, audio: (await sintetizar(paraLeer(texto))).toString("base64") };
  } catch (e) {
    console.error("[en vivo juego] voz:", e instanceof Error ? e.message : e);
    return { texto, audio: null };
  }
}

// ───────────────────────── Reconocer la carta en un mensaje del chat ─────────────────────────

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9ñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const RANGOS: Record<string, number> = {
  as: 1, uno: 1, "1": 1, dos: 2, "2": 2, tres: 3, "3": 3, cuatro: 4, "4": 4, cinco: 5, "5": 5, seis: 6, "6": 6, siete: 7, "7": 7,
  ocho: 8, "8": 8, nueve: 9, "9": 9, diez: 10, "10": 10, sota: 11, paje: 11, page: 11, caballo: 12, caballero: 12, reina: 13, rey: 14,
};
const PALOS: Record<string, string> = { bastos: "bastos", copas: "copas", espadas: "espadas", oros: "oros", pentaculos: "oros", pentaclos: "oros" };

/** Otros nombres con que la gente llama a los mayores (en el chat se escribe como se recuerda). */
const ALIAS: Record<string, string[]> = {
  "el-loco": ["loco"],
  "el-mago": ["mago"],
  "la-sacerdotisa": ["sacerdotisa", "papisa", "suma sacerdotisa"],
  "la-emperatriz": ["emperatriz"],
  "el-emperador": ["emperador"],
  "el-sumo-sacerdote": ["sumo sacerdote", "hierofante", "papa"],
  "los-enamorados": ["enamorados", "amantes", "enamorado"],
  "el-carro": ["carro"],
  "la-fuerza": ["fuerza"],
  "el-ermitano": ["ermitano"],
  "la-rueda-de-la-fortuna": ["rueda de la fortuna", "rueda"],
  "la-justicia": ["justicia"],
  "el-colgado": ["colgado", "ahorcado"],
  "la-muerte": ["muerte"],
  "la-templanza": ["templanza"],
  "el-diablo": ["diablo"],
  "la-torre": ["torre"],
  "la-estrella": ["estrella"],
  "la-luna": ["luna"],
  "el-sol": ["sol"],
  "el-juicio": ["juicio"],
  "el-mundo": ["mundo"],
};

/** La carta que nombra un mensaje del chat («el sol», «3 de copas», «reina de oros»), o null. */
export function cartaNombrada(texto: string): CartaTarot | null {
  const t = ` ${normalizar(texto)} `;
  const menor = /\b(as|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|sota|paje|page|caballo|caballero|reina|rey|\d{1,2})\s+de\s+(bastos|copas|espadas|oros|pentaculos|pentaclos)\b/.exec(t);
  if (menor) {
    const numero = RANGOS[menor[1]];
    const palo = PALOS[menor[2]];
    return MAZO.find((c) => c.arcano === "menor" && c.palo === palo && c.numero === numero) ?? null;
  }
  for (const c of MAZO) {
    if (c.arcano !== "mayor") continue;
    for (const alias of ALIAS[c.id] ?? []) if (t.includes(` ${alias} `)) return c;
  }
  return null;
}

// ───────────────────────── Pistas ─────────────────────────

const ELEMENTO: Record<CartaTarot["elemento"], string> = {
  fuego: "su elemento es el fuego",
  agua: "su elemento es el agua",
  aire: "su elemento es el aire",
  tierra: "su elemento es la tierra",
  espiritu: "no tiene un elemento terrenal: es una carta del espíritu",
};
const RANGO_DICHO: Record<number, string> = { 1: "el As", 11: "la Sota", 12: "el Caballero", 13: "la Reina", 14: "el Rey" };

function textosDePistas(c: CartaTarot): string[] {
  const [p1, p2] = c.palabrasClave;
  const grupo = c.arcano === "mayor" ? "es un Arcano Mayor" : `es del palo de ${nombreGrupo(c)}`;
  let numero: string;
  if (c.arcano === "mayor") {
    const desde = Math.max(0, c.numero - 2 - randomInt(2));
    numero = `su número está entre el ${desde} y el ${Math.min(21, desde + 4)}`;
  } else numero = RANGO_DICHO[c.numero] ? `es ${RANGO_DICHO[c.numero]} de su palo` : `su número es el ${c.numero}`;
  return [`Segunda pista: ${ELEMENTO[c.elemento]}.`, `Tercera pista: ${grupo}. Y otra palabra que la acompaña: ${p2 ?? p1}.`, `Última pista: ${numero}. ¡Escríbela en el chat!`];
}

// ───────────────────────── Estado ─────────────────────────

/** Pide un juego desde el panel: empieza en la siguiente vuelta del escenario. */
export async function pedirJuego(admin: Admin) {
  await admin.from("en_vivo_estado").upsert({ id: 1, juego_pedido_en: new Date().toISOString(), actualizado_en: new Date().toISOString() }, { onConflict: "id" });
}

/**
 * Si toca jugar (pedido desde el panel, o relleno con el directo al aire y sin juego en los últimos 20 minutos),
 * esconde la carta y devuelve el anuncio y las pistas con su voz. Si no, null.
 */
export async function juegoSiToca(admin: Admin, relleno: boolean): Promise<InicioJuego | null> {
  const { data: e } = await admin.from("en_vivo_estado").select("juego_pedido_en, juego_inicio, juego_fin").eq("id", 1).maybeSingle();
  const ahora = Date.now();
  const pedido = e?.juego_pedido_en && ahora - Date.parse(e.juego_pedido_en) < 15 * 60_000;
  const enCurso = e?.juego_inicio && !e.juego_fin && ahora - Date.parse(e.juego_inicio) < DURACION_MAXIMA;
  const ultimo = e?.juego_inicio ? Date.parse(e.juego_inicio) : 0;
  if (enCurso || !(pedido || (relleno && ahora - ultimo > CADA_CUANTO))) return null;

  const carta = MAZO[randomInt(MAZO.length)];
  await admin
    .from("en_vivo_estado")
    .update({ juego_pedido_en: null, juego_carta: carta.id, juego_inicio: new Date().toISOString(), juego_ganador: null, juego_ganador_en: null, juego_fin: null, actualizado_en: new Date().toISOString() })
    .eq("id", 1);
  const [p1] = carta.palabrasClave;
  const [inicio, ...pistas] = await Promise.all([
    decir(
      `¡Juguemos! Acabo de esconder una carta del tarot. Escribe en el chat cuál crees que es: quien la encuentre primero pasa de primero en la fila de lecturas. Primera pista: ${p1}.`,
    ),
    ...textosDePistas(carta).map(decir),
  ]);
  return { clase: "juego", inicio, pistas };
}

/** Quién la encontró (si alguien ya la nombró en el chat). */
export async function ganadorDelJuego(admin: Admin) {
  const { data } = await admin.from("en_vivo_estado").select("juego_ganador").eq("id", 1).maybeSingle();
  return data?.juego_ganador ?? null;
}

/**
 * Lo llama la lectura del chat con los mensajes nuevos: el primero que nombra la carta escondida gana.
 * Devuelve los ids de los mensajes que eran intentos de adivinar (no entran a la fila como consulta).
 */
export async function revisarAdivinanzas(
  admin: Admin,
  estado: { juego_carta: string | null; juego_inicio: string | null; juego_ganador: string | null; juego_fin: string | null } | null,
  mensajes: { id: string; autor: string; texto: string }[],
): Promise<Set<string>> {
  const intentos = new Set<string>();
  if (!estado?.juego_carta || estado.juego_fin || !estado.juego_inicio || Date.now() - Date.parse(estado.juego_inicio) > DURACION_MAXIMA) return intentos;
  let ganador = estado.juego_ganador;
  for (const m of mensajes) {
    const c = cartaNombrada(m.texto);
    if (!c) continue;
    intentos.add(m.id);
    if (!ganador && c.id === estado.juego_carta) {
      const { data } = await admin
        .from("en_vivo_estado")
        .update({ juego_ganador: m.autor, juego_ganador_en: new Date().toISOString() })
        .eq("id", 1)
        .is("juego_ganador", null)
        .select("juego_ganador")
        .maybeSingle();
      if (data) ganador = m.autor;
    }
  }
  return intentos;
}

/** Cierra el juego: revela la carta y anuncia a quien la encontró (o que se escondió muy bien). */
export async function terminarJuego(admin: Admin) {
  const { data: e } = await admin.from("en_vivo_estado").select("juego_carta, juego_ganador, juego_fin").eq("id", 1).maybeSingle();
  const carta = MAZO.find((c) => c.id === e?.juego_carta);
  if (!carta) return null;
  if (!e?.juego_fin) await admin.from("en_vivo_estado").update({ juego_fin: new Date().toISOString() }).eq("id", 1);
  const ganador = e?.juego_ganador ?? null;
  const mensaje = mensajeDelDia(carta).split(/(?<=[.!?])\s/)[0];
  const texto = ganador
    ? `¡${ganador} la encontró! Era ${carta.nombre}. ${mensaje} ${ganador.split(" ")[0]}, escribe tu pregunta en el chat: tu lectura va de primera. Y si quieres jugar cada día, entra a mi arcana punto com, barra juego.`
    : `Esta vez se escondió muy bien: era ${carta.nombre}. ${mensaje} En un rato escondo otra. Y cada día hay una nueva en mi arcana punto com, barra juego.`;
  const frase = await decir(texto);
  return { clase: "juego-fin" as const, ...frase, carta: { id: carta.id, nombre: carta.nombre }, ganador };
}

/** Quien ganó el último juego (en la última media hora): su pregunta pasa de primera. */
export async function ganadorConPrioridad(admin: Admin) {
  const { data } = await admin.from("en_vivo_estado").select("juego_ganador, juego_ganador_en").eq("id", 1).maybeSingle();
  if (!data?.juego_ganador || !data.juego_ganador_en || Date.now() - Date.parse(data.juego_ganador_en) > 30 * 60_000) return null;
  return data.juego_ganador;
}

/** Ya se leyó su pregunta: se quita la prioridad. */
export async function usarPrioridad(admin: Admin) {
  await admin.from("en_vivo_estado").update({ juego_ganador_en: null }).eq("id", 1);
}
