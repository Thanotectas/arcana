/**
 * Lecturas del nombre en el directo: el valor abjad (حساب الجُمَّل) con su primera letra, y el Yıldızname (nombre +
 * nombre de la madre). Son las lecturas que más respuesta tienen en redes con el público árabe. Las cuentas salen de
 * los mismos módulos que la página (nunca del modelo). Sin dependencias de servidor.
 */
import type { Idioma } from "@/lib/i18n/idiomas";
import { calcularAbjad, esEscrituraArabe, letraBase, LETRAS_ABJAD, ELEMENTO_LETRA } from "@/lib/abjad/calculo";
import { calcularYildizname } from "@/lib/yildizname/calculo";
import { SIGNOS } from "@/lib/zodiaco";
import { SIGNOS_IDIOMA } from "@/lib/juego/textos";
import { TEXTOS_YILDIZNAME } from "@/lib/yildizname/textos";

export interface PedidoNombre {
  tipo: "nombre" | "yildizname";
  nombre: string;
  madre?: string;
}

const PIDE_YILDIZ = /y[ıi]ld[ıi]zn[aâ]me|يلدز\s*نام[هة]|كتاب النجوم|نجمي|(?:اسم|إسم)\s*(?:أمي|امي|الأم|الام|والدتي|ماما)|mother'?s name|nombre de (?:mi )?(?:mam[aá]|madre)|annemin ad/i;
const PIDE_NOMBRE = /أبجد|ابجد|الجمل|الجُمَّل|حساب\s*(?:اسمي|اسم)|قيمة\s*(?:اسمي|اسم)|حرف\s*اسمي|الحرف الأول|حرفي|abjad|ebced|first letter|primera letra/i;
const DESPUES = "\\s*(?:[:：]\\s*)?(?:(?:هو|هي|is|es)\\s+)?([\\p{L}]{2,20})";
const PERSONA = new RegExp(`(?:اسمي|إسمي|my name is|me llamo|mi nombre es|benim ad[ıi]m|ad[ıi]m)${DESPUES}`, "iu");
const MADRE = new RegExp(`(?:(?:و\\s*)?(?:اسم|إسم)\\s*(?:أمي|امي|الأم|الام|والدتي|ماما)|mother'?s name(?:\\s+is)?|(?:el )?nombre de (?:mi )?(?:mam[aá]|madre)(?:\\s+es)?|(?:mi )?(?:mam[aá]|madre) se llama|annemin ad[ıi])${DESPUES}`, "iu");
const MAS = /([\p{L}]{2,20})\s*\+\s*([\p{L}]{2,20})/u;
const NO_NOMBRE = new RegExp(
  "^(?:" +
    "شكرا|شكراً|مشكورة?|يسلمو|تسلمي?ن?|كفو|حرام|نعم|لا|ايوه|اي|مرحبا|مرحبتين|اهلا|أهلا|هلا|هلو|هاي|حلو|حلوة|جميل|جميلة|رائع|رائعة|واو|" +
    "الله|والله|ماشاء|سبحان|يارب|آمين|امين|سلام|السلام|عليكم|وعليكم|يا|انا|أنا|انت|أنت|هنا|وين|كيف|متى|ليش|ممكن|دوري|دورى|" +
    "احبك|أحبك|حبيبتي|حبيبي|قلبي|عمري|سيبيلا|مساء|صباح|الخير|النور|تاروت|برج|ابراج|أبراج|فلك|لايك|متابعة|تابعت|" +
    // Pedidos de atención («ردي علي», «اقري لي», «جاوبيني»): no son nombres.
    "رد|ردي|ردو|ردوا|ردى|جاوب|جاوبي|جاوبيني|جاوبني|اقري|اقرأي|اقرئي|اقرالي|اقريلي|لي|عليا|عليه|ابي|ابغى|ابغي|بدي|اريد|أريد|بليز|ارجوك|أرجوك|سؤال|سؤالي|دوري|شوفي|شوف|اسمعي|مرحبتين|" +
    "الحمل|الثور|الجوزاء|السرطان|الاسد|الأسد|العذراء|الميزان|العقرب|القوس|الجدي|الدلو|الحوت|abjad|ebced" +
    ")$",
);
/** Risa escrita («ههههه»), letras repetidas («واااو») y palabras de una sola letra repetida no son nombres. */
const RUIDO = /^(?:ه{2,}|خخ+|(.)\1{2,}.*|.*(.)\2{2,}.*)$/;

