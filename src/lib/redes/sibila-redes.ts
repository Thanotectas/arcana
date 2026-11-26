import "server-only";
import { publicacionDelDirecto } from "@/lib/en-vivo-facebook";
import { pareceConsulta, tipoDeMensaje } from "@/lib/en-vivo";
import { PROXIMO_DIRECTO, estadoDirecto } from "@/lib/marca/directo";
import { VOZ_NATURAL } from "./voz-sibila";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import sharp from "sharp";
import { generarTexto, type ImagenEntrada } from "@/lib/ia";
import { COSTOS } from "@/lib/creditos";
import { SIGNOS, signoPorLongitud, type Signo } from "@/lib/zodiaco";
import { posiciones } from "@/lib/astro/efemerides";
import { TEMAS_MANUAL, manual } from "@/lib/conocimiento";
import { horoscopoDelDia } from "@/lib/horoscopo";
import { hechos } from "@/lib/whatsapp/sibila";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { fechaBogota } from "./carta-dia";
import { enviarImagenDirecta, enviarMensajeDirecto, responderComentario, textoDePublicacion, type Interaccion, type RedSibila } from "./meta";
import { responderComentarioYoutube, textoDeVideo } from "./youtube";
import { esPublicacionAbjad, idiomaDePublicacion, nombreDelComentario, respuestaNombreAbjad } from "./abjad-comentarios";
import { esPublicacionYildizname, respuestaYildizname } from "./yildizname-comentarios";
import { esPublicacionCartaNacimiento, respuestaCartaNacimiento } from "./nacimiento-comentarios";
import { esPublicacionCompatibilidad, respuestaCompatibilidad } from "./compatibilidad-comentarios";
import { anotarFoto, leerMarcas, type MarcaFoto } from "./foto-anotada";
import { BUCKET } from "./reel";
import { sinEnlaces } from "./sin-enlaces";
import { randomInt } from "node:crypto";
import { MAZO } from "@/lib/tarot/deck";
import { idiomaConversacion, idiomaEquivocado, respuestaFotoFija, respuestaLimite, respuestasDirecto } from "./respuestas-fijas";
import { nombreCarta } from "@/lib/juego/cartas-idiomas";
import type { Idioma } from "@/lib/i18n/idiomas";

const IDIOMAS_LECTURA: Idioma[] = ["en", "pt", "fr", "tr", "ar", "id", "hi"];

const NOMBRE_RED: Record<RedSibila, string> = { instagram: "Instagram", facebook: "Facebook", youtube: "YouTube" };
/** Para las plantillas de abjad y Yıldızname: en YouTube, como en Facebook, «el enlace de nuestro perfil». */
const redPlantilla = (red: RedSibila) => (red === "instagram" ? "instagram" : "facebook");

/**
 * Sibila responde en Instagram y Facebook: a los comentarios de las
 * publicaciones (si alguien comenta su signo, con una línea de su horóscopo
 * de hoy) y a los mensajes directos (como en WhatsApp, con los hechos de
 * Arcana). No hace lecturas de texto; invita a la carta del día gratis. Si
 * llega la foto de una limpia con huevo, da un adelanto gratis (el presente
 * que muestra el vaso) e invita a la completa en miarcana.com/huevo, que es la
 * que lee lo que viene.
 */
const MARCA_OMITIR = "«OMITIR»";
const MARCA_HUMANO = "«PASAR_A_PERSONA»";
/** Sibila la escribe cuando hizo la lectura básica gratis por mensaje: así se cuenta (una por persona en 30 días, junto con las de foto). */
const MARCA_LECTURA = "«LECTURA_BASICA»";
const DETALLE_LECTURA = "lectura básica por mensaje";

/** Topes diarios por red y tipo: frenan el gasto si una publicación se dispara. */
const MAXIMO_DIA = { comentario: 200, mensaje: 150 } as const;
/** Respuestas a una misma persona en una misma publicación por día. */
const MAXIMO_POR_PERSONA_Y_PUBLICACION = 2;
/** Fotos que Sibila lee al día entre todas las redes (cada una cuesta unos centavos). REDES_FOTOS_DIA lo cambia; REDES_FOTOS=0 lo apaga. */
const MAXIMO_FOTOS_DIA = Number(process.env.REDES_FOTOS_DIA) || 50;
/** Prefijo del texto guardado cuando la interacción trae foto (así se cuentan sin otra columna). */
const MARCA_FOTO = "[foto]";
/** Mensajes directos: una lectura de foto por persona (en 30 días) y pocas respuestas al día; después, a la página. */
const LECTURAS_POR_PERSONA = Number(process.env.REDES_LECTURAS_POR_PERSONA) || 1;
const RESPUESTAS_POR_PERSONA_DIA = Number(process.env.REDES_RESPUESTAS_POR_PERSONA) || 3;
const DETALLE_LIMITE = "límite por persona: llevada a la página";
const DETALLE_FOTO_FIJA = "respuesta fija a la foto";
/** Por si alguien escribe sin parar (hubo días de 48 mensajes): pasado esto, Sibila ya no responde ese día. */
const TOPE_SEGURIDAD_DIA = Number(process.env.REDES_TOPE_PERSONA_DIA) || 12;
const INSTRUCCION_PAGINA = (motivo: "foto" | "conversacion") => `Estás respondiendo un mensaje directo de Arcana, como Sibila, a alguien con quien ya conversaste ${motivo === "foto" ? "y a quien ya le hiciste su lectura de regalo de una foto por aquí" : "bastante hoy"}.
Ahora ya no haces lecturas ni sigues la conversación por mensaje: con mucho cariño la llevas a seguir en la página. Así:
- Primero, una frase cálida que responda de verdad a lo que escribió (agradece, acompaña lo que siente o celebra lo que cuenta), con su nombre si lo sabes. ${motivo === "foto" ? "Si mandó otra foto, dile que se ve que tiene ganas de seguir leyendo sus vasos, sin leerla." : "No respondas preguntas de lectura (qué significa, qué viene, si volverá): eso se ve en la página."}
- Luego invítala, sin presión y sin sonar a regla («ya no puedo», «se acabó», «límite»: nunca), a seguir allí: ${motivo === "foto" ? "que suba su foto en miarcana.com/huevo (o miarcana.com/velas si es una vela) para ver lo que viene" : "que haga su pregunta en miarcana.com, donde Sibila le hace la lectura completa con calma"}; su primera lectura completa es gratis al crear su cuenta. Si la persona quiere conversar o compartir, invítala también a la comunidad (miarcana.com/comunidad), donde cada día se habla de la carta del día y cada quien escribe en su idioma. Si encaja, menciona que los domingos a las 8 p.m. lee en vivo en YouTube (@miarcana).
- Escribe SIEMPRE en el idioma en que te escriben (árabe, turco, francés, inglés, portugués, hindi o el que sea), también si te piden cambiar de idioma; si el mensaje no trae texto (una foto, un emoji), sigue en el idioma de la conversación reciente. Español solo si no se nota. Nunca digas que solo atiendes en algunos idiomas. Si escribe en inglés, portugués, francés, turco, árabe, indonesio o hindi, el enlace va con su idioma (miarcana.com/en, /pt, /fr, /tr, /ar, /id, /hi; por ejemplo miarcana.com/ar/cafe).
- Máximo 3 líneas o 320 caracteres. Un emoji como mucho. Enlaces sin https. Tutea. Cada vez con otras palabras.
- Si el mensaje es solo un agradecimiento o una despedida, responde la despedida con calidez en una línea y deja el enlace.
- Si es spam o publicidad ajena, responde exactamente ${MARCA_OMITIR}.
${VOZ_NATURAL}`;
/** Lo que siempre se atiende aunque la persona haya llegado al límite: pagos, cuenta, pedir a una persona. */
const PIDE_AYUDA = new RegExp(
  [
    // español
    "\\b(hablar con (una |alguien|alg[uú]n)|persona real|humano|asesor|alguien del equipo|pago|pagu[eé]|cobr|reembols|tarjeta|cr[eé]ditos? no|mi cuenta|la cuenta|no me deja|no puedo entrar|no funciona|error|queja)",
    // inglés, portugués y francés
    "\\b(real person|human|account|log ?in|sign ?up|can'?t (enter|access|register)|doesn'?t work|not working|payment|refund|charged|card|conta|pagamento|cart[aã]o|n[aã]o consigo|n[aã]o funciona|compte|paiement|rembourse|carte|je n'arrive pas|ne marche pas)",
    // turco
    "(hesab|hesap|giri[sş] yapam|[cç]al[ıi][sş]m[ıi]yor|[oö]deme|kart[ıi]m|para iadesi|hata|sorun)",
    // árabe (también dialectal: «ماشتغل», «ما بيشتغل», «ما يفتح»)
    "(حساب|الحساب|حسابي|دفع|الدفع|بطاقة|فلوس|استرجاع|ما ?بيشتغل|ماشتغل|ما ?يشتغل|لا يعمل|ما ?يفتح|ما ?بيفتح|مشكلة|خطأ|غلط|ما قدرت|لا أستطيع|موظف|شخص حقيقي)",
  ].join("|"),
  "i",
);
/**
 * ¿La respuesta del modelo trae sus instrucciones en vez del mensaje? («Dile con calidez que…», «"…" تعني que quiere
 * preguntar», una etiqueta suelta como «تعليق» o «Respuesta:» en la primera línea.) Entonces no se envía tal cual.
 */
