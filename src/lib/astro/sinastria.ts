/**
 * Sinastría: compatibilidad entre dos cartas astrales completas. Compara los
 * planetas de una persona con los de la otra (aspectos cruzados), reparte
 * esa afinidad en cuatro dimensiones y mira en qué casas de cada una caen
 * los planetas de la otra (solapamientos), si se conocen las horas.
 */
import { datoDeUsuario } from "../seguridad";
import { calcularCarta, type DatosNacimiento, type CartaAstral } from "./carta";
import { casaDeLongitud } from "./casas";
import { NOMBRES_CUERPO, NOMBRES_ASPECTO, type Cuerpo, type TipoAspecto } from "./textos";
import { signoPorId } from "../zodiaco";

export type PuntoSinastria = Cuerpo | "ascendente";
export type Dimension = "emocional" | "pasion" | "comunicacion" | "estabilidad";

export interface AspectoSinastria {
  /** Punto de la persona A. */
  a: PuntoSinastria;
  /** Punto de la persona B. */
  b: PuntoSinastria;
  tipo: TipoAspecto;
  orbe: number;
  /** Aporte a la afinidad (positivo armónico, negativo tenso), ya ponderado. */
  aporte: number;
}

export interface Solapamiento {
  /** De quién es el planeta ("a" o "b") y en la casa de quién cae (la otra). */
  de: "a" | "b";
  cuerpo: Cuerpo;
  casa: number;
}

export interface PersonaSinastria {
  nombre: string;
  sol: string;
  luna: string;
  ascendente: string | null;
  mercurio: string;
  venus: string;
  marte: string;
  elementos: CartaAstral["elementos"];
}

export interface ResultadoSinastria {
  a: PersonaSinastria;
  b: PersonaSinastria;
  aspectos: AspectoSinastria[];
  puntaje: number;
  dimensiones: Record<Dimension, number>;
  solapamientos: Solapamiento[];
}

const ANGULOS: { tipo: TipoAspecto; angulo: number }[] = [
  { tipo: "conjuncion", angulo: 0 },
  { tipo: "oposicion", angulo: 180 },
  { tipo: "trigono", angulo: 120 },
  { tipo: "cuadratura", angulo: 90 },
  { tipo: "sextil", angulo: 60 },
];

/** Cuánto importa cada par (sin orden). Lo que no aparece no se evalúa. */
const PESO_PAR: Record<string, number> = {
  "sol-luna": 3, "luna-luna": 2.5, "venus-marte": 3, "sol-sol": 1.5, "venus-venus": 2, "luna-venus": 2.5, "sol-venus": 2,
  "sol-marte": 1.5, "luna-marte": 1.5, "marte-marte": 1.5, "mercurio-mercurio": 1.5, "luna-mercurio": 1.2, "sol-mercurio": 1,
  "mercurio-venus": 1, "ascendente-sol": 2, "ascendente-luna": 2, "ascendente-venus": 2, "ascendente-marte": 1.2, "ascendente-ascendente": 1.2,
  "saturno-sol": 1.5, "saturno-luna": 1.5, "saturno-venus": 1.5, "saturno-marte": 1, "saturno-mercurio": 0.8, "saturno-ascendente": 1,
  "jupiter-sol": 1, "jupiter-luna": 1, "jupiter-venus": 1, "jupiter-mercurio": 0.6, "jupiter-marte": 0.6,
  "pluton-venus": 1, "pluton-marte": 0.8, "pluton-sol": 0.8, "pluton-luna": 0.8, "neptuno-venus": 0.8, "neptuno-luna": 0.6, "urano-venus": 0.6,
};

/** Signo del aspecto: armónico, tenso o mixto (la oposición atrae y tensa). */
const VALOR_ASPECTO: Record<TipoAspecto, number> = { conjuncion: 1, trigono: 1, sextil: 0.6, cuadratura: -0.8, oposicion: -0.3 };

/** Pares donde la conjunción pesa poco o tensa (Saturno y Plutón sobre lo personal). */
const CONJUNCION_DURA = new Set(["saturno", "pluton"]);

