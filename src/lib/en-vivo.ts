import "server-only";
import { manual } from "@/lib/conocimiento";
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
import { codigoVigente } from "@/lib/pagos/codigos";
import { PROXIMO_DIRECTO } from "@/lib/marca/directo";
import { TELEGRAM } from "@/lib/marca/redes";
import { createHash } from "node:crypto";
import { PIDE_CARTA, PIDE_SINASTRIA, fechasEn, prepararCarta, prepararCielo, prepararSinastria } from "@/lib/en-vivo-astro";
import { sinFechas } from "@/lib/en-vivo-pedidos";
import type { GraficoVivo } from "@/lib/en-vivo-graficos";
import { ORACULOS_VIVO, oraculoPedido, prepararOraculo, type OraculoVivo } from "@/lib/en-vivo-oraculos";

/**
 * «Sibila en vivo»: directos de YouTube donde Sibila lee el tarot a quien
 * escribe en el chat su signo y su pregunta (tarot, aura, numerología u
 * horóscopo) o sube en /vivo la foto de su taza de chocolate, de su mano o de su limpia con huevo. OBS transmite la página
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

/** Lo mismo en inglés y portugués (Sibila responde en el idioma en que le escriben). */
const PREGUNTA_OTROS_IDIOMAS = /\b(what|when|will i|should i|how (is|will|do|does|can)|tell me|my (love|job|future|life)|love|boyfriend|girlfriend|relationship|job|work|career|money|business|future|family|this (week|month|year)|como (vai|vou|fica|est[aá])|o que|quando|vou|namorad[oa]|relacionamento|trabalho|emprego|dinheiro|neg[oó]cio|fam[ií]lia|essa semana|este m[eê]s)\b/i;

export function pareceConsulta(texto: string) {
  const t = texto.trim();
  if (t.length < 8 || t.length > 300) return false;
  // Una fecha de nacimiento o «mi año» también son consulta (numerología, año personal).
  return (
    Boolean(detectarSigno(t)) || t.includes("?") || /\baura\b|numerolog|hor[oó]scop/i.test(t) || PREGUNTA_SIN_SIGNO.test(t) || PREGUNTA_OTROS_IDIOMAS.test(t) ||
    fechasEn(t).length > 0 || anioQuePide(t) !== null || PIDE_CARTA.test(t) || PIDE_SINASTRIA.test(t) || oraculoPedido(t.toLowerCase()) !== null
  );
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
    const r = await api<{ items?: { snippet?: { liveChatId?: string; actualStartTime?: string } }[] }>("liveBroadcasts?part=snippet&broadcastStatus=active&broadcastType=all&maxResults=5", token);
    // Si quedó otro directo abierto (una prueba anterior), se lee el que empezó más tarde.
    const activos = (r.datos.items ?? []).filter((i) => i.snippet?.liveChatId);
    activos.sort((x, y) => Date.parse(y.snippet?.actualStartTime ?? "") - Date.parse(x.snippet?.actualStartTime ?? "") || 0);
    chat = activos[0]?.snippet?.liveChatId ?? null;
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
  let { data, error } = await admin.from("en_vivo_preguntas").upsert(filas, { onConflict: "mensaje_id", ignoreDuplicates: true }).select("id");
  if (error?.code === "23514") {
    // Sin la migración 0041 no existen los tipos carta y sinastría: se leen como numerología (traen fecha).
    // Sin la 0044, los oráculos nuevos entran como tarot con su marca («[pendulo] …») y se leen igual.
    const viejas = filas.map((f) =>
      f.tipo === "carta" || f.tipo === "sinastria"
        ? { ...f, tipo: "numerologia" as const }
        : esOraculo(f.tipo)
          ? { ...f, tipo: "tarot" as const, texto: `[${f.tipo}] ${f.texto}`.slice(0, 320) }
          : f,
    );
    ({ data, error } = await admin.from("en_vivo_preguntas").upsert(viejas, { onConflict: "mensaje_id", ignoreDuplicates: true }).select("id"));
  }
  if (error) console.error("[en vivo] encolar:", error.message);
  return { conectado: true, directo: true, nuevas: data?.length ?? 0 };
}

// ───────────────────────── Lecturas ─────────────────────────

export type TipoLectura = PreguntaEnVivo["tipo"];
/** Marca de la limpia con huevo guardada como «chocolate» cuando falta la migración 0043. */
export const MARCA_HUEVO = "[huevo] ";
const esOraculo = (tipo: string): tipo is OraculoVivo => (ORACULOS_VIVO as string[]).includes(tipo);
/**
 * La consulta con su tipo verdadero aunque haya entrado con marca: la limpia con
 * huevo guardada como «chocolate» (sin la 0043) o un oráculo guardado como
 * tarot (sin la 0044), con el texto «[pendulo] …».
 */
