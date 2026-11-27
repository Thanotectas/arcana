import type { Idioma } from "@/lib/i18n/idiomas";

/*
 * Cálculo abjad (ḥisāb al-jummal; en turco «ebced hesabı») de un nombre. Módulo puro: sirve en el servidor y en el
 * navegador (la vista previa del formulario).
 *
 * Decisiones documentadas:
 * - Valores del uso oriental (mashriqí), en el orden ابجد هوز حطي كلمن سعفص قرشت ثخذ ضظغ.
 * - ة (tāʾ marbūṭa) cuenta como ه (5). ى (alif maqṣūra) cuenta como ي (10), como en موسى o عيسى.
 * - Las formas del alif con hamza (أ إ آ ٱ) y la hamza suelta (ء) cuentan como ا (1); آ cuenta una sola vez.
 *   ؤ e ئ cuentan por la letra que las sostiene (و = 6, ي = 10).
 * - Las letras persas y otomanas cuentan como su letra árabe de base: پ→ب, چ→ج, ژ→ز, گ/ک→ك, ی→ي, ڤ→ف, ۀ/ھ→ه.
 * - Las vocales cortas, la shadda y demás signos no cuentan: la letra doble se cuenta una vez, como se escribe.
 */

export type Elemento = "fuego" | "aire" | "agua" | "tierra";
export const ELEMENTOS: readonly Elemento[] = ["fuego", "aire", "agua", "tierra"];

/** Las 28 letras en el orden abjad, con su valor mashriqí. */
export const LETRAS_ABJAD: readonly { letra: string; valor: number; nombre: string }[] = [
  { letra: "ا", valor: 1, nombre: "alif" },
  { letra: "ب", valor: 2, nombre: "bāʾ" },
  { letra: "ج", valor: 3, nombre: "jīm" },
  { letra: "د", valor: 4, nombre: "dāl" },
  { letra: "ه", valor: 5, nombre: "hāʾ" },
  { letra: "و", valor: 6, nombre: "wāw" },
  { letra: "ز", valor: 7, nombre: "zāy" },
  { letra: "ح", valor: 8, nombre: "ḥāʾ" },
  { letra: "ط", valor: 9, nombre: "ṭāʾ" },
  { letra: "ي", valor: 10, nombre: "yāʾ" },
  { letra: "ك", valor: 20, nombre: "kāf" },
  { letra: "ل", valor: 30, nombre: "lām" },
  { letra: "م", valor: 40, nombre: "mīm" },
  { letra: "ن", valor: 50, nombre: "nūn" },
  { letra: "س", valor: 60, nombre: "sīn" },
  { letra: "ع", valor: 70, nombre: "ʿayn" },
  { letra: "ف", valor: 80, nombre: "fāʾ" },
  { letra: "ص", valor: 90, nombre: "ṣād" },
  { letra: "ق", valor: 100, nombre: "qāf" },
  { letra: "ر", valor: 200, nombre: "rāʾ" },
  { letra: "ش", valor: 300, nombre: "shīn" },
  { letra: "ت", valor: 400, nombre: "tāʾ" },
  { letra: "ث", valor: 500, nombre: "thāʾ" },
  { letra: "خ", valor: 600, nombre: "khāʾ" },
  { letra: "ذ", valor: 700, nombre: "dhāl" },
  { letra: "ض", valor: 800, nombre: "ḍād" },
  { letra: "ظ", valor: 900, nombre: "ẓāʾ" },
  { letra: "غ", valor: 1000, nombre: "ghayn" },
];

export const VALOR: Readonly<Record<string, number>> = Object.fromEntries(LETRAS_ABJAD.map((l) => [l.letra, l.valor]));

/**
 * Elemento de cada letra según la agrupación tradicional de la ciencia de las letras (ʿilm al-ḥurūf): se reparten en
 * ciclo por el orden abjad (fuego, aire, agua, tierra), así: fuego ا ه ط م ف ش ذ · aire ب و ي ن ص ت ض ·
 * agua ج ز ك س ق ث ظ · tierra د ح ل ع ر خ غ. Hay escuelas que intercambian aire y tierra; seguimos la más difundida.
 */
