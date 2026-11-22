import { MAZO, type CartaTarot } from "@/lib/tarot/deck";
import { TAROT_ARCANA } from "@/lib/tarot/arcana";
import type { Idioma } from "@/lib/i18n/idiomas";
import { nombreCarta, palabrasCarta } from "./cartas-idiomas";

/**
 * «El Camino del Loco», fase 1: la carta escondida del día.
 * Cada día (hora de Bogotá) hay una carta oculta del mazo Rider, la misma para
 * todos. Se adivina en 6 intentos: cada intento dice si el grupo (Arcano Mayor
 * o el palo) coincide y si el número de la carta escondida es mayor o menor, y
 * con cada fallo Sibila suelta una pista más.
 * Todo se calcula en el navegador (como los juegos diarios de palabras): no hay
 * nada que proteger, solo diversión.
 */

/** Día del juego número 1. */
export const INICIO_JUEGO = "2026-11-19";
export const MAX_INTENTOS = 6;
export const RACHA_PREMIO = 7;

export function fechaBogota(ahora = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(ahora);
}

export function numeroDeJuego(fecha: string) {
  return Math.round((Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${INICIO_JUEGO}T00:00:00Z`)) / 86_400_000) + 1;
}

/** Fecha (AAAA-MM-DD) de la carta número n. */
export function fechaDeNumero(n: number) {
  return new Date(Date.parse(`${INICIO_JUEGO}T12:00:00Z`) + (n - 1) * 86_400_000).toISOString().slice(0, 10);
}

/** Día anterior a una fecha AAAA-MM-DD. */
export function diaAnterior(fecha: string) {
  return new Date(Date.parse(`${fecha}T12:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
}

/** Milisegundos hasta la medianoche de Bogotá (UTC−5, sin horario de verano). */
export function msHastaNuevaCarta(ahora = Date.now()) {
  const bogota = ahora - 5 * 3_600_000;
  return 86_400_000 - (((bogota % 86_400_000) + 86_400_000) % 86_400_000);
}

function aleatorio(semilla: number) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Las 78 cartas en un orden fijo por ciclo: no se repite ninguna hasta pasar por todas. */
function ordenDelCiclo(ciclo: number, base = 20_261_120) {
  const r = aleatorio(base + ciclo * 7_919);
  const orden = MAZO.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
}

export function cartaDelJuego(numero: number): CartaTarot {
  const n = Math.max(1, numero) - 1;
  return MAZO[ordenDelCiclo(Math.floor(n / MAZO.length))[n % MAZO.length]];
}

// ───────────────────────── Reto maestro ─────────────────────────

/** El reto maestro: otra carta del día, con menos intentos y pistas en clave. Solo para quien encontró la del día. */
export const MAX_INTENTOS_MAESTRO = 4;
/** Puntos extra en el ranking por superar el reto maestro. */
export const PUNTOS_MAESTRO = 3;

export function cartaMaestra(numero: number): CartaTarot {
  const n = Math.max(1, numero) - 1;
  const orden = ordenDelCiclo(Math.floor(n / MAZO.length), 77_031_313);
  let carta = MAZO[orden[n % MAZO.length]];
  // Nunca la misma que la del día.
  if (carta.id === cartaDelJuego(numero).id) carta = MAZO[orden[(n + 1) % MAZO.length]];
  return carta;
}

const ELEMENTO_EN_CLAVE: Record<CartaTarot["elemento"], string> = {
  fuego: "Arde, aunque no la veas.",
  agua: "Fluye y se mete por las grietas.",
  aire: "Corta como el viento.",
  tierra: "Pesa como una piedra en la mano.",
  espiritu: "No le pertenece a ningún elemento.",
};

/** Pistas del reto maestro: más simbólicas, empiezan por su sombra. */
const ELEMENTO_EN_CLAVE_IDIOMA: Record<Exclude<Idioma, "es">, Record<CartaTarot["elemento"], string>> = {
  en: { fuego: "It burns, even if you can't see it.", agua: "It flows and slips through the cracks.", aire: "It cuts like the wind.", tierra: "It weighs like a stone in your hand.", espiritu: "It belongs to no element." },
  pt: { fuego: "Arde, mesmo que você não veja.", agua: "Flui e entra pelas frestas.", aire: "Corta como o vento.", tierra: "Pesa como uma pedra na mão.", espiritu: "Não pertence a nenhum elemento." },
  fr: { fuego: "Elle brûle, même si tu ne la vois pas.", agua: "Elle coule et se glisse dans les fissures.", aire: "Elle tranche comme le vent.", tierra: "Elle pèse comme une pierre dans ta main.", espiritu: "Elle n'appartient à aucun élément." },
  tr: { fuego: "Görmesen de yanıyor.", agua: "Akıyor ve çatlaklardan sızıyor.", aire: "Rüzgâr gibi kesiyor.", tierra: "Avucundaki bir taş kadar ağır.", espiritu: "Hiçbir elemente ait değil." },
  ar: { fuego: "تتّقد، وإن لم تُرَ.", agua: "تسيل وتتسلّل من الشقوق.", aire: "تقطع كالريح.", tierra: "ثقيلة كحجر في اليد.", espiritu: "لا تنتمي إلى أي عنصر." },
  id: { fuego: "Ia membara, meski tak terlihat.", agua: "Ia mengalir dan menyusup lewat celah-celah.", aire: "Ia memotong seperti angin.", tierra: "Ia seberat batu di genggamanmu.", espiritu: "Ia bukan milik elemen mana pun." },
  hi: { fuego: "यह जलता है, भले ही दिखे नहीं।", agua: "यह बहता है और दरारों से रिस जाता है।", aire: "यह हवा की तरह काटता है।", tierra: "यह हथेली पर रखे पत्थर जितना भारी है।", espiritu: "यह किसी भी तत्व का नहीं है।" },
};

export function pistasMaestras(c: CartaTarot, idioma: Idioma = "es"): string[] {
  if (idioma !== "es") {
    const { luz, sombra } = palabrasCarta(c, idioma);
    const e = ELEMENTO_EN_CLAVE_IDIOMA[idioma][c.elemento];
    if (idioma === "en") return [`Sibila speaks in riddles: its shadow is called “${sombra[0]}”.`, e, `An echo of it: “${luz[2]}”. And another shadow: “${sombra[1] ?? sombra[0]}”.`, `When it turns over, it whispers: “${luz[3] ?? luz[0]}”.`];
    if (idioma === "pt") return [`Sibila fala em enigmas: sua sombra se chama “${sombra[0]}”.`, e, `Um eco dela: “${luz[2]}”. E outra sombra: “${sombra[1] ?? sombra[0]}”.`, `Quando se vira, sussurra: “${luz[3] ?? luz[0]}”.`];
    if (idioma === "fr") return [`Sibila parle en énigmes : son ombre s'appelle « ${sombra[0]} ».`, e, `Un écho d'elle : « ${luz[2]} ». Et une autre ombre : « ${sombra[1] ?? sombra[0]} ».`, `Quand elle se retourne, elle murmure : « ${luz[3] ?? luz[0]} ».`];
    if (idioma === "tr") return [`Sibila bilmece gibi konuşuyor: gölgesinin adı “${sombra[0]}”.`, e, `Ondan bir yankı: “${luz[2]}”. Bir gölgesi daha: “${sombra[1] ?? sombra[0]}”.`, `Ters döndüğünde fısıldıyor: “${luz[3] ?? luz[0]}”.`];
    if (idioma === "ar") return [`سيبيلا تتكلّم بالألغاز: ظلّها اسمه «${sombra[0]}».`, e, `صدًى منها: «${luz[2]}». وظلّ آخر: «${sombra[1] ?? sombra[0]}».`, `حين تنقلب تهمس: «${luz[3] ?? luz[0]}».`];
    if (idioma === "id") return [`Sibila berbicara lewat teka-teki: bayangannya bernama “${sombra[0]}”.`, e, `Gemanya: “${luz[2]}”. Dan bayangan lainnya: “${sombra[1] ?? sombra[0]}”.`, `Saat terbalik, ia berbisik: “${luz[3] ?? luz[0]}”.`];
    return [`Sibila पहेलियों में बोलती है: इसकी छाया का नाम है “${sombra[0]}”।`, e, `इसकी एक गूँज: “${luz[2]}”। और एक और छाया: “${sombra[1] ?? sombra[0]}”।`, `उलटने पर यह फुसफुसाता है: “${luz[3] ?? luz[0]}”।`];
  }
  const [s1, s2] = c.palabrasClaveInvertida;
  const sombra = (c.significadoInvertido.match(/[^.!?]+[.!?]+/g) ?? [c.significadoInvertido])[0].trim();
  return [
    `Sibila habla en clave: su sombra se llama «${s1}».`,
    ELEMENTO_EN_CLAVE[c.elemento],
    `Un eco suyo: «${c.palabrasClave[2] ?? c.palabrasClave[1] ?? c.palabrasClave[0]}». Y otra sombra: «${s2 ?? s1}».`,
    `Cuando se voltea dice: «${ocultarNombre(sombra, c).replace(/^Invertid[ao],?\s*/i, "")}»`,
  ];
}

// ───────────────────────── Cartas doradas (Tarot Arcana) ─────────────────────────

/** Encontrar un Arcano Mayor en este número de intentos o menos desbloquea su versión dorada. */
export const INTENTOS_DORADA = 3;

/** La carta del mazo propio Tarot Arcana que equivale a un Arcano Mayor clásico (mismo número). */
export function cartaDorada(c: CartaTarot): CartaTarot | undefined {
  return c.arcano === "mayor" ? TAROT_ARCANA.find((a) => a.numero === c.numero) : undefined;
}

export const imagenDorada = (c: CartaTarot) => {
  const d = cartaDorada(c);
  return d ? `/cartas/arcana/${d.id}.webp` : undefined;
};

/** ¿Esta partida desbloquea la dorada? Mayor encontrado en 3 intentos o menos, o en el reto maestro. */
export function ganaDorada(c: CartaTarot, intentos: string[], maestro = false) {
  if (c.arcano !== "mayor") return false;
  const i = intentos.indexOf(c.id);
  return i >= 0 && (maestro || i < INTENTOS_DORADA);
}

/** Ids (del mazo clásico) de los Mayores con su versión dorada desbloqueada. */
export function doradasDe(partidas: Record<string, string[]>, maestros: Record<string, string[]> = {}) {
  const s = new Set<string>();
  for (const [fecha, intentos] of Object.entries(partidas)) {
    const n = numeroDeJuego(fecha);
    if (n < 1) continue;
    const c = cartaDelJuego(n);
    if (ganaDorada(c, intentos)) s.add(c.id);
  }
  for (const [fecha, intentos] of Object.entries(maestros)) {
    const n = numeroDeJuego(fecha);
    if (n < 1) continue;
    const c = cartaMaestra(n);
    if (ganaDorada(c, intentos, true)) s.add(c.id);
  }
  return s;
}

// ───────────────────────── Comodín de Sibila ─────────────────────────

/** Una ayuda al día: Sibila revela un rasgo de la carta escondida. */
export type Comodin = "grupo" | "paridad" | "rango";

export const COMODINES: { id: Comodin; titulo: string; descripcion: string }[] = [
  { id: "grupo", titulo: "Su grupo", descripcion: "Te digo si es un Arcano Mayor o de qué palo es." },
  { id: "paridad", titulo: "Par o impar", descripcion: "Te digo si su número es par o impar." },
  { id: "rango", titulo: "¿Alto o bajo?", descripcion: "Te digo si su número es 10 o menos, u 11 o más." },
];
const COMODINES_IDIOMA: Record<Exclude<Idioma, "es">, typeof COMODINES> = {
  en: [
    { id: "grupo", titulo: "Its group", descripcion: "I'll tell you if it's a Major Arcana or which suit it is." },
    { id: "paridad", titulo: "Even or odd", descripcion: "I'll tell you if its number is even or odd." },
    { id: "rango", titulo: "High or low?", descripcion: "I'll tell you if its number is 10 or less, or 11 or more." },
  ],
  pt: [
    { id: "grupo", titulo: "Seu grupo", descripcion: "Digo se é um Arcano Maior ou de qual naipe é." },
    { id: "paridad", titulo: "Par ou ímpar", descripcion: "Digo se o número é par ou ímpar." },
    { id: "rango", titulo: "Alto ou baixo?", descripcion: "Digo se o número é 10 ou menos, ou 11 ou mais." },
  ],
  fr: [
    { id: "grupo", titulo: "Son groupe", descripcion: "Je te dis si c'est un Arcane majeur ou à quelle série elle appartient." },
    { id: "paridad", titulo: "Pair ou impair", descripcion: "Je te dis si son numéro est pair ou impair." },
    { id: "rango", titulo: "Haut ou bas ?", descripcion: "Je te dis si son numéro est 10 ou moins, ou 11 ou plus." },
  ],
  tr: [
    { id: "grupo", titulo: "Grubu", descripcion: "Büyük Arkana mı, yoksa hangi takımdan mı, söylerim." },
    { id: "paridad", titulo: "Tek mi, çift mi?", descripcion: "Numarası tek mi çift mi, söylerim." },
    { id: "rango", titulo: "Büyük mü, küçük mü?", descripcion: "Numarası 10 ve altı mı, 11 ve üstü mü, söylerim." },
  ],
  ar: [
    { id: "grupo", titulo: "مجموعتها", descripcion: "أخبرك إن كانت من الأركانا الكبرى أو من أي مجموعة هي." },
    { id: "paridad", titulo: "زوجي أم فردي", descripcion: "أخبرك إن كان رقمها زوجيًا أم فرديًا." },
    { id: "rango", titulo: "مرتفع أم منخفض؟", descripcion: "أخبرك إن كان رقمها 10 أو أقل، أو 11 أو أكثر." },
  ],
  id: [
    { id: "grupo", titulo: "Kelompoknya", descripcion: "Aku beri tahu apakah ini Arkana Mayor atau dari suit apa." },
    { id: "paridad", titulo: "Genap atau ganjil", descripcion: "Aku beri tahu apakah nomornya genap atau ganjil." },
    { id: "rango", titulo: "Tinggi atau rendah?", descripcion: "Aku beri tahu apakah nomornya 10 ke bawah, atau 11 ke atas." },
  ],
  hi: [
    { id: "grupo", titulo: "इसका समूह", descripcion: "मैं बताऊँगी कि यह मेजर आर्काना है या किस सूट का है।" },
    { id: "paridad", titulo: "सम या विषम", descripcion: "मैं बताऊँगी कि इसका नंबर सम है या विषम।" },
    { id: "rango", titulo: "ऊँचा या नीचा?", descripcion: "मैं बताऊँगी कि इसका नंबर 10 या उससे कम है, या 11 या उससे ज़्यादा।" },
  ],
};
export function comodines(idioma: Idioma = "es") {
  return idioma === "es" ? COMODINES : COMODINES_IDIOMA[idioma];
}

export function esComodin(x: unknown): x is Comodin {
  return x === "grupo" || x === "paridad" || x === "rango";
}

function rasgo(c: CartaTarot, tipo: Comodin) {
  if (tipo === "grupo") return grupo(c);
  if (tipo === "paridad") return c.numero % 2 === 0 ? "par" : "impar";
  return c.numero <= 10 ? "bajo" : "alto";
}

/** ¿Esta carta tiene el mismo rasgo que la escondida? (para apagar las que ya no pueden ser). */
export function cumpleComodin(c: CartaTarot, tipo: Comodin, escondida: CartaTarot) {
  return rasgo(c, tipo) === rasgo(escondida, tipo);
}

export function textoComodin(tipo: Comodin, escondida: CartaTarot, idioma: Idioma = "es") {
  const par = escondida.numero % 2 === 0;
  if (idioma === "en") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 My wildcard: it's a Major Arcana." : `🔮 My wildcard: it's from ${nombreGrupo(escondida, "en")}.`;
    if (tipo === "paridad") return `🔮 My wildcard: its number is ${par ? "even" : "odd"}.`;
    return escondida.numero <= 10 ? "🔮 My wildcard: its number is 10 or less." : "🔮 My wildcard: its number is 11 or more (in the suits, that's a court card: Page, Knight, Queen or King).";
  }
  if (idioma === "pt") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 Meu coringa: é um Arcano Maior." : `🔮 Meu coringa: é de ${nombreGrupo(escondida, "pt")}.`;
    if (tipo === "paridad") return `🔮 Meu coringa: o número é ${par ? "par" : "ímpar"}.`;
    return escondida.numero <= 10 ? "🔮 Meu coringa: o número é 10 ou menos." : "🔮 Meu coringa: o número é 11 ou mais (nos naipes, é uma figura: Valete, Cavaleiro, Rainha ou Rei).";
  }
  if (idioma === "fr") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 Mon joker : c'est un Arcane majeur." : `🔮 Mon joker : elle fait partie des ${nombreGrupo(escondida, "fr")}.`;
    if (tipo === "paridad") return `🔮 Mon joker : son numéro est ${par ? "pair" : "impair"}.`;
    return escondida.numero <= 10 ? "🔮 Mon joker : son numéro est 10 ou moins." : "🔮 Mon joker : son numéro est 11 ou plus (dans les séries, c'est une figure : Valet, Cavalier, Reine ou Roi).";
  }
  if (idioma === "tr") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 Jokerim: bir Büyük Arkana kartı." : `🔮 Jokerim: ${nombreGrupo(escondida, "tr")} takımından.`;
    if (tipo === "paridad") return `🔮 Jokerim: numarası ${par ? "çift" : "tek"}.`;
    return escondida.numero <= 10 ? "🔮 Jokerim: numarası 10 ya da daha küçük." : "🔮 Jokerim: numarası 11 ya da daha büyük (takımlarda bu bir saray kartı demek: Prens, Şövalye, Kraliçe ya da Kral).";
  }
  if (idioma === "ar") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 جوكري: إنها من الأركانا الكبرى." : `🔮 جوكري: إنها من ${nombreGrupo(escondida, "ar")}.`;
    if (tipo === "paridad") return `🔮 جوكري: رقمها ${par ? "زوجي" : "فردي"}.`;
    return escondida.numero <= 10 ? "🔮 جوكري: رقمها 10 أو أقل." : "🔮 جوكري: رقمها 11 أو أكثر (في المجموعات الصغرى هذه ورقة من أوراق البلاط: خادم أو فارس أو ملكة أو ملك).";
  }
  if (idioma === "id") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 Jokerku: ini Arkana Mayor." : `🔮 Jokerku: kartunya dari suit ${nombreGrupo(escondida, "id")}.`;
    if (tipo === "paridad") return `🔮 Jokerku: nomornya ${par ? "genap" : "ganjil"}.`;
    return escondida.numero <= 10 ? "🔮 Jokerku: nomornya 10 atau kurang." : "🔮 Jokerku: nomornya 11 atau lebih (di suit, itu kartu istana: Pelayan, Ksatria, Ratu, atau Raja).";
  }
  if (idioma === "hi") {
    if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 मेरा जोकर: यह मेजर आर्काना है।" : `🔮 मेरा जोकर: इसका सूट ${nombreGrupo(escondida, "hi")} है।`;
    if (tipo === "paridad") return `🔮 मेरा जोकर: इसका नंबर ${par ? "सम" : "विषम"} है।`;
    return escondida.numero <= 10 ? "🔮 मेरा जोकर: इसका नंबर 10 या उससे कम है।" : "🔮 मेरा जोकर: इसका नंबर 11 या उससे ज़्यादा है (सूट में यह एक दरबारी कार्ड है: सेवक, शूरवीर, रानी या राजा)।";
  }
  if (tipo === "grupo") return escondida.arcano === "mayor" ? "🔮 Mi comodín: es un Arcano Mayor." : `🔮 Mi comodín: es de ${nombreGrupo(escondida)}.`;
  if (tipo === "paridad") return `🔮 Mi comodín: su número es ${escondida.numero % 2 === 0 ? "par" : "impar"}.`;
  return escondida.numero <= 10
    ? "🔮 Mi comodín: su número es 10 o menos."
    : "🔮 Mi comodín: su número es 11 o más (en los palos, eso es una figura: Sota, Caballo, Reina o Rey).";
}

// ───────────────────────── Premios por completar el álbum ─────────────────────────

export interface PremioAlbum {
  id: string;
  nombre: string;
  creditos: number;
  cartas: CartaTarot[];
}

/** Completar un palo (14 cartas) da 2 créditos; los 22 Mayores, 3; las 78, 5. */
export function premiosAlbum(): PremioAlbum[] {
  const palos = (["bastos", "copas", "espadas", "oros"] as const).map((p) => ({
    id: `palo:${p}`,
    nombre: NOMBRE_GRUPO[p],
    creditos: 2,
    cartas: MAZO.filter((c) => c.palo === p),
  }));
  return [...palos, { id: "camino", nombre: "El Camino del Loco", creditos: 3, cartas: MAZO.filter((c) => c.arcano === "mayor") }, { id: "mazo", nombre: "Todo el tarot", creditos: 5, cartas: MAZO }];
}

export function premiosCompletados(album: ReadonlySet<string>) {
  return premiosAlbum().filter((p) => p.cartas.every((c) => album.has(c.id)));
}

export function premioDelGrupo(g: IdGrupo) {
  return premiosAlbum().find((p) => p.id === (g === "mayor" ? "camino" : `palo:${g}`));
}

// ───────────────────────── Ranking semanal ─────────────────────────

/**
 * Puntos de un día: encontrarla en 1 intento da 7, en 2 da 6… en 6 da 2; usar el comodín resta 1; jugar y no
 * encontrarla da 1 (premia la constancia). El reto maestro suma 3 más.
 */
export function puntosDePartida(gano: boolean, intentos: number, comodin: boolean) {
  if (!gano) return 1;
  return Math.max(1, MAX_INTENTOS + 2 - intentos - (comodin ? 1 : 0));
}

/** Lunes (AAAA-MM-DD) de la semana de una fecha. */
export function inicioSemana(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`);
  const desde = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - desde * 86_400_000).toISOString().slice(0, 10);
}