export function normalizar<T extends { tipo: TipoLectura; texto: string }>(p: T): T {
  const marca = /^\[(huevo|pendulo|iching|runas|lenormand|baraja|chino)\]\s*/.exec(p.texto);
  if (!marca) return p;
  const tipo = marca[1] as TipoLectura;
  const valida = tipo === "huevo" ? p.tipo === "chocolate" : p.tipo === "tarot";
  return valida ? { ...p, tipo, texto: p.texto.slice(marca[0].length).trim() } : p;
}
export const BUCKET_FOTOS = "redes";

/** Qué lectura pide un mensaje del chat; null si necesita foto (taza, mano o huevo: van por /vivo). */
export function tipoDeMensaje(texto: string): TipoLectura | null {
  const t = texto.toLowerCase();
  if (/chocolate|taza|pocillo|\bmano\b|palma|\bpalm\b|\bhand\b|\bcup\b|x[ií]cara|\bm[aã]o\b|\bhuevo|limpia/.test(t)) return null;
  // Péndulo, I Ching, runas, Lenormand, baraja española y horóscopo chino (este puede traer fecha).
  const oraculo = oraculoPedido(t);
  if (oraculo) return oraculo;
  // Carta astral y sinastría se dibujan en pantalla: necesitan la fecha (o las dos fechas).
  const fechas = fechasEn(t).length;
  if (fechas >= 2 && PIDE_SINASTRIA.test(t)) return "sinastria";
  if (fechas >= 1 && PIDE_CARTA.test(t)) return "carta";
  if (/\baura\b/.test(t)) return "aura";
  if (fechas >= 1 || /numerolog|mi n[uú]mero|my number|meu n[uú]mero/.test(t)) return "numerologia";
  if (/hor[oó]scop/.test(t)) return "horoscopo";
  return "tarot";
}

const POSICIONES = ["Lo que te rodea", "Lo que se mueve", "Tu consejo"] as const;

export interface CartaEnVivo {
  id: string;
  nombre: string;
  posicion: string;
  /** Imagen de la pieza cuando no es una carta Rider (runa, Lenormand, baraja española). */
  imagen?: string;
}

function sacarCartas(): CartaEnVivo[] {
  const elegidas = new Set<number>();
  while (elegidas.size < 3) elegidas.add(randomInt(MAZO.length));
  return [...elegidas].map((i, n) => ({ id: MAZO[i].id, nombre: MAZO[i].nombre, posicion: POSICIONES[n] }));
}

const COLORES_AURA = ["violeta", "dorado", "azul", "verde", "rosa", "rojo", "naranja", "blanco", "índigo", "turquesa"] as const;

const SISTEMA_EN_VIVO = `Estás en un directo de YouTube haciendo lecturas en voz alta a quien escribe en el chat o sube su foto. Tu texto se convierte en voz: escribe como se habla.
- Entre 70 y 110 palabras, en un solo párrafo, sin Markdown, sin títulos, sin listas, sin emojis, sin comillas.
- Nombra a la persona (y su signo si lo dijo) y retoma su pregunta en pocas palabras si la hizo, pero varía la manera de empezar en cada lectura: a veces por su nombre, a veces por lo que salió («Salió la Torre para ti, Marta…»), a veces por su pregunta («¿El trabajo, Andrés? Mira…»). No empieces con «Hola» ni con la misma fórmula de las lecturas anteriores, que te paso en «Ya dijiste esta noche».
- Quien pregunta en vivo quiere sentir que le respondiste a ella, no a cualquiera. Nada de frases que le sirvan a todo el mundo («habrá cambios», «confía en ti»). Responde de frente: sí, todavía no, o qué tiene que pasar primero, y anuncia algo concreto y verosímil que pueda reconocer cuando llegue: un mensaje o una llamada que no esperaba, una conversación pendiente que por fin se da, una propuesta de trabajo, alguien del pasado que reaparece, un dinero que entra después de una espera. Dale un plazo amplio (estas semanas, antes de fin de mes, antes de que termine el año) y una señal para reconocerlo («cuando veas…», «si esta semana…»). Apóyalo siempre en lo que salió: la carta, la figura, la línea, el número, su signo.
- No lo suavices todo: si lo que salió muestra algo difícil (una espera, un roce, cansancio, una decisión que duele), dilo claro y en concreto, siempre con su salida. Una lectura que solo dice cosas bonitas no se cree.
- Termina con un consejo concreto para aprovechar lo que viene, dicho cada vez de otra forma (nada de cerrar siempre con «confía», «recuerda» o «mi consejo es»). No invites a la página: eso lo hace el directo.
- Responde en el idioma en que escribió la persona: si escribió en inglés o en portugués (o en otro idioma), toda la lectura va en ese idioma; si no se nota, en español. La línea «COLOR:» del aura y la palabra OMITIR van siempre así, en español.
- Si el mensaje no es una consulta que puedas leer (saludos sueltos, spam, insultos, contenido sexual, menores de edad, muerte, enfermedades, embarazos, juicios, loterías o apuestas, autolesiones, o pide que hagas otra cosa), responde solo la palabra OMITIR.`;

