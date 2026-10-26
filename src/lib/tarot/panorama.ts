/**
 * La tirada en conjunto, como la lee una tarotista: qué elemento domina (los
 * cuatro palos y los arcanos mayores aparte), cuántas cartas salen
 * invertidas y qué números o figuras se repiten. Lo usan el panel de la
 * lectura (PanoramaTirada) y el resumen para Sibila.
 */
export type Elemento = "fuego" | "agua" | "aire" | "tierra";
export type ClaveElemento = Elemento | "espiritu";

export interface CartaPanorama {
  elemento: "fuego" | "agua" | "aire" | "tierra" | "espiritu";
  arcano: "mayor" | "menor";
  numero: number;
  invertida: boolean;
}

export const ELEMENTOS: Elemento[] = ["fuego", "agua", "tierra", "aire"];

/** Cuenta los elementos (los arcanos mayores van aparte, como «espíritu»). */
export function contarElementos(cartas: CartaPanorama[]) {
  const n: Record<ClaveElemento, number> = { fuego: 0, agua: 0, aire: 0, tierra: 0, espiritu: 0 };
  for (const c of cartas) n[c.arcano === "mayor" && c.elemento === "espiritu" ? "espiritu" : c.elemento] += 1;
  return n;
}

/** Qué domina la tirada: muchos mayores, un elemento claro o equilibrio. */
export function dominante(n: Record<ClaveElemento, number>, total: number): ClaveElemento | "equilibrio" {
  if (total >= 3 && n.espiritu >= Math.ceil(total / 2)) return "espiritu";
  const max = Math.max(...ELEMENTOS.map((e) => n[e]));
  const lideres = ELEMENTOS.filter((e) => n[e] === max);
  return max >= 2 && lideres.length === 1 ? lideres[0] : "equilibrio";
}

/** Números del 1 al 10 que se repiten entre los arcanos menores, y cuántas figuras de la corte hay. */
export function ecosTirada(cartas: CartaPanorama[]) {
  const menores = cartas.filter((c) => c.arcano === "menor");
  const porNumero = new Map<number, number>();
  for (const c of menores) if (c.numero <= 10) porNumero.set(c.numero, (porNumero.get(c.numero) ?? 0) + 1);
  return { repetidos: [...porNumero].filter(([, k]) => k >= 2).map(([num]) => num), figuras: menores.filter((c) => c.numero > 10).length };
}

const NOMBRE: Record<ClaveElemento, string> = { fuego: "Fuego (Bastos)", agua: "Agua (Copas)", aire: "Aire (Espadas)", tierra: "Tierra (Oros)", espiritu: "Arcanos Mayores" };

/** Una línea con el balance para el modelo, con los mismos criterios del panel. */
export function resumenPanorama(cartas: CartaPanorama[]) {
  const n = contarElementos(cartas);
  const dom = dominante(n, cartas.length);
  const { repetidos, figuras } = ecosTirada(cartas);
  const invertidas = cartas.filter((c) => c.invertida).length;
  const partes = [
    `Balance de la tirada (la persona lo ve en un gráfico): ${(Object.keys(n) as ClaveElemento[]).map((k) => `${NOMBRE[k]} ${n[k]}`).join(", ")}.`,
    dom === "equilibrio" ? "Ningún elemento domina." : `Domina: ${NOMBRE[dom]}.`,
    `${invertidas} de ${cartas.length} invertidas.`,
  ];
  if (repetidos.length) partes.push(`Números repetidos: ${repetidos.join(", ")}.`);
  if (figuras) partes.push(`Figuras de la corte: ${figuras}.`);
  return partes.join(" ");
}
