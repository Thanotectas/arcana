import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto, type ImagenEntrada } from "@/lib/ia";
import { calcularPerfil } from "@/lib/numerologia";
import { horoscopoDelDia } from "@/lib/horoscopo";
import { MAZO } from "@/lib/tarot/deck";
import { SIGNOS, type Signo } from "@/lib/zodiaco";
import { detectarSigno } from "@/lib/redes/sibila-redes";
import { sintetizar, vozConfigurada } from "@/lib/redes/voz";
import { tokenVigente, youtubeConectado } from "@/lib/redes/youtube";

/**
 * «Sibila en vivo»: directos de YouTube donde Sibila lee el tarot a quien
 * escribe en el chat su signo y su pregunta (tarot, aura, numerología u
 * horóscopo) o sube en /vivo la foto de su taza de chocolate o de su mano. OBS transmite la página
 * /en-vivo/escenario (con la clave del panel); esa página pide aquí la
 * siguiente lectura mientras suena la anterior. El servidor lee el chat del
 * directo activo del canal conectado, encola las preguntas, filtra las que no
 * se pueden responder, saca tres cartas, escribe la lectura con Sibila y la
 * narra con su voz. La administración también puede agregar preguntas a mano.
 */
type Admin = SupabaseClient<Database>;
export type PreguntaEnVivo = Database["public"]["Tables"]["en_vivo_preguntas"]["Row"];

/** Tope de lecturas por día (gasto de voz y de IA). EN_VIVO_MAX lo cambia. */
export function maximoDiario() {
  const n = Number(process.env.EN_VIVO_MAX ?? "");
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 80;
}

/** Clave del escenario: derivada de un secreto del servidor, no hay que configurarla. */
export function claveEscenario() {
  const base = process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createHmac("sha256", base).update("arcana-en-vivo").digest("hex").slice(0, 32);
}

export function claveValida(clave: string | null) {
  const esperada = Buffer.from(claveEscenario());
  const recibida = Buffer.from(clave ?? "");
  return recibida.length === esperada.length && timingSafeEqual(recibida, esperada);
}

// ───────────────────────── Chat de YouTube ─────────────────────────

interface MensajeChat {
  id: string;
  snippet?: { type?: string; displayMessage?: string };
  authorDetails?: { displayName?: string; isChatOwner?: boolean };
}

async function api<T>(ruta: string, token: string): Promise<{ ok: boolean; status: number; datos: T & { error?: { message?: string; errors?: { reason?: string }[] } } }> {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${ruta}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const datos = (await res.json().catch(() => ({}))) as T & { error?: { message?: string; errors?: { reason?: string }[] } };
  return { ok: res.ok && !datos.error, status: res.status, datos };
}

/** Un mensaje sirve si parece una consulta: trae un signo, una pregunta o pide aura, numerología u horóscopo. */
export function pareceConsulta(texto: string) {
  const t = texto.trim();
  if (t.length < 8 || t.length > 300) return false;
  return Boolean(detectarSigno(t)) || t.includes("?") || /\baura\b|numerolog|hor[oó]scopo/i.test(t);
}

export interface EstadoChat {
  conectado: boolean;
  directo: boolean;
  nuevas: number;
  detalle?: string;
}

/**
 * Busca el directo activo del canal y trae los mensajes nuevos del chat,
 * respetando el intervalo que pide YouTube. Encola los que parecen consultas.
 */
