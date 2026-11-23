import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { IDIOMA_PARA_IA, type Idioma } from "@/lib/i18n/idiomas";
import { sintetizar, vozConfigurada } from "@/lib/redes/voz";
import { BUCKET_FOTOS, escenarioActivo, idiomaDeTexto } from "@/lib/en-vivo";

/**
 * «Sala de Sibila» (miarcana.com/en-vivo): lo que el escenario principal publica en en_vivo_espejo, servido a la
 * página pública en el idioma de cada persona. Cada paso (seq) se traduce y se narra con la voz de Sibila una sola
 * vez por idioma, la primera vez que alguien lo pide; quien llega después recibe lo guardado.
 */
type Admin = SupabaseClient<Database>;

export interface CartaSala {
  id: string;
  nombre: string;
  posicion: string;
  imagen?: string;
}

/** Lo que ve y oye la sala. Nunca lleva el audio en base64: va como dirección del archivo. */
export type EventoSala =
  | { t: "lectura"; id: number; tipo: string; autor: string; signo: string | null; pregunta: string; cartas: CartaSala[] | null; imagen: string | null; respuesta: string | null; numero: number | null; etiquetaNumero: string | null; texto: string; audio: string | null }
  | { t: "frase"; texto: string; audio: string | null; cierre: string }
  | { t: "pausa"; on: boolean }
  | { t: "cierre"; estado: string };

export interface EstadoSala {
  seq: number;
  activo: boolean;
  /** El paso actual ya en el idioma pedido; null si aún no hay nada o si es viejo. */
  evento: EventoSala | null;
  /** Se está traduciendo: volver a pedir en un momento. */
  pendiente?: boolean;
}

/** Un paso de hace más de 4 minutos ya no se muestra al que llega (el escenario quedó quieto o se cerró). */
const VIGENCIA_MS = 240_000;
/** Si quien empezó a traducir no terminó en 90 s (se cayó), otro lo vuelve a intentar. */
const TRADUCCION_MS = 90_000;

type EventoOriginal = {
  t?: string;
  on?: boolean;
  estado?: string;
  texto?: string;
  audio?: string | null;
  cierre?: string;
  lectura?: {
    id: number;
    tipo: string;
    autor: string;
    signo: string | null;
    pregunta: string;
    cartas: CartaSala[] | null;
    imagen: string | null;
    respuesta?: string | null;
    numero?: number | null;
    etiquetaNumero?: string | null;
    texto: string;
    audio: string | null;
  };
};

/** El idioma en que está escrito el texto: es, en, pt, fr o tr (lo que reconoce el directo). */
function idiomaOrigen(texto: string): string {
  return idiomaDeTexto(texto)?.codigo ?? "es";
}

