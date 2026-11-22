import type { CSSProperties } from "react";
import { DATOS_PALO, cartaIskambil, type Palo } from "@/lib/iskambil/mazo";

/**
 * Cartas de la baraja francesa dibujadas en SVG (valor y pintas en su disposición clásica). Sin hooks ni ids:
 * sirven en componentes de servidor y de cliente. El ancho lo da el contenedor; proporción 2:3.
 */
const ROJO = "#e8586e";
const NEGRO = "#e6c06a";
const TEXTO: CSSProperties = { fontFamily: "Georgia, 'Times New Roman', serif" };

/** Las cuatro pintas, dibujadas en una caja de 20×20 centrada en (0, 0). */
const PINTA: Record<Palo, React.ReactNode> = {
  kupa: <path d="M0 8 C-4 4 -10 0 -10 -4.5 C-10 -8.5 -6.5 -10 -4.5 -10 C-2.5 -10 -0.8 -8.8 0 -7 C0.8 -8.8 2.5 -10 4.5 -10 C6.5 -10 10 -8.5 10 -4.5 C10 0 4 4 0 8 Z" />,
  karo: <path d="M0 -10 C2.5 -6 5 -3 8 0 C5 3 2.5 6 0 10 C-2.5 6 -5 3 -8 0 C-5 -3 -2.5 -6 0 -10 Z" />,
  sinek: (
    <>
      <circle cx="0" cy="-5" r="4.4" />
      <circle cx="-5" cy="1.4" r="4.4" />
      <circle cx="5" cy="1.4" r="4.4" />
      <path d="M-0.9 0 L-3 9.5 L3 9.5 L0.9 0 Z" />
    </>
  ),
  maca: (
    <>
      <path d="M0 -10 C4 -5 10 -1.5 10 2.5 C10 6 7 7.5 4.5 7.5 C2.5 7.5 1 6.5 0 5 C-1 6.5 -2.5 7.5 -4.5 7.5 C-7 7.5 -10 6 -10 2.5 C-10 -1.5 -4 -5 0 -10 Z" />
      <path d="M-0.9 4 L-3 10 L3 10 L0.9 4 Z" />
    </>
  ),
};

const L = 31;
const C = 50;
const R = 69;
/** Posición de las pintas de cada número (las de la mitad de abajo van giradas, como en la baraja impresa). */
const PIPS: Record<string, [number, number][]> = {
  "2": [[C, 30], [C, 120]],
  "3": [[C, 30], [C, 75], [C, 120]],
  "4": [[L, 30], [R, 30], [L, 120], [R, 120]],
  "5": [[L, 30], [R, 30], [C, 75], [L, 120], [R, 120]],
  "6": [[L, 30], [R, 30], [L, 75], [R, 75], [L, 120], [R, 120]],
  "7": [[L, 30], [R, 30], [C, 52], [L, 75], [R, 75], [L, 120], [R, 120]],
  "8": [[L, 30], [R, 30], [C, 52], [L, 75], [R, 75], [C, 98], [L, 120], [R, 120]],
  "9": [[L, 30], [R, 30], [L, 60], [R, 60], [C, 75], [L, 90], [R, 90], [L, 120], [R, 120]],
  "10": [[L, 30], [R, 30], [C, 45], [L, 60], [R, 60], [L, 90], [R, 90], [C, 105], [L, 120], [R, 120]],
};

const ADORNO: Record<"K" | "Q" | "J", React.ReactNode> = {
  K: <path d="M-12 8 L-10 -6 L-5 1 L0 -9 L5 1 L10 -6 L12 8 Z" />,
  Q: (
    <>
      <path d="M-11 8 L-9 -2 L-4 3 L0 -5 L4 3 L9 -2 L11 8 Z" />
      <circle cx="0" cy="-8" r="2" />
      <circle cx="-9" cy="-5" r="1.6" />
      <circle cx="9" cy="-5" r="1.6" />
    </>
  ),
  J: <path d="M-11 8 C-10 -4 -3 -8 0 -8 C5 -8 12 -6 14 -2 C9 -3 6 -1 5 2 L11 8 Z" />,
};

function Pinta({ palo, x, y, escala, girada = false }: { palo: Palo; x: number; y: number; escala: number; girada?: boolean }) {
  return <g transform={`translate(${x} ${y}) scale(${escala})${girada ? " rotate(180)" : ""}`}>{PINTA[palo]}</g>;
}

/** Figuras ilustradas (public/cartas/iskambil/<id>.webp): al llegar una nueva, se suma su id aquí. */
const FIGURAS_ILUSTRADAS = new Set(["kupa-k", "kupa-q", "kupa-j", "karo-k", "karo-q", "karo-j", "sinek-k", "sinek-q", "sinek-j", "maca-k", "maca-q"]);

