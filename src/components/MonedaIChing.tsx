/**
 * Moneda china de bronce con su agujero cuadrado. La cara lleva cuatro
 * caracteres (元亨利貞, el comienzo del Juicio del primer hexagrama) y vale
 * yang; el reverso, más oscuro y liso, vale yin.
 */
export function MonedaIChing({ lado }: { lado: "cara" | "cruz" }) {
  const cara = lado === "cara";
  const id = `moneda-${lado}`;
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          {cara ? (
            <>
              <stop offset="0" stopColor="#fbe7b0" />
              <stop offset="0.6" stopColor="#c99a3a" />
              <stop offset="1" stopColor="#7a5418" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#cdbdf5" />
              <stop offset="0.6" stopColor="#6b55b8" />
              <stop offset="1" stopColor="#2c1f63" />
            </>
          )}
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill={`url(#${id})`} stroke={cara ? "#f1d99a" : "#b7a5ff"} strokeWidth="1.2" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke={cara ? "rgba(58,42,8,0.55)" : "rgba(15,10,40,0.55)"} strokeWidth="1.4" />
      <rect x="25.5" y="25.5" width="13" height="13" fill="#0b0716" stroke={cara ? "rgba(58,42,8,0.7)" : "rgba(15,10,40,0.7)"} strokeWidth="2.2" />
      {cara ? (
        <g fontSize="10.5" fontWeight="700" fill="#3a2a08" textAnchor="middle" dominantBaseline="central" fontFamily="'Noto Serif CJK SC','Songti SC','SimSun',serif">
          <text x="32" y="15">元</text>
          <text x="32" y="49.5">亨</text>
          <text x="49" y="32">利</text>
          <text x="15" y="32">貞</text>
        </g>
      ) : (
        <g fill="none" stroke="rgba(15,10,40,0.5)" strokeWidth="1.3" strokeLinecap="round">
          <path d="M 13 32 q 3 -3 6 0 M 45 32 q 3 -3 6 0 M 32 13 q 3 -3 6 0 M 26 51 q 3 -3 6 0" />
        </g>
      )}
    </svg>
  );
}