export function sumarDias(fecha: string, dias: number) {
  return new Date(Date.parse(`${fecha}T12:00:00Z`) + dias * 86_400_000).toISOString().slice(0, 10);
}

export function cartaPorId(id: string) {
  return MAZO.find((c) => c.id === id);
}

const NOMBRE_GRUPO: Record<string, string> = { mayor: "Arcanos Mayores", bastos: "Bastos", copas: "Copas", espadas: "Espadas", oros: "Oros" };
const NOMBRE_GRUPO_IDIOMA: Record<Exclude<Idioma, "es">, Record<string, string>> = {
  en: { mayor: "Major Arcana", bastos: "Wands", copas: "Cups", espadas: "Swords", oros: "Pentacles" },
  pt: { mayor: "Arcanos Maiores", bastos: "Paus", copas: "Copas", espadas: "Espadas", oros: "Ouros" },
  fr: { mayor: "Arcanes majeurs", bastos: "Bâtons", copas: "Coupes", espadas: "Épées", oros: "Deniers" },
  tr: { mayor: "Büyük Arkana", bastos: "Asalar", copas: "Kupalar", espadas: "Kılıçlar", oros: "Tılsımlar" },
  ar: { mayor: "الأركانا الكبرى", bastos: "العصي", copas: "الكؤوس", espadas: "السيوف", oros: "العملات" },
  id: { mayor: "Arkana Mayor", bastos: "Tongkat", copas: "Piala", espadas: "Pedang", oros: "Koin" },
  hi: { mayor: "मेजर आर्काना", bastos: "छड़ियाँ", copas: "प्याले", espadas: "तलवारें", oros: "सिक्के" },
};
/** Nombre corto de cada grupo en las pestañas del selector. */
const NOMBRE_PESTANA: Record<Idioma, Record<string, string>> = {
  es: { mayor: "Mayores", bastos: "Bastos", copas: "Copas", espadas: "Espadas", oros: "Oros" },
  en: { mayor: "Majors", bastos: "Wands", copas: "Cups", espadas: "Swords", oros: "Pentacles" },
  pt: { mayor: "Maiores", bastos: "Paus", copas: "Copas", espadas: "Espadas", oros: "Ouros" },
  fr: { mayor: "Majeurs", bastos: "Bâtons", copas: "Coupes", espadas: "Épées", oros: "Deniers" },
  tr: { mayor: "Büyükler", bastos: "Asalar", copas: "Kupalar", espadas: "Kılıçlar", oros: "Tılsımlar" },
  ar: { mayor: "الكبرى", bastos: "العصي", copas: "الكؤوس", espadas: "السيوف", oros: "العملات" },
  id: { mayor: "Mayor", bastos: "Tongkat", copas: "Piala", espadas: "Pedang", oros: "Koin" },
  hi: { mayor: "मेजर", bastos: "छड़ियाँ", copas: "प्याले", espadas: "तलवारें", oros: "सिक्के" },
};
export function grupo(c: CartaTarot) {
  return c.arcano === "mayor" ? "mayor" : (c.palo ?? "");
}
export function nombreGrupoId(id: string, idioma: Idioma = "es") {
  return (idioma === "es" ? NOMBRE_GRUPO : NOMBRE_GRUPO_IDIOMA[idioma])[id] ?? "";
}
export function nombreGrupo(c: CartaTarot, idioma: Idioma = "es") {
  return nombreGrupoId(grupo(c), idioma);
}
export function nombrePestana(id: string, idioma: Idioma = "es") {
  return NOMBRE_PESTANA[idioma][id] ?? id;
}

