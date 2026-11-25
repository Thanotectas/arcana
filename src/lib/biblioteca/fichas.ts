import type { Idioma } from "@/lib/i18n/idiomas";
import type { Curso } from "@/lib/lista-espera/textos";

/**
 * «El Arcano de Sibila: saberes del mundo». Una ficha por práctica: su historia, cómo se hace, sus símbolos y
 * dónde se vive hoy. Se escribe desde adentro de la tradición, con respeto y con datos reales (con fuentes); lo que
 * no está documentado se cuenta como relato de la tradición, nunca como mito. Al final, la invitación a vivirla con
 * Sibila. Cada ficha tiene su texto por idioma; si falta uno, se muestra en español.
 */
export interface Ficha {
  titulo: string;
  /** Lo que se lee en Google y al compartir. */
  descripcion: string;
  /** Nombre de la tradición en sus lenguas (va bajo el título). */
  nombres: string;
  entrada: string;
  secciones: { titulo: string; parrafos: string[] }[];
  simbolos?: { titulo: string; intro: string; lista: { s: string; d: string }[] };
  preguntas: { p: string; r: string }[];
  cta: { titulo: string; texto: string; boton: string };
}

export interface EntradaBiblioteca {
  slug: string;
  /** Clave del producto en el catálogo (para el icono y la tradición en /explorar). */
  clave: string;
  /** Página donde Sibila hace la lectura. */
  href: string;
  /** Página de lectura por idioma, cuando cambia según la tradición de quien lee (si falta, `href`). */
  hrefs?: Partial<Record<Idioma, string>>;
  /** Fecha de publicación (AAAA-MM-DD). */
  publicada: string;
  fuentes: { titulo: string; url: string }[];
  /** Video de la ficha por idioma (en /public/arcano, versión liviana); quien entra en otro idioma no lo ve. */
  videos?: Partial<Record<Idioma, string>> & { es: string };
  /** Imagen del video (portada y miniatura). */
  portada?: string;
  /** Curso con lista de espera que se invita al final de la ficha. */
  curso?: Curso;
  textos: Partial<Record<Idioma, Ficha>> & { es: Ficha };
}

