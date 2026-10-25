import type { Movimiento } from "@/lib/oraculos/pendulo";

const CLASE_BRAZO: Record<Movimiento | "esperando" | "buscando", string> = {
  esperando: "pendulo-lento",
  buscando: "pendulo-buscando",
  si: "pendulo-si",
  no: "pendulo-no",
  vaiven: "pendulo-vaiven",
  quieto: "",
};

const CLASE_SOMBRA: Partial<Record<Movimiento | "esperando" | "buscando", string>> = {
  si: "pendulo-sombra-si",
  no: "pendulo-sombra-no",
  vaiven: "pendulo-sombra-vaiven",
};

const redondear = (v: number) => Math.round(v * 10) / 10;

/**
 * Péndulo de amatista con cadena dorada sobre su tablero. Cuelga quieto,
 * oscila en vaivén o gira como un péndulo cónico: horario es sí y
 * antihorario es no (la estela del tablero marca el sentido con flechas).
 * Las animaciones están en globals.css (pendulo-*).
 */
export function Pendulo({ movimiento, className = "" }: { movimiento: Movimiento | "esperando" | "buscando"; className?: string }) {
  const giro = movimiento === "si" || movimiento === "no";
  // Estela del giro: la elipse del tablero recorrida en el sentido de la respuesta.
  const estela = movimiento === "si" ? "M 166 214 A 66 11 0 1 1 34 214 A 66 11 0 1 1 166 214" : "M 34 214 A 66 11 0 1 0 166 214 A 66 11 0 1 0 34 214";
  return (
    <svg viewBox="0 0 200 236" className={className} aria-hidden>
      <defs>
        <linearGradient id="pend-cara-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7dcff" />
          <stop offset="1" stopColor="#9b7cf0" />
        </linearGradient>
        <linearGradient id="pend-cara-b" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b79cff" />
          <stop offset="1" stopColor="#5a37c4" />
        </linearGradient>
        <linearGradient id="pend-cara-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f6ae6" />
          <stop offset="1" stopColor="#3b2190" />
        </linearGradient>
        <linearGradient id="pend-cara-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6c49d1" />
          <stop offset="1" stopColor="#24105e" />
        </linearGradient>
        <linearGradient id="pend-oro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff1c4" />
          <stop offset="0.5" stopColor="#e2bc63" />
          <stop offset="1" stopColor="#a87a2a" />
        </linearGradient>
        <radialGradient id="pend-halo">
          <stop offset="0" stopColor="#c9b3ff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#8b6cf6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pend-tablero" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#2a1a5e" />
          <stop offset="1" stopColor="#120c22" />
        </radialGradient>
        <marker id="pend-flecha" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#f1d99a" />
        </marker>
      </defs>

      {/* Tablero: disco en perspectiva con anillos y marcas */}
      <ellipse cx="100" cy="214" rx="86" ry="17" fill="url(#pend-tablero)" stroke="url(#pend-oro)" strokeWidth="1.4" />
      <ellipse cx="100" cy="214" rx="66" ry="11" fill="none" stroke="rgba(241,217,154,0.28)" strokeWidth="0.8" />
      <ellipse cx="100" cy="214" rx="34" ry="5.6" fill="none" stroke="rgba(241,217,154,0.2)" strokeWidth="0.8" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={redondear(100 + 70 * Math.cos(a))}
            y1={redondear(214 + 11.7 * Math.sin(a))}
            x2={redondear(100 + 80 * Math.cos(a))}
            y2={redondear(214 + 13.4 * Math.sin(a))}
            stroke="rgba(241,217,154,0.35)"
            strokeWidth="0.8"
          />
        );
      })}
      {giro && <path d={estela} fill="none" stroke="#f1d99a" strokeOpacity="0.7" strokeWidth="1.4" strokeDasharray="5 4" markerMid="url(#pend-flecha)" markerEnd="url(#pend-flecha)" />}

      {/* Sombra y reflejo del cristal sobre el tablero */}
      <g className={`pendulo-sombra ${CLASE_SOMBRA[movimiento] ?? ""}`}>
        <ellipse cx="100" cy="214" rx="11" ry="3" fill="rgba(0,0,0,0.55)" />
        <ellipse cx="100" cy="214" rx="18" ry="5" fill="url(#pend-halo)" opacity="0.6" />
      </g>

      {/* Soporte */}
      <path d="M 88 6 L 112 6" stroke="#e2bc63" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="100" cy="11" r="3.4" fill="none" stroke="url(#pend-oro)" strokeWidth="1.6" />

      {/* Brazo: cadena, casquillo y cristal giran juntos alrededor del soporte */}
      <g className={`pendulo-brazo ${CLASE_BRAZO[movimiento]}`}>
        {/* Color sólido: un degradado no se pinta en una línea recta (su caja no tiene ancho). */}
        <line x1="100" y1="15" x2="100" y2="146" stroke="#e2bc63" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="2.6 2.2" />
        <circle cx="100" cy="176" r="30" fill="url(#pend-halo)" className="pendulo-brillo" />
        <path d="M 95 146 L 105 146 L 107 152 L 93 152 Z" fill="url(#pend-oro)" />
        <polygon points="100,152 87,168 100,173" fill="url(#pend-cara-a)" />
        <polygon points="100,152 113,168 100,173" fill="url(#pend-cara-b)" />
        <polygon points="87,168 100,173 100,208" fill="url(#pend-cara-c)" />
        <polygon points="113,168 100,173 100,208" fill="url(#pend-cara-d)" />
        <polygon points="100,152 113,168 100,208 87,168" fill="none" stroke="#f1d99a" strokeWidth="0.9" strokeLinejoin="round" />
        <path d="M 92 162 L 96 158" stroke="rgba(255,255,255,0.85)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
