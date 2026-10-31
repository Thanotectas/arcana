/**
 * Compatibilidad entre signos para las páginas públicas /compatibilidad-signos (SEO).
 * El porcentaje es el mismo de la app (compatibilidadSignos); el texto se arma con
 * el elemento, la modalidad y la distancia entre los dos signos.
 */
import { SIGNOS, compatibilidadSignos, signoPorId, type Elemento, type Signo } from "@/lib/zodiaco";

/** Slug canónico de una pareja, en orden zodiacal: "aries-y-leo". */
export function slugPareja(a: Signo, b: Signo) {
  const [x, y] = SIGNOS.indexOf(a) <= SIGNOS.indexOf(b) ? [a, b] : [b, a];
  return `${x.id}-y-${y.id}`;
}

/** Todas las parejas posibles (78, incluidas las de un signo consigo mismo). */
export function todasLasParejas(): [Signo, Signo][] {
  const out: [Signo, Signo][] = [];
  for (let i = 0; i < SIGNOS.length; i++) for (let j = i; j < SIGNOS.length; j++) out.push([SIGNOS[i], SIGNOS[j]]);
  return out;
}

/** Lee "aries-y-leo" (en cualquier orden). */
export function leerPareja(slug: string): { a: Signo; b: Signo; canonico: string } | null {
  const m = /^([a-z]+)-y-([a-z]+)$/.exec(slug);
  if (!m) return null;
  const a = signoPorId(m[1]);
  const b = signoPorId(m[2]);
  if (!a || !b) return null;
  const [x, y] = SIGNOS.indexOf(a) <= SIGNOS.indexOf(b) ? [a, b] : [b, a];
  return { a: x, b: y, canonico: slugPareja(a, b) };
}

const NOMBRE_ELEMENTO: Record<Elemento, string> = { fuego: "fuego", tierra: "tierra", aire: "aire", agua: "agua" };

type Par = `${Elemento}-${Elemento}`;
const clave = (x: Elemento, y: Elemento): Par => ([x, y].sort().join("-") as Par);

const QUIMICA: Record<string, { general: string; amor: string; reto: string }> = {
  [clave("fuego", "fuego")]: {
    general: "Dos fuegos juntos son pura energía: se entienden sin explicaciones, se motivan y se divierten. La relación es intensa, competitiva y llena de planes.",
    amor: "La pasión está garantizada desde el primer día. Se admiran, se retan y nunca se aburren.",
    reto: "Los dos quieren tener la razón y llevar el mando: las peleas son explosivas. Necesitan turnarse el protagonismo.",
  },
  [clave("tierra", "tierra")]: {
    general: "Dos signos de tierra construyen algo sólido: valoran la estabilidad, el esfuerzo y la lealtad. Es una de las uniones más duraderas del zodiaco.",
    amor: "Amor tranquilo, fiel y de hechos. Comparten metas concretas: una casa, ahorros, una familia.",
    reto: "La rutina puede volverse aburrida y ninguno quiere ceder. Les hace bien darse sorpresas y salir de lo conocido.",
  },
  [clave("aire", "aire")]: {
    general: "Dos signos de aire se conectan por la mente: hablan durante horas, comparten ideas, amigos y planes. Hay mucha libertad y muy poco drama.",
    amor: "Primero son amigos y después amantes. La conversación es el centro de la relación.",
    reto: "A veces les falta profundidad emocional y compromiso. Hablar de lo que sienten (no solo de lo que piensan) los une de verdad.",
  },
  [clave("agua", "agua")]: {
    general: "Dos signos de agua se sienten antes de hablarse: hay intuición, ternura y una conexión emocional muy profunda.",
    amor: "Amor romántico, protector y casi telepático. Se cuidan y se entienden en silencio.",
    reto: "Cuando los dos están tristes o heridos, se hunden juntos. Necesitan aire: amigos, planes y conversaciones claras.",
  },
  [clave("fuego", "aire")]: {
    general: "El aire aviva el fuego: es una de las combinaciones más dinámicas del zodiaco. Se inspiran, se ríen juntos y siempre tienen un plan nuevo.",
    amor: "Química inmediata, coqueteo, aventuras y mucha diversión. Se dan libertad sin pedirla.",
    reto: "Les cuesta aterrizar: los planes se quedan en ideas y las emociones profundas se evitan.",
  },
  [clave("tierra", "agua")]: {
    general: "El agua nutre la tierra y la tierra le da forma al agua: es una unión fértil, protectora y estable. Se complementan de manera natural.",
    amor: "Amor tierno, seguro y duradero. Uno da contención, el otro da sensibilidad.",
    reto: "Pueden encerrarse en su mundo y volverse dependientes. Les hace bien tener cada uno su propio espacio.",
  },
  [clave("fuego", "tierra")]: {
    general: "El fuego quiere ir rápido y la tierra quiere ir seguro. Es una combinación de ritmos distintos que puede funcionar muy bien si cada uno respeta el del otro.",
    amor: "Hay atracción por lo diferente: el fuego despierta a la tierra y la tierra calma al fuego.",
    reto: "La impaciencia de uno choca con la cautela del otro. Acordar los tiempos evita la mayoría de las peleas.",
  },
  [clave("fuego", "agua")]: {
    general: "Fuego y agua: vapor. La atracción es fuerte e intensa, pero sus maneras de sentir son muy distintas: uno actúa, el otro siente.",
    amor: "Pasión y emoción a flor de piel. Cuando se entienden, es una relación inolvidable.",
    reto: "El fuego puede herir sin darse cuenta y el agua puede apagar el entusiasmo del otro. Necesitan mucha paciencia y palabras cuidadosas.",
  },
  [clave("aire", "tierra")]: {
    general: "El aire vive en las ideas y la tierra en los hechos. Son mundos diferentes que se pueden enseñar mucho, si se escuchan.",
    amor: "El aire le trae novedad a la tierra y la tierra le da estabilidad al aire.",
    reto: "Uno siente que el otro es demasiado práctico; el otro, que es demasiado disperso. Funciona cuando las ideas se convierten en planes concretos.",
  },
  [clave("aire", "agua")]: {
    general: "El aire piensa y el agua siente. Se atraen por lo que al otro le sobra: la claridad mental y la profundidad emocional.",
    amor: "Romántico y creativo cuando se encuentran a mitad de camino.",
    reto: "El agua puede sentir que el aire es frío; el aire, que el agua es dramática. Validar las emociones del otro es la clave.",
  },
};

