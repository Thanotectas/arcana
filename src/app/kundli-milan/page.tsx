import type { Metadata } from "next";
import { PortadaProducto } from "@/components/PortadaProducto";
import { requerirUsuario, getPerfil, horaDePerfil, lugarDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { accionKundliMilan } from "@/lib/vedica/acciones";
import { textosVedica } from "@/lib/vedica/textos";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";

export async function generateMetadata(): Promise<Metadata> {
  const m = textosVedica(await getIdioma()).milan;
  return { openGraph: { images: [{ url: "/og/kundli-milan.jpg", width: 1200, height: 630 }] }, twitter: { card: "summary_large_image", images: ["/og/kundli-milan.jpg"] },  title: m.titulo, description: m.descripcion };
}

export default async function PaginaKundliMilan() {
  await requerirUsuario();
  const [perfil, t, idioma] = await Promise.all([getPerfil(), getT(), getIdioma()]);
  const tv = textosVedica(idioma);
  const m = tv.milan;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PortadaProducto clave="kundli-milan" />
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{m.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{m.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {m.intro} {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionKundliMilan} textoBoton={plantilla(m.calcular, { n: COSTOS.kundli_milan })} textoCargando={m.calculando}>
          <p className="text-xs text-texto-suave">{m.notaRoles}</p>
          <fieldset className="space-y-4">
            <legend className="font-display text-2xl text-oro-suave">{m.personaA}</legend>
            <div>
              <label className="etiqueta" htmlFor="nombre">{t.astral.nombre}</label>
              <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required maxLength={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="fecha">{tv.kundli.fecha}</label>
                <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
              </div>
              <CampoHora valorInicial={horaDePerfil(perfil)} />
            </div>
            <CampoLugar valorInicial={lugarDePerfil(perfil)} />
          </fieldset>
          <fieldset className="space-y-4 border-t border-borde pt-5">
            <legend className="font-display pt-5 text-2xl text-oro-suave">{m.personaB}</legend>
            <div>
              <label className="etiqueta" htmlFor="nombre_b">{t.astral.nombre}</label>
              <input id="nombre_b" name="nombre_b" className="campo" required maxLength={80} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="etiqueta" htmlFor="fecha_b">{tv.kundli.fecha}</label>
                <input id="fecha_b" name="fecha_b" type="date" className="campo" min="1900-01-01" required />
              </div>
              <CampoHora sufijo="_b" />
            </div>
            <CampoLugar sufijo="_b" />
          </fieldset>
          <p className="text-xs text-texto-suave">{m.nota}</p>
        </FormularioLectura>
      </div>
    </div>
  );
}
