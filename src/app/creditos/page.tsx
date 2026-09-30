import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { PAQUETES, COSTOS, formatoCOP, type TipoLectura } from "@/lib/creditos";
import { accionComprar } from "@/lib/pagos/acciones";
import { pagosConfigurados } from "@/lib/pagos/bold";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.creditos.seccion };
}

export default async function PaginaCreditos({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requerirUsuario();
  const [{ error }, perfil, t] = await Promise.all([searchParams, getPerfil(), getT()]);
  const configurado = pagosConfigurados();
  const errores = t.creditos.errores as Record<string, string>;
  const precioBase = PAQUETES[0].precioCOP / PAQUETES[0].creditos;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.creditos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.creditos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.creditos.tienes, { n: perfil?.creditos ?? 0 })} {t.creditos.intro}
        </p>
      </div>

      {error && <Aviso>{errores[error] ?? t.creditos.errores.generico}</Aviso>}
      {!configurado && <Aviso tipo="info">{t.creditos.sinConfigurar}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-3">
        {PAQUETES.map((p) => {
          const textos = t.creditos.paquetes[p.id as keyof typeof t.creditos.paquetes];
          const porCredito = p.precioCOP / p.creditos;
          const ahorro = Math.round((1 - porCredito / precioBase) * 100);
          return (
            <form key={p.id} action={accionComprar} className={`tarjeta tarjeta-modulo flex flex-col p-6 ${p.destacado ? "border-oro/50 shadow-[0_0_40px_rgba(217,180,90,0.12)]" : ""}`}>
              <input type="hidden" name="paquete" value={p.id} />
              <div className="flex items-center justify-between">
                {p.destacado ? <span className="text-xs uppercase tracking-widest text-oro">{t.portada.masElegido}</span> : <span />}
                {ahorro > 0 && <span className="rounded-full bg-exito/15 px-2 py-0.5 text-xs text-exito">{plantilla(t.creditos.ahorro, { pct: ahorro })}</span>}
              </div>
              <h2 className="font-display mt-1 text-2xl font-semibold">{textos?.nombre ?? p.nombre}</h2>
              <p className="mt-2 text-3xl font-semibold text-oro-suave">{formatoCOP(p.precioCOP)}</p>
              <p className="text-sm text-texto-suave">
                {p.creditos} {t.comun.creditos} · {plantilla(t.creditos.porCredito, { precio: formatoCOP(Math.round(porCredito)) })}
              </p>
              <p className="mt-3 flex-1 text-sm text-texto-suave">{textos?.descripcion ?? p.descripcion}</p>
              <BotonEnviar className={`boton mt-5 w-full ${p.destacado ? "boton-primario" : "boton-secundario"}`} cargando={t.creditos.preparando}>
                {t.creditos.comprar}
              </BotonEnviar>
            </form>
          );
        })}
      </div>

      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl font-semibold">{t.creditos.cuantoCuesta}</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.keys(COSTOS) as TipoLectura[]).map((tipo) => (
            <li key={tipo} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-exito" aria-hidden />
              {t.lecturas.nombres[tipo]}:{" "}
              <strong>{COSTOS[tipo] === 0 ? t.creditos.gratisDia : `${COSTOS[tipo]} ${COSTOS[tipo] > 1 ? t.comun.creditos : t.comun.credito}`}</strong>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-texto-suave">{t.creditos.procesados}</p>
      </section>
    </div>
  );
}
