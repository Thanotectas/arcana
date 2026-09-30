import type { CartaTarot } from "@/lib/tarot/deck";
import type { IdMazo } from "@/lib/tarot/mazos";

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const SIMBOLO_PALO: Record<string, string> = { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" };
const NOMBRE_CORTE: Record<number, string> = { 11: "Sota", 12: "Caballero", 13: "Reina", 14: "Rey" };

/** Número o rango que va arriba de la carta y símbolo central. */
export function rotuloCarta(carta: CartaTarot, mazo: IdMazo = "rider") {
  if (mazo === "angeles") {
    return { etiqueta: String(carta.numero), simbolo: "✧" };
  }
  const etiqueta =
    carta.arcano === "mayor"
      ? ROMANOS[carta.numero] ?? String(carta.numero)
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
  estilo = "rider",
  repeticiones = 1,
}: {
  nombre: string;
  etiqueta: string;
  simbolo: string;
  invertida: boolean;
  compacta?: boolean;
  estilo?: "rider" | "marsella" | "angeles";
  /** En Marsella, los arcanos menores muestran tantos símbolos como su número. */
  repeticiones?: number;
}) {
  const pips = estilo === "marsella" && repeticiones > 1 && repeticiones <= 10;
  return (
    <div className={`carta-tarot estilo-${estilo} relative w-full ${invertida ? "invertida" : ""}`} aria-hidden>
      <div className={`contenido-carta absolute inset-0 flex flex-col items-center justify-between text-center ${compacta ? "p-1.5" : "p-3"}`}>
        <span className={`font-display text-oro-suave ${compacta ? "text-[10px]" : "text-sm"}`}>{etiqueta}</span>
        {pips ? (
          <span className={`grid gap-0.5 font-display leading-none text-oro/80 ${repeticiones > 4 ? "grid-cols-2" : "grid-cols-1"} ${compacta ? "text-sm" : "text-2xl"}`}>
            {Array.from({ length: repeticiones }, (_, i) => (
              <span key={i}>{simbolo}</span>
            ))}
          </span>
        ) : (
          <span className={`block font-display leading-none text-oro/80 ${compacta ? "text-3xl" : "text-7xl"}`}>{simbolo}</span>
        )}
        <span className={`font-display font-semibold leading-tight text-texto ${compacta ? "text-[10px]" : "text-base"}`}>{nombre}</span>
      </div>
    </div>
  );
}

export function CartaVisual({ carta, invertida, posicion, mazo = "rider" }: { carta: CartaTarot; invertida: boolean; posicion?: string; mazo?: IdMazo }) {
  const { etiqueta, simbolo } = rotuloCarta(carta, mazo);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="w-36 sm:w-40">
        <CaraCarta nombre={carta.nombre} etiqueta={etiqueta} simbolo={simbolo} invertida={invertida} estilo={mazo} repeticiones={carta.arcano === "menor" ? carta.numero : 1} />
      </div>
      <figcaption className="text-center">
        {posicion && <span className="block text-xs uppercase tracking-widest text-violeta-suave">{posicion}</span>}
        <span className="font-medium">{carta.nombre}</span>
      </figcaption>
    </figure>
  );
}