export async function sincronizarChat(admin: Admin): Promise<EstadoChat> {
  if (!(await youtubeConectado(admin))) return { conectado: false, directo: false, nuevas: 0 };
  const ahora = Date.now();
  const { data: estado } = await admin.from("en_vivo_estado").select("*").eq("id", 1).maybeSingle();
  let chat = estado?.live_chat_id ?? null;
  let pagina = estado?.page_token ?? null;
  if (estado?.proxima_consulta && Date.parse(estado.proxima_consulta) > ahora) return { conectado: true, directo: Boolean(chat), nuevas: 0 };

  const token = await tokenVigente(admin);
  if (!chat) {
    // Buscar el directo activo como mucho cada 30 s.
    if (estado?.buscado_en && ahora - Date.parse(estado.buscado_en) < 30_000) return { conectado: true, directo: false, nuevas: 0 };
    const r = await api<{ items?: { snippet?: { liveChatId?: string } }[] }>("liveBroadcasts?part=snippet&broadcastStatus=active&broadcastType=all&maxResults=5", token);
    chat = r.datos.items?.find((i) => i.snippet?.liveChatId)?.snippet?.liveChatId ?? null;
    pagina = null;
    await admin.from("en_vivo_estado").upsert({ id: 1, live_chat_id: chat, page_token: null, buscado_en: new Date().toISOString(), actualizado_en: new Date().toISOString() }, { onConflict: "id" });
    if (!r.ok) return { conectado: true, directo: false, nuevas: 0, detalle: r.datos.error?.message ?? `YouTube ${r.status}` };
    if (!chat) return { conectado: true, directo: false, nuevas: 0 };
  }

  const q = new URLSearchParams({ liveChatId: chat, part: "snippet,authorDetails", maxResults: "200" });
  if (pagina) q.set("pageToken", pagina);
  const r = await api<{ items?: MensajeChat[]; nextPageToken?: string; pollingIntervalMillis?: number }>(`liveChat/messages?${q}`, token);
  if (!r.ok) {
    // El directo terminó o el chat ya no existe: se vuelve a buscar.
    await admin.from("en_vivo_estado").update({ live_chat_id: null, page_token: null, actualizado_en: new Date().toISOString() }).eq("id", 1);
    return { conectado: true, directo: false, nuevas: 0, detalle: r.datos.error?.message };
  }
  const espera = Math.max(r.datos.pollingIntervalMillis ?? 5000, 4000);
  await admin
    .from("en_vivo_estado")
    .update({ page_token: r.datos.nextPageToken ?? pagina, proxima_consulta: new Date(Date.now() + espera).toISOString(), actualizado_en: new Date().toISOString() })
    .eq("id", 1);

  const filas = (r.datos.items ?? [])
    .filter((m) => m.snippet?.type === "textMessageEvent" && !m.authorDetails?.isChatOwner && pareceConsulta(m.snippet?.displayMessage ?? ""))
    .flatMap((m) => {
      const texto = (m.snippet?.displayMessage ?? "").trim();
      const tipo = tipoDeMensaje(texto);
      return tipo ? [{ mensaje_id: m.id, origen: "chat" as const, tipo, autor: (m.authorDetails?.displayName ?? "Alguien").slice(0, 60), texto, signo: detectarSigno(texto)?.id ?? null }] : [];
    });
  if (!filas.length) return { conectado: true, directo: true, nuevas: 0 };
  const { data } = await admin.from("en_vivo_preguntas").upsert(filas, { onConflict: "mensaje_id", ignoreDuplicates: true }).select("id");
  return { conectado: true, directo: true, nuevas: data?.length ?? 0 };
}

// ───────────────────────── Lecturas ─────────────────────────

export type TipoLectura = PreguntaEnVivo["tipo"];
export const BUCKET_FOTOS = "redes";

/** Qué lectura pide un mensaje del chat; null si necesita foto (taza o mano: van por /vivo). */
export function tipoDeMensaje(texto: string): TipoLectura | null {
  const t = texto.toLowerCase();
  if (/chocolate|taza|pocillo|\bmano\b|palma/.test(t)) return null;
  if (/\baura\b/.test(t)) return "aura";
  if (/numerolog|mi n[uú]mero|\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/.test(t)) return "numerologia";
  if (/hor[oó]scopo/.test(t)) return "horoscopo";
  return "tarot";
}

const POSICIONES = ["Lo que te rodea", "Lo que se mueve", "Tu consejo"] as const;

export interface CartaEnVivo {
  id: string;
  nombre: string;
  posicion: string;
}

function sacarCartas(): CartaEnVivo[] {
  const elegidas = new Set<number>();
  while (elegidas.size < 3) elegidas.add(randomInt(MAZO.length));
  return [...elegidas].map((i, n) => ({ id: MAZO[i].id, nombre: MAZO[i].nombre, posicion: POSICIONES[n] }));
}