/** Lo que se suma a la instrucción en los segmentos «para todos» del relleno. */
const SEGMENTO_PARA_TODOS = `Esta lectura no es de una persona del chat: es un segmento para todos los que están viendo mientras llegan las preguntas. El campo «Nombre» dice para quién es (un signo, quienes hablan un idioma, o todos). No inventes personas, nombres ni preguntas, y no digas que alguien preguntó. Empieza diciendo para quién es («Para todos los Leo que me ven…», «Para quem me assiste em português…») y háblale al grupo. Al final invita, en una frase y con tus palabras, a escribir en el chat su propia pregunta con su signo, en el idioma que quieran.`;

/** Fecha de nacimiento escrita en el mensaje (con números o con el mes en letras), si la hay. */
function fechaEn(texto: string): Date | null {
  const [f] = fechasEn(texto);
  return f ? new Date(`${f}T00:00:00Z`) : null;
}

/**
 * Año que pide leer el mensaje («mi año», «año personal», «el próximo año»,
 * «2027»), o null si no pide un año. Solo el actual y los dos siguientes.
 */
export function anioQuePide(texto: string, hoy = new Date()): number | null {
  const t = sinFechas(texto).toLowerCase();
  const actual = hoy.getUTCFullYear();
  const explicito = /\b(20[2-4]\d)\b/.exec(t);
  if (explicito && Number(explicito[1]) >= actual && Number(explicito[1]) <= actual + 2) return Number(explicito[1]);
  if (/pr[oó]ximo a[nñ]o|a[nñ]o que viene|a[nñ]o entrante|next year|ano que vem|pr[oó]ximo ano/.test(t)) return actual + 1;
  if (/\b(mi|este|my|this|meu|esse)\s+(a[nñ]o|year)\b|a[nñ]o personal|personal year|ano pessoal/.test(t)) return actual;
  return null;
}

interface Preparada {
  entrada: string;
  sistema: string;
  imagenes?: ImagenEntrada[];
  extra: Pick<LecturaEnVivo, "cartas" | "numero" | "etiquetaNumero" | "simbolo" | "grafico" | "respuesta" | "lineas"> & { imagen?: string };
}

