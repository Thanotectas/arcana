import type { Metadata } from "next";
import { requerirUsuario, getPerfil, cartasDelDiaHoy } from "@/lib/dal";
import { TIRADAS, TAMANO_MAZO, type TipoTirada } from "@/lib/tarot/tiradas";
import { COSTOS, CARTAS_DIA_GRATIS } from "@/lib/creditos";
import { RitualTarot, type TiradaRitual } from "@/components/RitualTarot";

export const metadata: Metadata = { title: "Tarot" };

export default async function PaginaTarot({ searchParams }: { searchParams: Promise<{ tirada?: string }> }) {
  await requerirUsuario();
  const { tirada } = await searchParams;
  const [perfil, cartasHoy] = await Promise.all([getPerfil(), cartasDelDiaHoy()]);
  const inicial: TipoTirada = tirada && tirada in TIRADAS ? (tirada as TipoTirada) : "tarot_tres";
  const cartaDisponible = cartasHoy < CARTAS_DIA_GRATIS;

  const tiradas: TiradaRitual[] = (Object.values(TIRADAS) as (typeof TIRADAS)[TipoTirada][]).map((t) => ({
    id: t.id,
    nombre: t.nombre,
    descripcion: t.descripcion,
    posiciones: t.posiciones,
    costoTexto: COSTOS[t.id] === 0 ? (cartaDisponible ? "Gratis" : "Usada hoy") : `${COSTOS[t.id]} cr.`,
    disponible: COSTOS[t.id] > 0 || cartaDisponible,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Tarot</p>
        <h1 className="font-display text-4xl font-semibold">Consulta las cartas</h1>
        <p className="mt-2 text-texto-suave">
          Elige tu tirada, baraja y escoge tus cartas del mazo. Tienes{" "}
          <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong> créditos.
        </p>
      </div>
      <RitualTarot tiradas={tiradas} inicial={inicial} tamanoMazo={TAMANO_MAZO} />
    </div>
  );
}
