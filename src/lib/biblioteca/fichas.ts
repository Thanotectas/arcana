import type { Idioma } from "@/lib/i18n/idiomas";

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
  /** Fecha de publicación (AAAA-MM-DD). */
  publicada: string;
  fuentes: { titulo: string; url: string }[];
  /** Video de la ficha por idioma (en /public/arcano, versión liviana); si falta el del idioma, el de español. */
  videos?: Partial<Record<Idioma, string>> & { es: string };
  /** Imagen del video (portada y miniatura). */
  portada?: string;
  textos: Partial<Record<Idioma, Ficha>> & { es: Ficha };
}

export const BIBLIOTECA: EntradaBiblioteca[] = [
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
];

export function entradaPorSlug(slug: string) {
  return BIBLIOTECA.find((e) => e.slug === slug) ?? null;
}

export function videoEn(e: EntradaBiblioteca, idioma: Idioma) {
  return e.videos ? (e.videos[idioma] ?? e.videos.es) : null;
}

export function fichaEn(e: EntradaBiblioteca, idioma: Idioma): Ficha {
  return e.textos[idioma] ?? e.textos.es;
}
