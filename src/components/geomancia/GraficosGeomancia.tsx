import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { figuraPorId, type Filas, type IdFigura } from "@/lib/geomancia/figuras";
import type { ResultadoGeomancia } from "@/lib/geomancia/calculo";
import type { TextosGeomancia } from "@/lib/geomancia/textos";

const ORO = "#f1d99a";
const VIOLETA = "#b7a5ff";
const ROMANOS = ["I", "II", "III", "IV"];

/** Puntos de una figura dentro de un <svg>: cuatro filas centradas en (cx, cy). */
function PuntosSVG({ filas, cx, cy, escala = 1, color = ORO }: { filas: Filas; cx: number; cy: number; escala?: number; color?: string }) {
  const paso = 15 * escala;
  const separacion = 9 * escala;
  const r = 4.2 * escala;
  return (
    <g>
      {filas.map((p, i) => {
        const y = cy + (i - 1.5) * paso;
        return p === 1 ? (
          <circle key={i} cx={cx} cy={y} r={r} fill={color} />
        ) : (
          <g key={i}>
            <circle cx={cx - separacion} cy={y} r={r} fill={color} />
            <circle cx={cx + separacion} cy={y} r={r} fill={color} />
          </g>
        );
      })}
    </g>
  );
}

/** Una figura suelta (para las tarjetas). */
export function FiguraPuntos({ id, className = "h-14 w-10", color = ORO }: { id: IdFigura; className?: string; color?: string }) {
  const f = figuraPorId(id);
  if (!f) return null;
  return (
    <svg viewBox="0 0 40 70" className={className} aria-hidden>
      <PuntosSVG filas={f.filas} cx={20} cy={35} escala={1.05} color={color} />
    </svg>
  );
}

/** Nombre corto para el escudo: sin lo que va entre paréntesis. */
function corto(nombre: string) {
  return nombre.replace(/\s*\(.*\)\s*$/, "");
}

function Celda({ id, cx, cy, rol, idioma, ancho, escala = 1, destacada = false }: { id: IdFigura; cx: number; cy: number; rol: string; idioma: Idioma; ancho: number; escala?: number; destacada?: boolean }) {
  const f = figuraPorId(id)!;
  const nombre = corto(f.nombre[idioma]);
  const tamano = 12 * Math.min(escala, 1.3);
  // Si el nombre no cabe en la celda, se comprime para que no se salga.
  const largo = nombre.length * tamano * 0.55 > ancho - 10;
  return (
    <g>
      <text x={cx} y={cy - 46 * escala} textAnchor="middle" fontSize={10 * Math.min(escala, 1.2)} fill={VIOLETA} letterSpacing="1.2" style={{ textTransform: "uppercase" }}>
        {rol}
      </text>
      {destacada && <circle cx={cx} cy={cy} r={40 * escala} fill="url(#geo-halo)" />}
      <PuntosSVG filas={f.filas} cx={cx} cy={cy} escala={escala} color={destacada ? "#ffe7a8" : ORO} />
      <text
        x={cx}
        y={cy + 47 * escala}
        textAnchor="middle"
        fontSize={tamano}
        fill="#ece6f7"
        {...(largo ? { textLength: ancho - 12, lengthAdjust: "spacingAndGlyphs" } : {})}
      >
        {nombre}
      </text>
    </g>
  );
}

/**
 * El escudo geomántico: arriba las ocho figuras madres e hijas (de derecha a izquierda: Madres I–IV, luego Hijas I–IV),
 * debajo las cuatro Sobrinas, los dos Testigos y el Juez en la punta. El dibujo es fijo (izquierda a derecha en
 * coordenadas) también en árabe, como se traza el escudo.
 */
export function EscudoGeomantico({ r, t, idioma }: { r: ResultadoGeomancia; t: TextosGeomancia; idioma: Idioma }) {
  const contorno = "M8,8 H792 V330 C792,520 560,640 400,700 C240,640 8,520 8,330 Z";
  // Fila superior: de izquierda a derecha Hija IV … Hija I, Madre IV … Madre I.
  const arriba = [
    ...[3, 2, 1, 0].map((i) => ({ id: r.hijas[i], rol: plantilla(t.hija, { n: ROMANOS[i] }) })),
    ...[3, 2, 1, 0].map((i) => ({ id: r.madres[i], rol: plantilla(t.madre, { n: ROMANOS[i] }) })),
  ];
  const sobrinas = [3, 2, 1, 0].map((i) => ({ id: r.sobrinas[i], rol: plantilla(t.sobrina, { n: ROMANOS[i] }) }));
  return (
    // En el teléfono el escudo conserva un ancho legible y se desliza de lado; empieza por la derecha (las Madres),
    // porque el escudo se lee de derecha a izquierda (dir="rtl" solo en el contenedor del desplazamiento).
    <div dir="rtl" className="-mx-2 overflow-x-auto px-2">
    <svg style={{ direction: "ltr" }} viewBox="0 0 800 712" className="h-auto w-full min-w-[580px] sm:min-w-0" role="img" aria-label={t.escudo}>
      <defs>
        <clipPath id="geo-escudo">
          <path d={contorno} />
        </clipPath>
        <radialGradient id="geo-halo">
          <stop offset="0%" stopColor="#8b6cf6" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#8b6cf6" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="geo-fondo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d1633" />
          <stop offset="100%" stopColor="#150f26" />
        </linearGradient>
      </defs>
      <path d={contorno} fill="url(#geo-fondo)" stroke="rgba(241,217,154,0.45)" strokeWidth="2" />
      <g clipPath="url(#geo-escudo)" stroke="rgba(241,217,154,0.18)" strokeWidth="1.2">
        <line x1="0" y1="178" x2="800" y2="178" />
        <line x1="0" y1="338" x2="800" y2="338" />
        <line x1="0" y1="494" x2="800" y2="494" />
        {[100, 200, 300, 500, 600, 700].map((x) => (
          <line key={x} x1={x} y1="8" x2={x} y2="178" />
        ))}
        <line x1="400" y1="8" x2="400" y2="494" stroke="rgba(241,217,154,0.32)" />
        {[200, 600].map((x) => (
          <line key={x} x1={x} y1="178" x2={x} y2="338" />
        ))}
      </g>
            {arriba.map((c, k) => (
        <Celda key={`a${k}`} id={c.id} cx={50 + k * 100} cy={98} rol={c.rol} idioma={idioma} ancho={100} />
      ))}
      {sobrinas.map((c, k) => (
        <Celda key={`s${k}`} id={c.id} cx={100 + k * 200} cy={262} rol={c.rol} idioma={idioma} ancho={200} escala={1.1} />
      ))}
      <Celda id={r.testigoIzquierdo} cx={230} cy={420} rol={t.testigoIzquierdo} idioma={idioma} ancho={300} escala={1.15} />
      <Celda id={r.testigoDerecho} cx={570} cy={420} rol={t.testigoDerecho} idioma={idioma} ancho={300} escala={1.15} />
      <Celda id={r.juez} cx={400} cy={590} rol={t.juez} idioma={idioma} ancho={300} escala={1.35} destacada />
    </svg>
    </div>
  );
}
