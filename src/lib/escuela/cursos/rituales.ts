import type { Curso } from "../tipos";
import { LIBRO_RITUALES } from "./rituales-libro";

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
    "Un ritual por noche para despedir el año con intención: preparar tu espacio, limpiar, encender la vela correcta, soltar lo que pesa, agradecer y sembrar lo que viene. Cada lección trae un video de Sibila, la historia de la tradición y cómo se vive en el mundo, un ritual guiado con su voz, una práctica para los días siguientes y, cuando hay foto, Sibila te lee lo que quedó. La octava noche diseñas tu propio ritual y presentas la prueba del Primer Círculo.",
  promesas: [
    "7 noches de ritual y la noche del Círculo (unas 8 horas en total con las prácticas, a tu ritmo)",
    "En cada lección, «Para profundizar»: la historia larga, para leer o escuchar",
    "Una práctica entre lunas para los días siguientes",
    "Tu propio ritual, revisado por Sibila, y la prueba del Primer Círculo",
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
  garantiaDias: 7,
  libro: LIBRO_RITUALES,
  lecciones: [
    // ───────────────────────────── DÍA 1 ─────────────────────────────
    {
      numero: 1,
      llave: { nombre: "Llave del Altar", simbolo: "🕯️", saber: "Preparar un espacio sagrado y nombrar una intención." },
      luna: "🌑",
      saludo: "{nombre}, hoy empieza tu cierre de año. Antes de encender nada, vamos a preparar el lugar donde va a pasar todo.",
      titulo: "Qué es un ritual: intención, espacio y momento",
      resumen: "Qué convierte un gesto en ritual, cómo lo viven distintas culturas y tu altar para estos siete días.",
      minutos: 35,
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
          tipo: "profundizar",
          titulo: "La anatomía de un ritual",
          parrafos: [
            "Si miras con atención cualquier ritual del mundo, una boda, un altar de muertos, una vela ante una imagen, vas a encontrar siempre la misma arquitectura. Conocerla es lo que separa a quien repite un ritual de quien sabe crearlo. Por eso empezamos por aquí: al final de estos siete días, tú vas a diseñar el tuyo.",
            "Primero, la apertura. Es el momento en que se marca que algo distinto va a empezar: se apagan las luces fuertes, se respira, se enciende el fuego, se dice una palabra. En la misa es la señal de la cruz; en una ceremonia andina, el saludo a los cuatro rumbos; en tu casa puede ser simplemente sentarte frente al altar y cerrar los ojos. Sin apertura, el ritual se confunde con lo cotidiano.",
            "Después, la intención. Es el porqué del ritual, dicho con tus palabras y, si se puede, en voz alta. La tradición dice que la intención que se nombra empieza a moverse. Por eso conviene que sea una sola, clara, en presente: no «ojalá algún día», sino «cierro este año con gratitud».",
            "Luego, la acción: el gesto que lleva la intención al cuerpo. Encender, pasar el humo, romper el huevo, quemar el papel, sembrar la semilla. La acción usa los elementos, fuego, agua, tierra y aire, porque las tradiciones dicen que lo que tocamos con las manos se graba más hondo que lo que solo pensamos.",
            "Por último, el cierre. Se agradece, se apaga, se devuelve a la tierra lo que se usó y se vuelve a la vida de todos los días. El cierre es tan importante como la apertura: un ritual sin cierre queda abierto, como una puerta que nadie cerró. Las abuelas lo sabían: después de la limpia, un vaso de agua y descanso.",
            "Alrededor de esas cuatro piezas están el espacio y el momento. Los antiguos romanos tenían en cada casa un pequeño altar, el lararium, donde cada día se ofrecía a los lares, los espíritus protectores del hogar. Los griegos honraban a Hestia en el fuego del hogar, el centro de la casa. Y casi todos los pueblos eligieron el umbral, la puerta, el atardecer, el cambio de año, como el momento de los ritos: en latín, umbral se dice limen, y de ahí viene la palabra «liminal», lo que está en el borde.",
            "El antropólogo Victor Turner, siguiendo a Van Gennep, llamó así a ese estado de en medio: ya no eres quien eras y todavía no eres quien serás. Estos siete días son exactamente eso. Tu altar es el umbral. Cada noche que vuelves a él, cruzas un poco más.",
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
            { tipo: "abierta", p: "¿Qué quieres cerrar este año? Cuéntaselo a Sibila.", ayuda: "Lo que escribas aquí lo usará Sibila en tu carta de cierre, al final del camino." },
          ],
        },
        {
          tipo: "practica",
          titulo: "Tres minutos frente al altar",
          texto: "Hasta la próxima lección, vuelve a tu altar una vez al día. No hace falta encender nada: la repetición es lo que convierte un rincón en un lugar sagrado.",
          pasos: ["Siéntate frente al altar tres minutos, con la espalda recta.", "Pon una mano sobre el paño y repite tu intención en voz baja.", "Por la mañana, cambia el agua del vaso y tira la vieja a una planta o al desagüe.", "Antes de irte, agradece. Nada más."],
          pregunta: "¿Pudiste volver a tu altar? ¿Qué notaste al repetir tu intención?",
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
      minutos: 35,
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
          tipo: "profundizar",
          titulo: "El humo sagrado: de los templos de Arabia a tu casa",
          parrafos: [
            "Hace más de tres mil años, las caravanas cruzaban el desierto de Arabia cargadas de una mercancía más valiosa que el oro: resinas aromáticas. El olíbano, que en muchas lenguas se llama simplemente incienso, crecía en los árboles de Dhofar, en el sur de Omán, y en las costas de Somalia. Desde allí viajaba por la Ruta del Incienso hasta Egipto, Jerusalén, Grecia y Roma. Hoy esos paisajes son patrimonio de la humanidad.",
            "En los templos de Egipto se quemaba incienso al amanecer, al mediodía y al atardecer, y los sacerdotes preparaban el kyphi, una mezcla de resinas, miel y vino para la noche. En el templo de Jerusalén había un altar solo para el incienso. Los griegos llamaban thymiama a la ofrenda de humo, y los romanos la llevaron a cada casa. El humo subía, decían, hasta donde la voz no alcanza.",
            "Del otro lado del océano, los pueblos de Mesoamérica hacían lo mismo con el copal, que los mayas llaman pom. Lo quemaban en sus templos, en las cuevas sagradas y en los campos de maíz. Todavía hoy, en México y Guatemala, el copal perfuma los altares de muertos, las procesiones y las limpias de las curanderas. En los Andes se sahúma con q'uwa y otras hierbas de altura en las ofrendas a la Pachamama.",
            "La Iglesia heredó el humo de Roma y de Jerusalén. En la catedral de Santiago de Compostela, desde la Edad Media, el botafumeiro, un incensario enorme, vuela de un lado a otro de la nave colgado de una cuerda, movido por ocho hombres. Dicen que nació para perfumar a los peregrinos que llegaban después de semanas de camino; con el tiempo se volvió una de las imágenes más hermosas del humo sagrado.",
            "En el mundo árabe y en el Golfo, el humo es hospitalidad. El bakhoor se quema en el mabkhara y se pasa por la casa antes de que lleguen los invitados; al despedirlos, se les ofrece el humo para que perfumen su ropa. En Turquía e Irán, las semillas de üzerlik o espand se queman cuando alguien recibe demasiados elogios: el chasquido de la semilla rompe la mirada pesada.",
            "¿Por qué el humo limpia? La tradición da varias respuestas que se parecen. Porque es aire que se ve: hace visible lo invisible. Porque sube: lleva hacia arriba lo que pedimos. Porque se va: sale por la ventana y se lleva lo que ya no es nuestro. Por eso la regla de casi todas las tradiciones es la misma que seguiste hoy: de adentro hacia afuera, de los rincones a la puerta, con las ventanas abiertas.",
            "Una palabra sobre el respeto. Algunas plantas sagradas se volvieron moda y hoy escasean: el palo santo, por ejemplo, debe venir de madera caída, y hay salvias silvestres sobreexplotadas. La tradición enseña que no hace falta lo raro: el romero de tu cocina, el laurel, la canela, una resina comprada con cuidado. Lo que limpia es tu recorrido, no la etiqueta.",
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
        {
          tipo: "practica",
          titulo: "El aire de cada mañana",
          texto: "El humo limpió tu casa; ahora la mantenemos respirando. Hasta la próxima lección, empieza el día dejando entrar aire nuevo.",
          pasos: ["Al levantarte, abre las ventanas cinco minutos, aunque haga frío.", "Si te sobraron hierbas, sahúma un solo rincón que sientas pesado.", "Fíjate en los olores de tu casa: cuáles te gustan, cuáles no.", "Deja una ramita de romero o laurel en la entrada."],
          pregunta: "¿Cómo se sintió tu casa estos días? ¿Hubo un rincón que siguió pesando?",
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
      minutos: 40,
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
          tipo: "profundizar",
          titulo: "La mirada, el huevo y el agua que habla",
          parrafos: [
            "Pocas creencias están tan extendidas en el mundo como la del mal de ojo. En Grecia se llama mati; en Italia, malocchio; en Turquía y el mundo árabe, nazar o ayn; en América Latina, simplemente ojo. Ya el filósofo Plutarco, hace casi dos mil años, dedicó una de sus conversaciones de sobremesa a preguntarse por qué algunas miradas parecen dañar. La idea es siempre la misma: una mirada cargada de envidia, o de admiración excesiva, deja un peso en quien la recibe.",
            "Por eso los amuletos que protegen de la mirada se parecen tanto entre sí: el ojo de vidrio azul de Turquía y Grecia, la khamsa o mano de cinco dedos del Magreb, el cuerno rojo de Nápoles, la pulsera roja de los bebés en Latinoamérica, el azabache de Galicia y del Caribe. Todos tienen la misma función: devolver la mirada o atraparla antes de que llegue.",
            "El huevo ocupa un lugar especial en las historias del origen. Los órficos griegos contaban que el mundo nació de un huevo cósmico; en la India, el Hiranyagarbha, el embrión de oro; en China, Pangu despertó dentro de un huevo y separó el cielo de la tierra. Un objeto que contiene la vida entera, cerrado, perfecto. No es raro que tantas tradiciones lo eligieran para recoger lo que pesa: es la vida que absorbe y protege a la vida.",
            "La limpia con huevo que hoy hiciste es mestiza, como América. Los pueblos de Mesoamérica ya barrían el cuerpo con ramas de hierbas, flores y copal; los europeos trajeron la gallina y su huevo. Las curanderas unieron las dos cosas y crearon algo nuevo que se hace desde México hasta la Patagonia, y en cada botánica de Nueva York, Miami o San Juan. Suele acompañarse de oraciones, del nombre de la persona dicho en voz alta y de una ramita de ruda o de albahaca.",
            "Leer el agua es todavía más antiguo. En la Mesopotamia de hace cuatro mil años, los sacerdotes adivinos vertían aceite en un cuenco con agua y leían las formas: se llamó lecanomancia. El malocchio italiano es su pariente directo: gotas de aceite que se unen en forma de ojo. En Turquía, el kurşun dökme vierte plomo derretido en agua; en Europa central se hacía lo mismo con plomo o cera la noche de Año Nuevo. Siempre el agua como espejo de lo que no se ve.",
            "Las curanderas tienen cada una su escuela para leer el vaso, y conviene saber que no hay una sola verdad. Lo que todas comparten es la actitud: mirar sin miedo, con calma, y recordar que lo que aparece en el vaso es lo que se fue, no lo que se quedó. Por eso, después de leerlo, se desecha lejos de la casa, se lava uno las manos y se bebe agua fresca.",
            "Si quieres seguir aprendiendo, El Arcano tiene la historia completa de la limpia y del mal de ojo en distintas culturas, y en tu libro de consulta encontrarás la tabla para leer el vaso.",
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
        {
          tipo: "practica",
          titulo: "Agua y sal en la entrada",
          texto: "Una práctica de las abuelas para la noche después de una limpia: el agua con sal recoge lo que quedó en el aire de la casa.",
          pasos: ["Antes de dormir, llena un vaso con agua y una cucharada de sal.", "Déjalo junto a la puerta de entrada, por dentro.", "Al despertar, tíralo al desagüe sin mirarlo mucho y lava el vaso.", "Bebe agua fresca y fíjate si recuerdas lo que soñaste."],
          pregunta: "¿Cómo dormiste después de tu limpia? ¿Soñaste algo que quieras guardar?",
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
      minutos: 40,
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
          tipo: "rueda",
          titulo: "La rueda de las intenciones",
          texto: "Elige una intención y mira cómo cambia la llama: cada deseo tiene su color, su día, su astro, su Luna, su planta y su piedra.",
        },
        {
          tipo: "profundizar",
          titulo: "La luz que acompaña: historia de la vela y de los siete días",
          parrafos: [
            "Antes de la vela fue la lámpara: un cuenco de barro con aceite y una mecha. Así se alumbraban los templos de Egipto, de Grecia y de Roma, y así siguen las diyas de la India en Diwali. Los romanos fabricaron las primeras velas sumergiendo papiro o juncos en sebo una y otra vez; de su palabra candela vienen candelabro y candelaria.",
            "La cera de abeja fue durante siglos un lujo: ardía limpia, sin humo ni mal olor, y por eso se reservó para los templos y las iglesias. Se decía que las abejas, que viven en comunidad y trabajan para la reina, hacían una luz pura. En la fiesta de la Candelaria, el 2 de febrero, se bendicen las velas que acompañarán a la familia todo el año, y en muchos pueblos de América se guardan para encenderlas en las tormentas.",
            "Las veladoras de siete días, en su vaso de vidrio, son la forma latinoamericana de la vela votiva: se encienden ante la imagen de un santo, una virgen o la foto de alguien querido, y acompañan el pedido una semana entera. Los colores se fueron asociando a las intenciones por tradición popular, por la liturgia y por los astros: así se formó el lenguaje que hoy aprendiste.",
            "¿Por qué cada día tiene su astro? Los astrónomos de la antigüedad veían siete luces que se movían contra el fondo de estrellas fijas: Saturno, Júpiter, Marte, el Sol, Venus, Mercurio y la Luna, en ese orden, del más lento al más rápido. Asignaron a cada hora del día uno de ellos, en ese orden, y el astro de la primera hora daba nombre al día. El historiador romano Dion Casio lo explicó hace casi dos mil años, y por eso la semana sigue ese orden hasta hoy: el día del Sol, de la Luna, de Marte, de Mercurio, de Júpiter, de Venus y de Saturno.",
            "En español se conservan casi todos: lunes, martes, miércoles, jueves y viernes. El sábado viene del hebreo shabat, el día de descanso, y el domingo, del latín dominicus, el día del Señor. Pero en inglés el sábado sigue siendo de Saturno, Saturday, y el domingo, del Sol, Sunday. Cuando eliges el jueves para la abundancia, estás usando un calendario de miles de años.",
            "La Luna marca el otro ritmo. Durante unos catorce días crece, y durante otros catorce mengua. Las tradiciones agrícolas sembraban y cosechaban con ella, y los rituales la siguen: la creciente para atraer, la llena para culminar y agradecer, la menguante para soltar, la nueva para sembrar en silencio. No hace falta esperar la fecha perfecta: si el día y la Luna coinciden, mejor; si no, la intención manda.",
            "Y una costumbre que vale la pena guardar: la vela de ritual no se sopla. La tradición dice que el soplo dispersa la intención; se apaga con los dedos humedecidos, con un apagavelas o tapándola, y se agradece. Así la llama se despide sin violencia, como debe terminar todo lo que se hizo con cuidado.",
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
        {
          tipo: "practica",
          titulo: "Leer la llama",
          texto: "Tu vela sigue hablando mientras arde. Hasta la próxima lección, regálale unos minutos de atención cada vez que esté encendida.",
          pasos: ["Cuando tu vela esté encendida, siéntate frente a ella tres minutos.", "Observa la llama: ¿alta y quieta, baila, chispea, echa humo?", "Anota en una línea lo que viste, con la fecha.", "Apágala sin soplar y agradece."],
          pregunta: "¿Cómo ardió tu vela? ¿Qué te dijo la llama?",
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
      minutos: 35,
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
          tipo: "profundizar",
          titulo: "Los fuegos del cambio en el mundo",
          parrafos: [
            "Pocas imágenes son tan universales como la de una hoguera en la noche del cambio. En el antiguo Irán, el fuego era sagrado: los templos zoroastrianos mantienen todavía hoy llamas encendidas durante siglos, porque el fuego es la luz de la verdad. De esa tradición viene el Chaharshanbe Suri, la última noche de miércoles antes del año nuevo persa, en que se salta sobre las fogatas diciendo: «mi palidez para ti, tu fuerza roja para mí».",
            "En España y en buena parte de América Latina, la noche de San Juan, entre el 23 y el 24 de junio, se encienden hogueras y se salta sobre ellas tres o siete veces; se escriben deseos y miedos en papeles y se arrojan al fuego. Es una fiesta cristiana sobre una más antigua, la del solsticio de verano en el norte, cuando la noche es la más corta del año.",
            "En Valencia, cada marzo, las Fallas levantan enormes figuras de cartón y madera, los ninots, que critican con humor lo que pasó en el año. La noche del 19, la Cremà, todas arden a la vez. La UNESCO las reconoció como patrimonio inmaterial de la humanidad. Es la misma idea de los años viejos de Ecuador y de los Andes: dar forma a lo que se va y despedirlo con fuego, en comunidad, con lágrimas y con risa.",
            "En muchos pueblos de América, el Sábado de Gloria se quema al Judas, un muñeco que representa la traición y lo que no se quiere en la comunidad. Y en Japón, al final del año, los santuarios sintoístas reciben muñecos de papel en los que cada persona traspasó sus impurezas, para purificarlos. El gesto es universal: poner afuera lo que pesa adentro, para poder verlo y entregarlo.",
            "¿Y la ceniza? El Miércoles de Ceniza, en la tradición católica, se marca la frente con la ceniza de los ramos del año anterior: lo que fue verde y vivo vuelve como recuerdo de que todo se transforma. En el campo, la ceniza de la hoguera se esparce sobre la tierra porque la nutre. Por eso, en tu ritual, la ceniza no se tira a la basura: vuelve a la tierra para que lo que soltaste se convierta en abono.",
            "Los alquimistas, que soñaban con transformar la materia, llamaban calcinatio al primer paso de su obra: quemar hasta la ceniza para separar lo puro de lo impuro. Lo leían también como una enseñanza para el alma. No hace falta creer en la piedra filosofal para entenderlo: a veces hay que dejar arder lo que fuimos para descubrir qué queda.",
            "Soltar no es olvidar, ni negar, ni fingir que no dolió. La tradición lo dice con las palabras que usaste hoy: «te agradezco lo que me enseñaste». Se suelta con gratitud, porque lo que se suelta con rabia vuelve; lo que se suelta agradeciendo, se va en paz.",
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
        {
          tipo: "practica",
          titulo: "Una cosa menos",
          texto: "Soltar también se hace con las cosas. Hasta la próxima lección, deja ir algo material que ya no te acompaña.",
          pasos: ["Elige un objeto que ya no usas o que te trae un recuerdo pesado.", "Agradécele en voz baja lo que fue.", "Regálalo, dónalo o deséchalo con respeto.", "Fíjate en el espacio vacío que dejó: es lugar para lo nuevo."],
          pregunta: "¿Qué soltaste? ¿Cómo se sintió el espacio que quedó?",
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
      minutos: 40,
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
          tipo: "profundizar",
          titulo: "La mesa, el café y el arte de leer la taza",
          parrafos: [
            "La gratitud es quizás el ritual más antiguo de todos. Los pueblos agrícolas agradecían la cosecha con fiestas y ofrendas: en los Andes, cada agosto, se abre la tierra para darle de comer a la Pachamama con hojas de coca, chicha, dulces y flores, porque se cree que en ese mes la tierra tiene hambre. Agradecer es devolver un poco de lo que se recibió.",
            "El café nació en las tierras altas de Etiopía y cruzó el mar hacia Yemen, donde los sufíes lo tomaban para mantenerse despiertos en sus oraciones nocturnas. Desde el puerto de Moca llegó a La Meca, a El Cairo y, en el siglo XVI, a Estambul, donde se abrieron algunos de los primeros cafés del mundo, alrededor de 1550. Allí nació el café turco: molido como polvo, hervido lentamente en el cezve y servido sin colar, con su espuma.",
            "En el mundo árabe, el café es hospitalidad sagrada. Se prepara con cardamomo en la dallah, la cafetera de pico largo, y se sirve en tacitas sin asa llamadas finjan. Quien sirve sostiene la cafetera con la mano izquierda y la taza con la derecha; el invitado sacude suavemente la taza cuando ya no quiere más. La UNESCO reconoció en 2013 la cultura del café turco y en 2015 el café árabe como patrimonio inmaterial de la humanidad.",
            "La lectura de la borra nació de esa sobremesa. Después de tomar, se tapa la taza con el plato, se pide un deseo, se voltea hacia uno mismo y se espera a que se enfríe. Luego alguien de la familia, casi siempre una mujer mayor, lee las figuras. En Europa se hizo lo mismo con las hojas de té desde el siglo XVII, y se le dio un nombre culto: tasseografía, de la palabra francesa tasse, taza.",
            "La taza tiene un mapa. Muchas lectoras dicen que la zona cerca del asa eres tú y tu casa; lo que está lejos del asa, los demás y lo que viene de afuera. El borde habla de lo próximo; el fondo, de lo lejano o de lo profundo. Las figuras claras y abiertas son caminos que se abren; las líneas, viajes; los pájaros, noticias; un corazón, amor; un anillo, compromiso. Y casi siempre se lee también el plato, que muestra lo que se va.",
            "En Brasil, la gratitud mira al mar: el 31 de diciembre millones de personas vestidas de blanco llevan flores a Iemanjá, la madre de las aguas, y saltan siete olas pidiendo un deseo con cada una. En Salvador de Bahía, el 2 de febrero, los pescadores le llevan barcas llenas de regalos. Agradecer al agua es reconocer que nos sostiene.",
            "Las doce uvas tienen una historia más reciente: se cuenta que a comienzos del siglo XX los productores de uva de Alicante tuvieron una cosecha enorme y popularizaron la costumbre de comer una por campanada. Sea cual sea su origen, viajó a toda América porque tiene algo profundamente ritual: doce gestos, doce deseos, el año entero en la palma de la mano.",
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
        {
          tipo: "practica",
          titulo: "Tres gracias antes de dormir",
          texto: "La gratitud se entrena como un músculo. Hasta la próxima lección, termina cada día agradeciendo.",
          pasos: ["Antes de dormir, escribe tres cosas que agradeces de ese día, aunque sean pequeñas.", "Dile «gracias» de verdad a una persona, mirándola a los ojos.", "Si tomas café, voltea otra vez la taza y mira qué figura aparece primero.", "Guarda la lista junto a la de las doce gracias."],
          pregunta: "¿A quién le diste las gracias? ¿Qué agradeciste que no esperabas?",
        },
      ],
    },
    // ───────────────────────────── DÍA 7 ─────────────────────────────
    {
      numero: 7,
      llave: { nombre: "Llave de la Semilla", simbolo: "🌱", saber: "Sembrar el año que viene y leer tres cartas para un cierre." },
      luna: "🌗",
      saludo: "{nombre}, séptima noche. Hoy sembramos lo que viene… y mañana te espera la noche del Círculo.",
      titulo: "Sembrar el año nuevo",
      resumen: "Las semillas del Nowruz, las lentejas de Italia, la maleta de Latinoamérica, tu carta al año y tus tres cartas.",
      minutos: 40,
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
          tipo: "profundizar",
          titulo: "Las semillas del tiempo y las cartas que hablan",
          parrafos: [
            "Sembrar para el año nuevo es una de las costumbres más antiguas del mundo. Para el Nowruz, el año nuevo persa que llega con el equinoccio de primavera, cada familia hace brotar semillas de trigo, lentejas o cebada en un plato: el sabzeh. Lo pone en la mesa del haft-sin junto a la manzana, el ajo, el vinagre y las monedas. El día trece de las fiestas, el Sizdah Bedar, la familia sale al campo y arroja los brotes al agua que corre, llevándose con ellos lo malo del año.",
            "En la antigua Grecia, las mujeres sembraban en macetas los jardines de Adonis: semillas que brotaban muy rápido y se marchitaban pronto, para llorar al joven amado de Afrodita que moría y renacía cada año. En Sicilia y el sur de Italia, todavía hoy se hacen brotar granos de trigo en la oscuridad para adornar los altares del Jueves Santo: brotes pálidos que hablan de la vida que vuelve.",
            "La semilla enseña paciencia. Lo que siembras hoy no se ve mañana. Por eso tantas tradiciones acompañan la siembra con una espera: la carta que escribiste hoy y abrirás dentro de un año es una semilla de tiempo. Las cápsulas del tiempo modernas, enterradas en los cimientos de un edificio para que alguien las abra dentro de cien años, son el mismo gesto: confiar en que alguien, tú misma o tú mismo, estará ahí para recibirla.",
            "Las cartas del tarot nacieron en el norte de Italia en el siglo XV, como un juego de naipes de lujo para las cortes de Milán y Ferrara: los tarocchi, con sus triunfos pintados a mano. Durante tres siglos fueron sobre todo un juego. A finales del siglo XVIII, en París, Antoine Court de Gébelin escribió que guardaban la sabiduría de Egipto, y un adivino llamado Etteilla publicó la primera forma de leerlas. Desde entonces, el tarot se volvió un lenguaje de símbolos para mirarse por dentro.",
            "La tirada de tres cartas es la más sencilla y la más antigua de las que se usan hoy: pasado, presente y futuro. Para un cierre de año la leemos como lo que dejas, lo que llevas y lo que llega. Lo importante no es si la carta es «buena» o «mala», sino qué te dice a ti: el tarot habla en imágenes, y cada imagen se abre de manera distinta para cada persona.",
            "Hoy, además, releíste el papel del primer día. Esa es la prueba más hermosa de un ritual: no lo que pasa afuera, sino cómo cambió la manera en que lo sientes. Si algo pesa menos, si una palabra ya no te representa, si te dan ganas de corregirla, el ritual hizo su trabajo.",
            "Mañana es la noche del Círculo. No vas a seguir un ritual mío: vas a crear el tuyo. Esta noche, antes de dormir, piensa qué te gustaría pedir, agradecer o soltar con tus propias manos. Ya tienes las siete llaves.",
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
            "Mira tu vela encendida… Siete días, siete gestos… preparaste, limpiaste, soltaste, encendiste, agradeciste y sembraste… Ya tienes las siete llaves… Termina tu lección… y descansa… La próxima es la noche del Círculo: ahí el ritual lo creas tú.",
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
        {
          tipo: "practica",
          titulo: "La semilla en el plato y tu ritual",
          texto: "Como en el Nowruz, vas a hacer brotar algo mientras imaginas tu propio ritual para la noche del Círculo.",
          pasos: ["Pon algodón húmedo en un plato y siembra un puñado de lentejas o de trigo.", "Déjalo junto a tu altar y riégalo con unas gotas cada día.", "Mientras lo riegas, piensa qué quieres pedir, agradecer o soltar en tu propio ritual.", "Anota ideas: qué intención, qué día, qué elementos, cómo empezarías y cómo cerrarías."],
          pregunta: "¿Brotó tu semilla? ¿Qué ritual imaginas para la noche del Círculo?",
        },
      ],
    },
    // ─────────────────────── LA NOCHE DEL CÍRCULO ───────────────────────
    {
      numero: 8,
      final: true,
      llave: { nombre: "Sello del Primer Círculo", simbolo: "✦", saber: "Diseñar y sostener tu propio ritual: intención, momento, elementos, apertura, acción y cierre." },
      luna: "🌘",
      saludo: "{nombre}, tienes las siete llaves. Esta noche no te guío yo: tú creas tu ritual, yo lo leo contigo, y después presentas tu prueba.",
      titulo: "La noche del Círculo: tu propio ritual",
      resumen: "Lo que hace a una maestra o un maestro: crear un ritual propio. Sibila lo revisa y presentas la prueba del Primer Círculo.",
      minutos: 45,
      bloques: [
        { tipo: "video", titulo: "Sibila te espera en el Círculo" },
        {
          tipo: "texto",
          titulo: "Lo que hace a una maestra",
          parrafos: [
            "Durante siete noches seguiste mis rituales. Preparaste un altar, limpiaste tu casa con humo, pasaste el huevo, encendiste tu vela, quemaste lo que pesaba, agradeciste en tu mesa y sembraste. Cada gesto te dio una llave.",
            "Pero una maestra, un maestro, no es quien repite un ritual: es quien sabe crearlo. Quien entiende por qué se abre y por qué se cierra, por qué ese color y no otro, por qué esa Luna, qué elemento pide cada intención. Esta noche vas a demostrarte que ya lo sabes.",
            "Primero vas a diseñar tu propio ritual, con tus palabras, para algo que de verdad quieras pedir, agradecer o soltar en el año que viene. Yo lo voy a leer y te voy a decir lo que veo, como hacían las maestras con sus aprendices. Puedes corregirlo y enviármelo de nuevo.",
            "Después vas a presentar la prueba del Primer Círculo: quince preguntas sobre lo que aprendiste en estos siete días. Si te equivocas, no pasa nada: repasas tu grimorio y tu libro de consulta, y vuelves a intentarlo. Cuando la superes, recibirás tu sello, tu grado y mi carta.",
          ],
        },
        { tipo: "cita", texto: "La aprendiz sigue el ritual. La maestra sabe por qué existe.", origen: "Enseñanza de Sibila" },
        {
          tipo: "saberes",
          titulo: "Las piezas de tu ritual",
          items: [
            { titulo: "La intención", texto: "Una sola, clara, en presente y con tus palabras. Pregúntate: ¿quiero atraer, agradecer, proteger o soltar? De eso depende todo lo demás." },
            { titulo: "El momento", texto: "El día de su astro, la fase de la Luna que la acompaña (creciente para atraer, menguante para soltar, llena para agradecer, nueva para sembrar) y una hora de umbral: el amanecer o el anochecer." },
            { titulo: "Los elementos", texto: "La vela del color de tu intención, el agua, el humo, la tierra, las plantas o las piedras que le correspondan. Tu libro de consulta tiene las tablas." },
            { titulo: "Abrir y cerrar", texto: "La apertura marca que empieza algo distinto; el cierre agradece, apaga sin soplar y devuelve a la tierra lo que se usó. Un ritual sin cierre queda abierto." },
          ],
        },
        {
          tipo: "proyecto",
          titulo: "Tu propio ritual",
          texto: "Escríbelo como si se lo fueras a enseñar a otra persona. No tiene que ser largo: tiene que tener sentido. Completa al menos cuatro partes; cuantas más completes, mejor podrá leerlo Sibila.",
          campos: [
            { clave: "nombre", etiqueta: "El nombre de tu ritual", ayuda: "Ponle un nombre que te guste. Por ejemplo: «La vela del camino abierto»." },
            { clave: "intencion", etiqueta: "Tu intención", ayuda: "¿Qué pides, agradeces, proteges o sueltas? Escríbela en presente, con tus palabras." },
            { clave: "momento", etiqueta: "El momento", ayuda: "Qué día de la semana, qué fase de la Luna y a qué hora, y por qué los elegiste." },
            { clave: "elementos", etiqueta: "Los elementos y el espacio", ayuda: "Qué vas a usar (color de la vela, agua, humo, plantas, piedras, papel) y dónde lo vas a hacer." },
            { clave: "apertura", etiqueta: "La apertura", ayuda: "Cómo empieza: qué haces o dices para marcar que el ritual comienza." },
            { clave: "accion", etiqueta: "La acción", ayuda: "Los pasos del ritual, en orden: el gesto que lleva tu intención al cuerpo." },
            { clave: "cierre", etiqueta: "El cierre", ayuda: "Cómo agradeces, cómo apagas y qué haces con lo que usaste." },
          ],
        },
        {
          tipo: "test",
          titulo: "La prueba del Primer Círculo",
          aprobar: 11,
          preguntas: [
            { tipo: "opcion", p: "¿Qué tres piezas convierten un gesto en ritual?", opciones: ["Objetos caros, una hora exacta y un maestro", "La intención, el espacio y el momento", "El fuego, el agua y la sal"], correcta: 1, porque: "Lo que hace un ritual es la intención con que lo haces, el lugar que separas y el momento que eliges." },
            { tipo: "opcion", p: "Según Van Gennep, ¿cuáles son los tres momentos de un rito de paso?", opciones: ["Pedir, esperar y recibir", "Separarse, cruzar el umbral y volver con algo nuevo", "Encender, mirar y apagar"], correcta: 1, porque: "Separación, umbral y regreso: el camino que siguieron tus siete noches." },
            { tipo: "opcion", p: "¿Por qué es tan importante el cierre de un ritual?", opciones: ["Porque un ritual sin cierre queda abierto", "Porque es la parte más larga", "No es importante: basta con la intención"], correcta: 0, porque: "Se agradece, se apaga, se devuelve lo que se usó y se vuelve a la vida de todos los días." },
            { tipo: "opcion", p: "Al sahumar una casa, ¿cómo se recorre?", opciones: ["De la puerta hacia adentro, para que el humo se quede", "Del rincón más lejano hacia la puerta, con las ventanas abiertas", "Solo en el dormitorio"], correcta: 1, porque: "De adentro hacia afuera: el humo se despide por la puerta y se lleva lo que nombraste." },
            { tipo: "opcion", p: "¿De qué lengua viene la palabra «copal»?", opciones: ["Del árabe", "Del latín", "Del náhuatl copalli"], correcta: 2, porque: "Los mexicas lo llamaban copalli; los mayas lo llaman pom." },
            { tipo: "opcion", p: "¿Qué se hace con las semillas de üzerlik o espand?", opciones: ["Se queman contra el mal de ojo; nunca se comen", "Se hierven en té", "Se siembran en Año Nuevo"], correcta: 0, porque: "Se queman y su chasquido, dice la tradición, rompe la mirada pesada. Pueden ser tóxicas: no se ingieren." },
            { tipo: "opcion", p: "En la limpia con huevo, ¿qué se hace con el huevo y el agua al terminar?", opciones: ["Se guardan en el altar una semana", "Se desechan lejos de la casa y se lavan las manos", "Se cocinan"], correcta: 1, porque: "Lo que se recogió no se queda en casa: se devuelve a la tierra o se desecha lejos." },
            { tipo: "opcion", p: "¿Cómo se descubre el malocchio en la tradición italiana?", opciones: ["Con gotas de aceite en un plato con agua", "Con plomo derretido", "Con hojas de té"], correcta: 0, porque: "Si el aceite se abre y forma un ojo, había malocchio. Es pariente de la antigua lecanomancia." },
            { tipo: "opcion", p: "Para la claridad en una decisión, ¿qué sigue la tradición?", opciones: ["Vela negra, sábado", "Vela amarilla, miércoles (Mercurio)", "Vela rosa, viernes"], correcta: 1, porque: "El amarillo es la claridad y el miércoles es de Mercurio, el astro de las palabras y las decisiones." },
            { tipo: "opcion", p: "¿Cómo se viste una vela para soltar algo?", opciones: ["Con aceite de la base hacia la mecha", "Con aceite de la mecha hacia la base", "No se viste nunca"], correcta: 1, porque: "Hacia abajo, de la mecha a la base, para soltar; hacia arriba, para atraer." },
            { tipo: "opcion", p: "¿De qué astro es el viernes?", opciones: ["De Venus: el amor y la reconciliación", "De Saturno", "Del Sol"], correcta: 0, porque: "Viernes viene de Veneris dies, el día de Venus." },
            { tipo: "opcion", p: "¿Qué fase de la Luna se elige para sembrar una intención en silencio?", opciones: ["La Luna nueva", "La Luna llena", "Ninguna en especial"], correcta: 0, porque: "La nueva es la semilla en la tierra oscura; la creciente atrae, la llena culmina y la menguante suelta." },
            { tipo: "opcion", p: "Después de quemar el papel, ¿qué se hace con la ceniza?", opciones: ["Se tira a la basura de la cocina", "Se guarda en el bolsillo", "Se devuelve a la tierra, a una maceta o al jardín"], correcta: 2, porque: "Lo que soltaste se convierte en abono para lo que vas a sembrar." },
            { tipo: "opcion", p: "¿Qué hace la familia persa con el sabzeh al final del Nowruz?", opciones: ["Lo arroja al agua que corre", "Lo quema", "Lo regala a los vecinos"], correcta: 0, porque: "El día trece, Sizdah Bedar, los brotes se llevan al río y se llevan con ellos lo malo del año." },
            { tipo: "opcion", p: "¿Qué enseña la ética del ritual?", opciones: ["Que un ritual puede reemplazar al médico", "Que se puede hacer un ritual sobre otra persona sin su permiso", "Ritualizar sobre lo propio y buscar ayuda profesional cuando hace falta"], correcta: 2, porque: "El ritual acompaña tu casa, tus emociones y tus decisiones; no sustituye a un profesional ni se impone a otra persona." },
          ],
        },
        {
          tipo: "practica",
          titulo: "Tu ritual, una vez al mes",
          texto: "Un ritual se vuelve tuyo cuando lo repites. Después de cerrar el Círculo, llévalo contigo al año que viene.",
          pasos: ["Haz tu propio ritual en la próxima Luna que le corresponda.", "Vuelve a tu altar cada Luna nueva o llena, aunque sea tres minutos.", "Anota en tu grimorio lo que cambia de una vez a otra.", "El próximo diciembre, abre la carta que escribiste la séptima noche."],
          pregunta: "¿Cuándo vas a hacer tu ritual por primera vez?",
        },
      ],
    },
  ],
};
