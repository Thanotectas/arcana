/**
 * Lo que se ve de una carta natal en conjunto: el regente del Ascendente, el
 * temperamento (elementos por modalidades), las figuras de aspectos (stellium,
 * gran trígono, T-cuadrada, gran cruz) y los hemisferios. Sin efemérides: se
 * calcula sobre el resultado guardado y sirve en el navegador.
 */
import { signoPorId, type Elemento, type Modalidad } from "../zodiaco";
import type { Cuerpo, TipoAspecto } from "./textos";

export interface PlanetaFigura {
  cuerpo: Cuerpo;
  longitud: number;
  casa: number;
  signo: string;
}
export interface AspectoFigura {
  a: Cuerpo;
  b: Cuerpo;
  tipo: TipoAspecto;
}

/** Regente moderno de cada signo. */
export const REGENTE: Record<string, Cuerpo> = {
  aries: "marte",
  tauro: "venus",
  geminis: "mercurio",
  cancer: "luna",
  leo: "sol",
  virgo: "mercurio",
  libra: "venus",
  escorpio: "pluton",
  sagitario: "jupiter",
  capricornio: "saturno",
  acuario: "urano",
  piscis: "neptuno",
};

export const ELEMENTOS: Elemento[] = ["fuego", "tierra", "aire", "agua"];
export const MODALIDADES: Modalidad[] = ["cardinal", "fijo", "mutable"];

/** Los planetas que cuentan para el balance y las figuras (sin el Nodo). */
const reales = <P extends { cuerpo: Cuerpo }>(ps: P[]) => ps.filter((p) => p.cuerpo !== "nodo_norte");

export interface Temperamento {
  /** Planetas por elemento y modalidad: celda[elemento][modalidad]. */
  celda: Record<Elemento, Record<Modalidad, Cuerpo[]>>;
  elementos: Record<Elemento, number>;
  modalidades: Record<Modalidad, number>;
  elemento: Elemento;
  modalidad: Modalidad;
  faltan: Elemento[];
}

export function temperamento(planetas: PlanetaFigura[]): Temperamento {
  const celda = Object.fromEntries(ELEMENTOS.map((e) => [e, Object.fromEntries(MODALIDADES.map((m) => [m, [] as Cuerpo[]]))])) as Temperamento["celda"];
  for (const p of reales(planetas)) {
    const s = signoPorId(p.signo);
    if (s) celda[s.elemento][s.modalidad].push(p.cuerpo);
  }
  const elementos = Object.fromEntries(ELEMENTOS.map((e) => [e, MODALIDADES.reduce((n, m) => n + celda[e][m].length, 0)])) as Record<Elemento, number>;
  const modalidades = Object.fromEntries(MODALIDADES.map((m) => [m, ELEMENTOS.reduce((n, e) => n + celda[e][m].length, 0)])) as Record<Modalidad, number>;
  const mayor = <K extends string>(r: Record<K, number>, ks: K[]) => ks.reduce((a, b) => (r[b] > r[a] ? b : a));
  return { celda, elementos, modalidades, elemento: mayor(elementos, ELEMENTOS), modalidad: mayor(modalidades, MODALIDADES), faltan: ELEMENTOS.filter((e) => elementos[e] === 0) };
}

export type TipoFigura = "stellium" | "granTrigono" | "tCuadrada" | "granCruz";
export interface Figura {
  tipo: TipoFigura;
  cuerpos: Cuerpo[];
  /** Stellium: el signo o la casa donde se juntan. */
  signo?: string;
  casa?: number;
  /** T-cuadrada: el planeta del vértice (el que recibe las dos cuadraturas). */
  vertice?: Cuerpo;
}

