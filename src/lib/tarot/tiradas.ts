import { randomInt } from "node:crypto";
import { resumenPanorama } from "./panorama";
import type { CartaTarot } from "./deck";
import { MAZOS, type IdMazo } from "./mazos";
import type { TipoLectura } from "../creditos";
import type { Idioma } from "@/lib/i18n/idiomas";

export type TipoTirada = Extract<TipoLectura, "tarot_carta" | "tarot_tres" | "tarot_celta">;

export interface PosicionTirada {
  nombre: string;
  descripcion: string;
}

export interface Tirada {
  id: TipoTirada;
  nombre: string;
  descripcion: string;
  posiciones: PosicionTirada[];
}

export const TIRADAS: Record<TipoTirada, Tirada> = {
  tarot_carta: {
    id: "tarot_carta",
    nombre: "Carta del día",
    descripcion: "Una sola carta para orientar tu jornada o responder una pregunta puntual.",
    posiciones: [{ nombre: "Tu carta", descripcion: "La energía que te acompaña hoy." }],
  },
  tarot_tres: {
    id: "tarot_tres",
    nombre: "Pasado, presente y futuro",
    descripcion: "Tres cartas que muestran de dónde vienes, dónde estás y hacia dónde apunta la situación.",
    posiciones: [
      { nombre: "Pasado", descripcion: "Raíces e influencias que te trajeron hasta aquí." },
      { nombre: "Presente", descripcion: "El corazón de la situación actual." },
      { nombre: "Futuro", descripcion: "La dirección probable si nada cambia." },
    ],
  },
  tarot_celta: {
    id: "tarot_celta",
    nombre: "Cruz Celta",
    descripcion: "La tirada clásica de diez cartas para una lectura profunda de una situación compleja.",
    posiciones: [
      { nombre: "La situación", descripcion: "El asunto central." },
      { nombre: "El desafío", descripcion: "Lo que cruza o tensiona la situación." },
      { nombre: "La raíz", descripcion: "Lo inconsciente, la base del asunto." },
      { nombre: "El pasado", descripcion: "Lo que queda atrás." },
      { nombre: "Lo consciente", descripcion: "Tus metas y lo que tienes en mente." },
      { nombre: "El futuro cercano", descripcion: "Lo que se aproxima." },
      { nombre: "Tú", descripcion: "Tu actitud frente a la situación." },
      { nombre: "El entorno", descripcion: "Influencias de personas y circunstancias." },
      { nombre: "Esperanzas y temores", descripcion: "Lo que deseas y lo que temes." },
      { nombre: "El resultado", descripcion: "Hacia dónde tiende todo." },
    ],
  },
};

