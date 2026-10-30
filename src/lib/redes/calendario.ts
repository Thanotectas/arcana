import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { generarTexto } from "@/lib/ia";
import { COSTOS, OFERTA_FUNDADORES, PAQUETE_CIRCULO, PAQUETE_PRUEBA, formatoCOP } from "@/lib/creditos";
import { estadoOfertaFundadores } from "@/lib/pagos/fundadores";
import { proximasLunaciones, type FaseClave } from "@/lib/astro/lunaciones";
import { SIGNOS, signoPorId } from "@/lib/zodiaco";
import { FICHA_INTENCION, INTENCIONES, type ColorVela } from "@/lib/velas";
import { diccionario } from "@/lib/i18n/diccionarios";
import { HEXAGRAMAS } from "@/lib/iching/hexagramas";
import { ANIMALES } from "@/lib/chino";
import { COLORES_AURA } from "@/lib/aura";
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

/**
 * Lunes a domingo (0 = lunes). Cuatro días presentan una función de la app
 * (lectura de pago o guía gratis, recorriendo FUNCIONES sin repetir), el
 * martes Sibila responde una pregunta, el sábado hay signo y el domingo luna.
 * Mientras la oferta de fundadores esté activa, el jueves la anuncia.
 */
const TIPO_POR_DIA: ("funcion" | TipoPublicacion)[] = ["funcion", "pregunta", "funcion", "funcion", "funcion", "signo", "luna"];
/** Ranura (0–3) que ocupa cada día de función en el recorrido de FUNCIONES. */
const RANURAS_POR_SEMANA = 4;

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

/**
 * Las funciones de la app que se presentan en redes, una por día de función.
 * `visual` describe la imagen principal del reel y de la tarjeta (ver
 * `src/lib/redes/visual.tsx`): carta de un mazo ("rider/la-estrella"), moneda
 * ("signos/leo"), rueda de monedas, pareja, cruce, aura, vela, hexagrama,
 * números, luna o un glifo. Los que dependen de la semana se completan en
 * `visualDe`.
 */
interface Funcion {
  clave: string;
  tipo: "producto" | "guia";
  ruta: string;
  /** Nombre cuando no está en `portada.modulos`. */
  nombre?: string;
  costo?: number;
  visual: string;
  simbolos: string[];
}

const FUNCIONES: Funcion[] = [
  { clave: "tarot", tipo: "producto", ruta: "/tarot", costo: COSTOS.tarot_tres, visual: "rider/la-estrella", simbolos: ["✦"] },
  { clave: "astral", tipo: "producto", ruta: "/carta-astral", costo: COSTOS.carta_astral, visual: "astral", simbolos: ["☉"] },
  { clave: "chocolate", tipo: "guia", ruta: "/rituales#chocolate", nombre: "Lectura del chocolate", visual: "glifo/☕", simbolos: ["☕"] },
  { clave: "suenos", tipo: "producto", ruta: "/suenos", costo: COSTOS.suenos, visual: "luna", simbolos: ["✦"] },
  { clave: "chino", tipo: "producto", ruta: "/calendario-chino", costo: COSTOS.chino, visual: "rueda/animales", simbolos: ["✦"] },
  { clave: "velas", tipo: "guia", ruta: "/velas", nombre: "Rituales de velas", visual: "vela/blanco", simbolos: ["🕯"] },
  { clave: "quiromancia", tipo: "producto", ruta: "/quiromancia", costo: COSTOS.quiromancia, visual: "glifo/✋", simbolos: ["✋"] },
  { clave: "numerologia", tipo: "producto", ruta: "/numerologia", costo: COSTOS.numerologia, visual: "numeros", simbolos: ["✦"] },
  { clave: "mano", tipo: "guia", ruta: "/rituales#mano", nombre: "Lectura de la mano", visual: "glifo/✋", simbolos: ["✋"] },
  { clave: "sinastria", tipo: "producto", ruta: "/sinastria", costo: COSTOS.sinastria, visual: "sinastria", simbolos: ["✦"] },
  { clave: "iching", tipo: "producto", ruta: "/iching", costo: COSTOS.iching, visual: "hexagrama", simbolos: ["☰"] },
  { clave: "luna", tipo: "guia", ruta: "/luna", nombre: "Calendario lunar", visual: "luna", simbolos: ["✦"] },
  { clave: "aura", tipo: "producto", ruta: "/aura", costo: COSTOS.aura, visual: "aura", simbolos: ["✦"] },
  { clave: "cruce", tipo: "producto", ruta: "/cruce", costo: COSTOS.cruce, visual: "cruce", simbolos: ["✦"] },
  { clave: "iching-guia", tipo: "guia", ruta: "/rituales#iching", nombre: "I Ching, el libro de los cambios", visual: "hexagrama", simbolos: ["☰"] },
  { clave: "velas-lectura", tipo: "producto", ruta: "/velas", costo: COSTOS.velas, visual: "vela", simbolos: ["🕯"] },
  { clave: "compatibilidad", tipo: "producto", ruta: "/compatibilidad", costo: COSTOS.compatibilidad, visual: "duo", simbolos: ["♡"] },
  { clave: "tabaco", tipo: "guia", ruta: "/rituales#tabaco", nombre: "Lectura del tabaco", visual: "glifo/♨", simbolos: ["♨"] },
  { clave: "chocolate-lectura", tipo: "producto", ruta: "/chocolate", costo: COSTOS.chocolate, visual: "glifo/☕", simbolos: ["☕"] },
  { clave: "tabaco-lectura", tipo: "producto", ruta: "/tabaco", costo: COSTOS.tabaco, visual: "glifo/♨", simbolos: ["♨"] },
  { clave: "pendulo", tipo: "producto", ruta: "/pendulo", costo: COSTOS.pendulo, visual: "pendulo", simbolos: ["◈"] },
  { clave: "runas", tipo: "producto", ruta: "/runas", costo: COSTOS.runas, visual: "runas", simbolos: ["✦"] },
  { clave: "astral-lectura", tipo: "producto", ruta: "/carta-astral", costo: COSTOS.carta_astral, visual: "astral", simbolos: ["☉"] },
  { clave: "baraja", tipo: "producto", ruta: "/baraja-espanola", costo: COSTOS.baraja_espanola, visual: "espanola", simbolos: ["✦"] },
  { clave: "cafe", tipo: "producto", ruta: "/cafe", costo: COSTOS.cafe, visual: "glifo/☕", simbolos: ["☕"] },
  { clave: "maya", tipo: "producto", ruta: "/calendario-maya", costo: COSTOS.maya, visual: "glifo/☀", simbolos: ["☀"] },
  { clave: "sinastria-lectura", tipo: "producto", ruta: "/sinastria", costo: COSTOS.sinastria, visual: "sinastria", simbolos: ["♡"] },
  { clave: "lenormand", tipo: "producto", ruta: "/lenormand", costo: COSTOS.lenormand, visual: "lenormand", simbolos: ["✦"] },
  { clave: "huevo", tipo: "producto", ruta: "/huevo", costo: COSTOS.huevo, visual: "huevo", simbolos: ["✦"] },
  { clave: "revolucion", tipo: "producto", ruta: "/revolucion-solar", costo: COSTOS.revolucion_solar, visual: "astral", simbolos: ["☉"] },
];

