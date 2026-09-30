import type { Metadata } from "next";
import { requerirUsuario, getPerfil, lugarDePerfil, horaDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionCartaAstral } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.cartaAstral };
}

export default async function PaginaCartaAstral() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.astral.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.astral.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.astral.intro} {plantilla(t.comun.cuesta, { n: COSTOS.carta_astral, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionCartaAstral} textoBoton={t.astral.calcular} textoCargando={t.astral.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{t.astral.nombre}</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="fecha">{t.astral.fecha}</label>
              <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
            </div>
            <CampoHora valorInicial={horaDePerfil(perfil)} />
          </div>
          <CampoLugar valorInicial={lugarDePerfil(perfil)} />
          <p className="text-xs text-texto-suave">{t.astral.tarda}</p>
        </FormularioLectura>
      </div>
    </div>
  );
}
