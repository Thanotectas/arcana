export type Elemento = "fuego" | "tierra" | "aire" | "agua";
export type Modalidad = "cardinal" | "fijo" | "mutable";

export interface Signo {
  id: string;
  nombre: string;
  simbolo: string;
  elemento: Elemento;
  modalidad: Modalidad;
  regente: string;
  /** Inicio aproximado (mes, día) en el calendario. */
  inicio: [number, number];
  fin: [number, number];
  rasgos: string[];
}

export const SIGNOS: Signo[] = [
  { id: "aries", nombre: "Aries", simbolo: "♈", elemento: "fuego", modalidad: "cardinal", regente: "Marte", inicio: [3, 21], fin: [4, 19], rasgos: ["iniciativa", "valentía", "impulsividad"] },
  { id: "tauro", nombre: "Tauro", simbolo: "♉", elemento: "tierra", modalidad: "fijo", regente: "Venus", inicio: [4, 20], fin: [5, 20], rasgos: ["constancia", "sensualidad", "terquedad"] },
  { id: "geminis", nombre: "Géminis", simbolo: "♊", elemento: "aire", modalidad: "mutable", regente: "Mercurio", inicio: [5, 21], fin: [6, 20], rasgos: ["curiosidad", "comunicación", "dispersión"] },
  { id: "cancer", nombre: "Cáncer", simbolo: "♋", elemento: "agua", modalidad: "cardinal", regente: "Luna", inicio: [6, 21], fin: [7, 22], rasgos: ["sensibilidad", "protección", "nostalgia"] },
  { id: "leo", nombre: "Leo", simbolo: "♌", elemento: "fuego", modalidad: "fijo", regente: "Sol", inicio: [7, 23], fin: [8, 22], rasgos: ["generosidad", "creatividad", "orgullo"] },
  { id: "virgo", nombre: "Virgo", simbolo: "♍", elemento: "tierra", modalidad: "mutable", regente: "Mercurio", inicio: [8, 23], fin: [9, 22], rasgos: ["análisis", "servicio", "perfeccionismo"] },
  { id: "libra", nombre: "Libra", simbolo: "♎", elemento: "aire", modalidad: "cardinal", regente: "Venus", inicio: [9, 23], fin: [10, 22], rasgos: ["armonía", "diplomacia", "indecisión"] },
  { id: "escorpio", nombre: "Escorpio", simbolo: "♏", elemento: "agua", modalidad: "fijo", regente: "Plutón", inicio: [10, 23], fin: [11, 21], rasgos: ["intensidad", "transformación", "desconfianza"] },
  { id: "sagitario", nombre: "Sagitario", simbolo: "♐", elemento: "fuego", modalidad: "mutable", regente: "Júpiter", inicio: [11, 22], fin: [12, 21], rasgos: ["optimismo", "libertad", "exceso"] },
  { id: "capricornio", nombre: "Capricornio", simbolo: "♑", elemento: "tierra", modalidad: "cardinal", regente: "Saturno", inicio: [12, 22], fin: [1, 19], rasgos: ["disciplina", "ambición", "rigidez"] },
  { id: "acuario", nombre: "Acuario", simbolo: "♒", elemento: "aire", modalidad: "fijo", regente: "Urano", inicio: [1, 20], fin: [2, 18], rasgos: ["originalidad", "humanismo", "distancia"] },
  { id: "piscis", nombre: "Piscis", simbolo: "♓", elemento: "agua", modalidad: "mutable", regente: "Neptuno", inicio: [2, 19], fin: [3, 20], rasgos: ["empatía", "imaginación", "evasión"] },
];

export function signoPorId(id: string) {
  return SIGNOS.find((s) => s.id === id);
}

/** Signo solar aproximado por fecha de calendario (sin efemérides). */
export function signoPorFecha(mes: number, dia: number): Signo {
  for (const s of SIGNOS) {
    const [mi, di] = s.inicio;
    const [mf, df] = s.fin;
    if (mi <= mf) {
      if ((mes === mi && dia >= di) || (mes === mf && dia <= df) || (mes > mi && mes < mf)) return s;
    } else {
      // Capricornio cruza el año
      if ((mes === mi && dia >= di) || (mes === mf && dia <= df) || mes > mi || mes < mf) return s;
    }
  }
  return SIGNOS[0];
}

/** Signo por longitud eclíptica en grados [0, 360). Índice 0 = Aries. */
export function signoPorLongitud(longitud: number): Signo {
  const idx = Math.floor((((longitud % 360) + 360) % 360) / 30);
  return SIGNOS[idx];
}

/** Grados dentro del signo (0-30). */
export function gradoEnSigno(longitud: number) {
  return (((longitud % 360) + 360) % 360) % 30;
}

export function formatoGrado(longitud: number) {
  const g = gradoEnSigno(longitud);
  const grados = Math.floor(g);
  const minutos = Math.floor((g - grados) * 60);
  return `${grados}°${String(minutos).padStart(2, "0")}'`;
}

const AFINIDAD_ELEMENTOS: Record<Elemento, Record<Elemento, number>> = {
  fuego: { fuego: 85, aire: 90, tierra: 55, agua: 50 },
  aire: { fuego: 90, aire: 80, tierra: 50, agua: 55 },
  tierra: { fuego: 55, aire: 50, tierra: 85, agua: 90 },
  agua: { fuego: 50, aire: 55, tierra: 90, agua: 85 },
};

/** Puntaje de compatibilidad 0-100 basado en elemento y modalidad. */
export function compatibilidadSignos(a: Signo, b: Signo) {
  let puntaje = AFINIDAD_ELEMENTOS[a.elemento][b.elemento];
  if (a.id === b.id) puntaje = Math.min(100, puntaje + 5);
  else if (a.modalidad === b.modalidad) puntaje -= 5; // misma modalidad: choque de estilos
  // Signos opuestos (a 6 de distancia): tensión magnética
  const ia = SIGNOS.indexOf(a);
  const ib = SIGNOS.indexOf(b);
  if (Math.abs(ia - ib) === 6) puntaje += 5;
  return Math.max(30, Math.min(100, puntaje));
}
