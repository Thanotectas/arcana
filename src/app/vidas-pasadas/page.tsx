import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { requerirUsuario, getPerfil, lugarDePerfil, horaDePerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionVidasPasadas } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.vidasPasadas.titulo, description: t.vidasPasadas.intro };
}

export default async function PaginaVidasPasadas() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const v = t.vidasPasadas;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{v.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{v.titulo}</h1>
        <p className="mt-2 text-texto-suave">{v.intro}</p>
        <p className="mt-2 flex items-start gap-2 text-sm text-oro-suave"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{v.nota}</p>
        <p className="mt-1 text-sm text-texto-suave">{perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}</p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionVidasPasadas} textoBoton={plantilla(v.ver, { n: COSTOS.vidas_pasadas })} textoCargando={v.calculando}>
          <div>
            <label className="etiqueta" htmlFor="nombre">{v.nombre}</label>
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
        </FormularioLectura>
        <p className="mt-4 text-center text-xs text-texto-suave">{v.aviso}</p>
      </div>
    </div>
  );
}
