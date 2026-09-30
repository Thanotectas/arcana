import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { SIGNOS } from "@/lib/zodiaco";
import { accionCompatibilidad } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";

export const metadata: Metadata = { title: "Compatibilidad" };

function Persona({ sufijo, titulo, nombre }: { sufijo: "a" | "b"; titulo: string; nombre?: string }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-borde p-4">
      <legend className="px-2 font-display text-xl">{titulo}</legend>
      <div>
        <label className="etiqueta" htmlFor={`nombre_${sufijo}`}>Nombre</label>
        <input id={`nombre_${sufijo}`} name={`nombre_${sufijo}`} className="campo" defaultValue={nombre} />
      </div>
      <div>
        <label className="etiqueta" htmlFor={`fecha_${sufijo}`}>Fecha de nacimiento</label>
        <input id={`fecha_${sufijo}`} name={`fecha_${sufijo}`} type="date" className="campo" />
      </div>
      <div>
        <label className="etiqueta" htmlFor={`signo_${sufijo}`}>o su signo, si no sabes la fecha</label>
        <select id={`signo_${sufijo}`} name={`signo_${sufijo}`} className="campo" defaultValue="">
          <option value="">—</option>
          {SIGNOS.map((s) => (
            <option key={s.id} value={s.id}>{s.simbolo} {s.nombre}</option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}

export default async function PaginaCompatibilidad() {
  await requerirUsuario();
  const perfil = await getPerfil();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Sinastría básica</p>
        <h1 className="font-display text-4xl font-semibold">Compatibilidad</h1>
        <p className="mt-2 text-texto-suave">
          Qué une y qué tensiona a dos personas según sus signos solares. Cuesta {COSTOS.compatibilidad} crédito; tienes{" "}
          <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong>.
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionCompatibilidad} textoBoton="Analizar compatibilidad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Persona sufijo="a" titulo="Tú" nombre={perfil?.nombre ?? ""} />
            <Persona sufijo="b" titulo="La otra persona" />
          </div>
        </FormularioLectura>
      </div>
    </div>
  );
}
