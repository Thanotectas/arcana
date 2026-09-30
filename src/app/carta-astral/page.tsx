import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { accionCartaAstral } from "@/lib/lecturas/acciones";
import { FormularioLectura } from "@/components/FormularioLectura";
import { CampoLugar } from "@/components/CampoLugar";
import { CampoHora } from "@/components/CampoHoraDesconocida";

export const metadata: Metadata = { title: "Carta astral" };

export default async function PaginaCartaAstral() {
  await requerirUsuario();
  const perfil = await getPerfil();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Astrología</p>
        <h1 className="font-display text-4xl font-semibold">Tu carta astral</h1>
        <p className="mt-2 text-texto-suave">
          Calculamos las posiciones reales de los planetas en tu nacimiento, el Ascendente, las casas y los aspectos, y
          escribimos una lectura completa de tu cielo natal. Cuesta {COSTOS.carta_astral} créditos; tienes{" "}
          <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong>.
        </p>
      </div>

      <div className="tarjeta p-6">
        <FormularioLectura accion={accionCartaAstral} textoBoton="Calcular mi carta" textoCargando="Calculando tu cielo…">
          <div>
            <label className="etiqueta" htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" className="campo" defaultValue={perfil?.nombre ?? ""} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="etiqueta" htmlFor="fecha">Fecha de nacimiento</label>
              <input id="fecha" name="fecha" type="date" className="campo" min="1900-01-01" required defaultValue={perfil?.fecha_nacimiento ?? ""} />
            </div>
            <CampoHora />
          </div>
          <CampoLugar />
          <p className="text-xs text-texto-suave">Tu rueda aparece al instante y la lectura se escribe en vivo frente a ti.</p>
        </FormularioLectura>
      </div>
    </div>
  );
}