export function CartaIskambil({ id, alt, className = "" }: { id: string; alt: string; className?: string }) {
  const c = cartaIskambil(id);
  if (!c) return null;
  if (FIGURAS_ILUSTRADAS.has(c.id)) {
    // La letra va bajo la pinta de la esquina (arriba a la izquierda y, girada, abajo a la derecha), como en un naipe.
    const letra = "absolute rounded-md border border-oro/60 bg-noche/85 px-[4%] py-[2%] font-display text-[clamp(10px,10cqw,24px)] font-bold leading-none text-oro shadow";
    return (
      <div role="img" aria-label={alt} className={`relative aspect-[2/3] w-full overflow-hidden rounded-[0.45rem] border border-oro/50 shadow-[0_10px_16px_rgba(0,0,0,0.45)] [container-type:inline-size] ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- carta pequeña y estática */}
        <img src={`/cartas/iskambil/${c.id}.webp`} alt="" className="h-full w-full object-cover" loading="lazy" />
        <span className={`${letra} left-[9%] top-[21%]`}>{c.rango}</span>
        <span className={`${letra} bottom-[21%] right-[9%] rotate-180`}>{c.rango}</span>
      </div>
    );
  }
  const color = DATOS_PALO[c.palo].rojo ? ROJO : NEGRO;
  const figura = c.rango === "K" || c.rango === "Q" || c.rango === "J" ? c.rango : null;
  const indice = (
    <g>
      <text x="10.5" y="19" textAnchor="middle" fontSize={c.rango === "10" ? 12 : 14} fontWeight="700" style={TEXTO} letterSpacing={c.rango === "10" ? -1 : 0}>
        {c.rango}
      </text>
      <Pinta palo={c.palo} x={10.5} y={29} escala={0.42} />
    </g>
  );
  return (
    <svg viewBox="0 0 100 150" role="img" aria-label={alt} className={`block h-auto w-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.45)] ${className}`}>
      <defs>
        <radialGradient id="fondo-iskambil" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stopColor="#2a1a4a" />
          <stop offset="100%" stopColor="#120a24" />
        </radialGradient>
      </defs>
      <rect x="0.75" y="0.75" width="98.5" height="148.5" rx="7" fill="url(#fondo-iskambil)" stroke="#c9a85a" strokeWidth="1.5" />
      <rect x="4" y="4" width="92" height="142" rx="5" fill="none" stroke="#c9a85a" strokeOpacity="0.35" strokeWidth="0.6" />
      <g fill={color}>
        {indice}
        <g transform="rotate(180 50 75)">{indice}</g>
        {c.rango === "A" && <Pinta palo={c.palo} x={50} y={75} escala={2.3} />}
        {PIPS[c.rango]?.map(([x, y], i) => <Pinta key={i} palo={c.palo} x={x} y={y} escala={0.72} girada={y > 75} />)}
        {figura && (
          <g>
            <rect x="20" y="17" width="60" height="116" rx="3" fill={color} fillOpacity="0.07" stroke={color} strokeWidth="1" />
            <line x1="22" y1="75" x2="78" y2="75" stroke={color} strokeWidth="0.6" strokeOpacity="0.5" />
            {[false, true].map((abajo) => (
              <g key={String(abajo)} transform={abajo ? "rotate(180 50 75)" : undefined}>
                <g transform="translate(50 32)" fill="#c99a2e">{ADORNO[figura]}</g>
                <text x="50" y="62" textAnchor="middle" fontSize="24" fontWeight="700" style={TEXTO}>
                  {figura}
                </text>
                <Pinta palo={c.palo} x={34} y={64} escala={0.5} />
                <Pinta palo={c.palo} x={66} y={64} escala={0.5} />
              </g>
            ))}
          </g>
        )}
      </g>
    </svg>
  );
}

/** Dorso de la baraja: rombos granate y oro. */
export function DorsoIskambil({ className = "", style }: { className?: string; style?: CSSProperties }) {
  // Dorso propio de Arcana (tulipanes otomanos, lunas y estrella de ocho puntas en oro sobre violeta noche).
  return (
    <div
      aria-hidden
      className={`aspect-[2/3] w-full overflow-hidden rounded-[0.45rem] border border-oro/50 bg-noche bg-cover bg-center shadow-[0_8px_18px_rgba(0,0,0,0.45)] ${className}`}
      style={{ backgroundImage: "url(/cartas/iskambil/dorso.webp)", ...style }}
    />
  );
}
