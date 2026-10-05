import type { CartaTarot, Palo } from "@/lib/tarot/deck";
import type { IdMazo } from "@/lib/tarot/mazos";
import { CaraDibujada } from "./CaraDibujada";
import { CON_IMAGEN_MARSELLA } from "@/lib/tarot/imagenes-marsella";

const ROMANOS = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];
const SIMBOLO_PALO: Record<string, string> = { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" };
const PALO_POR_SIMBOLO: Record<string, Palo | undefined> = { "🜂": "bastos", "🜄": "copas", "🜁": "espadas", "🜃": "oros" };
const NOMBRE_CORTE: Record<number, string> = { 11: "Sota", 12: "Caballero", 13: "Reina", 14: "Rey" };

/** Mazos con ilustración propia por carta (public/cartas/<mazo>/<id>.webp). Marsella la tiene parcial. */
export const MAZOS_CON_IMAGEN: ReadonlySet<IdMazo> = new Set<IdMazo>(["rider", "arcana", "marsella"]);

/** ¿Existe la ilustración de esta carta en este mazo? */
export function tieneImagen(mazo: IdMazo, id: string) {
  if (mazo === "marsella") return CON_IMAGEN_MARSELLA.has(id);
  return MAZOS_CON_IMAGEN.has(mazo);
}

/** Ruta de la ilustración real de la carta, si el mazo la tiene. */
export function imagenCarta(carta: CartaTarot, mazo: IdMazo = "rider") {
  return tieneImagen(mazo, carta.id) ? `/cartas/${mazo}/${carta.id}.webp` : undefined;
}

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
  imagen,
}: {
  nombre: string;
  etiqueta: string;
  simbolo: string;
  invertida: boolean;
  compacta?: boolean;
  estilo?: "rider" | "marsella" | "angeles" | "arcana";
  /** Número del arcano menor (pips o rango); 1 en los mayores. */
  repeticiones?: number;
  /** Ilustración real de la carta; si existe, reemplaza el dibujo con símbolos. */
  imagen?: string;
}) {
  if (imagen) {
    return (
      <div className={`carta-tarot con-imagen estilo-${estilo} relative w-full ${invertida ? "invertida" : ""}`} aria-hidden>
        <div className="contenido-carta absolute inset-0 overflow-hidden rounded-[0.8rem]">
          {/* eslint-disable-next-line @next/next/no-img-element -- ilustración estática del mazo, ya optimizada en WebP */}
          <img src={imagen} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      </div>
    );
  }
  // Sin ilustración: cara dibujada en SVG (marco, numeral, pips o sello).
  const palo = PALO_POR_SIMBOLO[simbolo];
  const arcano: "mayor" | "menor" = palo ? "menor" : "mayor";
  void compacta;
  return (
    <div className={`carta-tarot estilo-${estilo} relative w-full ${invertida ? "invertida" : ""}`} aria-hidden>
      <div className="contenido-carta absolute inset-0 overflow-hidden rounded-[0.8rem]">
        <CaraDibujada nombre={nombre} etiqueta={etiqueta} estilo={estilo} arcano={arcano} numero={repeticiones} palo={palo} />
      </div>
    </div>
  );
}

export function CartaVisual({ carta, invertida, posicion, mazo = "rider" }: { carta: CartaTarot; invertida: boolean; posicion?: string; mazo?: IdMazo }) {
  const { etiqueta, simbolo } = rotuloCarta(carta, mazo);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div className="w-36 sm:w-40">
        <CaraCarta nombre={carta.nombre} etiqueta={etiqueta} simbolo={simbolo} invertida={invertida} estilo={mazo} repeticiones={carta.arcano === "menor" ? carta.numero : 1} imagen={imagenCarta(carta, mazo)} />
      </div>
      <figcaption className="text-center">
        {posicion && <span className="block text-xs uppercase tracking-widest text-violeta-suave">{posicion}</span>}
        <span className="font-medium">{carta.nombre}</span>
      </figcaption>
    </figure>
  );
}