export const ELEMENTO_LETRA: Readonly<Record<string, Elemento>> = Object.fromEntries(LETRAS_ABJAD.map((l, i) => [l.letra, ELEMENTOS[i % 4]]));

/** Variantes que cuentan como otra letra (ver las decisiones arriba). */
const EQUIVALENCIAS: Readonly<Record<string, string>> = {
  "ة": "ه",
  "ى": "ي",
  "أ": "ا",
  "إ": "ا",
  "آ": "ا",
  "ٱ": "ا",
  "ء": "ا",
  "ؤ": "و",
  "ئ": "ي",
  "پ": "ب",
  "چ": "ج",
  "ژ": "ز",
  "گ": "ك",
  "ک": "ك",
  "ی": "ي",
  "ڤ": "ف",
  "ۀ": "ه",
  "ھ": "ه",
};

/** Letra base (de las 28) con la que cuenta un carácter, o null si no cuenta (espacios, vocales cortas, signos). */
export function letraBase(c: string): string | null {
  if (c in VALOR) return c;
  return EQUIVALENCIAS[c] ?? null;
}

/** ¿El texto trae letras árabes? */
export function esEscrituraArabe(texto: string) {
  return /[ء-يٱ-ۓ]/.test(texto);
}

/** Deja solo las letras árabes que cuentan (con sus variantes originales) y los espacios entre palabras. */
export function limpiarEscritura(texto: string, max = 60) {
  const salida: string[] = [];
  for (const c of texto.normalize("NFC")) {
    if (letraBase(c)) salida.push(c);
    else if (/\s/.test(c) && salida.length && salida[salida.length - 1] !== " ") salida.push(" ");
  }
  return salida.join("").trim().slice(0, max);
}

export interface LetraContada {
  /** El carácter tal como está escrito (ة, أ…). */
  escrita: string;
  /** La letra con la que cuenta (ه, ا…). */
  base: string;
  valor: number;
  elemento: Elemento;
}

export interface ValorAbjad {
  escritura: string;
  letras: LetraContada[];
  total: number;
  /** Reducción por suma de cifras: [92, 11, 2]. El último es la raíz (1–9). */
  reduccion: number[];
  raiz: number;
  /** Cuántas letras hay de cada elemento. */
  elementos: Record<Elemento, number>;
  /** El elemento o elementos con más letras (empate: varios). */
  dominantes: Elemento[];
}

export function reducir(n: number): number[] {
  const pasos = [n];
  while (pasos[pasos.length - 1] > 9) {
    pasos.push(String(pasos[pasos.length - 1]).split("").reduce((s, d) => s + Number(d), 0));
  }
  return pasos;
}

export function calcularValor(escritura: string): ValorAbjad {
  const limpia = limpiarEscritura(escritura);
  const letras: LetraContada[] = [];
  for (const c of limpia) {
    const base = letraBase(c);
    if (!base) continue;
    letras.push({ escrita: c, base, valor: VALOR[base], elemento: ELEMENTO_LETRA[base] });
  }
  const total = letras.reduce((s, l) => s + l.valor, 0);
  const reduccion = total > 0 ? reducir(total) : [0];
  const elementos: Record<Elemento, number> = { fuego: 0, aire: 0, agua: 0, tierra: 0 };
  for (const l of letras) elementos[l.elemento]++;
  const maximo = Math.max(...ELEMENTOS.map((e) => elementos[e]));
  const dominantes = maximo > 0 ? ELEMENTOS.filter((e) => elementos[e] === maximo) : [];
  return { escritura: limpia, letras, total, reduccion, raiz: reduccion[reduccion.length - 1], elementos, dominantes };
}

// ---------------------------------------------------------------------------
// Transcripción de letras latinas a árabes
// ---------------------------------------------------------------------------

