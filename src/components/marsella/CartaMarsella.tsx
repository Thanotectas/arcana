import { arcanoMarsella, romanoMarsella } from "@/lib/marsella/mazo";

/**
 * Cara de una lámina de Marsella como en los mazos históricos: cartela de arriba con la cifra romana aditiva
 * (IIII, VIIII…), la ilustración en el centro y cartela de abajo con el nombre francés. El XIII no lleva nombre
 * y Le Mat no lleva número. La ilustración es la del mazo propio de Arcana (public/cartas/marsella).
 * Sin hooks: sirve en componentes de servidor y de cliente. Ancho lo da el contenedor; proporción 5:9.
 */
export function CartaMarsella({ id, alt, className = "" }: { id: string; alt: string; className?: string }) {
  const a = arcanoMarsella(id);
  if (!a) return null;
  const romano = romanoMarsella(a.numero);
  const tamNombre = Math.min(9, 140 / Math.max(a.cartela.length, 1));
  return (
    <div
      className={`relative flex aspect-[5/9] w-full flex-col overflow-hidden rounded-[7%/4%] border border-[#6b4a1f] bg-gradient-to-b from-[#f6ead0] to-[#ead8b0] text-[#2a1a10] shadow-[0_12px_24px_rgba(0,0,0,0.45)] [container-type:inline-size] ${className}`}
      role="img"
      aria-label={alt}
    >
      <div className="flex h-[11%] items-center justify-center font-display font-semibold tracking-[0.12em]" style={{ fontSize: "11cqw" }} aria-hidden>
        {romano}
      </div>
      <div className="relative mx-[6%] h-[78%] overflow-hidden border border-[#2a1a10]/70">
        {/* eslint-disable-next-line @next/next/no-img-element -- ilustración estática del mazo */}
        <img src={`/cartas/marsella/${a.ilustracion}.webp`} alt="" width={500} height={750} loading="lazy" className="h-full w-full scale-[1.12] object-cover" />
      </div>
      <div className="flex h-[11%] items-center justify-center whitespace-nowrap px-[4%] font-display font-semibold uppercase tracking-[0.04em]" style={{ fontSize: `${tamNombre}cqw` }} aria-hidden>
        {a.cartela}
      </div>
    </div>
  );
}
