import "server-only";
import { randomInt } from "node:crypto";
import { MOVIMIENTOS, PESO_MOVIMIENTO, SENTIDO_MOVIMIENTO, TRADICION_PENDULO, type Movimiento } from "@/lib/oraculos/pendulo";
import { RUNAS, TRADICION_RUNAS } from "@/lib/oraculos/runas";
import { LENORMAND, TRADICION_LENORMAND } from "@/lib/oraculos/lenormand";
import { BARAJA, TRADICION_BARAJA, nombreCartaEspanola } from "@/lib/oraculos/baraja";
import { hexagramaPorNumero, resolverHexagramas, resumenIChing, valorDeMonedas } from "@/lib/iching";
import { FICHA, NOMBRE_ELEMENTO, anioChinoDe, pilarDeAnio } from "@/lib/chino";
import { fechasEn, sinFechas } from "@/lib/en-vivo-pedidos";

/**
 * Los oráculos del directo que no son tarot ni astrología: péndulo, I Ching,
 * runas, Lenormand, baraja española y año chino. Cada uno saca su resultado
 * al azar (o lo calcula de la fecha), arma el contexto para Sibila y dice qué
 * se ve en pantalla. src/lib/en-vivo.ts los usa desde `preparar`.
 */
export type OraculoVivo = "pendulo" | "iching" | "runas" | "lenormand" | "baraja" | "chino";
export const ORACULOS_VIVO: OraculoVivo[] = ["pendulo", "iching", "runas", "lenormand", "baraja", "chino"];

/** Cómo se pide cada uno en el chat (español, inglés, portugués, francés, alemán). */
const PIDE: Record<OraculoVivo, RegExp> = {
  pendulo: /p[eéê]ndul|pendulum/,
  iching: /\bi[\s-]?ching\b|\byi[\s-]?jing\b|libro de los cambios|book of changes|livro das muta/,
  runas: /\brun(a|as|e|es|en)\b/,
  lenormand: /lenormand/,
  baraja: /baraja|cartas espa[nñ]olas|spanish (deck|cards)|naipes/,
  chino: /(hor[oó]scopo|zod[ií]aco|signo|a[nñ]o|animal|hor[oó]scope|zodiac|year|ano)\s+(chin[oêe]s?|chinese)|chinese\s+(zodiac|horoscope|sign|year)|(chin[oa]|chinese)\s+(zod|hor)/,
};

/** El oráculo que pide el mensaje (en minúsculas), si pide alguno. */
export function oraculoPedido(t: string): OraculoVivo | null {
  return ORACULOS_VIVO.find((o) => PIDE[o].test(t)) ?? null;
}

/** Pieza en pantalla: carta o piedra con su imagen. */
export interface PiezaVivo {
  id: string;
  nombre: string;
  posicion: string;
  imagen: string;
}

export interface OraculoPreparado {
  /** Lo que sale, para la entrada de Sibila. */
  contexto: string;
  /** Instrucción de la práctica. */
  instruccion: string;
  piezas: PiezaVivo[] | null;
  /** Péndulo: la respuesta que se ve en grande. */
  respuesta: string | null;
  /** I Ching: líneas del hexagrama, de abajo hacia arriba (1 = yang). */
  lineas: number[] | null;
  numero: number | null;
  etiqueta: string | null;
  simbolo: string | null;
  imagen: string | null;
}

const vacio = { piezas: null, respuesta: null, lineas: null, numero: null, etiqueta: null, simbolo: null, imagen: null };

function tres<T>(lista: readonly T[]): T[] {
  const elegidas = new Set<number>();
  while (elegidas.size < 3) elegidas.add(randomInt(lista.length));
  return [...elegidas].map((i) => lista[i]);
}

function movimiento(): Movimiento {
  const total = MOVIMIENTOS.reduce((s, m) => s + PESO_MOVIMIENTO[m], 0);
  let r = randomInt(total);
  for (const m of MOVIMIENTOS) {
    r -= PESO_MOVIMIENTO[m];
    if (r < 0) return m;
  }
  return "vaiven";
}

const RESPUESTA_PENDULO: Record<Movimiento, string> = { si: "SÍ", no: "NO", vaiven: "AÚN NO SE DEFINE", quieto: "NO ES EL MOMENTO" };

/** Año para el horóscopo chino: el de la fecha de nacimiento, o un año suelto («1990»), o el actual. */
function anioChino(texto: string, hoy = new Date()) {
  const [fecha] = fechasEn(texto);
  if (fecha) {
    const [a, m, d] = fecha.split("-").map(Number);
    return { anio: anioChinoDe(a, m, d), dePersona: true };
  }
  const suelto = /\b(19[2-9]\d|20[0-4]\d)\b/.exec(sinFechas(texto));
  if (suelto) return { anio: Number(suelto[1]), dePersona: Number(suelto[1]) < hoy.getUTCFullYear() };
  return { anio: anioChinoDe(hoy.getUTCFullYear(), hoy.getUTCMonth() + 1, hoy.getUTCDate()), dePersona: false };
}

