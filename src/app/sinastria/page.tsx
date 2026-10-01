import type { Metadata } from "next";
import { requerirUsuario, getPerfil, horaDePerfil, lugarDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { accionSinastria } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.nav.sinastria };
}

export default async function PaginaSinastria() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.sinastria.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.sinastria.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.sinastria.intro} {plantilla(t.comun.cuesta, { n: COSTOS.sinastria, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionSinastria} textoBoton={t.sinastria.calcular} textoCargando={t.sinastria.calculando}>
          <fieldset className="space-y-4">
            <legend className="font-display text-2xl text-oro-suave">{t.sinastria.personaA}</legend>
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
          </fieldset>
          <fieldset className="space-y-4 border-t border-borde pt-5">
            <legend className="font-display pt-5 text-2xl text-oro-suave">{t.sinastria.personaB}</legend>
            <div>
              <label className="etiqueta" htmlFor="nombre_b">{t.astral.nombre}</label>
              <input id="nombre_b" name="nombre_b" className="campo" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="fecha_b">{t.astral.fecha}</label>
                <input id="fecha_b" name="fecha_b" type="date" className="campo" min="1900-01-01" required />
              </div>
              <CampoHora sufijo="_b" />
            </div>
            <CampoLugar sufijo="_b" />
          </fieldset>
          <p className="text-xs text-texto-suave">{t.sinastria.nota}</p>
        </FormularioLectura>
      </div>
    </div>
  );
}