export interface Comparacion {
  acierto: boolean;
  grupo: boolean;
  /** Cómo es el número de la carta escondida frente al del intento. */
  numero: "igual" | "mayor" | "menor";
}

export function comparar(intento: CartaTarot, escondida: CartaTarot): Comparacion {
  return {
    acierto: intento.id === escondida.id,
    grupo: grupo(intento) === grupo(escondida),
    numero: escondida.numero === intento.numero ? "igual" : escondida.numero > intento.numero ? "mayor" : "menor",
  };
}

export function emojiDe(c: Comparacion) {
  return `${c.grupo ? "🟪" : "⬛"}${c.numero === "igual" ? "🟪" : c.numero === "mayor" ? "⬆️" : "⬇️"}${c.acierto ? " ✨" : ""}`;
}

const ELEMENTO_IDIOMA: Record<Exclude<Idioma, "es">, Record<CartaTarot["elemento"], string>> = {
  en: {
    fuego: "Its element is fire: it calls for action.",
    agua: "Its element is water: it speaks of emotions.",
    aire: "Its element is air: it lives in the mind and in words.",
    tierra: "Its element is earth: the concrete, the body and money.",
    espiritu: "It has no earthly element: it is a card of the spirit.",
  },
  pt: {
    fuego: "Seu elemento é o fogo: pede ação.",
    agua: "Seu elemento é a água: fala de emoções.",
    aire: "Seu elemento é o ar: vive na mente e na palavra.",
    tierra: "Seu elemento é a terra: o concreto, o corpo e o dinheiro.",
    espiritu: "Não tem elemento terreno: é uma carta do espírito.",
  },
  fr: {
    fuego: "Son élément est le feu : elle appelle à l'action.",
    agua: "Son élément est l'eau : elle parle d'émotions.",
    aire: "Son élément est l'air : elle vit dans la pensée et les mots.",
    tierra: "Son élément est la terre : le concret, le corps et l'argent.",
    espiritu: "Elle n'a pas d'élément terrestre : c'est une carte de l'esprit.",
  },
  tr: {
    fuego: "Elementi ateş: harekete geçmeni istiyor.",
    agua: "Elementi su: duygulardan söz ediyor.",
    aire: "Elementi hava: zihinde ve sözcüklerde yaşıyor.",
    tierra: "Elementi toprak: somut olan, beden ve para.",
    espiritu: "Dünyevi bir elementi yok: bu bir ruh kartı.",
  },
  ar: {
    fuego: "عنصرها النار: تدعو إلى الفعل.",
    agua: "عنصرها الماء: تتحدّث عن المشاعر.",
    aire: "عنصرها الهواء: تعيش في الفكر والكلمات.",
    tierra: "عنصرها الأرض: الملموس والجسد والمال.",
    espiritu: "ليس لها عنصر أرضي: إنها ورقة الروح.",
  },
  id: {
    fuego: "Elemennya api: ia mengajak bertindak.",
    agua: "Elemennya air: ia berbicara tentang emosi.",
    aire: "Elemennya udara: ia hidup di pikiran dan kata-kata.",
    tierra: "Elemennya tanah: hal yang nyata, tubuh, dan uang.",
    espiritu: "Ia tak punya elemen duniawi: ini kartu jiwa.",
  },
  hi: {
    fuego: "इसका तत्व अग्नि है: यह कर्म की ओर बुलाता है।",
    agua: "इसका तत्व जल है: यह भावनाओं की बात करता है।",
    aire: "इसका तत्व वायु है: यह मन और शब्दों में बसता है।",
    tierra: "इसका तत्व पृथ्वी है: ठोस चीज़ें, शरीर और पैसा।",
    espiritu: "इसका कोई सांसारिक तत्व नहीं: यह आत्मा का कार्ड है।",
  },
};

