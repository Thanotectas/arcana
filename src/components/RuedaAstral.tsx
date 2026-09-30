import { SIGNOS } from "@/lib/zodiaco";
import { SIMBOLOS_CUERPO, type Cuerpo } from "@/lib/astro/efemerides";
import type { Aspecto } from "@/lib/astro/carta";

interface PlanetaMin {
  cuerpo: Cuerpo;
  longitud: number;
  retrogrado: boolean;
}

const COLOR_ELEMENTO: Record<string, string> = {
  fuego: "#ff8a5b",
  tierra: "#9ad07f",
  aire: "#8fc7ff",
  agua: "#b28dff",
};

const COLOR_ASPECTO: Record<Aspecto["tipo"], string> = {
  conjuncion: "#d9b45a",
  oposicion: "#ff7b7b",
  cuadratura: "#ff9f6b",
  trigono: "#7fd6a4",
  sextil: "#8fc7ff",
};

/**
 * Rueda zodiacal en SVG. La convención astrológica pone el Ascendente a la
 * izquierda (9 en punto) y los signos avanzan en sentido antihorario.
 */
export function RuedaAstral({
  planetas,
  cuspides,
  ascendente,
  aspectos,
  mostrarCasas = true,
}: {
  planetas: PlanetaMin[];
  cuspides: number[];
  ascendente: number;
  aspectos: Aspecto[];
  mostrarCasas?: boolean;
}) {
  const S = 560; // margen para etiquetas exteriores
  const cx = S / 2;
  const cy = S / 2;
  const rExt = 250;
  const rSignos = 215;
  const rCasas = 190;
  const rPlanetas = 160;
  const rAspectos = 125;

  // Ángulo SVG (grados, sentido horario desde las 3 en punto) para una longitud eclíptica.
  const ang = (lon: number) => 180 - (lon - ascendente);
  const punto = (lon: number, r: number) => {
    const a = (ang(lon) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const;
  };
  const arco = (desde: number, hasta: number, r: number) => {
    const [x1, y1] = punto(desde, r);
    const [x2, y2] = punto(hasta, r);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 0 ${x2} ${y2}`;
  };

  // Evita superposición de símbolos planetarios cercanos.
  const ordenados = [...planetas].sort((a, b) => a.longitud - b.longitud);
  const ajustados: (PlanetaMin & { lonDibujo: number })[] = [];
  for (const p of ordenados) {
    let lon = p.longitud;
    const prev = ajustados[ajustados.length - 1];
    if (prev && ((lon - prev.lonDibujo + 360) % 360) < 7) lon = (prev.lonDibujo + 7) % 360;
    ajustados.push({ ...p, lonDibujo: lon });
  }

  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="mx-auto w-full max-w-[560px]" role="img" aria-label="Rueda de la carta astral">
      <circle cx={cx} cy={cy} r={rExt} fill="rgba(255,255,255,0.02)" stroke="rgba(217,180,90,0.5)" />
      <circle cx={cx} cy={cy} r={rSignos} fill="none" stroke="rgba(255,255,255,0.15)" />
      <circle cx={cx} cy={cy} r={rCasas} fill="none" stroke="rgba(255,255,255,0.1)" />
      <circle cx={cx} cy={cy} r={rAspectos} fill="rgba(11,7,22,0.6)" stroke="rgba(255,255,255,0.1)" />

      {/* Signos */}
      {SIGNOS.map((s, i) => {
        const ini = i * 30;
        const [x1, y1] = punto(ini, rSignos);
        const [x2, y2] = punto(ini, rExt);
        const [tx, ty] = punto(ini + 15, (rSignos + rExt) / 2);
        return (
          <g key={s.id}>
            <path d={arco(ini, ini + 30, rExt)} fill="none" stroke={COLOR_ELEMENTO[s.elemento]} strokeOpacity={0.5} strokeWidth={3} />
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.15)" />
            <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={18} fill={COLOR_ELEMENTO[s.elemento]}>
              {s.simbolo}
            </text>
          </g>
        );
      })}

      {/* Casas */}
      {mostrarCasas &&
        cuspides.map((c, i) => {
          const [x1, y1] = punto(c, rAspectos);
          const [x2, y2] = punto(c, rSignos);
          const sig = cuspides[(i + 1) % 12];
          const medio = c + (((sig - c + 360) % 360) / 2);
          const [tx, ty] = punto(medio, rAspectos + 14);
          const angular = i === 0 || i === 3 || i === 6 || i === 9;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={angular ? "rgba(217,180,90,0.8)" : "rgba(255,255,255,0.2)"} strokeWidth={angular ? 2 : 1} />
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="rgba(168,159,192,0.9)">
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* Aspectos */}
      {aspectos.map((a, i) => {
        const pa = planetas.find((p) => p.cuerpo === a.a);
        const pb = planetas.find((p) => p.cuerpo === a.b);
        if (!pa || !pb) return null;
        const [x1, y1] = punto(pa.longitud, rAspectos);
        const [x2, y2] = punto(pb.longitud, rAspectos);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={COLOR_ASPECTO[a.tipo]} strokeOpacity={0.7} strokeWidth={a.orbe < 2 ? 1.5 : 1} />;
      })}

      {/* Planetas */}
      {ajustados.map((p) => {
        const [x, y] = punto(p.lonDibujo, rPlanetas);
        const [mx, my] = punto(p.longitud, rCasas);
        const [tx, ty] = punto(p.lonDibujo, rPlanetas + 16);
        return (
          <g key={p.cuerpo}>
            <circle cx={mx} cy={my} r={2} fill="#d9b45a" />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={20} fill="#f1d99a">
              {SIMBOLOS_CUERPO[p.cuerpo]}
            </text>
            {p.retrogrado && p.cuerpo !== "nodo_norte" && (
              <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" fontSize={8} fill="#ff9f6b">
                R
              </text>
            )}
          </g>
        );
      })}

      {/* Ascendente */}
      {(() => {
        const [x, y] = punto(ascendente, rExt + 4);
        return (
          <text x={x - 14} y={y} textAnchor="end" dominantBaseline="central" fontSize={11} fill="#f1d99a">
            ASC
          </text>
        );
      })()}
    </svg>
  );
}
