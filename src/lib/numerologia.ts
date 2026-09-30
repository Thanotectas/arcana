/**
 * Numerología pitagórica.
 */

const VALORES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOCALES = new Set(["a", "e", "i", "o", "u"]);
const MAESTROS = new Set([11, 22, 33]);

function normalizar(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ñ/g, "n")
    .replace(/[^a-z]/g, "");
}

/** Reduce a un dígito, conservando números maestros. */
export function reducir(n: number, conservarMaestros = true): number {
  while (n > 9) {
    if (conservarMaestros && MAESTROS.has(n)) return n;
    n = String(n)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return n;
}

function sumarLetras(nombre: string, filtro?: (l: string) => boolean) {
  return normalizar(nombre)
    .split("")
    .filter((l) => (filtro ? filtro(l) : true))
    .reduce((acc, l) => acc + (VALORES[l] ?? 0), 0);
}

export interface PerfilNumerologico {
  caminoDeVida: number;
  expresion: number;
  almaOImpulso: number;
  personalidad: number;
  cumpleanos: number;
  anioPersonal: number;
}

export function calcularPerfil(nombreCompleto: string, fecha: Date, hoy = new Date()): PerfilNumerologico {
  const dia = fecha.getUTCDate();
  const mes = fecha.getUTCMonth() + 1;
  const anio = fecha.getUTCFullYear();

  const caminoDeVida = reducir(reducir(dia) + reducir(mes) + reducir(anio));
  const expresion = reducir(sumarLetras(nombreCompleto));
  const almaOImpulso = reducir(sumarLetras(nombreCompleto, (l) => VOCALES.has(l)));
  const personalidad = reducir(sumarLetras(nombreCompleto, (l) => !VOCALES.has(l)));
  const cumpleanos = reducir(dia);
  const anioPersonal = reducir(reducir(dia) + reducir(mes) + reducir(hoy.getUTCFullYear()), false);

  return { caminoDeVida, expresion, almaOImpulso, personalidad, cumpleanos, anioPersonal };
}

export const SIGNIFICADO_NUMERO: Record<number, { titulo: string; resumen: string }> = {
  1: { titulo: "El Pionero", resumen: "Liderazgo, independencia, iniciativa. Aprende a colaborar sin perder su voz." },
  2: { titulo: "El Diplomático", resumen: "Sensibilidad, cooperación, paciencia. Aprende a poner límites." },
  3: { titulo: "El Comunicador", resumen: "Expresión, creatividad, alegría. Aprende a enfocar su energía." },
  4: { titulo: "El Constructor", resumen: "Orden, trabajo, estabilidad. Aprende a soltar la rigidez." },
  5: { titulo: "El Aventurero", resumen: "Libertad, cambio, experiencia. Aprende a comprometerse." },
  6: { titulo: "El Cuidador", resumen: "Responsabilidad, hogar, armonía. Aprende a cuidarse a sí mismo." },
  7: { titulo: "El Buscador", resumen: "Análisis, introspección, sabiduría. Aprende a confiar." },
  8: { titulo: "El Ejecutivo", resumen: "Poder, abundancia, logro. Aprende a usar el poder con ética." },
  9: { titulo: "El Humanista", resumen: "Compasión, cierre de ciclos, servicio. Aprende a desapegarse." },
  11: { titulo: "El Iluminador", resumen: "Intuición elevada, inspiración, nerviosismo. Aprende a aterrizar la visión." },
  22: { titulo: "El Arquitecto", resumen: "Grandes obras, visión práctica, presión. Aprende a delegar." },
  33: { titulo: "El Maestro", resumen: "Servicio amoroso, enseñanza, sacrificio. Aprende a no cargar con todo." },
};
