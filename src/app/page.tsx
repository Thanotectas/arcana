import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import Link from "next/link";
import { ExplorarCatalogo } from "@/components/ExplorarCatalogo";
import { catalogoConTextos } from "@/lib/catalogo";
import { Sunrise } from "lucide-react";
import { CIRCULO, PAQUETES, PAQUETE_CIRCULO, precioCirculoPorDia } from "@/lib/creditos";
import { getUsuarioOpcional, getContadorLecturas } from "@/lib/dal";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { tasasDelDia } from "@/lib/monedas";
import { PrecioPrincipal, ProveedorMoneda, SelectorMoneda, TextoTresMonedas } from "@/components/PreciosLocales";
import { plantilla } from "@/lib/i18n/formato";
import { CartasFlotantes } from "@/components/CartasFlotantes";
import { CarruselVideos } from "@/components/CarruselVideos";
import { comprasVisibles } from "@/lib/plataforma";
import { AvisoDirecto } from "@/components/AvisoDirecto";

/** Reels de Sibila para la portada (versiones web en public/videos/portada, sin fechas que venzan). */
const VIDEOS = [
  { id: "runas", clave: "runas", href: "/runas" },
  { id: "abundancia", clave: "abundancia", href: "/rituales" },
  { id: "mano", clave: "mano", href: "/quiromancia" },
  { id: "trabajo", clave: "trabajo", href: "/rituales" },
  { id: "chocolate", clave: "chocolate", href: "/chocolate" },
  { id: "velas", clave: "velas", href: "/velas" },
  { id: "aura", clave: "aura", href: "/aura" },
  { id: "suenos", clave: "suenos", href: "/suenos" },
  { id: "carta-astral", clave: "cartaAstral", href: "/carta-astral" },
] as const;

/** La portada en cada idioma tiene su dirección (/fr, /tr…) para Google. */
export async function generateMetadata(): Promise<Metadata> {
  return { alternates: alternativas("/", await getIdioma()) };
}

