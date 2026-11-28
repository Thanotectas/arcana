/**
 * «Pregunta del mundo»: una pregunta fácil por día para conversar de un país a otro, sin esoterismo. Están en español
 * (Sibila abre el hilo con una de ellas y el mensaje se traduce como cualquier otro). Sin religión, política ni temas
 * que dividan: comida, costumbres, palabras, música, recuerdos, el día a día.
 */
export const PREGUNTAS_MUNDO: readonly string[] = [
  "¿Qué comida de tu país le recomendarías probar a alguien del otro lado del mundo?",
  "¿Cómo se celebra un cumpleaños en tu país?",
  "¿Qué canción te recuerda tu infancia?",
  "¿Qué palabra de tu idioma te gusta mucho y qué significa?",
  "¿Cómo está el clima hoy donde vives? Cuéntanos desde qué ciudad escribes.",
  "¿Qué es lo primero que haces al despertar?",
  "¿Cuál es el lugar más bonito de tu ciudad?",
  "¿Qué dicho o refrán de tus abuelos todavía recuerdas?",
  "¿Qué bebida acompaña tus mañanas: café, té, mate, otra?",
  "¿Qué te hizo sonreír esta semana?",
  "Si mañana pudieras viajar a cualquier país, ¿a cuál irías y por qué?",
  "¿Qué costumbre de tu país crees que sorprendería a alguien de fuera?",
  "¿Cuál es tu plato favorito para celebrar en familia?",
  "¿Qué sueño de la infancia todavía tienes pendiente?",
  "¿Qué libro, serie o película le recomendarías a todo el mundo?",
  "¿Cómo saludan en tu país a alguien que quieren mucho?",
  "¿Qué olor te transporta a tu casa?",
  "¿A qué jugabas de pequeño en la calle o en el colegio?",
  "¿Qué es lo que más te gusta de la gente de tu país?",
  "¿Qué aprendiste este año que quieras compartir?",
  "¿Tienes mascota? Cuéntanos su nombre y cómo es.",
  "¿Cuál es tu momento favorito del día?",
  "¿Qué fruta o comida de tu tierra extrañarías si vivieras lejos?",
  "¿Qué consejo le darías a alguien que empieza un trabajo nuevo?",
  "¿Qué música suena en las fiestas de tu país?",
  "¿Qué te gustaría preguntarle a alguien que vive al otro lado del mundo?",
  "¿Cómo es para ti un día de descanso perfecto?",
  "¿Qué tradición de tu familia quieres conservar siempre?",
  "¿Qué deseo tienes para el mes que viene?",
  "¿Qué cosa pequeña te hace feliz?",
];

/** La pregunta de una fecha AAAA-MM-DD (rota cada día, la misma para todo el mundo). */
export function preguntaDelDia(fecha: string) {
  const dia = Math.floor(Date.parse(`${fecha}T12:00:00Z`) / 86_400_000);
  return PREGUNTAS_MUNDO[((dia % PREGUNTAS_MUNDO.length) + PREGUNTAS_MUNDO.length) % PREGUNTAS_MUNDO.length];
}

/** Primer mensaje de Sibila en la pregunta del mundo (en español; cada quien lo lee traducido). */
export function aperturaMundo(pregunta: string) {
  return `Hoy sin cartas: una pregunta para conocernos de un país a otro 🌍\n\n${pregunta}\n\nEscribe en tu idioma y cuéntanos desde dónde escribes: todos te leen en el suyo.`;
}