/** Traduce el texto hablado (y los nombres de las cartas) al idioma pedido, con la voz de Sibila. */
async function traducir(texto: string, cartas: CartaSala[] | null, idioma: Idioma): Promise<{ texto: string; cartas: CartaSala[] | null }> {
  const entrada = JSON.stringify({ texto, cartas: cartas?.map((c) => ({ nombre: c.nombre, posicion: c.posicion })) ?? [] });
  const sistema = `Eres la traductora de Sibila en un directo. Traduce al ${IDIOMA_PARA_IA[idioma]} lo que Sibila acaba de decir, con su misma voz cálida, cercana y hablada: es un texto que se va a leer en voz alta. No agregues, no quites ni expliques nada; conserva los nombres propios de las personas. Los nombres de cartas del tarot, signos y planetas van con su nombre tradicional en ese idioma. Responde SOLO con un JSON con la misma forma que recibes: {"texto": "...", "cartas": [{"nombre": "...", "posicion": "..."}]}.`;
  const salida = await generarTexto(entrada, sistema, { effort: "low", maxTokens: 1200, idioma });
  const json = /\{[\s\S]*\}/.exec(salida)?.[0];
  if (!json) throw new Error("La traducción no llegó en JSON.");
  const r = JSON.parse(json) as { texto?: string; cartas?: { nombre?: string; posicion?: string }[] };
  if (!r.texto || r.texto.length < 10) throw new Error("La traducción llegó vacía.");
  return {
    texto: r.texto.replace(/[#*_>`]/g, "").trim(),
    cartas: cartas?.map((c, i) => ({ ...c, nombre: r.cartas?.[i]?.nombre?.trim() || c.nombre, posicion: r.cartas?.[i]?.posicion?.trim() || c.posicion })) ?? null,
  };
}

/** Sube el audio al bucket público y devuelve su dirección. */
async function subirAudio(admin: Admin, seq: number, idioma: Idioma, audio: Buffer) {
  const ruta = `en-vivo/sala/${seq}-${idioma}.mp3`;
  const { error } = await admin.storage.from(BUCKET_FOTOS).upload(ruta, audio, { contentType: "audio/mpeg", cacheControl: "86400", upsert: true });
  if (error) throw new Error(`audio: ${error.message}`);
  return admin.storage.from(BUCKET_FOTOS).getPublicUrl(ruta).data.publicUrl;
}

/** Texto hablado + audio en el idioma pedido. Si el original ya está en ese idioma, se usa su propio audio. */
async function hablado(admin: Admin, seq: number, idioma: Idioma, texto: string, audio: string | null, cartas: CartaSala[] | null) {
  const mismo = idiomaOrigen(texto) === idioma;
  const traducido = mismo ? { texto, cartas: idioma === "es" ? cartas : cartas?.length ? (await traducir(texto, cartas, idioma)).cartas : cartas } : await traducir(texto, cartas, idioma);
  let url: string | null = null;
  try {
    if (mismo && audio) url = await subirAudio(admin, seq, idioma, Buffer.from(audio, "base64"));
    else if (vozConfigurada()) url = await subirAudio(admin, seq, idioma, await sintetizar(traducido.texto));
  } catch (e) {
    console.error("[sala] voz:", e instanceof Error ? e.message : e);
  }
  return { texto: traducido.texto, cartas: traducido.cartas, audio: url };
}

async function construir(admin: Admin, seq: number, idioma: Idioma, e: EventoOriginal): Promise<EventoSala | null> {
  if (e.t === "pausa") return { t: "pausa", on: Boolean(e.on) };
  if (e.t === "cierre") return { t: "cierre", estado: e.estado ?? "abierto" };
  if (e.t === "frase" && e.texto) {
    const h = await hablado(admin, seq, idioma, e.texto, e.audio ?? null, null);
    return { t: "frase", texto: h.texto, audio: h.audio, cierre: e.cierre ?? "abierto" };
  }
  if (e.t === "lectura" && e.lectura) {
    const l = e.lectura;
    const h = await hablado(admin, seq, idioma, l.texto, l.audio, l.cartas);
    return {
      t: "lectura",
      id: l.id,
      tipo: l.tipo,
      autor: l.autor,
      signo: l.signo,
      pregunta: l.pregunta,
      cartas: h.cartas,
      imagen: l.imagen,
      respuesta: l.respuesta ?? null,
      numero: l.numero ?? null,
      etiquetaNumero: l.etiquetaNumero ?? null,
      texto: h.texto,
      audio: h.audio,
    };
  }
  return null;
}

/** El estado actual de la sala en un idioma (lo pide la página cada segundo; la respuesta se cachea 1 s en el CDN). */
export async function estadoSala(admin: Admin, idioma: Idioma): Promise<EstadoSala> {
  const [{ data: fila }, activo] = await Promise.all([
    admin.from("en_vivo_espejo").select("seq, evento, actualizado_en").eq("id", 1).maybeSingle(),
    escenarioActivo(admin).catch(() => false),
  ]);
  if (!fila || !fila.evento) return { seq: fila?.seq ?? 0, activo, evento: null };
  const seq = fila.seq;
  const original = fila.evento as EventoOriginal;
  // Pausa y cierre no se traducen; un paso viejo no se muestra.
  if (original.t === "pausa" || original.t === "cierre") return { seq, activo, evento: (await construir(admin, seq, idioma, original)) ?? null };
  if (Date.now() - Date.parse(fila.actualizado_en) > VIGENCIA_MS) return { seq, activo, evento: null };

  const { data: lista } = await admin.from("en_vivo_sala").select("estado, evento, creado_en").eq("seq", seq).eq("idioma", idioma).maybeSingle();
  if (lista?.estado === "listo") return { seq, activo, evento: lista.evento as unknown as EventoSala };
  if (lista?.estado === "error") return { seq, activo, evento: null };
  if (lista && Date.now() - Date.parse(lista.creado_en) < TRADUCCION_MS) return { seq, activo, evento: null, pendiente: true };

  // Nadie lo está traduciendo (o quien empezó se cayó): lo toma esta petición.
  const ahora = new Date().toISOString();
  const tomado = lista
    ? await admin.from("en_vivo_sala").update({ creado_en: ahora }).eq("seq", seq).eq("idioma", idioma).eq("estado", "generando").lt("creado_en", new Date(Date.now() - TRADUCCION_MS).toISOString()).select("seq").maybeSingle()
    : await admin.from("en_vivo_sala").insert({ seq, idioma, estado: "generando", creado_en: ahora }).select("seq").maybeSingle();
  if (!tomado.data) return { seq, activo, evento: null, pendiente: true };
  try {
    const evento = await construir(admin, seq, idioma, original);
    await admin.from("en_vivo_sala").update({ estado: evento ? "listo" : "error", evento: evento as unknown as Json }).eq("seq", seq).eq("idioma", idioma);
    return { seq, activo, evento };
  } catch (e) {
    console.error("[sala] traducción:", e instanceof Error ? e.message : e);
    await admin.from("en_vivo_sala").update({ estado: "error" }).eq("seq", seq).eq("idioma", idioma);
    return { seq, activo, evento: null };
  }
}
