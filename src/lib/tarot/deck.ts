/**
 * Mazo completo de tarot (78 cartas) en la tradición Rider-Waite.
 * Textos en español neutro. Sin URLs de imágenes.
 */

export type Arcano = "mayor" | "menor";
export type Palo = "bastos" | "copas" | "espadas" | "oros";

export interface CartaTarot {
  id: string;
  nombre: string;
  arcano: Arcano;
  numero: number;
  palo?: Palo;
  elemento: "fuego" | "agua" | "aire" | "tierra" | "espiritu";
  palabrasClave: string[];
  palabrasClaveInvertida: string[];
  significado: string;
  significadoInvertido: string;
  amor: string;
  trabajo: string;
}

export const MAZO: CartaTarot[] = [
  // ───────────────────────── ARCANOS MAYORES ─────────────────────────
  {
    id: "el-loco",
    nombre: "El Loco",
    arcano: "mayor",
    numero: 0,
    elemento: "espiritu",
    palabrasClave: ["comienzos", "libertad", "espontaneidad", "fe", "aventura"],
    palabrasClaveInvertida: ["imprudencia", "temeridad", "ingenuidad", "caos"],
    significado:
      "El Loco marca el inicio de un viaje sin mapa: das un paso hacia lo desconocido con el corazón ligero y la confianza de quien todavía no ha aprendido a temer. Es una invitación a soltar el exceso de planes y dejar que la vida te sorprenda. Todo está por escribirse y esa es justamente su promesa.",
    significadoInvertido:
      "Invertido, El Loco advierte que el impulso se ha vuelto descuido. Puede que estés evitando responsabilidades o saltando al vacío sin mirar dónde vas a caer. Conviene detenerse un instante y preguntarse si la libertad que buscas no es, en realidad, una huida.",
    amor: "Una relación nueva o una etapa fresca llega con ligereza; atrévete a conocer sin exigir garantías.",
    trabajo: "Es buen momento para emprender, cambiar de rumbo o aceptar un proyecto que te saque de la rutina.",
  },
  {
    id: "el-mago",
    nombre: "El Mago",
    arcano: "mayor",
    numero: 1,
    elemento: "espiritu",
    palabrasClave: ["voluntad", "habilidad", "manifestación", "recursos", "iniciativa"],
    palabrasClaveInvertida: ["manipulación", "engaño", "talento desperdiciado", "inseguridad"],
    significado:
      "El Mago tiene sobre la mesa todo lo que necesita: ideas, emociones, decisión y medios materiales. Esta carta te recuerda que ya cuentas con las herramientas para convertir una intención en realidad. Lo que falta no es capacidad, sino el acto de comenzar con plena concentración.",
    significadoInvertido:
      "Invertido, El Mago sugiere que el talento se está usando mal o no se está usando en absoluto. Puede haber alguien que promete más de lo que cumple, o quizá tú mismo dudas de tus propias habilidades. Revisa si estás diciendo la verdad, sobre todo a ti.",
    amor: "Tienes el poder de crear la conexión que deseas; la comunicación clara será tu mejor herramienta.",
    trabajo: "Tus habilidades son reconocidas y es momento de presentar propuestas, negociar o lanzar un proyecto.",
  },
  {
    id: "la-sacerdotisa",
    nombre: "La Sacerdotisa",
    arcano: "mayor",
    numero: 2,
    elemento: "espiritu",
    palabrasClave: ["intuición", "misterio", "sabiduría interior", "silencio", "secretos"],
    palabrasClaveInvertida: ["secretos dañinos", "desconexión", "superficialidad", "ignorar señales"],
    significado:
      "La Sacerdotisa custodia lo que no se dice en voz alta. Te pide que escuches tu intuición antes que las opiniones ajenas y que aceptes que hay cosas que aún no deben revelarse. Es una carta de espera fértil, de conocimiento que madura en la quietud.",
    significadoInvertido:
      "Invertida, La Sacerdotisa señala que estás ignorando tu voz interior o que hay información oculta que te afecta. Quizá te dejas llevar por la superficie de las cosas cuando tu instinto ya te ha avisado. Vuelve a conectar contigo antes de decidir.",
    amor: "Hay sentimientos que todavía no se expresan; observa los silencios y confía en lo que percibes.",
    trabajo: "No es momento de mostrar todas tus cartas; escucha, investiga y guarda lo que sabes hasta que sea útil.",
  },
  {
    id: "la-emperatriz",
    nombre: "La Emperatriz",
    arcano: "mayor",
    numero: 3,
    elemento: "espiritu",
    palabrasClave: ["abundancia", "fertilidad", "creatividad", "nutrición", "belleza"],
    palabrasClaveInvertida: ["dependencia", "bloqueo creativo", "sobreprotección", "descuido"],
    significado:
      "La Emperatriz es la tierra que da fruto sin esfuerzo aparente. Anuncia un tiempo de crecimiento, de creatividad que florece y de placer en las cosas sencillas. Te invita a cuidar y dejarte cuidar, a disfrutar del cuerpo, del hogar y de todo lo que nace de tus manos.",
    significadoInvertido:
      "Invertida, La Emperatriz muestra que la fuente creativa se ha secado o que el cuidado se convirtió en asfixia. Puedes sentirte dependiente de los demás o desconectada de tus propias necesidades. Vuelve a nutrirte antes de intentar nutrir a otros.",
    amor: "Una etapa de ternura y sensualidad; el vínculo crece cuando ambos se sienten cuidados.",
    trabajo: "Los proyectos creativos prosperan y los recursos aumentan; siembra con generosidad.",
  },
  {
    id: "el-emperador",
    nombre: "El Emperador",
    arcano: "mayor",
    numero: 4,
    elemento: "espiritu",
    palabrasClave: ["autoridad", "estructura", "estabilidad", "liderazgo", "protección"],
    palabrasClaveInvertida: ["tiranía", "rigidez", "falta de disciplina", "abuso de poder"],
    significado:
      "El Emperador construye orden donde había caos. Representa la disciplina, las reglas claras y la capacidad de tomar decisiones firmes para proteger lo que importa. Su presencia te pide asumir el mando de tu vida con responsabilidad y sin pedir permiso.",
    significadoInvertido:
      "Invertido, El Emperador se vuelve inflexible o pierde por completo el control. Puede tratarse de una figura dominante que oprime, o de tu propia dificultad para sostener límites y compromisos. Busca el equilibrio entre firmeza y escucha.",
    amor: "Una relación necesita compromiso y estabilidad; alguien confiable y protector puede aparecer o afirmarse.",
    trabajo: "Es tiempo de liderar, poner estructura y tomar decisiones con autoridad; los ascensos son posibles.",
  },
  {
    id: "el-sumo-sacerdote",
    nombre: "El Sumo Sacerdote",
    arcano: "mayor",
    numero: 5,
    elemento: "espiritu",
    palabrasClave: ["tradición", "enseñanza", "instituciones", "creencias", "guía"],
    palabrasClaveInvertida: ["rebeldía", "dogmatismo", "hipocresía", "cuestionar normas"],
    significado:
      "El Sumo Sacerdote transmite un saber que viene de lejos. Habla de maestros, de instituciones y de los valores compartidos que dan sentido a una comunidad. Puede señalar que necesitas consejo experimentado, o que es momento de formalizar algo mediante un rito o un compromiso público.",
    significadoInvertido:
      "Invertido, El Sumo Sacerdote cuestiona la autoridad establecida. Quizá las reglas que seguías ya no te representan, o descubres que quien predicaba no practicaba. Es una llamada a formar tu propio criterio sin caer en el rechazo por el rechazo mismo.",
    amor: "Los vínculos tienden a formalizarse; los valores compartidos sostienen la relación.",
    trabajo: "Sigue los procedimientos y busca un mentor; los ámbitos educativos y las instituciones te favorecen.",
  },
  {
    id: "los-enamorados",
    nombre: "Los Enamorados",
    arcano: "mayor",
    numero: 6,
    elemento: "espiritu",
    palabrasClave: ["unión", "elección", "armonía", "atracción", "valores"],
    palabrasClaveInvertida: ["desequilibrio", "indecisión", "conflicto de valores", "ruptura"],
    significado:
      "Los Enamorados hablan de una unión profunda, pero también de una elección que define quién eres. Cuando aparece, algo o alguien te llama con fuerza y debes decidir con el corazón alineado a tus valores. La armonía llega cuando eliges con honestidad.",
    significadoInvertido:
      "Invertidos, Los Enamorados muestran una decisión postergada o tomada por miedo. Puede haber tensión en la pareja, tentaciones que dividen o una relación desigual. Pregúntate qué es lo que realmente quieres antes de seguir en la duda.",
    amor: "Un encuentro significativo o una etapa de gran complicidad; el amor te pide elegir con claridad.",
    trabajo: "Una sociedad o alianza puede ser muy fructífera; elige el camino que respete tus principios.",
  },
  {
    id: "el-carro",
    nombre: "El Carro",
    arcano: "mayor",
    numero: 7,
    elemento: "espiritu",
    palabrasClave: ["victoria", "determinación", "control", "avance", "voluntad"],
    palabrasClaveInvertida: ["falta de dirección", "agresividad", "obstáculos", "pérdida de control"],
    significado:
      "El Carro avanza porque su conductor ha unido fuerzas opuestas bajo una sola voluntad. Anuncia triunfo tras el esfuerzo, viajes y la capacidad de mantener el rumbo pese a las distracciones. La clave está en la disciplina emocional, no en la fuerza bruta.",
    significadoInvertido:
      "Invertido, El Carro pierde las riendas. Puedes sentirte arrastrado por impulsos contradictorios o empujar hacia una meta que ya no tiene sentido. Antes de acelerar, comprueba que sabes a dónde quieres llegar.",
    amor: "La relación avanza con decisión; si hay distancia, se supera con voluntad compartida.",
    trabajo: "Éxito por mérito propio; buen augurio para viajes de negocios, mudanzas laborales y metas ambiciosas.",
  },
  {
    id: "la-fuerza",
    nombre: "La Fuerza",
    arcano: "mayor",
    numero: 8,
    elemento: "espiritu",
    palabrasClave: ["coraje", "paciencia", "compasión", "dominio interior", "resiliencia"],
    palabrasClaveInvertida: ["debilidad", "inseguridad", "ira reprimida", "abuso de fuerza"],
    significado:
      "La Fuerza no vence al león: lo doma con serenidad. Esta carta habla de un coraje suave, de la capacidad de manejar los instintos con paciencia y amor. Tienes más resistencia interior de la que crees, y ahora puedes usarla con gentileza.",
    significadoInvertido:
      "Invertida, La Fuerza revela dudas sobre ti mismo o una tendencia a reaccionar con brusquedad. Puede que la ira o el miedo estén tomando decisiones por ti. Reconoce tus emociones sin dejar que te gobiernen.",
    amor: "El amor se sostiene con paciencia y ternura; una relación resiste las pruebas si hay confianza.",
    trabajo: "Persiste ante la presión con calma; tu temple será reconocido más que cualquier despliegue de poder.",
  },
  {
    id: "el-ermitano",
    nombre: "El Ermitaño",
    arcano: "mayor",
    numero: 9,
    elemento: "espiritu",
    palabrasClave: ["introspección", "búsqueda", "soledad", "sabiduría", "retiro"],
    palabrasClaveInvertida: ["aislamiento", "soledad no deseada", "rechazo del consejo", "estancamiento"],
    significado:
      "El Ermitaño se aparta del ruido para encontrar su propia luz. Es tiempo de reflexionar, estudiar y escuchar lo que solo se oye en silencio. No es un abandono del mundo, sino una pausa necesaria para volver con respuestas más claras.",
    significadoInvertido:
      "Invertido, El Ermitaño indica un aislamiento que ya no nutre, sino que encierra. Tal vez rechazas la ayuda de los demás o te escondes por miedo. También puede señalar que el retiro ha durado demasiado y es hora de regresar.",
    amor: "Un periodo de reflexión personal antes de comprometerte; la soledad elegida aclara lo que sientes.",
    trabajo: "Tiempo de estudio, análisis y planificación; mejor trabajar en solitario que en grandes equipos.",
  },
  {
    id: "la-rueda-de-la-fortuna",
    nombre: "La Rueda de la Fortuna",
    arcano: "mayor",
    numero: 10,
    elemento: "espiritu",
    palabrasClave: ["cambio", "ciclos", "destino", "suerte", "giro inesperado"],
    palabrasClaveInvertida: ["mala racha", "resistencia al cambio", "ciclos repetidos", "estancamiento"],
    significado:
      "La Rueda de la Fortuna gira y con ella cambia tu situación, a menudo de forma repentina. Representa los ciclos de la vida y esa cuota de azar que nadie controla. Cuando aparece, algo se mueve a tu favor: aprovecha la oportunidad antes de que el giro continúe.",
    significadoInvertido:
      "Invertida, La Rueda muestra un momento de suerte esquiva o de patrones que se repiten sin aprendizaje. Resistirte al cambio solo prolonga el malestar. Acepta que la rueda seguirá girando y prepárate para su próximo movimiento.",
    amor: "Un cambio de rumbo en el corazón; encuentros que parecen escritos por el destino.",
    trabajo: "Oportunidades inesperadas y golpes de suerte; sé flexible para aprovechar lo que llega.",
  },
  {
    id: "la-justicia",
    nombre: "La Justicia",
    arcano: "mayor",
    numero: 11,
    elemento: "espiritu",
    palabrasClave: ["equilibrio", "verdad", "responsabilidad", "causa y efecto", "claridad"],
    palabrasClaveInvertida: ["injusticia", "deshonestidad", "evasión", "desequilibrio"],
    significado:
      "La Justicia pesa cada acto con la misma balanza. Anuncia que recibirás lo que corresponde a lo que has sembrado y te pide actuar con integridad y objetividad. Es favorable para asuntos legales, contratos y decisiones que exigen imparcialidad.",
    significadoInvertido:
      "Invertida, La Justicia revela una situación injusta o una verdad que se está ocultando. Tal vez evitas asumir las consecuencias de tus actos, o alguien te trata de forma desleal. La honestidad, aunque incómoda, será la salida.",
    amor: "Las relaciones necesitan equidad; se aclaran malentendidos y se asumen compromisos justos.",
    trabajo: "Contratos, acuerdos y trámites legales se resuelven a tu favor si actúas con transparencia.",
  },
  {
    id: "el-colgado",
    nombre: "El Colgado",
    arcano: "mayor",
    numero: 12,
    elemento: "espiritu",
    palabrasClave: ["pausa", "entrega", "nueva perspectiva", "sacrificio", "rendición"],
    palabrasClaveInvertida: ["resistencia", "estancamiento", "sacrificio inútil", "indecisión"],
    significado:
      "El Colgado cuelga de un pie con serenidad: ha aceptado la pausa y desde ahí ve el mundo al revés. Esta carta te invita a soltar el control, suspender la acción y contemplar la situación desde otro ángulo. Lo que parece sacrificio es, en realidad, una iluminación en proceso.",
    significadoInvertido:
      "Invertido, El Colgado indica que te resistes a una pausa necesaria o que llevas demasiado tiempo suspendido sin aprender nada. Puede que estés sacrificándote por algo que no lo merece. Es hora de decidir si bajas o si aceptas por fin la lección.",
    amor: "Un tiempo de espera y renuncia que puede transformar la relación; no fuerces respuestas.",
    trabajo: "Los proyectos se detienen temporalmente; aprovecha para replantear la estrategia con otra mirada.",
  },
  {
    id: "la-muerte",
    nombre: "La Muerte",
    arcano: "mayor",
    numero: 13,
    elemento: "espiritu",
    palabrasClave: ["transformación", "final", "renacimiento", "transición", "liberación"],
    palabrasClaveInvertida: ["resistencia al cambio", "estancamiento", "miedo", "finales prolongados"],
    significado:
      "La Muerte rara vez habla de la muerte física: anuncia el cierre definitivo de una etapa para que otra pueda nacer. Es una transformación profunda que despoja lo que ya no sirve. Aunque duela, lo que llega después es más auténtico y libre.",
    significadoInvertido:
      "Invertida, La Muerte muestra un final que se resiste a completarse. Te aferras a lo conocido por miedo a lo que viene y eso prolonga el dolor. Aceptar la pérdida es el primer paso para que el ciclo termine.",
    amor: "Una relación termina o cambia de forma radical; lo que sobrevive será más honesto.",
    trabajo: "Cierre de un empleo o proyecto que abre paso a una reinvención profesional.",
  },
  {
    id: "la-templanza",
    nombre: "La Templanza",
    arcano: "mayor",
    numero: 14,
    elemento: "espiritu",
    palabrasClave: ["equilibrio", "moderación", "paciencia", "armonía", "sanación"],
    palabrasClaveInvertida: ["exceso", "desequilibrio", "impaciencia", "conflicto interno"],
    significado:
      "La Templanza mezcla el agua de dos copas sin derramar una gota. Habla de moderación, de encontrar el punto medio y de sanar integrando lo que parecía opuesto. Es una carta de paciencia serena y de procesos que necesitan su propio tiempo.",
    significadoInvertido:
      "Invertida, La Templanza advierte sobre excesos o desequilibrios que dañan tu bienestar. Puede haber impaciencia, prisa por resultados o incoherencia entre lo que sientes y lo que haces. Recupera la medida y el ritmo natural.",
    amor: "La relación encuentra armonía a través del diálogo y la paciencia; se sanan heridas antiguas.",
    trabajo: "Trabaja con calma y colaboración; los acuerdos equilibrados rinden más que las imposiciones.",
  },
  {
    id: "el-diablo",
    nombre: "El Diablo",
    arcano: "mayor",
    numero: 15,
    elemento: "espiritu",
    palabrasClave: ["ataduras", "tentación", "materialismo", "sombra", "adicción"],
    palabrasClaveInvertida: ["liberación", "romper cadenas", "recuperar el poder", "conciencia"],
    significado:
      "El Diablo muestra cadenas que en realidad son flojas: la prisión es más mental que real. Habla de dependencias, deseos que gobiernan y de una relación con lo material o con alguien que te limita. Reconocer tu sombra es el primer paso para dejar de obedecerla.",
    significadoInvertido:
      "Invertido, El Diablo anuncia liberación. Empiezas a ver las cadenas y a soltarlas, ya sea un hábito, una relación tóxica o un miedo que te tenía atrapado. Recuperas el poder sobre tus decisiones.",
    amor: "Pasión intensa que puede volverse posesiva; revisa si el vínculo te libera o te encadena.",
    trabajo: "Cuidado con ambiciones que te esclavizan o con ambientes laborales manipuladores.",
  },
  {
    id: "la-torre",
    nombre: "La Torre",
    arcano: "mayor",
    numero: 16,
    elemento: "espiritu",
    palabrasClave: ["ruptura", "revelación", "caos", "cambio súbito", "despertar"],
    palabrasClaveInvertida: ["evitar el desastre", "miedo al cambio", "crisis contenida", "resistencia"],
    significado:
      "La Torre cae porque estaba construida sobre bases falsas. Anuncia una sacudida brusca que derriba lo que creías seguro, pero también una revelación que te libera de una ilusión. Después del derrumbe queda el terreno limpio para construir con verdad.",
    significadoInvertido:
      "Invertida, La Torre sugiere que la crisis se evita o se retrasa, aunque las grietas siguen ahí. Puede que te aferres a una estructura que ya no se sostiene por miedo al colapso. A veces es mejor derribar a conciencia que esperar el golpe.",
    amor: "Una verdad sale a la luz y cambia la relación de forma abrupta; lo falso no sobrevive.",
    trabajo: "Cambios repentinos, despidos o crisis que obligan a reinventarse; lo que cae no era sólido.",
  },
  {
    id: "la-estrella",
    nombre: "La Estrella",
    arcano: "mayor",
    numero: 17,
    elemento: "espiritu",
    palabrasClave: ["esperanza", "inspiración", "renovación", "fe", "serenidad"],
    palabrasClaveInvertida: ["desánimo", "falta de fe", "desconexión", "pesimismo"],
    significado:
      "La Estrella brilla después de la tormenta. Trae esperanza, inspiración y la sensación de estar en paz con el universo. Es un tiempo de sanación en el que puedes mostrarte vulnerable y confiar en que el futuro es benévolo.",
    significadoInvertido:
      "Invertida, La Estrella señala que has perdido la fe o la conexión con tus sueños. El desánimo nubla la visión y cuesta ver las oportunidades. Recupera aquello que te inspiraba antes de rendirte.",
    amor: "Renace la ilusión; una relación se sana o llega alguien que devuelve la confianza en el amor.",
    trabajo: "Reconocimiento e inspiración creativa; los proyectos a largo plazo reciben un impulso.",
  },
  {
    id: "la-luna",
    nombre: "La Luna",
    arcano: "mayor",
    numero: 18,
    elemento: "espiritu",
    palabrasClave: ["ilusión", "intuición", "miedo", "subconsciente", "incertidumbre"],
    palabrasClaveInvertida: ["claridad", "confusión que se disipa", "miedos superados", "verdad revelada"],
    significado:
      "La Luna ilumina un camino incierto donde nada es del todo lo que parece. Habla de miedos, sueños, engaños y de un subconsciente que pide ser escuchado. Avanza con cautela y confía en tu intuición más que en las apariencias.",
    significadoInvertido:
      "Invertida, La Luna anuncia que la niebla empieza a levantarse. Los engaños se descubren, los miedos pierden fuerza y recuperas la claridad. Es un buen momento para enfrentar lo que antes evitabas.",
    amor: "Confusión o secretos en la relación; no decidas hasta ver con claridad lo que hay detrás.",
    trabajo: "Falta de información o intenciones ocultas; verifica los detalles antes de comprometerte.",
  },
  {
    id: "el-sol",
    nombre: "El Sol",
    arcano: "mayor",
    numero: 19,
    elemento: "espiritu",
    palabrasClave: ["alegría", "éxito", "vitalidad", "claridad", "plenitud"],
    palabrasClaveInvertida: ["éxito retrasado", "optimismo excesivo", "falta de energía", "tristeza pasajera"],
    significado:
      "El Sol lo ilumina todo con calidez: es la carta de la alegría, la vitalidad y los logros que se celebran a plena luz. Anuncia claridad, buena salud y una etapa en la que puedes mostrarte tal como eres. Todo lo que emprendas ahora crece con facilidad.",
    significadoInvertido:
      "Invertido, El Sol sigue siendo positivo, aunque su brillo se atenúa. Puede haber retrasos en el éxito, cierto desánimo o una alegría fingida. Busca lo que te da energía real y deja de aparentar.",
    amor: "Felicidad compartida, relaciones luminosas y honestas; posibles noticias de nacimientos.",
    trabajo: "Éxito reconocido, logros visibles y proyectos que florecen; disfruta lo que has construido.",
  },
  {
    id: "el-juicio",
    nombre: "El Juicio",
    arcano: "mayor",
    numero: 20,
    elemento: "espiritu",
    palabrasClave: ["renacimiento", "llamado", "evaluación", "perdón", "despertar"],
    palabrasClaveInvertida: ["autocrítica", "negación", "juicio severo", "estancamiento"],
    significado:
      "El Juicio suena como una trompeta que despierta lo dormido. Es un llamado a evaluar tu camino con honestidad, a perdonar y a responder a una vocación más alta. Anuncia un renacimiento tras haber hecho las paces con el pasado.",
    significadoInvertido:
      "Invertido, El Juicio revela una autocrítica que paraliza o un rechazo a escuchar el llamado interior. Puede que te juzgues con dureza o que evites una decisión importante. Perdónate y responde a lo que la vida te pide.",
    amor: "Reconciliaciones y segundas oportunidades; el perdón renueva un vínculo.",
    trabajo: "Balance de trayectoria; un cambio de carrera o un proyecto vocacional llama a tu puerta.",
  },
  {
    id: "el-mundo",
    nombre: "El Mundo",
    arcano: "mayor",
    numero: 21,
    elemento: "espiritu",
    palabrasClave: ["culminación", "logro", "integración", "viaje", "plenitud"],
    palabrasClaveInvertida: ["incompleto", "retrasos", "falta de cierre", "atajos"],
    significado:
      "El Mundo cierra el ciclo que abrió El Loco: la danza está completa. Representa la realización de una meta, la integración de todo lo aprendido y la sensación de pertenecer al todo. Es una carta de celebración y de puertas que se abren al mundo entero.",
    significadoInvertido:
      "Invertido, El Mundo muestra un ciclo que no termina de cerrarse. Falta un último paso, una conversación pendiente o el reconocimiento de lo logrado. Termina lo que empezaste antes de buscar algo nuevo.",
    amor: "Una relación alcanza plenitud y compromiso; posibles viajes o mudanzas en pareja.",
    trabajo: "Culminación exitosa de un proyecto, reconocimiento y oportunidades internacionales.",
  },

  // ───────────────────────── BASTOS (FUEGO) ─────────────────────────
  {
    id: "as-de-bastos",
    nombre: "As de Bastos",
    arcano: "menor",
    numero: 1,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["inspiración", "chispa", "potencial", "impulso creativo"],
    palabrasClaveInvertida: ["retraso", "falta de motivación", "idea bloqueada", "energía dispersa"],
    significado:
      "El As de Bastos es la chispa que enciende un fuego nuevo. Trae una idea, una pasión o una oportunidad que te llena de energía y ganas de actuar. Es el momento de decir sí y dar el primer paso con entusiasmo.",
    significadoInvertido:
      "Invertido, el As de Bastos indica que la inspiración se apagó antes de convertirse en acción. Puede haber retrasos, falta de dirección o una idea que no logra materializarse. Recupera la motivación antes de forzar el comienzo.",
    amor: "Una atracción nueva y ardiente o un renacer de la pasión en la pareja.",
    trabajo: "Nace un proyecto o llega una propuesta que despierta tu creatividad; actúa con rapidez.",
  },
  {
    id: "dos-de-bastos",
    nombre: "Dos de Bastos",
    arcano: "menor",
    numero: 2,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["planificación", "visión", "decisión", "expansión"],
    palabrasClaveInvertida: ["miedo a lo desconocido", "falta de planificación", "indecisión", "quedarse pequeño"],
    significado:
      "El Dos de Bastos contempla el mundo desde una altura y planea hacia dónde ir. Tienes el poder en tus manos y ahora debes elegir el rumbo de tu expansión. Es una carta de visión estratégica y de decisiones a futuro.",
    significadoInvertido:
      "Invertido, el Dos de Bastos muestra que el miedo a salir de lo conocido te mantiene en el mismo lugar. Puede faltar planificación o sobrar dudas. Decide aunque no tengas todas las certezas.",
    amor: "Planes en común que amplían horizontes; una relación a distancia puede consolidarse.",
    trabajo: "Momento de diseñar estrategias, evaluar alianzas y pensar en crecer más allá del entorno actual.",
  },
  {
    id: "tres-de-bastos",
    nombre: "Tres de Bastos",
    arcano: "menor",
    numero: 3,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["expansión", "previsión", "comercio", "progreso"],
    palabrasClaveInvertida: ["obstáculos", "retrasos", "falta de previsión", "planes frustrados"],
    significado:
      "El Tres de Bastos observa cómo sus barcos parten hacia el horizonte: los planes ya están en marcha y los primeros resultados se acercan. Habla de expansión, comercio y de la confianza que da ver que el esfuerzo empieza a rendir.",
    significadoInvertido:
      "Invertido, el Tres de Bastos indica retrasos o proyectos que no despegan como se esperaba. Puede haber falta de previsión o barcos que no vuelven. Revisa los detalles antes de invertir más energía.",
    amor: "Una relación crece con proyectos compartidos; posibles viajes juntos.",
    trabajo: "Negocios en expansión, oportunidades en el extranjero y colaboraciones que dan fruto.",
  },
  {
    id: "cuatro-de-bastos",
    nombre: "Cuatro de Bastos",
    arcano: "menor",
    numero: 4,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["celebración", "hogar", "estabilidad", "comunidad"],
    palabrasClaveInvertida: ["inestabilidad", "conflictos familiares", "celebración pospuesta", "falta de apoyo"],
    significado:
      "El Cuatro de Bastos celebra bajo guirnaldas de flores: es la carta de las fiestas, las bodas, las mudanzas felices y el sentido de pertenencia. Anuncia un momento de estabilidad y armonía que merece ser compartido con los tuyos.",
    significadoInvertido:
      "Invertido, el Cuatro de Bastos indica tensiones en el hogar o una celebración que se retrasa. Puede que sientas que no encajas donde estás o que falta apoyo. Busca el lugar donde puedas echar raíces de verdad.",
    amor: "Compromiso, boda o convivencia; la relación entra en una etapa de estabilidad alegre.",
    trabajo: "Logro de una meta que se celebra en equipo; buen ambiente laboral y reconocimiento.",
  },
  {
    id: "cinco-de-bastos",
    nombre: "Cinco de Bastos",
    arcano: "menor",
    numero: 5,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["competencia", "conflicto", "rivalidad", "desacuerdo"],
    palabrasClaveInvertida: ["evitar el conflicto", "acuerdo", "tensión interna", "resolución"],
    significado:
      "El Cinco de Bastos muestra a cinco jóvenes chocando sus varas sin llegar a herirse. Habla de competencia, desacuerdos y del choque de egos que aparece cuando todos quieren imponer su idea. El conflicto puede ser productivo si se transforma en diálogo.",
    significadoInvertido:
      "Invertido, el Cinco de Bastos señala que el conflicto se evita o se resuelve, aunque también puede indicar una lucha interna que no expresas. Buscar la paz a toda costa a veces silencia lo que necesita decirse.",
    amor: "Discusiones frecuentes o rivalidades; es necesario aprender a competir menos y escuchar más.",
    trabajo: "Competencia en el entorno laboral, debates de equipo y necesidad de defender tus ideas.",
  },
  {
    id: "seis-de-bastos",
    nombre: "Seis de Bastos",
    arcano: "menor",
    numero: 6,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["victoria", "reconocimiento", "éxito público", "confianza"],
    palabrasClaveInvertida: ["ego", "caída", "falta de reconocimiento", "éxito vacío"],
    significado:
      "El Seis de Bastos cabalga coronado de laureles entre quienes celebran su triunfo. Anuncia reconocimiento público, una victoria merecida y el orgullo sano de haber alcanzado la meta. Disfruta el aplauso y compártelo con quienes te apoyaron.",
    significadoInvertido:
      "Invertido, el Seis de Bastos advierte de un éxito que no llega o que llega sin satisfacción. Puede haber arrogancia, expectativas desmedidas o el sentimiento de que nadie valora tu esfuerzo. Recuerda que la validación empieza por dentro.",
    amor: "Orgullo de la pareja, momentos en los que se muestran juntos y se celebran mutuamente.",
    trabajo: "Ascensos, premios y reconocimiento del liderazgo; tu trabajo se hace visible.",
  },
  {
    id: "siete-de-bastos",
    nombre: "Siete de Bastos",
    arcano: "menor",
    numero: 7,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["defensa", "perseverancia", "valentía", "posición firme"],
    palabrasClaveInvertida: ["agotamiento", "rendirse", "sentirse abrumado", "ceder terreno"],
    significado:
      "El Siete de Bastos defiende su posición en lo alto contra quienes intentan derribarlo. Habla de mantenerte firme en tus convicciones cuando la presión aumenta. Tienes la ventaja de la altura: no la cedas por cansancio.",
    significadoInvertido:
      "Invertido, el Siete de Bastos revela agotamiento ante tantas batallas o la tentación de ceder. Tal vez estés defendiendo algo que ya no vale la pena o te sientes superado. Elige con cuidado qué luchas merecen tu energía.",
    amor: "Debes defender tu relación o tus límites frente a presiones externas o críticas.",
    trabajo: "Competencia intensa; sostén tu posición y tus ideas con argumentos firmes.",
  },
  {
    id: "ocho-de-bastos",
    nombre: "Ocho de Bastos",
    arcano: "menor",
    numero: 8,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["velocidad", "noticias", "movimiento", "acción rápida"],
    palabrasClaveInvertida: ["retrasos", "frustración", "precipitación", "mensajes confusos"],
    significado:
      "El Ocho de Bastos vuela por el aire: todo se acelera. Llegan noticias, mensajes y respuestas que estaban pendientes, y los acontecimientos se suceden con rapidez. Es momento de actuar sin demora y dejarse llevar por el impulso.",
    significadoInvertido:
      "Invertido, el Ocho de Bastos muestra retrasos, comunicaciones que no llegan o una prisa que lleva a errores. Puede sentirse frustración por la lentitud o, al contrario, caos por ir demasiado rápido. Ajusta el ritmo.",
    amor: "Declaraciones repentinas, mensajes esperados y relaciones que avanzan a gran velocidad.",
    trabajo: "Respuestas rápidas, viajes de trabajo y proyectos que avanzan a toda marcha.",
  },
  {
    id: "nueve-de-bastos",
    nombre: "Nueve de Bastos",
    arcano: "menor",
    numero: 9,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["resiliencia", "última prueba", "vigilancia", "persistencia"],
    palabrasClaveInvertida: ["paranoia", "agotamiento", "rendición", "defensas excesivas"],
    significado:
      "El Nueve de Bastos está herido pero de pie, custodiando lo que ha ganado. Habla de la última prueba antes de la meta y de la fortaleza que nace de haber sobrevivido a otras batallas. Estás más cerca de lo que crees: no bajes la guardia todavía.",
    significadoInvertido:
      "Invertido, el Nueve de Bastos advierte que la desconfianza se ha vuelto una muralla. El cansancio o los miedos del pasado te impiden abrirte. Deja de esperar el golpe y date permiso para descansar.",
    amor: "Heridas antiguas dificultan confiar; la relación necesita paciencia y tiempo para sanar.",
    trabajo: "Resistencia ante la presión final de un proyecto; perseverar es clave para culminar.",
  },
  {
    id: "diez-de-bastos",
    nombre: "Diez de Bastos",
    arcano: "menor",
    numero: 10,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["carga", "responsabilidad", "sobreesfuerzo", "agobio"],
    palabrasClaveInvertida: ["liberación", "delegar", "soltar peso", "colapso"],
    significado:
      "El Diez de Bastos carga con todos los bastos a la vez y casi no ve el camino. Habla de responsabilidades acumuladas, de un éxito que se convirtió en peso y de la dificultad para pedir ayuda. La meta está cerca, pero no tienes que llegar aplastado.",
    significadoInvertido:
      "Invertido, el Diez de Bastos indica que empiezas a soltar cargas o que el peso se vuelve insostenible. Delegar, decir no y priorizar serán actos de supervivencia. Si no sueltas por voluntad, el cuerpo lo hará por ti.",
    amor: "Una relación en la que cargas con todo; hace falta repartir responsabilidades.",
    trabajo: "Exceso de trabajo y estrés; aprende a delegar antes de que el agotamiento te detenga.",
  },
  {
    id: "sota-de-bastos",
    nombre: "Sota de Bastos",
    arcano: "menor",
    numero: 11,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["entusiasmo", "exploración", "mensaje", "curiosidad"],
    palabrasClaveInvertida: ["inmadurez", "impaciencia", "falta de dirección", "malas noticias"],
    significado:
      "La Sota de Bastos es un mensajero lleno de entusiasmo que trae noticias emocionantes o una idea que arde de ganas de probarse. Representa la curiosidad juvenil y el deseo de explorar sin miedo. Anímate a aprender algo nuevo con ligereza.",
    significadoInvertido:
      "Invertida, la Sota de Bastos muestra impaciencia, ideas que no se concretan o una energía que se dispersa. Puede tratarse de alguien inmaduro o de una noticia decepcionante. Canaliza la chispa antes de que se consuma sola.",
    amor: "Coqueteos, mensajes apasionados y el inicio de una relación juguetona y divertida.",
    trabajo: "Noticias sobre un proyecto nuevo o una propuesta que despierta tu creatividad.",
  },
  {
    id: "caballero-de-bastos",
    nombre: "Caballero de Bastos",
    arcano: "menor",
    numero: 12,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["acción", "aventura", "pasión", "impulsividad"],
    palabrasClaveInvertida: ["temeridad", "frustración", "proyectos abandonados", "arrogancia"],
    significado:
      "El Caballero de Bastos galopa a toda velocidad hacia la aventura. Es la carta de la acción decidida, la pasión y los viajes que cambian el rumbo. Su energía es contagiosa, aunque a veces se lanza antes de pensar.",
    significadoInvertido:
      "Invertido, el Caballero de Bastos se vuelve temerario o pierde fuerza a mitad del camino. Puede haber proyectos abandonados, arrebatos de ira o promesas que se olvidan. Dirige el fuego hacia algo que puedas sostener.",
    amor: "Una pasión arrolladora o alguien encantador que quizá no busque permanecer.",
    trabajo: "Cambios rápidos, mudanzas laborales y decisiones audaces; cuidado con la precipitación.",
  },
  {
    id: "reina-de-bastos",
    nombre: "Reina de Bastos",
    arcano: "menor",
    numero: 13,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["confianza", "carisma", "independencia", "calidez"],
    palabrasClaveInvertida: ["celos", "exigencia", "inseguridad", "temperamento"],
    significado:
      "La Reina de Bastos brilla con carisma y seguridad en sí misma. Es generosa, apasionada e independiente, y sabe inspirar a los demás sin perder su propio centro. Te invita a ocupar tu lugar con orgullo y calidez.",
    significadoInvertido:
      "Invertida, la Reina de Bastos revela inseguridad disfrazada de arrogancia, celos o un carácter que se impone demasiado. Puede que exijas a otros lo que no te das a ti misma. Recupera la confianza que no depende de nadie.",
    amor: "Una relación vibrante y apasionada; alguien magnético y seguro entra o se afirma en tu vida.",
    trabajo: "Liderazgo natural y capacidad de motivar equipos; los negocios propios prosperan.",
  },
  {
    id: "rey-de-bastos",
    nombre: "Rey de Bastos",
    arcano: "menor",
    numero: 14,
    palo: "bastos",
    elemento: "fuego",
    palabrasClave: ["liderazgo", "visión", "emprendimiento", "honor"],
    palabrasClaveInvertida: ["autoritarismo", "impulsividad", "expectativas irreales", "arrogancia"],
    significado:
      "El Rey de Bastos gobierna con visión y con la autoridad natural de quien cree en lo que hace. Es un líder inspirador, emprendedor y valiente, que impulsa a otros a crecer. Representa la madurez del fuego: pasión con propósito.",
    significadoInvertido:
      "Invertido, el Rey de Bastos se vuelve dominante, impulsivo o incapaz de escuchar. Puede prometer más de lo que puede cumplir o exigir resultados imposibles. La visión sin humildad termina quemando a quienes lo rodean.",
    amor: "Una pareja protectora y apasionada; la relación necesita respeto mutuo por la independencia.",
    trabajo: "Éxito empresarial, roles de dirección y la capacidad de convertir una visión en empresa.",
  },

  // ───────────────────────── COPAS (AGUA) ─────────────────────────
  {
    id: "as-de-copas",
    nombre: "As de Copas",
    arcano: "menor",
    numero: 1,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["amor nuevo", "compasión", "apertura emocional", "alegría"],
    palabrasClaveInvertida: ["represión emocional", "vacío", "amor no correspondido", "bloqueo"],
    significado:
      "El As de Copas desborda agua cristalina: el corazón se abre y el amor fluye sin condiciones. Anuncia el inicio de una relación, el nacimiento de un sentimiento profundo o una etapa de plenitud emocional. Recibe lo que llega con gratitud.",
    significadoInvertido:
      "Invertido, el As de Copas señala emociones contenidas o una copa que se vació. Puede que te cueste dar o recibir afecto, o que un amor no encuentre correspondencia. Vuelve a llenar tu propia copa antes de ofrecerla.",
    amor: "Un nuevo amor o una renovación profunda del afecto; el corazón está listo para abrirse.",
    trabajo: "Satisfacción emocional en lo que haces y relaciones laborales armoniosas.",
  },
  {
    id: "dos-de-copas",
    nombre: "Dos de Copas",
    arcano: "menor",
    numero: 2,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["unión", "asociación", "atracción mutua", "armonía"],
    palabrasClaveInvertida: ["desequilibrio", "ruptura", "desconfianza", "relación desigual"],
    significado:
      "El Dos de Copas muestra a dos personas que intercambian sus copas en un gesto de igualdad y respeto. Es la carta de la pareja, de la amistad verdadera y de las alianzas donde ambos dan y reciben. Habla de una conexión que se siente como en casa.",
    significadoInvertido:
      "Invertido, el Dos de Copas indica que la balanza afectiva se ha desnivelado. Puede haber malentendidos, desconfianza o una relación en la que uno da mucho más que el otro. Restaurar el diálogo es esencial.",
    amor: "Amor correspondido, compromiso y complicidad; una relación equilibrada y sincera.",
    trabajo: "Sociedades exitosas, buenos acuerdos y colaboraciones basadas en la confianza mutua.",
  },
  {
    id: "tres-de-copas",
    nombre: "Tres de Copas",
    arcano: "menor",
    numero: 3,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["celebración", "amistad", "comunidad", "alegría compartida"],
    palabrasClaveInvertida: ["excesos", "aislamiento", "chismes", "amistad falsa"],
    significado:
      "El Tres de Copas brinda entre amigas que celebran la vida. Habla de reuniones, festejos y del apoyo de una comunidad que te sostiene. Es una invitación a compartir la alegría y a reconocer que no caminas solo.",
    significadoInvertido:
      "Invertido, el Tres de Copas advierte sobre excesos, chismes o amistades que no son lo que parecen. También puede reflejar aislamiento o la sensación de estar fuera del grupo. Elige con cuidado con quién celebras.",
    amor: "Etapa social y alegre; cuidado con terceras personas que interfieren en la pareja.",
    trabajo: "Trabajo en equipo exitoso, celebraciones por logros y contactos que abren puertas.",
  },
  {
    id: "cuatro-de-copas",
    nombre: "Cuatro de Copas",
    arcano: "menor",
    numero: 4,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["apatía", "contemplación", "insatisfacción", "oportunidad ignorada"],
    palabrasClaveInvertida: ["nuevo interés", "salir del estancamiento", "aceptación", "motivación"],
    significado:
      "El Cuatro de Copas mira con desgana las copas que tiene delante y no ve la que le ofrecen. Habla de apatía, aburrimiento y de una insatisfacción que impide reconocer las oportunidades. Levanta la vista: hay algo bueno que estás pasando por alto.",
    significadoInvertido:
      "Invertido, el Cuatro de Copas anuncia que sales del letargo. Vuelve el interés, aceptas lo que se te ofrece y recuperas la capacidad de ilusionarte. El estancamiento termina cuando decides participar de nuevo.",
    amor: "Desinterés o rutina en la pareja; alguien ofrece cariño y no lo estás viendo.",
    trabajo: "Falta de motivación en el empleo actual; hay una oportunidad que ignoras por desánimo.",
  },
  {
    id: "cinco-de-copas",
    nombre: "Cinco de Copas",
    arcano: "menor",
    numero: 5,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["pérdida", "duelo", "arrepentimiento", "tristeza"],
    palabrasClaveInvertida: ["aceptación", "perdón", "seguir adelante", "recuperación"],
    significado:
      "El Cinco de Copas llora las tres copas derramadas sin ver las dos que siguen en pie. Habla de pérdida, duelo y de la mirada fija en lo que salió mal. El dolor es legítimo, pero detrás de ti quedan cosas que aún vale la pena conservar.",
    significadoInvertido:
      "Invertido, el Cinco de Copas anuncia el fin del luto. Aceptas lo que no puede cambiarse, perdonas y te giras hacia lo que queda. La tristeza da paso a la recuperación y a la esperanza.",
    amor: "Una decepción o ruptura que duele; el proceso de duelo necesita ser vivido para sanar.",
    trabajo: "Pérdidas o fracasos que desalientan; rescata lo aprendido y no descartes lo que todavía funciona.",
  },
  {
    id: "seis-de-copas",
    nombre: "Seis de Copas",
    arcano: "menor",
    numero: 6,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["nostalgia", "infancia", "inocencia", "recuerdos"],
    palabrasClaveInvertida: ["vivir en el pasado", "inmadurez", "idealización", "dejar atrás"],
    significado:
      "El Seis de Copas ofrece una flor con la ternura de la infancia. Habla de recuerdos dulces, de reencuentros con personas del pasado y de la inocencia que aún conservas. Es una carta de generosidad sencilla y de regresar a lo esencial.",
    significadoInvertido:
      "Invertido, el Seis de Copas indica que la nostalgia se convirtió en refugio. Idealizar lo que fue impide construir lo que puede ser. Honra el pasado, pero deja de vivir en él.",
    amor: "Regresa un amor del pasado o la relación recupera su frescura inicial.",
    trabajo: "Contactos antiguos que reaparecen; la experiencia acumulada abre nuevas puertas.",
  },
  {
    id: "siete-de-copas",
    nombre: "Siete de Copas",
    arcano: "menor",
    numero: 7,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["ilusiones", "opciones", "fantasía", "confusión"],
    palabrasClaveInvertida: ["claridad", "decisión", "realismo", "enfoque"],
    significado:
      "El Siete de Copas ofrece siete copas flotando entre nubes, cada una con una promesa distinta. Habla de demasiadas opciones, de deseos que aún no se distinguen de espejismos. Antes de elegir, distingue lo que es real de lo que solo brilla.",
    significadoInvertido:
      "Invertido, el Siete de Copas trae claridad. Las fantasías se disipan, tomas una decisión concreta y vuelves a pisar tierra firme. El enfoque reemplaza a la dispersión.",
    amor: "Idealizas a alguien o no logras elegir; mira más allá de la fantasía.",
    trabajo: "Muchas ideas y pocos resultados; elige un proyecto y comprométete con él.",
  },
  {
    id: "ocho-de-copas",
    nombre: "Ocho de Copas",
    arcano: "menor",
    numero: 8,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["alejamiento", "búsqueda", "abandono voluntario", "desapego"],
    palabrasClaveInvertida: ["miedo a partir", "aferrarse", "regreso", "evitar el cambio"],
    significado:
      "El Ocho de Copas se aleja bajo la luna dejando atrás ocho copas ordenadas. Habla de abandonar algo que funcionaba pero ya no llena, en busca de un sentido más profundo. Es una partida triste y valiente a la vez.",
    significadoInvertido:
      "Invertido, el Ocho de Copas revela miedo a marcharse o una vuelta a lo que dejaste. Puede que te aferres por comodidad a algo que ya no te nutre. Pregúntate si quedarte es una elección o una evasión.",
    amor: "Alejarte de una relación que no satisface, aunque no haya conflictos aparentes.",
    trabajo: "Renunciar a un empleo estable para buscar algo con más significado.",
  },
  {
    id: "nueve-de-copas",
    nombre: "Nueve de Copas",
    arcano: "menor",
    numero: 9,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["satisfacción", "deseo cumplido", "gratitud", "bienestar"],
    palabrasClaveInvertida: ["complacencia", "vanidad", "deseos superficiales", "insatisfacción"],
    significado:
      "El Nueve de Copas es la carta del deseo cumplido: sonríe con los brazos cruzados frente a sus nueve copas. Anuncia satisfacción, placer y la gratitud de tener lo que se soñaba. Disfruta este momento sin culpa.",
    significadoInvertido:
      "Invertido, el Nueve de Copas advierte que lo obtenido no llena o que la satisfacción se volvió complacencia. Puede haber excesos o deseos que al cumplirse resultan vacíos. Revisa qué es lo que de verdad quieres.",
    amor: "Felicidad y plenitud en la relación; un deseo del corazón se hace realidad.",
    trabajo: "Logros que traen bienestar económico y orgullo por lo alcanzado.",
  },
  {
    id: "diez-de-copas",
    nombre: "Diez de Copas",
    arcano: "menor",
    numero: 10,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["armonía familiar", "felicidad", "plenitud emocional", "hogar"],
    palabrasClaveInvertida: ["conflictos familiares", "hogar roto", "valores desalineados", "apariencias"],
    significado:
      "El Diez de Copas dibuja un arcoíris sobre una familia feliz. Es la carta de la armonía duradera, del amor que se convierte en hogar y de la plenitud emocional compartida. Anuncia paz y alegría en los vínculos más cercanos.",
    significadoInvertido:
      "Invertido, el Diez de Copas revela grietas en la armonía familiar o una felicidad que solo existe en apariencia. Puede haber valores en conflicto o expectativas que no coinciden. Habla con sinceridad para reconstruir el vínculo.",
    amor: "Amor pleno y compromiso a largo plazo; formación de una familia o unión de hogares.",
    trabajo: "Equilibrio entre trabajo y vida personal; un ambiente laboral que se siente como familia.",
  },
  {
    id: "sota-de-copas",
    nombre: "Sota de Copas",
    arcano: "menor",
    numero: 11,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["mensaje emocional", "sensibilidad", "creatividad", "intuición"],
    palabrasClaveInvertida: ["inmadurez emocional", "bloqueo creativo", "decepción", "escapismo"],
    significado:
      "La Sota de Copas sostiene una copa de la que asoma un pez: la sorpresa de lo que el corazón revela. Trae mensajes de amor, ideas creativas e invitaciones a escuchar la intuición. Es una carta de sensibilidad joven y sin defensas.",
    significadoInvertido:
      "Invertida, la Sota de Copas muestra emociones que se desbordan o se esconden, fantasías que reemplazan la realidad o noticias sentimentales decepcionantes. Cuida tu sensibilidad sin evadirte.",
    amor: "Una declaración de amor, un mensaje tierno o el inicio de un romance dulce.",
    trabajo: "Propuestas creativas y colaboraciones donde la intuición marca la diferencia.",
  },
  {
    id: "caballero-de-copas",
    nombre: "Caballero de Copas",
    arcano: "menor",
    numero: 12,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["romance", "propuesta", "idealismo", "encanto"],
    palabrasClaveInvertida: ["manipulación emocional", "promesas vacías", "decepción", "melancolía"],
    significado:
      "El Caballero de Copas avanza con calma ofreciendo su copa: es el romántico que llega con una propuesta sincera. Habla de invitaciones, declaraciones y de la búsqueda de la belleza en las relaciones. Deja que el corazón guíe sin perder los pies en la tierra.",
    significadoInvertido:
      "Invertido, el Caballero de Copas revela a alguien que seduce con promesas que no cumple o un idealismo que se estrella con la realidad. También puede señalar melancolía y dependencia afectiva. Mira los hechos, no solo las palabras.",
    amor: "Un pretendiente encantador o una propuesta romántica; el amor se expresa con gestos.",
    trabajo: "Ofertas atractivas que deben evaluarse con realismo; el arte y la diplomacia rinden frutos.",
  },
  {
    id: "reina-de-copas",
    nombre: "Reina de Copas",
    arcano: "menor",
    numero: 13,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["compasión", "intuición", "cuidado", "madurez emocional"],
    palabrasClaveInvertida: ["dependencia emocional", "inseguridad", "manipulación", "exceso de sensibilidad"],
    significado:
      "La Reina de Copas contempla su copa cerrada con serenidad: conoce las profundidades del sentir sin ahogarse en ellas. Representa la compasión, la escucha y la intuición madura. Te invita a cuidar a los demás desde la calma y a confiar en lo que percibes.",
    significadoInvertido:
      "Invertida, la Reina de Copas se pierde en sus emociones o las usa para controlar. Puede haber inseguridad, dependencia o una sensibilidad que hiere en lugar de sanar. Pon límites a tu entrega.",
    amor: "Una relación amorosa y empática; alguien intuitivo y cariñoso te sostiene.",
    trabajo: "Éxito en profesiones de cuidado, arte o consejería; tu empatía es tu mayor recurso.",
  },
  {
    id: "rey-de-copas",
    nombre: "Rey de Copas",
    arcano: "menor",
    numero: 14,
    palo: "copas",
    elemento: "agua",
    palabrasClave: ["equilibrio emocional", "diplomacia", "generosidad", "sabiduría"],
    palabrasClaveInvertida: ["frialdad", "manipulación", "inestabilidad emocional", "represión"],
    significado:
      "El Rey de Copas gobierna sentado en medio del mar sin que las olas lo perturben. Es la madurez emocional en su máxima expresión: siente con hondura y actúa con equilibrio. Representa a un consejero sabio, tolerante y generoso.",
    significadoInvertido:
      "Invertido, el Rey de Copas esconde sus sentimientos tras una fachada o los usa como arma. Puede haber frialdad, cambios de humor o manipulación sutil. La sabiduría emocional exige honestidad con uno mismo.",
    amor: "Una pareja estable, comprensiva y leal; el amor se vive con madurez y respeto.",
    trabajo: "Liderazgo empático, mediación de conflictos y éxito en entornos que requieren tacto.",
  },

  // ───────────────────────── ESPADAS (AIRE) ─────────────────────────
  {
    id: "as-de-espadas",
    nombre: "As de Espadas",
    arcano: "menor",
    numero: 1,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["claridad", "verdad", "avance mental", "decisión"],
    palabrasClaveInvertida: ["confusión", "ideas destructivas", "falta de claridad", "verdad distorsionada"],
    significado:
      "El As de Espadas corta la niebla con un solo golpe. Trae claridad mental, una verdad que se impone y la fuerza para tomar una decisión sin rodeos. Es el inicio de una idea poderosa o de una etapa de pensamiento lúcido.",
    significadoInvertido:
      "Invertido, el As de Espadas muestra una mente nublada o una fuerza intelectual mal empleada. Puede haber conflictos por palabras hirientes o una verdad que se retuerce. Afila tu criterio antes de actuar.",
    amor: "Conversaciones honestas que aclaran la relación; la verdad se dice aunque incomode.",
    trabajo: "Decisiones acertadas, ideas innovadoras y contratos que se firman con claridad.",
  },
  {
    id: "dos-de-espadas",
    nombre: "Dos de Espadas",
    arcano: "menor",
    numero: 2,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["indecisión", "bloqueo", "equilibrio tenso", "evasión"],
    palabrasClaveInvertida: ["decisión tomada", "confusión", "información revelada", "desbloqueo"],
    significado:
      "El Dos de Espadas está con los ojos vendados y dos espadas cruzadas sobre el pecho: una tregua frágil con uno mismo. Habla de una decisión que se posterga por miedo a mirar. El equilibrio aparente cuesta mucha energía.",
    significadoInvertido:
      "Invertido, el Dos de Espadas indica que la venda cae: la información llega y la decisión se vuelve inevitable. Puede haber confusión inicial, pero el bloqueo se rompe y por fin te mueves.",
    amor: "Evitas enfrentar un tema con tu pareja; el silencio no resuelve lo que hay que hablar.",
    trabajo: "Una decisión laboral pendiente; reúne información y deja de aplazar.",
  },
  {
    id: "tres-de-espadas",
    nombre: "Tres de Espadas",
    arcano: "menor",
    numero: 3,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["dolor", "ruptura", "traición", "desamor"],
    palabrasClaveInvertida: ["sanación", "perdón", "liberar el dolor", "recuperación"],
    significado:
      "El Tres de Espadas muestra un corazón atravesado bajo la lluvia. Es la carta del desamor, la traición o la palabra que hiere. El dolor es real y necesita ser sentido, pero también anuncia que la tormenta pasará.",
    significadoInvertido:
      "Invertido, el Tres de Espadas indica que la herida empieza a cerrar. Perdonas, sueltas el rencor y recuperas la capacidad de confiar. La lluvia ha limpiado lo que dolía.",
    amor: "Una ruptura, infidelidad o desilusión amorosa que rompe el corazón.",
    trabajo: "Decepciones con colegas, traiciones en el equipo o noticias laborales dolorosas.",
  },
  {
    id: "cuatro-de-espadas",
    nombre: "Cuatro de Espadas",
    arcano: "menor",
    numero: 4,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["descanso", "recuperación", "retiro", "meditación"],
    palabrasClaveInvertida: ["agotamiento", "inquietud", "falta de descanso", "reactivación"],
    significado:
      "El Cuatro de Espadas descansa en la quietud de un templo. Habla de la necesidad de pausar, recuperarse después de una batalla y reorganizar la mente en silencio. No es huir, es recargar fuerzas.",
    significadoInvertido:
      "Invertido, el Cuatro de Espadas indica que no te permites descansar o que el reposo se prolongó demasiado y ahora hay que volver a la acción. Escucha a tu cuerpo: sabe cuándo parar y cuándo levantarse.",
    amor: "Un tiempo de distancia tranquila para reflexionar; la relación necesita calma.",
    trabajo: "Vacaciones, baja por salud o una pausa estratégica antes de retomar los proyectos.",
  },
  {
    id: "cinco-de-espadas",
    nombre: "Cinco de Espadas",
    arcano: "menor",
    numero: 5,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["conflicto", "derrota", "victoria vacía", "deshonor"],
    palabrasClaveInvertida: ["reconciliación", "soltar el conflicto", "arrepentimiento", "lecciones"],
    significado:
      "El Cinco de Espadas recoge las espadas de los vencidos con una sonrisa turbia: ganó, pero a qué precio. Habla de conflictos donde todos pierden algo, de orgullo herido y de victorias que dejan soledad. Pregúntate si vale la pena tener razón.",
    significadoInvertido:
      "Invertido, el Cinco de Espadas abre la puerta a la reconciliación. Reconoces el daño, sueltas la necesidad de vencer y buscas reparar. Las lecciones del conflicto sirven para no repetirlo.",
    amor: "Discusiones donde se hiere para ganar; el ego está dañando la relación.",
    trabajo: "Competencia desleal, conflictos de poder o una victoria que cuesta la confianza del equipo.",
  },
  {
    id: "seis-de-espadas",
    nombre: "Seis de Espadas",
    arcano: "menor",
    numero: 6,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["transición", "viaje", "dejar atrás", "alivio gradual"],
    palabrasClaveInvertida: ["resistencia", "equipaje emocional", "viaje cancelado", "estancamiento"],
    significado:
      "El Seis de Espadas cruza las aguas hacia una orilla más tranquila. Habla de transiciones necesarias, de alejarse de lo turbulento y de un alivio que llega poco a poco. Aunque el viaje sea melancólico, la dirección es correcta.",
    significadoInvertido:
      "Invertido, el Seis de Espadas indica que llevas contigo el peso que querías dejar atrás, o que te resistes a partir. También puede señalar viajes que se cancelan. No se puede llegar a una nueva orilla sin soltar la anterior.",
    amor: "Superar una etapa difícil en pareja o alejarse de un vínculo doloroso con serenidad.",
    trabajo: "Cambio de empleo, traslado o mudanza que trae calma después del estrés.",
  },
  {
    id: "siete-de-espadas",
    nombre: "Siete de Espadas",
    arcano: "menor",
    numero: 7,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["engaño", "estrategia", "sigilo", "evasión"],
    palabrasClaveInvertida: ["confesión", "conciencia", "engaño descubierto", "honestidad"],
    significado:
      "El Siete de Espadas se escapa de puntillas cargando espadas ajenas. Habla de engaños, atajos y de actuar a escondidas, ya sea por astucia o por miedo a enfrentar las cosas. Revisa si estás siendo estratégico o simplemente deshonesto.",
    significadoInvertido:
      "Invertido, el Siete de Espadas señala que la verdad sale a la luz o que decides confesar. Puede haber remordimiento y necesidad de reparar. La honestidad libera más de lo que cuesta.",
    amor: "Secretos o traiciones en la relación; cuidado con quien no da la cara.",
    trabajo: "Alguien puede apropiarse de tu trabajo o esquivar responsabilidades; protege tus ideas.",
  },
  {
    id: "ocho-de-espadas",
    nombre: "Ocho de Espadas",
    arcano: "menor",
    numero: 8,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["restricción", "miedo", "prisión mental", "impotencia"],
    palabrasClaveInvertida: ["liberación", "nueva perspectiva", "autoempoderamiento", "salida"],
    significado:
      "El Ocho de Espadas está atada y con los ojos vendados, rodeada de espadas que en realidad no la encierran. Habla de una prisión creada por los propios pensamientos, del miedo que paraliza más que cualquier obstáculo real. La salida existe: solo hay que quitarse la venda.",
    significadoInvertido:
      "Invertido, el Ocho de Espadas anuncia que te liberas de las creencias que te ataban. Ves las opciones que antes te parecían imposibles y recuperas tu poder de decisión. La cárcel se abre desde adentro.",
    amor: "Te sientes atrapado en una relación por miedo, aunque la puerta esté abierta.",
    trabajo: "Sensación de no tener alternativas laborales; las limitaciones son más mentales que reales.",
  },
  {
    id: "nueve-de-espadas",
    nombre: "Nueve de Espadas",
    arcano: "menor",
    numero: 9,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["ansiedad", "insomnio", "culpa", "preocupación"],
    palabrasClaveInvertida: ["esperanza", "pedir ayuda", "alivio", "miedos infundados"],
    significado:
      "El Nueve de Espadas se despierta en medio de la noche con la cabeza entre las manos. Es la carta de la angustia, de los pensamientos que giran sin descanso y de la culpa que crece en la oscuridad. Los miedos suelen ser más grandes de noche que a la luz del día.",
    significadoInvertido:
      "Invertido, el Nueve de Espadas trae alivio: te das cuenta de que tus temores eran exagerados o encuentras a alguien con quien compartirlos. Pedir ayuda no es debilidad, es el camino de regreso al sueño.",
    amor: "Celos, inseguridades o miedo a perder la relación que te quitan el sueño.",
    trabajo: "Estrés y preocupación excesiva por el trabajo; el escenario no es tan grave como lo imaginas.",
  },
  {
    id: "diez-de-espadas",
    nombre: "Diez de Espadas",
    arcano: "menor",
    numero: 10,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["final doloroso", "fondo tocado", "traición", "cierre"],
    palabrasClaveInvertida: ["recuperación", "renacimiento", "evitar el desastre", "lento repunte"],
    significado:
      "El Diez de Espadas yace atravesado, pero al fondo amanece. Es el final de un ciclo doloroso, el punto más bajo desde donde ya solo se puede subir. Aunque la caída sea dura, marca el cierre definitivo de algo que tenía que terminar.",
    significadoInvertido:
      "Invertido, el Diez de Espadas anuncia que empiezas a levantarte. Lo peor ha pasado, las heridas cicatrizan y la vida vuelve a mostrar salidas. También puede advertir que evitas aceptar un final que ya sucedió.",
    amor: "Una ruptura definitiva o traición que cierra una etapa; después llega la sanación.",
    trabajo: "Despido, fracaso de un proyecto o crisis que obliga a comenzar desde cero.",
  },
  {
    id: "sota-de-espadas",
    nombre: "Sota de Espadas",
    arcano: "menor",
    numero: 11,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["curiosidad", "vigilancia", "ideas nuevas", "comunicación"],
    palabrasClaveInvertida: ["chismes", "impulsividad verbal", "espionaje", "ideas sin sustancia"],
    significado:
      "La Sota de Espadas alza su espada al viento, alerta y curiosa. Representa la mente joven que quiere saberlo todo, la vigilancia y la comunicación ágil. Trae noticias, ideas frescas y la necesidad de mantenerte atento.",
    significadoInvertido:
      "Invertida, la Sota de Espadas habla con demasiada rapidez y poco tacto: chismes, críticas hirientes o información usada con malicia. Piensa antes de hablar y verifica antes de creer.",
    amor: "Conversaciones que aclaran dudas; cuidado con la desconfianza excesiva o los rumores.",
    trabajo: "Noticias, aprendizaje de nuevas habilidades y necesidad de estar atento a los detalles.",
  },
  {
    id: "caballero-de-espadas",
    nombre: "Caballero de Espadas",
    arcano: "menor",
    numero: 12,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["acción rápida", "ambición", "determinación", "franqueza"],
    palabrasClaveInvertida: ["agresividad", "imprudencia", "precipitación", "brusquedad"],
    significado:
      "El Caballero de Espadas carga a galope contra el viento con la espada en alto. Es la determinación pura, la mente rápida que se lanza a defender una idea sin titubeos. Su energía logra mucho, aunque a veces arrasa lo que encuentra a su paso.",
    significadoInvertido:
      "Invertido, el Caballero de Espadas se vuelve agresivo, impaciente o simplemente imprudente. Puede haber palabras brutales, decisiones sin pensar o batallas innecesarias. Dirige tu inteligencia sin dañar.",
    amor: "Alguien directo y apasionado, pero poco sensible; la relación necesita más suavidad.",
    trabajo: "Avances rápidos y decisiones contundentes; cuidado con atropellar a colegas.",
  },
  {
    id: "reina-de-espadas",
    nombre: "Reina de Espadas",
    arcano: "menor",
    numero: 13,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["claridad", "independencia", "honestidad", "criterio"],
    palabrasClaveInvertida: ["frialdad", "amargura", "crueldad", "aislamiento"],
    significado:
      "La Reina de Espadas mira de frente, con la espada erguida y la mano abierta. Es la sabiduría que nace de la experiencia y del dolor superado: clara, justa y sin adornos. Te invita a decir la verdad con elegancia y a confiar en tu propio criterio.",
    significadoInvertido:
      "Invertida, la Reina de Espadas se endurece hasta la frialdad o la amargura. Puede haber críticas destructivas, resentimiento o un aislamiento que se disfraza de independencia. La claridad no necesita crueldad.",
    amor: "Una persona independiente que valora la honestidad; heridas del pasado pueden dificultar la apertura.",
    trabajo: "Decisiones objetivas, comunicación precisa y éxito en asuntos legales o analíticos.",
  },
  {
    id: "rey-de-espadas",
    nombre: "Rey de Espadas",
    arcano: "menor",
    numero: 14,
    palo: "espadas",
    elemento: "aire",
    palabrasClave: ["autoridad intelectual", "lógica", "verdad", "ética"],
    palabrasClaveInvertida: ["abuso de poder", "manipulación", "frialdad", "tiranía"],
    significado:
      "El Rey de Espadas gobierna con la razón y la ley. Representa el pensamiento claro, la ética y la capacidad de juzgar sin dejarse llevar por las emociones. Es un consejero exigente pero justo, que valora la verdad por encima de la comodidad.",
    significadoInvertido:
      "Invertido, el Rey de Espadas usa su inteligencia para dominar o manipular. Puede ser una figura fría, controladora o que retuerce las reglas a su favor. La razón sin compasión termina siendo tiranía.",
    amor: "Una pareja racional y honesta que puede parecer distante; el amor se demuestra con hechos.",
    trabajo: "Éxito en asuntos legales, técnicos o de dirección; se valora tu criterio y tu ética.",
  },

  // ───────────────────────── OROS (TIERRA) ─────────────────────────
  {
    id: "as-de-oros",
    nombre: "As de Oros",
    arcano: "menor",
    numero: 1,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["oportunidad material", "prosperidad", "nuevo comienzo", "semilla"],
    palabrasClaveInvertida: ["oportunidad perdida", "mala planificación", "escasez", "codicia"],
    significado:
      "El As de Oros ofrece una moneda dorada sobre un jardín florecido: es la semilla de la prosperidad. Anuncia una oportunidad concreta, dinero que llega o un proyecto que puede echar raíces. Tómalo con manos firmes y cuídalo para que crezca.",
    significadoInvertido:
      "Invertido, el As de Oros advierte que una oportunidad se escapa por falta de planificación o exceso de ambición. Puede haber inseguridad financiera o una inversión que no rinde. Revisa los cimientos antes de construir.",
    amor: "Una relación con bases sólidas y promesas concretas; estabilidad para compartir.",
    trabajo: "Nueva fuente de ingresos, oferta laboral o inversión prometedora que vale la pena aceptar.",
  },
  {
    id: "dos-de-oros",
    nombre: "Dos de Oros",
    arcano: "menor",
    numero: 2,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["equilibrio", "adaptabilidad", "malabarismo", "prioridades"],
    palabrasClaveInvertida: ["desorganización", "sobrecarga", "desequilibrio financiero", "estrés"],
    significado:
      "El Dos de Oros hace malabares con dos monedas mientras el mar se agita al fondo. Habla de equilibrar responsabilidades, dinero y tiempo con flexibilidad y buen humor. Todo se sostiene mientras no dejes de moverte.",
    significadoInvertido:
      "Invertido, el Dos de Oros indica que las bolas empiezan a caer: desorganización, deudas o compromisos que no puedes cumplir. Es hora de soltar algo y ordenar las prioridades.",
    amor: "Dificultad para equilibrar la relación con otras áreas de la vida; se necesita organización.",
    trabajo: "Varios proyectos a la vez o ingresos variables; administra con cuidado tus recursos.",
  },
  {
    id: "tres-de-oros",
    nombre: "Tres de Oros",
    arcano: "menor",
    numero: 3,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["trabajo en equipo", "maestría", "colaboración", "reconocimiento"],
    palabrasClaveInvertida: ["falta de cooperación", "trabajo mediocre", "ego", "desorganización"],
    significado:
      "El Tres de Oros muestra a un artesano que trabaja en una catedral mientras otros valoran su obra. Habla de la colaboración, del oficio bien hecho y del reconocimiento que llega cuando cada uno aporta lo suyo. El talento crece cuando se comparte.",
    significadoInvertido:
      "Invertido, el Tres de Oros señala equipos que no funcionan, trabajo descuidado o egos que impiden colaborar. Puede faltar planificación o reconocimiento. Revisa cómo se reparten las tareas y el mérito.",
    amor: "Construir la relación juntos, con esfuerzo compartido y metas comunes.",
    trabajo: "Proyectos colaborativos exitosos, aprendizaje de un oficio y reconocimiento profesional.",
  },
  {
    id: "cuatro-de-oros",
    nombre: "Cuatro de Oros",
    arcano: "menor",
    numero: 4,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["seguridad", "control", "ahorro", "posesividad"],
    palabrasClaveInvertida: ["generosidad", "soltar el control", "gastos", "inseguridad financiera"],
    significado:
      "El Cuatro de Oros abraza sus monedas con fuerza, temeroso de perderlas. Habla de estabilidad y ahorro, pero también de un apego que puede convertirse en avaricia o miedo. La seguridad es valiosa, siempre que no te impida vivir.",
    significadoInvertido:
      "Invertido, el Cuatro de Oros anuncia que sueltas el control, ya sea por generosidad o por necesidad. Puede haber gastos inesperados o el descubrimiento de que aferrarse no daba verdadera seguridad. Aprende a fluir con los recursos.",
    amor: "Posesividad o miedo a abrirse; la relación pide confianza y menos control.",
    trabajo: "Buen momento para ahorrar y consolidar, pero cuidado con la resistencia al cambio.",
  },
  {
    id: "cinco-de-oros",
    nombre: "Cinco de Oros",
    arcano: "menor",
    numero: 5,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["carencia", "dificultad", "exclusión", "pérdida material"],
    palabrasClaveInvertida: ["recuperación", "ayuda recibida", "fin de la escasez", "fe restaurada"],
    significado:
      "El Cinco de Oros muestra a dos personas que caminan en la nieve frente a una ventana iluminada. Habla de carencias económicas, de sentirse excluido o de una crisis de salud. La ayuda está más cerca de lo que crees: basta con mirar hacia la luz y pedirla.",
    significadoInvertido:
      "Invertido, el Cinco de Oros anuncia el final de un periodo de escasez. Recibes apoyo, recuperas la estabilidad y la fe en el futuro se restaura. Lo peor de la tormenta ha quedado atrás.",
    amor: "Sentirse solo o abandonado incluso en pareja; la crisis puede unir si se enfrenta juntos.",
    trabajo: "Pérdida de empleo, dificultades económicas o inseguridad; busca apoyo y recursos disponibles.",
  },
  {
    id: "seis-de-oros",
    nombre: "Seis de Oros",
    arcano: "menor",
    numero: 6,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["generosidad", "caridad", "equilibrio", "dar y recibir"],
    palabrasClaveInvertida: ["deuda", "generosidad interesada", "desigualdad", "abuso"],
    significado:
      "El Seis de Oros reparte monedas con una balanza en la mano. Habla de generosidad, de ayuda que llega o que ofreces y del flujo justo entre dar y recibir. Es una carta de equilibrio material y de gratitud.",
    significadoInvertido:
      "Invertido, el Seis de Oros revela una generosidad con condiciones, deudas que pesan o relaciones donde uno domina a través del dinero. Cuestiona si lo que das o recibes es realmente libre.",
    amor: "Una relación generosa y de apoyo mutuo; cuidado con desequilibrios de poder.",
    trabajo: "Aumento de sueldo, bonificaciones o inversiones; buen momento para ayudar y recibir ayuda.",
  },
  {
    id: "siete-de-oros",
    nombre: "Siete de Oros",
    arcano: "menor",
    numero: 7,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["paciencia", "evaluación", "inversión a largo plazo", "cosecha"],
    palabrasClaveInvertida: ["impaciencia", "esfuerzo sin fruto", "malas inversiones", "frustración"],
    significado:
      "El Siete de Oros contempla la planta que ha cultivado, apoyado en su azada. Habla de la paciencia del que ha sembrado y espera la cosecha, y del momento de evaluar si el esfuerzo está dando los frutos deseados. Lo que crece despacio suele durar.",
    significadoInvertido:
      "Invertido, el Siete de Oros muestra frustración por resultados que no llegan o inversiones que no rinden. Puede que estés cultivando el terreno equivocado. Evalúa con honestidad antes de seguir regando.",
    amor: "Una relación que crece con paciencia; evaluar si vale la pena la inversión emocional.",
    trabajo: "Resultados a largo plazo, inversiones que maduran y momento de revisar la estrategia.",
  },
  {
    id: "ocho-de-oros",
    nombre: "Ocho de Oros",
    arcano: "menor",
    numero: 8,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["dedicación", "aprendizaje", "oficio", "perfeccionamiento"],
    palabrasClaveInvertida: ["perfeccionismo", "trabajo repetitivo", "falta de ambición", "descuido"],
    significado:
      "El Ocho de Oros talla una moneda tras otra con concentración absoluta. Es la carta del aprendiz que se vuelve maestro a fuerza de práctica, de la dedicación y del amor por el trabajo bien hecho. El progreso llega con cada golpe de cincel.",
    significadoInvertido:
      "Invertido, el Ocho de Oros advierte sobre un perfeccionismo que paraliza o un trabajo mecánico sin alma. Puede haber descuido o aburrimiento. Recupera el sentido de lo que haces o cambia de taller.",
    amor: "Trabajar en la relación día a día con constancia y atención a los detalles.",
    trabajo: "Formación, especialización y desarrollo de habilidades; el esfuerzo constante da frutos.",
  },
  {
    id: "nueve-de-oros",
    nombre: "Nueve de Oros",
    arcano: "menor",
    numero: 9,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["independencia", "abundancia", "lujo", "autosuficiencia"],
    palabrasClaveInvertida: ["dependencia", "gastos excesivos", "soledad", "éxito superficial"],
    significado:
      "El Nueve de Oros pasea por su viñedo con un halcón en la mano: ha construido su abundancia con disciplina y ahora la disfruta. Habla de independencia, refinamiento y del placer de haber conseguido las cosas por uno mismo.",
    significadoInvertido:
      "Invertido, el Nueve de Oros señala dependencia económica, gastos que superan los ingresos o un éxito que se siente hueco. También puede reflejar soledad en medio de la comodidad. Revisa qué sostiene tu bienestar.",
    amor: "Amor propio y autonomía; una relación donde ambos conservan su independencia.",
    trabajo: "Éxito económico fruto del esfuerzo propio; buen momento para disfrutar lo logrado.",
  },
  {
    id: "diez-de-oros",
    nombre: "Diez de Oros",
    arcano: "menor",
    numero: 10,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["legado", "riqueza", "familia", "estabilidad duradera"],
    palabrasClaveInvertida: ["disputas familiares", "pérdida financiera", "inestabilidad", "herencias conflictivas"],
    significado:
      "El Diez de Oros reúne tres generaciones bajo un arco lleno de escudos: es la riqueza que perdura y se transmite. Habla de patrimonio, tradición familiar y de una seguridad que va más allá de uno mismo. Lo que construyes hoy será el suelo de quienes vienen.",
    significadoInvertido:
      "Invertido, el Diez de Oros muestra conflictos por dinero o herencias, inestabilidad financiera o una tradición familiar que pesa. Puede que la seguridad material haya reemplazado a la conexión afectiva.",
    amor: "Compromiso duradero, formación de familia y estabilidad compartida.",
    trabajo: "Empresas familiares, herencias, inversiones sólidas y patrimonio a largo plazo.",
  },
  {
    id: "sota-de-oros",
    nombre: "Sota de Oros",
    arcano: "menor",
    numero: 11,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["estudio", "oportunidad", "ambición", "practicidad"],
    palabrasClaveInvertida: ["procrastinación", "falta de progreso", "planes irreales", "pereza"],
    significado:
      "La Sota de Oros contempla su moneda con la seriedad de quien sabe que el futuro se construye. Representa al estudiante aplicado, una oferta concreta o el inicio de un camino hacia una meta material. Trae noticias sobre dinero, estudios o trabajo.",
    significadoInvertido:
      "Invertida, la Sota de Oros señala falta de disciplina, planes que no se concretan o una tendencia a postergar. Puede haber una oportunidad mal aprovechada. Vuelve al esfuerzo constante y realista.",
    amor: "Una relación que empieza con seriedad y ganas de construir algo estable.",
    trabajo: "Nueva oferta laboral, becas, estudios o el primer paso hacia una meta profesional.",
  },
  {
    id: "caballero-de-oros",
    nombre: "Caballero de Oros",
    arcano: "menor",
    numero: 12,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["constancia", "responsabilidad", "rutina", "fiabilidad"],
    palabrasClaveInvertida: ["estancamiento", "aburrimiento", "pereza", "obsesión con el trabajo"],
    significado:
      "El Caballero de Oros avanza despacio sobre un caballo que no se mueve: es el más lento de los caballeros, pero el que siempre llega. Habla de constancia, método y de la responsabilidad que se cumple sin necesidad de aplausos. La rutina, bien llevada, construye imperios.",
    significadoInvertido:
      "Invertido, el Caballero de Oros cae en el estancamiento, la pereza o una rutina que asfixia. También puede ser un exceso de trabajo que deja fuera todo lo demás. Hace falta movimiento o un poco de aire.",
    amor: "Una pareja fiel y constante, aunque quizá poco romántica; el amor se demuestra con hechos.",
    trabajo: "Progreso lento pero seguro; tu fiabilidad es tu mejor carta de presentación.",
  },
  {
    id: "reina-de-oros",
    nombre: "Reina de Oros",
    arcano: "menor",
    numero: 13,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["nutrición", "prosperidad", "practicidad", "hogar"],
    palabrasClaveInvertida: ["desequilibrio trabajo-hogar", "materialismo", "descuido", "inseguridad"],
    significado:
      "La Reina de Oros reina en un jardín abundante, con los pies en la tierra y el corazón generoso. Representa el cuidado práctico, la prosperidad compartida y la capacidad de crear un hogar cálido y seguro. Sabe que el amor también se demuestra con alimento y refugio.",
    significadoInvertido:
      "Invertida, la Reina de Oros se pierde entre las obligaciones, descuida su bienestar o pone lo material por encima de lo afectivo. Puede haber inseguridad financiera o sensación de no dar abasto. Cuídate como cuidas a los demás.",
    amor: "Una relación cálida, protectora y estable; alguien que cuida con hechos concretos.",
    trabajo: "Éxito en negocios, gestión de recursos y profesiones vinculadas al cuidado o el hogar.",
  },
  {
    id: "rey-de-oros",
    nombre: "Rey de Oros",
    arcano: "menor",
    numero: 14,
    palo: "oros",
    elemento: "tierra",
    palabrasClave: ["éxito", "abundancia", "seguridad", "liderazgo material"],
    palabrasClaveInvertida: ["codicia", "corrupción", "obstinación", "materialismo"],
    significado:
      "El Rey de Oros gobierna desde un trono rodeado de vides y abundancia. Es el empresario exitoso, el proveedor confiable y el hombre que ha convertido la disciplina en riqueza. Representa la culminación material y la generosidad de quien tiene de sobra.",
    significadoInvertido:
      "Invertido, el Rey de Oros se vuelve avaro, obstinado o dispuesto a comprometer su ética por dinero. Puede ser una figura que controla a través de lo material. La riqueza sin valores es una jaula dorada.",
    amor: "Una pareja estable y protectora que ofrece seguridad; el compromiso se vive con solidez.",
    trabajo: "Cima del éxito profesional, negocios prósperos y capacidad de administrar grandes recursos.",
  },
];

export function cartaPorId(id: string): CartaTarot | undefined {
  return MAZO.find((carta) => carta.id === id);
}
