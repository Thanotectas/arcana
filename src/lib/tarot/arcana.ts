import type { CartaTarot } from "./deck";

/**
 * Tarot Arcana: Los 22 Umbrales. Mazo propio de Arcana con 22 arcanos
 * mayores reinterpretados (cada uno equivale a un arcano clásico y conserva
 * su número, así las tiradas y la tradición siguen funcionando). Cada carta
 * es un umbral: un momento de paso en la vida de la persona. Ilustraciones
 * propias en public/cartas/arcana.
 */
export const TAROT_ARCANA: CartaTarot[] = [
  {
    id: "el-viajero",
    nombre: "El Viajero",
    arcano: "mayor",
    numero: 0,
    elemento: "aire",
    palabrasClave: ["comienzo", "confianza", "ligereza", "primer paso", "asombro"],
    palabrasClaveInvertida: ["huida", "imprudencia", "miedo a empezar", "dispersión"],
    significado:
      "El Viajero está a punto de dar el primer paso sobre un puente de estrellas que todavía no sabe si lo sostendrá. Es la carta del comienzo que no pide garantías: lo que te llama vale más que lo que te retiene. Lleva poco equipaje y la mirada abierta; el camino se hará al andar. Si llevas tiempo esperando la señal, esta es.",
    significadoInvertido:
      "Invertido, el paso se convierte en salto al vacío o en parálisis frente al borde. Pregúntate si estás empezando algo para no quedarte con lo que ya tienes, o si has convertido la prudencia en excusa. Un paso pequeño y consciente vale más que un gran salto con los ojos cerrados.",
    amor: "Una historia nueva o una etapa fresca te invita a conocer sin exigir certezas; la curiosidad abre más puertas que el control.",
    trabajo: "Buen momento para emprender, cambiar de rumbo o aceptar lo que te saca de la rutina, aunque todavía no tengas el plan completo.",
  },
  {
    id: "el-alquimista",
    nombre: "El Alquimista",
    arcano: "mayor",
    numero: 1,
    elemento: "fuego",
    palabrasClave: ["recursos", "voluntad", "capacidad", "concentración", "manifestar"],
    palabrasClaveInvertida: ["talento desaprovechado", "manipulación", "dudar de uno mismo", "dispersión"],
    significado:
      "El Alquimista une los cuatro elementos en una sola esfera de luz: tiene todo lo que necesita y, sobre todo, lo sabe. Esta carta te recuerda que los recursos ya están en tus manos, aunque los veas sueltos. Lo que falta no es más herramientas sino la decisión de combinarlas con intención. Es momento de hacer, no de seguir preparándote.",
    significadoInvertido:
      "Invertido, el Alquimista duda de su propio poder o lo usa para aparentar. Puede señalar un talento que no se atreve a mostrarse, o un ingenio puesto al servicio de convencer en lugar de crear. Vuelve a lo esencial: qué quieres hacer de verdad y con qué cuentas hoy.",
    amor: "Tienes la capacidad de transformar la relación con pequeños actos concretos; la intención clara vale más que las grandes promesas.",
    trabajo: "Tus habilidades están listas para combinarse en algo nuevo; presenta tu idea, pide ese proyecto, muestra lo que sabes hacer.",
  },
  {
    id: "la-sibila",
    nombre: "La Sibila",
    arcano: "mayor",
    numero: 2,
    elemento: "agua",
    palabrasClave: ["intuición", "silencio", "saber interior", "misterio", "espera fértil"],
    palabrasClaveInvertida: ["secretos que pesan", "intuición ignorada", "superficialidad", "desconexión"],
    significado:
      "La Sibila guarda un libro cerrado que brilla: sabe algo que todavía no dice, y te invita a hacer lo mismo. No es momento de actuar sino de escuchar lo que ya intuyes. Entre las dos lunas, la respuesta está madurando en silencio. Confía en lo que percibes aunque no puedas demostrarlo todavía.",
    significadoInvertido:
      "Invertida, la Sibila señala una intuición acallada por el ruido o un secreto que ya cuesta sostener. Quizá estás pidiendo opiniones para no oír la tuya. Baja el volumen de afuera, vuelve a tu propio criterio y, si hay algo que callas, pregúntate a quién protege ese silencio.",
    amor: "Hay algo que aún no se dice entre los dos; escucha más de lo que hablas y deja que la verdad aparezca a su ritmo.",
    trabajo: "Antes de decidir, observa: hay información que todavía no está sobre la mesa y tu instinto ya la está captando.",
  },
  {
    id: "el-jardin",
    nombre: "El Jardín",
    arcano: "mayor",
    numero: 3,
    elemento: "tierra",
    palabrasClave: ["abundancia", "cuidado", "crecimiento", "creatividad", "placer"],
    palabrasClaveInvertida: ["descuido", "dependencia", "bloqueo creativo", "exceso"],
    significado:
      "En el Jardín todo crece porque alguien lo cuida con gozo. Esta carta habla de lo que florece cuando dejas de forzar y empiezas a nutrir: un proyecto, un vínculo, tu propio cuerpo. Es un umbral de fertilidad en el sentido más amplio: ideas, afectos y frutos. Disfruta lo que ya está dando flor y riega lo que apenas asoma.",
    significadoInvertido:
      "Invertido, el Jardín se seca por descuido o se ahoga por exceso de riego. Puede indicar que te das a los demás hasta vaciarte, o que has dejado de cuidar algo que importa. Vuelve a lo básico: descanso, alimento, belleza, tiempo sin exigencias.",
    amor: "Un vínculo que crece con ternura y presencia; cuida los gestos cotidianos, ahí está la abundancia.",
    trabajo: "Lo que sembraste empieza a dar fruto; es momento de crear, expandir y rodearte de lo que te inspira.",
  },
  {
    id: "el-guardian",
    nombre: "El Guardián",
    arcano: "mayor",
    numero: 4,
    elemento: "fuego",
    palabrasClave: ["estructura", "protección", "liderazgo", "estabilidad", "responsabilidad"],
    palabrasClaveInvertida: ["rigidez", "control", "autoritarismo", "falta de límites"],
    significado:
      "El Guardián se planta en la cima con la capa al viento y un sol cuadrado detrás: su fuerza es la de quien da forma y sostiene. Esta carta pide orden, límites claros y la madurez de hacerte cargo. No es el momento de improvisar sino de construir cimientos que aguanten. Protege lo que vale y dirige con firmeza serena.",
    significadoInvertido:
      "Invertido, la estructura se vuelve jaula: control excesivo, rigidez o una autoridad que no escucha. También puede señalar lo contrario, la falta de límites que deja todo a la deriva. Pregúntate si estás sosteniendo o aplastando, y si las reglas sirven a las personas o al revés.",
    amor: "Compromiso, estabilidad y protección; cuida que la firmeza no se convierta en imponer tu manera de hacer las cosas.",
    trabajo: "Toma las riendas: organiza, pon límites y lidera con claridad. Tu solidez es lo que el momento necesita.",
  },
  {
    id: "el-maestro",
    nombre: "El Maestro",
    arcano: "mayor",
    numero: 5,
    elemento: "tierra",
    palabrasClave: ["aprendizaje", "transmisión", "tradición", "guía", "valores"],
    palabrasClaveInvertida: ["dogma", "rebeldía sin rumbo", "consejos que no sirven", "conformismo"],
    significado:
      "El Maestro entrega una llave de luz a quien está lista para recibirla. Esta carta habla de lo que se aprende de quienes ya pasaron por ahí: una enseñanza, una tradición, un consejo que llega en el momento justo. También puede señalar que eres tú quien tiene algo que transmitir. Busca a tu maestro, o reconoce que ya lo eres.",
    significadoInvertido:
      "Invertido, el Maestro se convierte en dogma o en rebeldía vacía. Quizá sigues reglas que ya no entiendes, o rechazas toda guía por principio. Revisa qué enseñanzas heredaste y cuáles son realmente tuyas; la llave sirve solo si abre tu puerta.",
    amor: "Los valores compartidos sostienen la relación; conversar sobre lo que cada uno aprendió del amor abre más que cualquier gesto.",
    trabajo: "Formación, mentoría o un consejo experto marcan la diferencia ahora; también puedes ser quien enseñe.",
  },
  {
    id: "el-encuentro",
    nombre: "El Encuentro",
    arcano: "mayor",
    numero: 6,
    elemento: "aire",
    palabrasClave: ["elección", "amor", "unión", "afinidad", "coherencia"],
    palabrasClaveInvertida: ["indecisión", "desencuentro", "elegir por miedo", "conflicto de valores"],
    significado:
      "Bajo el eclipse, dos auras se funden en una sola luz. El Encuentro habla del amor que reconoce, pero también de la elección que lo hace posible: elegir a alguien, elegir un camino, elegirte. Es un umbral de coherencia entre lo que sientes y lo que haces. Lo que decidas con el corazón alineado tendrá raíz.",
    significadoInvertido:
      "Invertido, la unión se tensa o la elección se posterga. Puede señalar un vínculo donde los valores ya no coinciden, o una decisión tomada por miedo a perder en lugar de por deseo de ganar. Vuelve a preguntarte qué quieres de verdad, no qué te asusta menos.",
    amor: "Un encuentro significativo o la confirmación de un vínculo; la relación pide una elección consciente, no la inercia.",
    trabajo: "Una alianza o una decisión entre dos caminos; elige lo que resuene con tus valores, no solo con la conveniencia.",
  },
  {
    id: "el-impulso",
    nombre: "El Impulso",
    arcano: "mayor",
    numero: 7,
    elemento: "agua",
    palabrasClave: ["dirección", "voluntad", "avance", "determinación", "victoria"],
    palabrasClaveInvertida: ["falta de rumbo", "fuerzas opuestas", "agresividad", "estancamiento"],
    significado:
      "Sobre un cometa, con las riendas de dos caballos de luz que tiran en direcciones distintas, el Impulso avanza igual. Esta carta habla de voluntad y de dirección: no de ausencia de conflicto, sino de la capacidad de conducirlo. Tienes la energía y el rumbo; ahora mantén el pulso firme y no te detengas a mitad del cielo.",
    significadoInvertido:
      "Invertido, los caballos tiran cada uno hacia un lado y el carro gira en círculos. Señala dispersión, impaciencia o una fuerza que se descarga contra otros en lugar de hacia adelante. Antes de acelerar, define el destino; sin rumbo, el impulso solo agota.",
    amor: "La relación avanza si los dos tiran en la misma dirección; conversa sobre hacia dónde van antes de apretar el paso.",
    trabajo: "Momento de empuje y resultados: define el objetivo, concentra la energía y conduce el proyecto hasta el final.",
  },
  {
    id: "la-serena",
    nombre: "La Serena",
    arcano: "mayor",
    numero: 8,
    elemento: "fuego",
    palabrasClave: ["fuerza interior", "ternura", "paciencia", "coraje tranquilo", "dominio de sí"],
    palabrasClaveInvertida: ["inseguridad", "impulsos desbordados", "dureza", "agotamiento"],
    significado:
      "La Serena acaricia a un león hecho de constelaciones y el león cierra los ojos. Esta carta habla de la fuerza que no necesita gritar: la que calma, sostiene y persiste. Tu poder está en la paciencia y en la ternura contigo misma, no en la dureza. Lo que hoy ruge dentro de ti se amansa con presencia, no con látigo.",
    significadoInvertido:
      "Invertida, la Serena pierde el pulso: los impulsos se desbordan o, al contrario, la confianza se desmorona. Puede señalar que te exiges una fortaleza impostada mientras por dentro estás agotada. La verdadera fuerza incluye pedir ayuda y descansar.",
    amor: "Suavidad y firmeza a la vez; la relación mejora cuando bajas la guardia sin perder tu centro.",
    trabajo: "Una situación tensa se resuelve con calma y constancia; no reacciones, acompaña el proceso y mantén tu criterio.",
  },
  {
    id: "la-linterna",
    nombre: "La Linterna",
    arcano: "mayor",
    numero: 9,
    elemento: "tierra",
    palabrasClave: ["introspección", "soledad fértil", "búsqueda", "sabiduría", "pausa"],
    palabrasClaveInvertida: ["aislamiento", "rechazo a la ayuda", "rumiación", "soledad que duele"],
    significado:
      "La Linterna alza una luz que es una estrella y mira hacia adentro antes de seguir el sendero. Esta carta pide retirarse un poco: menos ruido, menos consejos, más tiempo contigo. No es huida sino búsqueda. Lo que necesitas saber no está en la próxima conversación sino en el silencio que llevas tiempo evitando.",
    significadoInvertido:
      "Invertida, la pausa se convierte en encierro. Puede indicar que la soledad dejó de ser elegida, que das vueltas a lo mismo sin avanzar o que rechazas una mano que se tiende. La linterna sirve para ver el camino, no para quedarse en la cueva.",
    amor: "Un tiempo a solas aclara qué quieres de un vínculo; si estás en pareja, el espacio propio no es distancia sino aire.",
    trabajo: "Antes de la siguiente decisión, retírate a pensar; la claridad vendrá de revisar tu camino, no de más reuniones.",
  },
  {
    id: "la-rueda-del-cielo",
    nombre: "La Rueda del Cielo",
    arcano: "mayor",
    numero: 10,
    elemento: "fuego",
    palabrasClave: ["ciclos", "cambio", "oportunidad", "destino", "giro"],
    palabrasClaveInvertida: ["resistencia al cambio", "mala racha", "repetir el ciclo", "sentirse a merced"],
    significado:
      "La gran rueda zodiacal gira entre nubes de colores y alguien pequeño la contempla con asombro. Esta carta anuncia un giro: lo que estaba abajo sube, lo que parecía fijo se mueve. No controlas la rueda, pero sí cómo te subes a ella. Aprovecha la oportunidad que trae el cambio y recuerda que todo ciclo tiene su tiempo.",
    significadoInvertido:
      "Invertida, la Rueda señala resistencia a un cambio que ya está ocurriendo, o la sensación de que todo se repite. Pregúntate qué patrón vuelve una y otra vez y qué parte te toca cambiar. La racha difícil también gira, pero más rápido si dejas de aferrarte.",
    amor: "Un cambio de etapa en la relación o un encuentro inesperado; acepta el movimiento en lugar de aferrarte a cómo era.",
    trabajo: "Oportunidades que llegan por un giro externo; estate atento a lo que se mueve y actúa cuando la rueda te favorezca.",
  },
  {
    id: "la-balanza",
    nombre: "La Balanza",
    arcano: "mayor",
    numero: 11,
    elemento: "aire",
    palabrasClave: ["equilibrio", "verdad", "responsabilidad", "claridad", "consecuencias"],
    palabrasClaveInvertida: ["injusticia", "autoengaño", "evitar responsabilidades", "juicio severo"],
    significado:
      "La Balanza sostiene los platillos en perfecto equilibrio y una espada vertical de luz: ve claro y nombra lo que ve. Esta carta habla de causa y efecto, de mirar tu situación con honestidad y de hacerte cargo de tu parte. Cada acto tiene su eco. Si buscas una decisión justa, empieza por ser justa contigo.",
    significadoInvertido:
      "Invertida, la Balanza se inclina por autoengaño o por un juicio demasiado duro, hacia ti o hacia otros. Puede señalar una situación desequilibrada que te cuesta aceptar o una responsabilidad que estás evitando. La verdad incómoda pesa menos que la mentira cómoda.",
    amor: "Equilibrio entre dar y recibir; una conversación honesta pone en orden lo que estaba inclinado.",
    trabajo: "Decisiones, contratos y acuerdos salen bien si eres clara y rigurosa; revisa que lo que firmas sea justo para todos.",
  },
  {
    id: "el-suspendido",
    nombre: "El Suspendido",
    arcano: "mayor",
    numero: 12,
    elemento: "agua",
    palabrasClave: ["pausa", "nueva perspectiva", "entrega", "soltar", "espera consciente"],
    palabrasClaveInvertida: ["estancamiento", "sacrificio inútil", "resistirse", "victimismo"],
    significado:
      "El Suspendido flota cabeza abajo, en calma, con la luna como halo. No está atrapado: está mirando el mundo desde otro ángulo. Esta carta pide detenerse y aceptar una pausa que no elegiste, porque trae una perspectiva que no tendrías de otro modo. Lo que parece pérdida de tiempo es un cambio de mirada.",
    significadoInvertido:
      "Invertido, la pausa se vuelve estancamiento y la entrega, sacrificio sin sentido. Puede indicar que esperas algo que no va a llegar por sí solo, o que te sostienes en el papel de víctima. Pregúntate qué estás evitando soltar y qué te costaría bajar de la rama.",
    amor: "La relación necesita una pausa para verse con otros ojos; no fuerces respuestas, deja que el tiempo las madure.",
    trabajo: "Un proyecto detenido o una espera obligada; úsala para replantear el enfoque en lugar de luchar contra ella.",
  },
  {
    id: "la-metamorfosis",
    nombre: "La Metamorfosis",
    arcano: "mayor",
    numero: 13,
    elemento: "agua",
    palabrasClave: ["transformación", "final", "renacer", "desprendimiento", "cambio profundo"],
    palabrasClaveInvertida: ["aferrarse", "miedo al cambio", "transición bloqueada", "duelo que no termina"],
    significado:
      "Una mujer sale de una crisálida de estrellas mientras unas alas enormes se despliegan en su espalda. La Metamorfosis no habla de muerte sino de lo que muere para que algo nazca: una etapa, una identidad, una forma de vivir. Es un umbral definitivo. Lo que dejas atrás no vuelve, y por eso puedes convertirte en lo que sigue.",
    significadoInvertido:
      "Invertida, la crisálida no se abre: miedo al cambio, apego a lo que ya terminó o un duelo que se estira. Señala una transformación necesaria que estás posponiendo. No es cuestión de valor sino de aceptar que la forma anterior ya no te sirve.",
    amor: "Una relación termina o cambia de piel por completo; lo que sobrevive a la transformación será más verdadero.",
    trabajo: "Cierre de un ciclo laboral o cambio radical de rumbo; no intentes salvar lo que ya terminó, prepara lo que viene.",
  },
  {
    id: "el-rio",
    nombre: "El Río",
    arcano: "mayor",
    numero: 14,
    elemento: "fuego",
    palabrasClave: ["equilibrio", "paciencia", "integración", "mesura", "fluir"],
    palabrasClaveInvertida: ["excesos", "impaciencia", "desequilibrio", "fuerzas en pugna"],
    significado:
      "Con un pie en el agua y otro en la tierra, el Río vierte luz de una copa a otra sin derramar una gota. Esta carta habla de mezclar sin prisa: razón y emoción, trabajo y descanso, lo tuyo y lo del otro. El equilibrio no es un punto fijo sino un movimiento constante. Da tiempo a que las cosas se integren.",
    significadoInvertido:
      "Invertido, el agua se derrama: excesos, impaciencia o una vida partida en pedazos que no se tocan. Puede señalar que corres cuando deberías medir, o que vives en extremos para no sentir el medio. Vuelve al ritmo del río: constante, sin violencia, sin pausa.",
    amor: "La relación florece con paciencia y ajustes mutuos; combina las diferencias en lugar de pelearlas.",
    trabajo: "Avanza con método y moderación; el proyecto necesita integrar partes distintas más que acelerar una sola.",
  },
  {
    id: "la-sombra",
    nombre: "La Sombra",
    arcano: "mayor",
    numero: 15,
    elemento: "tierra",
    palabrasClave: ["ataduras", "deseo", "dependencia", "lo no reconocido", "liberación"],
    palabrasClaveInvertida: ["romper cadenas", "tomar conciencia", "recuperar el poder", "desintoxicar"],
    significado:
      "Las cadenas de humo ya se deshacen y una luz cálida nace detrás. La Sombra muestra aquello que te ata y que, en el fondo, tú misma sostienes: un hábito, una dependencia, un miedo disfrazado de deseo. No es una carta de castigo sino de reconocimiento. Mirar lo que te encadena es el primer movimiento para soltarlo.",
    significadoInvertido:
      "Invertida, la Sombra anuncia la liberación: una cadena que se rompe, una dependencia que se nombra, un poder que recuperas. Puede ser incómodo al principio porque la atadura también daba seguridad. Celebra el alivio y no vuelvas a recoger lo que acabas de soltar.",
    amor: "Revisa si el vínculo es deseo o dependencia; la pasión que ata sin dejar respirar pide una conversación honesta.",
    trabajo: "Un empleo o un compromiso que te retiene por miedo más que por convicción; identifica qué te ata y qué ganarías soltándolo.",
  },
  {
    id: "el-relampago",
    nombre: "El Relámpago",
    arcano: "mayor",
    numero: 16,
    elemento: "fuego",
    palabrasClave: ["ruptura", "revelación", "liberación súbita", "verdad", "derrumbe necesario"],
    palabrasClaveInvertida: ["evitar lo inevitable", "crisis prolongada", "miedo al cambio", "reconstrucción"],
    significado:
      "Un rayo dorado parte la torre de cristal y dos personas saltan con los brazos abiertos mientras caen semillas de luz. El Relámpago trae una verdad que irrumpe de golpe y derriba lo que estaba construido sobre una base falsa. Duele, pero libera. Lo que cae no era sólido; lo que queda en pie es lo que importa.",
    significadoInvertido:
      "Invertido, el derrumbe se retrasa a costa de vivir en una estructura que ya cruje. Puede señalar una crisis que se alarga por miedo a mirarla, o el inicio de la reconstrucción tras el golpe. Deja caer lo que ya no aguanta; cuanto antes, más semillas quedan para sembrar.",
    amor: "Una revelación cambia la relación de golpe; lo que sobrevive a la verdad tiene futuro, lo que no, ya no lo tenía.",
    trabajo: "Un cambio brusco, una estructura que cae o una noticia inesperada; aprovecha la sacudida para reconstruir sobre lo real.",
  },
  {
    id: "la-estrella",
    nombre: "La Estrella",
    arcano: "mayor",
    numero: 17,
    elemento: "aire",
    palabrasClave: ["esperanza", "sanación", "inspiración", "confianza", "serenidad"],
    palabrasClaveInvertida: ["desánimo", "falta de fe", "desconexión", "esperanza postergada"],
    significado:
      "Una mujer en calma vierte agua de dos cántaros junto a un lago que refleja una gran estrella. Después de la tormenta llega esta carta: no promete que todo esté resuelto, promete que vale la pena seguir. Es un umbral de sanación y de inspiración renovada. Lo que creías perdido vuelve a tener luz.",
    significadoInvertido:
      "Invertida, la Estrella señala una fe que se apaga o una esperanza que pospones por miedo a decepcionarte. Puede indicar agotamiento emocional o desconexión de lo que te inspira. No hace falta creer en todo; basta con mirar la estrella un momento cada día.",
    amor: "Una etapa de calma y renovación en el vínculo; si hubo heridas, ahora pueden sanar con honestidad y ternura.",
    trabajo: "Inspiración y confianza renovada en un proyecto; cree en lo que haces y comparte tu visión sin pudor.",
  },
  {
    id: "la-luna",
    nombre: "La Luna",
    arcano: "mayor",
    numero: 18,
    elemento: "agua",
    palabrasClave: ["intuición", "incertidumbre", "sueños", "lo oculto", "emociones profundas"],
    palabrasClaveInvertida: ["claridad que vuelve", "miedos que se disipan", "engaño revelado", "confusión"],
    significado:
      "Bajo una luna enorme, alguien avanza con cautela por un sendero entre dos torres, con un lobo y un perro de luz a cada lado. La Luna habla de lo que no se ve claro: miedos, sueños, intuiciones y espejismos. No todo es lo que parece. Camina despacio, confía en lo que sientes y desconfía de lo que te asusta demasiado.",
    significadoInvertido:
      "Invertida, la Luna anuncia que la niebla se levanta: un miedo pierde fuerza, un engaño sale a la luz, una confusión se ordena. También puede señalar que ignoras señales de tu propio inconsciente. Escribe tus sueños, escucha tu cuerpo: ahí está la claridad.",
    amor: "Hay emociones no dichas o una confusión que pide paciencia; no decidas desde el miedo ni desde la fantasía.",
    trabajo: "Información incompleta o intenciones poco claras; espera a tener luz antes de comprometerte y confía en tu olfato.",
  },
  {
    id: "el-sol",
    nombre: "El Sol",
    arcano: "mayor",
    numero: 19,
    elemento: "fuego",
    palabrasClave: ["alegría", "claridad", "éxito", "vitalidad", "autenticidad"],
    palabrasClaveInvertida: ["alegría apagada", "ego", "retraso del éxito", "pesimismo"],
    significado:
      "Un niño ríe a carcajadas con los brazos abiertos frente a un sol de rayos de colores. El Sol es la carta más clara del mazo: lo que estaba oscuro se ilumina, lo que dudabas se confirma, lo que haces con alegría prospera. Es un umbral de vitalidad y de verdad sin adornos. Permítete celebrar sin esperar a que algo falle.",
    significadoInvertido:
      "Invertido, el Sol brilla pero no lo sientes: alegría apagada, éxito que se retrasa o un ego que confunde brillar con eclipsar a otros. Pregúntate qué te impide disfrutar de lo que ya tienes. La luz sigue ahí; a veces solo hace falta salir de la sombra en la que te quedaste.",
    amor: "Felicidad compartida, claridad y calor; una relación que se muestra tal como es y crece a plena luz.",
    trabajo: "Reconocimiento, resultados visibles y energía para seguir; muestra tu trabajo con orgullo y disfruta el logro.",
  },
  {
    id: "el-despertar",
    nombre: "El Despertar",
    arcano: "mayor",
    numero: 20,
    elemento: "fuego",
    palabrasClave: ["llamada", "renacimiento", "balance", "perdón", "propósito"],
    palabrasClaveInvertida: ["juicio severo", "negarse a la llamada", "culpa", "dudas sobre el propósito"],
    significado:
      "Una trompeta hecha de estrellas suena desde una nube y varias personas se elevan con el rostro vuelto hacia la luz. El Despertar es la llamada que ya escuchaste y todavía no has respondido: un propósito, una vocación, una reconciliación contigo o con tu historia. Es momento de hacer balance y de levantarte. Lo que fuiste no te condena; te preparó.",
    significadoInvertido:
      "Invertido, el Despertar se vuelve juicio severo o sordera voluntaria. Puede indicar culpa que no deja avanzar, o una llamada que ignoras porque responder implicaría cambiar. Perdónate lo que haga falta y escucha: la trompeta no deja de sonar porque mires a otro lado.",
    amor: "Una segunda oportunidad o una reconciliación; perdonar y dejarse perdonar abre una etapa nueva.",
    trabajo: "Tu vocación llama con claridad; evalúa tu trayectoria con honestidad y da el paso hacia lo que te da sentido.",
  },
  {
    id: "el-cosmos",
    nombre: "El Cosmos",
    arcano: "mayor",
    numero: 21,
    elemento: "tierra",
    palabrasClave: ["plenitud", "culminación", "integración", "logro", "viaje completo"],
    palabrasClaveInvertida: ["falta de cierre", "incompleto", "miedo a terminar", "último esfuerzo"],
    significado:
      "Una mujer danza dentro de un anillo de galaxias con los cuatro elementos en las esquinas. El Cosmos es la plenitud del ciclo: lo que empezó con el Viajero llega a su forma completa. Habla de logros, de integración y de sentirse en casa en el mundo. Celebra lo que has recorrido y prepárate, porque toda culminación es también la víspera de un nuevo comienzo.",
    significadoInvertido:
      "Invertido, el Cosmos señala un ciclo que no termina de cerrarse: falta un paso, un cabo suelto, o el miedo a acabar porque terminar también es despedirse. Revisa qué queda pendiente y hazlo. La plenitud no llega sola; se completa.",
    amor: "Plenitud en el vínculo o la llegada de un amor que se siente como hogar; disfruta la completitud sin temer que se acabe.",
    trabajo: "Culminación de un proyecto, reconocimiento o expansión; cierra bien este ciclo antes de abrir el siguiente.",
  },
];
