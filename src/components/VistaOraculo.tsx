import { TIRADAS_BARAJA, cartaEspanola, nombreCartaEspanola } from "@/lib/oraculos/baraja";
import { TIRADAS_LENORMAND, cartaLenormand, LENORMAND_CON_IMAGEN } from "@/lib/oraculos/lenormand";
import { TIRADAS_RUNAS, runaPorId } from "@/lib/oraculos/runas";
import { tiradaPorId, type ResultadoOraculo } from "@/lib/oraculos/comun";
import type { Idioma } from "@/lib/i18n/idiomas";


/** Las piezas que salieron en una lectura de baraja española, Lenormand o runas. */
export function VistaOraculo({ tipo, resultado, idioma, titulo, invertida }: { tipo: "baraja_espanola" | "lenormand" | "runas"; resultado: ResultadoOraculo; idioma: Idioma; titulo: string; invertida: string }) {
  const tiradas = tipo === "baraja_espanola" ? TIRADAS_BARAJA : tipo === "lenormand" ? TIRADAS_LENORMAND : TIRADAS_RUNAS;
  const tirada = tiradaPorId(tiradas, resultado.tirada) ?? tiradas[0];
  return (
    <section className="tarjeta p-6">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-violeta-suave">{titulo} · {tirada.nombre[idioma]}</p>
      <ol
        className={`flex flex-wrap justify-center gap-4 ${tipo === "runas" ? "rounded-2xl bg-cover bg-center px-3 py-6 shadow-inner" : ""}`}
        style={tipo === "runas" ? { backgroundImage: "linear-gradient(rgba(11,7,22,0.25), rgba(11,7,22,0.45)), url(/runas/pano.webp)" } : undefined}
      >
        {(resultado.piezas ?? []).map((p) => {
          const posicion = tirada.posiciones[p.posicion]?.nombre[idioma] ?? "";
          return (
            <li key={p.posicion} className="flex w-28 flex-col items-center gap-2 text-center sm:w-32">
              {tipo === "runas" ? <PiezaRuna id={p.id} invertida={p.invertida} /> : tipo === "lenormand" ? <PiezaLenormand id={p.id} idioma={idioma} /> : <PiezaEspanola id={p.id} invertida={p.invertida} idioma={idioma} />}
              <span className="text-sm font-semibold">{nombrePieza(tipo, p.id, idioma)}{p.invertida ? ` · ${invertida}` : ""}</span>
              <span className="text-xs text-texto-suave">{posicion}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function nombrePieza(tipo: "baraja_espanola" | "lenormand" | "runas", id: string, idioma: Idioma) {
  if (tipo === "runas") {
    const r = runaPorId(id);
    return r ? `${r.nombre} (${r.significado[idioma]})` : id;
  }
  if (tipo === "lenormand") return cartaLenormand(id)?.nombre[idioma] ?? id;
  const c = cartaEspanola(id);
  return c ? nombreCartaEspanola(c, idioma) : id;
}

function PiezaEspanola({ id, invertida, idioma }: { id: string; invertida: boolean; idioma: Idioma }) {
  const c = cartaEspanola(id);
  if (!c) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ilustración estática del mazo
    <img src={`/cartas/espanola/${c.id}.webp`} alt={nombreCartaEspanola(c, idioma)} width={500} height={750} className={`aspect-[2/3] w-full rounded-lg shadow-lg ${invertida ? "rotate-180" : ""}`} />
  );
}

function PiezaLenormand({ id, idioma }: { id: string; idioma: Idioma }) {
  const c = cartaLenormand(id);
  if (!c) return null;
  if (LENORMAND_CON_IMAGEN.has(c.id)) {
    // eslint-disable-next-line @next/next/no-img-element -- ilustración estática del mazo
    return <img src={`/cartas/lenormand/${c.id}.webp`} alt={c.nombre[idioma]} width={500} height={600} className="aspect-[5/6] w-full rounded-lg shadow-lg" />;
  }
  return (
    <div className="flex aspect-[5/6] w-full flex-col items-center justify-between rounded-lg border border-oro/40 bg-gradient-to-b from-[#f6efdf] to-[#e3d3b0] p-2 text-[#3a2a12] shadow-lg">
      <span className="self-start text-xs font-semibold">{c.numero}</span>
      <span className="text-5xl" aria-hidden>{c.emoji}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wide">{c.nombre[idioma]}</span>
    </div>
  );
}

function PiezaRuna({ id, invertida }: { id: string; invertida: boolean }) {
  const r = runaPorId(id);
  if (!r) return null;
  // Piedra pintada con la runa grabada (public/runas/<id>.webp); invertida, la piedra queda de cabeza.
  return (
    // eslint-disable-next-line @next/next/no-img-element -- imagen estática de la runa
    <img src={`/runas/${r.id}.webp`} alt={r.nombre} width={360} height={360} className={`aspect-square w-full drop-shadow-[0_8px_10px_rgba(0,0,0,0.55)] ${invertida ? "rotate-180" : ""}`} />
  );
}
