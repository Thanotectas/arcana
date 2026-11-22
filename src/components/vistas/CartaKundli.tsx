import type { IdGraha } from "@/lib/vedica/calculo";

/**
 * Kundli al estilo del norte de la India: los doce bhavas quedan fijos (el 1
 * arriba al centro, en sentido antihorario) y el número de cada casa es el
 * rashi que la ocupa (1 = Mesha).
 */
type Punto = [number, number];

const CASAS: { centro: Punto; numero: Punto; porFila: number; poligono: Punto[] }[] = [
  { centro: [200, 100], numero: [200, 182], porFila: 3, poligono: [[200, 0], [300, 100], [200, 200], [100, 100]] },
  { centro: [100, 36], numero: [100, 86], porFila: 3, poligono: [[0, 0], [200, 0], [100, 100]] },
  { centro: [34, 100], numero: [84, 104], porFila: 2, poligono: [[0, 0], [100, 100], [0, 200]] },
  { centro: [100, 200], numero: [182, 204], porFila: 3, poligono: [[0, 200], [100, 100], [200, 200], [100, 300]] },
  { centro: [34, 300], numero: [84, 304], porFila: 2, poligono: [[0, 200], [100, 300], [0, 400]] },
  { centro: [100, 366], numero: [100, 324], porFila: 3, poligono: [[0, 400], [100, 300], [200, 400]] },
  { centro: [200, 300], numero: [200, 226], porFila: 3, poligono: [[100, 300], [200, 200], [300, 300], [200, 400]] },
  { centro: [300, 366], numero: [300, 324], porFila: 3, poligono: [[200, 400], [300, 300], [400, 400]] },
  { centro: [366, 300], numero: [316, 304], porFila: 2, poligono: [[400, 400], [300, 300], [400, 200]] },
  { centro: [300, 200], numero: [218, 204], porFila: 3, poligono: [[400, 200], [300, 300], [200, 200], [300, 100]] },
  { centro: [366, 100], numero: [316, 104], porFila: 2, poligono: [[400, 200], [300, 100], [400, 0]] },
  { centro: [300, 36], numero: [300, 86], porFila: 3, poligono: [[400, 0], [300, 100], [200, 0]] },
];

/** Tiempos de la aparición (segundos): las casas se encienden una tras otra y después llegan los grahas. */
const PRIMERA_CASA = 0.7;
const PASO_CASA = 0.16;
const LLEGAN_GRAHAS = PRIMERA_CASA + 12 * PASO_CASA + 0.2;
const ORDEN_GRAHAS: IdGraha[] = ["surya", "chandra", "mangal", "budh", "guru", "shukra", "shani", "rahu", "ketu"];

export interface GrahaEnCarta {
  id: IdGraha;
  casa: number;
  retrogrado: boolean;
}

export function CartaKundli({
  rashiCasa1,
  grahas,
  abreviaturas,
  marcaCasa1,
  marcaRetro,
  titulo,
}: {
  rashiCasa1: number;
  grahas: GrahaEnCarta[];
  abreviaturas: Record<IdGraha, string>;
  /** Etiqueta del bhava 1 (Lagna o Chandra Lagna). */
  marcaCasa1: string;
  marcaRetro: string;
  titulo: string;
}) {
  return (
    <svg viewBox="-6 -6 412 412" role="img" aria-label={titulo} className="mx-auto block w-full max-w-md" direction="ltr">
      <defs>
        <linearGradient id="kundli-fondo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d1633" />
          <stop offset="1" stopColor="#120c22" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="400" rx="6" fill="url(#kundli-fondo)" stroke="#d9b45a" strokeWidth="2" />
      {/* Al aparecer: se trazan las diagonales y el rombo, se enciende casa por casa (1 → 12) y luego llegan los grahas. */}
      <polygon points={CASAS[0].poligono.map((p) => p.join(",")).join(" ")} fill="rgba(217,180,90,0.10)" className="kundli-aparece" style={{ animationDelay: `${PRIMERA_CASA}s` }} />
      <g stroke="rgba(217,180,90,0.75)" strokeWidth="1.5" fill="none">
        <line x1="0" y1="0" x2="400" y2="400" pathLength={1} className="kundli-trazo" />
        <line x1="400" y1="0" x2="0" y2="400" pathLength={1} className="kundli-trazo" style={{ animationDelay: "0.15s" }} />
        <polygon points="200,0 400,200 200,400 0,200" pathLength={1} className="kundli-trazo" style={{ animationDelay: "0.3s" }} />
      </g>

      {CASAS.map((c, i) => {
        const rashi = ((rashiCasa1 + i) % 12) + 1;
        const aqui = grahas.filter((g) => g.casa === i + 1);
        const filas = Math.ceil(aqui.length / c.porFila);
        const alto = 17;
        const ancho = c.porFila === 2 ? 30 : 34;
        const y0 = c.centro[1] - ((filas - 1) * alto) / 2 + 5;
        const enciende = { animationDelay: `${(PRIMERA_CASA + i * PASO_CASA).toFixed(2)}s` };
        return (
          <g key={i}>
            <polygon points={c.poligono.map((p) => p.join(",")).join(" ")} fill="#d9b45a" className="kundli-destello" style={enciende} />
            <text x={c.numero[0]} y={c.numero[1]} textAnchor="middle" fontSize="12" fill="#a89fc0" className="kundli-aparece" style={enciende}>
              {rashi}
            </text>
            {i === 0 && (
              <text x="200" y="40" textAnchor="middle" fontSize="11" fill="#d9b45a" letterSpacing="0.5" className="kundli-aparece" style={enciende}>
                {marcaCasa1}
              </text>
            )}
            {aqui.map((g, k) => {
              const fila = Math.floor(k / c.porFila);
              const enFila = Math.min(c.porFila, aqui.length - fila * c.porFila);
              const col = k % c.porFila;
              const x = c.centro[0] + (col - (enFila - 1) / 2) * ancho;
              const y = y0 + fila * alto + (i === 0 ? 8 : 0);
              const destacado = g.id === "chandra";
              return (
                <text
                  key={g.id}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight={destacado ? 700 : 500}
                  fill={destacado ? "#f1d99a" : "#ece6f7"}
                  className="kundli-graha"
                  style={{ animationDelay: `${(LLEGAN_GRAHAS + ORDEN_GRAHAS.indexOf(g.id) * 0.12).toFixed(2)}s` }}
                >
                  {abreviaturas[g.id]}
                  {g.retrogrado && g.id !== "rahu" && g.id !== "ketu" && (
                    <tspan fontSize="8" dx="1" dy="-5" fill="#ff9f6b">
                      {marcaRetro}
                    </tspan>
                  )}
                </text>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
