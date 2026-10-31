/**
 * Test público «¿Qué carta del tarot eres?»: 6 preguntas, cada respuesta suma
 * puntos a varios arcanos mayores. El resultado es determinista (mismas
 * respuestas = misma carta) y se comparte con una imagen y un enlace.
 */

export interface Pregunta {
  texto: string;
  opciones: { texto: string; cartas: string[] }[];
}

export const PREGUNTAS: Pregunta[] = [
  {
    texto: "Tienes un sábado completamente libre. ¿Qué haces?",
    opciones: [
      { texto: "Salgo sin plan, a ver qué me encuentro", cartas: ["el-loco", "el-carro", "la-rueda-de-la-fortuna", "el-sol"] },
      { texto: "Me quedo en casa con velas, un libro o una serie", cartas: ["el-ermitano", "la-sacerdotisa", "la-luna", "el-colgado"] },
      { texto: "Reúno a mi gente y cocino algo rico", cartas: ["la-emperatriz", "los-enamorados", "el-sol", "la-templanza"] },
      { texto: "Adelanto mis proyectos; el tiempo libre es oro", cartas: ["el-emperador", "el-mago", "el-carro", "el-mundo"] },
    ],
  },
  {
    texto: "Cuando aparece un problema, tú…",
    opciones: [
      { texto: "Lo enfrento de una vez, de frente", cartas: ["la-fuerza", "el-carro", "la-torre", "el-emperador"] },
      { texto: "Lo pienso en silencio hasta entenderlo", cartas: ["el-colgado", "la-sacerdotisa", "la-justicia", "el-ermitano"] },
      { texto: "Busco el consejo de alguien que sepa", cartas: ["el-sumo-sacerdote", "la-templanza", "los-enamorados", "el-juicio"] },
      { texto: "Confío en que la vida lo va a acomodar", cartas: ["la-estrella", "la-rueda-de-la-fortuna", "el-loco", "la-luna"] },
    ],
  },
  {
    texto: "¿Qué es lo que más valoras en una persona?",
    opciones: [
      { texto: "La lealtad", cartas: ["la-fuerza", "la-emperatriz", "los-enamorados", "el-sumo-sacerdote"] },
      { texto: "La honestidad, aunque duela", cartas: ["la-justicia", "el-sol", "el-juicio", "la-torre"] },
      { texto: "El misterio y la profundidad", cartas: ["la-luna", "la-sacerdotisa", "el-diablo", "la-muerte"] },
      { texto: "Que sea libre y auténtica", cartas: ["el-mundo", "la-estrella", "el-loco", "el-mago"] },
    ],
  },
  {
    texto: "Tus amigos dicen que tú eres…",
    opciones: [
      { texto: "Intensa: todo lo vives al máximo", cartas: ["la-muerte", "el-diablo", "la-torre", "la-fuerza"] },
      { texto: "La sabia del grupo", cartas: ["la-sacerdotisa", "el-sumo-sacerdote", "el-ermitano", "la-templanza"] },
      { texto: "La alegría: donde llegas, hay luz", cartas: ["la-estrella", "el-sol", "la-emperatriz", "el-loco"] },
      { texto: "La que resuelve todo", cartas: ["el-mago", "el-emperador", "la-justicia", "el-carro"] },
    ],
  },
  {
    texto: "Elige el símbolo que más te llama:",
    opciones: [
      { texto: "🔥 Una vela encendida", cartas: ["el-sol", "la-fuerza", "la-torre", "el-carro"] },
      { texto: "🌕 La luna llena", cartas: ["la-luna", "la-sacerdotisa", "la-estrella", "el-colgado"] },
      { texto: "🗝️ Una llave antigua", cartas: ["el-sumo-sacerdote", "el-ermitano", "la-muerte", "el-juicio"] },
      { texto: "🧭 Una brújula", cartas: ["el-mundo", "la-rueda-de-la-fortuna", "el-mago", "el-loco"] },
    ],
  },
  {
    texto: "¿Qué es lo que más necesitas este año?",
    opciones: [
      { texto: "Un nuevo comienzo", cartas: ["el-juicio", "la-muerte", "la-estrella", "el-loco"] },
      { texto: "Amor", cartas: ["los-enamorados", "la-emperatriz", "la-templanza", "el-diablo"] },
      { texto: "Estabilidad y dinero", cartas: ["el-emperador", "el-mundo", "la-justicia", "la-rueda-de-la-fortuna"] },
      { texto: "Paz interior", cartas: ["la-templanza", "el-colgado", "el-ermitano", "la-luna"] },
    ],
  },
];