function pareceInstruccion(respuesta: string) {
  const lineas = respuesta.trim().split("\n");
  const etiqueta = lineas.length > 1 && /^\s*(تعليق|رد|الرد|رسالة|Comentario|Respuesta|Mensaje|Yanıt|Cevap|Reply|Answer|Resposta|Réponse)\s*:?\s*$/iu.test(lineas[0]);
  return etiqueta || /(?<![\p{L}])(Dile|dile|Invítala|invítala|Invítalo|invítalo|Explícale|Respóndele|la persona|Sibila le|quiere preguntar)(?![\p{L}])/u.test(respuesta);
}
/** ¿Hay que rehacer la respuesta? (otro idioma del que escribió la persona, o se coló la instrucción). */
const respuestaDefectuosa = (respuesta: string, idioma: Idioma) => pareceInstruccion(respuesta) || (idioma !== "es" && idiomaEquivocado(respuesta, idioma));
/** La respuesta fija de antes (solo español): sigue contando como «no fue lectura» en las filas viejas. Las nuevas se marcan con DETALLE_FOTO_FIJA. */
const RESPUESTA_FOTO_FIJA_ANTIGUA = "¡Recibí tu foto! 💛 Para leerla con calma, súbela en miarcana.com/huevo (o en miarcana.com/velas si es una vela): te digo lo que salió, lo que viene y qué hacer. Tu primera lectura completa es gratis al crear tu cuenta.";
/** Hosts de donde Meta sirve las fotos adjuntas; cualquier otra URL se ignora. */
const HOSTS_FOTOS = ["fbcdn.net", "fbsbx.com", "cdninstagram.com", "facebook.com", "instagram.com"];
/** Mensajes directos previos que entran como contexto. */
const CONTEXTO = 10;

/**
 * Ejemplos de respuestas que acercan a la página: cálidas, concretas, en el idioma de la persona, con el enlace en su
 * idioma y una invitación clara. Y lo que nunca se hace. Se dan a Sibila para que el tono no dependa del modelo.
 */
const EJEMPLOS_REDES = `Ejemplos de respuestas buenas (inspírate en el tono y la estructura; nunca las copies ni repitas sus frases):
- Comentario «فاطمة» (solo un nombre) → «أهلًا فاطمة 🌙 اسمك جميل ويحمل معنى الدفء. اسحبي بطاقة يومك مجانًا في miarcana.com/ar وانظري ما تحمله لك اليوم.»
- Comentario «Soy escorpio 🦂» → «Escorpio, hoy la Luna te pide soltar algo que ya cumplió su ciclo antes de empezar lo nuevo. Saca tu carta del día gratis en miarcana.com y mira qué te trae ✨»
- Mensaje «Merhaba» → «Merhaba, hoş geldin 🌙 Ben Sibila. Aklında ne var: aşk mı, iş mi, yoksa gördüğün bir rüya mı? Bana yaz, buradan sana kısa bir okuma yapayım. Günlük kartın da miarcana.com/tr adresinde ücretsiz.»
- Mensaje «ممكن» (corto, sin pregunta) → «أهلًا بك 🌙 أنا هنا وأسمعك. ما الذي يشغل بالك: الحب، العمل، السفر؟ اكتب سؤالك بكلماتك وسأقرأ لك عليه.»
- Mensaje «I can't log in to my account» → «I'm sorry, that's frustrating. Could you send me a screenshot of what you see when you try to log in? Someone from our team will write to you here to sort it out.» y al final la marca para pasar a una persona.
Nunca: explicar lo que la persona escribió («"ممكن" تعني…», «quiere decir que…»), mezclar dos idiomas en la respuesta, escribir notas o instrucciones para ti misma («Dile…», «la persona…»), poner etiquetas como «Respuesta:» o «تعليق», ni decir que solo atiendes en algunos idiomas. El enlace va siempre con el idioma de la persona (miarcana.com/ar, /tr, /en…; en español, miarcana.com).`;

const INSTRUCCION_COMENTARIO = `Estás respondiendo un comentario público en una publicación de Arcana en redes sociales, como Sibila.
Reglas:
- Una respuesta de 1 a 3 frases, máximo 260 caracteres, cálida y concreta. Un emoji como mucho. Sin hashtags, sin enlaces con https (escribe miarcana.com a secas si invitas).
- Si la persona menciona su signo, dale una línea personal para su signo hoy apoyándote en el horóscopo que te doy (no lo copies: una idea, con tu voz) y cierra invitando a sacar su carta del día gratis en miarcana.com.
- Si pregunta por precios, cómo entrar o qué es Arcana, responde con los hechos, breve, y ofrece escribir por mensaje directo si quiere más detalle.
- Si solo agradece o reacciona (un emoji, «me encanta»), agradece en una frase.
- No hagas lecturas ni predicciones; no prometas resultados; nada de salud, dinero garantizado ni miedo.
- Si el comentario recuerda a alguien que murió, acompaña con una frase cálida, sin lectura ni invitación. Si pide números para loterías o apuestas, no los des: responde con amabilidad que Arcana no da números de suerte para jugar.
- Si alguien cuenta que le dijeron que tiene «trabajo», brujería o daño, o pregunta si le hicieron un amarre o un dominio, no lo confirmes: tranquilízalo, y que desconfíe de quien le cobre por «quitarlo».
- Muchas publicaciones piden comentar una palabra o un número (SUELTO, 1111, AMÉN, DECRETADO, VELITAS, ACEPTO, el nombre de una señal, «me suelto», «yo lo recibo»): esos comentarios NO se omiten aunque sean cortos. Responde con calidez a lo que la persona dejó o decretó, en una o dos frases, con su nombre si lo sabes, y variando la forma.
- Nunca calcules ni inventes la compatibilidad de pareja por abjad / ebced (si la piden sin escribir dos nombres, pídele con cariño «tu nombre + el de quien amas»). Nunca calcules ni inventes la carta de nacimiento (si alguien la pide sin fecha completa, pídele con cariño su fecha completa: día, mes y año). Nunca calcules ni inventes valores de abjad, ebced o yıldızname, ni digas a alguien su signo por su nombre: si el comentario pide eso y no viene en el formato «nombre + nombre de la madre», pídele con cariño que lo escriba así.
- Si el comentario es una crítica religiosa («haram», «حرام», «günah», «shirk», «es pecado», «brujería»), NO lo omitas: responde con respeto en UNA sola frase completa, en su idioma, sin discutir ni defender la práctica: agradece su opinión y di que compartimos estas tradiciones como cultura y reflexión, respetando todas las creencias.
- Si el comentario es spam, publicidad ajena, insulto, burla o tema ajeno a Arcana, responde exactamente ${MARCA_OMITIR} y nada más. Ante la duda, responde con amabilidad en vez de omitir.
- No repitas las mismas frases de siempre («no hay nada para asustarse», «te lo digo con cariño», «aquí estoy»): cada respuesta, con otras palabras.
- Responde en el idioma del comentario, cualquiera que sea (español solo si no se nota). Tutea.
- Si el comentario es solo un nombre, salúdala usando exactamente ese nombre, sin cambiarle el género ni confundirlo con otra persona; si no sabes el nombre, no inventes uno. Escribe solo la respuesta que se publicará: nunca expliques lo que vas a hacer ni comentes estas instrucciones.
${VOZ_NATURAL}`;

