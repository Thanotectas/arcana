/**
 * Compatibilidad de nombres (herramienta pública /compatibilidad-nombres): textos en los 8 idiomas.
 * Es un juego de numerología pitagórica: tono lúdico y cálido, nunca un veredicto sobre una relación.
 */
import type { Idioma } from "@/lib/i18n/idiomas";
import type { Familia } from "./nombres-numerologia";

export interface TextosNombres {
  meta: { titulo: string; descripcion: string };
  seccion: string;
  titulo: string;
  intro: string;
  nombre1: string;
  nombre2: string;
  placeholder1: string;
  placeholder2: string;
  calcular: string;
  otraVez: string;
  errorVacio: string;
  /** «{a} y {b}». */
  pareja: string;
  numeroNombre: string;
  numeroAlma: string;
  explicaNombre: string;
  explicaAlma: string;
  sinVocales: string;
  /** «Leído como {latino}». */
  transliterado: string;
  aproximado: string;
  porQue: string;
  arquetipos: Record<number, string>;
  niveles: { titulo: string; texto: string }[];
  familias: Record<Familia, string>;
  misma: Record<Familia, string>;
  mezcla: Record<"ab" | "ac" | "bc", string>;
  aviso: string;
  comoFunciona: { titulo: string; parrafos: string[] };
  cta: { titulo: string; texto: string; boton: string };
}

