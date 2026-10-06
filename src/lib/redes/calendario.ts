import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { COSTOS, OFERTA_FUNDADORES, PAQUETE_CIRCULO, PAQUETE_PRUEBA, formatoCOP } from "@/lib/creditos";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { proximasLunaciones, type FaseClave } from "@/lib/astro/lunaciones";
import { SIGNOS, signoPorId } from "@/lib/zodiaco";
import { FICHA_INTENCION, INTENCIONES } from "@/lib/velas";
import { diccionario } from "@/lib/i18n/diccionarios";
import { fechaBogota } from "./carta-dia";

/**
 * Agente de redes: calendario editorial semanal. Cada día de la semana tiene
 * un tipo de publicación; el contexto (qué guía, qué producto, qué luna) sale
 * de los datos de la app y Sibila escribe el titular, la frase y el pie.
 * Nada se publica sin aprobación en /admin/redes.
 */
export type TipoPublicacion = Database["public"]["Tables"]["publicaciones_programadas"]["Row"]["tipo"];
export type PublicacionProgramada = Database["public"]["Tables"]["publicaciones_programadas"]["Row"];
type Insercion = Database["public"]["Tables"]["publicaciones_programadas"]["Insert"];

/** Lunes a domingo (0 = lunes). */
const TIPO_POR_DIA: TipoPublicacion[] = ["guia", "pregunta", "producto", "oferta", "luna", "signo", "reflexion"];

export const NOMBRE_TIPO: Record<TipoPublicacion, string> = {
  guia: "Guía gratis",
  pregunta: "Pregúntale a Sibila",
  producto: "Una lectura",
  oferta: "Oferta",
  luna: "Luna",
  signo: "Signo de la semana",
  reflexion: "Cierre de semana",
};

const DIA = 86_400_000;

/** Lunes (AAAA-MM-DD) de la semana que contiene la fecha dada. */
export function lunesDe(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7; // 0 = lunes
  return new Date(d.getTime() - dow * DIA).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number) {
  return new Date(Date.parse(`${fecha}T12:00:00Z`) + dias * DIA).toISOString().slice(0, 10);
}