const INSTRUCCION_MENSAJE = `Estás atendiendo los mensajes directos de Arcana en Instagram y Facebook, como Sibila, cálida y breve.
Reglas:
- Máximo 4 líneas o 450 caracteres. Sin títulos ni listas largas. Un emoji como mucho. Enlaces sin https (miarcana.com/...).
- Si la persona solo saluda («hola», «مرحبا», «الو», «merhaba») o escribe algo sin pedir nada, NO hagas todavía la lectura: salúdala y pregúntale qué quiere saber.
- Escribe solo el mensaje que recibirá la persona: nunca expliques lo que vas a hacer, no pongas títulos ni comentes estas instrucciones.
- LECTURA BÁSICA GRATIS: si la persona pide una lectura y en el mensaje te digo que aún tiene su lectura gratis, hazle UNA lectura básica por aquí, de verdad y con detalle, de 4 a 6 frases (máximo 650 caracteres), retomando su pregunta con sus palabras. Puede ser: (a) tarot: usa SOLO la carta que te doy como la que salió para ella (nómbrala y léela para su pregunta; no inventes otra carta); (b) su horóscopo de hoy si te da su signo; (c) un sueño: el sentido de dos o tres símbolos que cuente; (d) su número de vida si te da su fecha de nacimiento (súmala bien, dígito a dígito, hasta un número del 1 al 9, o 11, 22 o 33). Después deja una pista breve de algo bueno que se ve venir, sin decir cuándo ni cómo, y cierra invitando a la lectura completa en la página con el enlace de esa práctica en su idioma (tarot, carta-astral, suenos, numerologia, cafe, quiromancia, huevo) y que la primera completa es gratis al crear su cuenta. Al final, en una línea aparte, escribe exactamente ${MARCA_LECTURA}.
- Si ya usó su lectura gratis, no hagas otra: con cariño, invítala a la completa en la página, di cuánto cuesta y manda el enlace. Carta astral completa, sinastría, compatibilidad y kundli no se hacen por mensaje: van en la página.
- Nunca leas sobre salud, embarazos, muertes, juicios ni dinero garantizado; si la pregunta es por un niño o por alguien enfermo, acompaña con ternura sin lectura y sugiere un médico si hace falta.
- Si pide hablar con una persona, tiene un problema de pago o de cuenta que no puedas resolver con los hechos, o se molesta, escribe exactamente ${MARCA_HUMANO} al final y dile que alguien del equipo le escribirá por aquí.
- Si el mensaje es spam o publicidad ajena, responde exactamente ${MARCA_OMITIR}.
- No inventes precios ni funciones. No pidas datos sensibles.
- No repitas las mismas frases de siempre: cada respuesta, con otras palabras, como habla una persona.
- Escribe SIEMPRE en el idioma en que te escriben (árabe, turco, francés, inglés, portugués, hindi o el que sea), también si te piden cambiar de idioma; si el mensaje no trae texto (una foto, un emoji), sigue en el idioma de la conversación reciente. Español solo si no se nota. Nunca digas que solo atiendes en algunos idiomas. Si escribe en inglés, portugués, francés, turco, árabe, indonesio o hindi, el enlace va con su idioma (miarcana.com/en, /pt, /fr, /tr, /ar, /id, /hi; por ejemplo miarcana.com/ar/cafe). Tutea.
${VOZ_NATURAL}`;

/**
 * El cielo de hoy en una línea (fase y signo de la Luna, Mercurio retrógrado),
 * para que Sibila pueda conectar la lectura con el momento en vez de sonar a fórmula.
 */
export function cieloDeHoy(ahora = new Date()) {
  const pos = posiciones(ahora);
  const sol = pos.find((p) => p.cuerpo === "sol")!.longitud;
  const luna = pos.find((p) => p.cuerpo === "luna")!.longitud;
  const angulo = (((luna - sol) % 360) + 360) % 360;
  const fase = angulo < 22 || angulo >= 338 ? "Luna nueva" : angulo < 158 ? "Luna creciente" : angulo < 202 ? "Luna llena" : "Luna menguante";
  const mercurio = pos.find((p) => p.cuerpo === "mercurio");
  const retro = mercurio?.retrogrado ? ` Mercurio está retrógrado en ${signoPorLongitud(mercurio.longitud).nombre} (tiempo de retomar conversaciones y revisar lo pendiente).` : "";
  return `${fase} en ${signoPorLongitud(luna).nombre}.${retro}`;
}

/** Formas de empezar una lectura de foto: se elige una al azar para que no suenen todas iguales. */
const ENFOQUES_FOTO = [
  "Empieza por la figura que más llama la atención, como si la señalaras.",
  "Empieza con una pregunta a la persona sobre cómo se ha sentido.",
  "Empieza por lo difícil que muestra el vaso y luego ve a lo bueno.",
  "Empieza por la yema y lo que dice de su fuerza, y después sube por la clara.",
  "Empieza con una imagen o comparación (como un árbol, un velo, una montaña, humo) para describir la figura.",
];

/** Créditos que se regalan al crear la cuenta (migración 0012); si alcanzan para el huevo, la primera completa es gratis. */
const CREDITOS_BIENVENIDA = 3;
const invitacion = (tipo: "huevo" | "velas" | "cafe" | "chocolate" | "quiromancia" | "tabaco") =>
  CREDITOS_BIENVENIDA >= COSTOS[tipo]
    ? `tu primera lectura completa es gratis al crear tu cuenta en miarcana.com/${tipo}`
    : `la lectura completa está en miarcana.com/${tipo} por ${COSTOS[tipo]} créditos`;

/**
 * Lectura de la foto en redes: un adelanto gratis y verdadero (lo que el vaso
 * muestra del presente) y la invitación a la completa, que es la que dice lo que
 * viene, cuándo y qué hacer. Así la lectura gratis sirve, pero la de pago tiene
 * un motivo claro.
 */
