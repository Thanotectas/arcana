import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requerirUsuario, getPerfil, getHaComprado, circuloActivo } from "@/lib/dal";
import { Gift, ShieldCheck, Lock, Sparkles, Sunrise } from "lucide-react";
import { PAQUETES, PAQUETE_CIRCULO, CIRCULO, COSTOS, formatoCOP, formatoUSD, BONO_PRIMERA_COMPRA, precioCirculoPorDia, type TipoLectura } from "@/lib/creditos";
import { accionComprar, accionComprarInternacional } from "@/lib/pagos/acciones";
import { pagosInternacionalesConfigurados } from "@/lib/pagos/lemon";
import { headers } from "next/headers";
import Link from "next/link";
import { pagosConfigurados } from "@/lib/pagos/bold";
import { Aviso } from "@/components/Aviso";
import { BotonEnviar } from "@/components/BotonEnviar";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaLarga, plantilla } from "@/lib/i18n/formato";
import { comprasVisibles } from "@/lib/plataforma";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.creditos.seccion };
}

export default async function PaginaCreditos({ searchParams }: { searchParams: Promise<{ error?: string; moneda?: string }> }) {
  await requerirUsuario();
  const [{ error, moneda }, perfil, t, haComprado, idioma, h] = await Promise.all([searchParams, getPerfil(), getT(), getHaComprado(), getIdioma(), headers()]);
  // Fuera de Colombia (país según Vercel) se cobra en dólares con Lemon Squeezy; la persona puede cambiar con el enlace.
  const pais = h.get("x-vercel-ip-country") ?? "CO";
  const internacionalDisponible = pagosInternacionalesConfigurados();
  const internacional = moneda === "usd" || (moneda !== "cop" && pais !== "CO" && internacionalDisponible);
  const accion = internacional ? accionComprarInternacional : accionComprar;
  const precio = (p: { precioCOP: number; precioUSDCentavos: number }) => (internacional ? formatoUSD(p.precioUSDCentavos) : formatoCOP(p.precioCOP));
  const miembro = circuloActivo(perfil);
  if (!(await comprasVisibles())) {
    return (
      <div className="mx-auto max-w-md space-y-4 text-center">
        <h1 className="font-display text-4xl font-semibold">{t.creditos.seccion}</h1>
        <p className="text-texto-suave">{perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.creditos.tienes, { n: perfil?.creditos ?? 0 })}</p>
        <Aviso tipo="info">{t.creditos.noDisponibleApp}</Aviso>
      </div>
    );
  }
  const precioAstral = internacional
    ? formatoUSD(Math.round((PAQUETES[1].precioUSDCentavos / PAQUETES[1].creditos) * COSTOS.carta_astral))
    : formatoCOP(Math.round((PAQUETES[1].precioCOP / PAQUETES[1].creditos) * COSTOS.carta_astral));
  const configurado = internacional ? internacionalDisponible : pagosConfigurados();
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
      {!haComprado && !perfil?.ilimitado && (
        <div className="tarjeta aparecer flex items-center gap-4 border-oro/50 bg-oro/5 p-5">
          <Gift className="h-8 w-8 shrink-0 text-oro" aria-hidden />
          <div>
            <p className="font-display text-2xl text-oro-suave">{plantilla(t.persuasion.bonoPrimera, { n: BONO_PRIMERA_COMPRA })}</p>
            <p className="text-sm text-texto-suave">{t.persuasion.bonoPrimeraDetalle}</p>
          </div>
        </div>
      )}
      <p className="text-center text-sm text-texto-suave">{plantilla(internacional ? t.persuasion.anclaAstralUSD : t.persuasion.anclaAstral, { precio: precioAstral })}</p>
      {!configurado && <Aviso tipo="info">{internacional ? t.creditos.internacional.sinConfigurar : t.creditos.sinConfigurar}</Aviso>}
      <p className="text-center text-sm text-texto-suave">
        {internacional ? t.creditos.internacional.nota : null}{" "}
        {internacional ? (
          <Link href="/creditos?moneda=cop" className="text-oro-suave underline">{t.creditos.internacional.enlaceColombia}</Link>
        ) : internacionalDisponible ? (
          <Link href="/creditos?moneda=usd" className="text-oro-suave underline">{t.creditos.internacional.enlaceFuera}</Link>
        ) : null}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        {PAQUETES.map((p) => {
          const textos = t.creditos.paquetes[p.id as keyof typeof t.creditos.paquetes];
          const porCredito = p.precioCOP / p.creditos;
          const ahorro = Math.round((1 - porCredito / precioBase) * 100);
          return (
            <form key={p.id} action={accion} className={`tarjeta tarjeta-modulo flex flex-col p-6 ${p.destacado ? "border-oro/50 shadow-[0_0_40px_rgba(217,180,90,0.12)]" : ""}`}>
              <input type="hidden" name="paquete" value={p.id} />
              <div className="flex items-center justify-between">
                {p.destacado ? <span className="text-xs uppercase tracking-widest text-oro">{t.portada.masElegido}</span> : <span />}
                {ahorro > 0 && <span className="rounded-full bg-exito/15 px-2 py-0.5 text-xs text-exito">{plantilla(t.creditos.ahorro, { pct: ahorro })}</span>}
              </div>
              <h2 className="font-display mt-1 text-2xl font-semibold">{textos?.nombre ?? p.nombre}</h2>
              <p className="mt-2 text-3xl font-semibold text-oro-suave">{precio(p)}</p>
              <p className="text-sm text-texto-suave">
                {p.creditos} {t.comun.creditos} · {plantilla(t.creditos.porCredito, { precio: internacional ? formatoUSD(Math.round(p.precioUSDCentavos / p.creditos)) : formatoCOP(Math.round(porCredito)) })}
              </p>
              <p className="mt-1 text-sm text-oro-suave">
                {plantilla(t.persuasion.equivale, { texto: (t.persuasion.equivalencias as Record<string, string>)[p.id] ?? "" })}
              </p>
              <p className="mt-3 flex-1 text-sm text-texto-suave">{textos?.descripcion ?? p.descripcion}</p>
              <BotonEnviar className={`boton mt-5 w-full ${p.destacado ? "boton-primario" : "boton-secundario"}`} cargando={t.creditos.preparando}>
                {t.creditos.comprar}
              </BotonEnviar>
            </form>
          );
        })}
      </div>

      <form id="circulo" action={accion} className="tarjeta aparecer scroll-mt-24 border-oro/50 bg-gradient-to-br from-oro/10 via-transparent to-violeta/10 p-6 sm:p-8">
        <input type="hidden" name="paquete" value={PAQUETE_CIRCULO.id} />
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-lg">
            <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-oro"><Sunrise className="h-4 w-4" aria-hidden /> {t.circulo.etiqueta}</p>
            <h2 className="font-display mt-1 text-3xl font-semibold">{t.circulo.nombre}</h2>
            <p className="mt-1 text-texto-suave">{t.circulo.eslogan}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {t.circulo.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-2"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />{b}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-texto-suave">{plantilla(t.circulo.letraPequena, { n: CIRCULO.preguntasPorDia, dias: CIRCULO.diasPorCompra })}</p>
          </div>
          <div className="w-full text-center sm:w-56">
            <p className="text-4xl font-semibold text-oro-suave">{precio(PAQUETE_CIRCULO)}</p>
            <p className="text-sm text-texto-suave">{plantilla(t.circulo.porDias, { dias: CIRCULO.diasPorCompra })}</p>
            {!internacional && <p className="text-sm text-oro-suave">{plantilla(t.crecimiento.porDia, { precio: formatoCOP(precioCirculoPorDia()) })}</p>}
            <p className="mt-1 text-xs text-texto-suave">{plantilla(t.circulo.incluyeCreditos, { n: PAQUETE_CIRCULO.creditos })}</p>
            <BotonEnviar className="boton boton-primario mt-4 w-full" cargando={t.creditos.preparando}>
              {miembro ? t.circulo.extender : t.circulo.unirme}
            </BotonEnviar>
            {miembro && perfil?.circulo_hasta && !perfil.ilimitado && (
              <p className="mt-2 text-xs text-exito">{plantilla(t.circulo.activoHasta, { fecha: fechaLarga(perfil.circulo_hasta, idioma) })}</p>
            )}
          </div>
        </div>
      </form>

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
        <ul className="mt-5 space-y-2 text-sm text-texto-suave">
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-exito" aria-hidden />{t.persuasion.garantia}</li>
          <li className="flex items-start gap-2"><Lock className="mt-0.5 h-4 w-4 shrink-0 text-exito" aria-hidden />{internacional ? t.persuasion.pagoSeguroUSD : t.persuasion.pagoSeguro}</li>
        </ul>
      </section>
    </div>
  );
}
