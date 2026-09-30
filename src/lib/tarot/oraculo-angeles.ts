import type { CartaTarot } from "./deck";

/**
 * Oráculo de los Ángeles: 44 cartas de mensajes. No tiene cartas invertidas.
 * Reutiliza la estructura de CartaTarot para integrarse con las tiradas.
 */
export const ORACULO_ANGELES: CartaTarot[] = [
  {
    id: "angel-de-la-confianza",
    nombre: "Ángel de la Confianza",
    arcano: "mayor",
    numero: 1,
    elemento: "espiritu",
    palabrasClave: ["seguridad", "certeza", "apoyo", "soltar el control"],
    palabrasClaveInvertida: ["seguridad", "certeza", "apoyo", "soltar el control"],
    significado:
      "Puedes soltar la necesidad de tenerlo todo bajo control: lo que has sembrado con honestidad ya está dando fruto aunque todavía no lo veas. Confía en tu propio criterio y en las personas que han demostrado estar a tu lado. No necesitas más pruebas para dar el siguiente paso.",
    significadoInvertido:
      "Cuidado con confundir confianza con ingenuidad: revisa si estás entregando tu seguridad a alguien que aún no la ha ganado.",
    amor: "Baja la guardia con quien te ha demostrado constancia; la desconfianza que cargas viene de otra historia, no de esta.",
    trabajo: "Delega sin supervisar cada detalle y verás que el equipo responde mejor cuando siente tu confianza.",
  },
  {
    id: "angel-de-los-nuevos-comienzos",
    nombre: "Ángel de los Nuevos Comienzos",
    arcano: "mayor",
    numero: 2,
    elemento: "fuego",
    palabrasClave: ["inicio", "página en blanco", "impulso", "oportunidad"],
    palabrasClaveInvertida: ["inicio", "página en blanco", "impulso", "oportunidad"],
    significado:
      "Se abre una puerta que hace meses parecía cerrada, y esta vez no llegas con las manos vacías sino con todo lo aprendido. Permítete empezar sin exigirte que el primer intento salga perfecto. Lo importante ahora es moverte, no acertar.",
    significadoInvertido:
      "Vigila la tentación de reiniciar todo para escapar de lo que no terminaste; un comienzo sano no borra lo anterior, lo integra.",
    amor: "Una relación nueva o una etapa distinta dentro de la actual pide que llegues sin comparaciones con el pasado.",
    trabajo: "Es buen momento para lanzar el proyecto, enviar la solicitud o abrir ese emprendimiento que has pospuesto.",
  },
  {
    id: "angel-de-la-sanacion",
    nombre: "Ángel de la Sanación",
    arcano: "mayor",
    numero: 3,
    elemento: "agua",
    palabrasClave: ["recuperación", "cuidado", "cierre de heridas", "cuerpo"],
    palabrasClaveInvertida: ["recuperación", "cuidado", "cierre de heridas", "cuerpo"],
    significado:
      "Tu cuerpo y tu ánimo te están pidiendo atención, y escucharlos hoy evita una factura más alta mañana. Sanar no es olvidar lo que dolió, es dejar de reabrirlo cada vez que te sientes vulnerable. Busca la ayuda que necesitas sin sentir que es una derrota.",
    significadoInvertido:
      "Atención a la herida que sigues usando como excusa: puede que ya haya cerrado y tú sigas actuando como si sangrara.",
    amor: "Antes de exigirle a tu pareja que te cure, identifica qué parte del dolor es tuya y qué parte le corresponde.",
    trabajo: "Si el trabajo te está enfermando, el primer paso es nombrarlo; el segundo, pedir el descanso o el cambio que hace falta.",
  },
  {
    id: "angel-de-la-abundancia",
    nombre: "Ángel de la Abundancia",
    arcano: "mayor",
    numero: 4,
    elemento: "tierra",
    palabrasClave: ["plenitud", "recibir", "cosecha", "suficiencia"],
    palabrasClaveInvertida: ["plenitud", "recibir", "cosecha", "suficiencia"],
    significado:
      "Ya tienes más de lo que reconoces: talentos, afectos, tiempo y recursos que das por sentados. Abrirte a recibir empieza por dejar de repetir que nunca alcanza. Cuando administras con gratitud lo que hay, lo que falta encuentra el camino.",
    significadoInvertido:
      "Cuidado con la acumulación por miedo; guardar todo por si acaso también es una forma de vivir en escasez.",
    amor: "Deja que te cuiden y te regalen sin devolver el favor de inmediato; recibir también es una forma de amar.",
    trabajo: "Una fuente de ingreso que ignorabas puede activarse si aceptas la propuesta que llegará en las próximas semanas.",
  },
  {
    id: "angel-del-perdon",
    nombre: "Ángel del Perdón",
    arcano: "mayor",
    numero: 5,
    elemento: "agua",
    palabrasClave: ["soltar rencor", "alivio", "cerrar ciclos", "ligereza"],
    palabrasClaveInvertida: ["soltar rencor", "alivio", "cerrar ciclos", "ligereza"],
    significado:
      "El rencor que guardas ocupa un espacio que podría estar lleno de paz. Perdonar no significa volver a confiar ni aceptar de nuevo a quien te hirió: significa dejar de pagar tú la deuda de otro. Empieza por perdonarte lo que hiciste cuando sabías menos.",
    significadoInvertido:
      "Revisa si estás perdonando demasiado rápido para evitar el conflicto; un perdón que salta el dolor suele volver como resentimiento.",
    amor: "Una conversación pendiente puede aliviar años de distancia si llegas sin la intención de ganar.",
    trabajo: "Suelta el error que cometiste en aquel proyecto; ya lo pagaste y seguir castigándote frena tu crecimiento.",
  },
  {
    id: "angel-de-la-claridad",
    nombre: "Ángel de la Claridad",
    arcano: "mayor",
    numero: 6,
    elemento: "aire",
    palabrasClave: ["lucidez", "ver con nitidez", "decisión", "despejar"],
    palabrasClaveInvertida: ["lucidez", "ver con nitidez", "decisión", "despejar"],
    significado:
      "La niebla que te rodeaba se está disipando y pronto verás la situación tal como es, sin los adornos que le pusiste. Escribe lo que sientes y lo que sabes en dos columnas separadas; la respuesta aparecerá en el espacio entre ambas. No decidas hasta que la vista esté limpia.",
    significadoInvertido:
      "Atención a la sobreinformación: leer más opiniones no te dará claridad, te dará más ruido.",
    amor: "Verás con nitidez qué necesitas de esa persona y si de verdad puede dártelo.",
    trabajo: "Una reunión o un dato concreto despejará la duda que te impedía elegir entre dos caminos laborales.",
  },
  {
    id: "angel-de-la-paciencia",
    nombre: "Ángel de la Paciencia",
    arcano: "mayor",
    numero: 7,
    elemento: "tierra",
    palabrasClave: ["tiempo justo", "maduración", "espera activa", "calma"],
    palabrasClaveInvertida: ["tiempo justo", "maduración", "espera activa", "calma"],
    significado:
      "Lo que esperas está en proceso y forzarlo solo lo estropearía, como abrir un horno antes de tiempo. Usa esta espera para preparar el terreno: ordena, aprende, descansa. El resultado llegará cuando tú también estés listo para sostenerlo.",
    significadoInvertido:
      "Cuidado con disfrazar la pasividad de paciencia; esperar no es lo mismo que evitar actuar por miedo.",
    amor: "No presiones una respuesta ni una definición; deja que la otra persona llegue a su propio ritmo.",
    trabajo: "El ascenso o la respuesta que aguardas tiene fecha, aunque no la conozcas; mientras tanto, sigue entregando calidad.",
  },
  {
    id: "angel-de-la-proteccion",
    nombre: "Ángel de la Protección",
    arcano: "mayor",
    numero: 8,
    elemento: "espiritu",
    palabrasClave: ["amparo", "resguardo", "cuidado invisible", "seguridad"],
    palabrasClaveInvertida: ["amparo", "resguardo", "cuidado invisible", "seguridad"],
    significado:
      "No estás tan expuesto como sientes: hay una red de cuidado a tu alrededor que actúa aunque no la veas. Toma las precauciones razonables y luego suelta la vigilancia constante, que te agota más que el peligro real. Estás acompañado en esto.",
    significadoInvertido:
      "Revisa si la protección que buscas se ha convertido en una burbuja que te aísla de la vida que quieres vivir.",
    amor: "Aléjate de quien te hace sentir en alerta permanente; el amor verdadero se siente como refugio, no como amenaza.",
    trabajo: "Guarda copias, lee bien los contratos y confía en tu instinto ante una oferta que parece demasiado buena.",
  },
  {
    id: "angel-de-la-gratitud",
    nombre: "Ángel de la Gratitud",
    arcano: "mayor",
    numero: 9,
    elemento: "tierra",
    palabrasClave: ["agradecer", "reconocimiento", "valorar", "presente"],
    palabrasClaveInvertida: ["agradecer", "reconocimiento", "valorar", "presente"],
    significado:
      "Antes de pedir algo nuevo, mira lo que ya llegó y nombra tres cosas que hoy funcionan en tu vida. La gratitud no es conformismo: es la base firme desde donde puedes crecer sin ansiedad. Agradece también lo que no salió, porque te apartó de un camino equivocado.",
    significadoInvertido:
      "Cuidado con la gratitud forzada que tapa una queja legítima; agradecer no te obliga a callar lo que sí necesita cambiar.",
    amor: "Dile a esa persona, con palabras concretas, qué le agradeces; lo que se reconoce se fortalece.",
    trabajo: "Reconoce el aporte de tus compañeros en voz alta; ese gesto abre puertas que el mérito solo no abre.",
  },
  {
    id: "angel-de-la-valentia",
    nombre: "Ángel de la Valentía",
    arcano: "mayor",
    numero: 10,
    elemento: "fuego",
    palabrasClave: ["coraje", "atreverse", "enfrentar", "decisión firme"],
    palabrasClaveInvertida: ["coraje", "atreverse", "enfrentar", "decisión firme"],
    significado:
      "El miedo que sientes es la señal de que estás frente a algo que importa de verdad. Ser valiente no es dejar de temblar, es dar el paso mientras tiemblas. Hoy es el día para la llamada, la propuesta o el límite que has ensayado mil veces en tu cabeza.",
    significadoInvertido:
      "Atención a la valentía que en realidad es impulsividad: antes de saltar, asegúrate de que no estás huyendo de una conversación.",
    amor: "Declara lo que sientes o termina lo que ya no funciona; la indecisión también hiere.",
    trabajo: "Pide el aumento, presenta la idea en la reunión o renuncia a lo que te apaga: el momento de actuar es ahora.",
  },
  {
    id: "angel-del-amor-propio",
    nombre: "Ángel del Amor Propio",
    arcano: "mayor",
    numero: 11,
    elemento: "agua",
    palabrasClave: ["autoestima", "cuidarte", "dignidad", "merecimiento"],
    palabrasClaveInvertida: ["autoestima", "cuidarte", "dignidad", "merecimiento"],
    significado:
      "Háblate hoy como le hablarías a alguien que amas: sin burla, sin exigencia, sin condiciones. Lo que aceptas de los demás es un reflejo exacto de lo que crees merecer. Empieza por una cosa pequeña: dormir bien, comer con calma, decir que no.",
    significadoInvertido:
      "Cuidado con confundir amor propio con orgullo herido; cuidarte no es cerrarte a toda crítica ni a toda necesidad ajena.",
    amor: "Ninguna relación reemplaza la que tienes contigo; si te abandonas para retener a alguien, ya perdiste.",
    trabajo: "Cobra lo que vale tu trabajo y no aceptes tareas que te degradan por miedo a parecer difícil.",
  },
  {
    id: "angel-de-la-liberacion",
    nombre: "Ángel de la Liberación",
    arcano: "mayor",
    numero: 12,
    elemento: "aire",
    palabrasClave: ["soltar", "romper cadenas", "libertad", "desprenderse"],
    palabrasClaveInvertida: ["soltar", "romper cadenas", "libertad", "desprenderse"],
    significado:
      "Hay una atadura que sigues cargando por costumbre: una deuda emocional, una promesa vieja, una identidad que ya no eres. Tienes permiso para soltarla sin explicárselo a nadie. La libertad que buscas afuera empieza en lo que decides dejar de cargar.",
    significadoInvertido:
      "Vigila que la liberación no sea abandono disfrazado: soltar responsabilidades reales no es libertad, es fuga.",
    amor: "Suelta la relación que se sostiene solo por el miedo a la soledad; el vacío que temes es más pequeño que la jaula.",
    trabajo: "Deja el puesto, el cliente o el hábito que te mantiene atado a una versión tuya que ya superaste.",
  },
  {
    id: "angel-de-la-intuicion",
    nombre: "Ángel de la Intuición",
    arcano: "mayor",
    numero: 13,
    elemento: "agua",
    palabrasClave: ["voz interior", "presentimiento", "escuchar", "sabiduría del cuerpo"],
    palabrasClaveInvertida: ["voz interior", "presentimiento", "escuchar", "sabiduría del cuerpo"],
    significado:
      "Esa sensación en el estómago que descartaste por ilógica tenía razón, y lo sabes. Tu intuición no grita, susurra, y solo la escuchas cuando bajas el volumen de las opiniones ajenas. Anota los sueños y las corazonadas de esta semana: contienen información útil.",
    significadoInvertido:
      "Cuidado con llamar intuición a la ansiedad; el miedo también habla en voz baja y se disfraza de presentimiento.",
    amor: "Si algo en esa persona te inquieta sin motivo aparente, no lo ignores; observa antes de entregarte.",
    trabajo: "Confía en tu olfato con esa negociación o esa contratación; los datos importan, pero tu instinto ya vio algo.",
  },
  {
    id: "angel-del-equilibrio",
    nombre: "Ángel del Equilibrio",
    arcano: "mayor",
    numero: 14,
    elemento: "tierra",
    palabrasClave: ["armonía", "medida", "centro", "moderación"],
    palabrasClaveInvertida: ["armonía", "medida", "centro", "moderación"],
    significado:
      "Has estado inclinando la balanza demasiado hacia un lado: mucho trabajo y poco descanso, mucho dar y poco recibir. El equilibrio no es un punto fijo sino un ajuste constante, como caminar. Hoy corrige un poco el rumbo y observa cómo cambia tu energía.",
    significadoInvertido:
      "Atención al equilibrio que se vuelve tibieza: evitar los extremos no significa no comprometerte con nada.",
    amor: "Revisa quién da más en la relación y conversa sobre ello antes de que el desbalance se convierta en resentimiento.",
    trabajo: "Pon horario de cierre a tu jornada; la productividad que viene del agotamiento se paga con intereses.",
  },
  {
    id: "angel-de-la-comunicacion",
    nombre: "Ángel de la Comunicación",
    arcano: "mayor",
    numero: 15,
    elemento: "aire",
    palabrasClave: ["expresar", "diálogo", "escucha", "palabras claras"],
    palabrasClaveInvertida: ["expresar", "diálogo", "escucha", "palabras claras"],
    significado:
      "Lo que no dices también se comunica, y suele hacerlo de la peor manera. Elige las palabras con cuidado pero dilas: la otra persona no puede adivinar lo que necesitas. Escucha con la misma atención con la que quieres ser escuchado.",
    significadoInvertido:
      "Cuidado con hablar de más para llenar el silencio o con usar la sinceridad como excusa para herir.",
    amor: "Una conversación honesta, sin reproches acumulados, puede cambiar el rumbo de la relación esta semana.",
    trabajo: "Aclara por escrito lo que se acordó; muchos malentendidos laborales nacen de suposiciones no confirmadas.",
  },
  {
    id: "angel-de-la-fe",
    nombre: "Ángel de la Fe",
    arcano: "mayor",
    numero: 16,
    elemento: "espiritu",
    palabrasClave: ["creer", "sostenerse", "sentido", "confianza en lo invisible"],
    palabrasClaveInvertida: ["creer", "sostenerse", "sentido", "confianza en lo invisible"],
    significado:
      "Cuando no puedas ver el camino completo, da el paso que sí ves. La fe no es certeza sobre el resultado sino la decisión de seguir aunque la evidencia sea escasa. Lo que hoy parece un callejón sin salida tiene una curva que aún no alcanzas a distinguir.",
    significadoInvertido:
      "Vigila la fe que se vuelve pretexto para no hacer tu parte; creer no reemplaza planear ni trabajar.",
    amor: "Cree en la posibilidad de un amor sano aunque tus experiencias anteriores digan lo contrario.",
    trabajo: "Sostén el proyecto un tramo más; los resultados que no llegan suelen aparecer justo después del punto donde otros abandonan.",
  },
  {
    id: "angel-de-la-creatividad",
    nombre: "Ángel de la Creatividad",
    arcano: "mayor",
    numero: 17,
    elemento: "fuego",
    palabrasClave: ["inspiración", "crear", "imaginación", "expresión"],
    palabrasClaveInvertida: ["inspiración", "crear", "imaginación", "expresión"],
    significado:
      "Tienes una idea que lleva semanas tocándote la puerta y la has dejado esperando por falta de tiempo o de permiso. Dedícale una hora hoy, sin juzgar el resultado. Crear no es solo para artistas: es la forma en que tu alma resuelve lo que la mente no puede.",
    significadoInvertido:
      "Cuidado con la creatividad que se queda en fantasía: una idea que nunca toca el papel o la práctica no cambia nada.",
    amor: "Rompe la rutina con un gesto inesperado; la relación necesita novedad, no grandes sacrificios.",
    trabajo: "La solución al problema que te bloquea no está en el manual; prueba un enfoque que nadie en tu equipo ha intentado.",
  },
  {
    id: "angel-del-descanso",
    nombre: "Ángel del Descanso",
    arcano: "mayor",
    numero: 18,
    elemento: "agua",
    palabrasClave: ["pausa", "reposo", "recargar", "permiso para parar"],
    palabrasClaveInvertida: ["pausa", "reposo", "recargar", "permiso para parar"],
    significado:
      "No tienes que ganarte el descanso con agotamiento: es un derecho, no un premio. Tu mente lleva semanas resolviendo y necesita un rato de no hacer nada para que las respuestas se acomoden solas. Apaga el teléfono una tarde y observa cuánto se ordena sin tu intervención.",
    significadoInvertido:
      "Atención al descanso que se vuelve postergación indefinida; hay una diferencia entre recargar y esconderte del mundo.",
    amor: "Dale espacio a la relación para respirar; no todo tiene que resolverse hoy ni en una sola conversación.",
    trabajo: "Toma los días libres que tienes acumulados; nadie recordará tu presencia constante, pero tú sí recordarás el desgaste.",
  },
  {
    id: "angel-de-la-familia",
    nombre: "Ángel de la Familia",
    arcano: "mayor",
    numero: 19,
    elemento: "tierra",
    palabrasClave: ["raíces", "hogar", "vínculos", "pertenencia"],
    palabrasClaveInvertida: ["raíces", "hogar", "vínculos", "pertenencia"],
    significado:
      "Tus raíces te sostienen aunque a veces también te aprieten. Hay alguien de tu familia, de sangre o elegida, que necesita una llamada tuya esta semana. Honrar de dónde vienes no te obliga a repetir lo que allí se hizo mal.",
    significadoInvertido:
      "Cuidado con la lealtad familiar que te exige traicionarte; pertenecer no debería costarte tu propia vida.",
    amor: "Presenta a tu pareja a tu gente o construyan juntos un hogar con reglas propias; el vínculo pide raíces.",
    trabajo: "Un negocio o proyecto con familiares puede funcionar si dejan por escrito lo que el cariño suele dar por sentado.",
  },
  {
    id: "angel-de-los-milagros",
    nombre: "Ángel de los Milagros",
    arcano: "mayor",
    numero: 20,
    elemento: "espiritu",
    palabrasClave: ["asombro", "lo inesperado", "gracia", "giro favorable"],
    palabrasClaveInvertida: ["asombro", "lo inesperado", "gracia", "giro favorable"],
    significado:
      "Algo que dabas por perdido está a punto de resolverse de un modo que no habías calculado. Los milagros rara vez son espectaculares: suelen llegar como una coincidencia, una llamada o un cambio de opinión. Mantén los ojos abiertos para reconocerlo cuando pase.",
    significadoInvertido:
      "Vigila la espera del milagro que te impide hacer lo posible; lo extraordinario suele apoyarse en lo que sí hiciste.",
    amor: "Un reencuentro o un giro inesperado en tu vida afectiva puede sorprenderte cuando ya habías dejado de buscar.",
    trabajo: "Una oportunidad llegará por un canal que no considerabas; responde rápido cuando aparezca.",
  },
  {
    id: "angel-de-los-limites",
    nombre: "Ángel de los Límites",
    arcano: "mayor",
    numero: 21,
    elemento: "tierra",
    palabrasClave: ["decir no", "protegerte", "respeto", "frontera sana"],
    palabrasClaveInvertida: ["decir no", "protegerte", "respeto", "frontera sana"],
    significado:
      "Cada vez que dices sí cuando quieres decir no, pagas con un pedazo de tu energía. Poner un límite no es rechazar a la otra persona, es respetarte lo suficiente para seguir presente sin resentimiento. Practica hoy con algo pequeño y nota cómo se siente.",
    significadoInvertido:
      "Cuidado con los límites que se convierten en muros; una frontera sana deja pasar lo que sí quieres recibir.",
    amor: "Di con claridad qué no estás dispuesto a tolerar; quien te ama de verdad lo respetará en lugar de negociarlo.",
    trabajo: "Deja de responder mensajes fuera de horario; el respeto a tu tiempo empieza cuando tú lo haces valer.",
  },
  {
    id: "angel-de-la-alegria",
    nombre: "Ángel de la Alegría",
    arcano: "mayor",
    numero: 22,
    elemento: "fuego",
    palabrasClave: ["gozo", "ligereza", "juego", "disfrutar"],
    palabrasClaveInvertida: ["gozo", "ligereza", "juego", "disfrutar"],
    significado:
      "Te has puesto tan serio con la vida que olvidaste que también vinimos a disfrutarla. La alegría no llega cuando todo se resuelve: es lo que te da fuerzas para resolver. Baila, ríe con alguien, haz algo inútil y hermoso hoy mismo.",
    significadoInvertido:
      "Atención a la alegría obligatoria que niega la tristeza; fingir que todo está bien te desconecta de lo que sí sientes.",
    amor: "Recupera la risa compartida; una pareja que juega junta resiste mejor las tormentas.",
    trabajo: "Busca lo que te divierte en lo que haces y cultívalo; la gente rinde más donde disfruta.",
  },
  {
    id: "angel-del-proposito",
    nombre: "Ángel del Propósito",
    arcano: "mayor",
    numero: 23,
    elemento: "fuego",
    palabrasClave: ["misión", "sentido", "dirección", "vocación"],
    palabrasClaveInvertida: ["misión", "sentido", "dirección", "vocación"],
    significado:
      "Tu propósito no es una tarea grandiosa que aún debes descubrir: es lo que haces cuando pierdes la noción del tiempo y sientes que sirves para algo. Observa qué te piden los demás con naturalidad y qué darías aunque nadie pagara. Ahí está la pista.",
    significadoInvertido:
      "Cuidado con la obsesión por encontrar el propósito perfecto; puede ser una forma elegante de no comprometerte con nada.",
    amor: "Una relación con sentido es aquella donde ambos crecen; pregúntate si esta te acerca o te aleja de quien quieres ser.",
    trabajo: "Alinea tu trabajo con lo que te importa, aunque sea en un pequeño proyecto paralelo; el sentido no espera al retiro.",
  },
  {
    id: "angel-del-silencio",
    nombre: "Ángel del Silencio",
    arcano: "mayor",
    numero: 24,
    elemento: "aire",
    palabrasClave: ["quietud", "interioridad", "callar", "escuchar adentro"],
    palabrasClaveInvertida: ["quietud", "interioridad", "callar", "escuchar adentro"],
    significado:
      "Hay respuestas que solo aparecen cuando dejas de preguntar en voz alta. Regálate momentos sin música, sin pantallas y sin conversación, aunque al principio incomode. En ese silencio se ordena lo que el ruido mantiene revuelto.",
    significadoInvertido:
      "Vigila el silencio que castiga o que esconde lo que deberías decir; callar por miedo no es lo mismo que callar por paz.",
    amor: "No todo necesita ser discutido; a veces acompañar en silencio dice más que cualquier argumento.",
    trabajo: "Antes de responder a esa provocación o propuesta, espera un día; la respuesta que surja del silencio será mejor.",
  },
  {
    id: "angel-del-cambio",
    nombre: "Ángel del Cambio",
    arcano: "mayor",
    numero: 25,
    elemento: "aire",
    palabrasClave: ["transformación", "movimiento", "adaptación", "transición"],
    palabrasClaveInvertida: ["transformación", "movimiento", "adaptación", "transición"],
    significado:
      "Lo que se está moviendo en tu vida no es un castigo sino una corriente que te lleva a donde no llegarías quedándote quieto. Resistir gasta más energía que adaptarse. Suelta la orilla conocida y confía en que sabes nadar.",
    significadoInvertido:
      "Cuidado con provocar cambios solo para sentir que avanzas; el movimiento sin dirección también es una forma de estancamiento.",
    amor: "La relación está entrando en otra etapa; lo que funcionaba antes puede requerir nuevos acuerdos.",
    trabajo: "Una reestructuración, mudanza o cambio de rol se acerca; prepárate para verlo como oportunidad y no como amenaza.",
  },
  {
    id: "angel-de-la-reconciliacion",
    nombre: "Ángel de la Reconciliación",
    arcano: "mayor",
    numero: 26,
    elemento: "agua",
    palabrasClave: ["puente", "reencuentro", "reparar", "volver a acercarse"],
    palabrasClaveInvertida: ["puente", "reencuentro", "reparar", "volver a acercarse"],
    significado:
      "Una distancia que se abrió por orgullo puede cerrarse con un gesto sencillo, y ese gesto te corresponde a ti. Reconciliarse no exige olvidar la ofensa, solo decidir que el vínculo vale más que tener la razón. Si la otra persona no responde, habrás hecho tu parte en paz.",
    significadoInvertido:
      "Atención a la reconciliación que repite el mismo ciclo; volver sin que nada haya cambiado es preparar la próxima ruptura.",
    amor: "Si el amor sigue vivo debajo del enojo, un mensaje sincero puede reabrir la puerta que ambos cerraron.",
    trabajo: "Restablece la relación con ese colega o cliente con quien hubo roce; en el largo plazo los puentes valen más que los muros.",
  },
  {
    id: "angel-de-la-verdad",
    nombre: "Ángel de la Verdad",
    arcano: "mayor",
    numero: 27,
    elemento: "aire",
    palabrasClave: ["honestidad", "autenticidad", "destapar", "coherencia"],
    palabrasClaveInvertida: ["honestidad", "autenticidad", "destapar", "coherencia"],
    significado:
      "Algo que estaba oculto saldrá a la luz, y aunque incomode, te dará una base más firme para decidir. Sé honesto primero contigo: la mentira más costosa es la que te cuentas para no cambiar. Vivir en coherencia pesa menos que sostener una fachada.",
    significadoInvertido:
      "Cuidado con la verdad usada como arma; decir todo lo que piensas sin cuidado no es honestidad, es descarga.",
    amor: "Si hay algo que no le has dicho a tu pareja, este es el momento; lo que se calla se pudre.",
    trabajo: "Una situación laboral poco clara se aclarará; asegúrate de que tus propias cuentas y palabras estén en orden.",
  },
  {
    id: "angel-de-la-compasion",
    nombre: "Ángel de la Compasión",
    arcano: "mayor",
    numero: 28,
    elemento: "agua",
    palabrasClave: ["empatía", "comprensión", "suavizar", "mirar con bondad"],
    palabrasClaveInvertida: ["empatía", "comprensión", "suavizar", "mirar con bondad"],
    significado:
      "Esa persona que te irrita está librando una batalla que no conoces, igual que tú. La compasión no te exige aguantar el maltrato, solo mirar con menos dureza. Empieza por tratarte con la misma comprensión que ofreces con facilidad a los demás.",
    significadoInvertido:
      "Vigila la compasión que te convierte en salvador; comprender el dolor de otro no significa cargar con su vida.",
    amor: "Antes de juzgar la reacción de tu pareja, pregúntate qué miedo hay detrás; la respuesta cambiará tu tono.",
    trabajo: "Un colega o jefe difícil puede estar bajo presión; un gesto de comprensión puede transformar la dinámica.",
  },
  {
    id: "angel-de-la-prosperidad",
    nombre: "Ángel de la Prosperidad",
    arcano: "mayor",
    numero: 29,
    elemento: "tierra",
    palabrasClave: ["crecimiento", "fruto del esfuerzo", "estabilidad", "bienestar material"],
    palabrasClaveInvertida: ["crecimiento", "fruto del esfuerzo", "estabilidad", "bienestar material"],
    significado:
      "El esfuerzo sostenido de los últimos meses empieza a traducirse en resultados tangibles. Prosperar no es solo tener más dinero: es que tu vida se expanda en salud, tiempo y relaciones. Invierte una parte de lo que llega en algo que crezca contigo.",
    significadoInvertido:
      "Cuidado con medir tu valor por tus ingresos; la prosperidad que te cuesta la salud o los afectos no es tal.",
    amor: "Una relación que prospera es la que se cuida como un jardín; dedica tiempo y atención, no solo intención.",
    trabajo: "Se abre un ciclo favorable para negociar, invertir o expandir; hazlo con números claros y sin prisa.",
  },
  {
    id: "angel-de-la-guia",
    nombre: "Ángel de la Guía",
    arcano: "mayor",
    numero: 30,
    elemento: "espiritu",
    palabrasClave: ["orientación", "señales", "mentor", "camino"],
    palabrasClaveInvertida: ["orientación", "señales", "mentor", "camino"],
    significado:
      "No estás perdido: estás en un tramo del camino donde las señales son más discretas. Presta atención a lo que se repite en tu entorno: una frase escuchada dos veces, un nombre que aparece, un consejo no pedido. Y si necesitas orientación humana, pídela sin vergüenza.",
    significadoInvertido:
      "Atención a la dependencia de guías externos; ninguna persona ni oráculo debe reemplazar tu propio discernimiento.",
    amor: "Alguien con experiencia puede darte una perspectiva valiosa sobre tu relación; escucha sin obligarte a obedecer.",
    trabajo: "Busca un mentor o acepta el consejo de quien ya recorrió el camino que quieres tomar.",
  },
  {
    id: "angel-de-la-esperanza",
    nombre: "Ángel de la Esperanza",
    arcano: "mayor",
    numero: 31,
    elemento: "espiritu",
    palabrasClave: ["amanecer", "ánimo", "futuro posible", "no rendirse"],
    palabrasClaveInvertida: ["amanecer", "ánimo", "futuro posible", "no rendirse"],
    significado:
      "La noche que atraviesas ya está más cerca del amanecer que del comienzo. La esperanza no es negar la dificultad, es recordar que has salido de cosas peores y que esta también pasará. Haz hoy una sola cosa que te acerque al futuro que quieres.",
    significadoInvertido:
      "Cuidado con la esperanza que espera sin actuar o que se aferra a lo que claramente ya terminó.",
    amor: "Si estás solo, el amor no ha terminado para ti; si estás en pareja, aún hay margen para reconstruir lo que se desgastó.",
    trabajo: "Un rechazo reciente no cierra el camino; la siguiente puerta se abre para quien sigue tocando.",
  },
  {
    id: "angel-de-la-disciplina",
    nombre: "Ángel de la Disciplina",
    arcano: "mayor",
    numero: 32,
    elemento: "tierra",
    palabrasClave: ["constancia", "hábito", "compromiso", "estructura"],
    palabrasClaveInvertida: ["constancia", "hábito", "compromiso", "estructura"],
    significado:
      "La motivación va y viene, pero el hábito se queda. Lo que quieres lograr no necesita un gran impulso sino veinte minutos diarios que no negocies contigo. La disciplina es la forma más concreta de amor propio: es cumplirte las promesas que te haces.",
    significadoInvertido:
      "Vigila la rigidez que se disfraza de disciplina; una estructura que no permite descanso ni error termina por romperse.",
    amor: "Los pequeños gestos constantes construyen más que las grandes declaraciones ocasionales.",
    trabajo: "Organiza tu semana con bloques de tiempo protegidos para lo importante, no solo para lo urgente.",
  },
  {
    id: "angel-de-la-ternura",
    nombre: "Ángel de la Ternura",
    arcano: "mayor",
    numero: 33,
    elemento: "agua",
    palabrasClave: ["suavidad", "cariño", "delicadeza", "cuidado amoroso"],
    palabrasClaveInvertida: ["suavidad", "cariño", "delicadeza", "cuidado amoroso"],
    significado:
      "Has estado tratándote y tratando a otros con más dureza de la necesaria. La ternura no es debilidad: es la fuerza que sabe cuándo bajar el tono. Abraza más, habla más despacio y permite que alguien te cuide sin sentir que debes devolver el favor.",
    significadoInvertido:
      "Cuidado con la ternura que evita las conversaciones necesarias; ser suave no significa dejar pasar lo que duele.",
    amor: "Un gesto de cariño sin motivo puede devolverle a la relación la calidez que la rutina le fue quitando.",
    trabajo: "Trata con delicadeza a quien está aprendiendo; la gente florece con orientación amable, no con presión.",
  },
  {
    id: "angel-de-la-aceptacion",
    nombre: "Ángel de la Aceptación",
    arcano: "mayor",
    numero: 34,
    elemento: "agua",
    palabrasClave: ["soltar la lucha", "paz con lo que es", "realidad", "serenidad"],
    palabrasClaveInvertida: ["soltar la lucha", "paz con lo que es", "realidad", "serenidad"],
    significado:
      "Hay una parte de tu vida que sigues peleando aunque ya no puedes cambiarla. Aceptar no es resignarse: es dejar de gastar energía en lo que no depende de ti para invertirla en lo que sí. La paz llega cuando dejas de exigirle a la realidad que sea otra.",
    significadoInvertido:
      "Atención a la aceptación que se convierte en conformismo; aceptar lo que es no significa renunciar a lo que puede mejorar.",
    amor: "Acepta a esa persona tal como es hoy, o acepta que no es lo que necesitas; lo que no funciona es esperar que cambie.",
    trabajo: "Deja de luchar contra las condiciones que no controlas y enfócate en lo que sí puedes mover dentro de ellas.",
  },
  {
    id: "angel-de-la-justicia",
    nombre: "Ángel de la Justicia",
    arcano: "mayor",
    numero: 35,
    elemento: "aire",
    palabrasClave: ["equidad", "reparación", "causa y efecto", "rectitud"],
    palabrasClaveInvertida: ["equidad", "reparación", "causa y efecto", "rectitud"],
    significado:
      "Lo que sembraste con integridad está regresando, y lo que otros sembraron contra ti también encontrará su cauce sin que tengas que vengarte. Actúa con rectitud aunque nadie te vea. La justicia tarda, pero es más precisa que el rencor.",
    significadoInvertido:
      "Cuidado con la sed de justicia que se vuelve obsesión por castigar; a veces la mayor reparación es seguir adelante.",
    amor: "Revisa si en la relación hay equidad en el dar y recibir; lo que es injusto tarde o temprano pasa factura.",
    trabajo: "Un asunto legal, contractual o de reconocimiento se resolverá a tu favor si tienes tus papeles y argumentos en orden.",
  },
  {
    id: "angel-del-renacimiento",
    nombre: "Ángel del Renacimiento",
    arcano: "mayor",
    numero: 36,
    elemento: "fuego",
    palabrasClave: ["resurgir", "transformación profunda", "nueva versión", "volver a nacer"],
    palabrasClaveInvertida: ["resurgir", "transformación profunda", "nueva versión", "volver a nacer"],
    significado:
      "Algo en ti murió en el último tiempo, y por eso sientes este vacío extraño. Pero de esas cenizas ya está brotando una versión tuya más honesta y más libre. No intentes volver a ser quien eras: esa piel ya no te queda.",
    significadoInvertido:
      "Vigila el renacimiento que se anuncia sin haber pasado el duelo; nacer de nuevo exige haber soltado de verdad lo anterior.",
    amor: "Llegas a esta etapa afectiva transformado; no repitas los patrones de antes con la persona de ahora.",
    trabajo: "Una reinvención profesional es posible; lo que aprendiste en el camino anterior no se pierde, se transforma.",
  },
  {
    id: "angel-de-la-amistad",
    nombre: "Ángel de la Amistad",
    arcano: "mayor",
    numero: 37,
    elemento: "aire",
    palabrasClave: ["compañía", "lealtad", "red de apoyo", "complicidad"],
    palabrasClaveInvertida: ["compañía", "lealtad", "red de apoyo", "complicidad"],
    significado:
      "Hay amigos que llevan tiempo esperando que los llames, y otros nuevos que están por entrar en tu vida. La amistad verdadera no exige presencia constante sino disponibilidad sincera. Cuida esos vínculos con la misma atención que le das al amor de pareja.",
    significadoInvertido:
      "Cuidado con las amistades que solo aparecen cuando necesitan algo o con ser tú quien solo llama en crisis.",
    amor: "La mejor relación de pareja tiene base de amistad; si falta complicidad, trabaja primero en ella.",
    trabajo: "Un contacto o amigo puede abrirte una puerta laboral; cultiva tu red con generosidad, no solo con interés.",
  },
  {
    id: "angel-del-desapego",
    nombre: "Ángel del Desapego",
    arcano: "mayor",
    numero: 38,
    elemento: "aire",
    palabrasClave: ["soltar expectativas", "libertad interior", "no aferrarse", "fluir"],
    palabrasClaveInvertida: ["soltar expectativas", "libertad interior", "no aferrarse", "fluir"],
    significado:
      "Tu sufrimiento no viene de lo que pasa sino de aferrarte a cómo querías que pasara. Desapegarte no es dejar de querer, es querer sin condicionar tu paz al resultado. Suelta la idea fija y observa cómo la situación respira.",
    significadoInvertido:
      "Atención al desapego que en realidad es frialdad o miedo a comprometerse; no involucrarse no es lo mismo que estar en paz.",
    amor: "Ama sin intentar controlar el rumbo de la relación; lo que es tuyo se queda sin que lo aprietes.",
    trabajo: "Suelta la expectativa sobre ese resultado o reconocimiento; haz tu trabajo bien y deja que el resto se acomode.",
  },
  {
    id: "angel-de-la-celebracion",
    nombre: "Ángel de la Celebración",
    arcano: "mayor",
    numero: 39,
    elemento: "fuego",
    palabrasClave: ["festejar", "logro", "reconocer avances", "compartir"],
    palabrasClaveInvertida: ["festejar", "logro", "reconocer avances", "compartir"],
    significado:
      "Has cruzado una meta y ya estás mirando la siguiente sin haber celebrado esta. Detente, brinda, cuéntaselo a alguien: lo que no se festeja se olvida y lo que se olvida no da fuerzas. Celebrar también es una forma de agradecer.",
    significadoInvertido:
      "Cuidado con celebrar antes de tiempo o con usar la fiesta para evitar lo que aún está pendiente.",
    amor: "Organiza algo especial con tu pareja o con quien amas; los buenos momentos compartidos son el ahorro de la relación.",
    trabajo: "Reconoce públicamente los logros del equipo y los tuyos; la moral alta produce más que la exigencia constante.",
  },
  {
    id: "angel-de-la-sabiduria",
    nombre: "Ángel de la Sabiduría",
    arcano: "mayor",
    numero: 40,
    elemento: "espiritu",
    palabrasClave: ["discernimiento", "experiencia", "perspectiva", "conocimiento vivido"],
    palabrasClaveInvertida: ["discernimiento", "experiencia", "perspectiva", "conocimiento vivido"],
    significado:
      "Ya sabes lo que tienes que hacer; lo que te falta no es información sino el valor de aplicarla. La sabiduría no es acumular respuestas, es reconocer cuáles preguntas ya no vale la pena seguir haciéndose. Mira tu situación desde diez años en el futuro y decide desde ahí.",
    significadoInvertido:
      "Vigila el saber que se vuelve soberbia; la persona sabia sigue aprendiendo de quien menos espera.",
    amor: "Aplica lo que aprendiste en relaciones anteriores sin castigar a la persona actual por errores ajenos.",
    trabajo: "Tu experiencia es tu mayor activo; compártela con generosidad y también escucha a los más nuevos.",
  },
  {
    id: "angel-de-la-fortaleza",
    nombre: "Ángel de la Fortaleza",
    arcano: "mayor",
    numero: 41,
    elemento: "fuego",
    palabrasClave: ["resistencia", "firmeza", "aguante", "fuerza interior"],
    palabrasClaveInvertida: ["resistencia", "firmeza", "aguante", "fuerza interior"],
    significado:
      "Eres más fuerte de lo que crees: la prueba es que sigues aquí después de todo lo que has atravesado. La fortaleza no es no caer sino saber cómo levantarse cada vez con menos vergüenza. Apóyate en tu historia cuando dudes de tu capacidad.",
    significadoInvertido:
      "Cuidado con la fortaleza que no permite pedir ayuda; ser fuerte todo el tiempo es otra forma de estar solo.",
    amor: "Mantente firme en lo que mereces aunque la soledad presione; ceder por miedo no es amor, es cansancio.",
    trabajo: "Resiste la presión sin perder tu criterio; esta etapa difícil está formando la solidez que después te distinguirá.",
  },
  {
    id: "angel-de-la-presencia",
    nombre: "Ángel de la Presencia",
    arcano: "mayor",
    numero: 42,
    elemento: "tierra",
    palabrasClave: ["aquí y ahora", "atención plena", "habitar el momento", "conexión"],
    palabrasClaveInvertida: ["aquí y ahora", "atención plena", "habitar el momento", "conexión"],
    significado:
      "Vives entre el pasado que lamentas y el futuro que temes, y te pierdes el único lugar donde algo puede cambiar: ahora. Siente tus pies en el suelo, tu respiración, la conversación que tienes enfrente. La vida no está esperándote más adelante; está ocurriendo.",
    significadoInvertido:
      "Atención al presente que se usa para no planear nada; vivir el momento no exime de prepararse para mañana.",
    amor: "Deja el teléfono y mira a esa persona a los ojos; la atención completa es el regalo más escaso hoy en día.",
    trabajo: "Haz una sola tarea a la vez; la dispersión te cuesta más tiempo del que crees ganar.",
  },
  {
    id: "angel-de-la-union",
    nombre: "Ángel de la Unión",
    arcano: "mayor",
    numero: 43,
    elemento: "agua",
    palabrasClave: ["alianza", "comunidad", "juntos", "cooperación"],
    palabrasClaveInvertida: ["alianza", "comunidad", "juntos", "cooperación"],
    significado:
      "Lo que intentas resolver solo se resuelve mejor en compañía. Pide ayuda, forma alianzas, únete a quienes comparten tu propósito: la fuerza colectiva no te resta mérito, lo multiplica. Hay alguien esperando que lo invites a colaborar.",
    significadoInvertido:
      "Cuidado con la unión que exige renunciar a tu voz; estar juntos no debería significar diluirse.",
    amor: "Es tiempo de construir en equipo, de acuerdos y proyectos compartidos; el vínculo pide compromiso mutuo.",
    trabajo: "Una sociedad, un equipo nuevo o una colaboración inesperada te llevará más lejos que el esfuerzo individual.",
  },
  {
    id: "angel-de-la-luz",
    nombre: "Ángel de la Luz",
    arcano: "mayor",
    numero: 44,
    elemento: "espiritu",
    palabrasClave: ["iluminación", "esclarecer", "brillar", "fin de la oscuridad"],
    palabrasClaveInvertida: ["iluminación", "esclarecer", "brillar", "fin de la oscuridad"],
    significado:
      "Lo que estaba en penumbra se ilumina y te muestra que el camino era más simple de lo que temías. No escondas tu brillo para que otros se sientan cómodos: tu luz no apaga la de nadie. Comparte lo que sabes, lo que sientes y lo que eres.",
    significadoInvertido:
      "Vigila la luz que ciega en lugar de mostrar; el exceso de optimismo puede impedirte ver lo que sí requiere atención.",
    amor: "Muéstrate tal como eres, sin disminuirte; quien merece estar contigo se sentirá atraído por tu autenticidad.",
    trabajo: "Es tu momento de tomar visibilidad: presenta tu trabajo, expón tus ideas y acepta el lugar que has ganado.",
  },
];
