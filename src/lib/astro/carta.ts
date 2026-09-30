/**
 * Construcción de la carta astral completa: posiciones, casas y aspectos.
 */
import { posiciones, type Cuerpo, type PosicionCuerpo } from "./efemerides";
import { NOMBRES_CUERPO, NOMBRES_ASPECTO, type TipoAspecto } from "./textos";
export { NOMBRES_ASPECTO, SIMBOLOS_ASPECTO, type TipoAspecto } from "./textos";
import { calcularCasas, casaDeLongitud, type Casas } from "./casas";
import { signoPorLongitud, formatoGrado, type Signo } from "../zodiaco";

export interface DatosNacimiento {
  nombre: string;
  fecha: string; // YYYY-MM-DD (hora local del lugar)
  hora: string; // HH:MM (hora local); si se desconoce, "12:00"
  horaDesconocida: boolean;
  lugar: string;
  latitud: number;
  longitud: number;
  zonaHoraria: string; // IANA, p.ej. America/Bogota
}

export interface Aspecto {
  a: Cuerpo;
  b: Cuerpo;
  tipo: TipoAspecto;
  orbe: number; // grados de desviación
  aplicativo?: boolean;
}

export interface PlanetaEnCarta extends PosicionCuerpo {
  nombre: string;
  signo: Signo;
  grado: string;
  casa: number;
}

export interface CartaAstral {
  datos: DatosNacimiento;
  fechaUtc: string;
  planetas: PlanetaEnCarta[];
  casas: Casas;
  ascendente: { longitud: number; signo: Signo; grado: string };
  medioCielo: { longitud: number; signo: Signo; grado: string };
  aspectos: Aspecto[];
  elementos: Record<"fuego" | "tierra" | "aire" | "agua", number>;
  modalidades: Record<"cardinal" | "fijo" | "mutable", number>;
}

const ASPECTOS: { tipo: TipoAspecto; angulo: number; orbe: number }[] = [
  { tipo: "conjuncion", angulo: 0, orbe: 8 },
  { tipo: "oposicion", angulo: 180, orbe: 8 },
  { tipo: "trigono", angulo: 120, orbe: 7 },
  { tipo: "cuadratura", angulo: 90, orbe: 7 },
  { tipo: "sextil", angulo: 60, orbe: 5 },
];

/** Desfase UTC (minutos) de una zona IANA en un instante dado. */
function desfaseMinutos(instante: Date, zona: string) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zona,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = Object.fromEntries(fmt.formatToParts(instante).map((x) => [x.type, x.value]));
  const comoUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return (comoUtc - instante.getTime()) / 60000;
}

/** Convierte fecha y hora local (en una zona IANA) a Date UTC. */
export function localAUtc(fecha: string, hora: string, zona: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm, 0);
  let utc = guess - desfaseMinutos(new Date(guess), zona) * 60000;
  utc = guess - desfaseMinutos(new Date(utc), zona) * 60000;
  return new Date(utc);
}

function distanciaAngular(a: number, b: number) {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

export function calcularAspectos(planetas: PosicionCuerpo[]): Aspecto[] {
  const res: Aspecto[] = [];
  const lista = planetas.filter((p) => p.cuerpo !== "nodo_norte");
  for (let i = 0; i < lista.length; i++) {
    for (let j = i + 1; j < lista.length; j++) {
      const d = distanciaAngular(lista[i].longitud, lista[j].longitud);
      for (const asp of ASPECTOS) {
        const orbe = Math.abs(d - asp.angulo);
        if (orbe <= asp.orbe) {
          res.push({ a: lista[i].cuerpo, b: lista[j].cuerpo, tipo: asp.tipo, orbe: Math.round(orbe * 10) / 10 });
          break;
        }
      }
    }
  }
  return res.sort((x, y) => x.orbe - y.orbe);
}

export function calcularCarta(datos: DatosNacimiento): CartaAstral {
  const hora = datos.horaDesconocida ? "12:00" : datos.hora;
  const fechaUtc = localAUtc(datos.fecha, hora, datos.zonaHoraria);

  const pos = posiciones(fechaUtc);
  const casas = calcularCasas(fechaUtc, datos.latitud, datos.longitud);

  const planetas: PlanetaEnCarta[] = pos.map((p) => ({
    ...p,
    nombre: NOMBRES_CUERPO[p.cuerpo],
    signo: signoPorLongitud(p.longitud),
    grado: formatoGrado(p.longitud),
    casa: casaDeLongitud(p.longitud, casas.cuspides),
  }));

  const elementos = { fuego: 0, tierra: 0, aire: 0, agua: 0 };
  const modalidades = { cardinal: 0, fijo: 0, mutable: 0 };
  for (const p of planetas) {
    if (p.cuerpo === "nodo_norte") continue;
    const peso = p.cuerpo === "sol" || p.cuerpo === "luna" ? 2 : 1;
    elementos[p.signo.elemento] += peso;
    modalidades[p.signo.modalidad] += peso;
  }
  const ascSigno = signoPorLongitud(casas.ascendente);
  elementos[ascSigno.elemento] += 2;
  modalidades[ascSigno.modalidad] += 2;

  return {
    datos,
    fechaUtc: fechaUtc.toISOString(),
    planetas,
    casas,
    ascendente: { longitud: casas.ascendente, signo: ascSigno, grado: formatoGrado(casas.ascendente) },
    medioCielo: {
      longitud: casas.medioCielo,
      signo: signoPorLongitud(casas.medioCielo),
      grado: formatoGrado(casas.medioCielo),
    },
    aspectos: calcularAspectos(pos),
    elementos,
    modalidades,
  };
}

/** Resumen en texto plano para enviarlo al modelo de IA. */
export function resumenCarta(c: CartaAstral) {
  const lineas: string[] = [];
  lineas.push(`Nombre: ${c.datos.nombre}`);
  lineas.push(`Nacimiento: ${c.datos.fecha} ${c.datos.horaDesconocida ? "(hora desconocida, se usó mediodía)" : c.datos.hora} en ${c.datos.lugar}`);
  lineas.push(`Ascendente: ${c.ascendente.signo.nombre} ${c.ascendente.grado}`);
  lineas.push(`Medio Cielo: ${c.medioCielo.signo.nombre} ${c.medioCielo.grado}`);
  lineas.push("Planetas:");
  for (const p of c.planetas) {
    lineas.push(`- ${p.nombre}: ${p.signo.nombre} ${p.grado}, casa ${p.casa}${p.retrogrado ? " (retrógrado)" : ""}`);
  }
  lineas.push("Aspectos principales:");
  for (const a of c.aspectos.slice(0, 14)) {
    lineas.push(`- ${NOMBRES_CUERPO[a.a]} ${NOMBRES_ASPECTO[a.tipo].toLowerCase()} ${NOMBRES_CUERPO[a.b]} (orbe ${a.orbe}°)`);
  }
  lineas.push(
    `Balance de elementos: fuego ${c.elementos.fuego}, tierra ${c.elementos.tierra}, aire ${c.elementos.aire}, agua ${c.elementos.agua}`,
  );
  lineas.push(
    `Modalidades: cardinal ${c.modalidades.cardinal}, fijo ${c.modalidades.fijo}, mutable ${c.modalidades.mutable}`,
  );
  return lineas.join("\n");
}