export function prepararOraculo(o: OraculoVivo, texto: string): OraculoPreparado {
  switch (o) {
    case "pendulo": {
      const m = movimiento();
      return {
        ...vacio,
        contexto: `Pregunta de sí o no para el péndulo. El péndulo ${SENTIDO_MOVIMIENTO[m]}.`,
        instruccion: `Lectura de péndulo. ${TRADICION_PENDULO} En pantalla se ve el péndulo balanceándose y la respuesta en grande.`,
        respuesta: RESPUESTA_PENDULO[m],
      };
    }
    case "iching": {
      const valores = Array.from({ length: 6 }, () => valorDeMonedas([randomInt(2) === 1, randomInt(2) === 1, randomInt(2) === 1]));
      const r = resolverHexagramas(valores);
      const h = hexagramaPorNumero(r.presente)!;
      return {
        ...vacio,
        contexto: resumenIChing(r, sinFechas(texto).slice(0, 200)),
        instruccion:
          "Lectura de I Ching, el libro de los cambios: se lanzaron tres monedas seis veces y salió este hexagrama. Nombra el hexagrama (número y nombre), su imagen y lo que aconseja para la pregunta; si hay líneas mutantes, di en una frase hacia dónde cambia la situación. En pantalla se ven las seis líneas.",
        lineas: [...h.lineas],
        numero: h.numero,
        etiqueta: `${h.chino} · ${h.nombre}`,
      };
    }
    case "runas": {
      const posiciones = ["Lo que fue", "Lo que es", "Lo que será"];
      const runas = tres(RUNAS);
      return {
        ...vacio,
        contexto: `Runas sacadas de la bolsa (las tres Nornas): ${runas.map((r, i) => `${posiciones[i]}: ${r.nombre} (${r.glifo}, ${r.significado.es}: ${r.sentido})`).join("; ")}.`,
        instruccion: `Lectura de runas. ${TRADICION_RUNAS} En pantalla se ven las tres piedras.`,
        piezas: runas.map((r, i) => ({ id: r.id, nombre: r.nombre, posicion: posiciones[i], imagen: `/runas/${r.id}.webp` })),
      };
    }
    case "lenormand": {
      const posiciones = ["Lo que te rodea", "Lo que se mueve", "Lo que viene"];
      const cartas = tres(LENORMAND);
      return {
        ...vacio,
        contexto: `Cartas Lenormand, leídas como una frase: ${cartas.map((c, i) => `${posiciones[i]}: ${c.numero}. ${c.nombre.es} (${c.sentido})`).join("; ")}.`,
        instruccion: `Lectura de Lenormand. ${TRADICION_LENORMAND} En pantalla se ven las tres cartas.`,
        piezas: cartas.map((c, i) => ({ id: c.id, nombre: c.nombre.es, posicion: posiciones[i], imagen: `/cartas/lenormand/${c.id}.webp` })),
      };
    }
    case "baraja": {
      const posiciones = ["Lo que pasó", "Lo que pasa", "Lo que viene"];
      const cartas = tres(BARAJA);
      return {
        ...vacio,
        contexto: `Baraja española: ${cartas.map((c, i) => `${posiciones[i]}: ${nombreCartaEspanola(c)}`).join("; ")}.`,
        instruccion: `Lectura de baraja española. ${TRADICION_BARAJA} En pantalla se ven las tres cartas.`,
        piezas: cartas.map((c, i) => ({ id: c.id, nombre: nombreCartaEspanola(c), posicion: posiciones[i], imagen: `/cartas/espanola/${c.id}.webp` })),
      };
    }
    case "chino": {
      const { anio, dePersona } = anioChino(texto);
      const pilar = pilarDeAnio(anio);
      const ficha = FICHA[pilar.animal];
      const nombre = `${ficha.nombre} de ${NOMBRE_ELEMENTO[pilar.elemento]}`;
      return {
        ...vacio,
        contexto: `Horóscopo chino: ${dePersona ? "la persona es" : "el año"} ${nombre} (${anio}, ${pilar.polaridad}); rasgos de ese animal: ${ficha.rasgos.join(", ")}.`,
        instruccion: dePersona
          ? "Lectura del horóscopo chino: explica su animal y su elemento, cómo es y qué le trae este año del Caballo de Fuego (2026)."
          : "Lectura del horóscopo chino: explica el animal y el elemento de ese año y qué energía trae para todos.",
        imagen: `/animales/${pilar.animal}.webp`,
        etiqueta: nombre,
        simbolo: ficha.caracter,
      };
    }
  }
}
