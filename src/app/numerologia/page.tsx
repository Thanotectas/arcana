import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionNumerologia } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";

export const metadata: Metadata = { title: "Numerología" };

export default async function PaginaNumerologia() {
  await requerirUsuario();
  const perfil = await getPerfil();
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Numerología</p>
        <h1 className="font-display text-4xl font-semibold">Tu perfil numerológico</h1>
        <p className="mt-2 text-texto-suave">
          Camino de vida, expresión, impulso del alma, personalidad y año personal según la numerología pitagórica.
          Cuesta {COSTOS.numerologia} crédito; tienes <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong>.
        </p>
      </div>
      <div className="tarjeta p-6">
        <FormularioLectura accion={accionNumerologia} textoBoton="Calcular mis números">
          <div>
            <label className="etiqueta" htmlFor="nombre">Nombre completo (como en tu documento)</label>
            <input id="nombre" name="nombre" className="campo" required minLength={3} />
          </div>
          <div>
            <label className="etiqueta" htmlFor="fecha">Fecha de nacimiento</label>
            <input id="fecha" name="fecha" type="date" className="campo" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
          </div>
        </FormularioLectura>
      </div>
    </div>
  );
}
