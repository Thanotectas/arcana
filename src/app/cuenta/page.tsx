import type { Metadata } from "next";
import { FormularioPerfil } from "@/components/FormularioAuth";
import { accionActualizarPerfil } from "@/lib/auth/acciones";
import { getOrdenes, getPerfil, requerirUsuario } from "@/lib/dal";
import { formatoCOP, paquetePorId } from "@/lib/creditos";

export const metadata: Metadata = { title: "Mi cuenta" };

const ESTADOS: Record<string, string> = {
  pendiente: "Pendiente",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  anulada: "Anulada",
  error: "Error",
};

export default async function PaginaCuenta() {
  const usuario = await requerirUsuario();
  const [perfil, ordenes] = await Promise.all([getPerfil(), getOrdenes()]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-4xl font-semibold">Mi cuenta</h1>
      <div className="tarjeta p-6">
        <FormularioPerfil accion={accionActualizarPerfil} nombre={perfil?.nombre ?? ""} email={usuario.email ?? ""} />
      </div>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl font-semibold">Compras</h2>
        {ordenes.length === 0 ? (
          <p className="mt-2 text-sm text-texto-suave">Aún no has comprado créditos.</p>
        ) : (
          <ul className="mt-4 divide-y divide-borde text-sm">
            {ordenes.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {paquetePorId(o.paquete)?.nombre ?? o.paquete} · {o.creditos} créditos
                  </p>
                  <p className="text-texto-suave">
                    {new Date(o.creado_en).toLocaleString("es-CO")} · {o.referencia}
                  </p>
                </div>
                <div className="text-right">
                  <p>{formatoCOP(o.monto_centavos / 100)}</p>
                  <p className={o.estado === "aprobada" ? "text-exito" : "text-texto-suave"}>{ESTADOS[o.estado] ?? o.estado}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
