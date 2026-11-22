import type { Idioma } from "@/lib/i18n/idiomas";

export interface TextoDigito {
  /** Palabra clave de la cifra. */
  clave: string;
  /** Qué representa, en una frase. */
  texto: string;
  /** Una acción breve de reflexión asociada a la cifra. */
  accion: string;
}

export interface TextosNumeros {
  seccion: string;
  inicio: string;
  /** Nombre corto de la sección (migas de pan). */
  nombreSeccion: string;
  tituloIndice: string;
  metaTituloIndice: string;
  metaDescripcionIndice: string;
  intro: string;
  queSon: { titulo: string; parrafos: string[] };
  comoLeer: { titulo: string; pasos: { titulo: string; texto: string }[] };
  aviso: string;
  buscador: { titulo: string; etiqueta: string; placeholder: string; boton: string; error: string };
  gridTitulo: string;
  etiquetaNumero: string;
  /** {n} = el número. */
  tituloNumero: string;
  /** {n} = el número, {lema} = su lema. */
  metaTituloNumero: string;
  apartados: { significado: string; amor: string; trabajo: string; llamaGemela: string; queHacer: string; relacionados: string };
  cta: { titulo: string; texto: string; numerologia: string; tarot: string; nota: string };
  volver: string;
  generico: {
    etiqueta: string;
    /** {n} = el número. */
    titulo: string;
    metaTitulo: string;
    intro: string;
    cifrasTitulo: string;
    /** {d} = la cifra, {veces} = cuántas veces aparece. */
    repetida: string;
    raizTitulo: string;
    /** {raiz} = la cifra final. */
    raizTexto: string;
    queHacerTitulo: string;
    cercanos: string;
  };
  digitos: Record<"0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9", TextoDigito>;
}