const MODALIDAD = {
  igual:
    "Además comparten la misma modalidad, así que reaccionan igual ante los problemas: eso los une, pero también hace que choquen cuando ninguno quiere ceder.",
  distinta: "Sus modalidades son distintas, y eso ayuda: uno inicia, otro sostiene o adapta, y se reparten los papeles con naturalidad.",
};

const MASCULINOS = new Set(["orgullo", "exceso", "perfeccionismo"]);
const conArticulo = (rasgo: string) => `${MASCULINOS.has(rasgo) ? "el" : "la"} ${rasgo}`;

export interface ResultadoPareja {
  a: Signo;
  b: Signo;
  porcentaje: number;
  titular: string;
  general: string;
  amor: string;
  reto: string;
  extra: string | null;
  consejo: string;
}

function titular(p: number) {
  if (p >= 90) return "Una conexión de las más fuertes del zodiaco";
  if (p >= 80) return "Muy buena química";
  if (p >= 65) return "Buena compatibilidad, con trabajo";
  if (p >= 50) return "Una relación de aprendizaje";
  return "Atracción intensa y retos grandes";
}

export function compatibilidadPareja(a: Signo, b: Signo): ResultadoPareja {
  const porcentaje = compatibilidadSignos(a, b);
  const q = QUIMICA[clave(a.elemento, b.elemento)];
  const distancia = Math.abs(SIGNOS.indexOf(a) - SIGNOS.indexOf(b));
  let extra: string | null = null;
  if (a.id === b.id) {
    extra = `Dos ${a.nombre} juntos son un espejo: se entienden perfectamente, pero también ven en el otro sus propios defectos (${a.rasgos[2]}). Lo que más los une es compartir ${a.rasgos[0]} y ${a.rasgos[1]}.`;
  } else if (distancia === 6) {
    extra = `${a.nombre} y ${b.nombre} son signos opuestos en la rueda del zodiaco: se atraen como imanes porque cada uno tiene lo que al otro le falta. Esta tensión es magnética y les enseña muchísimo.`;
  } else if (a.regente === b.regente) {
    extra = `Los dos están regidos por ${a.regente}, así que comparten una manera parecida de ver la vida, aunque la expresen distinto.`;
  }
  const modalidad = a.id === b.id ? "" : ` ${a.modalidad === b.modalidad ? MODALIDAD.igual : MODALIDAD.distinta}`;
  return {
    a,
    b,
    porcentaje,
    titular: titular(porcentaje),
    general: `${a.nombre} (${NOMBRE_ELEMENTO[a.elemento]}) y ${b.nombre} (${NOMBRE_ELEMENTO[b.elemento]}). ${q.general}${modalidad}`,
    amor: `${q.amor} ${a.nombre} aporta ${a.rasgos[0]} y ${a.rasgos[1]}; ${b.nombre}, ${b.rasgos[0]} y ${b.rasgos[1]}.`,
    reto: a.id === b.id ? `${q.reto} Ojo con ${conArticulo(a.rasgos[2])}, que en dos ${a.nombre} se duplica.` : `${q.reto} Cuidado con dos defectos: ${conArticulo(a.rasgos[2])} de ${a.nombre} y ${conArticulo(b.rasgos[2])} de ${b.nombre}.`,
    extra,
    consejo:
      porcentaje >= 80
        ? "La base es muy buena: cuídenla con detalles y no den la conexión por sentada."
        : porcentaje >= 60
          ? "Funciona cuando hablan claro de lo que necesita cada uno, antes de que se acumule."
          : "No es imposible: muchas parejas de signos 'difíciles' son las más duraderas, porque aprenden a entenderse de verdad.",
  };
}

/** Las mejores y peores parejas de un signo, para su página. */
export function rankingDe(s: Signo) {
  const lista = SIGNOS.filter((o) => o.id !== s.id)
    .map((o) => ({ signo: o, porcentaje: compatibilidadSignos(s, o) }))
    .sort((x, y) => y.porcentaje - x.porcentaje);
  return { mejores: lista.slice(0, 3), retos: lista.slice(-2).reverse() };
}