const ELEMENTO: Record<CartaTarot["elemento"], string> = {
  fuego: "Su elemento es el fuego: pide acción.",
  agua: "Su elemento es el agua: habla de emociones.",
  aire: "Su elemento es el aire: vive en la mente y la palabra.",
  tierra: "Su elemento es la tierra: lo concreto, el cuerpo y el dinero.",
  espiritu: "No tiene un elemento terrenal: es una carta del espíritu.",
};

function ocultarNombre(texto: string, c: CartaTarot) {
  const nombre = c.nombre.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // También se lleva el artículo de delante («el Cuatro de Copas» → «esta carta»).
  return texto.replace(new RegExp(`(\\b(?:el|la|los|las)\\s+)?${nombre}`, "gi"), "esta carta");
}

/**
 * Pistas de Sibila, en orden: la primera se ve desde el comienzo y se suma una
 * por cada intento fallido (hasta cinco más).
 */
export function pistas(c: CartaTarot, idioma: Idioma = "es"): string[] {
  if (idioma !== "es") {
    const { luz, sombra } = palabrasCarta(c, idioma);
    const e = ELEMENTO_IDIOMA[idioma][c.elemento];
    if (idioma === "en") return [`Sibila whispers: “${luz[0]}”.`, e, `Another word that goes with it: “${luz[1]}”.`, `One more: “${luz[2]}”.`, `And this one too: “${luz[3] ?? luz[2]}”.`, `Its shadow, when reversed: “${sombra.join(", ")}”.`];
    if (idioma === "pt") return [`Sibila sussurra: “${luz[0]}”.`, e, `Outra palavra que a acompanha: “${luz[1]}”.`, `Mais uma: “${luz[2]}”.`, `E esta também: “${luz[3] ?? luz[2]}”.`, `Sua sombra, quando sai invertida: “${sombra.join(", ")}”.`];
    if (idioma === "fr") return [`Sibila murmure : « ${luz[0]} ».`, e, `Un autre mot qui l'accompagne : « ${luz[1]} ».`, `Encore un : « ${luz[2]} ».`, `Et celui-ci aussi : « ${luz[3] ?? luz[2]} ».`, `Son ombre, quand elle sort à l'envers : « ${sombra.join(", ")} ».`];
    if (idioma === "tr") return [`Sibila fısıldıyor: “${luz[0]}”.`, e, `Ona eşlik eden bir kelime daha: “${luz[1]}”.`, `Bir tane daha: “${luz[2]}”.`, `Bu da var: “${luz[3] ?? luz[2]}”.`, `Ters çıktığında gölgesi: “${sombra.join(", ")}”.`];
    if (idioma === "ar") return [`سيبيلا تهمس: «${luz[0]}».`, e, `كلمة أخرى ترافقها: «${luz[1]}».`, `وأخرى: «${luz[2]}».`, `وهذه أيضًا: «${luz[3] ?? luz[2]}».`, `ظلّها حين تظهر مقلوبة: «${sombra.join("، ")}».`];
    if (idioma === "id") return [`Sibila berbisik: “${luz[0]}”.`, e, `Kata lain yang menyertainya: “${luz[1]}”.`, `Satu lagi: “${luz[2]}”.`, `Dan yang ini juga: “${luz[3] ?? luz[2]}”.`, `Bayangannya, saat keluar terbalik: “${sombra.join(", ")}”.`];
    return [`Sibila फुसफुसाती है: “${luz[0]}”।`, e, `इसके साथ चलने वाला एक और शब्द: “${luz[1]}”।`, `एक और: “${luz[2]}”।`, `और यह भी: “${luz[3] ?? luz[2]}”।`, `उलटा आने पर इसकी छाया: “${sombra.join(", ")}”।`];
  }
  const [p1, p2, p3] = c.palabrasClave;
  return [
    `Sibila susurra: «${p1}».`,
    ELEMENTO[c.elemento],
    `Otra palabra que la acompaña: «${p2 ?? p3 ?? p1}».`,
    `En el amor dice: «${ocultarNombre(c.amor, c)}»`,
    `En el trabajo dice: «${ocultarNombre(c.trabajo, c)}»`,
    `Su sombra, cuando sale invertida: «${c.palabrasClaveInvertida.slice(0, 2).join(", ")}».`,
  ];
}

