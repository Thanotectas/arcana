import Image from "next/image";

/**
 * Portada ilustrada de cada producto (public/portadas/<archivo>.webp, 16:9). Solo se muestra la que ya existe:
 * al agregar una imagen nueva, se suma aquí su clave.
 */
const PORTADAS: Record<string, string> = {
  kundli: "kundli",
  "kundli-milan": "kundli-milan",
  weton: "weton",
  // Mientras llega su propia ilustración, la compatibilidad por weton usa la del weton.
  "weton-jodoh": "weton",
};

export function PortadaProducto({ clave, prioridad = true }: { clave: string; prioridad?: boolean }) {
  const archivo = PORTADAS[clave];
  if (!archivo) return null;
  return (
    <div className="relative -mx-4 aspect-[16/9] overflow-hidden sm:mx-0 sm:rounded-3xl sm:border sm:border-oro/20 sm:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <Image src={`/portadas/${archivo}.webp`} alt="" fill priority={prioridad} sizes="(max-width: 768px) 100vw, 672px" className="aparecer object-cover" />
      {/* Fundido hacia el fondo de la página para que el título de abajo entre suave. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-noche to-transparent" aria-hidden />
    </div>
  );
}

export function tienePortada(clave: string) {
  return Boolean(PORTADAS[clave]);
}
