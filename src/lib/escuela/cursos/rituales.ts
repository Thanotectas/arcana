import type { Curso } from "../tipos";

/**
 * Curso piloto: «7 días para cerrar el año». Una lección por día; cada una se apoya en una lectura que ya existe en
 * Arcana (vaso, vela, taza, tarot). Desde adentro de la tradición, sin promesas de resultados, salud ni dinero.
 */
export const CURSO_RITUALES: Curso = {
  slug: "rituales",
  titulo: "7 días para cerrar el año",
  subtitulo: "Curso de rituales con Sibila",
  descripcion:
    "Un ritual por día para despedir el año con intención: preparar tu espacio, limpiar, encender la vela correcta, soltar lo que pesa, agradecer y sembrar lo que viene. Cada lección trae un video corto, la historia de la tradición, el ritual paso a paso, unas preguntas para ti y, cuando hay foto, Sibila te lee lo que quedó.",
  promesas: [
    "7 lecciones de 15 a 20 minutos, una por día",
    "Rituales de varias tradiciones: Latinoamérica, Turquía, el mundo árabe y el Mediterráneo",
    "Sibila lee tu vaso, tu vela, tu taza y tu tirada (lecturas incluidas)",
    "Al final, tu carta de cierre de ciclo escrita por Sibila",
  ],
  portada: "/escuela/rituales.jpg",
  costo: 20,
  costoFundadores: 15, // = paquete Buscador (24.900 COP / 5,99 USD), aprobado el 25 de noviembre
  creditosIncluidos: 10,
  abierto: false,
  horasEntreLecciones: 16,
  lecciones: [
    {
      numero: 1,
      titulo: "Qué es un ritual: intención, espacio y momento",
      resumen: "Antes de encender nada: qué hace que un gesto se vuelva ritual, y tu altar para estos siete días.",
      minutos: 15,
      bloques: [
        { tipo: "video", titulo: "Sibila te da la bienvenida", src: "/escuela/rituales/dia-1.mp4", poster: "/escuela/rituales/dia-1.jpg" },
        {
          tipo: "texto",
          titulo: "Un gesto con intención",
          parrafos: [
            "Encender una vela para alumbrar la cocina no es un ritual. Encenderla pensando en alguien, en silencio, a la misma hora cada noche, sí lo es. Lo que convierte un gesto en ritual no es el objeto: es la intención, el espacio y el momento.",
            "La intención es lo que pides, lo que agradeces o lo que sueltas, dicho con tus palabras. El espacio es el lugar que separas del resto de la casa, aunque sea una esquina de la mesa. El momento es el cuándo: un día de la semana, una fase de la Luna, el final de un año. Todas las tradiciones que vamos a recorrer —de Latinoamérica a Turquía, del Magreb al Mediterráneo— tienen estas tres piezas, aunque las llamen distinto.",
            "Durante estos siete días vamos a cerrar el año. No para olvidar lo que pasó, sino para mirarlo, agradecerlo y decidir qué te llevas al año que viene.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "Tu altar de cierre",
          materiales: ["Un paño o pañuelo limpio", "Una vela blanca (la encenderemos más adelante)", "Un vaso de agua", "Algo de la naturaleza: una piedra, una hoja, una flor o un poco de sal", "Papel y lápiz"],
          pasos: [
            "Elige un lugar tranquilo donde el altar pueda quedarse los siete días.",
            "Extiende el paño y pon encima la vela, el vaso de agua y lo que trajiste de la naturaleza.",
            "Siéntate frente a él y respira hondo tres veces.",
            "Escribe en el papel, en presente y con tus palabras, lo que quieres cerrar este año. Por ejemplo: «Cierro este año con gratitud y dejo atrás el miedo a empezar».",
            "Dobla el papel y déjalo bajo la vela. Lo usaremos el último día.",
          ],
          herramienta: { href: "/luna", texto: "Mira en qué Luna estás hoy" },
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Qué convierte un gesto en ritual?", opciones: ["Usar objetos caros", "La intención, el espacio y el momento", "Hacerlo a medianoche"], correcta: 1, porque: "No hace falta nada caro ni una hora especial: lo que importa es la intención con que lo haces, el lugar que separas y el momento que eliges." },
            { tipo: "opcion", p: "¿Cómo conviene escribir una intención?", opciones: ["En presente y con tus propias palabras", "En futuro y muy general", "Copiada de un libro"], correcta: 0, porque: "La tradición dice que lo que se nombra en presente ya empieza a ocurrir, y tus palabras pesan más que las de cualquier libro." },
            { tipo: "abierta", p: "¿Qué quieres cerrar este año? Cuéntaselo a Sibila.", ayuda: "Lo que escribas aquí lo usará Sibila en tu carta de cierre del día 7." },
          ],
        },
      ],
    },
    {
      numero: 2,
      titulo: "Limpiar antes de pedir: el humo y las hierbas",
      resumen: "Copal, romero, ruda, bakhoor y üzerlik: cómo se limpia una casa con humo en distintas tradiciones.",
      minutos: 20,
      bloques: [
        { tipo: "video", titulo: "El humo que limpia" },
        {
          tipo: "texto",
          titulo: "Una casa que respira",
          parrafos: [
            "Casi todas las tradiciones empiezan igual: antes de pedir, se limpia. Y casi todas limpian con humo. En Mesoamérica se sahúma con copal, la resina que se quemaba en los templos; en los Andes, con hierbas y palo santo; en el Mediterráneo y en Latinoamérica, con romero, ruda y laurel.",
            "En el mundo árabe, el bakhoor (بخور) —astillas de madera perfumada con aceites— se quema en un pequeño quemador y se pasa por la casa y la ropa para recibir a los invitados y despedir lo que pesa. En Turquía se quema üzerlik, la semilla de la ruda siria, contra el nazar, y se dice que cuando las semillas estallan, el mal de ojo se rompe.",
            "La idea es la misma en todas partes: el humo sube, se lleva lo viejo, y la casa queda lista para lo nuevo.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "Sahumar la casa",
          materiales: ["Hierbas secas (romero, laurel o ruda) o un incienso que te guste", "Un plato o cuenco de barro o metal", "Fósforos", "Las ventanas abiertas"],
          pasos: [
            "Abre las ventanas: el humo necesita por dónde salir.",
            "Enciende las hierbas o el incienso en el plato y apaga la llama para que solo quede el humo.",
            "Empieza por el rincón más alejado de la puerta y recorre cada habitación en el sentido de las agujas del reloj, pasando el humo por las esquinas, detrás de las puertas y bajo las camas.",
            "Mientras caminas, di en voz baja lo que sale de tu casa: «Sale el cansancio, sale la tristeza, sale lo que ya no es mío».",
            "Termina en la puerta de entrada y deja que el humo salga hacia afuera.",
            "Apaga bien las brasas con agua y entierra o tira las cenizas fuera de la casa.",
          ],
          cuidado: "Usa siempre un recipiente que no se queme, no dejes el humo solo y evítalo si en casa hay alguien con asma, bebés o mascotas sensibles.",
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Por qué casi todas las tradiciones limpian antes de pedir?", opciones: ["Porque es más bonito", "Para hacer espacio a lo nuevo despidiendo lo viejo", "Porque lo exige la Luna"], correcta: 1, porque: "Limpiar es despedir lo que pesa para que lo que pides tenga lugar." },
            { tipo: "opcion", p: "¿Dónde se termina de sahumar la casa?", opciones: ["En la cocina", "En el dormitorio", "En la puerta de entrada, hacia afuera"], correcta: 2, porque: "Se recorre la casa de adentro hacia afuera y el humo se despide por la puerta." },
            { tipo: "abierta", p: "¿Qué sentiste al recorrer tu casa? ¿Hubo algún rincón que te costó más?" },
          ],
        },
      ],
    },
    {
      numero: 3,
      titulo: "La limpia con huevo",
      resumen: "La limpia de las abuelas latinoamericanas: cómo se hace, por qué el huevo y cómo se lee el vaso.",
      minutos: 20,
      bloques: [
        { tipo: "video", titulo: "La abuela pasa el huevo" },
        {
          tipo: "texto",
          titulo: "Lo que el huevo se lleva",
          parrafos: [
            "La limpia con huevo une las limpias de los pueblos de Mesoamérica, que barrían el cuerpo con hierbas, copal y flores, con el huevo de gallina que llegó a América en los barcos europeos. Hoy se hace en México, Centroamérica, los Andes, el Caribe y en cada casa latina del mundo.",
            "La tradición dice que el huevo, símbolo de vida en casi todas las culturas, recoge al pasar por el cuerpo lo que pesa: el cansancio, la envidia, el susto, el mal de ojo. Después se rompe en un vaso de agua para ver qué se llevó. Por eso no se come: se desecha con respeto, lejos de la casa.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "Tu limpia de cierre de año",
          materiales: ["Un huevo fresco a temperatura ambiente", "Un vaso transparente con agua hasta la mitad", "Una ramita de romero o ruda (si tienes)"],
          pasos: [
            "Sostén el huevo entre las manos un momento y piensa en lo que quieres soltar de este año.",
            "Pásalo despacio por tu cuerpo de arriba hacia abajo, siempre en la misma dirección: la coronilla, la frente, la nuca, los hombros, los brazos, el pecho, la espalda, las piernas y las plantas de los pies.",
            "Rompe el huevo con cuidado en el vaso y déjalo reposar cinco minutos.",
            "Míralo a contraluz: la yema, la clara, los hilos, las burbujas.",
            "Toma la foto (de frente y, si puedes, también de lado y desde arriba) y súbela para que Sibila la lea.",
            "Al final, tira el agua y el huevo lejos de la casa y lávate las manos.",
          ],
          herramienta: { href: "/biblioteca/limpia-con-huevo", texto: "Lee la historia completa en El Arcano" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu vaso", texto: "Sube la foto de tu vaso y Sibila te dice lo que se llevó tu limpia. Esta lectura está incluida en el curso.", href: "/huevo", boton: "Que Sibila lea mi vaso" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿En qué dirección se pasa el huevo por el cuerpo?", opciones: ["De abajo hacia arriba", "De arriba hacia abajo, siempre en la misma dirección", "En círculos"], correcta: 1, porque: "Como quien barre: de la cabeza a los pies, sin volver atrás." },
            { tipo: "opcion", p: "¿Qué se hace con el huevo después de la limpia?", opciones: ["Se cocina", "Se guarda en la nevera", "Se desecha con respeto, lejos de la casa"], correcta: 2, porque: "La tradición dice que guarda lo que recogió: por eso no se come y se tira lejos." },
            { tipo: "abierta", p: "¿Qué te dijo tu vaso? ¿Te sorprendió algo?" },
          ],
        },
      ],
    },
    {
      numero: 4,
      titulo: "El lenguaje de las velas: color, día y Luna",
      resumen: "Qué vela encender para lo que buscas, qué día y con qué Luna. Y la vela de tu intención para el año.",
      minutos: 20,
      bloques: [
        { tipo: "video", titulo: "Una intención hecha fuego" },
        {
          tipo: "texto",
          titulo: "Colores, días y lunas",
          parrafos: [
            "Cada color habla de una intención: el rosa y el rojo, del amor; el verde, del dinero y la abundancia; el blanco, de la limpieza y la protección; el azul, de la calma; el amarillo, de la claridad; el naranja, del éxito; el morado, de la intuición, y el negro, de cerrar ciclos. Si no tienes el color, una vela blanca sirve para todo.",
            "Los días de la semana llevan el nombre de los siete astros de los antiguos: el viernes es de Venus y del amor; el jueves, de Júpiter y la abundancia; el domingo, del Sol y el éxito; el miércoles, de Mercurio y la claridad; el lunes, de la Luna y la intuición; el sábado, de Saturno, para proteger y cerrar.",
            "Y la Luna marca el ritmo: la creciente atrae, la llena culmina, la menguante suelta y la nueva siembra.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "La vela de tu intención",
          materiales: ["Una vela del color de tu intención (o blanca)", "Un poco de aceite (de oliva sirve)", "Una aguja o un palillo", "Un plato firme o un vaso de vidrio", "Fósforos"],
          pasos: [
            "Elige tu intención para el año que viene y, con la herramienta de velas, mira el color, el día y la Luna que le corresponden.",
            "Con la aguja, marca en la vela una palabra que resuma tu intención.",
            "«Viste» la vela: úntala con un poco de aceite de la base hacia la mecha (para atraer).",
            "Ponla en el plato, enciéndela con un fósforo y di tu intención en voz alta.",
            "Quédate con ella unos minutos. Déjala arder mientras estés en casa y apágala con los dedos humedecidos o un apagavelas, sin soplarla.",
            "Cuando termine de arder (puede tomar más de un día), toma la foto de los restos.",
          ],
          cuidado: "Nunca dejes una vela encendida sin nadie que la cuide, ni cerca de cortinas, niños o mascotas.",
          herramienta: { href: "/velas", texto: "Elige tu vela, tu día y tu Luna" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu vela", texto: "Cuando tu vela termine de arder, fotografía los restos y Sibila te dice lo que la cera y la llama dejaron dicho. Incluida en el curso.", href: "/velas", boton: "Que Sibila lea mi vela" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "Si buscas abundancia, ¿qué combinación sigue la tradición?", opciones: ["Vela verde, un jueves, Luna creciente", "Vela negra, un sábado, Luna menguante", "Vela azul, un lunes, Luna llena"], correcta: 0, porque: "El verde es el color de la abundancia, el jueves es de Júpiter y la Luna creciente atrae." },
            { tipo: "opcion", p: "¿Qué dice la costumbre sobre apagar una vela de ritual?", opciones: ["Hay que soplarla fuerte", "No se sopla: se apaga con los dedos humedecidos o un apagavelas", "Se apaga con agua"], correcta: 1, porque: "La tradición dice que soplar la vela dispersa la intención." },
            { tipo: "abierta", p: "¿Qué intención pusiste en tu vela? ¿Qué color elegiste y por qué?" },
          ],
        },
      ],
    },
    {
      numero: 5,
      titulo: "Soltar: la Luna menguante y el papel que se quema",
      resumen: "Escribir lo que ya no quieres cargar y dejarlo ir, como se hace en tantas casas a fin de año.",
      minutos: 15,
      bloques: [
        { tipo: "video", titulo: "Lo que se va con el humo" },
        {
          tipo: "texto",
          titulo: "Escribir para soltar",
          parrafos: [
            "En muchas casas de Latinoamérica, la noche de fin de año se escribe en un papel lo que no se quiere llevar al año nuevo y se quema. En otras se queman muñecos de trapo, «años viejos», que representan todo lo que pasó. El fuego transforma: lo que estaba escrito se vuelve humo y ceniza.",
            "La tradición dice que soltar es más fácil con la Luna menguante, cuando la luz se va retirando. Pero el mejor momento es el que tú elijas con intención.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "El papel que se quema",
          materiales: ["Papel y lápiz", "Un cuenco de metal o el fregadero", "Fósforos", "Un vaso de agua a mano"],
          pasos: [
            "Escribe en el papel, sin pensarlo mucho, todo lo que no quieres llevar al año nuevo: miedos, hábitos, rencores, cansancios.",
            "Léelo una vez en voz alta y di: «Te agradezco lo que me enseñaste. Ahora te dejo ir».",
            "Quema el papel en el cuenco de metal o en el fregadero, con el agua a mano.",
            "Cuando se enfríen, lleva las cenizas a la tierra (una maceta o el jardín) o déjalas ir con el agua.",
            "Si no puedes quemar, rompe el papel en pedazos muy pequeños y entiérralos.",
          ],
          cuidado: "Quema siempre en un recipiente de metal o en el fregadero, lejos de cortinas y con agua a mano.",
        },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Con qué Luna dice la tradición que es más fácil soltar?", opciones: ["Creciente", "Menguante", "Llena"], correcta: 1, porque: "La menguante es la Luna que se retira: acompaña lo que se va." },
            { tipo: "abierta", p: "Sin dar detalles si no quieres: ¿cómo te sentiste al ver arder el papel?" },
          ],
        },
      ],
    },
    {
      numero: 6,
      titulo: "Agradecer: la mesa, las uvas y el café",
      resumen: "La gratitud en distintas culturas: las doce uvas, la sobremesa y la taza de café que se voltea.",
      minutos: 20,
      bloques: [
        { tipo: "video", titulo: "Una mesa para agradecer" },
        {
          tipo: "texto",
          titulo: "Agradecer también es un ritual",
          parrafos: [
            "En España y en buena parte de Latinoamérica se comen doce uvas con las doce campanadas de la medianoche, una por cada mes del año que viene, y con cada una se pide un deseo. En Turquía y en el mundo árabe, el café se toma despacio en la sobremesa, se voltea la taza y alguien de la familia lee lo que quedó en la borra: es una forma de cuidarse entre todos.",
            "Agradecer cierra el círculo: después de limpiar y soltar, se reconoce lo que el año trajo de bueno, aunque haya sido difícil.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "Mesa de gratitud y café",
          materiales: ["Tu mesa, con algo que te guste: una flor, una vela, una fruta", "Papel y lápiz", "Café molido muy fino (al estilo turco, si puedes) y una taza pequeña con plato"],
          pasos: [
            "Prepara la mesa como si esperaras a alguien querido.",
            "Escribe doce cosas que agradeces de este año, una por cada mes si puedes.",
            "Prepara tu café sin colar, tómalo despacio pensando en lo que escribiste y deja un poco en el fondo.",
            "Pide un deseo, tapa la taza con el plato, voltéala hacia ti y espera a que se enfríe.",
            "Levanta la taza y toma la foto del interior para que Sibila te la lea.",
          ],
          herramienta: { href: "/biblioteca/lectura-del-cafe", texto: "La historia de la lectura del café" },
        },
        { tipo: "entrega", titulo: "Sibila lee tu taza", texto: "Sube la foto de tu taza y Sibila te lee los símbolos de la borra y lo que dicen de tu año nuevo. Incluida en el curso.", href: "/cafe", boton: "Que Sibila lea mi taza" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Qué representa cada una de las doce uvas?", opciones: ["Un mes del año que viene", "Un amigo", "Un signo del zodiaco"], correcta: 0, porque: "Se come una por cada campanada, una por cada mes, y con cada una se pide un deseo." },
            { tipo: "abierta", p: "De las doce cosas que agradeces, ¿cuál es la que más te importa?" },
          ],
        },
      ],
    },
    {
      numero: 7,
      titulo: "Sembrar el año nuevo",
      resumen: "Tu carta al año que viene, tres cartas del tarot y la carta de cierre que Sibila escribe para ti.",
      minutos: 20,
      bloques: [
        { tipo: "video", titulo: "Lo que siembras hoy" },
        {
          tipo: "texto",
          titulo: "Sembrar con intención",
          parrafos: [
            "Después de limpiar, soltar y agradecer, llega lo más bonito: sembrar. En Latinoamérica hay quien sale a dar la vuelta a la manzana con una maleta para que el año traiga viajes, quien guarda lentejas en el bolsillo para la abundancia o quien estrena ropa amarilla. Son formas de decir, con el cuerpo, lo que se espera.",
            "Hoy vas a escribir una carta al año que viene y vas a sacar tres cartas del tarot: lo que dejas, lo que llevas y lo que llega.",
          ],
        },
        {
          tipo: "ritual",
          titulo: "Carta al año que viene",
          materiales: ["El papel que dejaste bajo la vela el primer día", "Papel nuevo y un sobre", "Tu vela blanca del altar"],
          pasos: [
            "Enciende la vela blanca del altar y relee el papel del primer día.",
            "Escribe una carta a ti mismo o a ti misma para leer dentro de un año: lo que deseas, cómo quieres sentirte, qué quieres aprender.",
            "Guárdala en el sobre, escribe la fecha de hoy y ciérralo.",
            "Saca tu tirada de tres cartas con Sibila: lo que dejas, lo que llevas y lo que llega.",
            "Guarda el sobre en un lugar especial. Lo abrirás el próximo diciembre.",
          ],
          herramienta: { href: "/tarot", texto: "Saca tus tres cartas" },
        },
        { tipo: "entrega", titulo: "Tu tirada de cierre", texto: "Haz tu tirada de tres cartas con Sibila: lo que dejas, lo que llevas y lo que llega. Incluida en el curso.", href: "/tarot", boton: "Sacar mis tres cartas" },
        {
          tipo: "test",
          preguntas: [
            { tipo: "opcion", p: "¿Cuál es el orden de estos siete días?", opciones: ["Pedir, limpiar y agradecer", "Preparar, limpiar, soltar, agradecer y sembrar", "Sembrar primero y limpiar al final"], correcta: 1, porque: "Primero se prepara el espacio y se limpia; luego se suelta y se agradece, y al final se siembra lo nuevo." },
            { tipo: "abierta", p: "¿Qué quieres sembrar para el año que viene? Sibila lo usará en tu carta de cierre." },
          ],
        },
      ],
    },
  ],
};