const DIMENSION_DE: Record<Dimension, Set<string>> = {
  emocional: new Set(["sol-luna", "luna-luna", "luna-venus", "ascendente-luna", "neptuno-luna", "luna-mercurio"]),
  pasion: new Set(["venus-marte", "sol-marte", "luna-marte", "marte-marte", "ascendente-venus", "ascendente-marte", "pluton-venus", "pluton-marte", "urano-venus"]),
  comunicacion: new Set(["mercurio-mercurio", "sol-mercurio", "mercurio-venus", "jupiter-mercurio", "ascendente-sol", "ascendente-ascendente", "sol-sol", "jupiter-sol"]),
  estabilidad: new Set(["saturno-sol", "saturno-luna", "saturno-venus", "saturno-marte", "saturno-mercurio", "saturno-ascendente", "venus-venus", "sol-venus", "jupiter-luna", "jupiter-venus"]),
};

function clave(x: PuntoSinastria, y: PuntoSinastria) {
  return [x, y].sort().join("-");
}

function distancia(a: number, b: number) {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

function orbeMaximo(x: PuntoSinastria, y: PuntoSinastria) {
  const luminar = (p: PuntoSinastria) => p === "sol" || p === "luna";
  return luminar(x) || luminar(y) ? 6 : 5;
}

function puntos(c: CartaAstral, conAscendente: boolean): { punto: PuntoSinastria; longitud: number }[] {
  const lista = c.planetas.filter((p) => p.cuerpo !== "nodo_norte").map((p) => ({ punto: p.cuerpo as PuntoSinastria, longitud: p.longitud }));
  if (conAscendente) lista.push({ punto: "ascendente", longitud: c.ascendente.longitud });
  return lista;
}

function persona(c: CartaAstral): PersonaSinastria {
  const signo = (cuerpo: Cuerpo) => c.planetas.find((p) => p.cuerpo === cuerpo)?.signo.id ?? "";
  return {
    nombre: c.datos.nombre,
    sol: signo("sol"),
    luna: signo("luna"),
    ascendente: c.datos.horaDesconocida ? null : c.ascendente.signo.id,
    mercurio: signo("mercurio"),
    venus: signo("venus"),
    marte: signo("marte"),
    elementos: c.elementos,
  };
}

export function calcularSinastria(datosA: DatosNacimiento, datosB: DatosNacimiento): ResultadoSinastria {
  const cartaA = calcularCarta(datosA);
  const cartaB = calcularCarta(datosB);
  const pa = puntos(cartaA, !datosA.horaDesconocida);
  const pb = puntos(cartaB, !datosB.horaDesconocida);

  const aspectos: AspectoSinastria[] = [];
  const suma: Record<Dimension, number> = { emocional: 0, pasion: 0, comunicacion: 0, estabilidad: 0 };
  const pesoDim: Record<Dimension, number> = { emocional: 0, pasion: 0, comunicacion: 0, estabilidad: 0 };
  let total = 0;
  let pesoTotal = 0;

  for (const x of pa) {
    for (const y of pb) {
      const k = clave(x.punto, y.punto);
      const peso = PESO_PAR[k];
      if (!peso) continue;
      const d = distancia(x.longitud, y.longitud);
      const maximo = orbeMaximo(x.punto, y.punto);
      for (const asp of ANGULOS) {
        const orbe = Math.abs(d - asp.angulo);
        if (orbe > maximo) continue;
        let valor = VALOR_ASPECTO[asp.tipo];
        if (asp.tipo === "conjuncion" && (CONJUNCION_DURA.has(x.punto) || CONJUNCION_DURA.has(y.punto))) valor = 0.2;
        // Los aspectos exactos pesan más que los abiertos.
        const exactitud = 1 - orbe / (maximo + 1);
        const aporte = Math.round(valor * peso * (0.5 + 0.5 * exactitud) * 100) / 100;
        aspectos.push({ a: x.punto, b: y.punto, tipo: asp.tipo, orbe: Math.round(orbe * 10) / 10, aporte });
        total += aporte;
        pesoTotal += peso;
        for (const dim of Object.keys(DIMENSION_DE) as Dimension[]) {
          if (DIMENSION_DE[dim].has(k)) {
            suma[dim] += aporte;
            pesoDim[dim] += peso;
          }
        }
        break;
      }
    }
  }

  aspectos.sort((p, q) => Math.abs(q.aporte) - Math.abs(p.aporte));
  const escala = (valor: number, peso: number) => {
    if (!peso) return 50;
    // valor/peso va de -0.8 a 1; lo llevamos a 15–97.
    const razon = Math.max(-0.8, Math.min(1, valor / peso));
    return Math.round(50 + razon * 45);
  };
  const puntaje = escala(total, Math.max(pesoTotal, 6));
  const dimensiones = {
    emocional: escala(suma.emocional, Math.max(pesoDim.emocional, 2.5)),
    pasion: escala(suma.pasion, Math.max(pesoDim.pasion, 2.5)),
    comunicacion: escala(suma.comunicacion, Math.max(pesoDim.comunicacion, 2)),
    estabilidad: escala(suma.estabilidad, Math.max(pesoDim.estabilidad, 2)),
  };

  const solapamientos: Solapamiento[] = [];
  const PERSONALES: Cuerpo[] = ["sol", "luna", "venus", "marte"];
  if (!datosA.horaDesconocida) {
    for (const p of cartaB.planetas) if (PERSONALES.includes(p.cuerpo)) solapamientos.push({ de: "b", cuerpo: p.cuerpo, casa: casaDeLongitud(p.longitud, cartaA.casas.cuspides) });
  }
  if (!datosB.horaDesconocida) {
    for (const p of cartaA.planetas) if (PERSONALES.includes(p.cuerpo)) solapamientos.push({ de: "a", cuerpo: p.cuerpo, casa: casaDeLongitud(p.longitud, cartaB.casas.cuspides) });
  }

  return { a: persona(cartaA), b: persona(cartaB), aspectos, puntaje, dimensiones, solapamientos };
}

function nombrePunto(p: PuntoSinastria) {
  return p === "ascendente" ? "Ascendente" : NOMBRES_CUERPO[p];
}

/** Resumen en texto plano para el modelo. */
export function resumenSinastria(r: ResultadoSinastria) {
  const n = (id: string) => signoPorId(id)?.nombre ?? id;
  const ficha = (p: PersonaSinastria, etiqueta: string) =>
    `${etiqueta}: ${datoDeUsuario(p.nombre, 80)} · Sol en ${n(p.sol)}, Luna en ${n(p.luna)}${p.ascendente ? `, Ascendente ${n(p.ascendente)}` : " (hora desconocida: sin Ascendente ni casas)"}, Mercurio en ${n(p.mercurio)}, Venus en ${n(p.venus)}, Marte en ${n(p.marte)}. Elementos: fuego ${p.elementos.fuego}, tierra ${p.elementos.tierra}, aire ${p.elementos.aire}, agua ${p.elementos.agua}.`;
  const lineas = [ficha(r.a, "Persona A"), ficha(r.b, "Persona B"), "", `Afinidad calculada: ${r.puntaje}/100 (emocional ${r.dimensiones.emocional}, pasión ${r.dimensiones.pasion}, comunicación ${r.dimensiones.comunicacion}, estabilidad ${r.dimensiones.estabilidad}).`, "", "Aspectos cruzados (planeta de A → planeta de B), de mayor a menor peso:"];
  for (const asp of r.aspectos.slice(0, 16)) {
    lineas.push(`- ${nombrePunto(asp.a)} de A ${NOMBRES_ASPECTO[asp.tipo].toLowerCase()} ${nombrePunto(asp.b)} de B (orbe ${asp.orbe}°, ${asp.aporte >= 0 ? "armónico" : "tenso"})`);
  }
  if (!r.aspectos.length) lineas.push("- Sin aspectos cruzados estrechos: la relación se apoya más en la afinidad por signos y elementos que en contactos exactos.");
  if (r.solapamientos.length) {
    lineas.push("", "Solapamientos de casas:");
    for (const s of r.solapamientos) {
      const dueno = s.de === "a" ? "A" : "B";
      const otro = s.de === "a" ? "B" : "A";
      lineas.push(`- ${NOMBRES_CUERPO[s.cuerpo]} de ${dueno} cae en la casa ${s.casa} de ${otro}`);
    }
  }
  return lineas.join("\n");
}
