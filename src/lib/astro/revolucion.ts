/**
 * Revolución solar: la carta del instante en que el Sol vuelve a la posición
 * exacta que tenía al nacer. Rige el año que va de un cumpleaños al siguiente.
 */
import { datoDeUsuario } from "../seguridad";
import { solYLuna } from "./efemerides";
import { calcularCarta, type CartaAstral, type DatosNacimiento } from "./carta";
import { casaDeLongitud } from "./casas";
import { NOMBRES_CUERPO, NOMBRES_ASPECTO } from "./textos";

export interface LugarRevolucion {
  lugar: string;
  latitud: number;
  longitud: number;
  zonaHoraria: string;
}

const diferencia = (a: number, b: number) => ((((a - b) % 360) + 540) % 360) - 180;

/** Instante (UTC) del regreso del Sol a su longitud natal cerca del cumpleaños del año dado. */
export function momentoRevolucion(solNatal: number, anio: number, mes: number, dia: number): Date {
  const centro = Date.UTC(anio, mes - 1, dia, 12);
  let a = centro - 3 * 86400000;
  let b = centro + 3 * 86400000;
  for (let i = 0; i < 60 && b - a > 1000; i++) {
    const m = (a + b) / 2;
    // El Sol avanza ~1° por día: antes del regreso la diferencia es negativa.
    if (diferencia(solYLuna(new Date(m)).sol, solNatal) < 0) a = m;
    else b = m;
  }
  return new Date((a + b) / 2);
}

function fechaHoraLocal(instante: Date, zona: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: zona, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
      .formatToParts(instante)
      .map((x) => [x.type, x.value]),
  );
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}` };
}

export interface ResultadoRevolucion {
  anio: number;
  momentoUtc: string;
  fechaLocal: string;
  horaLocal: string;
  lugar: LugarRevolucion;
  /** Misma forma que el resultado de la carta astral, para reutilizar la rueda. */
  planetas: { cuerpo: string; longitud: number; retrogrado: boolean; casa: number; signo: string }[];
  casas: CartaAstral["casas"];
  aspectos: CartaAstral["aspectos"];
  elementos: CartaAstral["elementos"];
  modalidades: CartaAstral["modalidades"];
  /** Casa natal donde cae el Ascendente de la revolución. */
  ascEnCasaNatal: number;
  natal: { sol: string; luna: string; ascendente: string | null };
}

export function calcularRevolucion(natal: DatosNacimiento, anio: number, lugar: LugarRevolucion): ResultadoRevolucion {
  const cartaNatal = calcularCarta(natal);
  const solNatal = cartaNatal.planetas.find((p) => p.cuerpo === "sol")!.longitud;
  const [, mes, dia] = natal.fecha.split("-").map(Number);
  const momento = momentoRevolucion(solNatal, anio, mes, dia);
  const local = fechaHoraLocal(momento, lugar.zonaHoraria);
  const rs = calcularCarta({ nombre: natal.nombre, fecha: local.fecha, hora: local.hora, horaDesconocida: false, ...lugar });
  return {
    anio,
    momentoUtc: momento.toISOString(),
    fechaLocal: local.fecha,
    horaLocal: local.hora,
    lugar,
    planetas: rs.planetas.map((p) => ({ cuerpo: p.cuerpo, longitud: p.longitud, retrogrado: p.retrogrado, casa: p.casa, signo: p.signo.id })),
    casas: rs.casas,
    aspectos: rs.aspectos,
    elementos: rs.elementos,
    modalidades: rs.modalidades,
    ascEnCasaNatal: casaDeLongitud(rs.ascendente.longitud, cartaNatal.casas.cuspides),
    natal: {
      sol: cartaNatal.planetas.find((p) => p.cuerpo === "sol")!.signo.nombre,
      luna: cartaNatal.planetas.find((p) => p.cuerpo === "luna")!.signo.nombre,
      ascendente: natal.horaDesconocida ? null : cartaNatal.ascendente.signo.nombre,
    },
  };
}

/** Texto para el modelo con la revolución solar y su relación con la carta natal. */
export function resumenRevolucion(r: ResultadoRevolucion, natal: DatosNacimiento) {
  const rs = calcularCarta({ nombre: natal.nombre, fecha: r.fechaLocal, hora: r.horaLocal, horaDesconocida: false, ...r.lugar });
  const lineas = [
    `Persona: ${datoDeUsuario(natal.nombre, 80)}. Nació el ${natal.fecha}${natal.horaDesconocida ? " (hora desconocida)" : ` a las ${natal.hora}`} en ${datoDeUsuario(natal.lugar, 120)}.`,
    `Carta natal: Sol en ${r.natal.sol}, Luna en ${r.natal.luna}${r.natal.ascendente ? `, Ascendente ${r.natal.ascendente}` : ""}.`,
    `Revolución solar ${r.anio}: el Sol vuelve a su grado natal el ${r.fechaLocal} a las ${r.horaLocal} (hora local de ${datoDeUsuario(r.lugar.lugar, 120)}). Rige del cumpleaños de ${r.anio} al de ${r.anio + 1}.`,
    `Ascendente de la revolución: ${rs.ascendente.signo.nombre} ${rs.ascendente.grado}${natal.horaDesconocida ? "" : `, cae en la casa ${r.ascEnCasaNatal} natal`}. Medio Cielo: ${rs.medioCielo.signo.nombre}.`,
    "Planetas de la revolución:",
    ...rs.planetas.map((p) => `- ${p.nombre}: ${p.signo.nombre} ${p.grado}, casa ${p.casa}${p.retrogrado ? " (retrógrado)" : ""}`),
    "Aspectos principales del año:",
    ...rs.aspectos.slice(0, 10).map((a) => `- ${NOMBRES_CUERPO[a.a]} ${NOMBRES_ASPECTO[a.tipo].toLowerCase()} ${NOMBRES_CUERPO[a.b]} (orbe ${a.orbe}°)`),
  ];
  if (natal.horaDesconocida) lineas.push("Aviso: sin hora de nacimiento el instante del regreso puede variar unas horas; las casas y el Ascendente de la revolución son orientativos.");
  return lineas.join("\n");
}
