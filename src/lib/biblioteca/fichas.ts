import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * «Biblioteca de Sibila: tradiciones del mundo». Una ficha por práctica: su historia, cómo se hace, sus símbolos y
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
  textos: Partial<Record<Idioma, Ficha>> & { es: Ficha };
}

export const BIBLIOTECA: EntradaBiblioteca[] = [
  {
    slug: "lectura-del-cafe",
    clave: "cafe",
    href: "/cafe",
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

export function fichaEn(e: EntradaBiblioteca, idioma: Idioma): Ficha {
  return e.textos[idioma] ?? e.textos.es;
}
