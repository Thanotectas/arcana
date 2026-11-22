import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionWeton } from "@/lib/weton/acciones";
import { textosWeton } from "@/lib/weton/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CamposWeton } from "@/components/weton/CamposWeton";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const tw = textosWeton(await getIdioma());
  return { title: tw.titulo, description: tw.intro };
}

export default async function PaginaWeton() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const tw = textosWeton(idioma);
  // Si el perfil ya tiene una hora de nacimiento de las 18:00 en adelante, la casilla del atardecer viene marcada.
  const atardecer = (perfil?.hora_nacimiento ?? "").slice(0, 5) >= "18:00";
  const campos = { fecha: tw.fecha, atardecer: tw.atardecer, atardecerAyuda: tw.atardecerAyuda, neptu: tw.neptu, wuku: tw.wuku };
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{tw.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{tw.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {tw.intro} {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionWeton} textoBoton={plantilla(tw.calcular, { n: COSTOS.weton })} textoCargando={tw.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{tw.nombre}</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required maxLength={80} />
          </div>
          <CamposWeton fechaInicial={perfil?.fecha_nacimiento ?? ""} atardecerInicial={atardecer} textos={campos} />
        </FormularioLectura>
      </div>
    </div>
  );
}