/** Runas con imagen en public/runas (las del Futhark antiguo). */
const RUNAS = ["fehu", "uruz", "thurisaz", "ansuz", "raidho", "kenaz", "gebo", "wunjo", "hagalaz", "nauthiz", "isa", "jera", "eihwaz", "perthro", "algiz", "sowilo", "tiwaz", "berkano", "ehwaz", "mannaz", "laguz", "ingwaz", "dagaz", "othala"];
const PALOS = ["oros", "copas", "espadas", "bastos"];
const NUMEROS_ESPANOLA = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];

/** Clave del módulo en `portada.modulos` y en `rituales.guias`. */
function claveModulo(f: Funcion) {
  return f.clave.replace(/-(guia|lectura)$/, "");
}

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

const INTENCION_VELA: ColorVela[] = ["rosa", "verde", "azul", "amarillo", "morado", "naranja"];

/** Completa los visuales que cambian con la semana (pareja de signos, animal, hexagrama, colores). */
function visualDe(f: Funcion, n: number, fecha: string): string {
  const signo = (k: number) => SIGNOS[((k % SIGNOS.length) + SIGNOS.length) % SIGNOS.length].id;
  const animal = (k: number) => ANIMALES[((k % ANIMALES.length) + ANIMALES.length) % ANIMALES.length];
  switch (f.visual) {
    case "duo":
      return `duo/${signo(n)}+${signo(n + 6)}`;
    case "cruce":
      return `cruce/${signo(n + 3)}+${animal(n)}`;
    case "hexagrama":
      return `hexagrama/${HEXAGRAMAS[((n % 64) + 64) % 64].lineas.join("")}`;
    case "aura": {
      const a = COLORES_AURA[((n % COLORES_AURA.length) + COLORES_AURA.length) % COLORES_AURA.length];
      const b = COLORES_AURA[(((n + 4) % COLORES_AURA.length) + COLORES_AURA.length) % COLORES_AURA.length];
      return `aura/${a}+${b}`;
    }
    case "vela":
      return `vela/${INTENCION_VELA[((n % INTENCION_VELA.length) + INTENCION_VELA.length) % INTENCION_VELA.length]}`;
    case "astral":
      return `astral/${fecha}`;
    case "sinastria": {
      // Dos fechas de nacimiento de ejemplo que cambian cada semana (mediodía, sin hora exacta).
      const nacimiento = (anio: number, dias: number) => new Date(Date.UTC(anio, 0, 1) + (((dias % 365) + 365) % 365) * DIA).toISOString().slice(0, 10);
      return `sinastria/${nacimiento(1988 + (((n % 9) + 9) % 9), n * 37 + 40)}+${nacimiento(1990 + (((n * 5) % 9) + 9) % 9, n * 53 + 170)}`;
    }
    case "runas":
      return `runas/${RUNAS[((n % RUNAS.length) + RUNAS.length) % RUNAS.length]}`;
    case "espanola":
      return `espanola/${PALOS[((n % 4) + 4) % 4]}-${NUMEROS_ESPANOLA[(((n * 3) % 10) + 10) % 10]}`;
    case "lenormand":
      return `lenormand/l${(((n * 7) % 36) + 36) % 36 + 1}`;
    case "numeros": {
      const reducir = (v: number) => {
        while (v > 9 && v !== 11 && v !== 22) v = String(v).split("").reduce((a, c) => a + Number(c), 0);
        return v;
      };
      const [anio, mes, dia] = fecha.split("-").map(Number);
      return `numeros/${reducir(dia)}·${reducir(mes + dia)}·${reducir(anio + mes + dia)}`;
    }
    default:
      return f.visual;
  }
}

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

  const guias = t.rituales.guias as Record<string, { intro: string; consejo: string } | undefined>;
  const fundadores = await estadoOfertaFundadores();
  let ranura = 0;

  for (let i = 0; i < 7; i++) {
    const fecha = sumarDias(lunes, i);
    let tipo = TIPO_POR_DIA[i];
    // El jueves anuncia la oferta de fundadores mientras esté activa (y no haya vencido ese día).
    if (tipo === "funcion" && i === 3 && fundadores.activa && fecha <= OFERTA_FUNDADORES.hasta.slice(0, 10)) tipo = "oferta";
    if (tipo === "funcion") {
      const f = FUNCIONES[(((n * RANURAS_POR_SEMANA + ranura) % FUNCIONES.length) + FUNCIONES.length) % FUNCIONES.length];
      ranura++;
      const clave = claveModulo(f);
      const m = modulos[clave];
      const nombre = m?.titulo ?? f.nombre ?? clave;
      const visual = visualDe(f, n, fecha);
      if (f.tipo === "guia") {
        const guia = guias[clave];
        const detalle = guia ? `Intro de la guía: ${guia.intro} Consejo: ${guia.consejo}` : m?.texto ?? "";
        encargos.push({ tipo: "guia", fecha, etiqueta: nombre, contexto: `Guía gratuita "${nombre}" en miarcana.com${f.ruta}. ${detalle} No exige registro.`, enlace: `miarcana.com${f.ruta.split("#")[0]}`, simbolos: f.simbolos, carta: visual, pie: "Guía gratis, sin registro" });
      } else {
        const costo = f.costo ?? 1;
        // Las lecturas sin costo (el péndulo) se presentan como gratis una vez al día.
        const precio = costo === 0 ? "Es gratis, una vez al día, con tu cuenta" : `Cuesta ${costo} crédito${costo === 1 ? "" : "s"} (un crédito desde ${formatoCOP(PAQUETE_PRUEBA.precioCOP)})`;
        const pie = costo === 0 ? "Gratis una vez al día" : `${costo} crédito${costo === 1 ? "" : "s"} · 3 de regalo al registrarte`;
        encargos.push({ tipo: "producto", fecha, etiqueta: nombre, contexto: `Lectura "${nombre}": ${m?.texto ?? ""} ${precio}. Enlace miarcana.com${f.ruta}.`, enlace: `miarcana.com${f.ruta}`, simbolos: f.simbolos, carta: visual, pie });
      }
      continue;
    }
    switch (tipo) {
      case "pregunta": {
        const p = PREGUNTAS[((n % PREGUNTAS.length) + PREGUNTAS.length) % PREGUNTAS.length];
        encargos.push({ tipo, fecha, etiqueta: "Pregúntale a Sibila", contexto: `Pregunta de ejemplo que alguien le haría a Sibila: «${p}». Sibila responde con tarot (tirada de tres cartas, 1 crédito) o por voz. Al registrarse hay 3 créditos de regalo.`, enlace: "miarcana.com", simbolos: ["✦"], carta: "rider/la-sacerdotisa", pie: "Tres créditos de regalo al entrar" });
        break;
      }
      case "oferta": {
        const f = fundadores;
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
- "texto": el pie de la publicación, de 350 a 650 caracteres: 2 o 3 párrafos cortos separados por línea en blanco, una llamada a la acción con el enlace indicado (escríbelo tal cual, sin https), luego una línea que invite a comentar el signo (por ejemplo «Comenta tu signo y Sibila te responde») y al final una línea con 5 hashtags en español que incluya #miarcana. Aquí sí puedes usar 1 o 2 emojis con mesura.
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
  // Un día ya cubierto no se vuelve a redactar aunque el calendario le asigne otro tipo.
  const ocupadas = new Set((existentes ?? []).map((e) => e.fecha));
  const encargos = (await encargosSemana(lunes)).filter((e) => e.fecha >= desde && !ocupadas.has(e.fecha));
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
