import { ArrowRight } from "lucide-react";
import { HexagramaVisual } from "./HexagramaVisual";
import { hexagramaPorNumero, esYang, SIMBOLO_TRIGRAMA, type ResultadoIChing, type Hexagrama } from "@/lib/iching";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { plantilla } from "@/lib/i18n/formato";

/**
 * Resultado del I Ching: el hexagrama presente y, si hay líneas mutantes,
 * hacia cuál se mueve, con una flecha entre los dos. Cada uno con su
 * carácter grande de fondo, los dos trigramas («Agua sobre Cielo»), sus
 * palabras clave, el Juicio y la Imagen.
 */
export function VistaIChing({ resultado, t }: { resultado: ResultadoIChing; t: Diccionario }) {
  const presente = hexagramaPorNumero(resultado.presente);
  const futuro = resultado.futuro ? hexagramaPorNumero(resultado.futuro) : null;
  if (!presente) return null;
  const lineas = resultado.valores.map((v) => (esYang(v) ? 1 : 0)) as (0 | 1)[];
  return (
    <section className="space-y-4">
      <div className={`grid items-stretch gap-4 ${futuro ? "md:grid-cols-[1fr_auto_1fr]" : ""}`}>
        <Bloque h={presente} titulo={t.iching.presente} lineas={lineas} mutantes={resultado.mutantes} valores={resultado.valores} t={t} />
        {futuro && (
          <>
            <div className="flex flex-col items-center justify-center gap-1 text-center text-oro-suave">
              <ArrowRight className="hidden h-8 w-8 md:block" aria-hidden />
              <ArrowRight className="h-7 w-7 rotate-90 md:hidden" aria-hidden />
              <span className="max-w-[7rem] text-[11px] uppercase tracking-[0.2em] text-texto-suave">{t.iching.seConvierte}</span>
            </div>
            <Bloque h={futuro} titulo={t.iching.futuro} lineas={futuro.lineas} mutantes={[]} t={t} />
          </>
        )}
      </div>
      {resultado.mutantes.length > 0 ? (
        <p className="text-center text-sm text-texto-suave">
          {t.iching.lineasQueCambian}: {resultado.mutantes.map((i) => i + 1).join(", ")} <span className="text-xs">(○ yang · ✕ yin)</span>
        </p>
      ) : (
        <p className="text-center text-sm text-texto-suave">{t.iching.sinMutantes}</p>
      )}
    </section>
  );
}

function Bloque({ h, titulo, lineas, mutantes, valores, t }: { h: Hexagrama; titulo: string; lineas: (0 | 1)[]; mutantes: number[]; valores?: ResultadoIChing["valores"]; t: Diccionario }) {
  const trigramas = t.iching.trigramas as Record<string, string>;
  return (
    <div className="tarjeta relative flex flex-col items-center gap-3 overflow-hidden p-5 text-center">
      {/* El carácter del hexagrama, grande y tenue, de fondo */}
      <span className="pointer-events-none absolute -right-4 -top-6 select-none font-serif text-[10rem] leading-none text-oro/[0.06]" aria-hidden>
        {h.chino}
      </span>
      <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{titulo}</p>
      <div className="flex items-center gap-4">
        <HexagramaVisual lineas={lineas} mutantes={mutantes} valores={valores} tamano={110} animado />
        <div className="flex flex-col gap-3 text-left text-xs text-texto-suave">
          <span>
            <span className="text-2xl text-oro-suave">{`${SIMBOLO_TRIGRAMA[h.trigramaSuperior]}︎`}</span> {trigramas[h.trigramaSuperior]}
          </span>
          <span>
            <span className="text-2xl text-violeta-suave">{`${SIMBOLO_TRIGRAMA[h.trigramaInferior]}︎`}</span> {trigramas[h.trigramaInferior]}
          </span>
        </div>
      </div>
      <div>
        <p className="font-display text-3xl leading-tight text-oro-suave">
          {h.numero}. {h.nombre}
        </p>
        <p className="mt-0.5 text-sm text-texto-suave">
          <span className="font-serif text-base text-texto">{h.chino}</span> · {h.pinyin} · {plantilla(t.iching.sobre, { a: trigramas[h.trigramaSuperior], b: trigramas[h.trigramaInferior] })}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {h.palabrasClave.map((p) => (
          <span key={p} className="rounded-full border border-oro/30 px-2.5 py-0.5 text-xs text-oro-suave">
            {p}
          </span>
        ))}
      </div>
      <dl className="w-full space-y-2 border-t border-borde pt-3 text-left text-sm">
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-violeta-suave">{t.iching.juicio}</dt>
          <dd className="mt-0.5 leading-relaxed text-texto">{h.juicio}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-[0.2em] text-violeta-suave">{t.iching.imagen}</dt>
          <dd className="mt-0.5 leading-relaxed text-texto-suave">{h.imagen}</dd>
        </div>
      </dl>
    </div>
  );
}