export default async function Portada() {
  const [usuario, t, idioma, contador, compras, tasas] = await Promise.all([getUsuarioOpcional(), getT(), getIdioma(), getContadorLecturas().catch(() => 0), comprasVisibles(), tasasDelDia()]);

  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden pt-8 text-center sm:pt-16">
        <CartasFlotantes />
        <div className="relative aparecer">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.portada.lema}</p>
          <h1 className="font-display mx-auto max-w-3xl text-5xl font-semibold leading-tight text-texto sm:text-6xl">
            {t.portada.titulo1} <span className="brillo-oro text-oro-suave">{t.portada.titulo2}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-texto-suave">{t.portada.intro}</p>
          {contador >= 50 && (
            <p className="mt-4 inline-block rounded-full border border-exito/40 bg-exito/10 px-4 py-1 text-sm text-exito">
              ✦ {plantilla(t.persuasion.contadorSemana, { n: contador.toLocaleString(LOCALE_INTL[idioma]) })}
            </p>
          )}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={usuario ? "/tarot" : "/registro"} className="boton boton-primario">
              {usuario ? t.portada.ctaTarot : t.portada.ctaRegistro}
            </Link>
            <Link href="/horoscopo" className="boton boton-secundario">{t.portada.ctaHoroscopo}</Link>
          </div>
          {!usuario && <p className="mt-3 text-xs text-texto-suave">{t.crecimiento.sinTarjeta}</p>}
        </div>
      </section>

      <AvisoDirecto t={t.portada.directo} sonido={t.portada.videos} idioma={idioma} conOferta={compras} />

      <section>
        <h2 className="font-display text-center text-3xl font-semibold text-oro-suave">{t.portada.videos.titulo}</h2>
        <p className="mt-2 text-center text-texto-suave">{t.portada.videos.intro}</p>
        <div className="mt-8">
          <CarruselVideos videos={VIDEOS.map((v) => ({ ...v, titulo: t.portada.videos.items[v.clave] }))} textos={t.portada.videos} />
        </div>
      </section>

      {/* Todas las lecturas: guía para elegir, buscador y vistas por lo que quieres saber, práctica o tradición. */}
      <ExplorarCatalogo
        idioma={idioma}
        abrir={t.explorar.abrir}
        items={catalogoConTextos(t, { conCuenta: Boolean(usuario), idioma }).map((i) => ({
          clave: i.clave,
          href: usuario || !i.requiereCuenta ? i.href : "/registro",
          nombre: i.nombre,
          descripcion: i.descripcion,
          costoTexto: i.costoTexto,
          gratis: i.costo === null || i.costo === 0,
          destacado: Boolean(i.destacadoEn?.includes(idioma)),
          deOtroMercado: Boolean(i.destacadoEn?.length && !i.destacadoEn.includes(idioma)),
        }))}
      />

      <section className="tarjeta p-8 text-center">
        <h2 className="font-display text-3xl font-semibold text-oro-suave">{t.portada.comoFunciona}</h2>
        <div className="mt-8 grid gap-8 text-left sm:grid-cols-3">
          {t.portada.pasos.map((p, i) => (
            <div key={i}>
              <div className="font-display mb-2 text-4xl text-violeta-suave">{i + 1}</div>
              <h3 className="text-lg font-semibold text-texto">{p.titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave">{p.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-center text-3xl font-semibold text-oro-suave">{t.portada.paquetesTitulo}</h2>
        <p className="mt-2 text-center text-texto-suave">{t.portada.paquetesIntro}</p>
        <ProveedorMoneda porUSD={tasas.porUSD}>
        <div className="mt-4">
          <SelectorMoneda etiqueta={t.creditos.monedaLocal.etiqueta} nota={t.creditos.monedaLocal.nota} idioma={idioma} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {PAQUETES.map((p) => {
            const textos = t.creditos.paquetes[p.id as keyof typeof t.creditos.paquetes];
            return (
              <div key={p.id} className={`tarjeta tarjeta-modulo p-6 ${p.destacado ? "border-oro/50" : ""}`}>
                {p.destacado && <span className="text-xs uppercase tracking-widest text-oro">{t.portada.masElegido}</span>}
                <h3 className="font-display mt-1 text-2xl font-semibold">{textos?.nombre ?? p.nombre}</h3>
                <p className="mt-2 text-3xl font-semibold text-oro-suave"><PrecioPrincipal cop={p.precioCOP} usdCentavos={p.precioUSDCentavos} /></p>
                <p className="text-sm text-texto-suave">{plantilla(t.portada.nCreditos, { n: p.creditos })}</p>
                <p className="mt-3 text-sm text-texto-suave">{textos?.descripcion ?? p.descripcion}</p>
                <Link href="/creditos" className="boton boton-secundario mt-5 w-full">{t.portada.comprar}</Link>
              </div>
            );
          })}
        </div>
        <Link href={usuario ? "/creditos#circulo" : "/registro"} className="tarjeta tarjeta-modulo mt-6 flex flex-wrap items-center justify-between gap-4 border-oro/40 bg-oro/5 p-6">
          <div className="flex items-start gap-4">
            <Sunrise className="mt-1 h-8 w-8 shrink-0 text-oro" aria-hidden />
            <div>
              <h3 className="font-display text-2xl font-semibold">{t.crecimiento.circuloPortada.titulo}</h3>
              <p className="mt-1 text-sm text-texto-suave"><TextoTresMonedas texto={t.crecimiento.circuloPortada.texto} cop={PAQUETE_CIRCULO.precioCOP} usdCentavos={PAQUETE_CIRCULO.precioUSDCentavos} /></p>
              <p className="mt-1 text-sm text-oro-suave"><TextoTresMonedas texto={t.crecimiento.porDia} cop={precioCirculoPorDia()} usdCentavos={Math.ceil(PAQUETE_CIRCULO.precioUSDCentavos / CIRCULO.diasPorCompra)} /></p>
            </div>
          </div>
          <span className="boton boton-primario">{t.crecimiento.circuloPortada.cta}</span>
        </Link>
        </ProveedorMoneda>
      </section>
    </div>
  );
}
