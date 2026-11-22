import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil, horaDePerfil, lugarDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { accionKundli } from "@/lib/vedica/acciones";
import { textosVedica } from "@/lib/vedica/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";

export async function generateMetadata(): Promise<Metadata> {
  const k = textosVedica(await getIdioma()).kundli;
  return { title: k.titulo, description: k.descripcion };
}

export default async function PaginaKundli() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const k = textosVedica(idioma).kundli;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PortadaProducto clave="kundli" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{k.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{k.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {k.intro} {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionKundli} textoBoton={plantilla(k.calcular, { n: COSTOS.kundli })} textoCargando={k.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{k.nombre}</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required maxLength={80} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="fecha">{k.fecha}</label>
              <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
            </div>
            <CampoHora valorInicial={horaDePerfil(perfil)} />
          </div>
          <CampoLugar valorInicial={lugarDePerfil(perfil)} />
          <p className="text-xs text-texto-suave">{k.nota}</p>
        </FormularioLectura>
      </div>
    </div>
  );
}