export function figurasCarta(planetas: PlanetaFigura[], aspectos: AspectoFigura[], conCasas: boolean): Figura[] {
  const ps = reales(planetas);
  const figuras: Figura[] = [];
  // Stellium: tres o más planetas en un mismo signo o, con hora, en una misma casa.
  const porSigno = new Map<string, Cuerpo[]>();
  for (const p of ps) porSigno.set(p.signo, [...(porSigno.get(p.signo) ?? []), p.cuerpo]);
  for (const [signo, cs] of porSigno) if (cs.length >= 3) figuras.push({ tipo: "stellium", cuerpos: cs, signo });
  if (conCasas) {
    const porCasa = new Map<number, Cuerpo[]>();
    for (const p of ps) porCasa.set(p.casa, [...(porCasa.get(p.casa) ?? []), p.cuerpo]);
    for (const [casa, cs] of porCasa) {
      // Si ya está dentro de un stellium por signo, no se repite.
      const repetido = figuras.some((f) => f.tipo === "stellium" && cs.every((c) => f.cuerpos.includes(c)));
      if (cs.length >= 3 && !repetido) figuras.push({ tipo: "stellium", cuerpos: cs, casa });
    }
  }
  const cuerpos = ps.map((p) => p.cuerpo);
  const hay = (x: Cuerpo, y: Cuerpo, tipo: TipoAspecto) => aspectos.some((a) => a.tipo === tipo && ((a.a === x && a.b === y) || (a.a === y && a.b === x)));
  // Gran trígono: tres planetas en trígono entre sí.
  for (let i = 0; i < cuerpos.length; i++)
    for (let j = i + 1; j < cuerpos.length; j++)
      for (let k = j + 1; k < cuerpos.length; k++) {
        const [a, b, c] = [cuerpos[i], cuerpos[j], cuerpos[k]];
        if (!(hay(a, b, "trigono") && hay(b, c, "trigono") && hay(a, c, "trigono"))) continue;
        // Dos triángulos que comparten dos vértices son la misma figura con un planeta acompañado: se unen.
        const igual = figuras.find((f) => f.tipo === "granTrigono" && [a, b, c].filter((x) => f.cuerpos.includes(x)).length >= 2);
        if (igual) igual.cuerpos = [...new Set([...igual.cuerpos, a, b, c])];
        else figuras.push({ tipo: "granTrigono", cuerpos: [a, b, c] });
      }
  // Gran cruz: dos oposiciones en cuadratura entre sí; si no, T-cuadrada: una oposición con un vértice en cuadratura a ambos.
  const oposiciones = aspectos.filter((x) => x.tipo === "oposicion" && cuerpos.includes(x.a) && cuerpos.includes(x.b));
  const cruces = new Set<string>();
  for (let i = 0; i < oposiciones.length; i++)
    for (let j = i + 1; j < oposiciones.length; j++) {
      const [o1, o2] = [oposiciones[i], oposiciones[j]];
      if ([o1.a, o1.b].every((x) => hay(x, o2.a, "cuadratura") && hay(x, o2.b, "cuadratura"))) {
        const cs = [o1.a, o2.a, o1.b, o2.b];
        cruces.add([...cs].sort().join());
        figuras.push({ tipo: "granCruz", cuerpos: cs });
      }
    }
  for (const o of oposiciones)
    for (const c of cuerpos) {
      if (c === o.a || c === o.b || !hay(c, o.a, "cuadratura") || !hay(c, o.b, "cuadratura")) continue;
      const dentroDeCruz = [...cruces].some((k) => [o.a, o.b, c].every((x) => k.split(",").includes(x)));
      if (!dentroDeCruz) figuras.push({ tipo: "tCuadrada", cuerpos: [o.a, c, o.b], vertice: c });
    }
  return figuras.slice(0, 6);
}

export interface Hemisferios {
  arriba: Cuerpo[];
  abajo: Cuerpo[];
  este: Cuerpo[];
  oeste: Cuerpo[];
}

/** Planetas sobre y bajo el horizonte (casas 7–12 y 1–6) y al este y oeste del meridiano (casas 10–3 y 4–9). */
export function hemisferios(planetas: PlanetaFigura[]): Hemisferios {
  const ps = reales(planetas);
  return {
    arriba: ps.filter((p) => p.casa >= 7).map((p) => p.cuerpo),
    abajo: ps.filter((p) => p.casa <= 6).map((p) => p.cuerpo),
    este: ps.filter((p) => p.casa >= 10 || p.casa <= 3).map((p) => p.cuerpo),
    oeste: ps.filter((p) => p.casa >= 4 && p.casa <= 9).map((p) => p.cuerpo),
  };
}

const NOMBRE_FIGURA: Record<TipoFigura, string> = { stellium: "stellium", granTrigono: "gran trígono", tCuadrada: "T-cuadrada", granCruz: "gran cruz" };

/** Texto para el modelo con lo que se dibuja en la página: regente, temperamento, figuras y hemisferios. */
export function resumenFiguras(planetas: PlanetaFigura[], aspectos: AspectoFigura[], ascendente: number | null, nombre: (c: Cuerpo) => string) {
  const lineas: string[] = [];
  if (ascendente != null) {
    const asc = SIGNO_POR_LONGITUD(ascendente);
    const regente = REGENTE[asc];
    const p = planetas.find((x) => x.cuerpo === regente);
    if (p) lineas.push(`Regente de la carta (por el Ascendente en ${signoPorId(asc)?.nombre}): ${nombre(regente)} en ${signoPorId(p.signo)?.nombre}, casa ${p.casa}.`);
  }
  const tm = temperamento(planetas);
  lineas.push(`Temperamento: domina ${tm.elemento} ${tm.modalidad}${tm.faltan.length ? `; sin planetas en ${tm.faltan.join(" ni ")}` : ""}.`);
  const figuras = figurasCarta(planetas, aspectos, ascendente != null);
  lineas.push(
    figuras.length
      ? `Figuras: ${figuras.map((f) => `${NOMBRE_FIGURA[f.tipo]} (${f.cuerpos.map(nombre).join(", ")}${f.signo ? ` en ${signoPorId(f.signo)?.nombre}` : ""}${f.casa ? ` en la casa ${f.casa}` : ""}${f.vertice ? `, vértice ${nombre(f.vertice)}` : ""})`).join("; ")}.`
      : "Figuras: ninguna mayor.",
  );
  if (ascendente != null) {
    const h = hemisferios(planetas);
    lineas.push(`Hemisferios: ${h.arriba.length} planetas arriba del horizonte y ${h.abajo.length} abajo; ${h.este.length} al este y ${h.oeste.length} al oeste.`);
  }
  return lineas.join("\n");
}

const SIGNO_POR_LONGITUD = (lon: number) => ["aries", "tauro", "geminis", "cancer", "leo", "virgo", "libra", "escorpio", "sagitario", "capricornio", "acuario", "piscis"][Math.floor((((lon % 360) + 360) % 360) / 30)];