/** Nombres de posiciones por idioma para las tiradas (la interfaz). */
export const POSICIONES_I18N: Record<Idioma, Record<TipoTirada, { nombre: string; descripcion: string }[]>> = {
  es: {
    tarot_carta: TIRADAS.tarot_carta.posiciones,
    tarot_tres: TIRADAS.tarot_tres.posiciones,
    tarot_celta: TIRADAS.tarot_celta.posiciones,
  },
  en: {
    tarot_carta: [{ nombre: "Your card", descripcion: "The energy that walks with you today." }],
    tarot_tres: [
      { nombre: "Past", descripcion: "Roots and influences that brought you here." },
      { nombre: "Present", descripcion: "The heart of the current situation." },
      { nombre: "Future", descripcion: "The likely direction if nothing changes." },
    ],
    tarot_celta: [
      { nombre: "The situation", descripcion: "The central matter." },
      { nombre: "The challenge", descripcion: "What crosses or strains the situation." },
      { nombre: "The root", descripcion: "The unconscious, the base of the matter." },
      { nombre: "The past", descripcion: "What is left behind." },
      { nombre: "The conscious", descripcion: "Your goals and what is on your mind." },
      { nombre: "The near future", descripcion: "What is approaching." },
      { nombre: "You", descripcion: "Your attitude toward the situation." },
      { nombre: "The environment", descripcion: "Influences of people and circumstances." },
      { nombre: "Hopes and fears", descripcion: "What you wish for and what you fear." },
      { nombre: "The outcome", descripcion: "Where it all tends to go." },
    ],
  },
  pt: {
    tarot_carta: [{ nombre: "Sua carta", descripcion: "A energia que te acompanha hoje." }],
    tarot_tres: [
      { nombre: "Passado", descripcion: "Raízes e influências que te trouxeram até aqui." },
      { nombre: "Presente", descripcion: "O coração da situação atual." },
      { nombre: "Futuro", descripcion: "A direção provável se nada mudar." },
    ],
    tarot_celta: [
      { nombre: "A situação", descripcion: "O assunto central." },
      { nombre: "O desafio", descripcion: "O que cruza ou tensiona a situação." },
      { nombre: "A raiz", descripcion: "O inconsciente, a base do assunto." },
      { nombre: "O passado", descripcion: "O que fica para trás." },
      { nombre: "O consciente", descripcion: "Suas metas e o que está em sua mente." },
      { nombre: "O futuro próximo", descripcion: "O que se aproxima." },
      { nombre: "Você", descripcion: "Sua atitude diante da situação." },
      { nombre: "O ambiente", descripcion: "Influências de pessoas e circunstâncias." },
      { nombre: "Esperanças e temores", descripcion: "O que você deseja e o que teme." },
      { nombre: "O resultado", descripcion: "Para onde tudo tende." },
    ],
  },
  fr: {
    tarot_carta: [{ nombre: "Ta carte", descripcion: "L'énergie qui t'accompagne aujourd'hui." }],
    tarot_tres: [
      { nombre: "Passé", descripcion: "Les racines et les influences qui ont tracé ton chemin jusqu'ici." },
      { nombre: "Présent", descripcion: "Le cœur de la situation actuelle." },
      { nombre: "Futur", descripcion: "La direction probable si rien ne change." },
    ],
    tarot_celta: [
      { nombre: "La situation", descripcion: "Le sujet central." },
      { nombre: "Le défi", descripcion: "Ce qui croise ou met la situation sous tension." },
      { nombre: "La racine", descripcion: "L'inconscient, la base du sujet." },
      { nombre: "Le passé", descripcion: "Ce qui reste derrière toi." },
      { nombre: "Le conscient", descripcion: "Tes objectifs et ce que tu as en tête." },
      { nombre: "Le futur proche", descripcion: "Ce qui approche." },
      { nombre: "Toi", descripcion: "Ton attitude face à la situation." },
      { nombre: "L'entourage", descripcion: "L'influence des personnes et des circonstances." },
      { nombre: "Espoirs et craintes", descripcion: "Ce que tu désires et ce que tu crains." },
      { nombre: "Le résultat", descripcion: "Là où tout tend." },
    ],
  },
  tr: {
    tarot_carta: [{ nombre: "Kartın", descripcion: "Bugün sana eşlik eden enerji." }],
    tarot_tres: [
      { nombre: "Geçmiş", descripcion: "Seni bugüne getiren kökler ve etkiler." },
      { nombre: "Şimdi", descripcion: "Şu anki durumun özü." },
      { nombre: "Gelecek", descripcion: "Hiçbir şey değişmezse olası yön." },
    ],
    tarot_celta: [
      { nombre: "Durum", descripcion: "Asıl mesele." },
      { nombre: "Zorluk", descripcion: "Durumun önüne çıkan ya da onu geren şey." },
      { nombre: "Kök", descripcion: "Bilinçaltı, meselenin temeli." },
      { nombre: "Geçmiş", descripcion: "Geride kalanlar." },
      { nombre: "Bilinç", descripcion: "Hedeflerin ve aklından geçenler." },
      { nombre: "Yakın gelecek", descripcion: "Yaklaşmakta olan." },
      { nombre: "Sen", descripcion: "Bu durum karşısındaki tavrın." },
      { nombre: "Çevre", descripcion: "İnsanların ve koşulların etkisi." },
      { nombre: "Umutlar ve korkular", descripcion: "Dilediklerin ve korktukların." },
      { nombre: "Sonuç", descripcion: "Her şeyin yöneldiği yer." },
    ],
  },
  ar: {
    tarot_carta: [{ nombre: "ورقتك", descripcion: "الطاقة التي ترافقك اليوم." }],
    tarot_tres: [
      { nombre: "الماضي", descripcion: "الجذور والتأثيرات التي أوصلتك إلى هنا." },
      { nombre: "الحاضر", descripcion: "قلب الوضع الحالي." },
      { nombre: "المستقبل", descripcion: "الاتجاه المرجّح إن لم يتغير شيء." },
    ],
    tarot_celta: [
      { nombre: "الوضع", descripcion: "المسألة الأساسية." },
      { nombre: "التحدي", descripcion: "ما يعترض الوضع أو يضغط عليه." },
      { nombre: "الجذر", descripcion: "اللاوعي، أساس المسألة." },
      { nombre: "الماضي", descripcion: "ما بقي خلفك." },
      { nombre: "الوعي", descripcion: "أهدافك وما يدور في ذهنك." },
      { nombre: "المستقبل القريب", descripcion: "ما يقترب." },
      { nombre: "أنت", descripcion: "موقفك من الوضع." },
      { nombre: "المحيط", descripcion: "تأثير الناس والظروف." },
      { nombre: "الآمال والمخاوف", descripcion: "ما تتمناه وما تخشاه." },
      { nombre: "النتيجة", descripcion: "إلى أين يتجه كل شيء." },
    ],
  },
  id: {
    tarot_carta: [{ nombre: "Kartumu", descripcion: "Energi yang menemanimu hari ini." }],
    tarot_tres: [
      { nombre: "Masa lalu", descripcion: "Akar dan pengaruh yang membawamu sampai ke sini." },
      { nombre: "Masa kini", descripcion: "Inti dari situasi saat ini." },
      { nombre: "Masa depan", descripcion: "Arah yang mungkin terjadi jika tidak ada yang berubah." },
    ],
    tarot_celta: [
      { nombre: "Situasinya", descripcion: "Persoalan utama." },
      { nombre: "Tantangannya", descripcion: "Hal yang menghalangi atau menekan situasi." },
      { nombre: "Akarnya", descripcion: "Alam bawah sadar, dasar dari persoalan." },
      { nombre: "Masa lalu", descripcion: "Hal yang sudah tertinggal di belakang." },
      { nombre: "Kesadaran", descripcion: "Tujuanmu dan apa yang ada di pikiranmu." },
      { nombre: "Masa depan dekat", descripcion: "Hal yang sedang mendekat." },
      { nombre: "Kamu", descripcion: "Sikapmu terhadap situasi ini." },
      { nombre: "Lingkungan", descripcion: "Pengaruh orang-orang dan keadaan di sekitarmu." },
      { nombre: "Harapan dan ketakutan", descripcion: "Apa yang kamu harapkan dan apa yang kamu takutkan." },
      { nombre: "Hasilnya", descripcion: "Ke mana semuanya mengarah." },
    ],
  },
  hi: {
    tarot_carta: [{ nombre: "आपका पत्ता", descripcion: "वह ऊर्जा जो आज आपके साथ है।" }],
    tarot_tres: [
      { nombre: "अतीत", descripcion: "वे जड़ें और प्रभाव जो आपको यहाँ तक लाए।" },
      { nombre: "वर्तमान", descripcion: "मौजूदा स्थिति का मूल।" },
      { nombre: "भविष्य", descripcion: "अगर कुछ न बदले, तो संभावित दिशा।" },
    ],
    tarot_celta: [
      { nombre: "स्थिति", descripcion: "मुख्य विषय।" },
      { nombre: "चुनौती", descripcion: "जो स्थिति को काटता है या उसमें तनाव लाता है।" },
      { nombre: "जड़", descripcion: "अवचेतन, मामले की नींव।" },
      { nombre: "अतीत", descripcion: "जो पीछे छूट गया।" },
      { nombre: "चेतन मन", descripcion: "आपके लक्ष्य और जो आपके मन में है।" },
      { nombre: "निकट भविष्य", descripcion: "जो पास आ रहा है।" },
      { nombre: "आप", descripcion: "इस स्थिति के प्रति आपका रवैया।" },
      { nombre: "परिवेश", descripcion: "लोगों और परिस्थितियों का प्रभाव।" },
      { nombre: "आशाएँ और डर", descripcion: "आप क्या चाहते हैं और किस बात से डरते हैं।" },
      { nombre: "परिणाम", descripcion: "सब कुछ किस ओर जा रहा है।" },
    ],
  },
};