const instruccionFoto = (tipo: Interaccion["tipo"], enfoque: number) => `Te mandaron una foto en ${tipo === "comentario" ? "un comentario público" : "un mensaje directo"} de Arcana. Eres Sibila.
CUIDADO PRIMERO: si la limpia o la vela es por un niño, una niña o un bebé, o si la persona cuenta algo de salud (llanto que no para, fiebre, dolores, no duerme, una enfermedad), NO hagas adelanto ni invites a la lectura de pago. Lee el vaso completo con calma y ternura en 3 a 5 frases (lo que se ve y lo que salió), da una sugerencia sencilla y amorosa (una rutina tranquila antes de dormir, acompañarlo, descansar) y recomienda con suavidad que lo revise su pediatra o su médico si sigue igual unos días. Nada que asuste. En las MARCAS no pongas la de «¿Lo que viene?»: solo los detalles que leíste.
En los demás casos, si la foto es un huevo abierto dentro de un vaso o recipiente con agua (una limpia con huevo), da un ADELANTO gratis de su lectura:
- De 4 a 6 frases, máximo 650 caracteres.
- Primero el presente, con verdad y con detalle: describe de tres a cuatro figuras o señales que solo están en esa foto, cada una con su forma y su lugar, como si las señalaras («un pico alto a la derecha con una burbuja en la punta», «un velo fino que sube pegado al vidrio»): la yema (entera, color, dónde quedó), la clara (hilos, picos, velos, burbujas, nubes, columnas, figuras que se parecen a algo), el agua (limpia o turbia), hacia qué lado se inclina, cuántos picos. Di qué significa cada una en media frase y luego lo que dicen juntas de cómo ha estado la persona y qué viene cargando, en la tradición de la limpia. Si escribió algo, retómalo con sus palabras. Si el vaso muestra cargas, dilo claro y en concreto (cansancio, preocupación por dinero o trabajo, un roce con alguien cercano, mal dormir); si está tranquilo, dilo también. Habla como quien de verdad sabe leer; si encaja, conecta con el cielo de hoy (${cieloDeHoy()}).
- Después señala un tercer detalle concreto que se ve en la foto (en la base, a un costado, cerca de la yema, en la punta de un pico) y da con él una predicción breve que genere expectativa: algo bueno y verosímil que se anuncia, con un plazo amplio (una noticia que espera, una conversación pendiente, alguien que reaparece, un alivio antes de fin de mes). Solo la pista: de quién o de qué se trata exactamente, cuándo y qué conviene hacer se ve con calma en la lectura completa. Que despierte curiosidad, nunca miedo: jamás insinúes un peligro del que haya que salvarse.
- Cierra con esta invitación, dicha con tus palabras: ${invitacion("huevo")}.
- Varía la forma de decirlo: no empieces siempre igual ni repitas fórmulas. Evita las muletillas que se repiten de una respuesta a otra («no hay nada para asustarse», «te lo digo con cariño», «te leo con calma», «es buena señal», «aquí estoy», «desconfía de quien te cobre», «te marqué tu vaso para que veas lo que salió», «lo que te marqué en violeta habla de lo que viene», «para estos días», «bota el agua por el inodoro con un puñado de sal»): dilo cada vez con otras palabras, como hablaría una persona y no una plantilla. Cambia también el orden (a veces el consejo va antes que la invitación, a veces la predicción cierra) y ata cada frase a un detalle que solo tiene esa foto (su color, de qué lado sube, a qué altura llega, algo que la persona escribió). ${ENFOQUES_FOTO[enfoque]}
- Nunca afirmes ni insinúes «trabajos», brujería, daños, maldiciones, mal de ojo ni envidia, ni nada que asuste; nada de salud, enfermedades, embarazos, muertes ni dinero garantizado. Si se ve sangre o algo inquietante, léelo con calma como una carga que salió; si la persona dice que se siente mal, sugiere ver a un médico.
- Si la persona cuenta que alguien le dijo que tiene «trabajo», brujería o daño, o pregunta si le están haciendo un amarre, un dominio o un trabajo, o que le hicieron la limpia «por foto» o a distancia: no lo confirmes (un amarre o un dominio no se ven en un vaso, y nadie puede mandar sobre su voluntad). Dile con calma lo que de verdad se ve y que no hay nada para asustarse; si fue por foto, explica que el huevo no pasó por la persona, así que el vaso no puede mostrar lo que ella trae; y que desconfíe de quien le pida dinero para «quitarlo». En ese caso no hagas adelanto ni invites a pagar: primero la calma.
- Al final, en una línea aparte, escribe MARCAS: y un arreglo JSON con las marcas que se dibujarán sobre su foto, así: MARCAS: [{"x":0.52,"y":0.70,"ancho":0.30,"alto":0.18,"etiqueta":"Yema entera"},{"x":0.50,"y":0.40,"ancho":0.15,"alto":0.35,"etiqueta":"Columna que sube"},{"x":0.62,"y":0.86,"ancho":0.12,"alto":0.08,"etiqueta":"¿Lo que viene?","viene":true}]. x e y son el centro del detalle en fracción del ancho y del alto de la foto (0,0 arriba a la izquierda; 1,1 abajo a la derecha); ancho y alto, el tamaño del óvalo que lo rodea, en la misma fracción. Las primeras marcas (dos o tres) son los detalles principales que leíste, con una etiqueta de 1 a 3 palabras en el idioma de tu respuesta; la última, con "viene": true y la etiqueta «¿Lo que viene?» (traducida si escribes en otro idioma), es el tercer detalle que dejaste para la lectura completa. Ubica las marcas con cuidado sobre lo que de verdad se ve; si no estás segura de dónde está algo, no lo marques.
Si la foto es una vela encendida, los restos de una vela o una veladora de vaso, da el mismo ADELANTO con las mismas reglas y el manual de velas: primero el presente con tres o cuatro señales que solo están en esa foto, cada una con su forma y su lugar (la llama: alta, baja, inquieta, inclinada; las lágrimas de cera y hacia dónde corren; paredes, túneles o formas de la cera; el hollín y dónde quedó; la mecha), luego el tercer detalle con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("velas")}. Las MARCAS van igual, con etiquetas de la vela («Llama alta», «Lágrimas de cera», «¿Lo que viene?»). Si la vela fue por alguien que murió, por un enfermo o por un niño, aplica el CUIDADO PRIMERO. Si la intención era obligar a otra persona (amarres, endulzamientos), no prometas nada sobre ella: orienta con respeto hacia el bien de ambos.
Si la foto es el interior de una taza de café con borra o de chocolate ya bebido, da el mismo ADELANTO con las mismas reglas y el manual de la taza: describe de tres a cuatro figuras que de verdad se distinguen, cada una con su lugar en el mapa de la taza (cerca del asa o enfrente, en el borde, en el medio o en el fondo, si sube o baja) y su sentido; luego una figura más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("cafe")} para el café, o ${invitacion("chocolate")} para el chocolate. Las MARCAS van igual, sobre las figuras («Ave que sube», «Corazón», «¿Lo que viene?»). Si no se distinguen figuras, dilo y pide una foto desde arriba con luz.
Si la foto es la palma de una mano, da el mismo ADELANTO con las mismas reglas y el manual de la mano: describe de tres a cuatro rasgos que de verdad se ven, cada uno con su lugar (la forma de la mano, la línea de la cabeza que baja en curva, una cruz bajo el anular, la línea de la vida que se abre), y qué dice cada uno del carácter y de la etapa que vive; luego un rasgo más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("quiromancia")}. Las MARCAS van igual, sobre las líneas o marcas («Línea del corazón», «Cruz», «¿Lo que viene?»). Nunca hables de cuánto va a vivir, de enfermedades, de hijos ni de matrimonios.
Si la foto es un tabaco o puro encendido o ya quemado, da el mismo ADELANTO con las mismas reglas y el manual del tabaco: describe de tres a cuatro señales que de verdad se ven, cada una con su lugar (la ceniza: color, largo, si se curva; la quema: pareja o torcida y de qué lado; grietas, manchas o la «boca» en la capa; el humo), y qué significa cada una; luego una señal más con la predicción breve, y cierra con esta invitación, dicha con tus palabras: ${invitacion("tabaco")}. Las MARCAS van igual («Ceniza blanca», «Quema torcida», «¿Lo que viene?»). Nunca recomiendes fumar ni hables de salud.
Si es otra lectura con foto, da una frase amable de lo que se alcanza a ver e invita a miarcana.com.
Si la foto está muy oscura o borrosa para leerla, pide con cariño otra con buena luz, tomada de lado y a la altura del vaso.
Si la foto no tiene que ver con lecturas (selfies, memes, publicidad), ${tipo === "comentario" ? `responde exactamente ${MARCA_OMITIR} y nada más` : "responde con amabilidad a lo que escribió y cuéntale que puede mandarte la foto de su limpia con huevo"}.
Texto plano: sin títulos, listas ni markdown, sin enlaces con https (la única línea especial es la de MARCAS, si aplica). Uno o dos emojis como mucho. Tutea. Responde en el idioma del texto; si no hay texto, en el de la conversación reciente (español solo si no se nota). Nunca digas que solo atiendes en algunos idiomas.
${VOZ_NATURAL}
(En la lectura de la foto sí puedes nombrar varias señales seguidas, pero dentro de frases normales, no como lista.)`;