export function fechaLargaEs(fecha: string, conAnio = false) {
  const texto = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", year: conAnio ? "numeric" : undefined, timeZone: "UTC" }).format(new Date(`${fecha}T12:00:00Z`));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** Número de semana desde el 5 de enero de 2026 (lunes): decide las rotaciones. */
function indiceSemana(lunes: string) {
  return Math.round((Date.parse(`${lunes}T12:00:00Z`) - Date.UTC(2026, 0, 5, 12)) / (7 * DIA));
}

const GUIAS = [
  { clave: "chocolate", ruta: "/rituales#chocolate", nombre: "Lectura del chocolate" },
  { clave: "velas", ruta: "/velas", nombre: "Rituales de velas" },
  { clave: "mano", ruta: "/rituales#mano", nombre: "Lectura de la mano" },
  { clave: "luna", ruta: "/luna", nombre: "Calendario lunar" },
  { clave: "iching", ruta: "/rituales#iching", nombre: "I Ching, el libro de los cambios" },
  { clave: "tabaco", ruta: "/rituales#tabaco", nombre: "Lectura del tabaco" },
] as const;

const PREGUNTAS = [
  "¿Acepto el trabajo nuevo o me quedo donde estoy?",
  "¿Esta persona va en serio conmigo?",
  "¿Es buen momento para mudarme?",
  "¿Por qué no logro ahorrar?",
  "¿Debo perdonar a mi hermana?",
  "¿Sigo con la carrera o cambio de rumbo?",
  "¿Qué me quiso decir el sueño con mi abuela?",
  "¿Qué necesito soltar este mes?",
];

/** Lecturas que se presentan los miércoles (rotación). */
const PRODUCTOS: { clave: string; ruta: string; costo: number; glifo: string; carta?: string }[] = [
  { clave: "tarot", ruta: "/tarot", costo: COSTOS.tarot_tres, glifo: "✦", carta: "rider/la-estrella" },
  { clave: "astral", ruta: "/carta-astral", costo: COSTOS.carta_astral, glifo: "☉" },
  { clave: "suenos", ruta: "/suenos", costo: COSTOS.suenos, glifo: "☾" },
  { clave: "quiromancia", ruta: "/quiromancia", costo: COSTOS.quiromancia, glifo: "✦" },
  { clave: "chocolate", ruta: "/chocolate", costo: COSTOS.chocolate, glifo: "✦" },
  { clave: "iching", ruta: "/iching", costo: COSTOS.iching, glifo: "☰" },
  { clave: "numerologia", ruta: "/numerologia", costo: COSTOS.numerologia, glifo: "✦" },
  { clave: "velas", ruta: "/velas", costo: COSTOS.velas, glifo: "✦" },
  { clave: "aura", ruta: "/aura", costo: COSTOS.aura, glifo: "✦" },
  { clave: "chino", ruta: "/calendario-chino", costo: COSTOS.chino, glifo: "✦" },
  { clave: "sinastria", ruta: "/sinastria", costo: COSTOS.sinastria, glifo: "☉ ☾" },
  { clave: "cruce", ruta: "/cruce", costo: COSTOS.cruce, glifo: "✦" },
  { clave: "tabaco", ruta: "/tabaco", costo: COSTOS.tabaco, glifo: "✦" },
  { clave: "compatibilidad", ruta: "/compatibilidad", costo: COSTOS.compatibilidad, glifo: "♡" },
];

const NOMBRE_FASE: Record<FaseClave, string> = { nueva: "Luna nueva", creciente: "Cuarto creciente", llena: "Luna llena", menguante: "Cuarto menguante" };
const RITUAL_FASE: Record<FaseClave, string> = {
  nueva: "sembrar intenciones: escribir lo que quieres empezar",
  creciente: "actuar: dar el primer paso de lo que pediste",
  llena: "agradecer y soltar: cerrar lo que ya cumplió su ciclo",
  menguante: "limpiar: ordenar, descansar, dejar ir lo que pesa",
};

export interface Encargo {
  tipo: TipoPublicacion;
  fecha: string;
  etiqueta: string;
  /** Contexto en prosa para Sibila (datos reales de la app). */
  contexto: string;
  enlace: string;
  simbolos: string[];
  carta: string | null;
  pie: string;
}

/** Los siete encargos de la semana que empieza en `lunes`. */
export async function encargosSemana(lunes: string): Promise<Encargo[]> {
  const t = diccionario("es");
  const modulos = t.portada.modulos as Record<string, { titulo: string; texto: string }>;
  const n = indiceSemana(lunes);
  const encargos: Encargo[] = [];

  for (let i = 0; i < 7; i++) {
    const tipo = TIPO_POR_DIA[i];
    const fecha = sumarDias(lunes, i);
    switch (tipo) {
      case "guia": {
        const g = GUIAS[((n % GUIAS.length) + GUIAS.length) % GUIAS.length];
        const guia = (t.rituales.guias as Record<string, { intro: string; consejo: string } | undefined>)[g.clave];
        const detalle = guia ? `Intro de la guía: ${guia.intro} Consejo: ${guia.consejo}` : modulos[g.clave]?.texto ?? "";
        encargos.push({ tipo, fecha, etiqueta: "Guía gratis", contexto: `Guía gratuita "${g.nombre}" en miarcana.com${g.ruta}. ${detalle} No exige registro.`, enlace: `miarcana.com${g.ruta.split("#")[0]}`, simbolos: g.clave === "luna" ? ["☾"] : ["✦"], carta: null, pie: "Guía gratis, sin registro" });
        break;
      }
      case "pregunta": {
        const p = PREGUNTAS[((n % PREGUNTAS.length) + PREGUNTAS.length) % PREGUNTAS.length];
        encargos.push({ tipo, fecha, etiqueta: "Pregúntale a Sibila", contexto: `Pregunta de ejemplo que alguien le haría a Sibila: «${p}». Sibila responde con tarot (tirada de tres cartas, 1 crédito) o por voz. Al registrarse hay 3 créditos de regalo.`, enlace: "miarcana.com", simbolos: ["✦"], carta: "rider/la-sacerdotisa", pie: "Tres créditos de regalo al entrar" });
        break;
      }
      case "producto": {
        const p = PRODUCTOS[((n % PRODUCTOS.length) + PRODUCTOS.length) % PRODUCTOS.length];
        const m = modulos[p.clave];
        encargos.push({ tipo, fecha, etiqueta: m?.titulo ?? p.clave, contexto: `Lectura "${m?.titulo ?? p.clave}": ${m?.texto ?? ""} Cuesta ${p.costo} crédito${p.costo === 1 ? "" : "s"} (un crédito desde ${formatoCOP(PAQUETE_PRUEBA.precioCOP)}). Enlace miarcana.com${p.ruta}.`, enlace: `miarcana.com${p.ruta}`, simbolos: p.glifo.split(" "), carta: p.carta ?? null, pie: `${p.costo} crédito${p.costo === 1 ? "" : "s"} · 3 de regalo al registrarte` });
        break;
      }
      case "oferta": {
        const f = await estadoOfertaFundadores();
        if (f.activa) {
          const hasta = fechaLargaEs(OFERTA_FUNDADORES.hasta.slice(0, 10));
          encargos.push({ tipo, fecha, etiqueta: "Oferta de fundadores", contexto: `Oferta de fundadores: el Círculo Arcana (30 días con el cielo personal cada mañana, preguntas a Sibila sin cobro y 15 créditos) a ${formatoCOP(OFERTA_FUNDADORES.precioCOP)} en lugar de ${formatoCOP(PAQUETE_CIRCULO.precioCOP)}. Solo ${OFERTA_FUNDADORES.cupo} cupos, quedan ${f.restantes}. Hasta el ${hasta}. Enlace miarcana.com/creditos.`, enlace: "miarcana.com/creditos", simbolos: ["✦"], carta: null, pie: `Quedan ${f.restantes} cupos · hasta el ${hasta}` });
        } else if (n % 2 === 0) {
          encargos.push({ tipo, fecha, etiqueta: "Prueba por 1 crédito", contexto: `Paquete de prueba: 1 crédito por ${formatoCOP(PAQUETE_PRUEBA.precioCOP)}, suficiente para una tirada de tres cartas o una numerología. Enlace miarcana.com/creditos.`, enlace: "miarcana.com/creditos", simbolos: ["✦"], carta: null, pie: `Una lectura por ${formatoCOP(PAQUETE_PRUEBA.precioCOP)}` });
        } else {
          encargos.push({ tipo, fecha, etiqueta: "Círculo Arcana", contexto: `Círculo Arcana: ${PAQUETE_CIRCULO.descripcion} Cuesta ${formatoCOP(PAQUETE_CIRCULO.precioCOP)} al mes. Enlace miarcana.com/creditos.`, enlace: "miarcana.com/creditos", simbolos: ["☉"], carta: null, pie: `${formatoCOP(PAQUETE_CIRCULO.precioCOP)} por 30 días` });
        }
        break;
      }
      case "luna": {
        const desde = new Date(`${fecha}T05:00:00Z`);
        const [l] = proximasLunaciones(desde, 1);
        const cuando = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "America/Bogota" }).format(new Date(l.fechaUtc));
        const signo = signoPorId(l.signo);
        const intencion = INTENCIONES.find((i) => FICHA_INTENCION[i].fase === l.fase) ?? "claridad";
        encargos.push({ tipo, fecha, etiqueta: NOMBRE_FASE[l.fase], contexto: `Próxima lunación: ${NOMBRE_FASE[l.fase]} en ${signo?.nombre ?? l.signo} el ${cuando} (hora de Bogotá). Ritual tradicional de esta fase: ${RITUAL_FASE[l.fase]}. Vela sugerida para la intención "${intencion}": color ${FICHA_INTENCION[intencion].color}. En miarcana.com/luna está el calendario con la hora exacta en cada zona y un ritual por fase, gratis.`, enlace: "miarcana.com/luna", simbolos: ["☾"], carta: `signos/${l.signo}`, pie: "Calendario lunar gratis con tu hora local" });
        break;
      }
      case "signo": {
        const s = SIGNOS[((n % SIGNOS.length) + SIGNOS.length) % SIGNOS.length];
        encargos.push({ tipo, fecha, etiqueta: `Semana de ${s.nombre}`, contexto: `Signo protagonista: ${s.nombre} (${s.elemento}, ${s.modalidad}, regente ${s.regente}; rasgos: ${s.rasgos.join(", ")}). Mensaje para quienes son ${s.nombre} o tienen a alguien ${s.nombre} cerca. El horóscopo de cada signo es gratis en miarcana.com/horoscopo y la carta astral completa cuesta ${COSTOS.carta_astral} créditos.`, enlace: "miarcana.com/horoscopo", simbolos: ["☉"], carta: `signos/${s.id}`, pie: "Horóscopo gratis · carta astral completa en la app" });
        break;
      }
      case "reflexion": {
        encargos.push({ tipo, fecha, etiqueta: "Cierre de semana", contexto: `Domingo: una reflexión breve para cerrar la semana y una pregunta para llevarse a la cama. Invitación suave a sacar la carta del día gratis en miarcana.com (una por día, sin costo).`, enlace: "miarcana.com", simbolos: ["✦"], carta: "arcana/el-despertar", pie: "Tu carta del día, gratis cada día" });
        break;
      }
    }
  }
  return encargos;
}

