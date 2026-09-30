import type { Metadata } from "next";
import { requerirUsuario, getPerfil, cartasDelDiaHoy } from "@/lib/dal";
import { TIRADAS, type TipoTirada } from "@/lib/tarot/tiradas";
import { COSTOS, CARTAS_DIA_GRATIS } from "@/lib/creditos";
import { accionTarot } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import Link from "next/link";

export const metadata: Metadata = { title: "Tarot" };

export default async function PaginaTarot({ searchParams }: { searchParams: Promise<{ tirada?: string }> }) {
  await requerirUsuario();
  const { tirada } = await searchParams;
  const [perfil, cartasHoy] = await Promise.all([getPerfil(), cartasDelDiaHoy()]);
  const seleccion: TipoTirada = tirada && tirada in TIRADAS ? (tirada as TipoTirada) : "tarot_tres";
  const cartaDisponible = cartasHoy < CARTAS_DIA_GRATIS;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Tarot</p>
        <h1 className="font-display text-4xl font-semibold">Elige tu tirada</h1>
        <p className="mt-2 text-texto-suave">
          Concéntrate en tu pregunta, elige una tirada y recibe una interpretación escrita para ti. Tienes{" "}
          <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong> créditos.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.values(TIRADAS) as (typeof TIRADAS)[TipoTirada][]).map((t) => {
          const activa = t.id === seleccion;
          const costo = COSTOS[t.id];
          return (
            <Link
              key={t.id}
              href={`/tarot?tirada=${t.id}`}
              className={`tarjeta p-4 transition ${activa ? "border-oro/60 bg-oro/5" : "hover:border-oro/30"}`}
              aria-current={activa ? "true" : undefined}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{t.nombre}</h2>
                <span className="text-xs text-violeta-suave">
                  {costo === 0 ? (cartaDisponible ? "Gratis" : "Usada hoy") : `${costo} cr.`}
                </span>
              </div>
              <p className="mt-1 text-xs text-texto-suave">{t.posiciones.length} carta{t.posiciones.length > 1 ? "s" : ""}</p>
            </Link>
          );
        })}
      </div>

      <div className="tarjeta p-6">
        <h2 className="font-display text-2xl font-semibold">{TIRADAS[seleccion].nombre}</h2>
        <p className="mb-5 text-sm text-texto-suave">{TIRADAS[seleccion].descripcion}</p>
        <FormularioLectura accion={accionTarot} textoBoton="Tirar las cartas" textoCargando="Barajando e interpretando…">
          <input type="hidden" name="tipo" value={seleccion} />
          <div>
            <label className="etiqueta" htmlFor="pregunta">
              Tu pregunta {seleccion === "tarot_carta" ? "(opcional)" : ""}
            </label>
            <textarea
              id="pregunta"
              name="pregunta"
              rows={3}
              maxLength={300}
              className="campo"
              placeholder="Por ejemplo: ¿Qué necesito ver sobre mi relación actual?"
              required={seleccion !== "tarot_carta"}
            />
          </div>
          <p className="text-xs text-texto-suave">
            La interpretación tarda entre 10 y 40 segundos según la tirada. No cierres la página.
          </p>
        </FormularioLectura>
      </div>
    </div>
  );
}