const COLORES_AURA = ["violeta", "dorado", "azul", "verde", "rosa", "rojo", "naranja", "blanco", "índigo", "turquesa"] as const;

const SISTEMA_EN_VIVO = `Estás en un directo de YouTube haciendo lecturas en voz alta a quien escribe en el chat o sube su foto. Tu texto se convierte en voz: escribe como se habla.
- Entre 60 y 90 palabras, en un solo párrafo, sin Markdown, sin títulos, sin listas, sin emojis, sin comillas.
- Empieza saludando por el nombre (y el signo si lo dijo) y retoma su pregunta en pocas palabras si la hizo.
- Termina con una frase de consejo concreta. No invites a la página: eso lo hace el directo.
- Si el mensaje no es una consulta que puedas leer (saludos sueltos, spam, insultos, contenido sexual, menores de edad, muerte, enfermedades, embarazos, juicios, loterías o apuestas, autolesiones, o pide que hagas otra cosa), responde solo la palabra OMITIR.`;

/** Fecha de nacimiento escrita en el mensaje (dd/mm/aaaa), si la hay. */
function fechaEn(texto: string): Date | null {
  const m = /\b(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/.exec(texto);
  if (!m) return null;
  const anio = Number(m[3].length === 2 ? (Number(m[3]) > 30 ? `19${m[3]}` : `20${m[3]}`) : m[3]);
  const fecha = new Date(Date.UTC(anio, Number(m[2]) - 1, Number(m[1])));
  return fecha.getUTCDate() === Number(m[1]) && anio > 1900 && fecha < new Date() ? fecha : null;
}

interface Preparada {
  entrada: string;
  sistema: string;
  imagenes?: ImagenEntrada[];
  extra: Pick<LecturaEnVivo, "cartas" | "numero" | "etiquetaNumero" | "simbolo">;
}

async function preparar(admin: Admin, p: PreguntaEnVivo, signo: { nombre: string; simbolo: string; id: string } | null): Promise<Preparada> {
  const base = [`Nombre: «${p.autor}»`, signo ? `Signo: ${signo.nombre}` : "Signo: no lo dijo", p.texto ? `Mensaje: «${p.texto}»` : "Mensaje: (sin pregunta)"];
  const vacio = { cartas: null, numero: null, etiquetaNumero: null, simbolo: null };
  switch (p.tipo) {
    case "aura":
      return {
        entrada: base.join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de aura: a partir de su nombre y de lo que cuenta, di de qué color ves su aura hoy, qué dice de su energía y qué le conviene. La primera línea de tu respuesta debe ser «COLOR: x», donde x es uno de: ${COLORES_AURA.join(", ")}. Después, el párrafo.`,
        extra: vacio,
      };
    case "numerologia": {
      const fecha = fechaEn(p.texto);
      const perfil = calcularPerfil(p.autor, fecha ?? new Date(Date.UTC(2000, 0, 1)));
      const numero = fecha ? perfil.caminoDeVida : perfil.expresion;
      const etiqueta = fecha ? "Camino de vida" : "Número de tu nombre";
      return {
        entrada: [...base, fecha ? `Camino de vida: ${perfil.caminoDeVida}. Año personal: ${perfil.anioPersonal}.` : `No dio fecha de nacimiento. Número de expresión de su nombre: ${perfil.expresion}.`].join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de numerología pitagórica: explica su número (${etiqueta.toLowerCase()}) y lo que anuncia para estos meses.${fecha ? "" : " Al final dile, en una frase, que con su fecha de nacimiento la lectura es más completa."}`,
        extra: { ...vacio, numero, etiquetaNumero: etiqueta },
      };
    }
    case "horoscopo": {
      const texto = signo ? await horoscopoDelDia(signo as Signo).catch(() => "") : "";
      return {
        entrada: [...base, texto ? `Horóscopo de hoy para ${signo?.nombre}: ${texto.slice(0, 1500)}` : ""].join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de horóscopo: resume en voz alta lo que trae el día para su signo y conéctalo con su pregunta. Si no dijo su signo, responde OMITIR.`,
        extra: { ...vacio, simbolo: signo?.simbolo ?? null },
      };
    }
    case "chocolate":
    case "mano": {
      const url = p.imagen ? admin.storage.from(BUCKET_FOTOS).getPublicUrl(p.imagen).data.publicUrl : "";
      const res = url ? await fetch(url, { cache: "no-store" }) : null;
      if (!res?.ok) throw new Error("No se pudo leer la foto.");
      const foto = Buffer.from(await res.arrayBuffer()).toString("base64");
      return {
        entrada: base.join("\n"),
        sistema:
          p.tipo === "chocolate"
            ? `${SISTEMA_EN_VIVO}\nLectura del chocolate: mira la foto del fondo de su taza o pocillo, describe dos o tres figuras que forman los restos y qué anuncian. Si la foto no muestra el fondo de una taza con restos, o muestra personas, responde OMITIR.`
            : `${SISTEMA_EN_VIVO}\nLectura de la mano: mira la palma y lee dos o tres líneas o montes que se vean (corazón, cabeza, vida, destino) y qué anuncian. Nunca hables de salud ni de cuánto vivirá. Si la foto no muestra la palma de una mano, o muestra algo más, responde OMITIR.`,
        imagenes: [{ mediaType: "image/jpeg", base64: foto }],
        extra: vacio,
      };
    }
    default: {
      const cartas = sacarCartas();
      return {
        entrada: [...base, `Cartas (Rider-Waite, al derecho): ${cartas.map((c) => `${c.posicion}: ${c.nombre}`).join("; ")}`].join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de tarot: lee las tres cartas en orden, una frase por carta, conectándolas con su pregunta.`,
        extra: { ...vacio, cartas },
      };
    }
  }
}