interface Redaccion {
  fecha: string;
  titulo: string;
  extracto: string;
  texto: string;
}

const INSTRUCCION = `Tarea: redactar publicaciones para Instagram y Facebook de Arcana. Responde SOLO con un arreglo JSON válido, sin texto antes ni después ni marcas de código. Cada elemento: {"fecha": "AAAA-MM-DD", "titulo": "...", "extracto": "...", "texto": "..."}.
- "titulo": máximo 48 caracteres, es el texto grande de la imagen. Un gancho, no un nombre de producto. Sin comillas ni punto final.
- "extracto": una sola frase de 80 a 140 caracteres que irá entre comillas en la imagen, con la voz de Sibila.
- "texto": el pie de la publicación, de 350 a 650 caracteres: 2 o 3 párrafos cortos separados por línea en blanco, una llamada a la acción con el enlace indicado (escríbelo tal cual, sin https) y al final una línea con 5 hashtags en español que incluya #miarcana. Aquí sí puedes usar 1 o 2 emojis con mesura.
- Usa solo los datos del contexto: precios, fechas, cupos y enlaces tal como vienen. No inventes testimonios ni cifras.
- Tono: cercano, sereno, sin prometer resultados ni predicciones absolutas. Nada de salud, dinero garantizado ni miedo.
- Escribe en español de Colombia neutro (tú, no vos ni usted).`;

