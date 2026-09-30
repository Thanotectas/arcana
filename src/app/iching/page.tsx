import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { RitualIChing } from "@/components/RitualIChing";
import { HEXAGRAMAS } from "@/lib/iching";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.iching };
}

export default async function PaginaIChing() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const nombres = Object.fromEntries(HEXAGRAMAS.map((h) => [String(h.numero), h.nombre]));
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.iching.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.iching.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.iching.intro} {plantilla(t.comun.cuesta, { n: COSTOS.iching, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <RitualIChing nombresHexagramas={nombres} />
      </div>
    </div>
  );
}
