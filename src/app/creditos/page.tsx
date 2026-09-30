import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { PAQUETES, COSTOS, NOMBRES_LECTURA, formatoCOP, type TipoLectura } from "@/lib/creditos";
import { accionComprar } from "@/lib/pagos/acciones";
import { pagosConfigurados } from "@/lib/pagos/bold";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";

export const metadata: Metadata = { title: "Créditos" };

const ERRORES: Record<string, string> = {
  paquete: "El paquete seleccionado no existe.",
  config: "Los pagos aún no están configurados. Contacta al administrador.",
  orden: "No se pudo crear la orden. Intenta de nuevo.",
};

export default async function PaginaCreditos({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requerirUsuario();
  const { error } = await searchParams;
  const perfil = await getPerfil();
  const configurado = pagosConfigurados();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Créditos</p>
        <h1 className="font-display text-4xl font-semibold">Recarga tu saldo</h1>
        <p className="mt-2 text-texto-suave">
          Tienes <strong className="text-oro-suave">{perfil?.creditos ?? 0}</strong> créditos. Sin suscripción ni vencimiento.
        </p>
      </div>

      {error && <Aviso>{ERRORES[error] ?? "Ocurrió un error."}</Aviso>}
      {!configurado && <Aviso tipo="info">Pagos en modo de configuración: falta la llave de identidad o la llave secreta de Bold.</Aviso>}

      <div className="grid gap-4 sm:grid-cols-3">
        {PAQUETES.map((p) => (
          <form key={p.id} action={accionComprar} className={`tarjeta flex flex-col p-6 ${p.destacado ? "border-oro/50" : ""}`}>
            <input type="hidden" name="paquete" value={p.id} />
            {p.destacado && <span className="text-xs uppercase tracking-widest text-oro">Más elegido</span>}
            <h2 className="font-display mt-1 text-2xl font-semibold">{p.nombre}</h2>
            <p className="mt-2 text-3xl font-semibold text-oro-suave">{formatoCOP(p.precioCOP)}</p>
            <p className="text-sm text-texto-suave">
              {p.creditos} créditos · {formatoCOP(Math.round(p.precioCOP / p.creditos))} por crédito
            </p>
            <p className="mt-3 flex-1 text-sm text-texto-suave">{p.descripcion}</p>
            <BotonEnviar className={`boton mt-5 w-full ${p.destacado ? "boton-primario" : "boton-secundario"}`} cargando="Preparando el pago…">
              Comprar
            </BotonEnviar>
          </form>
        ))}
      </div>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl font-semibold">¿Cuánto cuesta cada lectura?</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(COSTOS) as TipoLectura[]).map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-exito" aria-hidden />
              {NOMBRES_LECTURA[t]}: <strong>{COSTOS[t] === 0 ? "gratis (1 al día)" : `${COSTOS[t]} crédito${COSTOS[t] > 1 ? "s" : ""}`}</strong>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-texto-suave">
          Pagos procesados por Bold: tarjetas, PSE, Nequi y más. Los créditos se acreditan automáticamente al aprobarse el pago.
        </p>
      </section>
    </div>
  );
}
