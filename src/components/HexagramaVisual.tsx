/** Dibuja un hexagrama (seis líneas de abajo hacia arriba) con líneas mutantes marcadas. */
export function HexagramaVisual({
  lineas,
  mutantes = [],
  tamano = 120,
  animado = false,
}: {
  lineas: (0 | 1)[];
  mutantes?: number[];
  tamano?: number;
  animado?: boolean;
}) {
  const alto = tamano * 0.9;
  const grosor = tamano / 14;
  const paso = alto / 6;
  return (
    <svg viewBox={`0 0 ${tamano} ${alto}`} width={tamano} height={alto} aria-hidden>
      {lineas.map((l, i) => {
        const y = alto - paso * (i + 0.5) - grosor / 2;
        const mutante = mutantes.includes(i);
        const color = mutante ? "#f1d99a" : "#b7a5ff";
        const clase = animado ? "linea-hex" : undefined;
        const estilo = animado ? { animationDelay: `${i * 120}ms` } : undefined;
        return l === 1 ? (
          <rect key={i} x={tamano * 0.08} y={y} width={tamano * 0.84} height={grosor} rx={grosor / 2} fill={color} className={clase} style={estilo} />
        ) : (
          <g key={i} className={clase} style={estilo}>
            <rect x={tamano * 0.08} y={y} width={tamano * 0.36} height={grosor} rx={grosor / 2} fill={color} />
            <rect x={tamano * 0.56} y={y} width={tamano * 0.36} height={grosor} rx={grosor / 2} fill={color} />
          </g>
        );
      })}
      {mutantes.map((i) => {
        const y = alto - paso * (i + 0.5);
        return <circle key={`m${i}`} cx={tamano * 0.5} cy={y} r={grosor * 0.35} fill="#0b0716" stroke="#f1d99a" strokeWidth={1} />;
      })}
    </svg>
  );
}