/**
 * Nombres frecuentes en el mundo árabe, en Turquía y en el África francófona, con su grafía árabe habitual. La clave
 * va en minúsculas y sin acentos (ı→i, ş→s, ç→c, ğ→g, ö→o, ü→u). Mamadou, Mehmet o Mohamed se escriben محمد.
 */
const NOMBRES_CONOCIDOS: Readonly<Record<string, string>> = (() => {
  const grupos: [string, string][] = [
    ["محمد", "muhammad muhammed mohammed mohamed mohammad mohamad muhamed mehmet mehmed mamadou mamadu mohamedou"],
    ["أحمد", "ahmad ahmed ahmet ahmadou amadou hamadou"],
    ["محمود", "mahmoud mahmud mahmut"],
    ["مصطفى", "mustafa mostafa moustafa moustapha mustapha"],
    ["علي", "ali aly"],
    ["عمر", "omar umar omer oumar"],
    ["عثمان", "osman othman uthman ousmane usman othmane"],
    ["حسن", "hasan hassan hassane"],
    ["حسين", "husein hussein hussain husain huseyin houssein"],
    ["إبراهيم", "ibrahim ibrahima brahim ebrahim"],
    ["إسماعيل", "ismail ismael ismaila"],
    ["يوسف", "yusuf yousef youssef yousouf youssouf yusef"],
    ["موسى", "musa moussa mousa"],
    ["عيسى", "isa issa aissa"],
    ["يونس", "yunus younes younous yunes"],
    ["إدريس", "idris idriss idrissa"],
    ["آدم", "adam adama"],
    ["سليمان", "sulayman suleyman souleymane suleiman soulaymane sulaiman"],
    ["سليم", "salim selim"],
    ["سعيد", "said saeed saïd seydou"],
    ["كريم", "karim kerim"],
    ["خالد", "khalid khaled halit"],
    ["حمزة", "hamza hamzah"],
    ["بلال", "bilal"],
    ["طارق", "tariq tarik tarek"],
    ["جمال", "jamal djamel cemal"],
    ["كمال", "kamal kemal"],
    ["أمين", "amin amine emin"],
    ["ياسين", "yassine yasin yacine"],
    ["رشيد", "rachid rashid rasid"],
    ["سمير", "samir"],
    ["سامي", "sami"],
    ["حامد", "hamid hamed"],
    ["صالح", "salih saleh"],
    ["صلاح", "salah"],
    ["زكريا", "zakaria zakariya zekeriya"],
    ["عبد الله", "abdullah abdallah abdoulaye abdulla abdellah"],
    ["عبد الرحمن", "abdurrahman abderrahmane abdelrahman abdourahmane abdulrahman abdourahamane"],
    ["عبد القادر", "abdelkader abdulkadir abdoulkader abdelkadir"],
    ["عبد العزيز", "abdelaziz abdulaziz abdoulaziz"],
    ["أبو بكر", "abubakar aboubacar aboubakar ebubekir boubacar bakary"],
    ["فاطمة", "fatima fatma fatoumata fatimata fatime fatimah"],
    ["عائشة", "aisha aicha aysha aisyah ayse aissatou aichatou"],
    ["خديجة", "khadija khadidja hatice khadijah kadiatou"],
    ["زينب", "zainab zaynab zeynep zeinab"],
    ["مريم", "maryam meryem mariam myriam mariama"],
    ["أمينة", "amina aminata emine"],
    ["حليمة", "halima halime"],
    ["سلمى", "salma selma"],
    ["ليلى", "leila layla leyla laila"],
    ["ياسمين", "yasmin yasmine yasemin jasmine"],
    ["نور", "nour nur noor"],
    ["هدى", "huda houda hoda"],
    ["سارة", "sara sarah"],
    ["رقية", "ruqayya rokia rukiye roukaya"],
    ["زهرة", "zahra zehra zohra"],
    ["نادية", "nadia nadiya"],
    ["إيمان", "iman imane"],
    ["هاجر", "hajar hagar"],
    ["أسماء", "asma asmaa esma"],
  ];
  const mapa: Record<string, string> = {};
  for (const [arabe, variantes] of grupos) for (const v of variantes.split(" ")) mapa[v] = arabe;
  return mapa;
})();