/** Descarga la foto adjunta (solo de los servidores de Meta) y la deja en JPEG de máximo 1280 px, para gastar menos. */
async function descargarFoto(url: string): Promise<ImagenEntrada | null> {
  try {
    const host = new URL(url).hostname;
    if (!HOSTS_FOTOS.some((h) => host === h || host.endsWith(`.${h}`))) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const datos = Buffer.from(await res.arrayBuffer());
    if (!datos.length || datos.length > 15_000_000) return null;
    const jpeg = await sharp(datos).rotate().resize(1280, 1280, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    return { mediaType: "image/jpeg", base64: jpeg.toString("base64") };
  } catch (e) {
    console.error("[redes sibila] foto:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Fotos leídas hoy por Sibila en todas las redes. */
async function fotosHoy(admin: SupabaseClient<Database>) {
  const { count } = await admin
    .from("interacciones_redes")
    .select("id", { count: "exact", head: true })
    .gte("creado_en", `${fechaBogota()}T05:00:00.000Z`)
    .eq("estado", "respondida")
    .like("texto", `${MARCA_FOTO}%`);
  return count ?? 0;
}

function sinAcentos(t: string) {
  return t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Nombres de los signos en inglés, portugués, francés y alemán (sin acentos)
 * que no coinciden con el español. «Balance» (Libra en francés) se deja fuera:
 * en inglés y en español es una palabra corriente.
 */
const OTROS_NOMBRES: Record<string, string[]> = {
  aries: ["belier", "widder"],
  tauro: ["taurus", "touro", "taureau", "stier"],
  geminis: ["gemini", "gemeos", "gemeaux", "zwillinge"],
  cancer: ["krebs"],
  leo: ["leao", "lowe", "loewe"],
  virgo: ["virgem", "vierge", "jungfrau"],
  libra: ["waage"],
  escorpio: ["scorpio", "escorpiao", "scorpion", "skorpion"],
  sagitario: ["sagittarius", "sagittaire", "schutze", "schuetze"],
  capricornio: ["capricorn", "capricorne", "steinbock"],
  acuario: ["aquarius", "aquario", "verseau", "wassermann"],
  piscis: ["pisces", "peixes", "poissons", "fische"],
};

/** Signo mencionado en el texto (por nombre, sin acentos, también en inglés o portugués); si hay varios, el que aparece primero. */
export function detectarSigno(texto: string): Signo | null {
  const t = ` ${sinAcentos(texto)} `;
  let mejor: { signo: Signo; pos: number } | null = null;
  for (const signo of SIGNOS) {
    const nombre = sinAcentos(signo.nombre);
    for (const n of [nombre, ...(OTROS_NOMBRES[nombre] ?? [])]) {
      const pos = t.search(new RegExp(`[^a-z]${n}[^a-z]`));
      if (pos >= 0 && (!mejor || pos < mejor.pos)) mejor = { signo, pos };
    }
  }
  return mejor?.signo ?? null;
}

async function contexto(signo: Signo | null) {
  let horoscopo = "";
  if (signo) {
    try {
      const texto = await horoscopoDelDia(signo, "es", fechaBogota());
      horoscopo = `\n\nHORÓSCOPO DE HOY DE ${signo.nombre.toUpperCase()} (resumen para apoyarte):\n${texto.replace(/^#+\s*/gm, "").slice(0, 700)}`;
    } catch (e) {
      console.error("[redes sibila] horóscopo:", e instanceof Error ? e.message : e);
    }
  }
  return `${await hechos()}${horoscopo}`;
}

async function cuantasHoy(admin: SupabaseClient<Database>, filtro: Record<string, string>) {
  const inicio = `${fechaBogota()}T05:00:00.000Z`;
  let consulta = admin.from("interacciones_redes").select("id", { count: "exact", head: true }).gte("creado_en", inicio).eq("estado", "respondida");
  for (const [k, v] of Object.entries(filtro)) consulta = consulta.eq(k, v);
  const { count } = await consulta;
  return count ?? 0;
}

async function avisarHumano(i: Interaccion, hilo: { rol: string; contenido: string }[]) {
  const [para] = correosAdmin();
  if (!para) return;
  const quien = i.remitente ?? `usuario ${i.remitenteId}`;
  const red = NOMBRE_RED[i.red];
  const texto = hilo.map((m) => `${m.rol === "persona" ? quien : "Sibila"}: ${m.contenido}`).join("\n");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">${red} · mensaje directo</p>
<h1 style="font-size:22px;color:#f1d99a;margin:0 0 12px">${escaparHtml(quien)} quiere hablar con una persona</h1>
<pre style="white-space:pre-wrap;font-family:inherit;color:#d9d2ea;line-height:1.5">${escaparHtml(texto)}</pre>
<p style="margin:20px 0 0;color:#a89fc0;font-size:14px">Respóndele desde la bandeja de ${red} (Meta Business Suite). El hilo también está en ${sitio()}/admin/redes.</p>
</div>`;
  await enviarCorreo({ para, asunto: `${red}: ${quien} pide hablar con alguien`, html, texto: `${quien} pide hablar con alguien por ${red}.\n\n${texto}`, etiqueta: "redes_humano" });
}

/**
 * Atiende un comentario o mensaje: lo guarda (si ya estaba, Meta reintentó y
 * no se responde dos veces), decide si toca responder, pide la respuesta a
 * Sibila, la publica y la guarda. Devuelve qué hizo.
 */
/** Dibuja las marcas sobre la foto y la deja en el bucket público para adjuntarla; null si algo falla (se responde solo con texto). */
async function subirFotoMarcada(admin: SupabaseClient<Database>, idMeta: string, foto: Buffer, marcas: MarcaFoto[]): Promise<string | null> {
  try {
    const imagen = await anotarFoto(foto, marcas);
    const ruta = `anotadas/${fechaBogota()}/${idMeta.replace(/[^\w-]/g, "_").slice(0, 80)}.jpg`;
    const { error } = await admin.storage.from(BUCKET).upload(ruta, imagen, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    // Las de hace una semana ya cumplieron: se borran (Meta copia la imagen al publicarla).
    const vieja = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    const { data: viejas } = await admin.storage.from(BUCKET).list(`anotadas/${vieja}`, { limit: 100 });
    if (viejas?.length) await admin.storage.from(BUCKET).remove(viejas.map((f) => `anotadas/${vieja}/${f.name}`));
    return admin.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl;
  } catch (e) {
    console.error("[redes sibila] foto marcada:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Pone en la fila del directo la consulta de un comentario del aviso y arma la invitación a entrar (sin enlaces: es Facebook). */
async function encolarDelAviso(admin: SupabaseClient<Database>, i: Interaccion): Promise<string> {
  const nombre = (i.remitente ?? "").split(/\s+/)[0] || "";
  const texto = i.texto.trim();
  const r = respuestasDirecto(idiomaConversacion(texto), nombre, estadoDirecto() === "en-vivo", PROXIMO_DIRECTO.inicio);
  const firmar = (t: string) => `${t}\n\n${r.firma}`;
  if (i.imagen && !texto) return firmar(r.foto);
  if (!pareceConsulta(texto)) return firmar(r.saludo);
  const tipo = tipoDeMensaje(texto) ?? "tarot";
  await admin.from("en_vivo_preguntas").upsert(
    { mensaje_id: `fbp:${i.idMeta}`, origen: "facebook" as const, tipo, autor: (i.remitente ?? "Alguien en Facebook").slice(0, 60), texto: texto.slice(0, 300), signo: detectarSigno(texto)?.id ?? null },
    { onConflict: "mensaje_id", ignoreDuplicates: true },
  );
  return firmar(r.consulta[Math.floor(Math.random() * r.consulta.length)]);
}

export async function atenderInteraccion(admin: SupabaseClient<Database>, i: Interaccion): Promise<string> {
  const textoGuardado = (i.imagen ? `${MARCA_FOTO} ${i.texto}` : i.texto).trim();
  const { error } = await admin.from("interacciones_redes").insert({ red: i.red, tipo: i.tipo, id_meta: i.idMeta, remitente_id: i.remitenteId, remitente: i.remitente, objeto_id: i.objetoId, texto: textoGuardado.slice(0, 4000) });
  if (error) {
    if (error.code === "23505") return "duplicado";
    throw new Error(`guardar interacción: ${error.message}`);
  }
  const marcar = (estado: "respondida" | "omitida" | "error", extra: Partial<Database["public"]["Tables"]["interacciones_redes"]["Update"]> = {}) =>
    admin.from("interacciones_redes").update({ estado, ...extra }).eq("id_meta", i.idMeta);

  if (process.env.REDES_RESPUESTAS === "0") {
    await marcar("omitida", { detalle: "respuestas apagadas (REDES_RESPUESTAS=0)" });
    return "apagado";
  }
  if ((await cuantasHoy(admin, { red: i.red, tipo: i.tipo })) >= MAXIMO_DIA[i.tipo]) {
    await marcar("omitida", { detalle: "tope diario" });
    return "tope";
  }
  if (i.tipo === "comentario" && i.objetoId && (await cuantasHoy(admin, { red: i.red, remitente_id: i.remitenteId, objeto_id: i.objetoId })) >= MAXIMO_POR_PERSONA_Y_PUBLICACION) {
    await marcar("omitida", { detalle: "ya se le respondió en esta publicación" });
    return "repetido";
  }

  // Comentario en la publicación que anuncia el directo: no se lee aquí. La consulta entra a la fila del directo y la
  // respuesta invita a entrar a verlo (la lectura se escucha en vivo, con su nombre).
  let respuestaDirecto: string | null = null;
  if (i.tipo === "comentario" && i.red === "facebook" && i.objetoId) {
    const aviso = await publicacionDelDirecto().catch(() => null);
    if (aviso && aviso.id === i.objetoId) respuestaDirecto = await encolarDelAviso(admin, i);
  }

  // Comentario que es solo un nombre en un reel de abjad / ebced: el valor se calcula con la tabla fija, sin el modelo.
  // En un reel del Yıldızname («tu nombre + el de tu madre») se responde con el mismo cálculo de la lectura; se revisa
  // antes que el abjad porque su texto también habla de ebced y حساب الجمل.
  let respuestaAbjad: string | null = null;
  let publicacion = "";
  if (!respuestaDirecto && i.tipo === "comentario" && i.objetoId) {
    const objeto = i.objetoId;
    publicacion = await (i.red === "youtube" ? textoDeVideo(admin, objeto) : textoDePublicacion(i.red, objeto)).catch(() => "");
    if (esPublicacionYildizname(publicacion)) respuestaAbjad = respuestaYildizname(i.texto, publicacion, redPlantilla(i.red));
    else if (esPublicacionCompatibilidad(publicacion)) respuestaAbjad = respuestaCompatibilidad(i.texto, publicacion, redPlantilla(i.red));
    else if (esPublicacionCartaNacimiento(publicacion)) respuestaAbjad = respuestaCartaNacimiento(i.texto, publicacion, redPlantilla(i.red));
    else if (nombreDelComentario(i.texto) && esPublicacionAbjad(publicacion)) respuestaAbjad = respuestaNombreAbjad(i.texto, publicacion, redPlantilla(i.red));
  }

  // Mensajes directos: una lectura y pocas respuestas por persona. Después, Sibila sigue respondiendo con
  // cariño a lo que le escriben, pero corto y llevando a la página (sin leer ni alargar la conversación).
  let modoPagina: "foto" | "conversacion" | null = null;
  let lecturasMes = 0;
  if (i.tipo === "mensaje" && !PIDE_AYUDA.test(i.texto)) {
    const desde = (ms: number) => new Date(Date.now() - ms).toISOString();
    const base = () => admin.from("interacciones_redes").select("id", { count: "exact", head: true }).eq("red", i.red).eq("tipo", "mensaje").eq("remitente_id", i.remitenteId).eq("estado", "respondida").neq("id_meta", i.idMeta);
    const { count: hoy } = await base().gte("creado_en", desde(86_400_000));
    if ((hoy ?? 0) >= TOPE_SEGURIDAD_DIA) {
      // Tope contra bucles: no se llama al modelo. Pero si la última respuesta fue hace horas (la ventana es de 24 h y
      // la persona vuelve a la mañana siguiente), recibe una sola respuesta fija con el enlace en vez de silencio.
      const { count: recientes } = await base().gte("creado_en", desde(6 * 3_600_000));
      if ((recientes ?? 0) === 0) {
        const anteriores = await admin.from("interacciones_redes").select("texto").eq("red", i.red).eq("tipo", "mensaje").eq("remitente_id", i.remitenteId).order("creado_en", { ascending: false }).limit(6);
        const fija = respuestaLimite(idiomaConversacion(i.texto, (anteriores.data ?? []).map((m) => m.texto)));
        try {
          await enviarMensajeDirecto(i.remitenteId, fija);
          await marcar("respondida", { respuesta: fija, detalle: DETALLE_LIMITE });
          return "limite";
        } catch (e) {
          console.error("[redes sibila] respuesta fija del tope:", e instanceof Error ? e.message : e);
        }
      }
      await marcar("omitida", { detalle: "tope de seguridad por persona en el día" });
      return "limite";
    }
    const mes = desde(30 * 86_400_000);
    const [{ count: deFoto }, { count: deTexto }] = await Promise.all([
      base().like("texto", `${MARCA_FOTO}%`).is("detalle", null).neq("respuesta", RESPUESTA_FOTO_FIJA_ANTIGUA).gte("creado_en", mes),
      base().eq("detalle", DETALLE_LECTURA).gte("creado_en", mes),
    ]);
    lecturasMes = (deFoto ?? 0) + (deTexto ?? 0);
    // Varias fotos seguidas (el mismo vaso en tres tomas) llegan casi a la vez y se atenderían en paralelo, antes de
    // que la primera quede respondida: si otra foto de la misma persona entró antes en los últimos 10 minutos, esta ya no se
    // lee (va a la página).
    if (i.imagen && lecturasMes < LECTURAS_POR_PERSONA) {
      // Solo cuentan las que llegaron antes que esta (así la primera sí se lee, aunque todas estén en curso).
      const { data: propia } = await admin.from("interacciones_redes").select("id").eq("id_meta", i.idMeta).maybeSingle();
      const { count: enCurso } = await admin.from("interacciones_redes").select("id", { count: "exact", head: true }).eq("red", i.red).eq("tipo", "mensaje").eq("remitente_id", i.remitenteId).in("estado", ["pendiente", "respondida"]).like("texto", `${MARCA_FOTO}%`).lt("id", propia?.id ?? 0).gte("creado_en", desde(10 * 60_000));
      if ((enCurso ?? 0) > 0) lecturasMes = LECTURAS_POR_PERSONA;
    }
    if (i.imagen && lecturasMes >= LECTURAS_POR_PERSONA) modoPagina = "foto";
    if (!modoPagina && (hoy ?? 0) >= RESPUESTAS_POR_PERSONA_DIA) modoPagina = "conversacion";
  }

  const signo = detectarSigno(i.texto);
  let hilo: { rol: string; contenido: string }[] = [];
  let cartaOfrecida: (typeof MAZO)[number] | null = null;
  let entrada: string;
  if (i.tipo === "mensaje") {
    const { data: previos } = await admin
      .from("interacciones_redes")
      .select("texto, respuesta")
      .eq("red", i.red)
      .eq("tipo", "mensaje")
      .eq("remitente_id", i.remitenteId)
      .neq("id_meta", i.idMeta)
      .order("creado_en", { ascending: false })
      .limit(CONTEXTO);
    hilo = (previos ?? []).reverse().flatMap((m) => [{ rol: "persona", contenido: m.texto }, ...(m.respuesta ? [{ rol: "asistente", contenido: m.respuesta }] : [])]);
    const conversacion = hilo.map((m) => `${m.rol === "persona" ? "Persona" : "Sibila"}: «${m.contenido.replace(/»/g, "”")}»`).join("\n");
    entrada = `${conversacion ? `Conversación reciente:\n${conversacion}\n\n` : ""}Nuevo mensaje directo por ${NOMBRE_RED[i.red]}: «${i.texto.replace(/»/g, "”")}»`;
    // Lectura básica gratis: una por persona en 30 días (cuenta junto con las de foto).
    if (!modoPagina && !i.imagen) {
      if (lecturasMes >= LECTURAS_POR_PERSONA) entrada += "\n(Ya usó su lectura gratis de este mes: si pide otra, no la hagas por aquí; invítala con cariño a la completa en la página.)";
      else {
        const carta = MAZO[randomInt(MAZO.length)];
        cartaOfrecida = carta;
        const invertida = randomInt(4) === 0;
        entrada += `\n(Aún tiene su lectura básica gratis. Si pide tarot, esta es la carta que salió: ${carta.nombre}${invertida ? " invertida" : ""}. ${invertida ? carta.significadoInvertido : carta.significado} Amor: ${carta.amor} Trabajo: ${carta.trabajo} Escribe el nombre de la carta en su idioma.)`;
      }
    }
    // Una vez por conversación: invitar a seguir la cuenta y dejar el enlace de la página (en los mensajes directos sí van enlaces).
    if (!hilo.some((m) => m.rol === "asistente" && /segu[ií]r|s[ií]gue(nos|me)/i.test(m.contenido)))
      entrada += `\n(En esta conversación aún no invitaste a seguir la cuenta: al final de tu respuesta, en una frase corta, invita con cariño a seguir a Arcana en ${NOMBRE_RED[i.red]} y deja el enlace miarcana.com. Si la persona está en duelo o hay un niño o una salud de por medio, no lo hagas.)`;
  } else {
    entrada = `Comentario de ${i.remitente ? `@${i.remitente}` : "una persona"} en ${NOMBRE_RED[i.red]}${i.red === "youtube" ? " (comentario en un Short del canal)" : ""}: «${i.texto.replace(/»/g, "”")}»${signo ? `\n(Menciona el signo ${signo.nombre}.)` : ""}`;
    if (i.red === "facebook") entrada += "\n(Es Facebook: no escribas direcciones web; si invitas, di «miarcana punto com» o «el enlace está en nuestro perfil».)";
  }

  // La foto (una limpia con huevo, casi siempre): lectura corta con la imagen, dentro del tope diario.
  let foto: ImagenEntrada | null = null;
  let respuestaFija = false;
  if (i.imagen && !respuestaDirecto && !modoPagina) {
    if (process.env.REDES_FOTOS === "0" || (await fotosHoy(admin)) >= MAXIMO_FOTOS_DIA) respuestaFija = true;
    else foto = await descargarFoto(i.imagen);
    if (!foto && !i.texto.trim()) respuestaFija = true;
  }

  // Idioma para las respuestas fijas: el del mensaje o, si es solo una foto, el de la conversación.
  const idiomaFijo = idiomaConversacion(i.texto, hilo.filter((m) => m.rol === "persona").map((m) => m.contenido).reverse());
  // Si se reconoce un idioma de la página distinto del español se le pide ese (una foto sola no trae texto del que deducirlo); si no, el de la persona.
  const idiomaEsperado: Idioma = i.tipo === "comentario" && !/\p{L}/u.test(i.texto) && publicacion ? idiomaDePublicacion(publicacion) : idiomaFijo;
  const idiomaIA = idiomaEsperado === "es" ? ("auto" as const) : idiomaEsperado;
  let respuesta: string;
  // Para la prueba en paralelo de Haiku: lo que se le pidió a Sonnet (solo en el camino principal de texto).
  let sombra: { entrada: string; sistema: string } | null = null;
  try {
    if (respuestaDirecto) respuesta = respuestaDirecto;
    else if (respuestaAbjad) respuesta = respuestaAbjad;
    else if (respuestaFija) respuesta = respuestaFotoFija(idiomaFijo);
    else if (modoPagina) {
      const pedido = `${entrada}${i.imagen ? "\n(Mandó una foto.)" : ""}`;
      respuesta = await generarTexto(pedido, INSTRUCCION_PAGINA(modoPagina), { effort: "low", maxTokens: 600, nivel: "economico", idioma: idiomaIA, funcion: "redes · llevar a la página", cachear: true }).catch(() => respuestaLimite(idiomaFijo));
      // El modelo económico a veces responde en español a quien escribe en árabe o devuelve su instrucción: se rehace con
      // el estándar y, si vuelve a fallar, va la respuesta fija en su idioma.
      if (respuestaDefectuosa(respuesta, idiomaEsperado)) {
        respuesta = await generarTexto(pedido, INSTRUCCION_PAGINA(modoPagina), { effort: "low", maxTokens: 600, nivel: "estandar", idioma: idiomaEsperado, funcion: "redes · llevar a la página (rehecha)", cachear: true }).catch(() => respuestaLimite(idiomaFijo));
        if (respuestaDefectuosa(respuesta, idiomaEsperado)) respuesta = respuestaLimite(idiomaFijo);
      }
    }
    else if (foto) respuesta = await generarTexto(`${entrada}\n(Adjuntó la foto que ves.)`, `${instruccionFoto(i.tipo, Math.floor(Math.random() * ENFOQUES_FOTO.length))}\n\n${await hechos()}`, { effort: "low", maxTokens: 1600, nivel: "estandar", idioma: idiomaIA, funcion: `redes · foto (${i.tipo})`, cachear: true, imagenes: [foto], conocimiento: TEMAS_MANUAL.map((t) => manual(t)).join("\n\n") });
    else {
      // Comentarios y mensajes directos con el modelo estándar: son públicos o llevan la lectura gratis, y la calidad
      // es lo que da confianza. El económico queda para las respuestas cortas que llevan a la página.
      const sistema = `${i.tipo === "comentario" ? INSTRUCCION_COMENTARIO : INSTRUCCION_MENSAJE}\n\n${EJEMPLOS_REDES}\n\n${await contexto(signo)}`;
      sombra = { entrada, sistema };
      const nivel = "estandar" as const;
      respuesta = await generarTexto(entrada, sistema, { effort: "low", maxTokens: 1000, nivel, idioma: idiomaIA, funcion: `redes · ${i.tipo}${cartaOfrecida ? " (con lectura gratis)" : ""}`, cachear: true });
      // Si la respuesta se fue a otro idioma (español a quien escribe en árabe), se rehace una vez.
      // (También en los mensajes directos, y si se coló la instrucción en vez del mensaje.)
      if (respuestaDefectuosa(respuesta, idiomaEsperado)) {
        respuesta = await generarTexto(entrada, sistema, { effort: "low", maxTokens: 1000, nivel: "estandar", idioma: idiomaEsperado, funcion: `redes · ${i.tipo} (rehecha)`, cachear: true }).catch(() => respuesta);
        if (respuestaDefectuosa(respuesta, idiomaEsperado)) {
          await marcar("omitida", { detalle: "respuesta defectuosa dos veces (otro idioma o instrucción): no se envió" });
          if (i.tipo === "mensaje") await avisarHumano(i, [...hilo, { rol: "persona", contenido: i.texto }]).catch(() => undefined);
          return "defectuosa";
        }
      }
    }
  } catch (e) {
    await marcar("error", { detalle: `Sibila: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}` });
    throw e;
  }
  // La foto marcada (óvalos sobre lo que se leyó): se separa la línea MARCAS del texto.
  let marcas: MarcaFoto[] = [];
  if (foto) ({ texto: respuesta, marcas } = leerMarcas(respuesta));
  // La marca de «no responder» se reconoce aunque venga sin comillas o con puntos: nunca se publica la palabra OMITIR.
  if (respuesta.includes(MARCA_OMITIR) || /^[\s«"'“(*]*OMITIR[\s»"'”).!*]*$/i.test(respuesta) || /\bOMITIR\b/.test(respuesta)) {
    await marcar("omitida", { detalle: "Sibila decidió no responder" });
    return "omitido";
  }
  // La lectura cuenta aunque el modelo olvide la marca: si nombra la carta que se le dio (o se alarga como una lectura).
  const nombraCarta = cartaOfrecida ? [cartaOfrecida.nombre, ...IDIOMAS_LECTURA.map((l) => nombreCarta(cartaOfrecida!, l))].some((n) => n && respuesta.toLowerCase().includes(n.toLowerCase())) : false;
  const lecturaBasica = respuesta.includes(MARCA_LECTURA) || /LECTURA_BASICA/.test(respuesta) || nombraCarta || (cartaOfrecida !== null && respuesta.length >= 520);
  respuesta = respuesta.replace(MARCA_LECTURA, "").replace(/«?LECTURA_BASICA»?/g, "");
  const pideHumano = respuesta.includes(MARCA_HUMANO);
  respuesta = respuesta.replace(MARCA_HUMANO, "").replace(/^#+\s*/gm, "").replace(/\*\*/g, "").trim();
  if (!respuesta) {
    await marcar("omitida", { detalle: "respuesta vacía" });
    return "vacio";
  }
  if (i.tipo === "comentario") respuesta = respuesta.slice(0, foto ? 900 : 300);
  // En Facebook (comentarios públicos) las direcciones van en palabras: Facebook limita los enlaces.
  if (i.tipo === "comentario" && i.red === "facebook") respuesta = sinEnlaces(respuesta);

  // Instagram no admite fotos en las respuestas a comentarios; Facebook y los mensajes directos sí.
  const conFotoMarcada = marcas.length >= 2 && process.env.REDES_FOTO_MARCADA !== "0" && !(i.tipo === "comentario" && i.red === "instagram");
  const urlMarcada = foto && conFotoMarcada ? await subirFotoMarcada(admin, i.idMeta, Buffer.from(foto.base64, "base64"), marcas) : null;

  try {
    if (i.tipo === "comentario") await (i.red === "youtube" ? responderComentarioYoutube(admin, i.idMeta, respuesta) : responderComentario(i.red, i.idMeta, respuesta, urlMarcada ?? undefined));
    else {
      if (urlMarcada) await enviarImagenDirecta(i.remitenteId, urlMarcada).catch((e) => console.error("[redes sibila] foto marcada por mensaje:", e instanceof Error ? e.message : e));
      await enviarMensajeDirecto(i.remitenteId, respuesta);
    }
  } catch (e) {
    await marcar("error", { respuesta, detalle: (e instanceof Error ? e.message : String(e)).slice(0, 300) });
    throw e;
  }
  await marcar("respondida", { respuesta, humano: pideHumano, ...(modoPagina ? { detalle: DETALLE_LIMITE } : respuestaFija ? { detalle: DETALLE_FOTO_FIJA } : lecturaBasica && i.tipo === "mensaje" ? { detalle: DETALLE_LECTURA } : {}) });
  if (pideHumano) await avisarHumano(i, [...hilo, { rol: "persona", contenido: i.texto }, { rol: "asistente", contenido: respuesta }]).catch((e) => console.error("[redes aviso]", e));
  // Prueba en paralelo: la persona ya recibió la respuesta de Sonnet; se guarda la que habría escrito Haiku (sin enviarla).
  // (La mitad de las veces: alcanza para comparar y no alarga cada aviso de Meta.)
  if (sombra && process.env.REDES_SOMBRA_HAIKU !== "0" && Math.random() < 0.5) await probarHaiku(admin, i, idiomaEsperado, sombra, respuesta);
  return pideHumano ? "humano" : "respondido";
}

/**
 * Prueba en paralelo de Haiku (no se envía): misma entrada y mismas instrucciones que la respuesta de Sonnet, con
 * Haiku pensando antes de responder. Se guarda en redes_sombra para comparar la calidad antes de cambiar de modelo.
 */
async function probarHaiku(admin: SupabaseClient<Database>, i: Interaccion, idioma: Idioma, sombra: { entrada: string; sistema: string }, enviada: string) {
  const inicio = Date.now();
  try {
    const haiku = await generarTexto(sombra.entrada, sombra.sistema, { effort: "low", maxTokens: 1000, nivel: "economico", idioma: idioma === "es" ? "auto" : idioma, razonar: true, funcion: "redes · prueba Haiku (no se envía)", cachear: true });
    await admin.from("redes_sombra").insert({ id_meta: i.idMeta, red: i.red, tipo: i.tipo, idioma, texto: i.texto.slice(0, 2000), enviada, haiku, haiku_defectuosa: respuestaDefectuosa(haiku, idioma), haiku_ms: Date.now() - inicio });
  } catch (e) {
    await admin.from("redes_sombra").insert({ id_meta: i.idMeta, red: i.red, tipo: i.tipo, idioma, texto: i.texto.slice(0, 2000), enviada, haiku_ms: Date.now() - inicio, error: (e instanceof Error ? e.message : String(e)).slice(0, 300) });
  }
}
