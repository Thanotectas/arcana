/** Los números angelicales que tienen página propia. Las claves son cadenas (el 000 y el 0101 conservan sus ceros). */
export const NUMEROS_ANGELICALES = [
  "000",
  "111",
  "222",
  "333",
  "444",
  "555",
  "666",
  "777",
  "888",
  "999",
  "0101",
  "1001",
  "1010",
  "1111",
  "1122",
  "1144",
  "1212",
  "1221",
  "1234",
  "1313",
  "1414",
  "1515",
  "2020",
  "2121",
  "2222",
  "2323",
  "3333",
  "4444",
  "5555",
  "911",
] as const;

export type NumeroAngelical = (typeof NUMEROS_ANGELICALES)[number];

/** El texto de un número en un idioma. Todos los campos son texto corrido, sin Markdown. */
export interface TextoNumero {
  /** Lema breve del número (3–7 palabras), para tarjetas y títulos. */
  lema: string;
  /** Tres o cuatro palabras clave. */
  claves: string[];
  /** Significado general. */
  significado: string;
  /** En el amor. */
  amor: string;
  /** En el trabajo y el dinero (sin promesas ni garantías). */
  trabajo: string;
  /** Como señal de llama gemela o en las relaciones. */
  llamaGemela: string;
  /** Qué hacer cuando lo ves: una acción concreta de reflexión. */
  queHacer: string;
}

/** El contenido completo de la sección en un idioma: un texto por cada número. */
export type ContenidoNumeros = Record<NumeroAngelical, TextoNumero>;

export function esNumeroAngelical(valor: string): valor is NumeroAngelical {
  return (NUMEROS_ANGELICALES as readonly string[]).includes(valor);
}
