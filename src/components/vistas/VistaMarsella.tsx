import type { Idioma } from "@/lib/i18n/idiomas";
import { arcanoMarsella, nombreArcano } from "@/lib/marsella/mazo";
import { leerResultadoMarsella } from "@/lib/marsella/tirada";
import { TEXTOS_MARSELLA } from "@/lib/marsella/textos";
import { CartaMarsella } from "@/components/marsella/CartaMarsella";
import { CruzMarsella } from "@/components/marsella/CruzMarsella";

/** La cruz de Marsella de una lectura: las cuatro láminas elegidas y la de síntesis en el centro, con su cálculo. */
export function VistaMarsella({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  const r = leerResultadoMarsella(resultado);
  if (!r) return null;
  const textos = TEXTOS_MARSELLA[idioma];
  const pregunta = typeof entrada.pregunta === "string" ? entrada.pregunta : "";
  const ids = [...r.cartas.map((c) => c.id), r.sintesis.id];
  const numeros = r.cartas.map((c) => arcanoMarsella(c.id)?.numero ?? 0);
  const [antes, despues = ""] = textos.vista.calculo.split("{suma}");
  const calculo = `${numeros.join(" + ")} = ${r.sintesis.suma}${r.sintesis.pasos.length > 1 ? ` → ${r.sintesis.pasos.slice(1).join(" → ")}` : ""}`;

  return (
    <section className="tarjeta space-y-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{textos.seccion} · {textos.vista.titulo}</p>
        {pregunta && (
          <p className="mt-2 text-sm text-texto-suave">
            <span className="text-oro-suave">{textos.vista.tuPregunta}:</span> {pregunta}
          </p>
        )}
      </div>
      <CruzMarsella>
        {(i) => {
          const id = ids[i];
          const nombre = nombreArcano(id, idioma);
          const posicion = textos.posiciones[i];
          return (
            <figure className="flex w-full flex-col items-center gap-1.5 text-center">
              <CartaMarsella id={id} alt={`${posicion.nombre}: ${nombre}`} className={i === 4 ? "ring-2 ring-oro/70 ring-offset-2 ring-offset-noche" : ""} />
              <figcaption className="space-y-0.5">
                <span className="block text-[11px] uppercase tracking-widest text-violeta-suave">{posicion.nombre}</span>
                <span className="block text-xs font-semibold sm:text-sm">{nombre}</span>
              </figcaption>
            </figure>
          );
        }}
      </CruzMarsella>
      <p className="text-center text-sm text-texto-suave">
        <span className="text-oro-suave">
          {antes}
          <bdi dir="ltr">{calculo}</bdi>
          {despues}
        </span>{" "}
        · {nombreArcano(r.sintesis.id, idioma)}
      </p>
    </section>
  );
}
