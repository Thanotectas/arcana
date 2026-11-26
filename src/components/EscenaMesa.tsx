/**
 * La mesa de Sibila: la escena esotérica que llena el marco de la cámara en el escenario del directo.
 * La cámara del presentador va encima (en LIVE Studio u OBS); cuando la oculta, se ve esta escena:
 * terciopelo, un sello que gira despacio, el mazo en abanico, tres velas que titilan, humo y chispas doradas.
 * Todo es SVG y CSS (clases .mesa-*), sin video en bucle: TikTok marca como «pregrabado» lo que se repite igual.
 */
export function EscenaMesa({ pista }: { pista?: string }) {
  const velas = [
    { x: 250, alto: 150, retraso: 0 },
    { x: 735, alto: 190, retraso: 0.7 },
    { x: 790, alto: 120, retraso: 1.3 },
  ];
  const cartas = [-24, -12, 0, 12, 24];
  const chispas = Array.from({ length: 18 }, (_, i) => ({
    x: 60 + ((i * 137) % 900),
    y: 520 - ((i * 53) % 260),
    r: 1.6 + (i % 3) * 0.8,
    dur: 7 + (i % 5) * 1.7,
    retraso: (i * 0.9) % 7,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl" aria-hidden>
      <svg viewBox="0 0 1000 560" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="mesa-terciopelo" cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#3a1f6e" />
            <stop offset="55%" stopColor="#1c0f3d" />
            <stop offset="100%" stopColor="#09050f" />
          </radialGradient>
          <radialGradient id="mesa-luz-vela">
            <stop offset="0%" stopColor="#ffcf7a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffcf7a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mesa-llama" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#fff4d6" />
            <stop offset="45%" stopColor="#ffc35a" />
            <stop offset="100%" stopColor="#ff7a2e" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="mesa-cera" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#d9c8a6" />
            <stop offset="50%" stopColor="#f6ecd6" />
            <stop offset="100%" stopColor="#bba67f" />
          </linearGradient>
          <pattern id="mesa-dorso" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="14" height="14" fill="#2a1a5e" />
            <rect width="7" height="14" fill="#21134d" />
          </pattern>
          <filter id="mesa-difuso">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="1000" height="560" fill="url(#mesa-terciopelo)" />

        {/* Sello: círculos, estrella de ocho puntas y los doce signos como marcas, girando muy despacio. */}
        <g className="mesa-sello" opacity="0.5">
          <circle cx="500" cy="250" r="210" fill="none" stroke="#d9b45a" strokeWidth="1.2" strokeDasharray="3 7" />
          <circle cx="500" cy="250" r="180" fill="none" stroke="#d9b45a" strokeWidth="0.8" />
          <circle cx="500" cy="250" r="120" fill="none" stroke="#b7a5ff" strokeWidth="0.8" />
          <polygon points="500,70 551,199 680,250 551,301 500,430 449,301 320,250 449,199" fill="none" stroke="#d9b45a" strokeWidth="1" />
          <polygon points="373,123 551,199 627,123 551,301 627,377 449,301 373,377 449,199" fill="none" stroke="#b7a5ff" strokeWidth="0.8" opacity="0.8" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={500 + 195 * Math.cos(a)} cy={250 + 195 * Math.sin(a)} r="4" fill="#f1d99a" />;
          })}
        </g>

        {/* El mazo de Sibila en abanico sobre el paño. */}
        <g transform="translate(500 470)">
          {cartas.map((g, i) => (
            <g key={g} transform={`rotate(${g}) translate(-48 -230)`} className="mesa-carta" style={{ animationDelay: `${i * 0.6}s` }}>
              <rect width="96" height="160" rx="8" fill="url(#mesa-dorso)" stroke="#d9b45a" strokeWidth="2.5" />
              <rect x="9" y="9" width="78" height="142" rx="5" fill="none" stroke="#d9b45a" strokeOpacity="0.55" strokeWidth="1" />
              <text x="48" y="90" textAnchor="middle" fontSize="26" fill="#f1d99a">✦</text>
            </g>
          ))}
        </g>

        {/* Velas: halo cálido, cera y una llama que titila (cada una a su ritmo). */}
        {velas.map((v, i) => (
          <g key={i}>
            <circle cx={v.x} cy={560 - v.alto - 30} r="120" fill="url(#mesa-luz-vela)" className="mesa-halo" style={{ animationDelay: `${v.retraso}s` }} />
            <rect x={v.x - 22} y={560 - v.alto} width="44" height={v.alto} rx="6" fill="url(#mesa-cera)" />
            <line x1={v.x} y1={560 - v.alto} x2={v.x} y2={560 - v.alto - 10} stroke="#2a2018" strokeWidth="2" />
            <g className="mesa-llama" style={{ animationDelay: `${v.retraso}s`, transformOrigin: `${v.x}px ${560 - v.alto - 8}px` }}>
              <path d={`M${v.x},${560 - v.alto - 8} C${v.x - 13},${560 - v.alto - 26} ${v.x - 6},${560 - v.alto - 48} ${v.x},${560 - v.alto - 62} C${v.x + 6},${560 - v.alto - 48} ${v.x + 13},${560 - v.alto - 26} ${v.x},${560 - v.alto - 8} Z`} fill="url(#mesa-llama)" />
            </g>
            {/* Humo que sube desde la llama. */}
            <path
              d={`M${v.x},${560 - v.alto - 66} c-18,-40 22,-70 0,-110 s20,-70 -6,-110`}
              fill="none"
              stroke="#cfc6e8"
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#mesa-difuso)"
              className="mesa-humo"
              style={{ animationDelay: `${v.retraso * 2}s` }}
            />
          </g>
        ))}

        {/* Chispas doradas que flotan hacia arriba. */}
        {chispas.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={c.r} fill="#f1d99a" className="mesa-chispa" style={{ animationDuration: `${c.dur}s`, animationDelay: `-${c.retraso}s` }} />
        ))}

        {/* Viñeta para que la escena se funda con el marco. */}
        <rect width="1000" height="560" fill="none" stroke="#000" strokeOpacity="0.55" strokeWidth="80" filter="url(#mesa-difuso)" />
      </svg>
      {/* Guía para acomodar la cámara: se ve unos segundos al abrir el escenario y se desvanece. */}
      {pista && <p className="mesa-pista absolute inset-x-6 bottom-4 rounded-lg bg-black/60 px-3 py-1 text-center text-base text-violeta-suave">{pista}</p>}
    </div>
  );
}