export interface CartaTirada {
  posicion: number;
  cartaId: string;
  invertida: boolean;
}

export function tamanoMazo(mazo: IdMazo) {
  return MAZOS[mazo].cartas.length;
}

/**
 * Convierte las posiciones que la persona eligió en el abanico en cartas del
 * mazo elegido. El orden del mazo y la orientación se deciden aquí, en el
 * servidor, con aleatoriedad criptográfica: elegir una posición no permite
 * elegir carta.
 */
export function cartasDesdeAbanico(tipo: TipoTirada, posicionesAbanico: number[], mazo: IdMazo = "rider"): CartaTirada[] {
  const cartas = MAZOS[mazo].cartas;
  const n = TIRADAS[tipo].posiciones.length;
  const validas =
    posicionesAbanico.length === n &&
    new Set(posicionesAbanico).size === n &&
    posicionesAbanico.every((p) => Number.isInteger(p) && p >= 0 && p < cartas.length);
  if (!validas) throw new Error("Selección de cartas no válida.");

  const indices = cartas.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return posicionesAbanico.map((p, posicion) => ({
    posicion,
    cartaId: cartas[indices[p]].id,
    invertida: MAZOS[mazo].conInvertidas && randomInt(0, 100) < 30,
  }));
}

export function cartasDeTirada(cartas: CartaTirada[], mazo: IdMazo = "rider"): (CartaTirada & { carta: CartaTarot })[] {
  const lista = MAZOS[mazo].cartas;
  return cartas.flatMap((c) => {
    const carta = lista.find((m) => m.id === c.cartaId);
    return carta ? [{ ...c, carta }] : [];
  });
}

