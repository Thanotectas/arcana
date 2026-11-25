import type { Curso } from "../tipos";

/**
 * Curso piloto: «7 días para cerrar el año». Una lección por día; cada una se apoya en una lectura que ya existe en
 * Arcana (vaso, vela, taza, tarot). Desde adentro de la tradición, sin promesas de resultados, salud ni dinero.
 *
 * Cada lección: saludo personal, video, la tradición (texto), una cita, tarjetas de saber, «así se vive en el mundo»,
 * el ritual guiado (apertura, guía meditativa por paso y cierre, en la voz de Sibila), la foto para Sibila y las
 * preguntas. Los guiones de voz usan «…» para las pausas.
 */
export const CURSO_RITUALES: Curso = {
  slug: "rituales",
  titulo: "7 días para cerrar el año",
  subtitulo: "Tu iniciación en los rituales, con Sibila",
  descripcion:
    "Un ritual por día para despedir el año con intención: preparar tu espacio, limpiar, encender la vela correcta, soltar lo que pesa, agradecer y sembrar lo que viene. Cada lección trae un video de Sibila, la historia de la tradición y cómo se vive en el mundo, un ritual guiado con su voz, unas preguntas para ti y, cuando hay foto, Sibila te lee lo que quedó.",
  promesas: [
    "7 lecciones de 20 a 30 minutos, una por día",
    "Rituales de Latinoamérica, Turquía, el mundo árabe, Irán, el Mediterráneo y Asia",
    "Cada ritual, guiado por la voz de Sibila como una meditación",
    "Sibila lee tu vaso, tu vela, tu taza y tu tirada (lecturas incluidas)",
    "Siete llaves, una por día: de Aprendiz a Maestra o Maestro de rituales del Primer Círculo",
    "Tu grimorio y, al final, tu carta de cierre de ciclo",
  ],
  portada: "/escuela/rituales.jpg",
  costo: 20,
  costoFundadores: 15, // = paquete Buscador (24.900 COP / 5,99 USD), aprobado el 25 de noviembre
  creditosIncluidos: 10,
  abierto: false,
  horasEntreLecciones: 16,
  lecciones: [
    // ───────────────────────────── DÍA 1 ─────────────────────────────
    {
      numero: 1,
      llave: { nombre: "Llave del Altar", simbolo: "🕯️", saber: "Preparar un espacio sagrado y nombrar una intención." },
      luna: "🌑",
      saludo: "{nombre}, hoy empieza tu cierre de año. Antes de encender nada, vamos a preparar el lugar donde va a pasar todo.",
      titulo: "Qué es un ritual: intención, espacio y momento",
      resumen: "Qué convierte un gesto en ritual, cómo lo viven distintas culturas y tu altar para estos siete días.",
      minutos: 25,
      bloques: [
        { tipo: "video", titulo: "Sibila te da la bienvenida", src: "/escuela/rituales/dia-1.mp4", poster: "/escuela/rituales/dia-1.jpg" },
        {
          tipo: "texto",
          titulo: "Un gesto con intención",
          parrafos: [
            "Encender una vela para alumbrar la cocina no es un ritual. Encenderla pensando en alguien, en silencio, a la misma hora cada noche, sí lo es. Lo que convierte un gesto en ritual no es el objeto: es la intención, el espacio y el momento.",
            "La intención es lo que pides, lo que agradeces o lo que sueltas, dicho con tus palabras. El espacio es el lugar que separas del resto de la casa, aunque sea una esquina de la mesa. El momento es el cuándo: un día de la semana, una fase de la Luna, el final de un año. Todas las tradiciones que vamos a recorrer —de Latinoamérica a Turquía, del Magreb al Mediterráneo— tienen estas tres piezas, aunque las llamen distinto.",
            "Los rituales acompañan a la humanidad desde siempre porque marcan los pasos importantes: un nacimiento, una boda, una despedida, el final de un año. Nos ayudan a decir con el cuerpo lo que a veces no sabemos decir con palabras.",
            "Durante estos siete días vamos a cerrar el año. No para olvidar lo que pasó, sino para mirarlo, agradecerlo y decidir qué te llevas al año que viene.",
          ],
        },
        { tipo: "cita", texto: "Lo que se hace con intención deja huella, aunque nadie lo vea.", origen: "Enseñanza de Sibila" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "La palabra «rito»", texto: "Viene del latín ritus: la costumbre, la manera consagrada de hacer algo. Un rito no se inventa cada vez; se repite, y en la repetición está su fuerza." },
            { titulo: "Los ritos de paso", texto: "En 1909 el etnólogo Arnold van Gennep describió que los rituales de cambio tienen tres momentos: separarse de lo que fue, atravesar un umbral y volver con algo nuevo. Estos siete días siguen ese camino: soltar, cruzar y sembrar." },
            { titulo: "Los cuatro elementos en tu mesa", texto: "La vela es el fuego; el vaso, el agua; la piedra o la sal, la tierra; la hoja o el humo, el aire. Muchas tradiciones reúnen los cuatro en el altar para que nada falte." },
            { titulo: "Los tiempos sagrados", texto: "El amanecer y el atardecer, la Luna nueva y la llena, el cambio de año: momentos de umbral, cuando una cosa termina y otra empieza. Por eso tantos rituales ocurren justo ahí." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "El altar en el mundo",
          items: [
            { lugar: "México", emoji: "🇲🇽", nombre: "La ofrenda", texto: "En Día de Muertos se arma un altar con agua, sal, velas, flores de cempasúchil y copal: los cuatro elementos para recibir a quienes se fueron." },
            { lugar: "Mediterráneo", emoji: "🕯️", nombre: "La lámpara ante la imagen", texto: "En Grecia, Italia y España, muchas casas guardan un rincón con una imagen y una lámpara de aceite o una vela que se enciende para pedir o agradecer." },
            { lugar: "China y Vietnam", emoji: "🏮", nombre: "El altar de los antepasados", texto: "En el centro de la casa, un altar con fotos de la familia, incienso, fruta y té. Se enciende incienso para honrarlos y pedir su compañía." },
            { lugar: "Mundo árabe y Turquía", emoji: "🧿", nombre: "La entrada de la casa", texto: "Más que un altar, se cuida el umbral: la khamsa o el nazar junto a la puerta, y palabras como «bismillah» o «maşallah» al entrar y al elogiar." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "Tu altar de cierre",
          fondo: "/escuela/rituales/fondos/altar.mp4",
          apertura:
            "Bienvenida, bienvenido a tu primer ritual… Antes de empezar, busca un lugar tranquilo… Si puedes, apaga las luces fuertes y deja solo una luz suave… Durante estos minutos no hay nada más que hacer… Solo tú, tu altar y este momento… Cuando estés lista o listo, empezamos.",
          materiales: ["Un paño o pañuelo limpio", "Una vela blanca (la encenderemos más adelante)", "Un vaso de agua", "Algo de la naturaleza: una piedra, una hoja, una flor o un poco de sal", "Papel y lápiz"],
          pasos: [
            {
              texto: "Elige un lugar tranquilo donde el altar pueda quedarse los siete días.",
              guia: "Mira tu casa con otros ojos… ¿Dónde te sientes en calma?… Puede ser una esquina de la mesa, una repisa, el borde de una ventana… No tiene que ser grande; tiene que ser tuyo… Cuando lo encuentres, quédate ahí.",
            },
            {
              texto: "Extiende el paño y pon encima la vela, el vaso de agua y lo que trajiste de la naturaleza.",
              guia: "Extiende el paño despacio, alisándolo con las manos, como quien prepara la mesa para alguien querido… Pon la vela en el centro… el vaso de agua a su lado… y lo que trajiste de la naturaleza… Fuego, agua, tierra… Tu altar ya tiene sus elementos.",
            },
            {
              texto: "Siéntate frente a tu altar y respira conmigo, despacio.",
              accion: "respirar",
              segundos: 48,
              guia: "Siéntate frente a tu altar, con la espalda recta y los pies en el suelo… Si quieres, cierra los ojos… Inhala por la nariz, despacio… sostén un instante… y suelta por la boca, largo… Otra vez… Con cada respiración, el día se queda afuera… y tú llegas aquí.",
            },
            {
              texto: "Escribe, en presente y con tus palabras, lo que quieres cerrar este año.",
              accion: "escribir",
              ayuda: "Por ejemplo: «Cierro este año con gratitud y dejo atrás el miedo a empezar». Escríbelo también en tu papel; aquí queda guardado en tu grimorio.",
              guia: "Ahora piensa en este año… en todo lo que trajo… ¿Qué quieres cerrar?… Un miedo, una etapa, un cansancio, una historia que ya terminó… No lo pienses demasiado… Escríbelo en presente, como si ya estuviera ocurriendo… Tómate tu tiempo; aquí te espero.",
            },
            {
              texto: "Dobla el papel y déjalo bajo la vela. Lo usaremos el último día.",
              guia: "Dobla el papel dos veces, hacia ti… y déjalo bajo la vela… Ahí va a esperar hasta el último día… Lo que escribiste ya empezó a moverse.",
            },
          ],
          cierre:
            "Pon las manos sobre tu altar un momento… y agradece… A ti, por darte este tiempo… y a todas las abuelas que, antes que tú, prepararon un rincón con intención… Tu altar queda listo… Mañana seguimos.",
          herramienta: { href: "/luna", texto: "Mira en qué Luna estás hoy" },
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Qué convierte un gesto en ritual?", opciones: ["Usar objetos caros", "La intención, el espacio y el momento", "Hacerlo a medianoche"], correcta: 1, porque: "No hace falta nada caro ni una hora especial: lo que importa es la intención con que lo haces, el lugar que separas y el momento que eliges." },
            { tipo: "opcion", p: "¿Qué elementos reúne tu altar?", opciones: ["Solo el fuego", "Fuego, agua y tierra (y el aire, cuando hay humo)", "Ninguno en especial"], correcta: 1, porque: "La vela, el vaso de agua y la piedra o la hoja: muchas tradiciones reúnen los elementos para que nada falte." },
            { tipo: "opcion", p: "¿Cómo conviene escribir una intención?", opciones: ["En presente y con tus propias palabras", "En futuro y muy general", "Copiada de un libro"], correcta: 0, porque: "La tradición dice que lo que se nombra en presente ya empieza a ocurrir, y tus palabras pesan más que las de cualquier libro." },
            { tipo: "abierta", p: "¿Qué quieres cerrar este año? Cuéntaselo a Sibila.", ayuda: "Lo que escribas aquí lo usará Sibila en tu carta de cierre del día 7." },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 2 ─────────────────────────────
    {
      numero: 2,
      llave: { nombre: "Llave del Humo", simbolo: "🌫️", saber: "Limpiar una casa con humo, como se hace en cuatro tradiciones del mundo." },
      luna: "🌒",
      saludo: "{nombre}, tu altar ya está listo. Hoy le abrimos las ventanas a la casa y dejamos que el humo se lleve lo viejo.",
      titulo: "Limpiar antes de pedir: el humo y las hierbas",
      resumen: "Copal, romero, bakhoor y üzerlik: cómo se limpia una casa con humo en distintas tradiciones.",
      minutos: 25,
      bloques: [
        { tipo: "video", titulo: "El humo que limpia" },
        {
          tipo: "texto",
          titulo: "Una casa que respira",
          parrafos: [
            "Casi todas las tradiciones empiezan igual: antes de pedir, se limpia. Y casi todas limpian con humo. El humo sube, se mezcla con el aire de la casa y sale por la ventana: la imagen perfecta de algo que se va.",
            "En Mesoamérica se sahúma con copal, la resina que se quemaba en los templos; en los Andes, con hierbas; en el Mediterráneo y en Latinoamérica, con romero, ruda y laurel. En el mundo árabe se quema bakhoor para perfumar la casa y recibir a los invitados, y en Turquía e Irán se queman semillas contra el mal de ojo.",
            "No hace falta nada exótico: una ramita de romero seco de tu cocina basta. Lo que limpia no es la planta más rara, sino la intención con la que recorres tu casa.",
          ],
        },
        { tipo: "cita", texto: "El humo sube y se lleva lo que ya no es tuyo.", origen: "Enseñanza de Sibila" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "La palabra «sahumar»", texto: "Viene del latín suffumigare: ahumar desde abajo. Se pasaba el humo por debajo de las ropas y por los rincones para purificarlos." },
            { titulo: "Copal, la resina de los templos", texto: "Su nombre viene del náhuatl copalli. Los mexicas y los mayas lo quemaban en sus templos, y hoy sigue perfumando los altares de muertos y las limpias de las curanderas." },
            { titulo: "Bakhoor y el mabkhara", texto: "En la península arábiga se quema bakhoor, astillas de madera empapadas en aceites, en un quemador llamado mabkhara. Se pasa por la casa y por la ropa: es bienvenida y es cuidado." },
            { titulo: "Üzerlik, la semilla que estalla", texto: "En Turquía e Irán (donde se llama espand) se queman semillas de ruda siria contra el mal de ojo. Al calentarse, estallan: la tradición dice que en ese chasquido se rompe la mirada pesada. Se queman; nunca se comen." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "El humo en el mundo",
          items: [
            { lugar: "México y Centroamérica", emoji: "🇲🇽", nombre: "Copal", texto: "Se sahúma la casa y a las personas en las limpias y en Día de Muertos, con la resina encendida sobre carbón." },
            { lugar: "Península arábiga", emoji: "🌙", nombre: "Bakhoor", texto: "Se quema para recibir invitados, en las fiestas y los viernes; el humo perfumado pasa por cada habitación." },
            { lugar: "Turquía e Irán", emoji: "🧿", nombre: "Üzerlik / espand", texto: "Las semillas se queman y el humo se pasa en círculo sobre la cabeza de quien se cuida del nazar." },
            { lugar: "Mediterráneo", emoji: "🌿", nombre: "Romero y laurel", texto: "Las abuelas quemaban ramitas de romero y laurel para «limpiar el aire» de la casa después de una enfermedad o una mala racha." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "Sahumar la casa",
          fondo: "/escuela/rituales/fondos/vela.mp4",
          apertura:
            "Hoy tu casa va a respirar contigo… Abre una ventana y quédate un momento ahí… Escucha los sonidos de afuera… el viento, la calle, un pájaro… Deja que entre aire nuevo… Ahora sí, empezamos.",
          materiales: ["Hierbas secas (romero, laurel o ruda) o un incienso que te guste", "Un plato o cuenco de barro o metal", "Fósforos", "Las ventanas abiertas"],
          pasos: [
            { texto: "Abre las ventanas: el humo necesita por dónde salir.", guia: "Abre todas las ventanas que puedas… El humo necesita un camino para irse… y tu casa, un poco de aire nuevo." },
            {
              texto: "Enciende las hierbas o el incienso en el plato y apaga la llama para que solo quede el humo.",
              accion: "encender",
              guia: "Enciende tus hierbas en el plato… Deja que la llama prenda unos segundos… y apágala con un soplo suave o moviéndolas… Lo que queremos es el humo… Míralo subir.",
            },
            {
              texto: "Empieza por el rincón más alejado de la puerta y recorre cada habitación en el sentido de las agujas del reloj.",
              guia: "Ve al rincón más lejano de la puerta… Desde ahí, camina despacio, en el sentido de las agujas del reloj… Pasa el humo por las esquinas… detrás de las puertas… debajo de las camas… Ahí donde se queda lo que no se ve.",
            },
            {
              texto: "Mientras caminas, di en voz baja lo que sale de tu casa.",
              guia: "Mientras caminas, dilo en voz baja, con tus palabras… Sale el cansancio… sale la tristeza… sale lo que ya no es mío… Lo que se nombra, se va más fácil.",
            },
            { texto: "Termina en la puerta de entrada y deja que el humo salga hacia afuera.", guia: "Llega a la puerta de entrada… Ábrela… y deja que el humo salga… Imagina que se lleva todo lo que nombraste… Despídelo." },
            {
              texto: "Apaga bien las brasas con agua y tira las cenizas fuera de la casa.",
              guia: "Apaga bien las brasas con un poco de agua… y lleva las cenizas afuera, a la tierra o a la basura de la calle… Lo viejo ya no vive aquí.",
            },
          ],
          cierre: "Cierra las ventanas despacio… y mira tu casa… Es la misma, y no lo es… Huele distinto, se siente más liviana… Agradécele por cuidarte todo este año… Mañana seguimos.",
          cuidado: "Usa siempre un recipiente que no se queme, no dejes el humo solo y evítalo si en casa hay alguien con asma, bebés o mascotas sensibles.",
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Por qué casi todas las tradiciones limpian antes de pedir?", opciones: ["Porque es más bonito", "Para hacer espacio a lo nuevo despidiendo lo viejo", "Porque lo exige la Luna"], correcta: 1, porque: "Limpiar es despedir lo que pesa para que lo que pides tenga lugar." },
            { tipo: "opcion", p: "¿Qué es el copal?", opciones: ["Una piedra volcánica", "Una resina que se quemaba en los templos de Mesoamérica", "Un tipo de vela"], correcta: 1, porque: "Su nombre viene del náhuatl copalli, y aún perfuma los altares y las limpias." },
            { tipo: "opcion", p: "¿Dónde se termina de sahumar la casa?", opciones: ["En la cocina", "En el dormitorio", "En la puerta de entrada, hacia afuera"], correcta: 2, porque: "Se recorre la casa de adentro hacia afuera y el humo se despide por la puerta." },
            { tipo: "abierta", p: "¿Qué sentiste al recorrer tu casa? ¿Hubo algún rincón que te costó más?" },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 3 ─────────────────────────────
    {
      numero: 3,
      llave: { nombre: "Llave del Agua", simbolo: "💧", saber: "Hacer una limpia con huevo y leer lo que muestra el agua." },
      luna: "🌓",
      saludo: "{nombre}, hoy hacemos la limpia de las abuelas. Ten a mano un huevo, un vaso de agua y un rato de calma.",
      titulo: "La limpia con huevo",
      resumen: "La limpia de las abuelas latinoamericanas, sus parientes en el mundo y cómo se lee el vaso.",
      minutos: 30,
      bloques: [
        { tipo: "video", titulo: "La abuela pasa el huevo" },
        {
          tipo: "texto",
          titulo: "Lo que el huevo se lleva",
          parrafos: [
            "La limpia con huevo une las limpias de los pueblos de Mesoamérica, que barrían el cuerpo con hierbas, copal y flores, con el huevo de gallina que llegó a América en los barcos europeos. Hoy se hace en México, Centroamérica, los Andes, el Caribe y en cada casa latina del mundo.",
            "La tradición dice que el huevo, símbolo de vida en casi todas las culturas, recoge al pasar por el cuerpo lo que pesa: el cansancio, la envidia, el susto, el mal de ojo. Después se rompe en un vaso de agua para ver qué se llevó. Por eso no se come: se desecha con respeto, lejos de la casa.",
            "Mirar el agua para saber qué pasó es un gesto que se repite en muchas culturas, con distintos materiales: el huevo en Latinoamérica, el aceite en Italia, el plomo derretido en Turquía. Siempre el agua como espejo.",
          ],
        },
        { tipo: "cita", texto: "El agua no miente: muestra lo que el huevo se llevó.", origen: "Dicho de las curanderas" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "Oomancia", texto: "Los griegos llamaron oomancia (de ōón, «huevo») a leer el interior de un huevo. En la Nueva Inglaterra del siglo XVII, las jóvenes de Salem echaban clara de huevo en un vaso de agua para adivinar el oficio de su futuro esposo: el «vaso de Venus»." },
            { titulo: "La ruda", texto: "La planta de las limpias en todo el Mediterráneo y Latinoamérica. Se pasa junto con el huevo o se deja en la entrada de la casa. Su olor fuerte, dicen, ahuyenta lo que no es bienvenido." },
            { titulo: "El susto", texto: "En la tradición latinoamericana, el «susto» es lo que queda en el cuerpo después de un sobresalto fuerte: el alma que se asustó y no volvió del todo. Las curanderas lo tratan con limpias, rezos y el nombre de la persona dicho en voz alta." },
            { titulo: "Cómo se lee el vaso", texto: "La yema tranquila en el fondo, la limpia salió bien; burbujas, energía que se liberó; hilos que suben, envidias que se recogieron; agua nublada, mucha carga. Cada curandera tiene su escuela." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "Leer el agua en el mundo",
          items: [
            { lugar: "México y Centroamérica", emoji: "🥚", nombre: "La limpia con huevo", texto: "La curandera o la abuela pasa el huevo por el cuerpo con ramas de ruda y una oración, y lee el vaso." },
            { lugar: "Italia", emoji: "🇮🇹", nombre: "El aceite del malocchio", texto: "Se dejan caer gotas de aceite en un plato con agua: si se expanden y se unen en forma de ojo, había malocchio. Las palabras para quitarlo se aprenden en Nochebuena." },
            { lugar: "Turquía", emoji: "🇹🇷", nombre: "Kurşun dökme", texto: "Se derrite plomo y se vierte en un recipiente con agua sostenido sobre la cabeza de la persona. Las formas que toma el plomo muestran el nazar que se rompió." },
            { lugar: "El Caribe y Estados Unidos", emoji: "🌺", nombre: "Las botánicas", texto: "En las botánicas de Nueva York, Miami o San Juan se venden huevos, ruda, velas y aguas para hacer la limpia en casa." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "Tu limpia de cierre de año",
          fondo: "/escuela/rituales/fondos/huevo.mp4",
          apertura:
            "Hoy vamos a hacer lo que han hecho las abuelas durante siglos… Ten cerca el huevo, el vaso de agua y, si la tienes, la ramita de ruda… Ponte de pie, con los pies firmes en el suelo… Siente el peso de tu cuerpo… Respira… Empezamos.",
          materiales: ["Un huevo fresco a temperatura ambiente", "Un vaso transparente con agua hasta la mitad", "Una ramita de romero o ruda (si tienes)"],
          pasos: [
            {
              texto: "Sostén el huevo entre las manos, respira y piensa en lo que quieres soltar de este año.",
              accion: "respirar",
              segundos: 36,
              guia: "Toma el huevo entre tus manos… Siente su peso, su forma, su temperatura… Respira despacio… y piensa en lo que quieres soltar… Lo que te cansó este año… lo que te asustó… lo que te miraron con envidia… Deja que todo eso se acerque al huevo.",
            },
            {
              texto: "Pásalo despacio por tu cuerpo de arriba hacia abajo, siempre en la misma dirección.",
              guia: "Ahora pásalo por tu cuerpo, despacio, de arriba hacia abajo… La coronilla… la frente… la nuca… los hombros… baja por los brazos… el pecho… la espalda, hasta donde llegues… las piernas… y las plantas de los pies… Siempre en la misma dirección, como quien barre… Si quieres, di tu nombre en voz baja mientras lo haces.",
            },
            {
              texto: "Rompe el huevo con cuidado en el vaso y déjalo reposar.",
              accion: "esperar",
              segundos: 300,
              ayuda: "Cinco minutos. Mientras tanto, quédate en silencio cerca del vaso.",
              guia: "Rompe el huevo con cuidado en el vaso… Deja que caiga… Ahora no lo toques… Vamos a esperar cinco minutos… Quédate cerca, en silencio… El agua está trabajando.",
            },
            { texto: "Míralo a contraluz: la yema, la clara, los hilos, las burbujas.", guia: "Levanta el vaso y míralo a contraluz… ¿Cómo está la yema?… ¿Sube la clara?… ¿Hay hilos, burbujas, nubes?… No juzgues todavía; solo mira." },
            { texto: "Toma la foto (de frente y, si puedes, también de lado y desde arriba) y súbela para que Sibila la lea.", guia: "Toma la foto de tu vaso, de frente… y si puedes, de lado y desde arriba… Yo la voy a leer contigo." },
            { texto: "Al final, tira el agua y el huevo lejos de la casa y lávate las manos.", guia: "Cuando termines, tira el agua y el huevo lejos de la casa, en la tierra o por el inodoro… y lávate las manos con agua fresca… Lo que se fue, no vuelve." },
          ],
          cierre: "Pon las manos sobre el corazón… Respira… Te sacaste un peso de encima… Bebe un vaso de agua y descansa un rato… Hoy tu cuerpo hizo un trabajo hondo… Mañana, el fuego.",
          herramienta: { href: "/biblioteca/limpia-con-huevo", texto: "Lee la historia completa en El Arcano" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu vaso", texto: "Sube la foto de tu vaso y Sibila te dice lo que se llevó tu limpia. Esta lectura está incluida en el curso.", href: "/huevo", boton: "Que Sibila lea mi vaso", lectura: "huevo" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿En qué dirección se pasa el huevo por el cuerpo?", opciones: ["De abajo hacia arriba", "De arriba hacia abajo, siempre en la misma dirección", "En círculos"], correcta: 1, porque: "Como quien barre: de la cabeza a los pies, sin volver atrás." },
            { tipo: "opcion", p: "¿Qué se vierte en agua en Turquía para quitar el nazar?", opciones: ["Plomo derretido (kurşun dökme)", "Leche", "Café"], correcta: 0, porque: "Las formas que toma el plomo en el agua muestran el nazar que se rompió." },
            { tipo: "opcion", p: "¿Qué se hace con el huevo después de la limpia?", opciones: ["Se cocina", "Se guarda en la nevera", "Se desecha con respeto, lejos de la casa"], correcta: 2, porque: "La tradición dice que guarda lo que recogió: por eso no se come y se tira lejos." },
            { tipo: "abierta", p: "¿Qué te dijo tu vaso? ¿Te sorprendió algo?" },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 4 ─────────────────────────────
    {
      numero: 4,
      llave: { nombre: "Llave del Fuego", simbolo: "🔥", saber: "Encender una vela con su color, su día y su Luna, y leer la llama." },
      luna: "🌔",
      saludo: "{nombre}, hoy tu intención se vuelve fuego. Vamos a elegir tu vela, tu día y tu Luna.",
      titulo: "El lenguaje de las velas: color, día y Luna",
      resumen: "El fuego en las tradiciones del mundo, los colores, los días de los astros y la vela de tu intención.",
      minutos: 30,
      bloques: [
        { tipo: "video", titulo: "Una intención hecha fuego" },
        {
          tipo: "texto",
          titulo: "Colores, días y lunas",
          parrafos: [
            "Encender una luz para pedir o agradecer es quizás el ritual más antiguo y compartido del mundo: lámparas de aceite en los templos de Egipto y de Roma, velas de cera de abeja en las iglesias, veladoras de siete días en las cocinas de Latinoamérica.",
            "Cada color habla de una intención: el rosa y el rojo, del amor; el verde, del dinero y la abundancia; el blanco, de la limpieza y la protección; el azul, de la calma; el amarillo, de la claridad; el naranja, del éxito; el morado, de la intuición, y el negro, de cerrar ciclos. Si no tienes el color, una vela blanca sirve para todo.",
            "Los días de la semana llevan el nombre de los siete astros de los antiguos: el viernes es de Venus y del amor; el jueves, de Júpiter y la abundancia; el domingo, del Sol y el éxito; el miércoles, de Mercurio y la claridad; el lunes, de la Luna y la intuición; el sábado, de Saturno, para proteger y cerrar. Y la Luna marca el ritmo: la creciente atrae, la llena culmina, la menguante suelta y la nueva siembra.",
          ],
        },
        { tipo: "cita", texto: "Una vela encendida con intención es una palabra que sigue hablando cuando tú callas.", origen: "Enseñanza de Sibila" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "La vela votiva", texto: "Viene del latín votum, «promesa». Se enciende para acompañar un pedido o para agradecer uno cumplido, y se deja arder hasta el final." },
            { titulo: "Vestir la vela", texto: "Untarla con aceite es «vestirla». De la base a la mecha, para atraer; de la mecha a la base, para soltar. Muchas tradiciones le marcan además un nombre o una palabra con una aguja." },
            { titulo: "Los días y los astros", texto: "En español se ve claro: lunes, de la Luna; martes, de Marte; miércoles, de Mercurio; jueves, de Júpiter; viernes, de Venus. Por eso cada intención tiene su día." },
            { titulo: "Ceromancia", texto: "Leer la llama y la cera. Llama alta y firme: el pedido avanza. Llama que baila: algo se mueve alrededor. Humo negro: obstáculos que se queman. Cera que corre como lágrimas: emociones que se liberan." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "El fuego en el mundo",
          items: [
            { lugar: "Latinoamérica", emoji: "🕯️", nombre: "La veladora", texto: "La vela de siete días en su vaso de vidrio, encendida ante una imagen o una foto, que acompaña un pedido toda la semana." },
            { lugar: "Tradición judía", emoji: "✡️", nombre: "Las velas del Shabat", texto: "Cada viernes al atardecer, en las casas judías se encienden dos velas para recibir el día de descanso." },
            { lugar: "India", emoji: "🪔", nombre: "Las diyas de Diwali", texto: "En la fiesta de las luces se encienden lámparas de barro con aceite en puertas y ventanas: la luz que vence a la oscuridad." },
            { lugar: "Egipto", emoji: "🏮", nombre: "El fanous de Ramadán", texto: "Los faroles de colores iluminan calles y casas durante el mes de Ramadán: una tradición que viene de El Cairo de hace siglos." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "La vela de tu intención",
          fondo: "/escuela/rituales/fondos/vela.mp4",
          apertura:
            "Hoy vamos a encender tu intención… Busca un lugar donde la vela pueda arder tranquila… Apaga las luces fuertes… Siéntate frente a tu altar… y mira la vela apagada… Todavía es solo cera… En unos minutos será tu palabra hecha fuego.",
          materiales: ["Una vela del color de tu intención (o blanca)", "Un poco de aceite (de oliva sirve)", "Una aguja o un palillo", "Un plato firme o un vaso de vidrio", "Fósforos"],
          pasos: [
            { texto: "Mira el color, el día y la Luna de tu intención (arriba, en «Tu vela»).", guia: "Mira tu vela… su color… Piensa en tu intención para el año que viene… Ese color la va a sostener." },
            { texto: "Con la aguja, marca en la vela una palabra que resuma tu intención.", guia: "Toma la aguja… y marca en la vela, despacio, una sola palabra… La que resume lo que quieres… Escríbela con cuidado, como quien firma una promesa." },
            {
              texto: "«Viste» la vela: úntala con un poco de aceite de la base hacia la mecha.",
              guia: "Pon unas gotas de aceite en tus dedos… y unta la vela desde la base hacia la mecha… siempre hacia arriba, para atraer… Mientras lo haces, repite tu palabra en silencio… La vela ya sabe lo que le pides.",
            },
            {
              texto: "Ponla en el plato, enciéndela con un fósforo y di tu intención en voz alta.",
              accion: "encender",
              guia: "Pon la vela en el plato… Enciende el fósforo… y acércalo a la mecha… Ahora dilo en voz alta, con tu voz, sin miedo… Tu intención para el año que viene.",
            },
            {
              texto: "Quédate con ella, mirando la llama.",
              accion: "esperar",
              segundos: 120,
              ayuda: "Después, déjala arder mientras estés en casa y apágala con los dedos humedecidos o un apagavelas, sin soplarla.",
              guia: "Ahora solo mira la llama… Cómo sube… cómo se mueve… Si baila, algo se mueve alrededor… Si está quieta y alta, tu pedido avanza… Quédate aquí, conmigo, dos minutos… respirando.",
            },
            { texto: "Cuando termine de arder (puede tomar más de un día), toma la foto de los restos.", guia: "Deja que la vela arda mientras estés en casa… Cuando se consuma, fotografía lo que quedó… la cera, el plato, el vaso… Yo lo leeré contigo." },
          ],
          cierre: "Junta las manos frente a la llama… y agradece… Tu intención ya está en el fuego… No hace falta repetirla; ahora trabaja sola… Nunca dejes la vela sin cuidado… Mañana, soltamos.",
          cuidado: "Nunca dejes una vela encendida sin nadie que la cuide, ni cerca de cortinas, niños o mascotas.",
          herramienta: { href: "/velas", texto: "Más sobre los rituales de velas" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu vela", texto: "Cuando tu vela termine de arder, fotografía los restos y Sibila te dice lo que la cera y la llama dejaron dicho. Incluida en el curso.", href: "/velas", boton: "Que Sibila lea mi vela", lectura: "velas" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "Si buscas abundancia, ¿qué combinación sigue la tradición?", opciones: ["Vela verde, un jueves, Luna creciente", "Vela negra, un sábado, Luna menguante", "Vela azul, un lunes, Luna llena"], correcta: 0, porque: "El verde es el color de la abundancia, el jueves es de Júpiter y la Luna creciente atrae." },
            { tipo: "opcion", p: "¿Hacia dónde se unta el aceite para atraer?", opciones: ["De la mecha a la base", "De la base hacia la mecha", "Da igual"], correcta: 1, porque: "Hacia arriba, de la base a la mecha, para atraer; al revés, para soltar." },
            { tipo: "opcion", p: "¿Qué dice la costumbre sobre apagar una vela de ritual?", opciones: ["Hay que soplarla fuerte", "No se sopla: se apaga con los dedos humedecidos o un apagavelas", "Se apaga con agua"], correcta: 1, porque: "La tradición dice que soplar la vela dispersa la intención." },
            { tipo: "abierta", p: "¿Qué intención pusiste en tu vela? ¿Qué palabra marcaste y cómo ardió?" },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 5 ─────────────────────────────
    {
      numero: 5,
      llave: { nombre: "Llave de la Ceniza", simbolo: "⚱️", saber: "Soltar con el fuego y devolver la ceniza a la tierra." },
      luna: "🌕",
      saludo: "{nombre}, hoy toca soltar. Lo que escribas hoy no viene contigo al año nuevo.",
      titulo: "Soltar: el fuego que transforma",
      resumen: "Los años viejos de los Andes, el fuego de Irán, el papel de Japón y tu ritual para dejar ir.",
      minutos: 25,
      bloques: [
        { tipo: "video", titulo: "Lo que se va con el humo" },
        {
          tipo: "texto",
          titulo: "Escribir para soltar",
          parrafos: [
            "Soltar es la parte más difícil de cualquier cierre. Nos aferramos a lo conocido aunque pese. Por eso tantas culturas inventaron un gesto físico para hacerlo: escribirlo, nombrarlo y dárselo al fuego.",
            "En Ecuador y en otras partes de los Andes, la última noche del año se queman muñecos de trapo, los «años viejos», que representan todo lo que pasó. En muchas casas de Latinoamérica se escribe en un papel lo que no se quiere llevar al año nuevo y se quema a medianoche. El fuego transforma: lo que estaba escrito se vuelve humo y ceniza, y la ceniza vuelve a la tierra.",
            "La tradición dice que soltar es más fácil con la Luna menguante, cuando la luz se va retirando. Pero el mejor momento es el que tú elijas con intención.",
          ],
        },
        { tipo: "cita", texto: "Te agradezco lo que me enseñaste. Ahora te dejo ir.", origen: "Las palabras de este ritual" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "Por qué escribir", texto: "Lo que da vueltas en la cabeza no tiene forma. Al escribirlo, se vuelve algo que se puede mirar, leer en voz alta y, al final, entregar. El papel es el puente entre lo que sientes y lo que sueltas." },
            { titulo: "Por qué el fuego", texto: "El fuego es el único elemento que transforma por completo: lo que entra no sale igual. Por eso es el elemento del cambio en casi todas las tradiciones." },
            { titulo: "La ceniza", texto: "No se tira a la basura: se devuelve a la tierra, a una maceta o al jardín. Lo que soltaste se convierte en abono para lo que vas a sembrar." },
            { titulo: "La Luna menguante", texto: "Después de la Luna llena, la luz empieza a retirarse cada noche. Las tradiciones la eligen para cerrar, limpiar y despedir: la Luna acompaña lo que se va." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "Soltar en el mundo",
          items: [
            { lugar: "Ecuador y los Andes", emoji: "🔥", nombre: "Los años viejos", texto: "Muñecos rellenos de papel y aserrín que se queman a medianoche del 31 de diciembre: el año que se va, ardiendo." },
            { lugar: "Irán", emoji: "🇮🇷", nombre: "Chaharshanbe Suri", texto: "La última noche de miércoles antes del Nowruz se salta sobre hogueras diciendo: «Mi palidez para ti, tu fuerza roja para mí». El fuego se lleva lo débil." },
            { lugar: "Japón", emoji: "🇯🇵", nombre: "Toshikoshi no Ōharae", texto: "A fin de año, en los santuarios sintoístas se pasa un muñeco de papel por el cuerpo para traspasarle las impurezas, y luego se purifica." },
            { lugar: "Latinoamérica", emoji: "📜", nombre: "El papel de medianoche", texto: "Se escribe lo que no se quiere llevar al año nuevo y se quema con las doce campanadas." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "El papel que se quema",
          fondo: "/escuela/rituales/fondos/papel.mp4",
          apertura:
            "Hoy vamos a soltar… Antes de empezar, siéntate… y pon una mano en el pecho y otra en el vientre… Siente cómo respiras… Todo lo que vas a escribir hoy fue parte de tu camino… No lo escribes con rabia, sino con gratitud… Empezamos.",
          materiales: ["Papel y lápiz", "Un cuenco de metal o el fregadero", "Fósforos", "Un vaso de agua a mano"],
          pasos: [
            {
              texto: "Escribe, sin pensarlo mucho, todo lo que no quieres llevar al año nuevo.",
              accion: "escribir",
              ayuda: "Miedos, hábitos, rencores, cansancios. Escríbelo también en tu papel: ese es el que vas a quemar.",
              guia: "Ahora escribe… sin pensarlo mucho, sin corregir… todo lo que no quieres llevar al año nuevo… Los miedos… los hábitos que te pesan… los rencores… el cansancio… Deja que salga… Nadie más lo va a leer.",
            },
            {
              texto: "Léelo una vez en voz alta y di: «Te agradezco lo que me enseñaste. Ahora te dejo ir».",
              guia: "Toma tu papel… y léelo en voz alta, una sola vez… Cuando termines, di conmigo… Te agradezco lo que me enseñaste… Ahora te dejo ir.",
            },
            {
              texto: "Quema el papel en el cuenco de metal o en el fregadero, con el agua a mano.",
              accion: "encender",
              guia: "Lleva el papel al cuenco de metal o al fregadero… Enciéndelo por una esquina… y mira cómo arde… Cómo las palabras se vuelven luz… y luego humo… Respira mientras se va.",
            },
            { texto: "Cuando se enfríen, lleva las cenizas a la tierra o déjalas ir con el agua.", guia: "Cuando las cenizas se enfríen, llévalas a la tierra, a una maceta o al jardín… o déjalas ir con el agua… Lo que soltaste va a alimentar lo nuevo." },
            { texto: "Si no puedes quemar, rompe el papel en pedazos muy pequeños y entiérralos.", guia: "Y si hoy no puedes usar fuego, rompe el papel en pedazos muy pequeños… y entiérralos… La tierra también transforma." },
          ],
          cierre: "Respira hondo… y suelta el aire despacio… Algo se fue hoy… Puede que te sientas más liviana, más liviano… o un poco triste… Las dos cosas están bien… Bebe agua, descansa… Mañana, agradecemos.",
          cuidado: "Quema siempre en un recipiente de metal o en el fregadero, lejos de cortinas y con agua a mano.",
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Con qué Luna dice la tradición que es más fácil soltar?", opciones: ["Creciente", "Menguante", "Llena"], correcta: 1, porque: "La menguante es la Luna que se retira: acompaña lo que se va." },
            { tipo: "opcion", p: "¿Qué se quema en Ecuador la noche del 31 de diciembre?", opciones: ["Velas de colores", "Los «años viejos», muñecos que representan el año que se va", "Hojas de laurel"], correcta: 1, porque: "Se queman a medianoche: el año que termina se va con el fuego." },
            { tipo: "abierta", p: "Sin dar detalles si no quieres: ¿cómo te sentiste al ver arder el papel?" },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 6 ─────────────────────────────
    {
      numero: 6,
      llave: { nombre: "Llave de la Mesa", simbolo: "☕", saber: "Agradecer con la mesa y leer la taza volteada." },
      luna: "🌖",
      saludo: "{nombre}, después de soltar, agradecer. Hoy ponemos la mesa como para alguien querido.",
      titulo: "Agradecer: la mesa, las uvas y el café",
      resumen: "La gratitud en distintas culturas: las doce uvas, el mar de Iemanjá, la sobremesa y la taza que se voltea.",
      minutos: 30,
      bloques: [
        { tipo: "video", titulo: "Una mesa para agradecer" },
        {
          tipo: "texto",
          titulo: "Agradecer también es un ritual",
          parrafos: [
            "Después de limpiar y soltar, queda espacio. Y ese espacio se llena primero con gratitud. Agradecer cierra el círculo: se reconoce lo que el año trajo de bueno, aunque haya sido difícil, y se honra a quienes estuvieron.",
            "En España y en buena parte de Latinoamérica se comen doce uvas con las doce campanadas de la medianoche, una por cada mes del año que viene, y con cada una se pide un deseo. En Turquía y en el mundo árabe, el café se toma despacio en la sobremesa, se voltea la taza y alguien de la familia lee lo que quedó en la borra: es una forma de cuidarse entre todos.",
            "Agradecer no es negar lo que dolió. Es mirar el año completo y encontrar, también ahí, lo que te sostuvo.",
          ],
        },
        { tipo: "cita", texto: "Un café obliga a cuarenta años de amistad.", origen: "Proverbio turco" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "Las doce uvas", texto: "La costumbre se hizo popular en España a principios del siglo XX y viajó a Latinoamérica. Una uva por campanada, un deseo por mes." },
            { titulo: "El café turco, patrimonio", texto: "En 2013 la UNESCO reconoció la cultura y la tradición del café turco como patrimonio inmaterial de la humanidad, y en 2015, el café árabe como símbolo de hospitalidad." },
            { titulo: "La sobremesa", texto: "Quedarse en la mesa después de comer, conversando, es en sí mismo un ritual: el tiempo que se le regala a los demás." },
            { titulo: "Por qué doce", texto: "Doce meses, doce signos, doce campanadas: el número del ciclo completo en muchas tradiciones." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "La gratitud en el mundo",
          items: [
            { lugar: "España y Latinoamérica", emoji: "🍇", nombre: "Las doce uvas", texto: "Una uva por campanada a medianoche, un deseo por cada mes del año que viene." },
            { lugar: "Brasil", emoji: "🌊", nombre: "Las siete olas de Iemanjá", texto: "En Año Nuevo, vestidos de blanco, se saltan siete olas en el mar y se dejan flores para Iemanjá, la madre de las aguas, en agradecimiento." },
            { lugar: "Turquía y mundo árabe", emoji: "☕", nombre: "La taza volteada", texto: "Después del café se voltea la taza, se espera a que se enfríe y se leen las figuras de la borra entre amigas y familia." },
            { lugar: "Irán", emoji: "🌱", nombre: "La mesa del Nowruz", texto: "El haft-sin reúne siete cosas que empiezan con «s» en persa: brotes, manzana, ajo, vinagre…, cada una con su bendición para el año." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "Mesa de gratitud y café",
          fondo: "/escuela/rituales/fondos/cafe.mp4",
          apertura:
            "Hoy no venimos a pedir… venimos a agradecer… Prepara tu mesa con cariño, como si fuera a llegar alguien que quieres mucho… Ese alguien eres tú… Cuando la mesa esté lista, siéntate… y empezamos.",
          materiales: ["Tu mesa, con algo que te guste: una flor, una vela, una fruta", "Papel y lápiz", "Café molido muy fino (al estilo turco, si puedes) y una taza pequeña con plato"],
          pasos: [
            { texto: "Prepara la mesa como si esperaras a alguien querido.", guia: "Pon en la mesa algo que te guste… una flor… una vela… una fruta… Arréglala con calma… Esta mesa es tu gracias." },
            {
              texto: "Escribe doce cosas que agradeces de este año, una por cada mes si puedes.",
              accion: "escribir",
              guia: "Ahora recorre el año, mes por mes… Enero… febrero… marzo… ¿Qué te dio cada uno?… Una persona, un momento, algo que aprendiste, algo que sobreviviste… Escribe doce cosas que agradeces… Si un mes fue difícil, busca lo pequeño… siempre hay algo.",
            },
            {
              texto: "Prepara tu café sin colar, tómalo despacio pensando en lo que escribiste y deja un poco en el fondo.",
              guia: "Prepara tu café, sin colar… Sírvelo… y tómalo despacio, sorbo a sorbo, leyendo lo que escribiste… Deja un poco en el fondo de la taza… ahí se va a escribir tu respuesta.",
            },
            {
              texto: "Pide un deseo, tapa la taza con el plato, voltéala hacia ti y espera a que se enfríe.",
              accion: "esperar",
              segundos: 180,
              guia: "Piensa en un deseo para el año que viene… Tapa la taza con el plato… y voltéala hacia ti, de un solo movimiento… Ahora esperamos que se enfríe… Mientras tanto, quédate con tu deseo.",
            },
            { texto: "Levanta la taza y toma la foto del interior para que Sibila te la lea.", guia: "Levanta la taza con cuidado… mira las figuras que dejó la borra… y toma la foto del interior… Yo te la leo." },
          ],
          cierre: "Mira tu mesa… tus doce gracias… tu taza… Este año te dio más de lo que creías… Guarda la lista en tu altar… Mañana, el último día, sembramos.",
          herramienta: { href: "/biblioteca/lectura-del-cafe", texto: "La historia de la lectura del café" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu taza", texto: "Sube la foto de tu taza y Sibila te lee los símbolos de la borra y lo que dicen de tu año nuevo. Incluida en el curso.", href: "/cafe", boton: "Que Sibila lea mi taza", lectura: "cafe" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Qué representa cada una de las doce uvas?", opciones: ["Un mes del año que viene", "Un amigo", "Un signo del zodiaco"], correcta: 0, porque: "Se come una por cada campanada, una por cada mes, y con cada una se pide un deseo." },
            { tipo: "opcion", p: "¿Qué se hace en Brasil en Año Nuevo para agradecer a Iemanjá?", opciones: ["Se encienden doce velas", "Se saltan siete olas y se le dejan flores en el mar", "Se come pescado"], correcta: 1, porque: "Vestidos de blanco, se saltan siete olas y se ofrecen flores a la madre de las aguas." },
            { tipo: "abierta", p: "De las doce cosas que agradeces, ¿cuál es la que más te importa?" },
          ],
        },
      ],
    },
    // ───────────────────────────── DÍA 7 ─────────────────────────────
    {
      numero: 7,
      llave: { nombre: "Llave de la Semilla", simbolo: "🌱", saber: "Sembrar el año que viene y leer tres cartas para un cierre." },
      luna: "🌗",
      saludo: "{nombre}, último día. Hoy sembramos lo que viene… y al final te espera mi carta.",
      titulo: "Sembrar el año nuevo",
      resumen: "Las semillas del Nowruz, las lentejas de Italia, la maleta de Latinoamérica, tu carta al año y tus tres cartas.",
      minutos: 30,
      bloques: [
        { tipo: "video", titulo: "Lo que siembras hoy" },
        {
          tipo: "texto",
          titulo: "Sembrar con intención",
          parrafos: [
            "Después de limpiar, soltar y agradecer, llega lo más bonito: sembrar. Ya hay espacio. Ahora elegimos qué crece en él.",
            "En Latinoamérica hay quien sale a dar la vuelta a la manzana con una maleta para que el año traiga viajes, quien guarda lentejas en el bolsillo para la abundancia o quien estrena ropa amarilla. En Italia se comen lentejas en Año Nuevo, porque se parecen a monedas. En Irán se hacen brotar semillas de trigo o lentejas para el Nowruz. Son formas de decir, con el cuerpo, lo que se espera.",
            "Hoy vas a escribir una carta al año que viene, la vas a guardar para abrirla dentro de un año, y vas a sacar tres cartas del tarot: lo que dejas, lo que llevas y lo que llega.",
          ],
        },
        { tipo: "cita", texto: "Lo que siembras en silencio florece cuando menos lo esperas.", origen: "Enseñanza de Sibila" },
        {
          tipo: "saberes",
          titulo: "Para entender",
          items: [
            { titulo: "La semilla", texto: "En casi todas las culturas es el símbolo de lo que todavía no se ve pero ya está. Sembrar es confiar: hacer hoy algo cuyo fruto llegará después." },
            { titulo: "La carta al futuro", texto: "Escribirle a quien serás dentro de un año es un ritual de paciencia: te obliga a decir qué deseas y, al abrirla, te muestra cuánto caminaste." },
            { titulo: "Las tres cartas", texto: "La tirada del pasado, el presente y el futuro es la más antigua y sencilla del tarot. Para cerrar un año, la leemos como lo que dejas, lo que llevas y lo que llega." },
            { titulo: "El papel del primer día", texto: "Hoy lo relees. Lo que escribiste hace siete días ya no es igual a como lo sientes hoy: ese cambio es el ritual cumplido." },
          ],
        },
        {
          tipo: "tradiciones",
          titulo: "Sembrar en el mundo",
          items: [
            { lugar: "Irán", emoji: "🌱", nombre: "El sabzeh", texto: "Para el Nowruz se hacen brotar semillas de trigo o lentejas en un plato; al final de las fiestas se llevan al río: lo verde, para el año que empieza." },
            { lugar: "Italia", emoji: "🇮🇹", nombre: "Lenticchie di Capodanno", texto: "Las lentejas se comen en Año Nuevo porque parecen pequeñas monedas: abundancia para los doce meses." },
            { lugar: "Latinoamérica", emoji: "🧳", nombre: "La maleta y las lentejas", texto: "Dar la vuelta a la manzana con una maleta para viajar, lentejas en el bolsillo para la abundancia, ropa amarilla para la alegría." },
            { lugar: "Japón", emoji: "🎍", nombre: "El kadomatsu", texto: "Arreglos de pino y bambú en la entrada de la casa para recibir al espíritu del año nuevo, que trae la buena cosecha." },
          ],
        },
        {
          tipo: "ritual",
          titulo: "Carta al año que viene",
          fondo: "/escuela/rituales/fondos/luna.mp4",
          apertura:
            "Llegamos al último día… Siéntate frente a tu altar, el mismo del primer día… Mira todo lo que pasó desde entonces… el humo, el huevo, la vela, el papel que ardió, tu mesa de gratitud… Respira… Hoy sembramos.",
          materiales: ["El papel que dejaste bajo la vela el primer día", "Papel nuevo y un sobre", "Tu vela blanca del altar"],
          pasos: [
            {
              texto: "Enciende la vela blanca del altar y relee el papel del primer día.",
              accion: "encender",
              guia: "Enciende la vela blanca del altar… la que espera desde el primer día… Ahora saca el papel que dejaste debajo… y léelo… ¿Cómo lo sientes hoy?… ¿Sigue pesando igual?",
            },
            {
              texto: "Escribe una carta para leer dentro de un año: lo que deseas, cómo quieres sentirte, qué quieres aprender.",
              accion: "escribir",
              ayuda: "Escríbela también en papel para el sobre. Aquí queda en tu grimorio.",
              guia: "Ahora escríbele a quien serás dentro de un año… Cuéntale lo que deseas… cómo quieres sentirte… qué quieres aprender… a quién quieres cerca… Escríbele con cariño… Esa persona va a leerte.",
            },
            { texto: "Guárdala en el sobre, escribe la fecha de hoy y ciérralo.", guia: "Dobla tu carta… guárdala en el sobre… y escribe afuera la fecha de hoy… Ciérralo… Es una semilla." },
            { texto: "Saca tu tirada de tres cartas con Sibila: lo que dejas, lo que llevas y lo que llega.", guia: "Ahora vamos a preguntarle al tarot… Tres cartas… lo que dejas… lo que llevas… y lo que llega… Cuando estés lista o listo, saca tu tirada conmigo." },
            { texto: "Guarda el sobre en un lugar especial. Lo abrirás el próximo diciembre.", guia: "Guarda el sobre en un lugar especial… Un cajón, un libro, tu altar… Dentro de un año lo abrirás… y verás todo lo que creció." },
          ],
          cierre:
            "Mira tu vela encendida… Siete días, siete gestos… preparaste, limpiaste, soltaste, encendiste, agradeciste y sembraste… Este cierre es tuyo… Gracias por caminar conmigo… Ahora, termina tu lección… te espera mi carta.",
          herramienta: { href: "/tarot", texto: "Saca tus tres cartas" },
        },
        { tipo: "entrega", titulo: "Tu tirada de cierre", texto: "Haz tu tirada de tres cartas con Sibila: lo que dejas, lo que llevas y lo que llega. Incluida en el curso.", href: "/tarot", boton: "Sacar mis tres cartas", lectura: "tarot_tres" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Cuál es el orden de estos siete días?", opciones: ["Pedir, limpiar y agradecer", "Preparar, limpiar, soltar, agradecer y sembrar", "Sembrar primero y limpiar al final"], correcta: 1, porque: "Primero se prepara el espacio y se limpia; luego se suelta y se agradece, y al final se siembra lo nuevo." },
            { tipo: "opcion", p: "¿Por qué se comen lentejas en Italia en Año Nuevo?", opciones: ["Porque se parecen a monedas", "Porque son verdes", "Porque crecen rápido"], correcta: 0, porque: "Su forma recuerda a pequeñas monedas: abundancia para el año." },
            { tipo: "abierta", p: "¿Qué quieres sembrar para el año que viene? Sibila lo usará en tu carta de cierre." },
          ],
        },
      ],
    },
  ],
};
