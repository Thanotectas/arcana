/**
 * Nombres y símbolos astrológicos para el modelo y los cálculos; lo que ve la
 * persona sale del diccionario (t.astral). Sin cálculos ni efemérides: se
 * puede usar en el navegador.
 */

export type Cuerpo =
  | "sol"
  | "luna"
  | "mercurio"
  | "venus"
  | "marte"
  | "jupiter"
  | "saturno"
  | "urano"
  | "neptuno"
  | "pluton"
  | "nodo_norte";

export type TipoAspecto = "conjuncion" | "oposicion" | "trigono" | "cuadratura" | "sextil";

export const NOMBRES_CUERPO: Record<Cuerpo, string> = {
  sol: "Sol",
  luna: "Luna",
  mercurio: "Mercurio",
  venus: "Venus",
  marte: "Marte",
  jupiter: "Júpiter",
  saturno: "Saturno",
  urano: "Urano",
  neptuno: "Neptuno",
  pluton: "Plutón",
  nodo_norte: "Nodo Norte",
};

export const SIMBOLOS_CUERPO: Record<Cuerpo, string> = {
  sol: "☉",
  luna: "☽",
  mercurio: "☿",
  venus: "♀",
  marte: "♂",
  jupiter: "♃",
  saturno: "♄",
  urano: "♅",
  neptuno: "♆",
  pluton: "♇",
  nodo_norte: "☊",
};

export const NOMBRES_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "Conjunción",
  oposicion: "Oposición",
  trigono: "Trígono",
  cuadratura: "Cuadratura",
  sextil: "Sextil",
};

export const SIMBOLOS_ASPECTO: Record<TipoAspecto, string> = {
  conjuncion: "☌",
  oposicion: "☍",
  trigono: "△",
  cuadratura: "□",
  sextil: "⚹",
};