/** El mensaje del día al descubrirla: las dos primeras frases de su significado. */
export function mensajeDelDia(c: CartaTarot) {
  const frases = c.significado.match(/[^.!?]+[.!?]+/g) ?? [c.significado];
  return frases.slice(0, 2).join(" ").trim();
}

/**
 * Para buscar sin tildes ni mayúsculas. La «ı» turca (sin punto) no se descompone con NFD, así que se cambia a «i»
 * a mano («Yıldız» → «yildiz»; la «İ» ya queda en «i»). Los apóstrofos curvos del teclado del celular («L’Étoile»)
 * cuentan como el recto.
 * En árabe se quitan las vocales cortas (harakat), el tatweel y la hamza sobre o bajo la alif (NFD la separa:
 * «الإمبراطورة» → «الامبراطورة»), y la alif maqsura y la ta marbuta cuentan como «ي» y «ه», que es como suele
 * escribirse en el teclado. En devanagari se quita el nukta («फ़» → «फ») y el chandrabindu cuenta como anusvara.
 */
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/[’‘ʼ´`]/g, "'")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/\u0671/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .replace(/\u093C/g, "")
    .replace(/\u0901/g, "\u0902")
    .trim();
}

/**
 * Busca por el nombre en el idioma, en español (el del mazo) y en inglés: así quien juega en árabe o en hindi puede
 * escribir también con letras latinas («Moon», «Ace of Cups»).
 */
export function buscarCartas(texto: string, excluir: ReadonlySet<string>, limite = 8, idioma: Idioma = "es") {
  const q = normalizar(texto);
  if (!q) return [];
  return MAZO.filter(
    (c) => !excluir.has(c.id) && (normalizar(nombreCarta(c, idioma)).includes(q) || normalizar(c.nombre).includes(q) || normalizar(nombreCarta(c, "en")).includes(q)),
  ).slice(0, limite);
}

// ───────────────────────── Progreso guardado en el navegador ─────────────────────────

export interface Progreso {
  /** Intentos (ids de carta) por fecha. */
  partidas: Record<string, string[]>;
  jugadas: number;
  ganadas: number;
  racha: number;
  mejorRacha: number;
  /** Última fecha terminada (ganada o perdida). */
  ultima: string | null;
  /** Cuántas se ganaron en 1, 2… 6 intentos. */
  distribucion: number[];
  /** Ids de las cartas descubiertas: el álbum. */
  album: string[];
}

export const PROGRESO_VACIO: Progreso = { partidas: {}, jugadas: 0, ganadas: 0, racha: 0, mejorRacha: 0, ultima: null, distribucion: [0, 0, 0, 0, 0, 0], album: [] };

/** Suma una partida terminada al progreso. La racha cuenta días seguidos jugando. */
export function terminarPartida(p: Progreso, fecha: string, intentos: string[], gano: boolean, cartaId: string): Progreso {
  if (p.ultima === fecha) return p;
  const racha = p.ultima === diaAnterior(fecha) ? p.racha + 1 : 1;
  const distribucion = [...p.distribucion];
  if (gano) distribucion[intentos.length - 1] = (distribucion[intentos.length - 1] ?? 0) + 1;
  return {
    ...p,
    partidas: { ...p.partidas, [fecha]: intentos },
    jugadas: p.jugadas + 1,
    ganadas: p.ganadas + (gano ? 1 : 0),
    racha,
    mejorRacha: Math.max(p.mejorRacha, racha),
    ultima: fecha,
    distribucion,
    album: gano && !p.album.includes(cartaId) ? [...p.album, cartaId] : p.album,
  };
}

/**
 * El resultado en pocas letras, para el enlace y la imagen (sin revelar la carta): por intento, «1» o «0» según el
 * grupo, y «i», «m» o «n» según el número (igual, mayor, menor). Ej.: «0n1m1i».
 */
export function codigoResultado(comparaciones: Comparacion[]) {
  return comparaciones.map((c) => `${c.grupo ? 1 : 0}${c.numero === "igual" ? "i" : c.numero === "mayor" ? "m" : "n"}`).join("");
}

export interface ResultadoCompartido {
  numero: number;
  filas: Comparacion[];
  gano: boolean;
  racha: number;
}

/** Lee un resultado compartido (?n=&f=&ra=). null si no es válido. */
export function leerResultado(n: unknown, f: unknown, ra: unknown): ResultadoCompartido | null {
  const numero = Number(n);
  const codigo = typeof f === "string" ? f : "";
  if (!Number.isInteger(numero) || numero < 1 || numero > 100_000 || !/^([01][imn]){1,6}$/.test(codigo)) return null;
  const filas: Comparacion[] = (codigo.match(/../g) ?? []).map((par) => {
    const grupo = par[0] === "1";
    const numeroC = par[1] === "i" ? "igual" : par[1] === "m" ? "mayor" : "menor";
    return { grupo, numero: numeroC, acierto: grupo && numeroC === "igual" };
  });
  // Solo el último puede ser el acierto; si hubo uno antes, el código no es válido.
  if (filas.slice(0, -1).some((x) => x.acierto)) return null;
  const gano = filas[filas.length - 1].acierto;
  if (!gano && filas.length !== MAX_INTENTOS) return null;
  const racha = Math.min(9999, Math.max(0, Math.floor(Number(ra) || 0)));
  return { numero, filas, gano, racha };
}

export function enlaceResultado(sitio: string, numero: number, comparaciones: Comparacion[], racha: number) {
  return `${sitio}/juego?n=${numero}&f=${codigoResultado(comparaciones)}${racha > 1 ? `&ra=${racha}` : ""}`;
}

/** Texto para compartir: sin revelar la carta. */
const COMPARTIR: Record<Idioma, { juego: string; comodin: string; racha: (n: number) => string; reto: string }> = {
  es: { juego: "El Camino del Loco", comodin: " (con comodín)", racha: (n) => `🔥 ${n} días seguidos`, reto: "¿Adivinas la carta de hoy?" },
  en: { juego: "The Fool's Journey", comodin: " (with wildcard)", racha: (n) => `🔥 ${n}-day streak`, reto: "Can you guess today's card?" },
  pt: { juego: "O Caminho do Louco", comodin: " (com coringa)", racha: (n) => `🔥 ${n} dias seguidos`, reto: "Você adivinha a carta de hoje?" },
  fr: { juego: "Le Chemin du Fou", comodin: " (avec joker)", racha: (n) => `🔥 ${n} jours d'affilée`, reto: "Tu devines la carte du jour ?" },
  tr: { juego: "Deli'nin Yolculuğu", comodin: " (jokerle)", racha: (n) => `🔥 Seri: ${n} gün`, reto: "Bugünün kartını bulabilir misin?" },
  ar: { juego: "رحلة الأحمق", comodin: " (مع الجوكر)", racha: (n) => `🔥 السلسلة: ${n} ${n <= 10 ? "أيام" : "يومًا"}`, reto: "من يخمّن ورقة اليوم؟" },
  id: { juego: "Perjalanan The Fool", comodin: " (pakai joker)", racha: (n) => `🔥 Streak ${n} hari`, reto: "Bisa tebak kartu hari ini?" },
  hi: { juego: "द फ़ूल की यात्रा", comodin: " (जोकर के साथ)", racha: (n) => `🔥 लगातार ${n} दिन`, reto: "क्या आप आज का कार्ड पहचान सकते हैं?" },
};

