import type { Palo } from "@/lib/tarot/deck";

/**
 * Cara de carta dibujada en SVG para los mazos sin ilustración (Marsella y
 * Oráculo de los Ángeles): marco doble ornamentado, numeral o rango en una
 * cartela, pips tradicionales en los arcanos menores y un sello alado para
 * los ángeles. Escala con su contenedor (viewBox 300×510).
 */
export type EstiloDibujo = "marsella" | "angeles" | "rider" | "arcana";

const ORO = "#e2bd63";
const ORO_SUAVE = "#f1d99a";

/** Colores de fondo por mazo (dos paradas del degradado). */
const FONDO: Record<EstiloDibujo, [string, string]> = {
  marsella: ["#3a2426", "#160c10"],
  angeles: ["#243a86", "#0f1430"],
  rider: ["#221741", "#120c24"],
  arcana: ["#221741", "#120c24"],
};

/** Disposición clásica de los pips (coordenadas en el área central 300×300 centrada en 150,255). */
const PIPS: Record<number, [number, number][]> = {
  1: [[150, 255]],
  2: [[150, 175], [150, 335]],
  3: [[150, 170], [150, 255], [150, 340]],
  4: [[100, 185], [200, 185], [100, 325], [200, 325]],
  5: [[100, 185], [200, 185], [150, 255], [100, 325], [200, 325]],
  6: [[100, 175], [200, 175], [100, 255], [200, 255], [100, 335], [200, 335]],
  7: [[100, 175], [200, 175], [150, 215], [100, 255], [200, 255], [100, 335], [200, 335]],
  8: [[100, 165], [200, 165], [100, 225], [200, 225], [100, 285], [200, 285], [100, 345], [200, 345]],
  9: [[100, 165], [200, 165], [100, 225], [200, 225], [150, 255], [100, 285], [200, 285], [100, 345], [200, 345]],
  10: [[100, 165], [200, 165], [100, 225], [200, 225], [150, 200], [150, 310], [100, 285], [200, 285], [100, 345], [200, 345]],
};

/** Símbolos de palo, centrados en (0,0), de unos 40 unidades. */
function SimboloPalo({ palo, tam = 1 }: { palo: Palo; tam?: number }) {
  const g = `scale(${tam})`;
  switch (palo) {
    case "bastos":
      return (
        <g transform={g} stroke={ORO} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <line x1={0} y1={-22} x2={0} y2={22} />
          <path d="M0 -22 C -8 -14, -8 -6, 0 -2 C 8 -6, 8 -14, 0 -22 Z" fill={ORO} stroke="none" />
          <path d="M-9 20 Q 0 26 9 20" />
        </g>
      );
    case "copas":
      return (
        <g transform={g} stroke={ORO} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d="M-16 -16 H16 Q16 4 0 8 Q-16 4 -16 -16 Z" fill="rgba(226,189,99,0.25)" />
          <line x1={0} y1={8} x2={0} y2={20} />
          <path d="M-11 22 H11" />
        </g>
      );
    case "espadas":
      return (
        <g transform={g} stroke={ORO} strokeWidth={2.4} strokeLinecap="round" fill="none">
          <path d="M0 -24 L5 -16 V8 H-5 V-16 Z" fill="rgba(226,189,99,0.25)" />
          <path d="M-14 10 H14" />
          <line x1={0} y1={10} x2={0} y2={24} />
        </g>
      );
    default:
      return (
        <g transform={g} stroke={ORO} strokeWidth={2.4} fill="none">
          <circle r={18} fill="rgba(226,189,99,0.2)" />
          <circle r={11} strokeWidth={1.4} />
          <circle r={4} fill={ORO} stroke="none" />
        </g>
      );
  }
}

