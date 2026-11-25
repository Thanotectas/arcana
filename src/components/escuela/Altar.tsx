/**
 * El altar del curso: una vela por lección. Las lecciones hechas arden (llama animada con halo); la de hoy espera con
 * la mecha brillando; las que vienen están apagadas. Solo SVG y CSS.
 */
export function Altar({ estados, tamano = "grande" }: { estados: ("hecha" | "abierta" | "manana" | "cerrada")[]; tamano?: "grande" | "chico" }) {
  const alto = tamano === "grande" ? 150 : 86;
  const hechas = estados.filter((e) => e === "hecha").length;
  return (
    <div className="flex items-end justify-center gap-[3%]" role="img" aria-label={`${hechas} de ${estados.length} velas encendidas`}>
      {estados.map((e, i) => {
        // Las velas del centro, un poco más altas: como un altar de verdad.
        const h = alto * (1 - Math.abs(i - (estados.length - 1) / 2) * 0.07);
        const encendida = e === "hecha";
        const hoy = e === "abierta";
        return (
          <svg key={i} viewBox="0 0 40 120" style={{ height: `min(${h}px, ${((h / alto) * (tamano === "grande" ? 34 : 22)).toFixed(1)}vw)`, width: "auto" }} className="overflow-visible" aria-hidden>
            <defs>
              <linearGradient id={`cera-${i}`} x1="0" x2="1">
                <stop offset="0" stopColor={encendida ? "#efe3c8" : "#5a5170"} />
                <stop offset="0.55" stopColor={encendida ? "#fff8e8" : "#6d6386"} />
                <stop offset="1" stopColor={encendida ? "#d9c9a6" : "#4a4260"} />
              </linearGradient>
              <radialGradient id={`llama-${i}`} cx="50%" cy="70%" r="60%">
                <stop offset="0" stopColor="#fffbe6" />
                <stop offset="0.45" stopColor="#ffd36b" />
                <stop offset="1" stopColor="#ff8a1f" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            {encendida && <circle cx="20" cy="22" r="22" fill="rgba(255,196,90,0.22)" className="escuela-halo" />}
            {/* Cera y gotas */}
            <rect x="10" y="40" width="20" height="74" rx="3" fill={`url(#cera-${i})`} />
            {encendida && <path d="M12 42 q2 8 0 14 q-2 -6 0 -14z M27 42 q2 10 0 18 q-2 -8 0 -18z" fill="#fff6e0" opacity="0.8" />}
            <ellipse cx="20" cy="40" rx="10" ry="2.5" fill={encendida ? "#fff3d6" : "#7a7096"} />
            {/* Mecha */}
            <line x1="20" y1="40" x2="20" y2="33" stroke={hoy ? "#ffb347" : "#2a2338"} strokeWidth="1.6" strokeLinecap="round" />
            {hoy && <circle cx="20" cy="33" r="1.6" fill="#ffb347" className="escuela-halo" />}
            {encendida && (
              <g className="escuela-llama">
                <path d="M20 4 C 28 16, 27 26, 20 33 C 13 26, 12 16, 20 4 Z" fill={`url(#llama-${i})`} />
                <path d="M20 16 C 23 22, 23 27, 20 31 C 17 27, 17 22, 20 16 Z" fill="#fffdf2" opacity="0.9" />
              </g>
            )}
            {/* Platillo */}
            <ellipse cx="20" cy="115" rx="17" ry="4" fill={encendida ? "#c9a24e" : "#3b3350"} />
          </svg>
        );
      })}
    </div>
  );
}
