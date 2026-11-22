import type { CSSProperties, ReactNode } from "react";

/**
 * Disposición del tirage en croix: 1 «pour» a un lado, 2 «contre» al otro, 3 «jugement» arriba, 4 «issue» abajo
 * y 5 «synthèse» en el centro. La rejilla sigue la dirección del texto (en árabe, «pour» queda a la derecha).
 */
const CELDAS: { col: number; fila: number }[] = [
  { col: 1, fila: 2 }, // 1 pour
  { col: 3, fila: 2 }, // 2 contre
  { col: 2, fila: 1 }, // 3 jugement
  { col: 2, fila: 3 }, // 4 issue
  { col: 2, fila: 2 }, // 5 synthèse
];

export function CruzMarsella({ ancho = "clamp(76px, 24vw, 132px)", children }: { ancho?: string; children: (i: number) => ReactNode }) {
  return (
    <div className="mx-auto grid w-max items-start justify-center gap-x-3 gap-y-4 sm:gap-x-6" style={{ gridTemplateColumns: `repeat(3, ${ancho})` } as CSSProperties}>
      {CELDAS.map((c, i) => (
        <div key={i} className="flex flex-col items-center" style={{ gridColumn: c.col, gridRow: c.fila }}>
          {children(i)}
        </div>
      ))}
    </div>
  );
}