export function textoParaCompartir(numero: number, comparaciones: Comparacion[], gano: boolean, racha: number, sitio: string, comodin = false, idioma: Idioma = "es") {
  const t = COMPARTIR[idioma];
  return [
    `🔮 ${t.juego} \u2066#${numero}\u2069 · ${gano ? comparaciones.length : "X"}/${MAX_INTENTOS}${comodin ? t.comodin : ""}`,
    ...comparaciones.map(emojiDe),
    racha > 1 ? t.racha(racha) : "",
    `${t.reto} ${enlaceResultado(sitio, numero, comparaciones, racha)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

// ───────────────────────── Selector visual ─────────────────────────

export const GRUPOS = [
  { id: "mayor", nombre: "Mayores", icono: "✦" },
  { id: "bastos", nombre: "Bastos", icono: "🔥" },
  { id: "copas", nombre: "Copas", icono: "💧" },
  { id: "espadas", nombre: "Espadas", icono: "🗡️" },
  { id: "oros", nombre: "Oros", icono: "🪙" },
] as const;
export type IdGrupo = (typeof GRUPOS)[number]["id"];

/** Emblema ilustrado de cada grupo (estrella, bastón, copa, espada y pentáculo). */
export const emblemaGrupo = (id: IdGrupo) => `/juego/grupos/${id}.webp`;

export function cartasDelGrupo(g: IdGrupo) {
  return MAZO.filter((c) => grupo(c) === g).sort((a, b) => a.numero - b.numero);
}

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const CORTE: Record<number, string> = { 1: "As", 11: "Sota", 12: "Caballo", 13: "Reina", 14: "Rey" };

/** Lo que se ve en la casilla del selector: número arriba y nombre corto abajo. */
const CORTE_IDIOMA: Record<Exclude<Idioma, "es">, Record<number, string>> = {
  en: { 1: "Ace", 11: "Page", 12: "Knight", 13: "Queen", 14: "King" },
  pt: { 1: "Ás", 11: "Valete", 12: "Cavaleiro", 13: "Rainha", 14: "Rei" },
  fr: { 1: "As", 11: "Valet", 12: "Cavalier", 13: "Reine", 14: "Roi" },
  tr: { 1: "As", 11: "Prens", 12: "Şövalye", 13: "Kraliçe", 14: "Kral" },
  ar: { 1: "آس", 11: "خادم", 12: "فارس", 13: "ملكة", 14: "ملك" },
  id: { 1: "As", 11: "Pelayan", 12: "Ksatria", 13: "Ratu", 14: "Raja" },
  hi: { 1: "इक्का", 11: "सेवक", 12: "शूरवीर", 13: "रानी", 14: "राजा" },
};

export function rotuloCasilla(c: CartaTarot, idioma: Idioma = "es") {
  if (c.arcano === "mayor") return { numero: ROMANOS[c.numero] ?? String(c.numero), nombre: nombreCarta(c, idioma).replace(/^(?:(?:El|La|Los|Las|The|O|A|Os|As|Le|Les|द)\s+|L')/, "") };
  return { numero: String(c.numero), nombre: (idioma === "es" ? CORTE : CORTE_IDIOMA[idioma])[c.numero] ?? "" };
}

/** Cartas que todavía pueden ser la escondida según lo que dijeron los intentos. */
export function posibles(intentos: CartaTarot[], resultados: Comparacion[], filtro?: (c: CartaTarot) => boolean) {
  return new Set(
    MAZO.filter((c) =>
      (!filtro || filtro(c)) &&
      intentos.every((g, i) => {
        const r = comparar(g, c);
        const s = resultados[i];
        return r.acierto === s.acierto && r.grupo === s.grupo && r.numero === s.numero;
      }),
    ).map((c) => c.id),
  );
}

// ───────────────────────── Reacción de Sibila a cada intento ─────────────────────────

export type Calor = "frio" | "tibio" | "caliente";

const FRASES: Record<Calor, string[]> = {
  caliente: ["¡Uy, casi! 🔥 Estás muy cerca.", "¡Caliente, caliente! 🔥 La tienes al lado.", "Se me erizó la piel 🔥 Estás a nada.", "¡Ahí, ahí! 🔥 Un pasito más."],
  tibio: ["Vas por buen camino ✨", "Tibio… 🌙 Algo de eso hay.", "Mmm, te estás acercando ✨", "No es esa, pero vas bien 🌙"],
  frio: ["Frío, frío ❄️", "Esa no… está lejos ❄️", "Ni cerca 😏 Escucha mi pista.", "Se escondió mejor que eso ❄️"],
};

/**
 * Lo que Sibila dice después de un intento fallido: caliente si acertó el grupo y el número está a 2 o menos,
 * tibio si acertó el grupo o el número está cerca, frío si no.
 */
const FRASES_IDIOMA: Record<Exclude<Idioma, "es">, Record<Calor, string[]>> = {
  en: {
    caliente: ["Ooh, so close! 🔥 You're right there.", "Hot, hot! 🔥 It's right next to it.", "I got goosebumps 🔥 You're almost there.", "There, there! 🔥 One more little step."],
    tibio: ["You're on the right path ✨", "Warm… 🌙 There's something to it.", "Mmm, you're getting closer ✨", "Not that one, but you're doing well 🌙"],
    frio: ["Cold, cold ❄️", "Not that one… it's far away ❄️", "Not even close 😏 Listen to my clue.", "It hid better than that ❄️"],
  },
  pt: {
    caliente: ["Uau, quase! 🔥 Está muito perto.", "Quente, quente! 🔥 Está do lado.", "Me arrepiei 🔥 Falta nada.", "Aí, aí! 🔥 Só mais um passinho."],
    tibio: ["Você está no caminho certo ✨", "Morno… 🌙 Tem algo aí.", "Hmm, está chegando perto ✨", "Não é essa, mas você vai bem 🌙"],
    frio: ["Frio, frio ❄️", "Essa não… está longe ❄️", "Nem perto 😏 Escute minha pista.", "Ela se escondeu melhor que isso ❄️"],
  },
  fr: {
    caliente: ["Oh, presque ! 🔥 Tu es tout près.", "Chaud, chaud ! 🔥 Elle est juste à côté.", "J'en ai des frissons 🔥 Tu y es presque.", "Là, là ! 🔥 Encore un petit pas."],
    tibio: ["Tu es sur la bonne voie ✨", "Tiède… 🌙 Il y a quelque chose.", "Mmm, tu te rapproches ✨", "Ce n'est pas celle-là, mais tu t'en sors bien 🌙"],
    frio: ["Froid, froid ❄️", "Pas celle-là… elle est loin ❄️", "Loin de là 😏 Écoute mon indice.", "Elle s'est mieux cachée que ça ❄️"],
  },
  tr: {
    caliente: ["Ooo, az kaldı! 🔥 Çok yakınsın.", "Sıcak, sıcak! 🔥 Hemen yanında.", "Tüylerim diken diken oldu 🔥 Neredeyse buldun.", "İşte orada! 🔥 Bir adım daha."],
    tibio: ["Doğru yoldasın ✨", "Ilık… 🌙 Bunda bir şey var.", "Hmm, yaklaşıyorsun ✨", "O değil ama iyi gidiyorsun 🌙"],
    frio: ["Soğuk, soğuk ❄️", "O değil… çok uzakta ❄️", "Hiç yakın değil 😏 İpucumu dinle.", "Bundan daha iyi saklandı ❄️"],
  },
  ar: {
    caliente: ["أوه، قريبة جدًا! 🔥 بينك وبينها خطوة.", "ساخن، ساخن! 🔥 إنها بجوارها تمامًا.", "سرت فيّ قشعريرة 🔥 اقتربت كثيرًا.", "هناك، هناك! 🔥 خطوة صغيرة أخرى."],
    tibio: ["على الطريق الصحيح ✨", "دافئ… 🌙 هناك شيء من ذلك.", "مممم، المسافة تقصر ✨", "ليست هذه، لكن الطريق صحيح 🌙"],
    frio: ["بارد، بارد ❄️", "ليست هذه… إنها بعيدة ❄️", "ولا حتى قريبة 😏 تلميحي سيساعدك.", "اختبأت أفضل من ذلك ❄️"],
  },
  id: {
    caliente: ["Wah, nyaris! 🔥 Kamu dekat sekali.", "Panas, panas! 🔥 Kartunya tepat di sebelahnya.", "Aku sampai merinding 🔥 Sedikit lagi.", "Di situ, di situ! 🔥 Satu langkah kecil lagi."],
    tibio: ["Kamu di jalan yang benar ✨", "Hangat… 🌙 Ada sesuatu di situ.", "Hmm, kamu makin dekat ✨", "Bukan yang itu, tapi kamu sudah bagus 🌙"],
    frio: ["Dingin, dingin ❄️", "Bukan yang itu… masih jauh ❄️", "Jauh sekali 😏 Dengarkan petunjukku.", "Kartunya bersembunyi lebih pintar dari itu ❄️"],
  },
  hi: {
    caliente: ["अरे, बस ज़रा-सा! 🔥 आप बहुत क़रीब हैं।", "गर्म, गर्म! 🔥 यह ठीक बगल में है।", "मेरे तो रोंगटे खड़े हो गए 🔥 आप लगभग पहुँच गए।", "वहीं, वहीं! 🔥 बस एक छोटा क़दम और।"],
    tibio: ["आप सही राह पर हैं ✨", "गुनगुना… 🌙 कुछ तो बात है।", "हम्म, आप क़रीब आ रहे हैं ✨", "यह नहीं, पर आप अच्छा कर रहे हैं 🌙"],
    frio: ["ठंडा, ठंडा ❄️", "यह नहीं… यह बहुत दूर है ❄️", "पास भी नहीं 😏 मेरा संकेत सुनिए।", "यह इससे बेहतर छिपा है ❄️"],
  },
};

export function reaccion(intento: CartaTarot, escondida: CartaTarot, vez: number, idioma: Idioma = "es"): { texto: string; calor: Calor } {
  const mismoGrupo = grupo(intento) === grupo(escondida);
  const distancia = Math.abs(intento.numero - escondida.numero);
  const calor: Calor = mismoGrupo && distancia <= 2 ? "caliente" : mismoGrupo || distancia <= 2 ? "tibio" : "frio";
  const frases = (idioma === "es" ? FRASES : FRASES_IDIOMA[idioma])[calor];
  return { texto: frases[(vez + escondida.numero) % frases.length], calor };
}