export interface LecturaEnVivo {
  id: number;
  tipo: TipoLectura;
  autor: string;
  signo: string | null;
  pregunta: string;
  cartas: CartaEnVivo[] | null;
  /** URL pública de la foto (taza o mano). */
  imagen: string | null;
  color: string | null;
  numero: number | null;
  etiquetaNumero: string | null;
  simbolo: string | null;
  texto: string;
  audio: string | null;
}

/** Borra las fotos ya leídas hace más de 10 minutos (y las que nunca se leyeron en un día). */
async function limpiarFotos(admin: Admin) {
  const { data } = await admin
    .from("en_vivo_preguntas")
    .select("id, imagen")
    .not("imagen", "is", null)
    .or(`and(estado.in.(leida,omitida),leida_en.lt.${new Date(Date.now() - 600_000).toISOString()}),creado_en.lt.${new Date(Date.now() - 86_400_000).toISOString()}`)
    .limit(20);
  const filas = (data ?? []).filter((f) => f.imagen);
  if (!filas.length) return;
  await admin.storage.from(BUCKET_FOTOS).remove(filas.map((f) => f.imagen as string));
  await admin.from("en_vivo_preguntas").update({ imagen: null }).in("id", filas.map((f) => f.id));
}

/** Toma la siguiente consulta de la cola (primero las agregadas a mano, luego fotos y chat) y la lee. */
export async function siguienteLectura(admin: Admin): Promise<LecturaEnVivo | null> {
  const inicioDia = new Date(new Date().toISOString().slice(0, 10) + "T05:00:00Z"); // medianoche de Bogotá
  if (inicioDia.getTime() > Date.now()) inicioDia.setUTCDate(inicioDia.getUTCDate() - 1);
  const { count } = await admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("estado", "leida").gte("leida_en", inicioDia.toISOString());
  if ((count ?? 0) >= maximoDiario()) return null;

  await limpiarFotos(admin).catch(() => null);
  // Lo que quedó «leyendo» por más de 3 minutos (se cayó la página) vuelve a la cola.
  await admin.from("en_vivo_preguntas").update({ estado: "pendiente" }).eq("estado", "leyendo").lt("leida_en", new Date(Date.now() - 180_000).toISOString());

  for (let intento = 0; intento < 4; intento++) {
    // Orden: manual, página (fotos), chat; dentro de cada una, la más antigua.
    const { data: candidatas } = await admin.from("en_vivo_preguntas").select("*").eq("estado", "pendiente").order("origen", { ascending: true }).order("creado_en").limit(1);
    const p = candidatas?.[0];
    if (!p) return null;
    const { data: tomada } = await admin.from("en_vivo_preguntas").update({ estado: "leyendo", leida_en: new Date().toISOString() }).eq("id", p.id).eq("estado", "pendiente").select("id").maybeSingle();
    if (!tomada) continue;

    const signo = p.signo ? SIGNOS.find((s) => s.id === p.signo) ?? null : null;
    try {
      const prep = await preparar(admin, p, signo);
      let texto = (await generarTexto(prep.entrada, prep.sistema, { effort: "low", maxTokens: 500, imagenes: prep.imagenes })).replace(/[#*_>`]/g, "").trim();
      let color: string | null = null;
      const lineaColor = /^COLOR:\s*([^\n]+)\n?/i.exec(texto);
      if (lineaColor) {
        const c = lineaColor[1].trim().toLowerCase();
        color = COLORES_AURA.find((x) => c.startsWith(x)) ?? "violeta";
        texto = texto.slice(lineaColor[0].length).trim();
      }
      if (/^OMITIR\b/i.test(texto) || texto.length < 40) {
        await admin.from("en_vivo_preguntas").update({ estado: "omitida", detalle: "Sibila la omitió" }).eq("id", p.id);
        continue;
      }
      let audio: string | null = null;
      if (vozConfigurada()) {
        try {
          audio = (await sintetizar(texto)).toString("base64");
        } catch (e) {
          console.error("[en vivo] voz:", e instanceof Error ? e.message : e);
        }
      }
      await admin.from("en_vivo_preguntas").update({ estado: "leida", lectura: texto, cartas: prep.extra.cartas, leida_en: new Date().toISOString() }).eq("id", p.id);
      return {
        id: p.id,
        tipo: p.tipo,
        autor: p.autor,
        signo: signo?.nombre ?? null,
        pregunta: p.texto,
        imagen: p.imagen ? admin.storage.from(BUCKET_FOTOS).getPublicUrl(p.imagen).data.publicUrl : null,
        color,
        ...prep.extra,
        texto,
        audio,
      };
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      await admin.from("en_vivo_preguntas").update({ estado: "omitida", detalle: detalle.slice(0, 300) }).eq("id", p.id);
    }
  }
  return null;
}

/** El escenario está transmitiendo si pidió lectura en los últimos 3 minutos. */
export async function escenarioActivo(admin: Admin) {
  const { data } = await admin.from("en_vivo_estado").select("latido_en").eq("id", 1).maybeSingle();
  return Boolean(data?.latido_en && Date.now() - Date.parse(data.latido_en) < 180_000);
}

export async function latido(admin: Admin) {
  await admin.from("en_vivo_estado").upsert({ id: 1, latido_en: new Date().toISOString(), actualizado_en: new Date().toISOString() }, { onConflict: "id" });
}

/** Frases de Sibila entre lecturas (la página las guarda tras oírlas una vez). */
export const PUENTES = [
  "Bienvenidas, bienvenidos. Soy Sibila. Escribe en el chat tu signo y tu pregunta, y saco tres cartas para ti.",
  "Sigo leyendo. Si quieres tu lectura, escribe tu signo y lo que quieres saber: amor, trabajo, un cambio que viene.",
  "Mientras llega la siguiente pregunta, te recuerdo que tu carta del día es gratis, todos los días, en mi arcana punto com.",
  "Las cartas no deciden por ti: te muestran el camino. Escribe tu pregunta en el chat y la miramos juntas.",
  "Si quieres una lectura más profunda, con más cartas y con calma, te espero en mi arcana punto com.",
] as const;

export async function audioPuente(i: number) {
  const texto = PUENTES[((i % PUENTES.length) + PUENTES.length) % PUENTES.length];
  let audio: string | null = null;
  if (vozConfigurada()) {
    try {
      audio = (await sintetizar(texto)).toString("base64");
    } catch (e) {
      console.error("[en vivo] voz puente:", e instanceof Error ? e.message : e);
    }
  }
  return { texto, audio };
}
