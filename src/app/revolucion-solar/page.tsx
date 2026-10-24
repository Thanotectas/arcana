import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { requerirUsuario, getPerfil, lugarDePerfil, horaDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionRevolucion } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";
import { CampoOtroLugar } from "@/components/CampoOtroLugar";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.revolucion.titulo, description: t.revolucion.intro };
}

/** Año de la revolución que está por llegar: si el cumpleaños de este año ya pasó, el siguiente. */
function anioPorDefecto(fechaNacimiento: string | null | undefined, hoy = new Date()) {
  const anio = hoy.getFullYear();
  if (!fechaNacimiento || !/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) return anio;
  const cumple = `${anio}${fechaNacimiento.slice(4)}`;
  return cumple < hoy.toISOString().slice(0, 10) ? anio + 1 : anio;
}

export default async function PaginaRevolucion() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const actual = new Date().getFullYear();
  const porDefecto = anioPorDefecto(perfil?.fecha_nacimiento);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.revolucion.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.revolucion.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.revolucion.intro}</p>
        <p className="mt-2 flex items-start gap-2 text-sm text-oro-suave"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{t.revolucion.nota}</p>
        <p className="mt-1 text-sm text-texto-suave">{perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}</p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionRevolucion} textoBoton={plantilla(t.revolucion.ver, { n: COSTOS.revolucion_solar })} textoCargando={t.revolucion.calculando}>
          <div>
            <label className="etiqueta" htmlFor="anio">{t.revolucion.anio}</label>
            <select id="anio" name="anio" className="campo" defaultValue={String(porDefecto)}>
              {[actual - 1, actual, actual + 1].map((a) => (
                <option key={a} value={a}>{plantilla(t.revolucion.anioOpcion, { a, b: a + 1 })}</option>
              ))}
            </select>
          </div>
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
          <CampoOtroLugar etiqueta={t.revolucion.otroLugar} etiquetaLugar={t.revolucion.lugarRs} />
        </FormularioLectura>
      </div>
    </div>
  );
}
