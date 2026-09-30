import type { Metadata } from "next";
import { FormularioPerfil } from "@/components/FormularioAuth";
import { accionActualizarPerfil } from "@/lib/auth/acciones";
import { getOrdenes, getPerfil, requerirUsuario } from "@/lib/dal";
import { formatoCOP } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaHora } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.cuenta.titulo };
}

export default async function PaginaCuenta() {
  const usuario = await requerirUsuario();
  const [perfil, ordenes, t, idioma] = await Promise.all([getPerfil(), getOrdenes(), getT(), getIdioma()]);
  const estados = t.cuenta.estados as Record<string, string>;
  const paquetes = t.creditos.paquetes as Record<string, { nombre: string }>;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <h1 className="font-display text-4xl font-semibold">{t.cuenta.titulo}</h1>
      <div className="tarjeta p-6">
        <FormularioPerfil accion={accionActualizarPerfil} nombre={perfil?.nombre ?? ""} email={usuario.email ?? ""} />
      </div>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl font-semibold">{t.cuenta.compras}</h2>
        {ordenes.length === 0 ? (
          <p className="mt-2 text-sm text-texto-suave">{t.cuenta.sinCompras}</p>
        ) : (
          <ul className="mt-4 divide-y divide-borde text-sm">
            {ordenes.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">
                    {paquetes[o.paquete]?.nombre ?? o.paquete} · {o.creditos} {t.comun.creditos}
                  </p>
                  <p className="text-texto-suave">
                    {fechaHora(o.creado_en, idioma)} · {o.referencia}
                  </p>
                </div>
                <div className="text-right">
                  <p>{formatoCOP(o.monto_centavos / 100)}</p>
                  <p className={o.estado === "aprobada" ? "text-exito" : "text-texto-suave"}>{estados[o.estado] ?? o.estado}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
