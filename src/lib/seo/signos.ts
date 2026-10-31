/**
 * Textos públicos de cada signo para las páginas /signos-zodiacales (SEO, en español).
 * Se complementan con los datos de src/lib/zodiaco.ts (elemento, regente, fechas).
 */

export interface TextoSigno {
  /** Frase corta que resume el signo. */
  lema: string;
  personalidad: string;
  amor: string;
  trabajo: string;
  sombra: string;
  consejo: string;
  /** Arcano mayor asociado (id de src/lib/tarot/deck.ts). */
  carta: string;
}

export const TEXTO_SIGNO: Record<string, TextoSigno> = {
  aries: {
    lema: "El que empieza: fuego que abre caminos.",
    personalidad:
      "Aries es el primer signo del zodiaco y vive como tal: quiere ser el primero, llegar antes y probarlo todo. Es directo, valiente y honesto hasta la brusquedad. Se aburre rápido de lo que no avanza, pero pocas personas tienen su capacidad de arrancar desde cero cuando todo parece perdido.",
    amor:
      "En el amor, Aries conquista con intensidad y sin rodeos: si le gustas, lo vas a saber. Necesita una pareja que lo rete, que tenga vida propia y que no le tema a una discusión. Lo que más lo enfría es la rutina y la sensación de estar encerrado.",
    trabajo:
      "Brilla en lo que tiene reto, competencia o urgencia: emprender, liderar un equipo nuevo, vender, el deporte o cualquier oficio donde haya que decidir rápido. Su punto débil es terminar lo que empieza; le conviene rodearse de personas constantes.",
    sombra: "Impaciencia, enojo que estalla y se olvida, y la tendencia a actuar antes de escuchar.",
    consejo: "Cuenta hasta tres antes de responder: tu fuego es un regalo cuando lo diriges.",
    carta: "el-emperador",
  },
  tauro: {
    lema: "El que construye: tierra fértil y paciente.",
    personalidad:
      "Tauro es calma, constancia y placer por lo bueno de la vida: la comida rica, la música, la naturaleza, un hogar bonito. Es leal y confiable; lo que promete, lo cumple. Le cuesta cambiar de opinión, pero cuando decide algo lo sostiene hasta el final.",
    amor:
      "Es uno de los signos más fieles y sensuales. Ama con hechos: cuida, cocina, acompaña. Necesita seguridad y tiempo; no le gustan los juegos ni la incertidumbre. Cuando se siente traicionado, le cuesta mucho volver a confiar.",
    trabajo:
      "Tiene talento para el dinero, las finanzas, la cocina, el arte, la decoración y todo lo que se construye paso a paso. Prefiere un trabajo estable a uno emocionante, y suele acumular patrimonio con los años.",
    sombra: "Terquedad, apego a lo material y resistencia a los cambios necesarios.",
    consejo: "Lo que sueltas a tiempo deja espacio para algo mejor: no todo cambio es pérdida.",
    carta: "el-sumo-sacerdote",
  },
  geminis: {
    lema: "El que pregunta: aire curioso y veloz.",
    personalidad:
      "Géminis vive en la mente: pregunta, conversa, lee, aprende y cambia de tema con una facilidad que asombra. Es ingenioso, divertido y adaptable. Tiene dos caras porque ve los dos lados de todo, no porque sea falso.",
    amor:
      "Se enamora por la conversación. Necesita una pareja que lo entretenga, que le cuente cosas y que le dé libertad. Si se aburre, se distrae. Es cariñoso con palabras, mensajes y detalles ingeniosos más que con grandes promesas.",
    trabajo:
      "Comunicación, ventas, redes sociales, enseñanza, periodismo, escritura y comercio. Puede llevar varios proyectos a la vez; su reto es profundizar en uno y no dejarlo a medias.",
    sombra: "Dispersión, nervios, chisme y cambiar de opinión según el día.",
    consejo: "Elige una sola cosa esta semana y llévala hasta el final: tu mente brilla más cuando se enfoca.",
    carta: "los-enamorados",
  },
  cancer: {
    lema: "El que cuida: agua que protege.",
    personalidad:
      "Cáncer es el signo del hogar, la familia y la memoria. Es sensible, intuitivo y protector; siente lo que los demás sienten antes de que lo digan. Detrás de su caparazón hay una ternura enorme y una fuerza que aparece cuando alguien que ama está en peligro.",
    amor:
      "Ama profundo y para largo. Necesita sentirse seguro antes de abrirse, y cuando lo hace cuida como nadie. Es detallista y recuerda fechas, gustos y heridas. Le duele la indiferencia más que una pelea.",
    trabajo:
      "Salud, cuidado de personas, educación, cocina, psicología, bienes raíces y negocios familiares. Trabaja mejor en ambientes donde se siente parte de algo.",
    sombra: "Cambios de humor, rencor guardado y miedo a soltar el pasado.",
    consejo: "Cuídate como cuidas a los demás: tu bienestar también es tu familia.",
    carta: "el-carro",
  },
  leo: {
    lema: "El que brilla: fuego que calienta.",
    personalidad:
      "Leo, regido por el Sol, nació para ser visto. Es generoso, alegre, creativo y leal; cuando entra a un lugar, se nota. Tiene un corazón grande y un orgullo del mismo tamaño. Necesita reconocimiento, y a cambio da calor y protección a los suyos.",
    amor:
      "Romántico y apasionado, le encanta conquistar y ser admirado. Es espléndido con quien ama: regalos, planes, atención. Necesita una pareja que lo valore en público y en privado; la indiferencia lo apaga.",
    trabajo:
      "Liderazgo, arte, escena, moda, educación y todo lo que tenga público. Es un excelente jefe cuando aprende a escuchar, y un emprendedor carismático.",
    sombra: "Orgullo herido, necesidad de aprobación y dificultad para reconocer errores.",
    consejo: "Tu luz no se apaga si otro brilla: aplaudir a los demás también te hace grande.",
    carta: "la-fuerza",
  },
  virgo: {
    lema: "El que perfecciona: tierra que ordena.",
    personalidad:
      "Virgo observa lo que los demás no ven: el detalle, el error, la forma de hacerlo mejor. Es práctico, servicial, inteligente y discreto. Su manera de amar es ayudar. Tiene una mente analítica que, mal llevada, se convierte en preocupación constante.",
    amor:
      "Es reservado al principio y muy entregado cuando confía. Demuestra su amor con actos: resolver, cuidar, estar. Necesita orden, respeto y una pareja que no lo critique tanto como él se critica a sí mismo.",
    trabajo:
      "Salud, nutrición, análisis, contabilidad, edición, investigación, tecnología y todo lo que exige precisión. Es el compañero que salva el proyecto en el último minuto.",
    sombra: "Perfeccionismo, ansiedad, crítica excesiva y dificultad para descansar.",
    consejo: "Hecho es mejor que perfecto: date permiso de equivocarte.",
    carta: "el-ermitano",
  },
  libra: {
    lema: "El que equilibra: aire que armoniza.",
    personalidad:
      "Libra, regido por Venus, busca la belleza, la justicia y la paz. Es encantador, diplomático y sociable; sabe ponerse en el lugar del otro y unir a personas distintas. Pesa todas las opciones, y por eso a veces le cuesta tanto decidir.",
    amor:
      "Es el signo de la pareja: le gusta estar acompañado y cuidar la relación. Romántico, detallista y elegante. Necesita armonía; las peleas lo desgastan. Su reto es no perderse a sí mismo por complacer al otro.",
    trabajo:
      "Derecho, diseño, moda, relaciones públicas, mediación, arte y atención al cliente. Trabaja mejor en equipo y en ambientes bonitos.",
    sombra: "Indecisión, evitar conflictos a toda costa y depender de la opinión ajena.",
    consejo: "Decir que no también es equilibrio: tu paz importa tanto como la de los demás.",
    carta: "la-justicia",
  },
  escorpio: {
    lema: "El que transforma: agua profunda.",
    personalidad:
      "Escorpio es intensidad pura. Siente todo al máximo, ve lo que está escondido y no se conforma con la superficie. Es leal, magnético, reservado y muy intuitivo. Ha vivido muchas muertes y renacimientos, y de cada una sale más fuerte.",
    amor:
      "Ama con todo o no ama. Es apasionado, protector y celoso. Necesita confianza absoluta y profundidad emocional; la mentira es imperdonable para él. Cuando se entrega, es para siempre.",
    trabajo:
      "Investigación, psicología, finanzas, medicina, criminalística, terapias y todo lo que exige ir al fondo. Es estratégico y muy difícil de engañar.",
    sombra: "Celos, rencor, control y la tendencia a guardar secretos que pesan.",
    consejo: "Perdonar no es olvidar: es soltar el peso para que tú puedas avanzar.",
    carta: "la-muerte",
  },
  sagitario: {
    lema: "El que explora: fuego que busca sentido.",
    personalidad:
      "Sagitario es el viajero del zodiaco: quiere conocer el mundo, otras culturas, otras ideas. Es optimista, honesto, divertido y filosófico. Tiene una fe enorme en que todo va a salir bien, y muchas veces tiene razón.",
    amor:
      "Necesita una pareja que sea también su compañera de aventuras. Es apasionado y generoso, pero no soporta sentirse atado. Su sinceridad puede doler; nunca la usa para herir.",
    trabajo:
      "Viajes, turismo, educación, idiomas, filosofía, deporte, comercio internacional y emprendimientos con propósito. Necesita libertad y sentido en lo que hace.",
    sombra: "Exceso, promesas que no cumple, impaciencia con los detalles.",
    consejo: "La aventura también está en quedarse y profundizar: no todo se resuelve yéndose.",
    carta: "la-templanza",
  },
  capricornio: {
    lema: "El que escala: tierra que llega a la cima.",
    personalidad:
      "Capricornio es disciplina, responsabilidad y ambición. Avanza paso a paso, sin prisa y sin pausa, hasta llegar a donde se propuso. Parece serio, pero tiene un humor seco y una ternura que muestra solo a los suyos. Mejora con los años.",
    amor:
      "Es reservado y prudente para enamorarse, pero cuando se compromete es estable y leal. Demuestra su amor construyendo un futuro: planes, casa, seguridad. Necesita respeto y una pareja que admire su esfuerzo.",
    trabajo:
      "Administración, gerencia, ingeniería, finanzas, política, construcción y cualquier carrera a largo plazo. Es el signo que más se toma en serio el trabajo.",
    sombra: "Rigidez, exceso de trabajo, pesimismo y frialdad aparente.",
    consejo: "El éxito también se mide en momentos felices: agenda tiempo para disfrutar.",
    carta: "el-diablo",
  },
  acuario: {
    lema: "El que innova: aire que cambia el mundo.",
    personalidad:
      "Acuario piensa diferente y está orgulloso de hacerlo. Es original, independiente, humanitario y adelantado a su tiempo. Le importan las causas, las amistades y la libertad. Puede parecer distante, pero es de los amigos más leales del zodiaco.",
    amor:
      "Necesita que su pareja sea primero su amiga. Valora la libertad, la conversación inteligente y el respeto por su espacio. No le gustan los dramas ni los celos; ama de una manera poco convencional, pero sincera.",
    trabajo:
      "Tecnología, ciencia, innovación, astrología, causas sociales, comunidades y todo lo que tenga futuro. Es el que propone la idea que nadie había pensado.",
    sombra: "Frialdad emocional, terquedad con sus ideas y rebeldía sin causa.",
    consejo: "Mostrar lo que sientes no te quita libertad: te acerca a quien te quiere.",
    carta: "la-estrella",
  },
  piscis: {
    lema: "El que sueña: agua sin orillas.",
    personalidad:
      "Piscis es el último signo y lleva un poco de todos. Es sensible, compasivo, artístico e intuitivo; siente el dolor ajeno como propio y tiene una conexión natural con lo espiritual. Sueña mucho y, cuando aterriza sus sueños, crea cosas hermosas.",
    amor:
      "Es el romántico del zodiaco: se entrega por completo, idealiza y ama sin condiciones. Necesita ternura, comprensión y una pareja que lo cuide sin aprovecharse de su bondad.",
    trabajo:
      "Arte, música, cine, salud, terapias, espiritualidad, fotografía y ayuda a otros. Trabaja mejor desde la inspiración que desde la presión.",
    sombra: "Evasión, confusión, sacrificarse de más y dificultad para poner límites.",
    consejo: "Tus límites protegen tu sensibilidad: decir basta también es amor.",
    carta: "la-luna",
  },
};
