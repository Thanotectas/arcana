import { SIMBOLO_REDONDO } from "@/lib/marca/simbolo";

const SIMBOLO_HTML = SIMBOLO_REDONDO.replace("<svg ", '<svg width="100%" height="100%" ');

/**
 * Marca de Arcana: estrella de cuatro puntas facetada en oro dentro de un aro
 * con las 12 divisiones del zodiaco, sobre un aura violeta. Se usa en el
 * encabezado; el dibujo vive en src/lib/marca/simbolo.ts.
 */
export function Marca({ tamano = 28, className = "" }: { tamano?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 ${className}`}
      style={{ width: tamano, height: tamano }}
      // Dibujo fijo del repositorio (sin datos de usuario).
      dangerouslySetInnerHTML={{ __html: SIMBOLO_HTML }}
    />
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
