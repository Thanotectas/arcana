import type { CartaTarot } from "@/lib/tarot/deck";

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const SIMBOLO_PALO: Record<string, string> = { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" };
const NOMBRE_CORTE: Record<number, string> = { 11: "Sota", 12: "Caballero", 13: "Reina", 14: "Rey" };

/** Número o rango que va arriba de la carta y símbolo central. */
export function rotuloCarta(carta: CartaTarot) {
  const etiqueta =
    carta.arcano === "mayor"
      ? ROMANOS[carta.numero]
      : carta.numero > 10
        ? NOMBRE_CORTE[carta.numero]
        : String(carta.numero);
  const simbolo = carta.arcano === "mayor" ? "✦" : SIMBOLO_PALO[carta.palo ?? ""];
  return { etiqueta, simbolo };
}

/** Cara de la carta, sin pie. Ocupa todo el ancho de su contenedor. */
export function CaraCarta({
  nombre,
  etiqueta,
  simbolo,
  invertida,
  compacta = false,
}: {
  nombre: string;
  etiqueta: string;
  simbolo: string;
  invertida: boolean;
  compacta?: boolean;
}) {
  return (
    <div className={`carta-tarot relative w-full ${invertida ? "invertida" : ""}`} aria-hidden>
      <div className={`contenido-carta absolute inset-0 flex flex-col items-center justify-between text-center ${compacta ? "p-1.5" : "p-3"}`}>
        <span className={`font-display text-oro-suave ${compacta ? "text-[10px]" : "text-sm"}`}>{etiqueta}</span>
        <span className={`block font-display leading-none text-oro/80 ${compacta ? "text-3xl" : "text-7xl"}`}>{simbolo}</span>
        <span className={`font-display font-semibold leading-tight text-texto ${compacta ? "text-[10px]" : "text-base"}`}>{nombre}</span>
      </div>
    </div>
  );
}

export function CartaVisual({ carta, invertida, posicion }: { carta: CartaTarot; invertida: boolean; posicion?: string }) {
  const { etiqueta, simbolo } = rotuloCarta(carta);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="w-36 sm:w-40">
        <CaraCarta nombre={carta.nombre} etiqueta={etiqueta} simbolo={simbolo} invertida={invertida} />
      </div>
      <figcaption className="text-center">
        {posicion && <span className="block text-xs uppercase tracking-widest text-violeta-suave">{posicion}</span>}
        <span className="font-medium">{carta.nombre}</span>
        {invertida && <span className="block text-xs text-oro">invertida</span>}
      </figcaption>
    </figure>
  );
}