/** Texto para el modelo de IA con la tirada completa. */
export function resumenTirada(tipo: TipoTirada, cartas: CartaTirada[], pregunta: string, mazo: IdMazo = "rider") {
  const t = TIRADAS[tipo];
  const lineas = [
    `Mazo: ${MAZOS[mazo].nombre}`,
    `Tirada: ${t.nombre}`,
    `Pregunta de la persona: ${pregunta || "(sin pregunta específica)"}`,
    "Cartas:",
  ];
  for (const c of cartasDeTirada(cartas, mazo)) {
    const pos = t.posiciones[c.posicion];
    const sombra = mazo === "angeles" ? ` Sombra a cuidar: ${c.carta.significadoInvertido}` : "";
    lineas.push(
      `- Posición ${c.posicion + 1} "${pos.nombre}" (${pos.descripcion}): ${c.carta.nombre}${c.invertida ? " INVERTIDA" : ""}. ` +
        `Palabras clave: ${(c.invertida ? c.carta.palabrasClaveInvertida : c.carta.palabrasClave).join(", ")}. ` +
        `Significado: ${c.invertida ? c.carta.significadoInvertido : c.carta.significado}${sombra}`,
    );
  }
  const reveladas = cartasDeTirada(cartas, mazo);
  if (reveladas.length >= 2) lineas.push(resumenPanorama(reveladas.map((c) => ({ ...c.carta, invertida: c.invertida }))));
  return lineas.join("\n");
}
