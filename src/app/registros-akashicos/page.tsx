import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionAkashicos } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { PREGUNTA_MAX, PREGUNTA_MIN, TEMAS_AKASHICOS } from "@/lib/akashicos";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.akashicos.titulo, description: t.akashicos.intro };
}

export default async function PaginaAkashicos() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  const a = t.akashicos;
  const temas = a.temas as Record<string, string>;
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{a.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{a.titulo}</h1>
        <p className="mt-2 text-texto-suave">{a.intro}</p>
        <p className="mt-2 flex items-start gap-2 text-sm text-oro-suave"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{a.nota}</p>
        <p className="mt-1 text-sm text-texto-suave">{perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}</p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionAkashicos} textoBoton={plantilla(a.ver, { n: COSTOS.akashicos })} textoCargando={a.calculando}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="nombre">{a.nombre}</label>
              <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required maxLength={100} />
            </div>
            <div>
              <label className="etiqueta" htmlFor="fecha">{a.fecha}</label>
              <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
            </div>
          </div>
          <div>
            <label className="etiqueta" htmlFor="tema">{a.tema}</label>
            <select id="tema" name="tema" className="campo" required defaultValue="proposito">
              {TEMAS_AKASHICOS.map((k) => (
                <option key={k} value={k}>{temas[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="etiqueta" htmlFor="pregunta">{a.pregunta}</label>
            <textarea id="pregunta" name="pregunta" className="campo min-h-28" required minLength={PREGUNTA_MIN} maxLength={PREGUNTA_MAX} placeholder={a.ejemplo} />
            <p className="mt-1 text-xs text-texto-suave">{a.ayuda}</p>
          </div>
          <p className="rounded-xl border border-oro/30 bg-oro/5 px-3 py-2 text-sm text-oro-suave">{a.preparar}</p>
        </FormularioLectura>
        <p className="mt-4 text-center text-xs text-texto-suave">{a.aviso}</p>
      </div>
    </div>
  );
}
