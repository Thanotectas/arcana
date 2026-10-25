import type { ValorLinea } from "@/lib/iching";

/**
 * Hexagrama de seis líneas (de abajo hacia arriba): yang en oro, yin en
 * violeta, con un respiro entre los dos trigramas. Las líneas mutantes
 * brillan y llevan la marca tradicional: ○ en el yang viejo (9) y ✕ en el
 * yin viejo (6). Sin los valores, las mutantes se marcan con un punto.
 */
export function HexagramaVisual({
  lineas,
  mutantes = [],
  valores,
  tamano = 120,
  animado = false,
}: {
  lineas: (0 | 1)[];
  mutantes?: number[];
  valores?: ValorLinea[];
  tamano?: number;
  animado?: boolean;
}) {
  const ancho = tamano * 1.18;
  const alto = tamano * 0.98;
  const grosor = tamano / 12;
  const x0 = tamano * 0.06;
  const largo = tamano * 0.88;
  const hueco = largo * 0.14;
  // Seis renglones con un respiro extra entre el trigrama de abajo y el de arriba.
  const paso = (alto - grosor * 0.8) / 6.4;
  const y = (i: number) => alto - paso * (i + 0.5) - (i >= 3 ? paso * 0.4 : 0) - grosor / 2;
  const id = `hx${tamano}`;
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} aria-hidden>
      <defs>
        <linearGradient id={`${id}-yang`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.55" stopColor="#e2bc63" />
          <stop offset="1" stopColor="#a87a2a" />
        </linearGradient>
        <linearGradient id={`${id}-yin`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3dbff" />
          <stop offset="0.55" stopColor="#a58cf5" />
          <stop offset="1" stopColor="#5b3fd1" />
        </linearGradient>
        <filter id={`${id}-brillo`} x="-20%" y="-200%" width="140%" height="500%">
          <feGaussianBlur stdDeviation={grosor * 0.45} />
        </filter>
      </defs>
      {lineas.map((l, i) => {
        const yy = y(i);
        const mutante = mutantes.includes(i);
        const relleno = `url(#${id}-${l === 1 ? "yang" : "yin"})`;
        const clase = animado ? "linea-hex" : undefined;
        const estilo = animado ? { animationDelay: `${i * 120}ms` } : undefined;
        const barras =
          l === 1
            ? [[x0, largo]]
            : [
                [x0, (largo - hueco) / 2],
                [x0 + (largo + hueco) / 2, (largo - hueco) / 2],
              ];
        const valor = valores?.[i];
        const mx = x0 + largo + tamano * 0.11;
        const my = yy + grosor / 2;
        const m = grosor * 0.55;
        return (
          <g key={i} className={clase} style={estilo}>
            {mutante && barras.map(([x, w], k) => <rect key={`b${k}`} x={x} y={yy} width={w} height={grosor} rx={grosor / 2} fill={l === 1 ? "#f1d99a" : "#b7a5ff"} opacity={0.75} filter={`url(#${id}-brillo)`} />)}
            {barras.map(([x, w], k) => (
              <rect key={k} x={x} y={yy} width={w} height={grosor} rx={grosor / 2} fill={relleno} />
            ))}
            {mutante &&
              (valor === 9 ? (
                <circle cx={mx} cy={my} r={m} fill="none" stroke="#f1d99a" strokeWidth={grosor * 0.22} />
              ) : valor === 6 ? (
                <path d={`M ${mx - m} ${my - m} L ${mx + m} ${my + m} M ${mx + m} ${my - m} L ${mx - m} ${my + m}`} stroke="#b7a5ff" strokeWidth={grosor * 0.22} strokeLinecap="round" />
              ) : (
                <circle cx={x0 + largo / 2} cy={my} r={grosor * 0.35} fill="#0b0716" stroke="#f1d99a" strokeWidth={1} />
              ))}
          </g>
        );
      })}
    </svg>
  );
}
