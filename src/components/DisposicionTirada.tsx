import type { CSSProperties, ReactNode } from "react";

/**
 * Coloca las cartas de una tirada. La Cruz Celta sigue la disposición
 * clásica: la cruz (1 a 6, con la 2 atravesada sobre la 1) y el báculo
 * (7 a 10) de abajo hacia arriba a la derecha.
 */
const CELTA: { col: number; fila: string; cruzada?: boolean }[] = [
  { col: 2, fila: "2 / span 2" }, // 1 La situación
  { col: 2, fila: "2 / span 2", cruzada: true }, // 2 El desafío
  { col: 2, fila: "4" }, // 3 La raíz
  { col: 1, fila: "2 / span 2" }, // 4 El pasado
  { col: 2, fila: "1" }, // 5 Lo consciente
  { col: 3, fila: "2 / span 2" }, // 6 El futuro cercano
  { col: 5, fila: "4" }, // 7 Tú
  { col: 5, fila: "3" }, // 8 El entorno
  { col: 5, fila: "2" }, // 9 Esperanzas y temores
  { col: 5, fila: "1" }, // 10 El resultado
];

export function DisposicionTirada({
  total,
  children,
}: {
  total: number;
  /** Dibuja la posición i (0 = primera carta de la tirada). */
  children: (i: number) => ReactNode;
}) {
  const indices = Array.from({ length: total }, (_, i) => i);

  if (total === 10) {
    const ancho = "clamp(48px, 13vw, 84px)";
    return (
      <div
        className="mx-auto grid items-center justify-center gap-x-2 gap-y-3"
        style={{ gridTemplateColumns: `repeat(3, ${ancho}) 16px ${ancho}`, "--ancho-carta": ancho } as CSSProperties}
      >
        {indices.map((i) => {
          const c = CELTA[i];
          return (
            <div
              key={i}
              className="flex justify-center"
              style={{
                gridColumn: c.col,
                gridRow: c.fila,
                width: ancho,
                zIndex: c.cruzada ? 2 : 1,
                transform: c.cruzada ? "rotate(90deg) scale(0.92)" : undefined,
              }}
            >
              {children(i)}
            </div>
          );
        })}
      </div>
    );
  }

  const ancho = total === 1 ? "clamp(140px, 42vw, 180px)" : "clamp(88px, 26vw, 150px)";
  return (
    <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6" style={{ "--ancho-carta": ancho } as CSSProperties}>
      {indices.map((i) => (
        <div key={i} style={{ width: ancho }}>
          {children(i)}
        </div>
      ))}
    </div>
  );
}
