import type { Metadata } from "next";
import { FormularioRecuperar } from "@/components/FormularioAuth";
import { accionRecuperar } from "@/lib/auth/acciones";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function PaginaRecuperar() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-6 text-4xl font-semibold">Recuperar contraseña</h1>
      <div className="tarjeta p-6">
        <FormularioRecuperar accion={accionRecuperar} />
      </div>
    </div>
  );
}
