import type { Metadata } from "next";
import { requerirUsuario, getPerfil, cartasDelDiaHoy } from "@/lib/dal";
import { TIRADAS, POSICIONES_I18N, tamanoMazo, type TipoTirada } from "@/lib/tarot/tiradas";
import { IDS_MAZO, MAZOS, esMazo, type IdMazo } from "@/lib/tarot/mazos";
import { COSTOS, CARTAS_DIA_GRATIS } from "@/lib/creditos";
import { RitualTarot, type TiradaRitual, type MazoRitual } from "@/components/RitualTarot";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.tarot };
}

export default async function PaginaTarot({ searchParams }: { searchParams: Promise<{ tirada?: string; mazo?: string }> }) {
  await requerirUsuario();
  const { tirada, mazo } = await searchParams;
  const [perfil, cartasHoy, t, idioma] = await Promise.all([getPerfil(), cartasDelDiaHoy(), getT(), getIdioma()]);
  const inicial: TipoTirada = tirada && tirada in TIRADAS ? (tirada as TipoTirada) : "tarot_tres";
  const mazoInicial: IdMazo = esMazo(mazo) ? mazo : "rider";
  const cartaDisponible = Boolean(perfil?.ilimitado) || cartasHoy < CARTAS_DIA_GRATIS;

  const tiradas: TiradaRitual[] = (Object.keys(TIRADAS) as TipoTirada[]).map((id) => ({
    id,
    nombre: t.tarot.tiradas[id].nombre,
    descripcion: t.tarot.tiradas[id].descripcion,
    posiciones: POSICIONES_I18N[idioma][id],
    costoTexto: COSTOS[id] === 0 ? (cartaDisponible ? t.comun.gratis : t.comun.usadaHoy) : `${COSTOS[id]} cr.`,
    disponible: COSTOS[id] > 0 || cartaDisponible,
  }));

  const mazos: MazoRitual[] = IDS_MAZO.map((id) => ({
    id,
    nombre: t.tarot.mazos[id].nombre,
    descripcion: t.tarot.mazos[id].descripcion,
    tamano: tamanoMazo(id),
    estilo: MAZOS[id].estilo,
  }));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.tarot.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.tarot.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.tarot.intro}{" "}
          {perfil?.ilimitado ? (
            <strong className="text-oro-suave">{t.comun.tuCuentaIlimitada}</strong>
          ) : (
            plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })
          )}
        </p>
      </div>
      <RitualTarot tiradas={tiradas} mazos={mazos} inicial={inicial} mazoInicial={mazoInicial} />
    </div>
  );
}
