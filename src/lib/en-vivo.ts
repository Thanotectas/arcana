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
import { PAQUETE_PRUEBA, PAQUETES } from "@/lib/creditos";
import { codigoVigente } from "@/lib/pagos/codigos";
import { PROXIMO_DIRECTO } from "@/lib/marca/directo";
import { TELEGRAM } from "@/lib/marca/redes";

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

/**
 * Un mensaje sirve si parece una consulta: trae un signo, una pregunta (con o
 * sin «?», que en el celular casi nadie escribe), un tema típico o pide aura,
 * numerología u horóscopo. Un saludo suelto («hola a todos») no cuenta.
 */
const PREGUNTA_SIN_SIGNO = /\b((c[oó]mo|qu[eé])\s+(me|te|le|nos|voy|vamos|va|van|est[aá]|ser[aá]|viene|sigue|ves|hago|pasa|dice|dicen|pinta)|cu[aá]ndo|d[oó]nde|por\s?qu[eé]|ser[aá]|voy a|va a|me ves|me va|amor|pareja|novi[oa]|trabajo|empleo|negocio|dinero|plata|examen|viaje|futuro|salud|familia|este mes|este a[nñ]o|esta semana)\b/i;

export function pareceConsulta(texto: string) {
  const t = texto.trim();
  if (t.length < 8 || t.length > 300) return false;
  return Boolean(detectarSigno(t)) || t.includes("?") || /\baura\b|numerolog|hor[oó]scopo/i.test(t) || PREGUNTA_SIN_SIGNO.test(t);
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

  // Una sola consulta por persona: sus mensajes del lote se juntan («soy Sagitario» +
  // «¿cómo me ves en el amor?») y, si ya tiene una esperando turno, se le suman.
  const porAutor = new Map<string, { mensaje_id: string; autor: string; textos: string[] }>();
  for (const m of r.datos.items ?? []) {
    const texto = (m.snippet?.displayMessage ?? "").trim();
    if (m.snippet?.type !== "textMessageEvent" || m.authorDetails?.isChatOwner || !pareceConsulta(texto)) continue;
    const autor = (m.authorDetails?.displayName ?? "Alguien").slice(0, 60);
    const grupo = porAutor.get(autor);
    if (grupo) grupo.textos.push(texto);
    else porAutor.set(autor, { mensaje_id: m.id, autor, textos: [texto] });
  }
  if (!porAutor.size) return { conectado: true, directo: true, nuevas: 0 };

  // Lo que cada persona ya preguntó esta noche: su consulta pendiente y el signo que dijo.
  const { data: previas } = await admin
    .from("en_vivo_preguntas")
    .select("id, autor, texto, signo, estado")
    .eq("origen", "chat")
    .in("autor", [...porAutor.keys()])
    .gte("creado_en", new Date(ahora - 6 * 3_600_000).toISOString())
    .order("creado_en", { ascending: false });
  const filas = [];
  let sumadas = 0;
  for (const g of porAutor.values()) {
    const suyas = (previas ?? []).filter((p) => p.autor === g.autor);
    const texto = g.textos.join(" · ").slice(0, 300);
    const signo = detectarSigno(texto)?.id ?? suyas.find((p) => p.signo)?.signo ?? null;
    const pendiente = suyas.find((p) => p.estado === "pendiente");
    if (pendiente) {
      const unido = `${pendiente.texto} · ${texto}`.slice(0, 300);
      const tipo = tipoDeMensaje(unido);
      if (!tipo) continue;
      const { data: hecho } = await admin.from("en_vivo_preguntas").update({ texto: unido, tipo, signo: pendiente.signo ?? signo }).eq("id", pendiente.id).eq("estado", "pendiente").select("id");
      if (hecho?.length) {
        sumadas++;
        continue;
      }
    }
    const tipo = tipoDeMensaje(texto);
    if (tipo) filas.push({ mensaje_id: g.mensaje_id, origen: "chat" as const, tipo, autor: g.autor, texto, signo });
  }
  if (!filas.length) return { conectado: true, directo: true, nuevas: 0, ...(sumadas ? { detalle: `${sumadas} mensaje(s) sumados a consultas en espera` } : {}) };
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
- Entre 70 y 110 palabras, en un solo párrafo, sin Markdown, sin títulos, sin listas, sin emojis, sin comillas.
- Empieza saludando por el nombre (y el signo si lo dijo) y retoma su pregunta en pocas palabras si la hizo.
- Quien pregunta en vivo quiere sentir que le respondiste a ella, no a cualquiera. Nada de frases que le sirvan a todo el mundo («habrá cambios», «confía en ti»). Responde de frente: sí, todavía no, o qué tiene que pasar primero, y anuncia algo concreto y verosímil que pueda reconocer cuando llegue: un mensaje o una llamada que no esperaba, una conversación pendiente que por fin se da, una propuesta de trabajo, alguien del pasado que reaparece, un dinero que entra después de una espera. Dale un plazo amplio (estas semanas, antes de fin de mes, antes de que termine el año) y una señal para reconocerlo («cuando veas…», «si esta semana…»). Apóyalo siempre en lo que salió: la carta, la figura, la línea, el número, su signo.
- Termina con una frase de consejo concreta para aprovechar lo que viene. No invites a la página: eso lo hace el directo.
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
        sistema: `${SISTEMA_EN_VIVO}\nLectura de tarot: lee las tres cartas en orden, una frase corta por carta conectada con su pregunta, y dedica el resto a la respuesta y al anuncio concreto que sale de las tres juntas.`,
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
    // Orden: manual, página (fotos), chat; dentro de cada una, la más antigua. En el
    // chat pasa primero quien aún no ha tenido lectura esta noche: quien repite
    // puede seguir preguntando, pero si hay fila espera a que se atienda a los nuevos.
    const { data: candidatas } = await admin.from("en_vivo_preguntas").select("*").eq("estado", "pendiente").order("origen", { ascending: true }).order("creado_en").limit(30);
    if (!candidatas?.length) return null;
    const autoresChat = [...new Set(candidatas.filter((c) => c.origen === "chat").map((c) => c.autor))];
    const { data: yaLeidas } = autoresChat.length
      ? await admin.from("en_vivo_preguntas").select("autor").eq("origen", "chat").eq("estado", "leida").in("autor", autoresChat).gte("leida_en", inicioDia.toISOString())
      : { data: [] };
    const repiten = new Set((yaLeidas ?? []).map((l) => l.autor));
    const p = candidatas.find((c) => c.origen !== "chat" || !repiten.has(c.autor)) ?? candidatas[0];
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
      // Cada cuarta lectura de la noche, Sibila invita a suscribirse (sin pedirlo a cambio de nada).
      if ((count ?? 0) % 4 === 3) texto += ` ${INVITACION_SUSCRIBIRSE}`;
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

/** Precio dicho en voz alta: «mil novecientos pesos» se lee bien; «$ 1.900» no. */
function precioHablado(pesos: number) {
  const miles = Math.floor(pesos / 1000);
  const resto = pesos % 1000;
  const unidades = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
  const centenas: Record<number, string> = { 900: "novecientos", 800: "ochocientos", 700: "setecientos", 600: "seiscientos", 500: "quinientos", 400: "cuatrocientos", 300: "trescientos", 200: "doscientos", 100: "cien" };
  const m = miles === 0 ? "" : miles === 1 ? "mil" : miles <= 20 ? `${unidades[miles]} mil` : `${miles} mil`;
  return `${m}${resto ? ` ${centenas[resto] ?? resto}` : ""} pesos`.trim();
}

/** Un código que es una palabra (SIBILA) se dice como palabra; uno con números o largo se deletrea. */
function codigoDicho(codigo: string) {
  return /^[A-Z]{3,8}$/.test(codigo) ? codigo.charAt(0) + codigo.slice(1).toLowerCase() : codigo.toLowerCase().split("").join(" ");
}

/** Invitación a suscribirse que Sibila agrega a algunas lecturas y dice al despedirse. */
const INVITACION_SUSCRIBIRSE = "Y si esta lectura te habló, suscríbete al canal y activa la campanita: así te aviso del próximo directo.";

/**
 * Frases de Sibila entre lecturas (la página las guarda tras oírlas una vez).
 * Incluyen el precio de la tirada de prueba, la invitación a suscribirse y, si
 * hay un código de oferta vigente, cómo usarlo.
 */
export function frasesPuente(codigo: { codigo: string; creditos_extra: number } | null) {
  const prueba = precioHablado(PAQUETE_PRUEBA.precioCOP);
  const paquete = PAQUETES[0];
  const oferta = codigo
    ? `Y esta noche hay regalo: con el código ${codigoDicho(codigo.codigo)}, en mi arcana punto com, cualquier paquete que compres trae ${codigo.creditos_extra} créditos más.`
    : "";
  const telegram = TELEGRAM.activo ? " Y si quieres tu carta cada mañana, búscame en Telegram: Mi Arcana Bot." : "";
  return [
    "Bienvenidas, bienvenidos. Soy Sibila. Escribe en el chat tu signo y tu pregunta, y saco tres cartas para ti.",
    "Sigo leyendo. Si quieres tu lectura, escribe tu signo y lo que quieres saber: amor, trabajo, un cambio que viene.",
    `Mientras llega la siguiente pregunta: tu carta del día es gratis, todos los días, en mi arcana punto com. Y una tirada completa de tres cartas, con calma y por escrito, cuesta ${prueba}. ${oferta}`.trim(),
    "Las cartas no deciden por ti: te muestran el camino. Escribe tu pregunta en el chat y la miramos juntas.",
    `Si te gusta este espacio, suscríbete al canal y activa la campanita: así te aviso cada vez que vuelva a leer en vivo.${telegram}`,
    `Si quieres una lectura más profunda, con más cartas y con calma, te espero en mi arcana punto com: ${paquete.creditos} lecturas por ${precioHablado(paquete.precioCOP)}. ${oferta}`.trim(),
  ];
}

export async function audioPuente(admin: Admin, i: number) {
  const codigo = await codigoVigente(admin).catch(() => null);
  const frases = frasesPuente(codigo ? { codigo: codigo.codigo, creditos_extra: codigo.creditos_extra } : null);
  const texto = frases[((i % frases.length) + frases.length) % frases.length];
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

// ───────────────────────── Cierre del directo ─────────────────────────

/** Una hora de cierre o una despedida solo cuentan durante tres horas (no afectan otro directo). */
const VENTANA_CIERRE = 3 * 3_600_000;

/** Hora a la que Sibila se despide: la puesta en /admin/en-vivo o, si no, tres minutos antes del fin del próximo directo. */
export function horaCierre(estado: { cierre_en?: string | null } | null, ahora = Date.now()): number {
  const manual = estado?.cierre_en ? Date.parse(estado.cierre_en) : NaN;
  if (Number.isFinite(manual) && ahora - manual < VENTANA_CIERRE) return manual;
  return Date.parse(PROXIMO_DIRECTO.fin) - 3 * 60_000;
}

/** Hora de la despedida de esta noche, si ya ocurrió (null si no, o si fue hace más de tres horas). */
export function despedidaReciente(estado: { despedida_en?: string | null } | null, ahora = Date.now()): string | null {
  const d = estado?.despedida_en ? Date.parse(estado.despedida_en) : NaN;
  return Number.isFinite(d) && ahora - d < VENTANA_CIERRE ? (estado?.despedida_en ?? null) : null;
}

/** «abierto» mientras haya directo, «despedirse» cuando llega la hora y «terminado» después de la despedida. */
export async function estadoCierre(admin: Admin): Promise<"abierto" | "despedirse" | "terminado"> {
  const { data } = await admin.from("en_vivo_estado").select("*").eq("id", 1).maybeSingle();
  const ahora = Date.now();
  if (despedidaReciente(data, ahora)) return "terminado";
  const cierre = horaCierre(data, ahora);
  return ahora >= cierre && ahora - cierre < VENTANA_CIERRE ? "despedirse" : "abierto";
}

/**
 * Despedida de Sibila: cuántas consultas leyó esta noche, a dónde ir quien no
 * alcanzó, el código si sigue vigente y la invitación a suscribirse. Marca la
 * despedida para que el escenario no la repita si se recarga.
 */
export async function despedida(admin: Admin) {
  await admin.from("en_vivo_estado").update({ despedida_en: new Date().toISOString() }).eq("id", 1);
  const desde = new Date(Date.now() - 6 * 3_600_000).toISOString();
  const [{ count: leidas }, { count: pendientes }, codigo] = await Promise.all([
    admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).eq("estado", "leida").gte("leida_en", desde),
    admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).in("estado", ["pendiente", "leyendo"]),
    codigoVigente(admin).catch(() => null),
  ]);
  const partes = [
    `Se nos acabó el tiempo por esta noche. Gracias por acompañarme${leidas ? `: hoy leímos ${leidas} ${leidas === 1 ? "consulta" : "consultas"}` : ""}.`,
    pendientes
      ? "A quienes no alcancé a leer, gracias por la paciencia: tu pregunta merece calma. Hazla en mi arcana punto com, donde tu carta del día es gratis, todos los días."
      : "Recuerda que tu carta del día es gratis, todos los días, en mi arcana punto com.",
    codigo ? `Y el código ${codigoDicho(codigo.codigo)} sigue valiendo esta noche: cualquier paquete trae ${codigo.creditos_extra} créditos más.` : "",
    "Si te gustó, suscríbete al canal y activa la campanita, para que te avise del próximo directo.",
    "Que las cartas te sean favorables. Buenas noches.",
  ];
  const texto = partes.filter(Boolean).join(" ");
  let audio: string | null = null;
  if (vozConfigurada()) {
    try {
      audio = (await sintetizar(texto)).toString("base64");
    } catch (e) {
      console.error("[en vivo] voz despedida:", e instanceof Error ? e.message : e);
    }
  }
  return { texto, audio };
}
