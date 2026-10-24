import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionMaya } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.maya.titulo, description: t.maya.intro };
}

export default async function PaginaMaya() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.maya.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.maya.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.maya.intro} {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionMaya} textoBoton={plantilla(t.maya.calcular, { n: COSTOS.maya })} textoCargando={t.maya.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{t.maya.nombre}</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required maxLength={80} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="fecha">{t.maya.fecha}</label>
            <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
          </div>
        </FormularioLectura>
      </div>
    </div>
  );
}
