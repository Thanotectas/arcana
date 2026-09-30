/**
 * Marca de Arcana: estrella de ocho puntas dentro de un anillo, con una luna
 * creciente que lo abraza. Oro sobre noche. Se usa en el encabezado, el
 * favicon y las imágenes de vista previa.
 */
export function Marca({ tamano = 28, className = "" }: { tamano?: number; className?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={tamano} height={tamano} className={className} aria-hidden>
      <defs>
        <linearGradient id="oroMarca" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d99a" />
          <stop offset="1" stopColor="#c99a3a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="29" fill="none" stroke="url(#oroMarca)" strokeWidth="2" />
      <path d="M32 3a29 29 0 0 0 0 58 23 23 0 0 1 0-58z" fill="url(#oroMarca)" opacity="0.18" />
      <path
        d="M32 12l3.2 14.8L50 32l-14.8 5.2L32 52l-3.2-14.8L14 32l14.8-5.2z"
        fill="url(#oroMarca)"
      />
      <path d="M32 22l1.3 8.7L42 32l-8.7 1.3L32 42l-1.3-8.7L22 32l8.7-1.3z" fill="#0b0716" opacity="0.55" />
      <circle cx="49" cy="15" r="1.6" fill="#f1d99a" />
      <circle cx="53" cy="47" r="1.2" fill="#f1d99a" />
      <circle cx="13" cy="50" r="1" fill="#f1d99a" />
    </svg>
  );
}

export function Logotipo({ tamano = 28 }: { tamano?: number }) {
  return (
    <span className="flex items-center gap-2">
      <Marca tamano={tamano} />
      <span className="font-display text-2xl font-semibold tracking-wide text-oro-suave">Arcana</span>
    </span>
  );
}