function Marco({ estilo }: { estilo: EstiloDibujo }) {
  const color = estilo === "angeles" ? "#bfd2ff" : ORO;
  return (
    <g fill="none" stroke={color}>
      <rect x={10} y={10} width={280} height={490} rx={14} strokeWidth={1.6} />
      <rect x={18} y={18} width={264} height={474} rx={10} strokeWidth={0.7} strokeOpacity={0.7} />
      {/* Esquinas */}
      {[
        [26, 26, 1, 1],
        [274, 26, -1, 1],
        [26, 484, 1, -1],
        [274, 484, -1, -1],
      ].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M${x} ${y + 18 * sy} Q${x} ${y} ${x + 18 * sx} ${y}`} strokeWidth={1.1} />
      ))}
    </g>
  );
}

function Cartela({ y, texto, color, tamano = 15 }: { y: number; texto: string; color: string; tamano?: number }) {
  return (
    <g>
      <line x1={60} y1={y} x2={118} y2={y} stroke={color} strokeOpacity={0.5} strokeWidth={0.8} />
      <line x1={182} y1={y} x2={240} y2={y} stroke={color} strokeOpacity={0.5} strokeWidth={0.8} />
      <text x={150} y={y + tamano * 0.36} textAnchor="middle" fontSize={tamano} fontFamily="var(--font-display), serif" fontWeight={600} fill={color} letterSpacing={1.5}>
        {texto}
      </text>
    </g>
  );
}

function Nombre({ nombre, color }: { nombre: string; color: string }) {
  return (
    <foreignObject x={26} y={410} width={248} height={76}>
      <div
        // @ts-expect-error: el XHTML del foreignObject necesita el espacio de nombres
        xmlns="http://www.w3.org/1999/xhtml"
        style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color, fontFamily: "var(--font-display), serif", fontWeight: 600, fontSize: nombre.length > 24 ? 19 : nombre.length > 14 ? 22 : 27, lineHeight: 1.1, padding: "0 4px" }}
      >
        {nombre}
      </div>
    </foreignObject>
  );
}

export function CaraDibujada({
  nombre,
  etiqueta,
  estilo,
  arcano,
  numero,
  palo,
}: {
  nombre: string;
  etiqueta: string;
  estilo: EstiloDibujo;
  arcano: "mayor" | "menor";
  numero: number;
  palo?: Palo;
}) {
  const [c1, c2] = FONDO[estilo];
  const angeles = estilo === "angeles";
  const color = angeles ? "#dfe8ff" : ORO_SUAVE;
  const idFondo = `fondo-${estilo}`;

  return (
    <svg viewBox="0 0 300 510" className="absolute inset-0 h-full w-full" preserveAspectRatio={estilo === "marsella" ? "xMidYMid meet" : "xMidYMid slice"} aria-hidden>
      <defs>
        <linearGradient id={idFondo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </linearGradient>
        <radialGradient id="halo-angel" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="0.5" stopColor="#bfd2ff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#bfd2ff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={300} height={510} fill={`url(#${idFondo})`} />
      {/* Textura: líneas finas diagonales */}
      <g stroke={angeles ? "#ffffff" : ORO} strokeOpacity={0.05} strokeWidth={1}>
        {Array.from({ length: 14 }, (_, i) => (
          <line key={i} x1={-60 + i * 36} y1={0} x2={120 + i * 36} y2={510} />
        ))}
      </g>
      <Marco estilo={estilo} />
      <Cartela y={50} texto={etiqueta} color={color} tamano={20} />

      {angeles ? (
        <g transform="translate(150 240)">
          <circle r={96} fill="url(#halo-angel)" />
          {/* Alas: tres plumas curvas a cada lado */}
          <g fill="none" stroke="#eef2ff" strokeWidth={3} strokeLinecap="round" strokeOpacity={0.95}>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <path d={`M-22 ${-6 + i * 22} C ${-60 - i * 10} ${-34 + i * 18}, ${-100 - i * 8} ${-30 + i * 26}, ${-118 - i * 4} ${-4 + i * 30}`} strokeWidth={3 - i * 0.5} />
                <path d={`M22 ${-6 + i * 22} C ${60 + i * 10} ${-34 + i * 18}, ${100 + i * 8} ${-30 + i * 26}, ${118 + i * 4} ${-4 + i * 30}`} strokeWidth={3 - i * 0.5} />
              </g>
            ))}
          </g>
          {/* Halo y estrella */}
          <ellipse cy={-58} rx={30} ry={9} fill="none" stroke="#ffffff" strokeWidth={2} strokeOpacity={0.9} />
          <circle cy={6} r={34} fill="rgba(255,255,255,0.08)" stroke="#ffffff" strokeWidth={1.6} />
          <path d="M0 -22 L6 -6 L22 0 L6 6 L0 22 L-6 6 L-22 0 L-6 -6 Z" transform="translate(0 6)" fill="#ffffff" />
          <circle cy={6} r={5} fill="#bfd2ff" />
        </g>
      ) : arcano === "mayor" ? (
        <g transform="translate(150 240)">
          <circle r={88} fill="none" stroke={ORO} strokeWidth={1.2} strokeOpacity={0.8} />
          <circle r={76} fill="none" stroke={ORO} strokeWidth={0.6} strokeOpacity={0.5} strokeDasharray="3 5" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 80} y1={Math.sin(a) * 80} x2={Math.cos(a) * 88} y2={Math.sin(a) * 88} stroke={ORO} strokeWidth={1} />;
          })}
          <text y={24} textAnchor="middle" fontSize={etiqueta.length > 3 ? 54 : 68} fontFamily="var(--font-display), serif" fontWeight={600} fill={ORO_SUAVE}>
            {etiqueta}
          </text>
        </g>
      ) : numero <= 10 && palo ? (
        <g>
          {(PIPS[numero] ?? PIPS[1]).map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <SimboloPalo palo={palo} tam={numero >= 7 ? 1.05 : numero >= 4 ? 1.3 : 1.7} />
            </g>
          ))}
        </g>
      ) : (
        <g transform="translate(150 245)">
          {/* Figuras de corte: escudo con el palo y una corona según el rango */}
          <path d="M-62 -70 H62 V20 C62 60 30 86 0 96 C-30 86 -62 60 -62 20 Z" fill="rgba(226,189,99,0.08)" stroke={ORO} strokeWidth={1.4} />
          <g transform="translate(0 18)">{palo && <SimboloPalo palo={palo} tam={1.5} />}</g>
          {numero === 14 && <path d="M-34 -92 L-22 -112 L-10 -96 L0 -118 L10 -96 L22 -112 L34 -92 Z" fill={ORO} />}
          {numero === 13 && <path d="M-26 -92 Q-14 -112 0 -98 Q14 -112 26 -92 Z" fill={ORO} />}
          {numero === 12 && <path d="M-28 -84 Q0 -120 28 -84 M-28 -84 L-22 -96 M28 -84 L22 -96" fill="none" stroke={ORO} strokeWidth={3} strokeLinecap="round" />}
          {numero === 11 && <path d="M0 -112 Q10 -98 0 -84 Q-10 -98 0 -112 Z" fill={ORO} />}
        </g>
      )}

      <Nombre nombre={nombre} color={color} />
    </svg>
  );
}