/** Quita acentos y las letras propias del turco para buscar en la lista de nombres conocidos. */
function claveNombre(palabra: string) {
  return palabra
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

const VOCALES = "aeiouyàâäéèêëîïôöûùüıáíóú";

/** Grupos de letras que se leen como un solo sonido (se prueban antes que las letras sueltas). */
const DIGRAFOS: readonly [string, string][] = [
  ["sch", "ش"],
  ["tch", "تش"],
  ["kh", "خ"],
  ["gh", "غ"],
  ["sh", "ش"],
  ["ch", "ش"],
  ["th", "ث"],
  ["dh", "ذ"],
  ["ph", "ف"],
  ["ck", "ك"],
  ["qu", "ك"],
  ["ou", "و"],
  ["oo", "و"],
  ["ee", "ي"],
  ["aa", "ا"],
  ["ai", "ي"],
  ["ei", "ي"],
];

function consonante(c: string, siguiente: string, turco: boolean): string {
  switch (c) {
    case "b":
    case "p":
      return "ب";
    case "c":
      if (turco) return "ج";
      return "eiyéèêëîï".includes(siguiente) ? "س" : "ك";
    case "ç":
      return turco ? "ج" : "س";
    case "d":
      return "د";
    case "f":
      return "ف";
    case "g":
      return turco ? "ك" : "غ";
    case "ğ":
      return "غ";
    case "h":
      return "ه";
    case "j":
      return "ج";
    case "k":
      return "ك";
    case "l":
      return "ل";
    case "m":
      return "م";
    case "n":
      return "ن";
    case "q":
      return "ق";
    case "r":
      return "ر";
    case "s":
      return "س";
    case "ş":
      return "ش";
    case "t":
      return "ت";
    case "v":
      return turco ? "و" : "ف";
    case "w":
      return "و";
    case "x":
      return "كس";
    case "z":
      return "ز";
    case "'":
    case "ʿ":
    case "‘":
    case "`":
      return "ع";
    default:
      return "";
  }
}

function vocal(c: string, inicial: boolean): string {
  const base = claveNombre(c) || c;
  if (base === "a") return "ا";
  if (base === "e" || base === "i" || base === "y") return inicial ? "اي" : "ي";
  if (base === "o" || base === "u") return inicial ? "او" : "و";
  return "";
}

/**
 * Transcribe una palabra latina con la convención con que el árabe escribe los nombres extranjeros: consonantes por su
 * equivalente más cercano y vocales como letras largas (a→ا, e/i→ي, o/u→و), con alif al comienzo si la palabra empieza
 * por vocal. Las letras dobles se escriben una vez (como con shadda). En francés y otros idiomas (no en turco) la «e»
 * final muda tras consonante no se escribe. Es una aproximación: la persona puede corregirla.
 */
function transcribirPalabra(palabra: string, turco: boolean): string {
  const w = palabra;
  const salida: string[] = [];
  let i = 0;
  while (i < w.length) {
    const resto = w.slice(i);
    const inicial = salida.length === 0;
    const digrafo = DIGRAFOS.find(([g]) => resto.startsWith(g));
    if (digrafo && !(turco && digrafo[0] === "ch")) {
      const [g, ar] = digrafo;
      // Vocales dobles al comienzo llevan su alif («Ousmane» → اوسمان).
      salida.push(inicial && "aeiou".includes(g[0]) && ar !== "ا" ? "ا" + ar : ar);
      i += g.length;
      continue;
    }
    const c = w[i];
    const siguiente = w[i + 1] ?? "";
    if (VOCALES.includes(c)) {
      const final = i === w.length - 1;
      const previa = w[i - 1] ?? "";
      // «e» final muda (Pierre, Claire) salvo en turco y en palabras muy cortas.
      if (!turco && final && (c === "e") && w.length > 3 && previa && !VOCALES.includes(previa)) {
        i++;
        continue;
      }
      // «y» delante de vocal es consonante (ي) igual que como vocal.
      salida.push(vocal(c, inicial));
    } else {
      salida.push(consonante(c, siguiente, turco));
    }
    i++;
  }
  // Una letra repetida seguida se escribe una vez (Emma → ايما, Moussa → موسا).
  const letras = salida.join("").split("");
  return letras.filter((l, k) => k === 0 || l !== letras[k - 1]).join("");
}

/**
 * Pasa un nombre escrito en letras latinas a letras árabes. Primero busca cada palabra en la lista de nombres
 * conocidos (Mohamed → محمد, Fatoumata → فاطمة); si no está, la transcribe letra a letra. En turco, c = ج, ç = ج
 * (چ otomana), ş = ش, ğ = غ, g = ك (گ otomana) y v = و, como en la escritura otomana.
 */
export function transliterar(texto: string, idioma: Idioma): string {
  const turco = idioma === "tr";
  const minusculas = texto.normalize("NFC").toLocaleLowerCase(turco ? "tr" : undefined);
  const palabras = minusculas.split(/[\s\-_.,;]+/).filter(Boolean);
  return palabras
    .map((p) => NOMBRES_CONOCIDOS[claveNombre(p)] ?? transcribirPalabra(p.replace(/[^a-zà-ÿçğışöüʿ‘'`]/g, ""), turco))
    .filter(Boolean)
    .join(" ")
    .slice(0, 60);
}

/** La grafía árabe que se usará: la que dio la persona (si trae letras árabes) o la transcripción del nombre. */
export function escrituraDe(nombre: string, escritura: string, idioma: Idioma) {
  const latino = !esEscrituraArabe(nombre);
  const automatica = limpiarEscritura(latino ? transliterar(nombre, idioma) : nombre);
  const final = limpiarEscritura(escritura) || automatica;
  return { escritura: final, transcrita: latino && final !== "" && final === automatica };
}

// ---------------------------------------------------------------------------
// Resultado guardado
// ---------------------------------------------------------------------------

export interface PersonaAbjad extends ValorAbjad {
  nombre: string;
  /** true si la grafía árabe salió de nuestra transcripción automática (sin corregir). */
  transcrita: boolean;
}

export interface ResultadoAbjad {
  persona: PersonaAbjad;
  madre: PersonaAbjad | null;
  /** Nombre + nombre de la madre, como se suma en la tradición (solo si hay madre). */
  conMadre: { total: number; reduccion: number[]; raiz: number } | null;
  /** Lectura completa: el nombre de otra persona, para ver cómo se encuentran los elementos (opcional). */
  otro?: PersonaAbjad | null;
}

export function calcularPersona(nombre: string, escritura: string, idioma: Idioma): PersonaAbjad {
  const e = escrituraDe(nombre, escritura, idioma);
  return { nombre, transcrita: e.transcrita, ...calcularValor(e.escritura) };
}

export function calcularAbjad(datos: { nombre: string; escritura?: string; madre?: string; escrituraMadre?: string }, idioma: Idioma): ResultadoAbjad {
  const persona = calcularPersona(datos.nombre, datos.escritura ?? "", idioma);
  const madre = datos.madre?.trim() || datos.escrituraMadre?.trim() ? calcularPersona(datos.madre?.trim() ?? "", datos.escrituraMadre ?? "", idioma) : null;
  const usable = madre && madre.total > 0 ? madre : null;
  const conMadre = usable ? (() => {
    const total = persona.total + usable.total;
    const reduccion = reducir(total);
    return { total, reduccion, raiz: reduccion[reduccion.length - 1] };
  })() : null;
  return { persona, madre: usable, conMadre };
}
