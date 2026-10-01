/**
 * Lunaciones: próximas lunas nuevas, cuartos y llenas calculadas con las
 * efemérides reales (elongación Luna-Sol), con el signo en que cae la Luna.
 */
import { solYLuna } from "./efemerides";
import { signoPorLongitud } from "../zodiaco";

export type FaseClave = "nueva" | "creciente" | "llena" | "menguante";

export interface Lunacion {
  fase: FaseClave;
  /** Instante UTC (ISO). */
  fechaUtc: string;
  /** Id del signo donde está la Luna en ese momento. */
  signo: string;
}

const OBJETIVO: Record<FaseClave, number> = { nueva: 0, creciente: 90, llena: 180, menguante: 270 };
const ORDEN: FaseClave[] = ["nueva", "creciente", "llena", "menguante"];

function elongacion(fecha: Date) {
  const { sol, luna } = solYLuna(fecha);
  return (((luna - sol) % 360) + 360) % 360;
}

/** Diferencia con signo (−180..180) entre la elongación y el objetivo. */
function desvio(fecha: Date, objetivo: number) {
  return ((elongacion(fecha) - objetivo + 540) % 360) - 180;
}

/** Próximas `cantidad` lunaciones a partir de `desde`, en orden cronológico. */
export function proximasLunaciones(desde = new Date(), cantidad = 8): Lunacion[] {
  const paso = 12 * 3600 * 1000; // 12 horas: las fases distan ~7,4 días
  const limite = cantidad * 8 * 86400000;
  const resultado: Lunacion[] = [];
  let t = desde.getTime();
  let previo = ORDEN.map((f) => desvio(new Date(t), OBJETIVO[f]));
  while (t < desde.getTime() + limite && resultado.length < cantidad) {
    const siguiente = t + paso;
    const actual = ORDEN.map((f) => desvio(new Date(siguiente), OBJETIVO[f]));
    for (let i = 0; i < ORDEN.length; i++) {
      // Cruce de negativo a positivo (la elongación crece con el tiempo).
      if (previo[i] < 0 && actual[i] >= 0 && Math.abs(previo[i]) < 90) {
        let a = t;
        let b = siguiente;
        for (let k = 0; k < 18; k++) {
          const m = (a + b) / 2;
          if (desvio(new Date(m), OBJETIVO[ORDEN[i]]) < 0) a = m;
          else b = m;
        }
        const instante = new Date((a + b) / 2);
        resultado.push({ fase: ORDEN[i], fechaUtc: instante.toISOString(), signo: signoPorLongitud(solYLuna(instante).luna).id });
      }
    }
    previo = actual;
    t = siguiente;
  }
  return resultado.sort((x, y) => x.fechaUtc.localeCompare(y.fechaUtc)).slice(0, cantidad);
}