export const BIBLIOTECA: EntradaBiblioteca[] = [
  {
    slug: "tarot",
    clave: "tarot",
    href: "/tarot",
    publicada: "2026-11-24",
    fuentes: [
      { titulo: "The Morgan Library & Museum: Visconti-Sforza tarot cards (Milán, hacia 1450)", url: "https://www.themorgan.org/collection/tarot-cards" },
      { titulo: "Victoria and Albert Museum: Tarot cards", url: "https://www.vam.ac.uk/articles/tarot-cards" },
      { titulo: "National Geographic: The history of tarot cards", url: "https://www.nationalgeographic.com/history/article/tarot-cards-history-fortune-telling" },
      { titulo: "Becker Medical Library (Washington University): exposición sobre el tarot", url: "https://beckerexhibits.wustl.edu/s/tarot/page/home" },
      { titulo: "Michael Dummett, The Game of Tarot (1980)", url: "https://www.britannica.com/topic/tarot/additional-info" },
    ],
    textos: {
      es: {
        titulo: "El tarot: de las cortes de Italia a tu mesa, su historia y sus arcanos",
        descripcion:
          "El tarot nació en las cortes del norte de Italia en el siglo XV y en el siglo XVIII se volvió el oráculo más famoso del mundo. Su historia, las 78 cartas, los 22 arcanos mayores y cómo se lee una tirada.",
        nombres: "Tarocchi (italiano) · Tarot (francés) · Arcanos mayores y menores",
        entrada:
          "Pocas imágenes son tan reconocibles como una carta del tarot: la Luna con sus dos torres, la Estrella derramando agua, el Loco al borde del abismo. Detrás de esas figuras hay casi seis siglos de historia: pintores del Renacimiento, sabios de París, magos de Londres y millones de personas que, cada día, barajan y preguntan. Esta es la historia del tarot.",
        secciones: [
          {
            titulo: "Nace en las cortes del Renacimiento",
            parrafos: [
              "Las primeras cartas del tarot que se conservan se pintaron a mano hacia mediados del siglo XV en las cortes del norte de Italia, para familias como los Visconti y los Sforza de Milán. Se llamaban tarocchi y eran verdaderas obras de arte, con fondos de oro y pigmentos preciosos. Hoy algunas de esas cartas se guardan en museos como la Morgan Library de Nueva York.",
              "A los cuatro palos de la baraja —copas, oros, espadas y bastos— se les sumó una serie de cartas con figuras alegóricas: el Mago, la Emperatriz, la Rueda de la Fortuna, la Muerte, el Sol, el Mundo. Esas son las que hoy llamamos arcanos mayores.",
            ],
          },
          {
            titulo: "De París al mundo: el tarot se vuelve oráculo",
            parrafos: [
              "En 1781 el erudito francés Antoine Court de Gébelin publicó en su obra Le Monde primitif que el tarot guardaba la sabiduría secreta del antiguo Egipto. Poco después, Jean-Baptiste Alliette, conocido como Etteilla, publicó el primer método para leer el futuro con estas cartas y diseñó una de las primeras barajas pensadas para la adivinación.",
              "En el siglo XIX los ocultistas franceses e ingleses unieron el tarot con la astrología, la cábala y los cuatro elementos. Y a comienzos del siglo XX, en Londres, la artista Pamela Colman Smith dibujó, por encargo de Arthur Edward Waite y del editor William Rider, la baraja que se volvería la más usada del mundo: la Rider-Waite-Smith, la primera en ilustrar con escenas también los arcanos menores. La mayoría de los tarots que hoy se ven en redes descienden de ella.",
            ],
          },
          {
            titulo: "Las 78 cartas",
            parrafos: [
              "Un tarot completo tiene 78 cartas. Los 22 arcanos mayores hablan de las grandes etapas y lecciones de la vida: el viaje del Loco, que sale con su hatillo, se encuentra con el Mago y la Sacerdotisa, pasa por el Enamorado, la Torre y la Estrella, y llega al Mundo.",
              "Los 56 arcanos menores hablan del día a día y se reparten en cuatro palos, cada uno con su elemento: copas (agua: emociones y amor), oros o pentáculos (tierra: dinero, trabajo y cuerpo), espadas (aire: la mente, las decisiones y los conflictos) y bastos (fuego: la acción, los proyectos y la pasión). Cada palo va del as al diez y tiene cuatro figuras de la corte: sota, caballo, reina y rey.",
            ],
          },
          {
            titulo: "Cómo se lee una tirada",
            parrafos: [
              "Se empieza con una pregunta clara. Se barajan las cartas pensando en ella, se corta y se sacan las cartas en un orden que tiene sentido: en la tirada de tres cartas, por ejemplo, la primera habla de lo que viene de atrás, la segunda del presente y la tercera de hacia dónde va la situación. La Cruz Celta, con diez cartas, mira la pregunta desde todos los ángulos.",
              "Cada carta tiene su significado, pero la lectora no las lee sueltas: mira cómo conversan entre sí, qué palo domina, si aparecen muchos arcanos mayores —señal de un momento importante— y si alguna sale invertida, lo que matiza o retrasa su mensaje.",
            ],
          },
          {
            titulo: "Un lenguaje que se habla en todo el mundo",
            parrafos: [
              "En Francia se conserva el tarot de Marsella, con sus colores planos y su trazo antiguo. En Latinoamérica el tarot convive con la baraja española, que muchas abuelas leían en la mesa de la cocina. Y hoy, en cualquier idioma, alguien saca una carta del día para saber qué energía lo acompaña.",
              "Esa es su fuerza: el tarot no pide creer en nada en particular. Pide una pregunta sincera y la disposición a mirarse en sus imágenes.",
            ],
          },
        ],
        simbolos: {
          titulo: "Algunos arcanos mayores",
          intro: "Estos son algunos de los arcanos mayores más conocidos y lo que la tradición lee en ellos:",
          lista: [
            { s: "El Loco (0)", d: "Un comienzo, un salto de fe, la libertad de empezar sin garantías." },
            { s: "El Mago (I)", d: "Tienes las herramientas: es momento de actuar con lo que sabes." },
            { s: "La Sacerdotisa (II)", d: "Intuición, secretos y la sabiduría que llega en silencio." },
            { s: "Los Enamorados (VI)", d: "Una elección del corazón; un vínculo que pide decidir." },
            { s: "La Rueda de la Fortuna (X)", d: "Un giro del destino: lo que estaba quieto empieza a moverse." },
            { s: "La Muerte (XIII)", d: "No es una muerte física: es el fin de una etapa y el inicio de otra." },
            { s: "La Torre (XVI)", d: "Un cambio repentino que derrumba lo que ya no sostenía." },
            { s: "La Estrella (XVII)", d: "Esperanza, sanación y fe en lo que viene." },
            { s: "El Sol (XIX)", d: "Alegría, éxito y claridad: el sí más luminoso del tarot." },
            { s: "El Mundo (XXI)", d: "Un ciclo que se completa: logro, viaje o plenitud." },
          ],
        },
        preguntas: [
          { p: "¿Dónde nació el tarot?", r: "En las cortes del norte de Italia, a mediados del siglo XV. Las primeras barajas, llamadas tarocchi, se pintaron a mano para familias nobles como los Visconti y los Sforza de Milán." },
          { p: "¿Cuándo se empezó a usar el tarot para adivinar?", r: "En Francia, a finales del siglo XVIII. En 1781 Court de Gébelin lo relacionó con la sabiduría del antiguo Egipto y poco después Etteilla publicó el primer método de lectura y una baraja pensada para la adivinación." },
          { p: "¿Cuántas cartas tiene el tarot?", r: "78: 22 arcanos mayores, que hablan de las grandes etapas de la vida, y 56 arcanos menores, repartidos en cuatro palos (copas, oros, espadas y bastos), que hablan del día a día." },
          { p: "¿Qué es la baraja Rider-Waite-Smith?", r: "Es el tarot que la artista Pamela Colman Smith dibujó en Londres, por encargo de Arthur Edward Waite, publicado por Rider hacia 1909-1910. Fue el primero en ilustrar con escenas todas las cartas y es la base de la mayoría de los tarots actuales." },
          { p: "¿La carta de la Muerte es mala?", r: "No. En el tarot la Muerte habla de transformación: el final de una etapa para que empiece otra. Casi nunca se lee como una muerte física." },
        ],
        cta: {
          titulo: "Pregúntale al tarot",
          texto: "Escribe tu pregunta, baraja y saca tus cartas: Sibila te las interpreta juntas, como lo haría una lectora, según tu pregunta. Tu carta del día es gratis.",
          boton: "Hacer mi tirada",
        },
      },
    },
  },
  {
    slug: "limpia-con-huevo",
    clave: "huevo",
    href: "/huevo",
    videos: { es: "/arcano/limpia-con-huevo-es.mp4", pt: "/arcano/limpia-con-huevo-pt.mp4" },
    portada: "/arcano/limpia-con-huevo.jpg",
    publicada: "2026-11-23",
    fuentes: [
      { titulo: "México Desconocido: Tradición de la limpia con huevo, sabiduría ancestral", url: "https://www.mexicodesconocido.com.mx/limpia-con-huevo.html" },
      { titulo: "UNAM, Revista Medicina y Cultura: Huevos y salud, cultura popular", url: "https://www.revistamedicinaycultura.fmposgrado.unam.mx/wp-content/uploads/2024/03/2-Vol2no1-Huevos-y-salud-cultura-popular-que-supera-el-mito.pdf" },
      { titulo: "USC Folklore Archives: Egg Cleansings (Limpia de Huevo)", url: "https://folklore.usc.edu/egg-cleansings-limpia-de-huevo/" },
      { titulo: "Atlas Obscura: The long history of telling the future with eggs", url: "https://www.atlasobscura.com/articles/salem-witch-trials-oomancy" },
      { titulo: "Encyclopedia.com: Ooscopy and Oomantia", url: "https://www.encyclopedia.com/science/encyclopedias-almanacs-transcripts-and-maps/ooscopy-and-oomantia" },
    ],
    textos: {
      es: {
        titulo: "La limpia con huevo: historia, ritual y cómo se lee el vaso",
        descripcion:
          "La limpia con huevo une la sabiduría de los pueblos de Mesoamérica con tradiciones que cruzaron el océano. Su historia, cómo se hace paso a paso y qué dice el vaso: burbujas, hilos, figuras y manchas.",
        nombres: "Limpia · Barrida · Pasada de huevo · Oomancia (lectura del huevo)",
        entrada:
          "Una abuela que pasa un huevo despacio por la cabeza, los hombros y el corazón de su nieta, mientras murmura una oración. Después, el huevo se rompe en un vaso de agua y las dos se acercan a mirar. Esa escena se repite cada día en México, Centroamérica, los Andes, el Caribe y en cualquier ciudad del mundo donde haya una familia latina. Esta es la historia de la limpia con huevo.",
        secciones: [
          {
            titulo: "Raíces que se encontraron",
            parrafos: [
              "Mucho antes de la llegada de los europeos, los pueblos de Mesoamérica ya practicaban limpias: barrían el cuerpo con ramas de hierbas, humo de copal y flores para devolver el equilibrio a quien andaba cargado, asustado o «con el ojo puesto». Los curanderos y curanderas eran —y siguen siendo— guardianes de ese saber.",
              "Las gallinas llegaron a América en los barcos europeos, y con ellas el huevo. En las comunidades, el huevo se sumó a las ramas de ruda, albahaca y pirul, y la limpia tomó la forma que hoy conocemos: una fusión de la medicina tradicional indígena con costumbres traídas del otro lado del mar. Por eso cada región tiene su manera: la «barrida» en el centro de México, la «pasada de huevo» en los Andes, la limpia en las botánicas del Caribe y de Estados Unidos.",
            ],
          },
          {
            titulo: "Por qué el huevo",
            parrafos: [
              "En casi todas las culturas el huevo es símbolo de vida, de origen y de renacimiento: de él nace todo lo nuevo. La tradición dice que, al pasarlo por el cuerpo, el huevo «recoge» la energía pesada —la envidia, el mal de ojo, el susto, el cansancio del alma— y la guarda dentro de su cáscara.",
              "Por eso, después de la limpia, el huevo no se come: se rompe en un vaso con agua para ver qué se llevó, y luego se desecha con respeto, lejos de la casa.",
            ],
          },
          {
            titulo: "Una práctica con siglos de historia",
            parrafos: [
              "Mirar el interior de un huevo para saber algo del destino es muy antiguo. Los griegos le dieron nombre: oomancia, de ōón, «huevo», y manteía, «adivinación». En Europa se vertía la clara en agua caliente para leer las formas que dibujaba, y en la Nueva Inglaterra del siglo XVII las jóvenes de Salem jugaban a adivinar su futuro con una clara de huevo en un vaso, el llamado «vaso de Venus».",
              "La limpia latinoamericana tomó ese gesto y le dio su propio sentido: aquí el huevo no solo muestra el futuro, también se lleva lo que pesa.",
            ],
          },
          {
            titulo: "Cómo se hace la limpia",
            parrafos: [
              "Se usa un huevo fresco, a temperatura ambiente, y si se puede, de gallina de patio. Quien hace la limpia lo pasa despacio sobre la persona, de arriba hacia abajo: la coronilla, la frente, la nuca, los hombros, los brazos, el pecho, la espalda, las piernas y las plantas de los pies, siempre en una sola dirección, como quien barre. Muchas familias rezan mientras tanto, o acompañan el huevo con un ramo de hierbas.",
              "Al terminar, el huevo se rompe con cuidado en un vaso transparente con agua hasta la mitad, se deja reposar unos minutos y se observa a la luz. Al final, el agua y el huevo se tiran por el inodoro o en la tierra, lejos de la casa, y quien recibió la limpia se lava las manos y descansa.",
            ],
          },
          {
            titulo: "Cómo se lee el vaso",
            parrafos: [
              "La lectura empieza por la yema: si queda tranquila en el fondo, la limpia salió bien y no había mucho que cargar. Luego se mira la clara: si sube, si forma hilos, si se nubla. Después, las burbujas, las manchas y las figuras que se distinguen a contraluz.",
              "Cada curandera tiene su escuela, pero hay señales que se repiten en toda Latinoamérica: los hilos que suben hacia la superficie, las burbujas alrededor de la yema, las nubes en el agua. Una sola limpia no siempre se lleva todo; cuando el vaso sale muy cargado, la tradición aconseja repetirla en los días siguientes.",
            ],
          },
        ],
        simbolos: {
          titulo: "Lo que dice el vaso",
          intro: "Estas son algunas de las señales más repetidas por quienes leen el huevo en Latinoamérica:",
          lista: [
            { s: "Yema tranquila en el fondo", d: "La limpia salió bien: tu energía está limpia y en calma." },
            { s: "Burbujas alrededor de la yema", d: "Energía pesada que se liberó; cansancio o preocupaciones que se fueron." },
            { s: "Hilos que suben como velas", d: "Envidias o malas intenciones que te rodeaban y la limpia recogió." },
            { s: "Picos o agujas en la clara", d: "Celos, chismes o palabras que te han herido." },
            { s: "Agua nublada", d: "Mucha carga emocional; conviene repetir la limpia." },
            { s: "Un ojo en la yema", d: "Mal de ojo: alguien te ha mirado con fuerza." },
            { s: "Puntos o manchas rojas", d: "Una carga fuerte que se fue; cuídate y descansa." },
            { s: "Telarañas en la clara", d: "Asuntos enredados o pensamientos que no te dejan en paz." },
            { s: "Figuras de rostros o siluetas", d: "Una persona concreta que está en tu energía." },
            { s: "Clara que flota limpia", d: "Protección: tu camino está despejado." },
          ],
        },
        preguntas: [
          { p: "¿De dónde viene la limpia con huevo?", r: "Une las limpias de los pueblos de Mesoamérica, que barrían el cuerpo con hierbas, copal y flores, con el huevo de gallina, que llegó a América con los barcos europeos. De esa fusión nació la limpia que hoy se practica en México, Centroamérica, los Andes, el Caribe y entre las familias latinas de todo el mundo." },
          { p: "¿Cómo se hace una limpia con huevo?", r: "Se pasa un huevo fresco por todo el cuerpo, de arriba hacia abajo y en una sola dirección, mientras se reza o se pide protección. Luego se rompe en un vaso transparente con agua, se deja reposar y se lee lo que muestra." },
          { p: "¿Qué significan las burbujas en el vaso?", r: "La tradición lee las burbujas alrededor de la yema como energía pesada que se liberó: cansancio, preocupaciones o tensiones que la limpia se llevó." },
          { p: "¿Qué significan los hilos que suben en el vaso?", r: "Los hilos de clara que suben hacia la superficie se leen como envidias o malas intenciones que te rodeaban y que el huevo recogió." },
          { p: "¿Qué se hace con el huevo después de la limpia?", r: "No se come. El agua y el huevo se desechan con respeto, por el inodoro o en la tierra, lejos de la casa, y quien recibió la limpia se lava las manos." },
        ],
        cta: {
          titulo: "¿Qué se llevó tu limpia?",
          texto: "Rompe el huevo en un vaso con agua, toma una foto (si quieres, también de lado y desde arriba) y Sibila te lee lo que dice tu vaso: lo que soltaste, lo que te rodeaba y cómo cerrar la limpia.",
          boton: "Leer mi vaso",
        },
      },
    },
  },
  {
    slug: "lectura-del-cafe",
    clave: "cafe",
    href: "/cafe",
    videos: { es: "/arcano/lectura-del-cafe-es.mp4", tr: "/arcano/lectura-del-cafe-tr.mp4", ar: "/arcano/lectura-del-cafe-ar.mp4", fr: "/arcano/lectura-del-cafe-fr.mp4" },
    portada: "/arcano/lectura-del-cafe.jpg",
    publicada: "2026-11-23",
    fuentes: [
      { titulo: "UNESCO: Turkish coffee culture and tradition (Patrimonio Cultural Inmaterial, 2013)", url: "https://ich.unesco.org/en/rl/turkish-coffee-culture-and-tradition-00645" },
      { titulo: "Koç University ANAMED: Kahve falı, the Turkish tasseography", url: "https://anamed.ku.edu.tr/kahve-fali-the-turkish-tasseography" },
      { titulo: "Hürriyet Daily News: Coffee and coffeehouses among the Ottomans", url: "https://www.hurriyetdailynews.com/coffee-and-coffeehouses-among-the-ottomans-76123" },
      { titulo: "National Geographic: Istanbul's ancient coffee culture", url: "https://www.nationalgeographic.com/travel/article/istanbuls-ancient-coffee-culture-holding-own-modern-world" },
      { titulo: "Qareat El Fengan (Nizar Qabbani y Abdel Halim Hafez, 1976)", url: "https://en.wikipedia.org/wiki/Qareat_El_Fengan" },
    ],
    textos: {
      es: {
        titulo: "La lectura del café: historia, símbolos y cómo se lee la taza",
        descripcion:
          "La lectura de la borra del café nació con las primeras casas de café del Imperio otomano y hoy se vive de Estambul a Beirut, de Atenas a Buenos Aires. Su historia, cómo se prepara la taza y qué significan sus símbolos.",
        nombres: "Kahve falı (turco) · Qirā'at al-finjān (árabe) · Kafemanteía (griego) · Tasseografía",
        entrada:
          "Hay una pregunta que se repite en cocinas de medio mundo cuando alguien termina su café: «¿Te leo la taza?». Detrás de ese gesto hay casi cinco siglos de historia, una forma de hospitalidad reconocida por la UNESCO y un lenguaje de figuras que pasa de abuelas a nietas. Esta es la historia de la lectura del café.",
        secciones: [
          {
            titulo: "De Yemen a Estambul: nace una costumbre",
            parrafos: [
              "El café llegó a Estambul en el siglo XVI, desde Yemen, en tiempos de Solimán el Magnífico. Las crónicas otomanas cuentan que hacia 1554 o 1555 dos comerciantes sirios abrieron en el barrio de Tahtakale la primera casa de café de la ciudad. En pocos años la bebida pasó del palacio a las calles, y las kahvehane se volvieron el lugar donde se conversaba, se leía poesía y se compartían noticias.",
              "Con el café llegó la costumbre de mirar el fondo de la taza. El café turco se prepara sin filtrar, en un pequeño cazo llamado cezve, y deja en el fondo una borra espesa y fina. La tradición cuenta que fueron las mujeres de los salones del palacio otomano las primeras en descifrar las figuras que esa borra dibujaba en la porcelana. Desde entonces, la kahve falı —«la fortuna del café»— acompaña cada sobremesa.",
            ],
          },
          {
            titulo: "Una tradición que la UNESCO protege",
            parrafos: [
              "En 2013 la UNESCO inscribió «la cultura y la tradición del café turco» en la Lista Representativa del Patrimonio Cultural Inmaterial de la Humanidad. Su descripción la presenta como un símbolo de hospitalidad y amistad que se transmite en familia, y menciona la costumbre de leer la fortuna en la borra que queda en la taza.",
              "En Turquía el refrán lo dice todo: «Bir fincan kahvenin kırk yıl hatırı vardır», un café se recuerda durante cuarenta años. Leer la taza de alguien es regalarle tiempo, atención y conversación.",
            ],
          },
          {
            titulo: "Cómo se prepara la taza para leerla",
            parrafos: [
              "Se bebe el café despacio, pensando en la pregunta o en la persona que nos ocupa, y se deja en el fondo la borra con un sorbo de líquido. Luego se tapa la taza con el plato, se hace un deseo y se gira todo de un solo movimiento, para que la taza quede boca abajo sobre el plato.",
              "Se espera a que la porcelana se enfríe —muchas lectoras ponen una moneda o un anillo sobre la taza mientras tanto— y entonces se levanta. La borra que escurrió hacia el plato y la que quedó pegada en las paredes forman figuras: caminos, animales, letras, rostros. Esas figuras son el mensaje.",
            ],
          },
          {
            titulo: "Cómo se lee: el mapa de la taza",
            parrafos: [
              "Cada lectora tiene su escuela, pero hay un mapa compartido. El asa representa a la persona que consulta y su hogar: lo que aparece cerca del asa está cerca de su vida. El borde habla de lo inmediato, lo que viene en los próximos días; las paredes, de lo que se está formando; y el fondo, de lo más hondo o lo más lejano en el tiempo.",
              "Las zonas claras, donde la borra no se pegó, se leen como caminos abiertos y alivio; las zonas oscuras y espesas, como preocupaciones o asuntos que pesan. El plato también habla: muchas lectoras leen en él el deseo que se hizo al voltear la taza.",
            ],
          },
          {
            titulo: "Una práctica que viajó por el mundo",
            parrafos: [
              "Desde Estambul la lectura del café recorrió todo el antiguo mundo otomano: Grecia, donde se llama kafemanteía; los Balcanes; Armenia; Líbano, Siria, Egipto y todo el mundo árabe, donde la lectora de la taza —qāri'at al-finjān— es un personaje querido. En 1976 el poeta sirio Nizar Qabbani y el cantante egipcio Abdel Halim Hafez la convirtieron en una de las canciones más famosas de la música árabe: «Qāri'at al-Finjān», «La lectora de la taza».",
              "Con la migración llegó también a América. En el Río de la Plata, «leer la borra del café» es una expresión de casa; el escritor uruguayo Mario Benedetti tituló así una de sus novelas, La borra del café (1992). En Europa, cuando se popularizó el té, la misma intuición dio origen a la lectura de las hojas de té, y la palabra tasseografía —del francés tasse, «taza», y del griego graphía, «escritura»— terminó nombrando a las dos.",
            ],
          },
        ],
        simbolos: {
          titulo: "Algunos símbolos de la taza",
          intro: "Cada familia tiene sus matices, pero estos son algunos de los significados más repetidos por las lectoras de café:",
          lista: [
            { s: "Pájaro", d: "Noticias que llegan; si vuela hacia el borde, llegan pronto." },
            { s: "Pez", d: "Suerte y dinero; abundancia que se acerca." },
            { s: "Corazón", d: "Amor: un sentimiento que nace o se confirma." },
            { s: "Anillo o círculo cerrado", d: "Compromiso, unión, un ciclo que se completa." },
            { s: "Camino o línea larga", d: "Un viaje o un cambio de rumbo." },
            { s: "Montaña", d: "Un obstáculo que se supera con paciencia." },
            { s: "Serpiente", d: "Alguien que no es sincero; cuidar lo que se cuenta." },
            { s: "Caballo", d: "Un deseo que se cumple, a veces con rapidez." },
            { s: "Árbol", d: "Crecimiento, familia, raíces firmes." },
            { s: "Ojo", d: "Envidia o mirada ajena; también intuición despierta." },
          ],
        },
        preguntas: [
          { p: "¿Dónde nació la lectura del café?", r: "En el Imperio otomano, en el siglo XVI, cuando el café llegó a Estambul desde Yemen y se abrieron las primeras casas de café (hacia 1554-1555). Desde allí se extendió por Grecia, los Balcanes, el mundo árabe y, con la migración, por América." },
          { p: "¿Se puede leer cualquier café?", r: "La tradición usa café turco o árabe, sin filtrar, porque deja una borra fina y espesa que dibuja figuras. El café filtrado o instantáneo casi no deja borra." },
          { p: "¿Por qué se voltea la taza?", r: "Al girar la taza sobre el plato, la borra escurre por las paredes y forma las figuras que se leen. Se hace con un deseo en mente y se espera a que la taza se enfríe antes de levantarla." },
          { p: "¿Qué representa el asa de la taza?", r: "A la persona que consulta y su hogar. Lo que aparece cerca del asa está cerca de su vida; el borde habla de lo inmediato y el fondo, de lo más hondo o lejano." },
          { p: "¿Es lo mismo que la tasseografía?", r: "Tasseografía es el nombre general de la lectura de tazas: incluye la borra del café y las hojas de té. La kahve falı turca es la forma más conocida de leer el café." },
        ],
        cta: {
          titulo: "¿Te leo la taza?",
          texto: "Prepara tu café, voltea la taza, toma una foto y Sibila te lee los símbolos que dejó la borra: lo que viene, lo que se está formando y el deseo que pediste.",
          boton: "Leer mi taza de café",
        },
      },
    },
  },
  {
    slug: "mal-de-ojo",
    clave: "huevo",
    href: "/huevo",
    // En español y portugués, la limpia con huevo; en Turquía, el mundo árabe y el resto, la lectura del café.
    hrefs: { en: "/cafe", fr: "/cafe", tr: "/cafe", ar: "/cafe", id: "/cafe", hi: "/cafe" },
    videos: {
      es: "/arcano/mal-de-ojo-es.mp4",
      pt: "/arcano/mal-de-ojo-pt.mp4",
      en: "/arcano/mal-de-ojo-en.mp4",
      fr: "/arcano/mal-de-ojo-fr.mp4",
      tr: "/arcano/mal-de-ojo-tr.mp4",
      ar: "/arcano/mal-de-ojo-ar.mp4",
    },
    portada: "/arcano/mal-de-ojo.jpg",
    publicada: "2026-11-25",
    fuentes: [
      { titulo: "Wikipedia: Mal de ojo", url: "https://es.wikipedia.org/wiki/Mal_de_ojo" },
      { titulo: "Wikipedia: Evil eye", url: "https://en.wikipedia.org/wiki/Evil_eye" },
      { titulo: "Wikipedia: Nazar (amulet)", url: "https://en.wikipedia.org/wiki/Nazar_(amulet)" },
      { titulo: "Wikipedia: Hamsa", url: "https://en.wikipedia.org/wiki/Hamsa" },
      { titulo: "Wikipedia: Eye-cup (copas con ojos de la Grecia antigua)", url: "https://en.wikipedia.org/wiki/Eye-cup" },
      { titulo: "Wikipedia: Fascinus (el amuleto romano)", url: "https://en.wikipedia.org/wiki/Fascinus" },
    ],
    textos: {
      es: {
        titulo: "El mal de ojo: el nazar, la khamsa y la limpia con huevo",
        descripcion:
          "El mal de ojo es una de las creencias más antiguas del mundo. Su historia desde Grecia y Roma, el ojo azul turco (nazar), la mano abierta de África del Norte y Oriente Medio (khamsa) y la limpia con huevo de Latinoamérica.",
        nombres: "Mal de ojo · Nazar (نظر) · Göz değmesi · العين · Ojeado · Baskanía (βασκανία) · Fascinatio",
        entrada:
          "Un ojo azul de vidrio que cuelga en la puerta de una casa en Estambul. Una mano abierta de bronce en una puerta de la medina de Fez. Una abuela que pasa un huevo despacio por la cabeza de su nieto en Guadalajara. Son tres gestos distintos, en tres lenguas distintas, para una misma idea: que una mirada cargada de envidia puede pesar, y que a los que queremos hay que cuidarlos.",
        secciones: [
          {
            titulo: "Una creencia tan antigua como la mirada",
            parrafos: [
              "La idea de que una mirada puede hacer daño aparece en casi todo el Mediterráneo, en Oriente Medio, en Asia del Sur y en Latinoamérica. Casi siempre nace del mismo lugar: la admiración que se vuelve envidia. Por eso el mal de ojo se teme más sobre lo que brilla: un bebé sano, una casa nueva, una cosecha buena, un amor que empieza.",
              "Los griegos lo llamaban baskanía, y en el siglo VI antes de Cristo pintaban grandes pares de ojos en las copas de beber, las llamadas «copas de ojos». Los romanos hablaban de fascinatio y de invidia, y colgaban amuletos, el fascinus, en el cuello de los niños y en las puertas. El escritor Plutarco dedicó una de sus «charlas de sobremesa» a discutir por qué algunas personas parecían tener la mirada pesada.",
            ],
          },
          {
            titulo: "Turquía: el nazar, el ojo que devuelve la mirada",
            parrafos: [
              "Nazar es una palabra árabe que quiere decir «mirada», y en turco nazar boncuğu es la «cuenta contra la mirada»: un ojo de vidrio azul oscuro, con círculos blanco, celeste y negro. El vidrio en forma de ojo es muy antiguo en el Mediterráneo, y en la Turquía de hoy el ojo azul está en todas partes: en la puerta de las casas, en el espejo del auto, en la ropa de los bebés y en la entrada de las tiendas.",
              "La tradición dice que el ojo azul recibe la mirada en lugar de la persona: la «devuelve». Y cuando una cuenta se rompe sin motivo, se dice que hizo su trabajo y se cambia por una nueva. Junto al nazar viven las palabras: maşallah («lo que Dios ha querido») se dice al elogiar a un niño o una casa, para que la admiración no se vuelva envidia.",
            ],
          },
          {
            titulo: "África del Norte y Oriente Medio: la khamsa cuida la entrada",
            parrafos: [
              "Khamsa (خمسة) quiere decir «cinco» en árabe: es la mano abierta, con sus cinco dedos, que se ve en las puertas, en los collares, en las paredes y en los regalos de boda desde Marruecos hasta el Levante. Muchas veces lleva un ojo en la palma. En el Magreb se la llama también khmisa, y la expresión «khamsa fi ‘aynek» («cinco en tu ojo») acompaña el gesto de mostrar la mano abierta ante una mirada pesada.",
              "La mano abierta es un signo de protección compartido por pueblos y religiones de la región: en las comunidades judías sefardíes y mizrajíes se la llama «mano de Miriam», y entre cristianos del Levante, «mano de María». El nombre «mano de Fátima» se popularizó en francés en la época colonial. En el mundo árabe también se cuida con la palabra: ma sha’ Allah (ما شاء الله) se dice ante algo hermoso, igual que en Turquía.",
            ],
          },
          {
            titulo: "Latinoamérica: el ojeado, el azabache y la limpia con huevo",
            parrafos: [
              "En Latinoamérica el mal de ojo es sobre todo cosa de bebés: se dice que un niño «está ojeado» cuando alguien lo miró mucho o lo elogió sin tocarlo. Por eso las abuelas les ponen una pulsera de hilo rojo o una manito de azabache, la piedra negra que llegó de España, y por eso en muchas familias quien elogia a un bebé lo toca enseguida, «para que no le haga ojo».",
              "Y cuando hace falta, llega la limpia: la abuela o la curandera pasa un huevo fresco por el cuerpo, de arriba hacia abajo, con ramas de ruda o albahaca y una oración, y luego lo rompe en un vaso de agua para leer lo que se llevó. Es la unión de las limpias de los pueblos de Mesoamérica con el huevo que llegó en los barcos europeos (te lo contamos completo en la ficha de la limpia con huevo).",
            ],
          },
          {
            titulo: "Tres caminos, una misma idea",
            parrafos: [
              "El ojo que devuelve la mirada, la mano que cuida la entrada y el huevo que recoge lo que pesa no son supersticiones sueltas: son maneras de decir, en cada cultura, que la envidia existe, que las palabras importan y que a los nuestros hay que cuidarlos. Por eso los tres se regalan: el nazar al recién nacido, la khamsa en la boda, la limpia de la abuela.",
              "Son costumbres y tradiciones, no tratamientos: cuando alguien se siente mal de salud, lo primero es ver a un médico.",
            ],
          },
        ],
        simbolos: {
          titulo: "Los guardianes de la mirada",
          intro: "Estos son los objetos y gestos más conocidos contra el mal de ojo en las tres tradiciones:",
          lista: [
            { s: "Nazar boncuğu (ojo azul)", d: "Turquía y el Mediterráneo oriental: recibe la mirada y la devuelve. Si se rompe, se cambia." },
            { s: "Khamsa (mano abierta)", d: "África del Norte y Oriente Medio: cinco dedos que cuidan la entrada de la casa." },
            { s: "Maşallah · ما شاء الله", d: "Las palabras que acompañan un elogio para que no se vuelva envidia." },
            { s: "Azabache", d: "Latinoamérica y España: una manito de piedra negra en la pulsera de los bebés." },
            { s: "Hilo rojo", d: "La pulsera más sencilla y extendida para los recién nacidos en Latinoamérica." },
            { s: "Ruda", d: "La planta de las limpias: se pone en la puerta o acompaña el huevo." },
            { s: "Limpia con huevo", d: "El huevo recoge lo que pesa y el vaso de agua muestra lo que se llevó." },
            { s: "Copas de ojos", d: "Grecia antigua: grandes ojos pintados en las copas de beber, siglo VI a. C." },
          ],
        },
        preguntas: [
          { p: "¿Qué es el mal de ojo?", r: "Es la creencia, presente en el Mediterráneo, Oriente Medio, Asia del Sur y Latinoamérica, de que una mirada cargada de envidia o de admiración excesiva puede pesar sobre una persona, sobre todo sobre los bebés, o sobre lo que tiene." },
          { p: "¿Qué significa el ojo azul turco?", r: "Es el nazar boncuğu, la «cuenta contra la mirada». Nazar es una palabra árabe que significa «mirada». La tradición dice que el ojo azul recibe la mirada en lugar de la persona y la devuelve; si se rompe, hizo su trabajo y se cambia por uno nuevo." },
          { p: "¿Qué es la khamsa o mano de Fátima?", r: "Khamsa significa «cinco» en árabe: es la mano abierta que protege la entrada de las casas en África del Norte y Oriente Medio. Las comunidades judías la llaman «mano de Miriam»; el nombre «mano de Fátima» se popularizó en francés en la época colonial." },
          { p: "¿Por qué a los bebés se les pone azabache o hilo rojo?", r: "En Latinoamérica se dice que los bebés son los más sensibles a la mirada. La pulsera de hilo rojo o la manito de azabache es la forma tradicional de cuidarlos, y quien elogia a un bebé lo toca enseguida «para que no le haga ojo»." },
          { p: "¿Qué tiene que ver la limpia con huevo con el mal de ojo?", r: "Es la forma latinoamericana de «quitar» el ojo: el huevo se pasa por el cuerpo para recoger lo que pesa y luego se rompe en un vaso de agua para leer lo que se llevó." },
        ],
        cta: {
          titulo: "¿Te leo?",
          texto: "Si hiciste tu limpia, toma una foto de tu vaso y Sibila te lee lo que se llevó el huevo. Y si eres de la tradición del café, voltea tu taza: Sibila lee los símbolos de la borra.",
          boton: "Leer con Sibila",
        },
      },
    },
  },
  {
    slug: "rituales-de-vela",
    clave: "velas",
    href: "/velas",
    curso: "rituales",
    portada: "/videos/portada/velas.jpg",
    publicada: "2026-11-25",
    fuentes: [
      { titulo: "Wikipedia: Votive candle (la vela votiva)", url: "https://en.wikipedia.org/wiki/Votive_candle" },
      { titulo: "Wikipedia: Candle (historia de la vela)", url: "https://en.wikipedia.org/wiki/Candle" },
      { titulo: "Wikipedia: Week-day names (los días y los siete astros)", url: "https://en.wikipedia.org/wiki/Week-day_names" },
      { titulo: "Wikipedia: Lunar phase (las fases de la Luna)", url: "https://en.wikipedia.org/wiki/Lunar_phase" },
      { titulo: "Wikipedia: Botánica (las tiendas de hierbas y velas)", url: "https://en.wikipedia.org/wiki/Botanica" },
    ],
    textos: {
      es: {
        titulo: "Los rituales de vela: colores, días, fases de la Luna y cómo se hacen",
        descripcion:
          "Encender una vela con una intención es uno de los rituales más antiguos y extendidos del mundo. Su historia, qué significa cada color, qué día y qué fase de la Luna elegir, cómo se prepara y qué se mira en la llama y en la cera.",
        nombres: "Vela de intención · Veladora · Vela votiva · Ceromancia (lectura de la cera)",
        entrada:
          "Una mujer que enciende una veladora frente a una foto en la mesa del comedor. Un hombre que, antes de una entrevista, prende una vela verde un jueves. Una abuela que pasa la mano sobre la llama y dice una oración que aprendió de su madre. Encender una vela con una intención es quizás el ritual más sencillo y más compartido del mundo: un poco de cera, una mecha y algo que pedir.",
        secciones: [
          {
            titulo: "La luz como ofrenda",
            parrafos: [
              "Desde la Antigüedad, encender una luz ha sido una forma de hablar con lo sagrado: lámparas de aceite en los templos de Egipto, de Grecia y de Roma, y más tarde velas de cera de abeja en las iglesias. En la tradición cristiana nació la vela votiva, de la palabra latina votum, «promesa»: una vela que se enciende para acompañar un pedido o para agradecer uno cumplido.",
              "En Latinoamérica esa costumbre se mezcló con saberes indígenas y africanos, y la vela se volvió parte de la vida de todos los días: la veladora de siete días en su vaso de vidrio, las velas de colores de los mercados, las botánicas del Caribe y de las ciudades de Estados Unidos, donde se venden junto a hierbas, aceites e inciensos.",
            ],
          },
          {
            titulo: "El lenguaje de los colores",
            parrafos: [
              "Cada color habla de una intención. No es una regla escrita en un solo libro, sino un lenguaje que se fue formando entre muchas tradiciones y que hoy comparten casi todas: el rosa y el rojo para el amor, el verde para el dinero y la abundancia, el blanco para la limpieza y la protección, el azul para la calma, el amarillo para la claridad, el naranja para el éxito, el morado para la intuición y el negro para cerrar ciclos y soltar.",
              "La tradición también dice que, si no se tiene el color, una vela blanca sirve para cualquier intención: el blanco contiene a todos.",
            ],
          },
          {
            titulo: "El día y la Luna",
            parrafos: [
              "Los días de la semana llevan el nombre de los siete astros que veían los antiguos: el lunes es de la Luna, el martes de Marte, el miércoles de Mercurio, el jueves de Júpiter y el viernes de Venus; el domingo, en muchas lenguas, es el día del Sol, y el sábado se asocia a Saturno. De ahí viene la costumbre de elegir el día según la intención: el viernes de Venus para el amor, el jueves de Júpiter para la abundancia, el domingo del Sol para el éxito, el miércoles de Mercurio para la claridad, el lunes de la Luna para la intuición y la calma, y el sábado de Saturno para proteger y cerrar.",
              "La Luna marca el otro ritmo: con la Luna creciente se enciende lo que se quiere atraer, con la llena se pide que algo culmine o se vea claro, con la menguante se suelta lo que pesa, y la Luna nueva es el momento de sembrar una intención que empieza.",
            ],
          },
          {
            titulo: "Cómo se prepara la vela",
            parrafos: [
              "Muchas familias empiezan por limpiar el espacio y escribir la intención en un papel, en presente y con palabras propias. Luego se «viste» la vela: se unta con un poco de aceite de la base hacia la mecha para atraer, o de la mecha hacia la base para soltar, y a veces se le marca con una aguja el nombre o la palabra de lo que se pide.",
              "Se enciende con un fósforo y no con el encendedor, dice la costumbre, y se deja arder sin soplarla: si hay que apagarla, se usa un apagavelas o los dedos humedecidos. Y lo más importante: una vela nunca se deja sola. Se pone sobre un plato o un vaso firme, lejos de cortinas, niños y mascotas.",
            ],
          },
          {
            titulo: "Lo que dicen la llama y la cera",
            parrafos: [
              "Mirar la llama y lo que queda de la vela es un arte con nombre propio: la ceromancia, la lectura de la cera. La llama alta y firme se lee como un pedido que avanza; la que baila o chisporrotea, como algo que se mueve alrededor; el humo negro, como obstáculos que se están quemando; la cera que corre como lágrimas, como emociones que se liberan.",
              "Al final se observan los restos: si la cera quedó limpia, si dibujó figuras, si el vaso se ennegreció. Cada tradición tiene su escuela, y la lectura siempre se hace pensando en la intención con la que se encendió la vela.",
            ],
          },
        ],
        simbolos: {
          titulo: "Qué vela encender",
          intro: "Así lo hacemos en Arcana, siguiendo la tradición de los colores, los días y la Luna:",
          lista: [
            { s: "Rosa (o rojo) · viernes", d: "Amor y reconciliación, con la Luna creciente." },
            { s: "Verde (o amarillo) · jueves", d: "Dinero y prosperidad, con la Luna creciente." },
            { s: "Blanco (o azul) · sábado", d: "Protección y limpieza, con la Luna llena." },
            { s: "Azul (o blanco) · lunes", d: "Calma y sanación emocional, con la Luna menguante." },
            { s: "Amarillo (o blanco) · miércoles", d: "Claridad para decidir, con la Luna llena." },
            { s: "Negro (o morado) · sábado", d: "Cerrar un ciclo y soltar, con la Luna menguante." },
            { s: "Naranja (o amarillo) · domingo", d: "Éxito y nuevos comienzos, con la Luna nueva." },
            { s: "Morado (o azul) · lunes", d: "Intuición y sueños, con la Luna llena." },
          ],
        },
        preguntas: [
          { p: "¿Qué color de vela encender para cada intención?", r: "La tradición usa el rosa o el rojo para el amor, el verde para el dinero, el blanco para la protección, el azul para la calma, el amarillo para la claridad, el naranja para el éxito, el morado para la intuición y el negro para cerrar ciclos. Si no tienes el color, una vela blanca sirve para cualquier intención." },
          { p: "¿Qué día es mejor para encender una vela?", r: "Cada día lleva el nombre de un astro: el viernes (Venus) para el amor, el jueves (Júpiter) para la abundancia, el domingo (Sol) para el éxito, el miércoles (Mercurio) para la claridad, el lunes (Luna) para la intuición y el sábado (Saturno) para proteger y cerrar." },
          { p: "¿Se puede soplar una vela de ritual?", r: "La costumbre dice que no: se deja consumir o se apaga con un apagavelas o con los dedos humedecidos. Y nunca se deja encendida sin nadie que la cuide." },
          { p: "¿Qué significa el humo negro en una vela?", r: "En la ceromancia, el humo negro se lee como obstáculos o cargas que se están quemando. Se mira siempre junto con la intención con la que se encendió la vela." },
          { p: "¿Qué es la ceromancia?", r: "Es la lectura de la cera y de la llama: cómo ardió la vela, qué figuras dejó la cera y cómo quedó el vaso o el plato." },
        ],
        cta: {
          titulo: "¿Qué dijo tu vela?",
          texto: "Elige tu intención y Sibila te dice qué vela encender, qué día y con qué Luna. Cuando termine de arder, fotografía los restos y Sibila lee lo que la cera y la llama dejaron dicho.",
          boton: "Mi ritual de vela",
        },
      },
    },
  },
];

export function entradaPorSlug(slug: string) {
  return BIBLIOTECA.find((e) => e.slug === slug) ?? null;
}

/** El video de la ficha en el idioma de quien la ve (sin caer en otro idioma: cada quien ve solo los de su idioma). */
export function videoEn(e: EntradaBiblioteca, idioma: Idioma) {
  return e.videos?.[idioma] ?? null;
}

export function fichaEn(e: EntradaBiblioteca, idioma: Idioma): Ficha {
  return e.textos[idioma] ?? e.textos.es;
}
