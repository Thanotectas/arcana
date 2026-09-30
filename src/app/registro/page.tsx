import Link from "next/link";
import type { Metadata } from "next";
import { FormularioRegistro } from "@/components/FormularioAuth";
import { accionRegistrar } from "@/lib/auth/acciones";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function PaginaRegistro() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-2 text-4xl font-semibold">Crear cuenta</h1>
      <p className="mb-6 text-texto-suave">Recibes 3 créditos de bienvenida y una carta del día gratis cada jornada.</p>
      <div className="tarjeta p-6">
        <FormularioRegistro accion={accionRegistrar} />
      </div>
      <p className="mt-4 text-center text-sm text-texto-suave">
        ¿Ya tienes cuenta?{" "}
        <Link href="/entrar" className="text-oro-suave hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