/** Mensaje que es solo un nombre en letras árabes (una o dos palabras, sin signos de pregunta). */
function nombreArabeSolo(texto: string): string | null {
  const limpio = texto.normalize("NFC").replace(/[ً-ٰٟ]/g, "").replace(/[^\p{L}\s]/gu, " ").replace(/\s+/g, " ").trim();
  if (!limpio || /[?؟\d]/.test(texto) || !esEscrituraArabe(limpio) || /[A-Za-z]/.test(limpio)) return null;
  const palabras = limpio.split(" ");
  if (palabras.length > 2 || palabras.some((p) => p.length < 2 || p.length > 12 || RUIDO.test(p) || NO_NOMBRE.test(p))) return null;
  return limpio;
}

/**
 * Si el mensaje pide la lectura del nombre (o del Yıldızname), los nombres; si no, null. Un mensaje con una pregunta
 * y un «اسمي…» de presentación sigue siendo tarot: solo cuenta si pide el nombre o si el mensaje es solo el nombre.
 */
export function pedidoDeNombre(texto: string): PedidoNombre | null {
  const t = texto.normalize("NFC").replace(/[ً-ٰٟ]/g, "").trim();
  if (!t || t.length > 200) return null;
  const yildiz = PIDE_YILDIZ.test(t);
  const mas = MAS.exec(t);
  if (yildiz || mas) {
    const madre = MADRE.exec(t)?.[1] ?? mas?.[2];
    const nombre = PERSONA.exec(t)?.[1] ?? mas?.[1];
    if (nombre && madre && nombre !== madre) return { tipo: "yildizname", nombre, madre };
    if (nombre) return { tipo: "nombre", nombre };
  }
  if (PIDE_NOMBRE.test(t)) {
    const nombre = PERSONA.exec(t)?.[1] ?? /(?:اسم|إسم|abjad|ebced|أبجد|ابجد)\s*(?:[:：]\s*)?([\p{L}]{2,20})/iu.exec(t)?.[1];
    if (nombre && !/^(?:اسمي|إسمي|أمي|امي)$/.test(nombre)) return { tipo: "nombre", nombre };
  }
  const solo = nombreArabeSolo(t.replace(/^(?:اسمي|إسمي)\s+/, ""));
  if (solo && (/^(?:اسمي|إسمي)\s+/.test(t) ? !/[?؟]/.test(t) : true)) return { tipo: "nombre", nombre: solo };
  return null;
}

const NOMBRE_LETRA = Object.fromEntries(LETRAS_ABJAD.map((l) => [l.letra, l.nombre]));
const ELEMENTO_AR: Record<string, string> = { fuego: "النار", aire: "الهواء", agua: "الماء", tierra: "التراب" };

export interface PreparadoNombre {
  /** Datos para el modelo (en español; Sibila responde en el idioma de la persona). */
  contexto: string;
  instruccion: string;
  numero: number;
  etiqueta: string;
}