/** Pide a Sibila los textos de los encargos (una sola llamada). */
export async function redactar(encargos: Encargo[]): Promise<Redaccion[]> {
  const entrada = encargos.map((e) => `- ${e.fecha} (${fechaLargaEs(e.fecha)}) · tipo ${e.tipo} · enlace ${e.enlace}\n  Contexto: ${e.contexto}`).join("\n");
  const crudo = await generarTexto(`Publicaciones a redactar:\n${entrada}`, INSTRUCCION, { effort: "medium", maxTokens: 6000, nivel: "estandar", idioma: "es" });
  const inicio = crudo.indexOf("[");
  const fin = crudo.lastIndexOf("]");
  const json = inicio >= 0 && fin > inicio ? crudo.slice(inicio, fin + 1) : crudo;
  let datos: unknown;
  try {
    datos = JSON.parse(json);
  } catch {
    throw new Error("Sibila no devolvió JSON válido");
  }
  if (!Array.isArray(datos)) throw new Error("respuesta sin arreglo");
  const limpio = (v: unknown, max: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  return datos
    .map((d: Record<string, unknown>) => ({ fecha: limpio(d.fecha, 10), titulo: limpio(d.titulo, 70), extracto: limpio(d.extracto, 200), texto: String(d.texto ?? "").trim().slice(0, 2000) }))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.fecha) && d.titulo && d.extracto && d.texto);
}

export interface ResultadoGeneracion {
  semana: string;
  creadas: number;
  omitidas: number;
}

/**
 * Crea los borradores de la semana que empieza en `lunes` para los días que
 * aún no tienen publicación (y que no hayan pasado). Devuelve cuántos creó.
 */
export async function generarSemana(admin: SupabaseClient<Database>, lunes: string, desde = fechaBogota()): Promise<ResultadoGeneracion> {
  const { data: existentes, error } = await admin.from("publicaciones_programadas").select("fecha, tipo").eq("semana", lunes);
  if (error) throw new Error(`publicaciones: ${error.message}`);
  const ocupadas = new Set((existentes ?? []).map((e) => `${e.fecha}:${e.tipo}`));
  const encargos = (await encargosSemana(lunes)).filter((e) => e.fecha >= desde && !ocupadas.has(`${e.fecha}:${e.tipo}`));
  if (!encargos.length) return { semana: lunes, creadas: 0, omitidas: 7 };

  const redacciones = await redactar(encargos);
  const filas: Insercion[] = [];
  for (const e of encargos) {
    const r = redacciones.find((x) => x.fecha === e.fecha);
    if (!r) continue;
    filas.push({ semana: lunes, fecha: e.fecha, tipo: e.tipo, etiqueta: e.etiqueta, titulo: r.titulo, extracto: r.extracto, texto: r.texto, simbolos: e.simbolos, carta: e.carta, enlace: e.enlace, pie: e.pie });
  }
  if (!filas.length) throw new Error("Sibila no redactó ninguna publicación");
  // upsert por si dos corridas coinciden: la unicidad (fecha, tipo) protege.
  const { error: errorInsercion } = await admin.from("publicaciones_programadas").upsert(filas, { onConflict: "fecha,tipo", ignoreDuplicates: true });
  if (errorInsercion) throw new Error(`insertar: ${errorInsercion.message}`);
  return { semana: lunes, creadas: filas.length, omitidas: 7 - filas.length };
}
