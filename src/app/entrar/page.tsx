import Link from "next/link";
import type { Metadata } from "next";
import { FormularioEntrar } from "@/components/FormularioAuth";
import { accionEntrar } from "@/lib/auth/acciones";
import { Aviso } from "@/components/Aviso";

export const metadata: Metadata = { title: "Entrar" };

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ volver?: string; error?: string }>;
}) {
  const { volver, error } = await searchParams;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-6 text-4xl font-semibold">Entrar</h1>
      {error === "enlace" && (
        <div className="mb-4">
          <Aviso>El enlace no es válido o ya expiró. Vuelve a intentarlo.</Aviso>
        </div>
      )}
      <div className="tarjeta p-6">
        <FormularioEntrar accion={accionEntrar} volver={volver} />
      </div>
      <p className="mt-4 text-center text-sm text-texto-suave">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-oro-suave hover:underline">Crear cuenta</Link>
      </p>
    </div>
  );
}
