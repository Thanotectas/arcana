import type { Movimiento } from "@/lib/oraculos/pendulo";

/**
 * Péndulo dibujado: cuelga quieto, oscila en vaivén o gira (la órbita y el
 * punto que la recorre muestran el sentido: horario = sí, antihorario = no).
 */
export function Pendulo({ movimiento, className = "" }: { movimiento: Movimiento | "esperando" | "buscando"; className?: string }) {
  const clase = movimiento === "esperando" ? "pendulo-lento" : movimiento === "quieto" ? "" : movimiento === "si" || movimiento === "no" ? "pendulo-giro" : "pendulo-vaiven";
  const giro = movimiento === "si" || movimiento === "no";
  return (
    <svg viewBox="0 0 200 230" className={className} aria-hidden>
      <defs>
        <linearGradient id="cristalPendulo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d99a" />
          <stop offset="0.5" stopColor="#b39cf7" />
          <stop offset="1" stopColor="#5b3fd1" />
        </linearGradient>
      </defs>
      {giro && (
        <>
          <ellipse cx="100" cy="196" rx="62" ry="16" fill="none" stroke="rgba(241,217,154,0.45)" strokeWidth="1.5" strokeDasharray="4 5" />
          <circle r="4" fill="#f1d99a">
            <animateMotion dur="2.4s" repeatCount="indefinite" path="M162 196 A62 16 0 1 1 38 196 A62 16 0 1 1 162 196" keyPoints={movimiento === "si" ? "0;1" : "1;0"} keyTimes="0;1" calcMode="linear" />
          </circle>
        </>
      )}
      <circle cx="100" cy="12" r="5" fill="#f1d99a" />
      <g className={clase}>
        <line x1="100" y1="12" x2="100" y2="150" stroke="rgba(236,230,247,0.8)" strokeWidth="1.5" />
        <path d="M100 148 L114 166 L100 200 L86 166 Z" fill="url(#cristalPendulo)" stroke="#f1d99a" strokeWidth="1.2" />
        <path d="M86 166 L114 166" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      </g>
    </svg>
  );
}