/** Carta resultante para unas respuestas (índice de opción por pregunta). */
export function cartaDelTest(respuestas: number[]): string {
  const puntos = new Map<string, number>();
  respuestas.forEach((r, i) => {
    const op = PREGUNTAS[i]?.opciones[r];
    op?.cartas.forEach((c, j) => puntos.set(c, (puntos.get(c) ?? 0) + (j === 0 ? 3 : 2)));
  });
  const max = Math.max(...puntos.values());
  const empatadas = [...puntos.entries()].filter(([, p]) => p === max).map(([c]) => c).sort();
  const semilla = respuestas.reduce((h, r, i) => (h * 31 + r * 7 + i) % 9973, 17);
  return empatadas[semilla % empatadas.length];
}

export interface ResultadoTest {
  /** Frase corta para la imagen y para compartir. */
  esencia: string;
  descripcion: string;
  don: string;
  reto: string;
}

export const RESULTADOS: Record<string, ResultadoTest> = {
  "el-loco": {
    esencia: "Tu alma es libre: te atreves donde otros dudan.",
    descripcion: "Eres espontánea, aventurera y curiosa. No te asusta empezar de cero ni cambiar de rumbo, porque confías en que el camino se abre al caminar. La gente se contagia de tu ligereza.",
    don: "La valentía de empezar.",
    reto: "Mirar un poco antes de saltar.",
  },
  "el-mago": {
    esencia: "Tienes el poder de convertir ideas en realidad.",
    descripcion: "Eres ingeniosa, hábil y resolutiva. Tienes talento para muchas cosas y una facilidad especial para comunicar y convencer. Cuando te concentras en algo, lo logras.",
    don: "El poder de manifestar.",
    reto: "No dispersar tu talento en mil cosas.",
  },
  "la-sacerdotisa": {
    esencia: "Sabes cosas que nadie te ha dicho: tu intuición no falla.",
    descripcion: "Eres reservada, profunda y misteriosa. Escuchas más de lo que hablas y percibes lo que los demás esconden. Tus corazonadas suelen tener razón.",
    don: "Una intuición muy poderosa.",
    reto: "Confiar en lo que sientes y decirlo en voz alta.",
  },
  "la-emperatriz": {
    esencia: "Donde tú estás, todo florece.",
    descripcion: "Eres cálida, creativa y generosa. Cuidas, nutres y haces que la gente se sienta en casa. Tienes un gusto especial por la belleza y por los placeres sencillos.",
    don: "Hacer crecer todo lo que tocas.",
    reto: "Cuidarte a ti con el mismo amor que das.",
  },
  "el-emperador": {
    esencia: "Eres la roca: los demás se apoyan en ti.",
    descripcion: "Eres firme, organizada y protectora. Pones orden donde hay caos y no te asusta la responsabilidad. Cuando das tu palabra, la cumples.",
    don: "Construir cosas que duran.",
    reto: "Soltar el control de vez en cuando.",
  },
  "el-sumo-sacerdote": {
    esencia: "Eres la guía a la que todos buscan para pedir consejo.",
    descripcion: "Eres sabia, leal y fiel a tus valores. Te importan las tradiciones, el aprendizaje y enseñar lo que sabes. La gente confía en tu criterio.",
    don: "La sabiduría que se comparte.",
    reto: "Abrirte a caminos nuevos sin miedo.",
  },
  "los-enamorados": {
    esencia: "Amas con todo el corazón y eliges con el alma.",
    descripcion: "Eres romántica, sensible y muy humana. Para ti las relaciones lo son todo, y sabes crear conexiones profundas. Tu vida está marcada por decisiones del corazón.",
    don: "Conectar de verdad con los demás.",
    reto: "Elegirte a ti también.",
  },
  "el-carro": {
    esencia: "Cuando decides algo, nada te detiene.",
    descripcion: "Eres determinada, ambiciosa y valiente. Te mueves rápido hacia tus metas y no te rindes ante los obstáculos. Tu fuerza de voluntad es admirable.",
    don: "Avanzar contra viento y marea.",
    reto: "Disfrutar el camino, no solo la meta.",
  },
  "la-fuerza": {
    esencia: "Tu fuerza es suave, pero nadie puede contigo.",
    descripcion: "Eres valiente, paciente y compasiva. Has superado cosas que otros no imaginan, y lo hiciste con el corazón, no con los puños. Calmas tormentas con tu presencia.",
    don: "La fortaleza del corazón.",
    reto: "Pedir ayuda sin sentir que es debilidad.",
  },
  "el-ermitano": {
    esencia: "Tu luz interior ilumina el camino de otros.",
    descripcion: "Eres reflexiva, sabia e independiente. Necesitas tus momentos de soledad para entenderte, y de ahí salen tus mejores respuestas. Ves más allá de la superficie.",
    don: "La sabiduría del silencio.",
    reto: "No aislarte cuando te duele algo.",
  },
  "la-rueda-de-la-fortuna": {
    esencia: "La suerte te sigue: tu vida está llena de giros mágicos.",
    descripcion: "Eres adaptable, optimista y un poco imprevisible. Las casualidades y los golpes de suerte te encuentran, y sabes fluir con los cambios. Tu historia nunca es aburrida.",
    don: "Fluir con el destino.",
    reto: "Tomar el timón cuando la rueda gira.",
  },
  "la-justicia": {
    esencia: "Tu palabra pesa: eres justa y verdadera.",
    descripcion: "Eres honesta, equilibrada y racional. No soportas las injusticias y defiendes lo correcto aunque te cueste. La gente confía en ti para decidir.",
    don: "Ver con claridad lo que es justo.",
    reto: "Ser tan compasiva contigo como eres justa con los demás.",
  },
  "el-colgado": {
    esencia: "Ves el mundo desde un ángulo que nadie más ve.",
    descripcion: "Eres paciente, espiritual y diferente. Sabes esperar el momento y encontrar sentido incluso en las pausas. Tu manera de pensar abre los ojos a los demás.",
    don: "Una mirada única.",
    reto: "Pasar de la espera a la acción.",
  },
  "la-muerte": {
    esencia: "Has renacido muchas veces, y cada vez más fuerte.",
    descripcion: "Eres intensa, profunda y transformadora. No le temes a los finales, porque sabes que abren espacio para lo nuevo. Tu vida es una historia de renacimientos.",
    don: "El poder de transformarte.",
    reto: "Soltar sin culpa lo que ya terminó.",
  },
  "la-templanza": {
    esencia: "Tu calma es medicina para los demás.",
    descripcion: "Eres equilibrada, paciente y conciliadora. Sabes mezclar los opuestos y encontrar el punto medio. Donde hay conflicto, tú traes paz.",
    don: "Sanar y armonizar.",
    reto: "Expresar también tu enojo cuando hace falta.",
  },
  "el-diablo": {
    esencia: "Tu magnetismo es irresistible.",
    descripcion: "Eres apasionada, seductora y sin miedo a tus deseos. Tienes una energía que atrae, y conoces bien tu lado oscuro, lo que te hace auténtica. Vives con intensidad.",
    don: "Un magnetismo que atrae.",
    reto: "Que nada ni nadie te ate.",
  },
  "la-torre": {
    esencia: "Cuando llegas, todo cambia.",
    descripcion: "Eres auténtica, directa y revolucionaria. No soportas lo falso y no tienes miedo de derribar lo que no funciona. Has vivido sacudidas que te hicieron indestructible.",
    don: "La verdad que libera.",
    reto: "Construir después de derribar.",
  },
  "la-estrella": {
    esencia: "Eres esperanza: brillas incluso en la noche más oscura.",
    descripcion: "Eres optimista, inspiradora y llena de fe. Tienes una luz especial que sana a los demás, y siempre encuentras motivos para creer. Tus sueños se cumplen.",
    don: "Inspirar esperanza.",
    reto: "Creer en ti tanto como crees en los demás.",
  },
  "la-luna": {
    esencia: "Eres magia y misterio: tus sueños te hablan.",
    descripcion: "Eres intuitiva, sensible e imaginativa. Sientes lo que no se ve, sueñas mucho y tienes un mundo interior inmenso. Tu creatividad no tiene límites.",
    don: "Una conexión profunda con lo invisible.",
    reto: "Distinguir tus miedos de tu intuición.",
  },
  "el-sol": {
    esencia: "Eres pura luz: donde llegas, todo se ilumina.",
    descripcion: "Eres alegre, generosa y vital. Tu energía contagia, tu risa se escucha y tu presencia hace sentir bien a todos. La vida te sonríe porque tú le sonríes a ella.",
    don: "La alegría que contagia.",
    reto: "Permitirte también los días grises.",
  },
  "el-juicio": {
    esencia: "Escuchas tu llamado y renaces con propósito.",
    descripcion: "Eres consciente, decidida y con una misión clara. Sabes aprender del pasado y levantarte con más fuerza. Ayudas a otros a despertar.",
    don: "Despertar y renacer.",
    reto: "Perdonarte por el pasado.",
  },
  "el-mundo": {
    esencia: "Naciste para completar ciclos y celebrar tus logros.",
    descripcion: "Eres plena, realizada y viajera del alma. Terminas lo que empiezas y sabes disfrutar tus victorias. Te sientes en casa en cualquier parte del mundo.",
    don: "La plenitud.",
    reto: "Atreverte a empezar el siguiente ciclo.",
  },
};