export const TEXTOS_NUMEROS: Record<Idioma, TextosNumeros> = {
  es: {
    seccion: "Numerología y sincronías",
    inicio: "Inicio",
    nombreSeccion: "Números angelicales",
    tituloIndice: "Números angelicales: qué significa ver el mismo número una y otra vez",
    metaTituloIndice: "Números angelicales: significado del 111, 222, 333, 444, 1111 y más",
    metaDescripcionIndice: "Qué son los números angelicales y qué significa ver 111, 222, 444, 1111 o 1212: su sentido en el amor, el trabajo y la llama gemela, y qué hacer cuando aparecen.",
    intro: "Miras el reloj y son las 11:11. El recibo suma 444. La matrícula del coche de delante termina en 222. Cuando un número se repite tanto que ya no parece casualidad, muchas personas lo leen como un pequeño aviso para detenerse y mirar hacia dentro.",
    queSon: {
      titulo: "¿Qué son los números angelicales?",
      parrafos: [
        "Los «números angelicales» son secuencias repetidas o con patrón (111, 1212, 1234…) que una persona nota con frecuencia en su día a día. Es una tradición moderna, popularizada a principios de los años 2000, que mezcla la numerología pitagórica —el significado simbólico de cada cifra del 0 al 9— con la idea de sincronicidad que describió Carl Jung: coincidencias que se sienten llenas de sentido.",
        "En Arcana los leemos como una herramienta de reflexión, no como una profecía ni un mandato. El número no decide nada por ti: te invita a fijarte en qué estabas pensando, sintiendo o decidiendo en ese momento. Ningún número es de mala suerte, y ninguno trae castigos.",
      ],
    },
    comoLeer: {
      titulo: "Cómo leer un número que se repite",
      pasos: [
        { titulo: "Fíjate en el momento", texto: "¿Qué pensabas justo cuando lo viste? Ese pensamiento suele ser la mitad del mensaje." },
        { titulo: "Mira la cifra que se repite", texto: "Una cifra repetida intensifica su sentido: el 444 es el 4 dicho con más fuerza." },
        { titulo: "Suma sus cifras", texto: "Reducir el número a una sola cifra (1234 → 10 → 1) te da su tono de fondo." },
        { titulo: "Anótalo", texto: "Lleva una nota de cuándo aparece. Los patrones de tu vida dicen más que cualquier tabla." },
      ],
    },
    aviso: "Los números angelicales son una práctica simbólica y de autoconocimiento. No sustituyen el consejo médico, psicológico, legal ni financiero.",
    buscador: { titulo: "¿Qué número ves una y otra vez?", etiqueta: "Escribe el número que te persigue", placeholder: "Por ejemplo, 1111", boton: "Ver su significado", error: "Escribe solo cifras (hasta 8)." },
    gridTitulo: "Los números angelicales más frecuentes",
    etiquetaNumero: "Número angelical",
    tituloNumero: "Número {n}: significado",
    metaTituloNumero: "Número angelical {n}: {lema} · amor, trabajo y llama gemela",
    apartados: { significado: "Qué significa", amor: "En el amor", trabajo: "En el trabajo y el dinero", llamaGemela: "Llama gemela y relaciones", queHacer: "Qué hacer cuando lo ves", relacionados: "Números relacionados" },
    cta: {
      titulo: "¿Quieres saber qué te dicen a ti los números?",
      texto: "Un número que se repite es una pista; tu fecha de nacimiento y tu nombre cuentan la historia completa. Pídele a Sibila tu perfil de numerología o una tirada de tarot sobre lo que estás viviendo ahora.",
      numerologia: "Mi lectura de numerología",
      tarot: "Hacer una tirada de tarot",
      nota: "Sin tarjeta de crédito · Tu primera lectura es gratis",
    },
    volver: "Todos los números angelicales",
    generico: {
      etiqueta: "Lectura por cifras",
      titulo: "Número {n}: lo que dicen sus cifras",
      metaTitulo: "Número {n}: significado según sus cifras",
      intro: "Este número no tiene una página propia, pero cada cifra tiene su propio sentido en numerología. Leído cifra a cifra, y sumado hasta su raíz, también puede hablarte.",
      cifrasTitulo: "Sus cifras, una a una",
      repetida: "El {d} aparece {veces} veces: su mensaje llega con más fuerza.",
      raizTitulo: "Su raíz numérica",
      raizTexto: "Al sumar sus cifras llegas al {raiz}, el tono de fondo de todo el número.",
      queHacerTitulo: "Qué puedes hacer",
      cercanos: "Números con página propia que comparten sus cifras",
    },
    digitos: {
      "0": { clave: "Potencial", texto: "El origen y el todo: un espacio en blanco donde algo nuevo puede empezar.", accion: "Regálate cinco minutos de silencio sin pantalla y observa qué deseo aparece primero." },
      "1": { clave: "Comienzo", texto: "La iniciativa y el pensamiento que se convierte en realidad.", accion: "Escribe en una frase la intención que quieres sembrar esta semana." },
      "2": { clave: "Equilibrio", texto: "La pareja, la cooperación y la paciencia con los procesos.", accion: "Escucha de verdad a alguien cercano hoy, sin preparar tu respuesta." },
      "3": { clave: "Expresión", texto: "La creatividad, la alegría y la necesidad de decir lo que sientes.", accion: "Crea algo pequeño hoy: una nota, un dibujo, una canción tarareada." },
      "4": { clave: "Base", texto: "La estabilidad, el esfuerzo constante y la sensación de estar sostenido.", accion: "Elige una tarea pendiente y dale veinte minutos de atención completa." },
      "5": { clave: "Cambio", texto: "El movimiento, la libertad y la capacidad de adaptarte.", accion: "Cambia una rutina pequeña y fíjate en cómo te sientes." },
      "6": { clave: "Cuidado", texto: "El hogar, la responsabilidad y la armonía entre lo material y lo afectivo.", accion: "Haz algo amable por tu casa o por tu cuerpo, sin prisa." },
      "7": { clave: "Introspección", texto: "La sabiduría interior, el estudio y la búsqueda de sentido.", accion: "Hazte una pregunta honesta y escribe la respuesta sin corregirla." },
      "8": { clave: "Abundancia", texto: "El poder personal, el valor propio y los ciclos que devuelven lo sembrado.", accion: "Anota tres cosas que haces bien y que podrías valorar más." },
      "9": { clave: "Cierre", texto: "La compasión, el final de un ciclo y la generosidad de soltar.", accion: "Despídete conscientemente de algo que ya cumplió su función." },
    },
  },
  en: {
    seccion: "Numerology and synchronicity",
    inicio: "Home",
    nombreSeccion: "Angel numbers",
    tituloIndice: "Angel numbers: what it means to keep seeing the same number",
    metaTituloIndice: "Angel numbers: meaning of 111, 222, 333, 444, 1111 and more",
    metaDescripcionIndice: "What angel numbers are and what it means to see 111, 222, 444, 1111 or 1212: their meaning in love, work and twin flame connections, and what to do when they show up.",
    intro: "You glance at the clock and it's 11:11. The receipt totals 444. The car in front of you has a plate ending in 222. When a number repeats so often that it stops feeling random, many people read it as a small nudge to pause and look inward.",
    queSon: {
      titulo: "What are angel numbers?",
      parrafos: [
        "“Angel numbers” are repeating or patterned sequences (111, 1212, 1234…) that someone keeps noticing in daily life. It is a modern tradition, popularized in the early 2000s, that blends Pythagorean numerology —the symbolic meaning of each digit from 0 to 9— with the idea of synchronicity described by Carl Jung: coincidences that feel full of meaning.",
        "At Arcana we read them as a tool for reflection, not as prophecy or a command. The number decides nothing for you: it invites you to notice what you were thinking, feeling or deciding at that moment. No number is unlucky, and none of them brings punishment.",
      ],
    },
    comoLeer: {
      titulo: "How to read a repeating number",
      pasos: [
        { titulo: "Notice the moment", texto: "What were you thinking right when you saw it? That thought is often half the message." },
        { titulo: "Look at the repeated digit", texto: "A repeated digit intensifies its meaning: 444 is the 4 said more loudly." },
        { titulo: "Add up the digits", texto: "Reducing the number to a single digit (1234 → 10 → 1) gives you its underlying tone." },
        { titulo: "Write it down", texto: "Keep a note of when it appears. The patterns of your own life say more than any chart." },
      ],
    },
    aviso: "Angel numbers are a symbolic, self-reflective practice. They do not replace medical, psychological, legal or financial advice.",
    buscador: { titulo: "Which number do you keep seeing?", etiqueta: "Type the number that keeps following you", placeholder: "For example, 1111", boton: "See its meaning", error: "Please type digits only (up to 8)." },
    gridTitulo: "The most common angel numbers",
    etiquetaNumero: "Angel number",
    tituloNumero: "Angel number {n}: meaning",
    metaTituloNumero: "Angel number {n}: {lema} · love, work and twin flame",
    apartados: { significado: "What it means", amor: "In love", trabajo: "In work and money", llamaGemela: "Twin flame and relationships", queHacer: "What to do when you see it", relacionados: "Related numbers" },
    cta: {
      titulo: "Want to know what numbers say about you?",
      texto: "A repeating number is a clue; your birth date and your name tell the whole story. Ask Sibila for your numerology profile or a tarot spread about what you are living right now.",
      numerologia: "My numerology reading",
      tarot: "Do a tarot spread",
      nota: "No credit card · Your first reading is free",
    },
    volver: "All angel numbers",
    generico: {
      etiqueta: "Reading by digits",
      titulo: "Number {n}: what its digits say",
      metaTitulo: "Number {n}: meaning based on its digits",
      intro: "This number doesn't have its own page, but every digit carries its own meaning in numerology. Read digit by digit, and added up to its root, it can still speak to you.",
      cifrasTitulo: "Its digits, one by one",
      repetida: "The {d} appears {veces} times: its message arrives with more strength.",
      raizTitulo: "Its numerological root",
      raizTexto: "Adding up its digits brings you to {raiz}, the underlying tone of the whole number.",
      queHacerTitulo: "What you can do",
      cercanos: "Numbers with their own page that share its digits",
    },
    digitos: {
      "0": { clave: "Potential", texto: "The origin and the whole: a blank space where something new can begin.", accion: "Give yourself five screen-free minutes of silence and notice which wish shows up first." },
      "1": { clave: "Beginning", texto: "Initiative, and thought turning into reality.", accion: "Write down, in one sentence, the intention you want to plant this week." },
      "2": { clave: "Balance", texto: "Partnership, cooperation and patience with processes.", accion: "Truly listen to someone close to you today, without preparing your reply." },
      "3": { clave: "Expression", texto: "Creativity, joy and the need to say what you feel.", accion: "Make something small today: a note, a sketch, a hummed tune." },
      "4": { clave: "Foundation", texto: "Stability, steady effort and the feeling of being supported.", accion: "Pick one pending task and give it twenty minutes of full attention." },
      "5": { clave: "Change", texto: "Movement, freedom and the ability to adapt.", accion: "Change one small routine and notice how you feel." },
      "6": { clave: "Care", texto: "Home, responsibility and harmony between the material and the emotional.", accion: "Do something kind for your home or your body, unhurried." },
      "7": { clave: "Introspection", texto: "Inner wisdom, study and the search for meaning.", accion: "Ask yourself one honest question and write the answer without editing it." },
      "8": { clave: "Abundance", texto: "Personal power, self-worth and the cycles that return what was sown.", accion: "List three things you do well and could value more." },
      "9": { clave: "Closure", texto: "Compassion, the end of a cycle and the generosity of letting go.", accion: "Consciously say goodbye to something that has already served its purpose." },
    },
  },
  pt: {
    seccion: "Numerologia e sincronicidades",
    inicio: "Início",
    nombreSeccion: "Números angelicais",
    tituloIndice: "Números angelicais: o que significa ver o mesmo número várias vezes",
    metaTituloIndice: "Números angelicais: significado de 111, 222, 333, 444, 1111 e mais",
    metaDescripcionIndice: "O que são os números angelicais e o que significa ver 111, 222, 444, 1111 ou 1212: o sentido no amor, no trabalho e na chama gêmea, e o que fazer quando aparecem.",
    intro: "Você olha o relógio e são 11:11. A nota fiscal dá 444. A placa do carro da frente termina em 222. Quando um número se repete tanto que já não parece acaso, muita gente o lê como um pequeno aviso para parar e olhar para dentro.",
    queSon: {
      titulo: "O que são os números angelicais?",
      parrafos: [
        "Os “números angelicais” são sequências repetidas ou com padrão (111, 1212, 1234…) que uma pessoa percebe com frequência no dia a dia. É uma tradição moderna, popularizada no início dos anos 2000, que mistura a numerologia pitagórica —o significado simbólico de cada algarismo de 0 a 9— com a ideia de sincronicidade descrita por Carl Jung: coincidências que parecem cheias de sentido.",
        "Na Arcana, nós os lemos como uma ferramenta de reflexão, não como profecia nem ordem. O número não decide nada por você: ele convida a perceber o que você estava pensando, sentindo ou decidindo naquele momento. Nenhum número dá azar, e nenhum traz castigo.",
      ],
    },
    comoLeer: {
      titulo: "Como ler um número que se repete",
      pasos: [
        { titulo: "Repare no momento", texto: "O que você pensava bem na hora em que o viu? Esse pensamento costuma ser metade da mensagem." },
        { titulo: "Olhe o algarismo repetido", texto: "Um algarismo repetido intensifica o sentido: o 444 é o 4 dito com mais força." },
        { titulo: "Some os algarismos", texto: "Reduzir o número a um só algarismo (1234 → 10 → 1) mostra o tom de fundo." },
        { titulo: "Anote", texto: "Registre quando ele aparece. Os padrões da sua vida dizem mais do que qualquer tabela." },
      ],
    },
    aviso: "Os números angelicais são uma prática simbólica e de autoconhecimento. Não substituem orientação médica, psicológica, jurídica nem financeira.",
    buscador: { titulo: "Qual número você vê o tempo todo?", etiqueta: "Digite o número que está te seguindo", placeholder: "Por exemplo, 1111", boton: "Ver o significado", error: "Digite só algarismos (até 8)." },
    gridTitulo: "Os números angelicais mais frequentes",
    etiquetaNumero: "Número angelical",
    tituloNumero: "Número {n}: significado",
    metaTituloNumero: "Número angelical {n}: {lema} · amor, trabalho e chama gêmea",
    apartados: { significado: "O que significa", amor: "No amor", trabajo: "No trabalho e no dinheiro", llamaGemela: "Chama gêmea e relacionamentos", queHacer: "O que fazer quando você o vê", relacionados: "Números relacionados" },
    cta: {
      titulo: "Quer saber o que os números dizem sobre você?",
      texto: "Um número que se repete é uma pista; sua data de nascimento e seu nome contam a história inteira. Peça à Sibila seu perfil de numerologia ou uma tiragem de tarô sobre o que você está vivendo agora.",
      numerologia: "Minha leitura de numerologia",
      tarot: "Fazer uma tiragem de tarô",
      nota: "Sem cartão de crédito · Sua primeira leitura é grátis",
    },
    volver: "Todos os números angelicais",
    generico: {
      etiqueta: "Leitura pelos algarismos",
      titulo: "Número {n}: o que dizem seus algarismos",
      metaTitulo: "Número {n}: significado pelos algarismos",
      intro: "Este número não tem página própria, mas cada algarismo tem seu sentido na numerologia. Lido algarismo por algarismo, e somado até a raiz, ele também pode falar com você.",
      cifrasTitulo: "Seus algarismos, um a um",
      repetida: "O {d} aparece {veces} vezes: a mensagem chega com mais força.",
      raizTitulo: "Sua raiz numérica",
      raizTexto: "Somando os algarismos você chega ao {raiz}, o tom de fundo do número inteiro.",
      queHacerTitulo: "O que você pode fazer",
      cercanos: "Números com página própria que compartilham seus algarismos",
    },
    digitos: {
      "0": { clave: "Potencial", texto: "A origem e o todo: um espaço em branco onde algo novo pode começar.", accion: "Dê a si cinco minutos de silêncio sem tela e repare qual desejo aparece primeiro." },
      "1": { clave: "Começo", texto: "A iniciativa e o pensamento que vira realidade.", accion: "Escreva numa frase a intenção que você quer plantar nesta semana." },
      "2": { clave: "Equilíbrio", texto: "A parceria, a cooperação e a paciência com os processos.", accion: "Escute de verdade alguém próximo hoje, sem preparar sua resposta." },
      "3": { clave: "Expressão", texto: "A criatividade, a alegria e a necessidade de dizer o que sente.", accion: "Crie algo pequeno hoje: um bilhete, um desenho, uma música cantarolada." },
      "4": { clave: "Base", texto: "A estabilidade, o esforço constante e a sensação de estar amparado.", accion: "Escolha uma tarefa pendente e dê a ela vinte minutos de atenção total." },
      "5": { clave: "Mudança", texto: "O movimento, a liberdade e a capacidade de se adaptar.", accion: "Mude uma pequena rotina e repare em como você se sente." },
      "6": { clave: "Cuidado", texto: "O lar, a responsabilidade e a harmonia entre o material e o afetivo.", accion: "Faça algo gentil pela sua casa ou pelo seu corpo, sem pressa." },
      "7": { clave: "Introspecção", texto: "A sabedoria interior, o estudo e a busca de sentido.", accion: "Faça a si uma pergunta honesta e escreva a resposta sem corrigir." },
      "8": { clave: "Abundância", texto: "O poder pessoal, o valor próprio e os ciclos que devolvem o que foi plantado.", accion: "Anote três coisas que você faz bem e poderia valorizar mais." },
      "9": { clave: "Encerramento", texto: "A compaixão, o fim de um ciclo e a generosidade de soltar.", accion: "Despeça-se conscientemente de algo que já cumpriu seu papel." },
    },
  },
  fr: {
    seccion: "Numérologie et synchronicités",
    inicio: "Accueil",
    nombreSeccion: "Nombres angéliques",
    tituloIndice: "Nombres angéliques : que signifie voir sans cesse le même nombre",
    metaTituloIndice: "Nombres angéliques : signification de 111, 222, 333, 444, 1111 et plus",
    metaDescripcionIndice: "Ce que sont les nombres angéliques et ce que signifie voir 111, 222, 444, 1111 ou 1212 : leur sens en amour, au travail et pour la flamme jumelle, et quoi faire quand ils apparaissent.",
    intro: "Tu regardes l’heure et il est 11 h 11. Le ticket de caisse affiche 444. La plaque de la voiture devant toi finit par 222. Quand un nombre revient si souvent qu’il ne ressemble plus à un hasard, beaucoup y lisent un petit signe pour s’arrêter et regarder en soi.",
    queSon: {
      titulo: "Que sont les nombres angéliques ?",
      parrafos: [
        "Les « nombres angéliques » sont des séquences répétées ou structurées (111, 1212, 1234…) que l’on remarque souvent au quotidien. C’est une tradition moderne, popularisée au début des années 2000, qui mêle la numérologie pythagoricienne — le sens symbolique de chaque chiffre de 0 à 9 — et l’idée de synchronicité décrite par Carl Jung : des coïncidences qui semblent chargées de sens.",
        "Chez Arcana, nous les lisons comme un outil de réflexion, pas comme une prophétie ni un ordre. Le nombre ne décide rien à ta place : il t’invite à remarquer ce que tu pensais, ressentais ou décidais à ce moment-là. Aucun nombre ne porte malheur, et aucun n’apporte de punition.",
      ],
    },
    comoLeer: {
      titulo: "Comment lire un nombre qui se répète",
      pasos: [
        { titulo: "Observe le moment", texto: "À quoi pensais-tu au moment précis où tu l’as vu ? Cette pensée est souvent la moitié du message." },
        { titulo: "Regarde le chiffre répété", texto: "Un chiffre répété intensifie son sens : 444, c’est le 4 dit plus fort." },
        { titulo: "Additionne ses chiffres", texto: "Réduire le nombre à un seul chiffre (1234 → 10 → 1) te donne sa tonalité de fond." },
        { titulo: "Note-le", texto: "Garde une trace des moments où il apparaît. Les motifs de ta propre vie en disent plus que n’importe quel tableau." },
      ],
    },
    aviso: "Les nombres angéliques sont une pratique symbolique et d’introspection. Ils ne remplacent pas un avis médical, psychologique, juridique ou financier.",
    buscador: { titulo: "Quel nombre vois-tu sans arrêt ?", etiqueta: "Écris le nombre qui te suit partout", placeholder: "Par exemple, 1111", boton: "Voir sa signification", error: "Écris uniquement des chiffres (8 maximum)." },
    gridTitulo: "Les nombres angéliques les plus fréquents",
    etiquetaNumero: "Nombre angélique",
    tituloNumero: "Nombre angélique {n} : signification",
    metaTituloNumero: "Nombre angélique {n} : {lema} · amour, travail et flamme jumelle",
    apartados: { significado: "Ce qu’il signifie", amor: "En amour", trabajo: "Au travail et côté argent", llamaGemela: "Flamme jumelle et relations", queHacer: "Que faire quand tu le vois", relacionados: "Nombres liés" },
    cta: {
      titulo: "Tu veux savoir ce que les nombres disent de toi ?",
      texto: "Un nombre qui se répète est un indice ; ta date de naissance et ton prénom racontent toute l’histoire. Demande à Sibila ton profil numérologique ou un tirage de tarot sur ce que tu vis en ce moment.",
      numerologia: "Ma lecture numérologique",
      tarot: "Faire un tirage de tarot",
      nota: "Sans carte bancaire · Ta première lecture est offerte",
    },
    volver: "Tous les nombres angéliques",
    generico: {
      etiqueta: "Lecture par les chiffres",
      titulo: "Nombre {n} : ce que disent ses chiffres",
      metaTitulo: "Nombre {n} : signification selon ses chiffres",
      intro: "Ce nombre n’a pas de page à lui, mais chaque chiffre a son propre sens en numérologie. Lu chiffre par chiffre, puis additionné jusqu’à sa racine, il peut aussi te parler.",
      cifrasTitulo: "Ses chiffres, un par un",
      repetida: "Le {d} apparaît {veces} fois : son message arrive avec plus de force.",
      raizTitulo: "Sa racine numérologique",
      raizTexto: "En additionnant ses chiffres, tu arrives au {raiz}, la tonalité de fond de tout le nombre.",
      queHacerTitulo: "Ce que tu peux faire",
      cercanos: "Nombres ayant leur propre page qui partagent ses chiffres",
    },
    digitos: {
      "0": { clave: "Potentiel", texto: "L’origine et le tout : un espace blanc où quelque chose de neuf peut commencer.", accion: "Offre-toi cinq minutes de silence sans écran et observe quel désir surgit en premier." },
      "1": { clave: "Commencement", texto: "L’initiative et la pensée qui devient réalité.", accion: "Écris en une phrase l’intention que tu veux semer cette semaine." },
      "2": { clave: "Équilibre", texto: "Le couple, la coopération et la patience envers les processus.", accion: "Écoute vraiment une personne proche aujourd’hui, sans préparer ta réponse." },
      "3": { clave: "Expression", texto: "La créativité, la joie et le besoin de dire ce que tu ressens.", accion: "Crée quelque chose de petit aujourd’hui : un mot, un croquis, un air fredonné." },
      "4": { clave: "Fondation", texto: "La stabilité, l’effort régulier et le sentiment d’être soutenu.", accion: "Choisis une tâche en attente et accorde-lui vingt minutes d’attention entière." },
      "5": { clave: "Changement", texto: "Le mouvement, la liberté et la capacité à t’adapter.", accion: "Change une petite habitude et observe ce que tu ressens." },
      "6": { clave: "Soin", texto: "Le foyer, la responsabilité et l’harmonie entre le matériel et l’affectif.", accion: "Fais quelque chose de doux pour ta maison ou ton corps, sans te presser." },
      "7": { clave: "Introspection", texto: "La sagesse intérieure, l’étude et la quête de sens.", accion: "Pose-toi une question honnête et écris la réponse sans la corriger." },
      "8": { clave: "Abondance", texto: "Le pouvoir personnel, l’estime de soi et les cycles qui rendent ce qui a été semé.", accion: "Note trois choses que tu fais bien et que tu pourrais valoriser davantage." },
      "9": { clave: "Clôture", texto: "La compassion, la fin d’un cycle et la générosité de lâcher prise.", accion: "Dis consciemment au revoir à quelque chose qui a déjà rempli son rôle." },
    },
  },
  tr: {
    seccion: "Numeroloji ve eşzamanlılık",
    inicio: "Ana sayfa",
    nombreSeccion: "Melek sayıları",
    tituloIndice: "Melek sayıları: aynı sayıyı tekrar tekrar görmek ne anlama gelir",
    metaTituloIndice: "Melek sayıları: 111, 222, 333, 444, 1111 ve diğerlerinin anlamı",
    metaDescripcionIndice: "Melek sayıları nedir; 111, 222, 444, 1111 ya da 1212 görmek aşkta, işte ve ikiz alevde ne anlama gelir, karşına çıktıklarında ne yapabilirsin.",
    intro: "Saate bakıyorsun, 11:11. Fiş 444 tutuyor. Öndeki arabanın plakası 222 ile bitiyor. Bir sayı o kadar sık tekrarlanır ki artık tesadüf gibi gelmez; pek çok insan bunu durup içine bakmak için küçük bir işaret olarak okur.",
    queSon: {
      titulo: "Melek sayıları nedir?",
      parrafos: [
        "“Melek sayıları”, insanın günlük hayatında sık sık fark ettiği tekrar eden ya da belirli bir düzen taşıyan dizilerdir (111, 1212, 1234…). 2000’lerin başında yaygınlaşan modern bir gelenektir; Pisagor numerolojisini —0’dan 9’a her rakamın sembolik anlamını— Carl Jung’un tanımladığı eşzamanlılık fikriyle, yani anlam yüklü gibi hissettiren tesadüflerle birleştirir.",
        "Arcana’da onları bir kehanet ya da emir olarak değil, bir düşünme aracı olarak okuyoruz. Sayı senin yerine hiçbir şeye karar vermez: o an ne düşündüğünü, ne hissettiğini ya da neye karar verdiğini fark etmeye davet eder. Hiçbir sayı uğursuz değildir ve hiçbiri ceza getirmez.",
      ],
    },
    comoLeer: {
      titulo: "Tekrar eden bir sayı nasıl okunur",
      pasos: [
        { titulo: "Anı fark et", texto: "Onu gördüğün anda ne düşünüyordun? O düşünce çoğu zaman mesajın yarısıdır." },
        { titulo: "Tekrar eden rakama bak", texto: "Tekrar eden rakam anlamını güçlendirir: 444, 4’ün daha yüksek sesle söylenmiş hâlidir." },
        { titulo: "Rakamları topla", texto: "Sayıyı tek rakama indirmek (1234 → 10 → 1) sana onun alttaki tonunu verir." },
        { titulo: "Not al", texto: "Ne zaman karşına çıktığını yaz. Kendi hayatındaki örüntüler her tablodan daha çok şey söyler." },
      ],
    },
    aviso: "Melek sayıları sembolik bir kendini tanıma pratiğidir. Tıbbi, psikolojik, hukuki ya da finansal tavsiyenin yerini tutmaz.",
    buscador: { titulo: "Hangi sayıyı sürekli görüyorsun?", etiqueta: "Peşini bırakmayan sayıyı yaz", placeholder: "Örneğin 1111", boton: "Anlamını gör", error: "Sadece rakam yaz (en fazla 8)." },
    gridTitulo: "En sık görülen melek sayıları",
    etiquetaNumero: "Melek sayısı",
    tituloNumero: "{n} melek sayısı: anlamı",
    metaTituloNumero: "{n} melek sayısı: {lema} · aşk, iş ve ikiz alev",
    apartados: { significado: "Ne anlama gelir", amor: "Aşkta", trabajo: "İşte ve parada", llamaGemela: "İkiz alev ve ilişkiler", queHacer: "Gördüğünde ne yapmalısın", relacionados: "İlgili sayılar" },
    cta: {
      titulo: "Sayıların sana ne söylediğini merak ediyor musun?",
      texto: "Tekrar eden bir sayı bir ipucudur; doğum tarihin ve adın ise hikâyenin tamamını anlatır. Sibila’dan numeroloji profilini ya da şu an yaşadıklarınla ilgili bir tarot açılımı iste.",
      numerologia: "Numeroloji yorumum",
      tarot: "Tarot açılımı yap",
      nota: "Kredi kartı gerekmez · İlk yorumun ücretsiz",
    },
    volver: "Tüm melek sayıları",
    generico: {
      etiqueta: "Rakamlarla okuma",
      titulo: "{n} sayısı: rakamları ne söylüyor",
      metaTitulo: "{n} sayısı: rakamlarına göre anlamı",
      intro: "Bu sayının kendine ait bir sayfası yok, ama numerolojide her rakamın kendi anlamı var. Rakam rakam okunduğunda ve köküne kadar toplandığında o da sana bir şey söyleyebilir.",
      cifrasTitulo: "Rakamları, tek tek",
      repetida: "{d} rakamı {veces} kez geçiyor: mesajı daha güçlü geliyor.",
      raizTitulo: "Numerolojik kökü",
      raizTexto: "Rakamlarını topladığında {raiz} sayısına ulaşırsın; bu, sayının bütününün alttaki tonudur.",
      queHacerTitulo: "Ne yapabilirsin",
      cercanos: "Rakamlarını paylaşan, kendi sayfası olan sayılar",
    },
    digitos: {
      "0": { clave: "Potansiyel", texto: "Başlangıç ve bütünlük: yeni bir şeyin başlayabileceği boş bir alan.", accion: "Kendine ekransız beş dakikalık bir sessizlik hediye et ve ilk hangi dileğin belirdiğine bak." },
      "1": { clave: "Başlangıç", texto: "İnisiyatif ve gerçeğe dönüşen düşünce.", accion: "Bu hafta ekmek istediğin niyeti tek bir cümleyle yaz." },
      "2": { clave: "Denge", texto: "Ortaklık, iş birliği ve süreçlere karşı sabır.", accion: "Bugün yakınındaki birini, cevabını hazırlamadan, gerçekten dinle." },
      "3": { clave: "İfade", texto: "Yaratıcılık, neşe ve hissettiğini söyleme ihtiyacı.", accion: "Bugün küçük bir şey üret: bir not, bir çizim, mırıldanılan bir şarkı." },
      "4": { clave: "Temel", texto: "İstikrar, düzenli emek ve desteklendiğini hissetmek.", accion: "Bekleyen bir işi seç ve ona yirmi dakika tam dikkat ver." },
      "5": { clave: "Değişim", texto: "Hareket, özgürlük ve uyum sağlama yeteneği.", accion: "Küçük bir alışkanlığını değiştir ve nasıl hissettiğini fark et." },
      "6": { clave: "Özen", texto: "Yuva, sorumluluk ve maddi olanla duygusal olan arasındaki uyum.", accion: "Evin ya da bedenin için acele etmeden nazik bir şey yap." },
      "7": { clave: "İçe bakış", texto: "İç bilgelik, öğrenme ve anlam arayışı.", accion: "Kendine dürüst bir soru sor ve cevabı düzeltmeden yaz." },
      "8": { clave: "Bolluk", texto: "Kişisel güç, öz değer ve ekileni geri getiren döngüler.", accion: "İyi yaptığın ve daha çok değer verebileceğin üç şeyi yaz." },
      "9": { clave: "Kapanış", texto: "Şefkat, bir döngünün sonu ve bırakmanın cömertliği.", accion: "Görevini tamamlamış bir şeye bilinçli olarak veda et." },
    },
  },
  ar: {
    seccion: "علم الأعداد والتزامن",
    inicio: "الرئيسية",
    nombreSeccion: "أرقام الملائكة",
    tituloIndice: "أرقام الملائكة: ماذا يعني أن ترى الرقم نفسه مرة بعد مرة",
    metaTituloIndice: "أرقام الملائكة: معنى 111 و222 و333 و444 و1111 وغيرها",
    metaDescripcionIndice: "ما هي أرقام الملائكة، وماذا يعني أن ترى 111 أو 222 أو 444 أو 1111 أو 1212: معناها في الحب والعمل وعلاقة توأم الروح، وماذا تفعل حين تظهر لك.",
    intro: "تنظر إلى الساعة فتجدها 11:11. يصل مجموع الفاتورة إلى 444. تنتهي لوحة السيارة التي أمامك بالرقم 222. حين يتكرر رقم إلى حدّ لا يبدو معه مجرد صدفة، يقرؤه كثيرون كتنبيه صغير للتوقف والنظر إلى الداخل.",
    queSon: {
      titulo: "ما هي أرقام الملائكة؟",
      parrafos: [
        "«أرقام الملائكة» هي تسلسلات متكررة أو ذات نمط (111، 1212، 1234…) يلاحظها الشخص كثيرًا في حياته اليومية. وهي تقليد حديث انتشر في بداية الألفية الثالثة، يجمع بين علم الأعداد الفيثاغوري —أي المعنى الرمزي لكل رقم من 0 إلى 9— وفكرة التزامن التي وصفها كارل يونغ: مصادفات تبدو مليئة بالمعنى.",
        "في أركانا نقرؤها كأداة للتأمل، لا كنبوءة ولا كأمر. الرقم لا يقرر شيئًا نيابةً عنك: إنه يدعوك إلى ملاحظة ما كنت تفكر فيه أو تشعر به أو تقرره في تلك اللحظة. لا يوجد رقم نحس، ولا رقم يحمل عقابًا.",
      ],
    },
    comoLeer: {
      titulo: "كيف تقرأ رقمًا يتكرر",
      pasos: [
        { titulo: "انتبه إلى اللحظة", texto: "بماذا كنت تفكر في اللحظة التي رأيته فيها؟ هذه الفكرة غالبًا نصف الرسالة." },
        { titulo: "انظر إلى الرقم المتكرر", texto: "تكرار الرقم يقوّي معناه: 444 هو الرقم 4 بصوت أعلى." },
        { titulo: "اجمع أرقامه", texto: "اختزال العدد إلى رقم واحد (1234 ← 10 ← 1) يكشف نغمته العميقة." },
        { titulo: "دوّنه", texto: "سجّل متى يظهر لك. أنماط حياتك أنت تقول أكثر من أي جدول." },
      ],
    },
    aviso: "أرقام الملائكة ممارسة رمزية لمعرفة الذات. وهي لا تغني عن الاستشارة الطبية أو النفسية أو القانونية أو المالية.",
    buscador: { titulo: "ما الرقم الذي تراه مرارًا؟", etiqueta: "اكتب الرقم الذي يلاحقك", placeholder: "مثلًا 1111", boton: "اعرف معناه", error: "اكتب أرقامًا فقط (حتى 8)." },
    gridTitulo: "أكثر أرقام الملائكة شيوعًا",
    etiquetaNumero: "رقم ملائكي",
    tituloNumero: "الرقم {n}: المعنى",
    metaTituloNumero: "رقم الملائكة {n}: {lema} · الحب والعمل وتوأم الروح",
    apartados: { significado: "ماذا يعني", amor: "في الحب", trabajo: "في العمل والمال", llamaGemela: "توأم الروح والعلاقات", queHacer: "ماذا تفعل حين تراه", relacionados: "أرقام ذات صلة" },
    cta: {
      titulo: "هل تريد أن تعرف ماذا تقول الأرقام عنك؟",
      texto: "الرقم المتكرر مجرد إشارة؛ أما تاريخ ميلادك واسمك فيرويان القصة كاملة. اطلب من سيبيلا ملفك في علم الأعداد أو قراءة تاروت عمّا تعيشه الآن.",
      numerologia: "قراءتي في علم الأعداد",
      tarot: "قراءة تاروت",
      nota: "بلا بطاقة ائتمان · قراءتك الأولى مجانية",
    },
    volver: "كل أرقام الملائكة",
    generico: {
      etiqueta: "قراءة حسب الأرقام",
      titulo: "الرقم {n}: ماذا تقول أرقامه",
      metaTitulo: "الرقم {n}: معناه حسب أرقامه",
      intro: "ليس لهذا الرقم صفحة خاصة، لكن لكل رقم معناه في علم الأعداد. حين تقرؤه رقمًا رقمًا، ثم تجمعه حتى جذره، يمكنه أن يحدّثك أيضًا.",
      cifrasTitulo: "أرقامه، واحدًا واحدًا",
      repetida: "يتكرر الرقم {d} هنا (عدد مرات ظهوره: {veces})، فتصل رسالته بقوة أكبر.",
      raizTitulo: "جذره العددي",
      raizTexto: "عندما تجمع أرقامه تصل إلى {raiz}، وهو النغمة العميقة للعدد كله.",
      queHacerTitulo: "ماذا يمكنك أن تفعل",
      cercanos: "أرقام لها صفحة خاصة وتشترك معه في أرقامه",
    },
    digitos: {
      "0": { clave: "الإمكان", texto: "البداية والكلّ: مساحة بيضاء يمكن أن يبدأ فيها شيء جديد.", accion: "امنح نفسك خمس دقائق من الصمت بلا شاشة، ولاحظ أي رغبة تظهر أولًا." },
      "1": { clave: "البداية", texto: "المبادرة والفكرة التي تتحول إلى واقع.", accion: "اكتب في جملة واحدة النية التي تريد أن تزرعها هذا الأسبوع." },
      "2": { clave: "التوازن", texto: "الشراكة والتعاون والصبر على المسارات.", accion: "أصغِ اليوم حقًا إلى شخص قريب منك، دون أن تحضّر ردّك." },
      "3": { clave: "التعبير", texto: "الإبداع والفرح والحاجة إلى قول ما تشعر به.", accion: "اصنع شيئًا صغيرًا اليوم: ملاحظة، أو رسمة، أو لحنًا تدندنه." },
      "4": { clave: "الأساس", texto: "الاستقرار والجهد الثابت والإحساس بأنك مسنود.", accion: "اختر مهمة مؤجلة وامنحها عشرين دقيقة من انتباهك الكامل." },
      "5": { clave: "التغيير", texto: "الحركة والحرية والقدرة على التكيّف.", accion: "غيّر عادة صغيرة ولاحظ كيف تشعر." },
      "6": { clave: "الرعاية", texto: "البيت والمسؤولية والانسجام بين المادي والعاطفي.", accion: "افعل شيئًا لطيفًا لبيتك أو لجسدك، بلا عجلة." },
      "7": { clave: "التأمل", texto: "الحكمة الداخلية والتعلّم والبحث عن المعنى.", accion: "اطرح على نفسك سؤالًا صادقًا واكتب الجواب دون تصحيحه." },
      "8": { clave: "الوفرة", texto: "القوة الشخصية وتقدير الذات والدورات التي تعيد ما زُرع.", accion: "اكتب ثلاثة أشياء تجيدها ويمكنك أن تقدّرها أكثر." },
      "9": { clave: "الختام", texto: "الرحمة ونهاية دورة وكرم الإفلات.", accion: "ودّع بوعي شيئًا أدّى دوره بالفعل." },
    },
  },
  id: {
    seccion: "Numerologi dan sinkronisitas",
    inicio: "Beranda",
    nombreSeccion: "Angka malaikat",
    tituloIndice: "Angka malaikat: arti melihat angka yang sama berulang kali",
    metaTituloIndice: "Angka malaikat: arti 111, 222, 333, 444, 1111, dan lainnya",
    metaDescripcionIndice: "Apa itu angka malaikat dan apa artinya melihat 111, 222, 444, 1111, atau 1212: maknanya dalam cinta, pekerjaan, dan twin flame, serta apa yang bisa kamu lakukan saat angka itu muncul.",
    intro: "Kamu melihat jam dan ternyata pukul 11.11. Struk belanja totalnya 444. Pelat mobil di depanmu berakhir dengan 222. Saat sebuah angka muncul begitu sering sampai tidak terasa kebetulan lagi, banyak orang membacanya sebagai isyarat kecil untuk berhenti sejenak dan melihat ke dalam diri.",
    queSon: {
      titulo: "Apa itu angka malaikat?",
      parrafos: [
        "“Angka malaikat” adalah deretan angka berulang atau berpola (111, 1212, 1234…) yang sering kamu perhatikan dalam keseharian. Ini tradisi modern yang populer sejak awal tahun 2000-an, memadukan numerologi Pythagoras —makna simbolis setiap angka dari 0 sampai 9— dengan gagasan sinkronisitas dari Carl Jung: kebetulan yang terasa penuh makna.",
        "Di Arcana, kami membacanya sebagai alat refleksi, bukan ramalan atau perintah. Angka itu tidak memutuskan apa pun untukmu: ia mengajakmu memperhatikan apa yang sedang kamu pikirkan, rasakan, atau putuskan saat itu. Tidak ada angka sial, dan tidak ada angka yang membawa hukuman.",
      ],
    },
    comoLeer: {
      titulo: "Cara membaca angka yang berulang",
      pasos: [
        { titulo: "Perhatikan momennya", texto: "Apa yang sedang kamu pikirkan saat melihatnya? Pikiran itu sering kali separuh dari pesannya." },
        { titulo: "Lihat angka yang berulang", texto: "Angka yang berulang memperkuat maknanya: 444 adalah angka 4 yang diucapkan lebih lantang." },
        { titulo: "Jumlahkan angkanya", texto: "Menyederhanakan angka menjadi satu digit (1234 → 10 → 1) memberimu nada dasarnya." },
        { titulo: "Catat", texto: "Tulis kapan angka itu muncul. Pola dalam hidupmu sendiri berbicara lebih banyak daripada tabel mana pun." },
      ],
    },
    aviso: "Angka malaikat adalah praktik simbolis untuk mengenal diri. Ini tidak menggantikan nasihat medis, psikologis, hukum, atau keuangan.",
    buscador: { titulo: "Angka apa yang terus kamu lihat?", etiqueta: "Ketik angka yang terus mengikutimu", placeholder: "Misalnya 1111", boton: "Lihat artinya", error: "Ketik angka saja (maksimal 8 digit)." },
    gridTitulo: "Angka malaikat yang paling sering muncul",
    etiquetaNumero: "Angka malaikat",
    tituloNumero: "Angka malaikat {n}: artinya",
    metaTituloNumero: "Angka malaikat {n}: {lema} · cinta, pekerjaan, dan twin flame",
    apartados: { significado: "Apa artinya", amor: "Dalam cinta", trabajo: "Dalam pekerjaan dan keuangan", llamaGemela: "Twin flame dan hubungan", queHacer: "Apa yang bisa kamu lakukan saat melihatnya", relacionados: "Angka terkait" },
    cta: {
      titulo: "Ingin tahu apa kata angka tentang dirimu?",
      texto: "Angka yang berulang hanyalah petunjuk; tanggal lahir dan namamu menceritakan kisah lengkapnya. Minta Sibila membuat profil numerologimu atau bacaan tarot tentang apa yang sedang kamu jalani sekarang.",
      numerologia: "Bacaan numerologiku",
      tarot: "Buat bacaan tarot",
      nota: "Tanpa kartu kredit · Bacaan pertamamu gratis",
    },
    volver: "Semua angka malaikat",
    generico: {
      etiqueta: "Bacaan per digit",
      titulo: "Angka {n}: apa kata digit-digitnya",
      metaTitulo: "Angka {n}: arti berdasarkan digitnya",
      intro: "Angka ini belum punya halaman sendiri, tetapi setiap digit punya maknanya sendiri dalam numerologi. Dibaca satu per satu, lalu dijumlahkan sampai ke akarnya, angka ini tetap bisa berbicara kepadamu.",
      cifrasTitulo: "Digit-digitnya, satu per satu",
      repetida: "Angka {d} muncul {veces} kali: pesannya datang lebih kuat.",
      raizTitulo: "Akar numerologinya",
      raizTexto: "Jika digitnya dijumlahkan, kamu sampai pada {raiz}, nada dasar dari seluruh angka ini.",
      queHacerTitulo: "Apa yang bisa kamu lakukan",
      cercanos: "Angka dengan halaman sendiri yang memiliki digit yang sama",
    },
    digitos: {
      "0": { clave: "Potensi", texto: "Asal mula dan keutuhan: ruang kosong tempat sesuatu yang baru bisa dimulai.", accion: "Berikan dirimu lima menit hening tanpa layar dan perhatikan keinginan apa yang muncul pertama kali." },
      "1": { clave: "Awal", texto: "Inisiatif dan pikiran yang menjadi kenyataan.", accion: "Tulis dalam satu kalimat niat yang ingin kamu tanam minggu ini." },
      "2": { clave: "Keseimbangan", texto: "Kemitraan, kerja sama, dan kesabaran terhadap proses.", accion: "Dengarkan sungguh-sungguh seseorang yang dekat denganmu hari ini, tanpa menyiapkan jawaban." },
      "3": { clave: "Ekspresi", texto: "Kreativitas, kegembiraan, dan kebutuhan untuk mengungkapkan perasaan.", accion: "Buat sesuatu yang kecil hari ini: catatan, sketsa, atau senandung." },
      "4": { clave: "Fondasi", texto: "Stabilitas, usaha yang konsisten, dan rasa ditopang.", accion: "Pilih satu tugas yang tertunda dan berikan dua puluh menit perhatian penuh." },
      "5": { clave: "Perubahan", texto: "Gerak, kebebasan, dan kemampuan beradaptasi.", accion: "Ubah satu rutinitas kecil dan perhatikan bagaimana perasaanmu." },
      "6": { clave: "Kepedulian", texto: "Rumah, tanggung jawab, dan keselarasan antara materi dan perasaan.", accion: "Lakukan sesuatu yang lembut untuk rumah atau tubuhmu, tanpa terburu-buru." },
      "7": { clave: "Introspeksi", texto: "Kebijaksanaan batin, belajar, dan pencarian makna.", accion: "Ajukan satu pertanyaan jujur kepada dirimu dan tulis jawabannya tanpa mengoreksi." },
      "8": { clave: "Kelimpahan", texto: "Kekuatan pribadi, harga diri, dan siklus yang mengembalikan apa yang ditanam.", accion: "Tulis tiga hal yang kamu kuasai dan bisa lebih kamu hargai." },
      "9": { clave: "Penutupan", texto: "Welas asih, akhir sebuah siklus, dan kemurahan hati untuk melepaskan.", accion: "Ucapkan selamat tinggal dengan sadar pada sesuatu yang sudah menunaikan perannya." },
    },
  },
  hi: {
    seccion: "अंक ज्योतिष और संयोग",
    inicio: "होम",
    nombreSeccion: "एंजेल नंबर",
    tituloIndice: "एंजेल नंबर: एक ही नंबर बार-बार दिखने का क्या मतलब है",
    metaTituloIndice: "एंजेल नंबर: 111, 222, 333, 444, 1111 और अन्य का अर्थ",
    metaDescripcionIndice: "एंजेल नंबर क्या हैं और 111, 222, 444, 1111 या 1212 दिखने का क्या अर्थ है: प्रेम, काम और ट्विन फ्लेम में इनका संकेत, और ये दिखें तो आप क्या कर सकते हैं।",
    intro: "आप घड़ी देखते हैं और 11:11 बजे हैं। बिल का जोड़ 444 आता है। सामने वाली गाड़ी की नंबर प्लेट 222 पर खत्म होती है। जब कोई नंबर इतनी बार दोहराया जाए कि वह संयोग न लगे, तो बहुत से लोग उसे रुककर अपने भीतर झाँकने का एक छोटा-सा इशारा मानते हैं।",
    queSon: {
      titulo: "एंजेल नंबर क्या होते हैं?",
      parrafos: [
        "“एंजेल नंबर” ऐसे दोहराए जाने वाले या पैटर्न वाले अंक-क्रम हैं (111, 1212, 1234…) जो किसी व्यक्ति को रोज़मर्रा की ज़िंदगी में बार-बार दिखाई देते हैं। यह एक आधुनिक परंपरा है, जो 2000 के दशक की शुरुआत में लोकप्रिय हुई। इसमें पाइथागोरस के अंक ज्योतिष —0 से 9 तक हर अंक का प्रतीकात्मक अर्थ— को कार्ल युंग के “सिंक्रोनिसिटी” यानी अर्थपूर्ण संयोग के विचार से जोड़ा गया है।",
        "आर्काना में हम इन्हें भविष्यवाणी या आदेश की तरह नहीं, बल्कि आत्म-चिंतन के साधन की तरह पढ़ते हैं। नंबर आपके लिए कुछ तय नहीं करता: वह आपको यह देखने का न्योता देता है कि उस पल आप क्या सोच, महसूस या तय कर रहे थे। कोई भी नंबर अशुभ नहीं है, और कोई भी नंबर सज़ा नहीं लाता।",
      ],
    },
    comoLeer: {
      titulo: "दोहराए जाने वाले नंबर को कैसे पढ़ें",
      pasos: [
        { titulo: "उस पल पर ध्यान दें", texto: "जब यह नंबर दिखा, ठीक उस समय आपके मन में क्या चल रहा था? वही विचार अक्सर संदेश का आधा हिस्सा होता है।" },
        { titulo: "दोहराए गए अंक को देखें", texto: "दोहराया गया अंक अपने अर्थ को और गहरा करता है: 444 यानी 4 की आवाज़ और ऊँची।" },
        { titulo: "अंकों को जोड़ें", texto: "नंबर को एक अंक तक घटाने से (1234 → 10 → 1) उसका मूल स्वर पता चलता है।" },
        { titulo: "लिखकर रखें", texto: "नोट करें कि वह कब दिखता है। आपकी अपनी ज़िंदगी के पैटर्न किसी भी तालिका से ज़्यादा बताते हैं।" },
      ],
    },
    aviso: "एंजेल नंबर आत्म-ज्ञान की एक प्रतीकात्मक साधना हैं। ये चिकित्सकीय, मनोवैज्ञानिक, कानूनी या वित्तीय सलाह का विकल्प नहीं हैं।",
    buscador: { titulo: "आपको बार-बार कौन-सा नंबर दिखता है?", etiqueta: "वह नंबर लिखें जो आपका पीछा कर रहा है", placeholder: "जैसे 1111", boton: "अर्थ देखें", error: "केवल अंक लिखें (अधिकतम 8)।" },
    gridTitulo: "सबसे ज़्यादा दिखने वाले एंजेल नंबर",
    etiquetaNumero: "एंजेल नंबर",
    tituloNumero: "एंजेल नंबर {n}: अर्थ",
    metaTituloNumero: "एंजेल नंबर {n}: {lema} · प्रेम, काम और ट्विन फ्लेम",
    apartados: { significado: "इसका अर्थ", amor: "प्रेम में", trabajo: "काम और पैसे में", llamaGemela: "ट्विन फ्लेम और रिश्ते", queHacer: "इसे देखें तो क्या करें", relacionados: "संबंधित नंबर" },
    cta: {
      titulo: "क्या आप जानना चाहते हैं कि अंक आपके बारे में क्या कहते हैं?",
      texto: "दोहराया जाने वाला नंबर एक संकेत भर है; आपकी जन्मतिथि और आपका नाम पूरी कहानी बताते हैं। सिबिला से अपनी अंक ज्योतिष प्रोफ़ाइल या अभी आप जो जी रहे हैं उस पर टैरो रीडिंग माँगें।",
      numerologia: "मेरी अंक ज्योतिष रीडिंग",
      tarot: "टैरो रीडिंग करें",
      nota: "क्रेडिट कार्ड की ज़रूरत नहीं · आपकी पहली रीडिंग मुफ़्त है",
    },
    volver: "सभी एंजेल नंबर",
    generico: {
      etiqueta: "अंकों के आधार पर पढ़ाई",
      titulo: "नंबर {n}: इसके अंक क्या कहते हैं",
      metaTitulo: "नंबर {n}: अंकों के अनुसार अर्थ",
      intro: "इस नंबर का अपना अलग पेज नहीं है, लेकिन अंक ज्योतिष में हर अंक का अपना अर्थ होता है। एक-एक अंक पढ़कर, और उन्हें जोड़कर मूल अंक तक पहुँचकर, यह नंबर भी आपसे बात कर सकता है।",
      cifrasTitulo: "इसके अंक, एक-एक करके",
      repetida: "{d} अंक {veces} बार आता है: इसका संदेश और ज़ोर से पहुँचता है।",
      raizTitulo: "इसका मूल अंक",
      raizTexto: "इसके अंकों को जोड़ने पर आप {raiz} पर पहुँचते हैं, जो पूरे नंबर का मूल स्वर है।",
      queHacerTitulo: "आप क्या कर सकते हैं",
      cercanos: "अपने पेज वाले नंबर जिनमें यही अंक हैं",
    },
    digitos: {
      "0": { clave: "संभावना", texto: "आरंभ और संपूर्णता: एक खाली जगह जहाँ कुछ नया शुरू हो सकता है।", accion: "खुद को बिना स्क्रीन के पाँच मिनट की चुप्पी दें और देखें कि सबसे पहले कौन-सी इच्छा उभरती है।" },
      "1": { clave: "शुरुआत", texto: "पहल, और वह विचार जो हक़ीक़त बन जाता है।", accion: "एक वाक्य में वह इरादा लिखें जिसे आप इस हफ़्ते बोना चाहते हैं।" },
      "2": { clave: "संतुलन", texto: "साझेदारी, सहयोग और प्रक्रियाओं के प्रति धैर्य।", accion: "आज किसी करीबी को सचमुच सुनें, बिना अपना जवाब तैयार किए।" },
      "3": { clave: "अभिव्यक्ति", texto: "रचनात्मकता, खुशी और जो महसूस करते हैं उसे कहने की ज़रूरत।", accion: "आज कुछ छोटा रचें: एक नोट, एक स्केच, गुनगुनाई हुई धुन।" },
      "4": { clave: "नींव", texto: "स्थिरता, लगातार मेहनत और सहारा मिलने का एहसास।", accion: "कोई अटका हुआ काम चुनें और उसे बीस मिनट पूरा ध्यान दें।" },
      "5": { clave: "बदलाव", texto: "गति, आज़ादी और ढल जाने की क्षमता।", accion: "कोई छोटी आदत बदलें और देखें कि आप कैसा महसूस करते हैं।" },
      "6": { clave: "देखभाल", texto: "घर, ज़िम्मेदारी और भौतिक व भावनात्मक जीवन के बीच सामंजस्य।", accion: "अपने घर या अपने शरीर के लिए बिना जल्दबाज़ी के कुछ प्यारा करें।" },
      "7": { clave: "आत्मचिंतन", texto: "भीतरी ज्ञान, अध्ययन और अर्थ की खोज।", accion: "खुद से एक ईमानदार सवाल पूछें और जवाब बिना सुधारे लिखें।" },
      "8": { clave: "समृद्धि", texto: "निजी शक्ति, आत्म-सम्मान और वे चक्र जो बोया हुआ लौटाते हैं।", accion: "तीन ऐसी चीज़ें लिखें जो आप अच्छी तरह करते हैं और जिनकी आप और कद्र कर सकते हैं।" },
      "9": { clave: "समापन", texto: "करुणा, एक चक्र का अंत और छोड़ देने की उदारता।", accion: "किसी ऐसी चीज़ को सचेत होकर विदा करें जिसने अपना काम पूरा कर लिया है।" },
    },
  },
};