/** Las cuentas del nombre o del Yıldızname, listas para la lectura en vivo; null si no hay letras que contar. */
export function prepararNombre(p: PedidoNombre, textoOriginal: string): PreparadoNombre | null {
  const arabe = esEscrituraArabe(textoOriginal);
  const idioma: Idioma = arabe ? "ar" : "en";
  if (p.tipo === "yildizname" && p.madre) {
    const y = calcularYildizname({ nombre: p.nombre, madre: p.madre }, idioma);
    if (y) {
      const signo = SIGNOS.find((s) => s.id === y.signo)!;
      const nombreSigno = arabe ? SIGNOS_IDIOMA.ar[signo.id] : signo.nombre;
      const planeta = arabe ? TEXTOS_YILDIZNAME.ar.planetas[y.planeta] : TEXTOS_YILDIZNAME.es.planetas[y.planeta];
      const dia = arabe ? TEXTOS_YILDIZNAME.ar.dias[y.dia] : TEXTOS_YILDIZNAME.es.dias[y.dia];
      return {
        contexto: `Pide su Yıldızname (يلدز نامه, el «libro de las estrellas»). Nombre: ${p.nombre} (${y.abjad.persona.escritura}) = ${y.abjad.persona.total}. Nombre de su madre: ${p.madre} (${y.abjad.madre?.escritura}) = ${y.abjad.madre?.total}. Suma: ${y.total}. ${y.total} entre 12: resto ${y.resto} → signo ${signo.nombre} (${SIGNOS_IDIOMA.ar[signo.id]}), elemento ${signo.elemento}, planeta ${TEXTOS_YILDIZNAME.es.planetas[y.planeta]}, día ${TEXTOS_YILDIZNAME.es.dias[y.dia]}.`,
        instruccion:
          `${arabe ? "TODA la lectura va en árabe, de la primera a la última palabra. " : ""}` +
          "Lectura del Yıldızname en vivo: en pantalla se ve el total. Di en voz alta la cuenta en una frase (su nombre más el de su madre, el total, y que el resto entre doce da su estrella), y luego lee su estrella: el carácter que marca, su planeta y su día de suerte de la semana, conectado con lo que preguntó si preguntó algo. " +
          "Es la tradición otomana del libro de las estrellas: cuéntala como saber de tradición, nunca con lenguaje religioso. " +
          "Antes del consejo, en una frase, di que su Yıldızname completo (con lo que anuncia para su año) está en el enlace de la bio. No inventes otras cuentas: usa solo estas.",
        numero: y.total,
        etiqueta: arabe ? `نجمك: ${nombreSigno} · ${planeta} · ${dia}` : `Tu estrella: ${nombreSigno} · ${planeta} · ${dia}`,
      };
    }
  }
  const a = calcularAbjad({ nombre: p.nombre }, idioma).persona;
  if (a.total <= 0 || !a.letras.length) return null;
  const primera = a.letras[0];
  const base = letraBase(primera.base) ?? primera.base;
  const elemento = ELEMENTO_LETRA[base] ?? primera.elemento;
  return {
    contexto:
      `Pide la lectura de su nombre por حساب الجُمَّل (abjad). Nombre: ${p.nombre}, escrito ${a.escritura}. Letras: ${a.letras.map((l) => `${l.escrita}=${l.valor}`).join(", ")}. Total: ${a.total}. Raíz: ${a.reduccion.join(" → ")} (raíz ${a.raiz}). ` +
      `Primera letra: ${primera.escrita} (${NOMBRE_LETRA[base] ?? base}), valor ${primera.valor}, elemento ${elemento}. Elementos de sus letras: ${Object.entries(a.elementos).filter(([, n]) => n > 0).map(([e, n]) => `${e} ${n}`).join(", ")}; domina ${a.dominantes.join(" y ")}.`,
    instruccion:
      `${arabe ? "TODA la lectura va en árabe, de la primera a la última palabra. " : ""}Si el campo «Nombre» es una persona (no «لكل من…»), háblale solo a ella por su nombre, no a un grupo. ` +
        "Lectura del nombre en vivo (حساب الجُمَّل): en pantalla se ve el total. Di el valor de su nombre y su raíz en una frase, y dedica lo central a SU PRIMERA LETRA: la letra que abre su nombre y lo gobierna, su elemento y el rasgo que le da (cómo ama, cómo decide, su don). Luego el elemento que domina en sus letras y un anuncio o consejo concreto, conectado con lo que preguntó si preguntó algo. " +
      "Cuéntalo como saber de la tradición de las letras, nunca con lenguaje religioso. " +
      "Antes del consejo, en una frase, di que la lectura completa de su nombre (cómo ama, sus dones, y con el nombre de su madre, su estrella del Yıldızname) está en el enlace de la bio. No inventes otras cuentas: usa solo estas.",
    numero: a.total,
    etiqueta: arabe ? `حساب الجُمَّل · الحرف الأول ${primera.escrita} · ${ELEMENTO_AR[elemento] ?? ""}` : `${p.nombre} · abjad · ${primera.escrita}`,
  };
}
