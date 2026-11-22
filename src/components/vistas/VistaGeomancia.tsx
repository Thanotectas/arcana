import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { esResultadoGeomancia } from "@/lib/geomancia/calculo";
import { figuraPorId, puntosDe, type IdFigura } from "@/lib/geomancia/figuras";
import { TEXTOS_GEOMANCIA } from "@/lib/geomancia/textos";
import { EscudoGeomantico, FiguraPuntos } from "@/components/geomancia/GraficosGeomancia";

const ROMANOS = ["I", "II", "III", "IV"];

function TarjetaFigura({ id, rol, idioma, destacada = false, puntos }: { id: IdFigura; rol: string; idioma: Idioma; destacada?: boolean; puntos?: string }) {
  const f = figuraPorId(id);
  if (!f) return null;
  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${destacada ? "border-violeta/50 bg-violeta/10" : "border-borde bg-superficie-2/50"}`}>
      <FiguraPuntos id={id} className={destacada ? "h-20 w-14 shrink-0" : "h-14 w-10 shrink-0"} color={destacada ? "#ffe7a8" : "#f1d99a"} />
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-widest text-violeta-suave">{rol}</p>
        <p className={`font-display font-semibold leading-tight text-oro-suave ${destacada ? "text-2xl" : "text-lg"}`}>{f.nombre[idioma]}</p>
        <p className="text-xs text-texto-suave">
          <span className="italic">{f.latin}</span>
          {idioma !== "ar" && (
            <>
              {" · "}
              <span lang="ar" dir="rtl">{f.arabe}</span>
            </>
          )}
          {puntos ? ` · ${puntos}` : ""}
        </p>
        <p className="mt-0.5 text-xs text-texto">{f.clave[idioma]}</p>
      </div>
    </div>
  );
}

/** Resultado guardado de la geomancia: la pregunta, el escudo dibujado y las figuras con sus nombres. */
export function VistaGeomancia({ entrada, resultado, idioma }: { entrada: Record<string, unknown>; resultado: Record<string, unknown>; idioma: Idioma }) {
  if (!esResultadoGeomancia(resultado)) return null;
  const r = resultado;
  const t = TEXTOS_GEOMANCIA[idioma];
  const pregunta = typeof entrada.pregunta === "string" ? entrada.pregunta : "";
  const puntosJuez = plantilla(t.puntos, { n: puntosDe(figuraPorId(r.juez)!.filas) });

  return (
    <section className="space-y-4">
      {pregunta && (
        <div className="tarjeta p-5 sm:p-6">
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.tuPregunta}</p>
          <p className="mt-1 font-display text-xl text-texto">{pregunta}</p>
        </div>
      )}

      <div className="tarjeta space-y-3 p-4 sm:p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-violeta-suave">{t.escudo}</p>
          <p className="mt-1 text-sm text-texto-suave">{t.escudoNota}</p>
        </div>
        <div className="mx-auto max-w-2xl" dir="ltr">
          <EscudoGeomantico r={r} t={t} idioma={idioma} />
        </div>
      </div>

      <div className="tarjeta space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-3">
            <TarjetaFigura id={r.juez} rol={t.juez} idioma={idioma} destacada puntos={puntosJuez} />
          </div>
          <TarjetaFigura id={r.testigoDerecho} rol={t.testigoDerecho} idioma={idioma} />
          <TarjetaFigura id={r.testigoIzquierdo} rol={t.testigoIzquierdo} idioma={idioma} />
          <TarjetaFigura id={r.reconciliador} rol={t.reconciliador} idioma={idioma} />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{t.todasLasFiguras}</p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {r.madres.map((id, i) => (
              <TarjetaFigura key={`m${i}`} id={id} rol={plantilla(t.madre, { n: ROMANOS[i] })} idioma={idioma} />
            ))}
            {r.hijas.map((id, i) => (
              <TarjetaFigura key={`h${i}`} id={id} rol={plantilla(t.hija, { n: ROMANOS[i] })} idioma={idioma} />
            ))}
            {r.sobrinas.map((id, i) => (
              <TarjetaFigura key={`s${i}`} id={id} rol={plantilla(t.sobrina, { n: ROMANOS[i] })} idioma={idioma} />
            ))}
          </div>
        </div>

        {r.repetidas?.length > 0 && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-violeta-suave">{t.repetidas}</p>
            <ul className="flex flex-wrap gap-2">
              {r.repetidas.map((x) => (
                <li key={x.id} className="flex items-center gap-1.5 rounded-full border border-borde bg-superficie-2/60 py-1 pe-3 ps-1.5 text-sm">
                  <FiguraPuntos id={x.id} className="h-7 w-5" />
                  <span>{figuraPorId(x.id)?.nombre[idioma]}</span>
                  <span className="text-oro-suave">{plantilla(t.repetidaVeces, { n: x.veces })}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
