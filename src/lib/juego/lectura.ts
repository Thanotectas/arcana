import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { generarTexto } from "@/lib/ia";
import { SIGNOS, signoPorFecha, signoPorId } from "@/lib/zodiaco";
import { cartaDelJuego, fechaBogota, mensajeDelDia, numeroDeJuego } from "./carta-escondida";
import { nombreCarta, palabrasCarta } from "./cartas-idiomas";
import { SIGNOS_IDIOMA } from "./textos";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Del juego a la lectura: al terminar, Sibila le da a cada signo un mensaje corto con la carta del día.
 * Se escribe una sola vez por día y signo (tabla juego_mensajes): como mucho 12 textos al día.
 */
const INSTRUCCION = `Escribe un mensaje breve de Sibila para una persona que acaba de jugar «El Camino del Loco» (el juego diario de Arcana).
Reglas:
- De 2 a 3 frases, máximo 60 palabras, en segunda persona, cálido y concreto. Sin títulos, sin listas, sin markdown, sin emojis.
- Cruza la carta del día con el signo: menciona el signo y cómo se vive esa carta desde su forma de ser.
- Nada de miedo, amenazas, «trabajos», salud ni promesas de dinero. Nada de predicciones absolutas: habla de tendencias y de lo que la persona puede hacer.
- Termina con una pregunta abierta que invite a mirar algo concreto de su vida (amor, trabajo o una decisión), sin vender nada.`;

export function signoDeFecha(fecha: string | null | undefined) {
  if (!fecha) return null;
  const [, mes, dia] = fecha.split("-").map(Number);
  return mes && dia ? signoPorFecha(mes, dia) : null;
}

export function esSigno(id: unknown): id is string {
  return typeof id === "string" && SIGNOS.some((s) => s.id === id);
}

/** El mensaje de hoy para un signo (de la caché o recién escrito). */
export async function mensajeParaSigno(signoId: string, idioma: Idioma = "es"): Promise<{ fecha: string; signo: string; texto: string }> {
  const fecha = fechaBogota();
  const carta = cartaDelJuego(numeroDeJuego(fecha));
  const signo = signoPorId(signoId);
  if (!signo) throw new Error("signo");
  const admin = getSupabaseAdmin();
  // En otros idiomas se guarda como «aries:en» (una fila por signo e idioma).
  const clave = idioma === "es" ? signo.id : `${signo.id}:${idioma}`;
  const nombreSigno = idioma === "es" ? signo.nombre : (SIGNOS_IDIOMA[idioma][signo.id] ?? signo.nombre);
  const respaldo = idioma === "es" ? `${signo.nombre}: ${mensajeDelDia(carta)}` : `${nombreSigno} · ${nombreCarta(carta, idioma)}: ${palabrasCarta(carta, idioma).luz.join(", ")}.`;
  const { data: guardado, error } = await admin.from("juego_mensajes").select("texto").eq("fecha", fecha).eq("signo", clave).maybeSingle();
  if (guardado?.texto) return { fecha, signo: signo.id, texto: guardado.texto };
  // Sin la tabla (migración 0057 pendiente) no se llama a la IA en cada visita: se usa un mensaje sencillo.
  if (error) return { fecha, signo: signo.id, texto: respaldo };

  const datos = [
    `Carta del día: ${carta.nombre}${idioma === "es" ? "" : ` (en el idioma de la respuesta: ${nombreCarta(carta, idioma)})`}. Palabras clave: ${carta.palabrasClave.join(", ")}.`,
    `Significado: ${carta.significado}`,
    `En el amor: ${carta.amor} En el trabajo: ${carta.trabajo}`,
    `Signo de la persona: ${signo.nombre}${idioma === "es" ? "" : ` (${nombreSigno})`} (${signo.elemento}, ${signo.modalidad}, regido por ${signo.regente}; rasgos: ${signo.rasgos.join(", ")}).`,
  ].join("\n");
  let texto: string;
  try {
    texto = (await generarTexto(datos, INSTRUCCION, { effort: "low", maxTokens: 400, nivel: "economico", idioma }))
      .replace(/[*_#>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.error("[juego] mensaje por signo", e);
    return { fecha, signo: signo.id, texto: respaldo };
  }
  await admin.from("juego_mensajes").upsert({ fecha, signo: clave, carta: carta.id, texto }, { onConflict: "fecha,signo", ignoreDuplicates: true });
  return { fecha, signo: signo.id, texto };
}

export const EVENTOS_JUEGO = ["inicio", "fin", "comodin", "maestro", "mensaje", "oferta"] as const;
export type EventoJuego = (typeof EVENTOS_JUEGO)[number];

/** Guarda un evento del juego para el panel. «inicio» y «fin» cuentan una vez por visitante y día. */
export async function registrarEvento(datos: { evento: EventoJuego; visitante: string; usuarioId: string | null; gano?: boolean | null; intentos?: number | null }) {
  const admin = getSupabaseAdmin();
  const fecha = fechaBogota();
  if (datos.evento !== "oferta") {
    const { count } = await admin.from("juego_eventos").select("id", { count: "exact", head: true }).eq("fecha", fecha).eq("visitante", datos.visitante).eq("evento", datos.evento);
    if ((count ?? 0) > 0) return;
  }
  const { error } = await admin.from("juego_eventos").insert({
    fecha,
    visitante: datos.visitante,
    evento: datos.evento,
    usuario_id: datos.usuarioId,
    gano: datos.gano ?? null,
    intentos: datos.intentos ?? null,
  });
  if (error) console.error("[juego] evento", error.message);
}