export const TEXTOS_NOMBRES: Record<Idioma, TextosNombres> = {
  es: {
    meta: {
      titulo: "Compatibilidad de nombres gratis: numerología del amor",
      descripcion: "Escribe dos nombres y descubre su porcentaje de compatibilidad según la numerología pitagórica: el número de cada nombre, el de su alma y por qué combinan.",
    },
    seccion: "Numerología gratis",
    titulo: "Compatibilidad de nombres",
    intro: "Escribe dos nombres de pila y Sibila los convierte en números con la tabla pitagórica. Te muestra el número de cada nombre, el de su alma y cuánto vibran en sintonía.",
    nombre1: "Primer nombre",
    nombre2: "Segundo nombre",
    placeholder1: "Por ejemplo, Ana",
    placeholder2: "Por ejemplo, Luis",
    calcular: "Calcular compatibilidad",
    otraVez: "Probar con otros nombres",
    errorVacio: "Escribe los dos nombres.",
    pareja: "{a} y {b}",
    numeroNombre: "Número del nombre",
    numeroAlma: "Número del alma",
    explicaNombre: "La suma de todas las letras: cómo se expresa.",
    explicaAlma: "La suma de las vocales: lo que desea su corazón.",
    sinVocales: "Sin vocales escritas, el alma toma el número del nombre.",
    transliterado: "Leído como «{latino}»",
    aproximado: "Algunas letras se contaron de forma aproximada.",
    porQue: "Por qué combinan así",
    arquetipos: { 1: "El Pionero", 2: "El Diplomático", 3: "El Comunicador", 4: "El Constructor", 5: "El Aventurero", 6: "El Cuidador", 7: "El Buscador", 8: "El Ejecutivo", 9: "El Humanista", 11: "El Iluminador", 22: "El Arquitecto", 33: "El Maestro" },
    niveles: [
      { titulo: "Afinidad luminosa", texto: "Sus números vibran en sintonía: es de esas combinaciones que se sienten fáciles desde el principio." },
      { titulo: "Gran conexión", texto: "Hay mucha afinidad natural y diferencias que suman. Una pareja de números con muy buena energía." },
      { titulo: "Buena química", texto: "Comparten bastante, y lo que los diferencia puede enriquecerlos. Con diálogo, la conexión crece." },
      { titulo: "Complementarios", texto: "Sus números hablan idiomas distintos, y eso puede ser un regalo: cada uno le muestra al otro una forma nueva de ver la vida." },
      { titulo: "Un reto que enseña", texto: "Sus números se mueven a ritmos diferentes. No es un mal augurio: las parejas que se retan suelen aprender mucho juntas." },
    ],
    familias: { a: "espíritus libres (1, 5, 7)", b: "constructores (2, 4, 8)", c: "corazones creativos (3, 6, 9)" },
    misma: {
      a: "Los dos nombres pertenecen a la familia de los espíritus libres (1, 5, 7): se entienden sin pedirse explicaciones y se dan espacio para crecer. El reto es acordarse de compartir el camino, no solo la aventura.",
      b: "Los dos nombres pertenecen a la familia de los constructores (2, 4, 8): valoran la lealtad, la constancia y los planes en común. El reto es dejar entrar la espontaneidad de vez en cuando.",
      c: "Los dos nombres pertenecen a la familia de los corazones creativos (3, 6, 9): hay ternura, risa y ganas de expresarse. El reto es cuidar también lo práctico del día a día.",
    },
    mezcla: {
      ab: "Un espíritu libre (1, 5, 7) y un constructor (2, 4, 8): uno trae novedad y el otro, raíces. Se complementan muy bien cuando respetan sus ritmos distintos.",
      ac: "Un espíritu libre (1, 5, 7) y un corazón creativo (3, 6, 9): mucha chispa, ideas y entusiasmo compartido. Funcionan de maravilla cuando aterrizan juntos sus sueños.",
      bc: "Un constructor (2, 4, 8) y un corazón creativo (3, 6, 9): estructura y cariño en el mismo equipo. Uno sostiene, el otro alegra; juntos pueden crear un hogar cálido.",
    },
    aviso: "Es un juego de numerología para reflexionar y divertirse: ningún número decide una relación.",
    comoFunciona: {
      titulo: "¿Cómo se calcula la compatibilidad de nombres?",
      parrafos: [
        "En la numerología pitagórica cada letra vale un número del 1 al 9 (A=1, B=2… I=9, J=1…). Sumamos las letras de cada nombre y las reducimos a una cifra, conservando los números maestros 11, 22 y 33. Así sale el número del nombre; con las vocales, el número del alma.",
        "Los números se agrupan en tres familias: los espíritus libres (1, 5, 7), los constructores (2, 4, 8) y los corazones creativos (3, 6, 9). Dos números de la misma familia se entienden con facilidad; de familias distintas, se complementan. Los nombres en árabe o en devanagari se transliteran al alfabeto latino antes de contar.",
      ],
    },
    cta: {
      titulo: "¿Quieres ir más allá de los nombres?",
      texto: "La compatibilidad completa cruza las fechas de nacimiento, los signos y la numerología de los dos. Sibila te cuenta en qué se parecen, en qué se complementan y cómo cuidarse.",
      boton: "Ver nuestra compatibilidad completa",
    },
  },
  en: {
    meta: {
      titulo: "Free Name Compatibility: love numerology for two names",
      descripcion: "Enter two names and discover their compatibility percentage according to Pythagorean numerology: each name's number, its soul number and why they match.",
    },
    seccion: "Free numerology",
    titulo: "Name Compatibility",
    intro: "Write two first names and Sibila turns them into numbers with the Pythagorean table. She shows you each name's number, its soul number and how well they vibrate together.",
    nombre1: "First name",
    nombre2: "Second name",
    placeholder1: "For example, Emma",
    placeholder2: "For example, Liam",
    calcular: "Calculate compatibility",
    otraVez: "Try other names",
    errorVacio: "Please write both names.",
    pareja: "{a} and {b}",
    numeroNombre: "Name number",
    numeroAlma: "Soul number",
    explicaNombre: "The sum of all the letters: how this person expresses themselves.",
    explicaAlma: "The sum of the vowels: what the heart longs for.",
    sinVocales: "With no written vowels, the soul takes the name number.",
    transliterado: "Read as \"{latino}\"",
    aproximado: "Some letters were counted approximately.",
    porQue: "Why they match this way",
    arquetipos: { 1: "The Pioneer", 2: "The Diplomat", 3: "The Communicator", 4: "The Builder", 5: "The Adventurer", 6: "The Caregiver", 7: "The Seeker", 8: "The Executive", 9: "The Humanitarian", 11: "The Illuminator", 22: "The Architect", 33: "The Master" },
    niveles: [
      { titulo: "Radiant affinity", texto: "Their numbers vibrate in tune: one of those combinations that feels easy from the very start." },
      { titulo: "Great connection", texto: "Plenty of natural affinity, and differences that add up. A pair of numbers with very good energy." },
      { titulo: "Good chemistry", texto: "They share a lot, and what sets them apart can enrich them. With open conversation, the bond grows." },
      { titulo: "Complementary", texto: "Their numbers speak different languages, and that can be a gift: each shows the other a new way of seeing life." },
      { titulo: "A challenge that teaches", texto: "Their numbers move at different rhythms. That's no bad omen: couples who challenge each other often learn a lot together." },
    ],
    familias: { a: "free spirits (1, 5, 7)", b: "builders (2, 4, 8)", c: "creative hearts (3, 6, 9)" },
    misma: {
      a: "Both names belong to the free spirits family (1, 5, 7): they understand each other without explanations and give each other room to grow. The challenge is remembering to share the road, not just the adventure.",
      b: "Both names belong to the builders family (2, 4, 8): they value loyalty, consistency and shared plans. The challenge is letting a little spontaneity in now and then.",
      c: "Both names belong to the creative hearts family (3, 6, 9): there's tenderness, laughter and a love of self-expression. The challenge is also looking after the practical side of everyday life.",
    },
    mezcla: {
      ab: "A free spirit (1, 5, 7) and a builder (2, 4, 8): one brings novelty, the other brings roots. They complement each other beautifully when they respect their different rhythms.",
      ac: "A free spirit (1, 5, 7) and a creative heart (3, 6, 9): lots of spark, ideas and shared enthusiasm. They work wonderfully when they bring their dreams down to earth together.",
      bc: "A builder (2, 4, 8) and a creative heart (3, 6, 9): structure and affection on the same team. One holds things steady, the other brings joy; together they can create a warm home.",
    },
    aviso: "This is a numerology game for reflection and fun: no number decides a relationship.",
    comoFunciona: {
      titulo: "How is name compatibility calculated?",
      parrafos: [
        "In Pythagorean numerology each letter is worth a number from 1 to 9 (A=1, B=2… I=9, J=1…). We add up the letters of each name and reduce the total to a single digit, keeping the master numbers 11, 22 and 33. That gives the name number; with the vowels only, the soul number.",
        "Numbers fall into three families: free spirits (1, 5, 7), builders (2, 4, 8) and creative hearts (3, 6, 9). Two numbers from the same family understand each other easily; from different families, they complement each other. Names written in Arabic or Devanagari are transliterated into the Latin alphabet before counting.",
      ],
    },
    cta: {
      titulo: "Want to go beyond names?",
      texto: "A full compatibility reading combines both birth dates, zodiac signs and numerology. Sibila tells you how you're alike, how you complement each other and how to take care of each other.",
      boton: "See our full compatibility",
    },
  },
  pt: {
    meta: {
      titulo: "Compatibilidade de nomes grátis: numerologia do amor",
      descripcion: "Escreva dois nomes e descubra a porcentagem de compatibilidade segundo a numerologia pitagórica: o número de cada nome, o da alma e por que combinam.",
    },
    seccion: "Numerologia grátis",
    titulo: "Compatibilidade de nomes",
    intro: "Escreva dois primeiros nomes e Sibila os transforma em números com a tabela pitagórica. Ela mostra o número de cada nome, o da alma e o quanto vibram em sintonia.",
    nombre1: "Primeiro nome",
    nombre2: "Segundo nome",
    placeholder1: "Por exemplo, Ana",
    placeholder2: "Por exemplo, Pedro",
    calcular: "Calcular compatibilidade",
    otraVez: "Testar outros nomes",
    errorVacio: "Escreva os dois nomes.",
    pareja: "{a} e {b}",
    numeroNombre: "Número do nome",
    numeroAlma: "Número da alma",
    explicaNombre: "A soma de todas as letras: como a pessoa se expressa.",
    explicaAlma: "A soma das vogais: o que o coração deseja.",
    sinVocales: "Sem vogais escritas, a alma recebe o número do nome.",
    transliterado: "Lido como «{latino}»",
    aproximado: "Algumas letras foram contadas de forma aproximada.",
    porQue: "Por que combinam assim",
    arquetipos: { 1: "O Pioneiro", 2: "O Diplomata", 3: "O Comunicador", 4: "O Construtor", 5: "O Aventureiro", 6: "O Cuidador", 7: "O Buscador", 8: "O Executivo", 9: "O Humanista", 11: "O Iluminador", 22: "O Arquiteto", 33: "O Mestre" },
    niveles: [
      { titulo: "Afinidade luminosa", texto: "Os números vibram em sintonia: é uma daquelas combinações que parecem fáceis desde o início." },
      { titulo: "Grande conexão", texto: "Há muita afinidade natural e diferenças que somam. Um par de números com energia muito boa." },
      { titulo: "Boa química", texto: "Os dois compartilham bastante, e o que os diferencia pode enriquecê-los. Com diálogo, a conexão cresce." },
      { titulo: "Complementares", texto: "Os números falam línguas diferentes, e isso pode ser um presente: cada um mostra ao outro um jeito novo de ver a vida." },
      { titulo: "Um desafio que ensina", texto: "Os números se movem em ritmos diferentes. Não é mau sinal: casais que se desafiam costumam aprender muito juntos." },
    ],
    familias: { a: "espíritos livres (1, 5, 7)", b: "construtores (2, 4, 8)", c: "corações criativos (3, 6, 9)" },
    misma: {
      a: "Os dois nomes pertencem à família dos espíritos livres (1, 5, 7): se entendem sem pedir explicações e dão espaço um ao outro para crescer. O desafio é lembrar de compartilhar o caminho, não só a aventura.",
      b: "Os dois nomes pertencem à família dos construtores (2, 4, 8): valorizam a lealdade, a constância e os planos em comum. O desafio é deixar a espontaneidade entrar de vez em quando.",
      c: "Os dois nomes pertencem à família dos corações criativos (3, 6, 9): há ternura, riso e vontade de se expressar. O desafio é cuidar também do lado prático do dia a dia.",
    },
    mezcla: {
      ab: "Um espírito livre (1, 5, 7) e um construtor (2, 4, 8): um traz novidade e o outro, raízes. Eles se complementam muito bem quando respeitam seus ritmos diferentes.",
      ac: "Um espírito livre (1, 5, 7) e um coração criativo (3, 6, 9): muita faísca, ideias e entusiasmo compartilhado. Funcionam maravilhosamente quando colocam juntos os sonhos no chão.",
      bc: "Um construtor (2, 4, 8) e um coração criativo (3, 6, 9): estrutura e carinho no mesmo time. Um sustenta, o outro alegra; juntos podem criar um lar acolhedor.",
    },
    aviso: "É um jogo de numerologia para refletir e se divertir: nenhum número decide um relacionamento.",
    comoFunciona: {
      titulo: "Como se calcula a compatibilidade de nomes?",
      parrafos: [
        "Na numerologia pitagórica cada letra vale um número de 1 a 9 (A=1, B=2… I=9, J=1…). Somamos as letras de cada nome e reduzimos a um só dígito, mantendo os números mestres 11, 22 e 33. Assim sai o número do nome; só com as vogais, o número da alma.",
        "Os números se agrupam em três famílias: os espíritos livres (1, 5, 7), os construtores (2, 4, 8) e os corações criativos (3, 6, 9). Dois números da mesma família se entendem com facilidade; de famílias diferentes, se complementam. Nomes em árabe ou devanágari são transliterados para o alfabeto latino antes da contagem.",
      ],
    },
    cta: {
      titulo: "Quer ir além dos nomes?",
      texto: "A compatibilidade completa cruza as datas de nascimento, os signos e a numerologia dos dois. Sibila conta em que vocês se parecem, em que se complementam e como cuidar um do outro.",
      boton: "Ver nossa compatibilidade completa",
    },
  },
  fr: {
    meta: {
      titulo: "Compatibilité des prénoms gratuite : la numérologie de l'amour",
      descripcion: "Écris deux prénoms et découvre leur pourcentage de compatibilité selon la numérologie pythagoricienne : le nombre de chaque prénom, celui de l'âme et pourquoi ils s'accordent.",
    },
    seccion: "Numérologie gratuite",
    titulo: "Compatibilité des prénoms",
    intro: "Écris deux prénoms et Sibila les transforme en nombres grâce à la table de Pythagore. Elle te montre le nombre de chaque prénom, celui de l'âme et à quel point ils vibrent ensemble.",
    nombre1: "Premier prénom",
    nombre2: "Deuxième prénom",
    placeholder1: "Par exemple, Léa",
    placeholder2: "Par exemple, Hugo",
    calcular: "Calculer la compatibilité",
    otraVez: "Essayer d'autres prénoms",
    errorVacio: "Écris les deux prénoms.",
    pareja: "{a} et {b}",
    numeroNombre: "Nombre du prénom",
    numeroAlma: "Nombre de l'âme",
    explicaNombre: "La somme de toutes les lettres : la façon de s'exprimer.",
    explicaAlma: "La somme des voyelles : ce que désire le cœur.",
    sinVocales: "Sans voyelles écrites, l'âme prend le nombre du prénom.",
    transliterado: "Lu comme « {latino} »",
    aproximado: "Certaines lettres ont été comptées de façon approximative.",
    porQue: "Pourquoi ils s'accordent ainsi",
    arquetipos: { 1: "Le Pionnier", 2: "Le Diplomate", 3: "Le Communicant", 4: "Le Bâtisseur", 5: "L'Aventurier", 6: "Le Protecteur", 7: "Le Chercheur", 8: "Le Meneur", 9: "L'Humaniste", 11: "L'Éclaireur", 22: "L'Architecte", 33: "Le Maître" },
    niveles: [
      { titulo: "Affinité lumineuse", texto: "Leurs nombres vibrent à l'unisson : une de ces combinaisons qui paraissent simples dès le début." },
      { titulo: "Belle connexion", texto: "Beaucoup d'affinités naturelles et des différences qui enrichissent. Un duo de nombres avec une très belle énergie." },
      { titulo: "Bonne alchimie", texto: "Ils ont beaucoup en commun, et ce qui les distingue peut les enrichir. Avec le dialogue, le lien grandit." },
      { titulo: "Complémentaires", texto: "Leurs nombres parlent des langues différentes, et ça peut être un cadeau : chacun montre à l'autre une nouvelle façon de voir la vie." },
      { titulo: "Un défi qui fait grandir", texto: "Leurs nombres avancent à des rythmes différents. Ce n'est pas un mauvais présage : les couples qui se stimulent apprennent souvent beaucoup ensemble." },
    ],
    familias: { a: "esprits libres (1, 5, 7)", b: "bâtisseurs (2, 4, 8)", c: "cœurs créatifs (3, 6, 9)" },
    misma: {
      a: "Les deux prénoms appartiennent à la famille des esprits libres (1, 5, 7) : ils se comprennent sans se justifier et se laissent de l'espace pour grandir. Le défi, c'est de penser à partager le chemin, pas seulement l'aventure.",
      b: "Les deux prénoms appartiennent à la famille des bâtisseurs (2, 4, 8) : ils apprécient la loyauté, la constance et les projets communs. Le défi, c'est de laisser entrer un peu de spontanéité de temps en temps.",
      c: "Les deux prénoms appartiennent à la famille des cœurs créatifs (3, 6, 9) : il y a de la tendresse, des rires et l'envie de s'exprimer. Le défi, c'est de prendre soin aussi du côté pratique du quotidien.",
    },
    mezcla: {
      ab: "Un esprit libre (1, 5, 7) et un bâtisseur (2, 4, 8) : l'un apporte la nouveauté, l'autre les racines. Ils se complètent très bien quand ils respectent leurs rythmes différents.",
      ac: "Un esprit libre (1, 5, 7) et un cœur créatif (3, 6, 9) : beaucoup d'étincelles, d'idées et d'enthousiasme partagé. Ça fonctionne à merveille quand ils ancrent leurs rêves ensemble.",
      bc: "Un bâtisseur (2, 4, 8) et un cœur créatif (3, 6, 9) : structure et tendresse dans la même équipe. L'un soutient, l'autre égaye ; ensemble, ils peuvent créer un foyer chaleureux.",
    },
    aviso: "C'est un jeu de numérologie pour réfléchir et s'amuser : aucun nombre ne décide d'une relation.",
    comoFunciona: {
      titulo: "Comment se calcule la compatibilité des prénoms ?",
      parrafos: [
        "En numérologie pythagoricienne, chaque lettre vaut un nombre de 1 à 9 (A=1, B=2… I=9, J=1…). Nous additionnons les lettres de chaque prénom et réduisons le total à un seul chiffre, en gardant les nombres maîtres 11, 22 et 33. On obtient ainsi le nombre du prénom ; avec les voyelles seulement, le nombre de l'âme.",
        "Les nombres se regroupent en trois familles : les esprits libres (1, 5, 7), les bâtisseurs (2, 4, 8) et les cœurs créatifs (3, 6, 9). Deux nombres de la même famille se comprennent facilement ; de familles différentes, ils se complètent. Les prénoms écrits en arabe ou en devanagari sont translittérés en alphabet latin avant le calcul.",
      ],
    },
    cta: {
      titulo: "Tu veux aller plus loin que les prénoms ?",
      texto: "La compatibilité complète croise vos dates de naissance, vos signes et votre numérologie. Sibila te dit en quoi vous vous ressemblez, en quoi vous vous complétez et comment prendre soin l'un de l'autre.",
      boton: "Voir notre compatibilité complète",
    },
  },
  tr: {
    meta: {
      titulo: "Ücretsiz isim uyumu: aşkın numerolojisi",
      descripcion: "İki isim yaz ve Pisagor numerolojisine göre uyum yüzdesini keşfet: her ismin sayısı, ruh sayısı ve neden uyumlu oldukları.",
    },
    seccion: "Ücretsiz numeroloji",
    titulo: "İsim uyumu",
    intro: "İki isim yaz, Sibila onları Pisagor tablosuyla sayılara dönüştürsün. Sana her ismin sayısını, ruh sayısını ve ne kadar uyum içinde titreştiklerini göstersin.",
    nombre1: "Birinci isim",
    nombre2: "İkinci isim",
    placeholder1: "Örneğin Elif",
    placeholder2: "Örneğin Can",
    calcular: "Uyumu hesapla",
    otraVez: "Başka isimler dene",
    errorVacio: "İki ismi de yaz.",
    pareja: "{a} ve {b}",
    numeroNombre: "İsim sayısı",
    numeroAlma: "Ruh sayısı",
    explicaNombre: "Tüm harflerin toplamı: kişinin kendini ifade biçimi.",
    explicaAlma: "Ünlü harflerin toplamı: kalbin arzusu.",
    sinVocales: "Yazılı ünlü harf olmadığında ruh sayısı isim sayısını alır.",
    transliterado: "«{latino}» olarak okundu",
    aproximado: "Bazı harfler yaklaşık olarak sayıldı.",
    porQue: "Neden böyle uyumlular",
    arquetipos: { 1: "Öncü", 2: "Diplomat", 3: "İletişimci", 4: "İnşacı", 5: "Maceracı", 6: "Koruyucu", 7: "Arayıcı", 8: "Yönetici", 9: "İnsansever", 11: "Aydınlatıcı", 22: "Mimar", 33: "Usta" },
    niveles: [
      { titulo: "Işıltılı yakınlık", texto: "Sayıları uyum içinde titreşiyor: en baştan kolay hissettiren o kombinasyonlardan biri." },
      { titulo: "Güçlü bağ", texto: "Çok fazla doğal yakınlık ve zenginleştiren farklılıklar var. Enerjisi çok iyi bir sayı ikilisi." },
      { titulo: "İyi bir kimya", texto: "Pek çok ortak yönleri var ve onları ayıran şey zenginlik katabilir. Konuştukça bağ güçlenir." },
      { titulo: "Birbirini tamamlayanlar", texto: "Sayıları farklı diller konuşuyor ve bu bir armağan olabilir: her biri diğerine hayata yeni bir bakış gösterir." },
      { titulo: "Öğreten bir meydan okuma", texto: "Sayıları farklı ritimlerde ilerliyor. Bu kötü bir işaret değil: birbirini zorlayan çiftler çoğu zaman birlikte çok şey öğrenir." },
    ],
    familias: { a: "özgür ruhlar (1, 5, 7)", b: "inşacılar (2, 4, 8)", c: "yaratıcı kalpler (3, 6, 9)" },
    misma: {
      a: "İki isim de özgür ruhlar ailesinden (1, 5, 7): açıklamaya gerek duymadan anlaşırlar ve birbirlerine büyümeleri için alan tanırlar. Zorluk, sadece macerayı değil yolu da paylaşmayı hatırlamak.",
      b: "İki isim de inşacılar ailesinden (2, 4, 8): sadakate, istikrara ve ortak planlara değer verirler. Zorluk, ara sıra biraz kendiliğindenliğe yer açmak.",
      c: "İki isim de yaratıcı kalpler ailesinden (3, 6, 9): şefkat, kahkaha ve kendini ifade etme isteği var. Zorluk, günlük hayatın pratik yanına da özen göstermek.",
    },
    mezcla: {
      ab: "Bir özgür ruh (1, 5, 7) ve bir inşacı (2, 4, 8): biri yenilik, diğeri kök getirir. Farklı ritimlerine saygı duyduklarında birbirlerini çok güzel tamamlarlar.",
      ac: "Bir özgür ruh (1, 5, 7) ve bir yaratıcı kalp (3, 6, 9): bolca kıvılcım, fikir ve ortak heyecan. Hayallerini birlikte gerçeğe döktüklerinde harika işlerler.",
      bc: "Bir inşacı (2, 4, 8) ve bir yaratıcı kalp (3, 6, 9): aynı takımda yapı ve sevgi. Biri taşır, diğeri neşelendirir; birlikte sıcak bir yuva kurabilirler.",
    },
    aviso: "Bu, düşünmek ve eğlenmek için bir numeroloji oyunu: hiçbir sayı bir ilişkiye karar vermez.",
    comoFunciona: {
      titulo: "İsim uyumu nasıl hesaplanır?",
      parrafos: [
        "Pisagor numerolojisinde her harf 1'den 9'a bir sayıya karşılık gelir (A=1, B=2… I=9, J=1…). Her ismin harflerini toplar, 11, 22 ve 33 usta sayılarını koruyarak tek haneye indiririz. Böylece isim sayısı çıkar; sadece ünlü harflerle de ruh sayısı.",
        "Sayılar üç aileye ayrılır: özgür ruhlar (1, 5, 7), inşacılar (2, 4, 8) ve yaratıcı kalpler (3, 6, 9). Aynı aileden iki sayı kolayca anlaşır; farklı ailelerden olanlar birbirini tamamlar. Arapça ya da Devanagari ile yazılmış isimler saymadan önce Latin alfabesine çevrilir.",
      ],
    },
    cta: {
      titulo: "İsimlerin ötesine geçmek ister misin?",
      texto: "Tam uyum okuması ikinizin doğum tarihlerini, burçlarını ve numerolojisini birleştirir. Sibila sana nerede benzediğinizi, nerede tamamladığınızı ve birbirinize nasıl iyi bakacağınızı anlatır.",
      boton: "Tam uyumumuzu gör",
    },
  },
  ar: {
    meta: {
      titulo: "توافق الأسماء مجانًا: علم أعداد الحب",
      descripcion: "اكتب اسمين واكتشف نسبة توافقهما وفق علم الأعداد الفيثاغوري: رقم كل اسم، ورقم الروح، وسبب انسجامهما.",
    },
    seccion: "علم الأعداد مجانًا",
    titulo: "توافق الأسماء",
    intro: "اكتب اسمين أوّلين، وستحوّلهما سيبيلا إلى أرقام وفق الجدول الفيثاغوري، ثم تعرض رقم كل اسم ورقم روحه ومدى انسجامهما.",
    nombre1: "الاسم الأول",
    nombre2: "الاسم الثاني",
    placeholder1: "مثلًا: ليلى",
    placeholder2: "مثلًا: عمر",
    calcular: "احسب التوافق",
    otraVez: "جرّب أسماء أخرى",
    errorVacio: "يرجى كتابة الاسمين.",
    pareja: "{a} و{b}",
    numeroNombre: "رقم الاسم",
    numeroAlma: "رقم الروح",
    explicaNombre: "مجموع كل الحروف: طريقة التعبير عن الذات.",
    explicaAlma: "مجموع حروف العلة: ما يتمناه القلب.",
    sinVocales: "حين لا تُكتب حروف العلة، يأخذ رقم الروح قيمة رقم الاسم.",
    transliterado: "قُرئ بالحروف اللاتينية: {latino}",
    aproximado: "حُسبت بعض الحروف بشكل تقريبي.",
    porQue: "لماذا يتوافقان بهذا الشكل",
    arquetipos: { 1: "الرائد", 2: "الدبلوماسي", 3: "المتواصل", 4: "البنّاء", 5: "المغامر", 6: "الراعي", 7: "الباحث", 8: "القائد", 9: "الإنساني", 11: "المُلهِم", 22: "المهندس", 33: "المعلّم" },
    niveles: [
      { titulo: "انسجام مشرق", texto: "يتناغم الرقمان معًا: من تلك التركيبات التي تبدو سهلة منذ البداية." },
      { titulo: "صلة قوية", texto: "توافق طبيعي كبير واختلافات تضيف ولا تنقص. ثنائي أرقام بطاقة جميلة جدًا." },
      { titulo: "كيمياء طيبة", texto: "قواسم مشتركة كثيرة، وما يميّز كل طرف قد يُثري الآخر. بالحوار تكبر الصلة." },
      { titulo: "تكامل", texto: "يتحدث الرقمان لغتين مختلفتين، وقد يكون ذلك هدية: كل طرف يُري الآخر طريقة جديدة لرؤية الحياة." },
      { titulo: "تحدٍّ يُعلّم", texto: "يسير الرقمان بإيقاعين مختلفين. ليس هذا نذير سوء: الثنائيات التي تتحدى بعضها كثيرًا ما تتعلم الكثير معًا." },
    ],
    familias: { a: "الأرواح الحرة (1، 5، 7)", b: "البنّاؤون (2، 4، 8)", c: "القلوب المبدعة (3، 6، 9)" },
    misma: {
      a: "ينتمي الاسمان إلى عائلة الأرواح الحرة (1، 5، 7): تفاهم من دون حاجة إلى تبرير، ومساحة متبادلة للنمو. التحدي هو تذكّر مشاركة الطريق، لا المغامرة وحدها.",
      b: "ينتمي الاسمان إلى عائلة البنّائين (2، 4، 8): تقدير للوفاء والثبات والخطط المشتركة. التحدي هو إفساح المجال للعفوية بين حين وآخر.",
      c: "ينتمي الاسمان إلى عائلة القلوب المبدعة (3، 6، 9): حنان وضحك ورغبة في التعبير. التحدي هو العناية أيضًا بالجانب العملي من الحياة اليومية.",
    },
    mezcla: {
      ab: "روح حرة (1، 5، 7) وبنّاء (2، 4، 8): طرف يجلب الجديد وطرف يجلب الجذور. يتكاملان بشكل جميل حين يحترمان اختلاف إيقاعهما.",
      ac: "روح حرة (1، 5، 7) وقلب مبدع (3، 6، 9): شرارة وأفكار وحماس مشترك. ينجح الثنائي على نحو رائع حين يحوّلان الأحلام معًا إلى واقع.",
      bc: "بنّاء (2، 4، 8) وقلب مبدع (3، 6، 9): البنية والمودّة في فريق واحد. طرف يسند وطرف يُبهج، ومعًا يمكن بناء بيت دافئ.",
    },
    aviso: "هذه لعبة من علم الأعداد للتأمل والمتعة: لا يحدّد أي رقم مصير علاقة.",
    comoFunciona: {
      titulo: "كيف يُحسب توافق الأسماء؟",
      parrafos: [
        "في علم الأعداد الفيثاغوري، لكل حرف لاتيني قيمة من 1 إلى 9 (A=1، B=2… I=9، J=1…). نجمع حروف كل اسم ونختصر المجموع إلى رقم واحد، مع الإبقاء على الأرقام الرئيسية 11 و22 و33. هكذا نحصل على رقم الاسم، ومن حروف العلة وحدها نحصل على رقم الروح.",
        "تنقسم الأرقام إلى ثلاث عائلات: الأرواح الحرة (1، 5، 7)، والبنّاؤون (2، 4، 8)، والقلوب المبدعة (3، 6، 9). الرقمان من العائلة نفسها يتفاهمان بسهولة، ومن عائلتين مختلفتين يتكاملان. تُنقل الأسماء المكتوبة بالعربية أو بالديفاناغاري إلى الحروف اللاتينية قبل الحساب.",
      ],
    },
    cta: {
      titulo: "هل تودّ تجاوز الأسماء؟",
      texto: "تجمع قراءة التوافق الكاملة بين تاريخَي الميلاد والبرجين وعلم الأعداد لكليكما. تخبركما سيبيلا بأوجه الشبه، وبما يكمّل به كل طرف الآخر، وبطرق العناية المتبادلة.",
      boton: "عرض توافقنا الكامل",
    },
  },
  id: {
    meta: {
      titulo: "Kecocokan nama gratis: numerologi cinta",
      descripcion: "Tulis dua nama dan temukan persentase kecocokannya menurut numerologi Pythagoras: angka setiap nama, angka jiwanya, dan alasan keduanya cocok.",
    },
    seccion: "Numerologi gratis",
    titulo: "Kecocokan nama",
    intro: "Tulis dua nama depan dan Sibila akan mengubahnya menjadi angka dengan tabel Pythagoras. Ia menunjukkan angka setiap nama, angka jiwanya, dan seberapa selaras getarannya.",
    nombre1: "Nama pertama",
    nombre2: "Nama kedua",
    placeholder1: "Misalnya, Putri",
    placeholder2: "Misalnya, Budi",
    calcular: "Hitung kecocokan",
    otraVez: "Coba nama lain",
    errorVacio: "Tulis kedua nama.",
    pareja: "{a} dan {b}",
    numeroNombre: "Angka nama",
    numeroAlma: "Angka jiwa",
    explicaNombre: "Jumlah semua huruf: cara seseorang mengekspresikan diri.",
    explicaAlma: "Jumlah huruf vokal: apa yang diinginkan hati.",
    sinVocales: "Tanpa huruf vokal tertulis, angka jiwa mengikuti angka nama.",
    transliterado: "Dibaca sebagai \"{latino}\"",
    aproximado: "Beberapa huruf dihitung secara perkiraan.",
    porQue: "Kenapa mereka cocok seperti ini",
    arquetipos: { 1: "Sang Perintis", 2: "Sang Diplomat", 3: "Sang Komunikator", 4: "Sang Pembangun", 5: "Sang Petualang", 6: "Sang Pengasuh", 7: "Sang Pencari", 8: "Sang Eksekutif", 9: "Sang Humanis", 11: "Sang Penerang", 22: "Sang Arsitek", 33: "Sang Guru" },
    niveles: [
      { titulo: "Kecocokan bersinar", texto: "Angka-angka mereka bergetar selaras: salah satu kombinasi yang terasa mudah sejak awal." },
      { titulo: "Koneksi kuat", texto: "Banyak kecocokan alami dan perbedaan yang saling melengkapi. Pasangan angka dengan energi yang sangat baik." },
      { titulo: "Chemistry yang baik", texto: "Mereka punya banyak kesamaan, dan perbedaannya bisa memperkaya. Dengan saling bicara, ikatannya makin tumbuh." },
      { titulo: "Saling melengkapi", texto: "Angka-angka mereka berbicara dengan bahasa berbeda, dan itu bisa jadi hadiah: masing-masing menunjukkan cara baru memandang hidup." },
      { titulo: "Tantangan yang mendewasakan", texto: "Angka-angka mereka bergerak dengan irama berbeda. Itu bukan pertanda buruk: pasangan yang saling menantang sering belajar banyak bersama." },
    ],
    familias: { a: "jiwa bebas (1, 5, 7)", b: "pembangun (2, 4, 8)", c: "hati kreatif (3, 6, 9)" },
    misma: {
      a: "Kedua nama termasuk keluarga jiwa bebas (1, 5, 7): saling mengerti tanpa perlu banyak penjelasan dan memberi ruang untuk tumbuh. Tantangannya adalah ingat untuk berbagi perjalanan, bukan hanya petualangan.",
      b: "Kedua nama termasuk keluarga pembangun (2, 4, 8): menghargai kesetiaan, konsistensi, dan rencana bersama. Tantangannya adalah sesekali memberi tempat untuk spontanitas.",
      c: "Kedua nama termasuk keluarga hati kreatif (3, 6, 9): ada kelembutan, tawa, dan keinginan berekspresi. Tantangannya adalah juga merawat sisi praktis kehidupan sehari-hari.",
    },
    mezcla: {
      ab: "Jiwa bebas (1, 5, 7) dan pembangun (2, 4, 8): yang satu membawa hal baru, yang lain membawa akar. Mereka saling melengkapi dengan indah saat menghargai irama masing-masing.",
      ac: "Jiwa bebas (1, 5, 7) dan hati kreatif (3, 6, 9): banyak percikan, ide, dan semangat bersama. Mereka luar biasa saat mewujudkan mimpi bersama-sama.",
      bc: "Pembangun (2, 4, 8) dan hati kreatif (3, 6, 9): struktur dan kasih sayang dalam satu tim. Yang satu menopang, yang lain menceriakan; bersama mereka bisa membangun rumah yang hangat.",
    },
    aviso: "Ini permainan numerologi untuk merenung dan bersenang-senang: tidak ada angka yang menentukan sebuah hubungan.",
    comoFunciona: {
      titulo: "Bagaimana kecocokan nama dihitung?",
      parrafos: [
        "Dalam numerologi Pythagoras setiap huruf bernilai angka 1 sampai 9 (A=1, B=2… I=9, J=1…). Kami menjumlahkan huruf setiap nama dan meringkasnya menjadi satu digit, dengan tetap mempertahankan angka master 11, 22, dan 33. Hasilnya angka nama; dari huruf vokal saja, angka jiwa.",
        "Angka terbagi dalam tiga keluarga: jiwa bebas (1, 5, 7), pembangun (2, 4, 8), dan hati kreatif (3, 6, 9). Dua angka dari keluarga yang sama mudah saling mengerti; dari keluarga berbeda, mereka saling melengkapi. Nama yang ditulis dalam huruf Arab atau Dewanagari ditransliterasi ke huruf Latin sebelum dihitung.",
      ],
    },
    cta: {
      titulo: "Ingin melangkah lebih jauh dari nama?",
      texto: "Pembacaan kecocokan lengkap menggabungkan tanggal lahir, zodiak, dan numerologi kalian berdua. Sibila menceritakan kemiripan kalian, cara kalian saling melengkapi, dan cara saling menjaga.",
      boton: "Lihat kecocokan lengkap kami",
    },
  },
  hi: {
    meta: {
      titulo: "मुफ़्त नाम मिलान: प्रेम का अंक ज्योतिष",
      descripcion: "दो नाम लिखें और पाइथागोरस अंक ज्योतिष के अनुसार उनकी अनुकूलता का प्रतिशत जानें: हर नाम का अंक, आत्मा का अंक और वे क्यों मेल खाते हैं।",
    },
    seccion: "मुफ़्त अंक ज्योतिष",
    titulo: "नाम से अनुकूलता",
    intro: "दो पहले नाम लिखें, Sibila उन्हें पाइथागोरस तालिका से अंकों में बदल देगी। वह आपको हर नाम का अंक, आत्मा का अंक और दोनों के तालमेल का स्तर दिखाएगी।",
    nombre1: "पहला नाम",
    nombre2: "दूसरा नाम",
    placeholder1: "जैसे, प्रिया",
    placeholder2: "जैसे, राहुल",
    calcular: "अनुकूलता देखें",
    otraVez: "दूसरे नाम आज़माएँ",
    errorVacio: "कृपया दोनों नाम लिखें।",
    pareja: "{a} और {b}",
    numeroNombre: "नाम का अंक",
    numeroAlma: "आत्मा का अंक",
    explicaNombre: "सभी अक्षरों का योग: व्यक्ति ख़ुद को कैसे व्यक्त करता है।",
    explicaAlma: "स्वरों का योग: दिल की चाह।",
    sinVocales: "लिखे हुए स्वर न होने पर आत्मा का अंक नाम के अंक जैसा माना जाता है।",
    transliterado: "रोमन में पढ़ा गया: {latino}",
    aproximado: "कुछ अक्षरों की गिनती अनुमान से की गई है।",
    porQue: "ये ऐसे क्यों मेल खाते हैं",
    arquetipos: { 1: "अग्रणी", 2: "राजनयिक", 3: "संवादक", 4: "निर्माता", 5: "साहसी", 6: "पालनकर्ता", 7: "खोजी", 8: "प्रबंधक", 9: "मानवतावादी", 11: "प्रकाशक", 22: "वास्तुकार", 33: "गुरु" },
    niveles: [
      { titulo: "उजला तालमेल", texto: "दोनों के अंक एक सुर में हैं: यह उन जोड़ियों में से है जो शुरू से ही सहज लगती हैं।" },
      { titulo: "गहरा जुड़ाव", texto: "बहुत सारी स्वाभाविक समानता और ऐसे अंतर जो रिश्ते को बढ़ाते हैं। बहुत अच्छी ऊर्जा वाली अंकों की जोड़ी।" },
      { titulo: "अच्छी केमिस्ट्री", texto: "दोनों में काफ़ी कुछ साझा है, और जो अलग है वह उन्हें समृद्ध कर सकता है। बातचीत से जुड़ाव बढ़ता है।" },
      { titulo: "एक-दूसरे के पूरक", texto: "दोनों के अंक अलग-अलग भाषा बोलते हैं, और यह एक तोहफ़ा हो सकता है: हर कोई दूसरे को ज़िंदगी देखने का नया नज़रिया दिखाता है।" },
      { titulo: "सिखाने वाली चुनौती", texto: "दोनों के अंक अलग लय में चलते हैं। यह कोई बुरा संकेत नहीं: एक-दूसरे को चुनौती देने वाली जोड़ियाँ अक्सर साथ में बहुत कुछ सीखती हैं।" },
    ],
    familias: { a: "आज़ाद रूहें (1, 5, 7)", b: "निर्माता (2, 4, 8)", c: "रचनात्मक दिल (3, 6, 9)" },
    misma: {
      a: "दोनों नाम आज़ाद रूहों के परिवार (1, 5, 7) से हैं: बिना सफ़ाई दिए एक-दूसरे को समझते हैं और बढ़ने की जगह देते हैं। चुनौती यह याद रखना है कि सिर्फ़ रोमांच नहीं, राह भी साझा करनी है।",
      b: "दोनों नाम निर्माताओं के परिवार (2, 4, 8) से हैं: वफ़ादारी, निरंतरता और साझा योजनाओं को अहमियत देते हैं। चुनौती यह है कि कभी-कभी सहजता को भी जगह दें।",
      c: "दोनों नाम रचनात्मक दिलों के परिवार (3, 6, 9) से हैं: इनमें कोमलता, हँसी और ख़ुद को व्यक्त करने की चाह है। चुनौती यह है कि रोज़मर्रा की व्यावहारिक बातों का भी ध्यान रखें।",
    },
    mezcla: {
      ab: "एक आज़ाद रूह (1, 5, 7) और एक निर्माता (2, 4, 8): एक नयापन लाता है, दूसरा जड़ें। जब दोनों एक-दूसरे की अलग लय का सम्मान करते हैं, तो बहुत अच्छे से पूरक बनते हैं।",
      ac: "एक आज़ाद रूह (1, 5, 7) और एक रचनात्मक दिल (3, 6, 9): ढेर सारी चमक, विचार और साझा उत्साह। जब दोनों मिलकर सपनों को ज़मीन पर उतारते हैं, तो कमाल करते हैं।",
      bc: "एक निर्माता (2, 4, 8) और एक रचनात्मक दिल (3, 6, 9): एक ही टीम में ढाँचा और स्नेह। एक सहारा देता है, दूसरा ख़ुशी; साथ मिलकर वे एक गर्मजोशी भरा घर बना सकते हैं।",
    },
    aviso: "यह आत्मचिंतन और मनोरंजन के लिए अंक ज्योतिष का एक खेल है: कोई भी अंक किसी रिश्ते का फ़ैसला नहीं करता।",
    comoFunciona: {
      titulo: "नाम से अनुकूलता कैसे निकाली जाती है?",
      parrafos: [
        "पाइथागोरस अंक ज्योतिष में हर रोमन अक्षर का मान 1 से 9 तक होता है (A=1, B=2… I=9, J=1…)। हम हर नाम के अक्षर जोड़ते हैं और 11, 22 और 33 जैसे मास्टर अंकों को बनाए रखते हुए योग को एक अंक तक घटाते हैं। इससे नाम का अंक मिलता है; सिर्फ़ स्वरों से आत्मा का अंक।",
        "अंक तीन परिवारों में बँटते हैं: आज़ाद रूहें (1, 5, 7), निर्माता (2, 4, 8) और रचनात्मक दिल (3, 6, 9)। एक ही परिवार के दो अंक आसानी से तालमेल बिठाते हैं; अलग परिवारों के अंक एक-दूसरे के पूरक होते हैं। देवनागरी या अरबी में लिखे नाम गिनती से पहले रोमन अक्षरों में बदले जाते हैं।",
      ],
    },
    cta: {
      titulo: "क्या आप नामों से आगे जाना चाहते हैं?",
      texto: "पूरी अनुकूलता रीडिंग में दोनों की जन्म तिथियाँ, राशियाँ और अंक ज्योतिष साथ देखे जाते हैं। Sibila बताती है कि आप दोनों में क्या समान है, कैसे एक-दूसरे के पूरक हैं और एक-दूसरे का ख़याल कैसे रखें।",
      boton: "हमारी पूरी अनुकूलता देखें",
    },
  },
};