async function preparar(admin: Admin, p: PreguntaEnVivo, signo: { nombre: string; simbolo: string; id: string } | null): Promise<Preparada> {
  const base = [`Nombre: «${p.autor}»`, signo ? `Signo: ${signo.nombre}` : "Signo: no lo dijo", p.texto ? `Mensaje: «${p.texto}»` : "Mensaje: (sin pregunta)"];
  const vacio = { cartas: null, numero: null, etiquetaNumero: null, simbolo: null, grafico: null, respuesta: null, lineas: null };
  switch (p.tipo) {
    case "pendulo":
    case "iching":
    case "runas":
    case "lenormand":
    case "baraja":
    case "chino": {
      const o = prepararOraculo(p.tipo, p.texto);
      return {
        entrada: [...base, o.contexto].join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\n${o.instruccion}`,
        extra: { ...vacio, cartas: o.piezas, respuesta: o.respuesta, lineas: o.lineas, numero: o.numero, etiquetaNumero: o.etiqueta, simbolo: o.simbolo, ...(o.imagen ? { imagen: o.imagen } : {}) },
      };
    }
    case "aura":
      return {
        entrada: base.join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de aura: a partir de su nombre y de lo que cuenta, di de qué color ves su aura hoy, qué dice de su energía y qué le conviene. La primera línea de tu respuesta debe ser «COLOR: x», donde x es uno de: ${COLORES_AURA.join(", ")}. Después, el párrafo.`,
        extra: vacio,
      };
    case "numerologia": {
      const fecha = fechaEn(p.texto);
      const anio = fecha ? anioQuePide(p.texto) : null;
      if (fecha && anio) {
        // Lectura de su año: el año personal del año que pide (de enero a diciembre).
        const perfil = calcularPerfil(p.autor, fecha, new Date(Date.UTC(anio, 5, 1)));
        return {
          entrada: [...base, `Pide la lectura de su año ${anio}. Año personal ${anio}: ${perfil.anioPersonal}. Camino de vida: ${perfil.caminoDeVida}.`].join("\n"),
          sistema: `${SISTEMA_EN_VIVO}\nLectura de su año en numerología pitagórica: su año personal ${anio} es el ${perfil.anioPersonal}. Di qué ciclo abre o cierra ese número, en qué temporada del año se mueve más (amor, trabajo o dinero, según lo que preguntó) y un anuncio concreto para ese año.`,
          extra: { ...vacio, numero: perfil.anioPersonal, etiquetaNumero: `Tu año personal ${anio}` },
        };
      }
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
      // En pantalla se dibuja el cielo de hoy para su signo (los planetas en sus casas).
      const cielo = signo ? prepararCielo(signo as Signo) : null;
      return {
        entrada: [...base, texto ? `Horóscopo de hoy para ${signo?.nombre}: ${texto.slice(0, 1500)}` : "", cielo ? cielo.entrada : ""].join("\n"),
        sistema: `${SISTEMA_EN_VIVO}\nLectura de horóscopo: resume en voz alta lo que trae el día para su signo y conéctalo con su pregunta. En pantalla se está dibujando el cielo de hoy para su signo: nombra dónde está la Luna y otro planeta y en qué área de su vida caen, en palabras sencillas. Si no dijo su signo, responde OMITIR.`,
        extra: { ...vacio, simbolo: signo?.simbolo ?? null, grafico: cielo?.grafico ?? null },
      };
    }
    case "carta": {
      const carta = await prepararCarta(p.autor, p.texto);
      if (!carta) throw new Error("No se pudo leer la fecha de nacimiento.");
      const grafico = carta.grafico.tipo === "carta" ? carta.grafico : null;
      const completa = grafico?.asc != null;
      return {
        entrada: [...base, carta.entrada].join("\n"),
        sistema:
          `${SISTEMA_EN_VIVO}\nLectura de carta astral: en pantalla se está dibujando su carta. Explica su Sol (su esencia), su Luna (cómo siente)` +
          `${completa ? " y su Ascendente (cómo la ven y cómo empieza las cosas)" : ""} y uno de los aspectos más exactos, conectados con su pregunta si hizo una.` +
          `${completa ? "" : " Al final dile, en una frase, que con la hora y la ciudad de nacimiento se ve también el Ascendente."}` +
          " Aquí no hace falta anunciar un suceso con plazo: basta con un rasgo concreto que pueda reconocer y un consejo.",
        extra: { ...vacio, grafico: carta.grafico },
      };
    }
    case "sinastria": {
      const sinastria = prepararSinastria(p.autor, p.texto);
      if (!sinastria) throw new Error("Faltan las dos fechas de nacimiento.");
      return {
        entrada: [...base, sinastria.entrada].join("\n"),
        sistema:
          `${SISTEMA_EN_VIVO}\nLectura de sinastría: en pantalla se dibujan las dos cartas, una dentro de la otra, con los hilos que las unen. ` +
          "Di la afinidad en palabras (puedes nombrar el porcentaje una vez), qué los une (uno o dos contactos armónicos), qué tienen que cuidar (uno tenso) y un consejo para la pareja. " +
          "Habla de «tú» y «la otra persona». Sin horas de nacimiento no hay ascendentes: no los menciones.",
        extra: { ...vacio, grafico: sinastria.grafico },
      };
    }
    case "chocolate":
    case "mano":
    case "huevo": {
      const url = p.imagen ? admin.storage.from(BUCKET_FOTOS).getPublicUrl(p.imagen).data.publicUrl : "";
      const res = url ? await fetch(url, { cache: "no-store" }) : null;
      if (!res?.ok) throw new Error("No se pudo leer la foto.");
      const foto = Buffer.from(await res.arrayBuffer()).toString("base64");
      return {
        entrada: base.join("\n"),
        sistema:
          p.tipo === "huevo"
            ? `${SISTEMA_EN_VIVO}\nLectura de la limpia con huevo: mira la foto del vaso con agua y el huevo abierto. Nombra lo que de verdad se ve (la yema: entera, color, dónde quedó; la clara: hilos, picos, velos, burbujas, nubes, columnas o figuras; el agua: limpia o turbia) y qué se interpreta en la tradición de la limpia, y anuncia algo concreto y en positivo. Nunca hables de «trabajos», brujería, daños, maldiciones, mal de ojo ni envidia, ni de salud, enfermedades, embarazos o muerte; si se ve sangre o algo inquietante, léelo con calma como una carga que salió. Si la foto no muestra un huevo abierto en un vaso o recipiente con agua, o muestra personas, responde OMITIR.`
            : p.tipo === "chocolate"
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
  origen: PreguntaEnVivo["origen"];
  autor: string;
  signo: string | null;
  pregunta: string;
  cartas: CartaEnVivo[] | null;
  /** URL pública de la foto (taza, mano o vaso de la limpia). */
  imagen: string | null;
  color: string | null;
  numero: number | null;
  etiquetaNumero: string | null;
  simbolo: string | null;
  /** Carta astral, cielo del horóscopo o sinastría que el escenario dibuja. */
  grafico: GraficoVivo | null;
  /** Péndulo: la respuesta en grande (SÍ, NO…). */
  respuesta: string | null;
  /** I Ching: las seis líneas, de abajo hacia arriba (1 = yang, 0 = yin). */
  lineas: number[] | null;
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
    // Orden: manual, página (fotos), chat de YouTube y comentarios de Facebook; dentro de
    // cada grupo, la más antigua. En el chat pasa primero quien aún no ha tenido lectura
    // esta noche: quien repite puede seguir preguntando, pero si hay fila espera a los nuevos.
    const { data: lista } = await admin.from("en_vivo_preguntas").select("*").eq("estado", "pendiente").order("creado_en").limit(30);
    if (!lista?.length) return null;
    // Los segmentos «para todos» (origen sistema) solo van cuando no hay nadie más esperando.
    const PRIORIDAD: Record<string, number> = { manual: 0, pagina: 1, chat: 2, facebook: 2, sistema: 9 };
    const candidatas = [...lista].sort((a, b) => (PRIORIDAD[a.origen] ?? 3) - (PRIORIDAD[b.origen] ?? 3));
    const esChat = (origen: string) => origen === "chat" || origen === "facebook";
    const autoresChat = [...new Set(candidatas.filter((c) => esChat(c.origen)).map((c) => c.autor))];
    const { data: yaLeidas } = autoresChat.length
      ? await admin.from("en_vivo_preguntas").select("autor").in("origen", ["chat", "facebook"]).eq("estado", "leida").in("autor", autoresChat).gte("leida_en", inicioDia.toISOString())
      : { data: [] };
    const repiten = new Set((yaLeidas ?? []).map((l) => l.autor));
    const p = candidatas.find((c) => !esChat(c.origen) || !repiten.has(c.autor)) ?? candidatas[0];
    const { data: tomada } = await admin.from("en_vivo_preguntas").update({ estado: "leyendo", leida_en: new Date().toISOString() }).eq("id", p.id).eq("estado", "pendiente").select("id").maybeSingle();
    if (!tomada) continue;

    const signo = p.signo ? SIGNOS.find((s) => s.id === p.signo) ?? null : null;
    try {
      const q = normalizar(p);
      const prep = await preparar(admin, q, signo);
      // Para que no suene automático: cómo empezaron y cerraron las últimas lecturas de la noche.
      const { data: previas } = await admin.from("en_vivo_preguntas").select("lectura").eq("estado", "leida").gte("leida_en", inicioDia.toISOString()).order("leida_en", { ascending: false }).limit(5);
      const yaDijiste = (previas ?? [])
        .map((x) => x.lectura?.trim() ?? "")
        .filter(Boolean)
        .map((l) => `- empezó «${l.split(/\s+/).slice(0, 8).join(" ")}…» y cerró «…${l.split(/\s+/).slice(-8).join(" ")}»`);
      // Cada cuarta lectura de la noche, Sibila invita a suscribirse, con sus palabras (sin pedirlo a cambio de nada).
      const invitar = (count ?? 0) % 4 === 3;
      const entrada = [prep.entrada, yaDijiste.length ? `\nYa dijiste esta noche (no repitas esas aperturas ni esos cierres):\n${yaDijiste.join("\n")}` : ""].join("");
      // Una de cada tres (y no cuando toca invitar a suscribirse) deja una puerta abierta que despierte curiosidad.
      const gancho = !invitar && Math.random() < 0.33;
      const paraTodos = p.origen === "sistema" ? `\n${SEGMENTO_PARA_TODOS}` : "";
      const sistema = paraTodos
        ? `${prep.sistema}${paraTodos}`
        : invitar
        ? `${prep.sistema}\nEsta vez, después del consejo, invita en una frase corta y con tus palabras a seguir la cuenta y activar las notificaciones para el próximo directo.`
        : gancho
          ? `${prep.sistema}\nEsta vez, antes del consejo, deja una puerta abierta: menciona en una frase que hay algo más que se ve en su lectura (una fecha, una persona, una decisión, algo bueno en camino) y que con su lectura completa se ve con calma. Que despierte curiosidad, nunca miedo, y sin decir direcciones de páginas.`
          : prep.sistema;
      let texto = (await generarTexto(entrada, sistema, { effort: "low", maxTokens: 500, idioma: "auto", imagenes: prep.imagenes, ...(q.tipo === "huevo" ? { conocimiento: manual("huevo") } : q.tipo === "chocolate" ? { conocimiento: manual("taza") } : q.tipo === "mano" ? { conocimiento: manual("mano") } : {}) })).replace(/[#*_>`]/g, "").trim();
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
        tipo: q.tipo,
        origen: p.origen,
        autor: p.autor,
        signo: signo?.nombre ?? null,
        pregunta: q.texto,
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

// ───────────────────────── Relleno: segmentos «para todos» ─────────────────────────

/** Cuántos segmentos «para todos» puede haber en una noche (EN_VIVO_RELLENO_MAX, 24 por omisión; 0 los apaga). */
export function maximoRelleno() {
  const n = Number(process.env.EN_VIVO_RELLENO_MAX ?? 24);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 24;
}

interface Segmento {
  tipo: TipoLectura;
  autor: string;
  texto: string;
  signo: string | null;
}

/**
 * El segmento número n de la noche. Rotan oráculos, signos e idiomas para que
 * quien llega vea de todo: tarot para un signo, péndulo, una tirada en
 * portugués, I Ching, horóscopo de un signo, runas, inglés, Lenormand, baraja
 * española, francés y el año chino que viene. No simula espectadores: Sibila
 * dice para quién es y pide que escriban su propia pregunta.
 */
export function segmentoDeRelleno(n: number, hoy = new Date()): Segmento {
  const dia = Math.floor(hoy.getTime() / 86_400_000);
  const signo = SIGNOS[(dia * 5 + n * 7) % SIGNOS.length];
  const paraSigno = `Para todos los ${signo.nombre} ${signo.simbolo}`;
  const preguntaPendulo = [
    "Péndulo para todos los que están viendo: ¿llega una buena noticia antes de fin de mes?",
    "Péndulo para todos: ¿es buen momento para empezar lo que venimos aplazando?",
    "Péndulo para todos: ¿alguien del pasado vuelve a aparecer estas semanas?",
  ][Math.floor(n / 11) % 3];
  const proximoAnio = hoy.getUTCFullYear() + (hoy.getUTCMonth() >= 9 ? 1 : 0);
  const segmentos: Segmento[] = [
    { tipo: "tarot", autor: paraSigno, texto: `Tirada para ${signo.nombre}: ¿qué les traen estas semanas en el amor y en el trabajo?`, signo: signo.id },
    { tipo: "pendulo", autor: "Para todos", texto: preguntaPendulo, signo: null },
    { tipo: "tarot", autor: "Para quem fala português", texto: "Uma tiragem para todos que estão assistindo em português: o que vem nestas semanas no amor e no trabalho?", signo: null },
    { tipo: "iching", autor: "Para todos", texto: "I Ching para todos los que están viendo: ¿qué consejo trae esta semana?", signo: null },
    { tipo: "horoscopo", autor: paraSigno, texto: `Horóscopo de hoy para ${signo.nombre}`, signo: signo.id },
    { tipo: "runas", autor: "Para todos", texto: "Runas para todos los que están viendo: ¿qué fue, qué es y qué viene antes de fin de mes?", signo: null },
    { tipo: "tarot", autor: "For everyone watching in English", texto: "A reading for everyone watching in English: what do the coming weeks bring for love and work?", signo: null },
    { tipo: "lenormand", autor: "Para todos", texto: "Lenormand para todos: ¿qué se mueve esta semana?", signo: null },
    { tipo: "baraja", autor: "Para todos", texto: "Baraja española para todos los que están viendo: ¿qué pasó, qué pasa y qué viene?", signo: null },
    { tipo: "tarot", autor: "Pour tous ceux qui regardent en français", texto: "Un tirage pour tous ceux qui regardent en français : que réservent les prochaines semaines en amour et au travail ?", signo: null },
    { tipo: "chino", autor: "Para todos", texto: `Horóscopo chino: ¿qué trae el año ${proximoAnio} para todos?`, signo: null },
  ];
  return segmentos[n % segmentos.length];
}

/**
 * Cuando nadie pregunta, Sibila hace un segmento «para todos» en vez de
 * quedarse callada: si no hay consultas esperando, encola el siguiente
 * segmento (origen «sistema») y lo lee. Cuenta para el máximo diario y tiene
 * su propio tope por noche. Sin la migración 0044 no hay origen «sistema» y
 * simplemente no hace nada (el escenario sigue con sus frases).
 */
export async function lecturaDeRelleno(admin: Admin): Promise<LecturaEnVivo | null> {
  const maximo = maximoRelleno();
  if (!maximo) return null;
  const { count: esperando } = await admin.from("en_vivo_preguntas").select("id", { count: "exact", head: true }).in("estado", ["pendiente", "leyendo"]);
  if (esperando) return siguienteLectura(admin);
  const { count: hechos } = await admin
    .from("en_vivo_preguntas")
    .select("id", { count: "exact", head: true })
    .eq("origen", "sistema")
    .gte("creado_en", new Date(Date.now() - 6 * 3_600_000).toISOString());
  if ((hechos ?? 0) >= maximo) return null;
  const seg = segmentoDeRelleno(hechos ?? 0);
  const { error } = await admin.from("en_vivo_preguntas").insert({ origen: "sistema", ...seg });
  if (error) {
    console.error("[en vivo] relleno:", error.message);
    return null;
  }
  return siguienteLectura(admin);
}

/** El escenario está transmitiendo si pidió lectura en los últimos 3 minutos. */
export async function escenarioActivo(admin: Admin) {
  const { data } = await admin.from("en_vivo_estado").select("latido_en").eq("id", 1).maybeSingle();
  return Boolean(data?.latido_en && Date.now() - Date.parse(data.latido_en) < 180_000);
}

export async function latido(admin: Admin) {
  await admin.from("en_vivo_estado").upsert({ id: 1, latido_en: new Date().toISOString(), actualizado_en: new Date().toISOString() }, { onConflict: "id" });
}

/** Un código que es una palabra (SIBILA) se dice como palabra; uno con números o largo se deletrea. */
function codigoDicho(codigo: string) {
  return /^[A-Z]{3,8}$/.test(codigo) ? codigo.charAt(0) + codigo.slice(1).toLowerCase() : codigo.toLowerCase().split("").join(" ");
}

/** Cuántas frases de espera hay: el escenario las recorre en orden (EscenarioEnVivo usa el mismo número). */
export const FRASES_PUENTE = 14;

/**
 * Frases de Sibila entre lecturas (la página las guarda tras oírlas una vez y
 * el audio queda guardado en Storage, así recargar el escenario no gasta voz).
 * Impulsan sobre todo la carta astral y la sinastría (la mitad de las frases,
 * cada una con otro ángulo), recuerdan que la persona elige qué lectura pedir,
 * invitan a suscribirse y, si hay un código de oferta vigente, dicen cómo usarlo.
 */
export function frasesPuente(codigo: { codigo: string; creditos_extra: number } | null) {
  const oferta = codigo
    ? `Y esta noche hay regalo: con el código ${codigoDicho(codigo.codigo)}, en mi arcana punto com, cualquier paquete que compres trae ${codigo.creditos_extra} créditos más.`
    : "";
  const telegram = TELEGRAM.activo ? " Y si quieres tu carta cada mañana, búscame en Telegram: Mi Arcana Bot." : "";
  // La mitad impulsa la carta astral y la sinastría, cada una con otro ángulo para que no suene repetida.
  const frases = [
    "Bienvenidas, bienvenidos. Soy Sibila. Esta noche tú eliges: tu carta astral dibujada en vivo, tu sinastría con alguien especial, o una pregunta para las cartas. Escríbelo en el chat.",
    "¿Quieres ver tu carta astral dibujada aquí, planeta por planeta? Escribe carta astral, tu fecha de nacimiento, la hora y la ciudad donde naciste.",
    "¿Vienes con alguien en el corazón? Escribe sinastría y las dos fechas de nacimiento, la tuya y la de esa persona, y dibujo sus dos cielos juntos, con los hilos que los unen.",
    `Mientras llega la siguiente pregunta: tu carta del día es gratis, todos los días, en mi arcana punto com. Y allí también te espera tu carta astral completa, explicada casa por casa. ${oferta}`.trim(),
    "No necesitas saber nada de astrología: solo tu fecha, tu hora y tu ciudad. Escribe carta astral y mira cómo aparece tu cielo en la pantalla.",
    `Si te gusta este espacio, sígueme y activa las notificaciones: así te aviso cada vez que vuelva a leer en vivo. Y para seguir aprendiendo durante la semana, únete a nuestro grupo de Facebook, Carta Astral y Tarot en Español: mi arcana punto com, barra, grupo.${telegram}`,
    "¿Son compatibles? La sinastría lo muestra: emoción, pasión, comunicación y estabilidad. Escribe sinastría con tu fecha y la de esa persona.",
    "Si no sabes tu hora de nacimiento, igual funciona: escribe carta astral con tu fecha y tu ciudad, y te muestro tu Sol, tu Luna y tus planetas.",
    "También puedes escoger otra cosa: tarot con tu pregunta, aura para ver tu color, horóscopo con tu signo, o mi año con tu fecha. Y si te hiciste una limpia con huevo, o quieres que mire tu taza o tu mano, entra a mi arcana punto com, barra, vivo, y sube la foto: yo la leo aquí, en vivo.",
    `Si quieres una lectura más profunda, con calma y por escrito, te espero en mi arcana punto com: al crear tu cuenta, tu primera lectura completa es gratis. ${oferta}`.trim(),
    "¿Tu pareja, tu crush, tu mejor amiga? Escribe sinastría y las dos fechas, y vemos qué dice el cielo de los dos.",
    "Voy leyendo en orden, y primero a quien todavía no ha tenido su lectura esta noche. Escribe carta astral, sinastría o tu pregunta, que ya te llega el turno.",
    "¿Una pregunta de sí o no? Escribe péndulo y tu pregunta. Y si quieres un consejo más hondo, escribe I Ching, runas o baraja española. Escríbeme en tu idioma: español, português, English, français… yo te leo en el tuyo.",
    "Para seguirme durante la semana: en Instagram soy miarcana punto oficial, y en TikTok, miarcana cuatro. Allí subo la carta del día, los rituales y los avisos del próximo directo.",
  ];
  return frases.slice(0, FRASES_PUENTE);
}

/** Voz de una frase guardada en Storage por su texto: solo se sintetiza la primera vez. */
async function vozGuardada(admin: Admin, texto: string): Promise<string | null> {
  const ruta = `en-vivo/puentes/${createHash("sha256").update(texto).digest("hex").slice(0, 24)}.mp3`;
  const guardado = await admin.storage.from(BUCKET_FOTOS).download(ruta).catch(() => null);
  if (guardado?.data) return Buffer.from(await guardado.data.arrayBuffer()).toString("base64");
  if (!vozConfigurada()) return null;
  try {
    const audio = await sintetizar(texto);
    await admin.storage.from(BUCKET_FOTOS).upload(ruta, audio, { contentType: "audio/mpeg", upsert: true }).catch(() => null);
    return audio.toString("base64");
  } catch (e) {
    console.error("[en vivo] voz puente:", e instanceof Error ? e.message : e);
    return null;
  }
}

export async function audioPuente(admin: Admin, i: number) {
  const codigo = await codigoVigente(admin).catch(() => null);
  const frases = frasesPuente(codigo ? { codigo: codigo.codigo, creditos_extra: codigo.creditos_extra } : null);
  const texto = frases[((i % frases.length) + frases.length) % frases.length];
  return { texto, audio: await vozGuardada(admin, texto) };
}

// ───────────────────────── Cierre del directo ─────────────────────────

/**
 * Frases que Sibila sigue diciendo después de la despedida, mientras la
 * transmisión siga al aire, para que no quede en silencio hasta que se corte.
 * La voz queda guardada en Storage como las frases de espera.
 */
export function frasesCierre() {
  return [
    "La lectura en vivo de esta noche terminó, pero no te vayas sin tu carta del día: es gratis, todos los días, en mi arcana punto com.",
    "El próximo domingo vuelvo a leer en vivo. Sígueme y activa las notificaciones, para que te avise cuando empiece.",
    "Durante la semana nos vemos en el grupo de Facebook, Carta Astral y Tarot en Español: mi arcana punto com, barra, grupo.",
    "En Instagram soy miarcana punto oficial, y en TikTok, miarcana cuatro. Allí está la carta del día y los rituales de la semana.",
    "Si te quedó una pregunta, hazla con calma en mi arcana punto com: allí también te espera tu carta astral completa y tu sinastría.",
  ];
}

export async function audioCierre(admin: Admin, i: number) {
  const frases = frasesCierre();
  const texto = frases[((i % frases.length) + frases.length) % frases.length];
  return { texto, audio: await vozGuardada(admin, texto) };
}

/** Una hora de cierre o una despedida solo cuentan durante tres horas (no afectan otro directo). */
const VENTANA_CIERRE = 3 * 3_600_000;

/** Hora a la que Sibila se despide: la puesta en /admin/en-vivo o, si no, tres minutos antes del fin del próximo directo. */
/** ¿El presentador pidió silencio? (sin la migración 0045 nunca hay pausa). */
export async function enPausa(admin: Admin): Promise<boolean> {
  const { data, error } = await admin.from("en_vivo_estado").select("pausa_hasta").eq("id", 1).maybeSingle();
  if (error || !data?.pausa_hasta) return false;
  return Date.parse(data.pausa_hasta) > Date.now();
}

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
    "Si te gustó, sígueme y activa las notificaciones, para que te avise del próximo directo. Y durante la semana te espero en nuestro grupo de Facebook: mi arcana punto com, barra, grupo.",
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
