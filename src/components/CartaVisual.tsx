import type { CartaTarot } from "@/lib/tarot/deck";

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const SIMBOLO_PALO: Record<string, string> = { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" };
const NOMBRE_CORTE: Record<number, string> = { 11: "Sota", 12: "Caballero", 13: "Reina", 14: "Rey" };

export function CartaVisual({ carta, invertida, posicion }: { carta: CartaTarot; invertida: boolean; posicion?: string }) {
  const etiqueta =
    carta.arcano === "mayor"
      ? ROMANOS[carta.numero]
      : carta.numero > 10
        ? NOMBRE_CORTE[carta.numero]
        : String(carta.numero);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className={`carta-tarot relative w-36 sm:w-40 ${invertida ? "invertida" : ""}`} aria-hidden>
        <div className="contenido-carta absolute inset-0 flex flex-col items-center justify-between p-3 text-center">
          <span className="font-display text-sm text-oro-suave">{etiqueta}</span>
          <div>
            <span className="block font-display text-7xl leading-none text-oro/80">
              {carta.arcano === "mayor" ? "✦" : SIMBOLO_PALO[carta.palo ?? ""]}
            </span>
          </div>
          <span className="font-display text-base font-semibold leading-tight text-texto">{carta.nombre}</span>
        </div>
      </div>
      <figcaption className="text-center">
        {posicion && <span className="block text-xs uppercase tracking-widest text-violeta-suave">{posicion}</span>}
        <span className="font-medium">{carta.nombre}</span>
        {invertida && <span className="block text-xs text-oro">invertida</span>}
      </figcaption>
    </figure>
  );
}
