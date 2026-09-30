/**
 * Tránsitos personales: aspectos entre los planetas de hoy y la carta natal.
 * Es la base del mensaje diario "Tu cielo hoy".
 */
import { posiciones, NOMBRES_CUERPO, type Cuerpo } from "./efemerides";
import { calcularCarta, type DatosNacimiento } from "./carta";
import { NOMBRES_ASPECTO, type TipoAspecto } from "./textos";
import { signoPorLongitud, formatoGrado } from "../zodiaco";
import { faseLunar } from "../luna";

export interface Transito {
  transitante: Cuerpo;
  natal: Cuerpo | "ascendente" | "medio_cielo";
  tipo: TipoAspecto;
  orbe: number;
  /** Se acerca (aplicativo) o se aleja (separativo). */
  aplicativo: boolean;
  /** Peso para ordenar: planetas lentos y aspectos exactos pesan más. */
  peso: number;
}

const ASPECTOS: { tipo: TipoAspecto; angulo: number }[] = [
  { tipo: "conjuncion", angulo: 0 },
  { tipo: "oposicion", angulo: 180 },
  { tipo: "trigono", angulo: 120 },
  { tipo: "cuadratura", angulo: 90 },
  { tipo: "sextil", angulo: 60 },
];

/** Orbe admitido según el planeta en tránsito (los lentos, más estrecho). */
const ORBE: Record<Cuerpo, number> = {
  sol: 1.5,
  luna: 3,
  mercurio: 1.5,
  venus: 1.5,
  marte: 1.5,
  jupiter: 1.2,
  saturno: 1,
  urano: 1,
  neptuno: 1,
  pluton: 1,
  nodo_norte: 1,
};

const PESO_PLANETA: Record<Cuerpo, number> = {
  sol: 3,
  luna: 1,
  mercurio: 2,
  venus: 2.5,
  marte: 3,
  jupiter: 4,
  saturno: 5,
  urano: 5,
  neptuno: 5,
  pluton: 6,
  nodo_norte: 2,
};

function distancia(a: number, b: number) {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

export interface CieloDeHoy {
  fecha: string;
  luna: { signo: string; fase: number; iluminacion: number };
  posicionesHoy: { cuerpo: Cuerpo; signo: string; grado: string; retrogrado: boolean }[];
  transitos: Transito[];
  natal: { sol: string; luna: string; ascendente: string | null };
}

export function cieloDeHoy(datos: DatosNacimiento, ahora = new Date()): CieloDeHoy {
  const natal = calcularCarta(datos);
  const hoy = posiciones(ahora);
  const manana = posiciones(new Date(ahora.getTime() + 86400000));

  const puntosNatales: { nombre: Transito["natal"]; longitud: number }[] = natal.planetas.map((p) => ({ nombre: p.cuerpo, longitud: p.longitud }));
  if (!datos.horaDesconocida) {
    puntosNatales.push({ nombre: "ascendente", longitud: natal.ascendente.longitud });
    puntosNatales.push({ nombre: "medio_cielo", longitud: natal.medioCielo.longitud });
  }

  const transitos: Transito[] = [];
  for (const t of hoy) {
    if (t.cuerpo === "nodo_norte") continue;
    const tMan = manana.find((m) => m.cuerpo === t.cuerpo)!;
    for (const n of puntosNatales) {
      const d = distancia(t.longitud, n.longitud);
      for (const a of ASPECTOS) {
        const orbe = Math.abs(d - a.angulo);
        if (orbe <= ORBE[t.cuerpo]) {
          const dManana = Math.abs(distancia(tMan.longitud, n.longitud) - a.angulo);
          transitos.push({
            transitante: t.cuerpo,
            natal: n.nombre,
            tipo: a.tipo,
            orbe: Math.round(orbe * 10) / 10,
            aplicativo: dManana < orbe,
            peso: PESO_PLANETA[t.cuerpo] * (1 + (ORBE[t.cuerpo] - orbe)) * (a.tipo === "conjuncion" || a.tipo === "oposicion" || a.tipo === "cuadratura" ? 1.2 : 1),
          });
          break;
        }
      }
    }
  }
  transitos.sort((x, y) => y.peso - x.peso);

  const luna = hoy.find((p) => p.cuerpo === "luna")!;
  const fase = faseLunar(ahora);
  return {
    fecha: ahora.toISOString().slice(0, 10),
    luna: { signo: signoPorLongitud(luna.longitud).id, fase: fase.indice, iluminacion: fase.iluminacion },
    posicionesHoy: hoy.map((p) => ({ cuerpo: p.cuerpo, signo: signoPorLongitud(p.longitud).id, grado: formatoGrado(p.longitud), retrogrado: p.retrogrado })),
    transitos: transitos.slice(0, 8),
    natal: {
      sol: natal.planetas.find((p) => p.cuerpo === "sol")!.signo.id,
      luna: natal.planetas.find((p) => p.cuerpo === "luna")!.signo.id,
      ascendente: datos.horaDesconocida ? null : natal.ascendente.signo.id,
    },
  };
}

const NOMBRE_PUNTO: Record<Transito["natal"], string> = { ...NOMBRES_CUERPO, ascendente: "Ascendente", medio_cielo: "Medio Cielo" };

/** Texto para el modelo con el cielo de hoy sobre la carta natal. */
export function resumenCieloDeHoy(c: CieloDeHoy, nombre: string, fechaLegible: string) {
  const lineas = [
    `Persona: ${nombre}. Fecha de hoy: ${fechaLegible}.`,
    `Carta natal: Sol en ${c.natal.sol}, Luna en ${c.natal.luna}${c.natal.ascendente ? `, Ascendente ${c.natal.ascendente}` : " (hora de nacimiento desconocida: sin Ascendente ni casas)"}.`,
    `Luna de hoy en ${c.luna.signo}, fase ${c.luna.fase} de 8 (0 nueva, 4 llena), ${c.luna.iluminacion}% iluminada.`,
    "Tránsitos activos hoy sobre la carta natal (ordenados por importancia):",
    ...(c.transitos.length
      ? c.transitos.map(
          (t) => `- ${NOMBRES_CUERPO[t.transitante]} en tránsito ${NOMBRES_ASPECTO[t.tipo].toLowerCase()} ${NOMBRE_PUNTO[t.natal]} natal (orbe ${t.orbe}°, ${t.aplicativo ? "aplicativo, se intensifica" : "separativo, se disuelve"})`,
        )
      : ["- Ningún aspecto exacto hoy: día de fondo tranquilo; usa la Luna y el clima general."]),
    `Posiciones de hoy: ${c.posicionesHoy.map((p) => `${NOMBRES_CUERPO[p.cuerpo]} en ${p.signo}${p.retrogrado && p.cuerpo !== "nodo_norte" ? " (retrógrado)" : ""}`).join(", ")}.`,
  ];
  return lineas.join("\n");
}
