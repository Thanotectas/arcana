import { LOCALE_INTL } from "@/lib/i18n/idiomas";
import type { Metadata } from "next";
import { alternativas } from "@/lib/i18n/rutas";
import Link from "next/link";
import Image from "next/image";
import { catalogoConTextos } from "@/lib/catalogo";
import type { Idioma } from "@/lib/i18n/idiomas";
import { Sparkles, Star, Hash, Heart, Moon, Hand, Hexagon, Sunrise, Flame, Layers, MoonStar, HeartHandshake, Coffee, Orbit, FlameKindling, Sparkle, Wind, Sun, Swords, Clover, Axe, Diamond, Egg, Pyramid, Bean } from "lucide-react";
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
/** Las tradiciones de otros países (India, Java, el mundo árabe, África, Francia, Turquía) y las herramientas gratis, con su portada. */
const PORTADA_TRADICION: Record<string, string> = {
  kundli: "kundli",
  milan: "kundli-milan",
  weton: "weton",
  jodoh: "weton-jodoh",
  abjad: "abjad",
  geomancia: "geomancia",
  marsella: "marsella",
  iskambil: "iskambil",
  siono: "si-o-no",
  ascendente: "ascendente",
  nombres: "nombres",
  angeles: "numeros-angelicales",
};

const TEXTOS_TRADICIONES: Record<Idioma, { titulo: string; texto: string; gratis: string }> = {
  es: { titulo: "Tradiciones del mundo", texto: "La astrología de la India, el weton de Java, el abjad y la geomancia del mundo árabe y africano, el tarot de Marsella y el iskambil turco.", gratis: "Gratis" },
  en: { titulo: "Traditions of the world", texto: "Indian astrology, the Javanese weton, abjad and geomancy from the Arab and African world, the Tarot de Marseille and Turkish iskambil.", gratis: "Free" },
  pt: { titulo: "Tradições do mundo", texto: "A astrologia da Índia, o weton de Java, o abjad e a geomancia do mundo árabe e africano, o tarô de Marselha e o iskambil turco.", gratis: "Grátis" },
  fr: { titulo: "Traditions du monde", texto: "L'astrologie indienne, le weton javanais, l'abjad et la géomancie du monde arabe et africain, le tarot de Marseille et l'iskambil turc.", gratis: "Gratuit" },
  tr: { titulo: "Dünyanın gelenekleri", texto: "Hint astrolojisi, Cava weton'u, Arap ve Afrika dünyasından ebced ve geomansi, Marsilya tarotu ve Türk iskambil falı.", gratis: "Ücretsiz" },
  ar: { titulo: "تقاليد من العالم", texto: "علم التنجيم الهندي، والويتون الجاوي، وحساب الجُمَّل وعلم الرمل من العالم العربي وأفريقيا، وتاروت مرسيليا، والإسكامبيل التركي.", gratis: "مجاناً" },
  id: { titulo: "Tradisi dari seluruh dunia", texto: "Astrologi India, weton Jawa, abjad dan geomansi dari dunia Arab dan Afrika, tarot Marseille, dan iskambil Turki.", gratis: "Gratis" },
  hi: { titulo: "दुनिया की परंपराएँ", texto: "भारतीय ज्योतिष, जावा का वेटोन, अरब और अफ़्रीकी दुनिया का अबजद और रमल, मार्सेई टैरो और तुर्की इस्काम्बिल।", gratis: "मुफ़्त" },
};

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
  const tx = TEXTOS_TRADICIONES[idioma];
  // Las propias del idioma de la persona van primero (kundli en hindi, weton en indonesio…).
  const tradiciones = catalogoConTextos(t, { conCuenta: true, idioma }).filter((i) => PORTADA_TRADICION[i.clave]);
  const MODULOS = [
    { icono: Sparkles, ...t.portada.modulos.tarot, href: "/tarot" },
    { icono: Sunrise, ...t.crecimiento.moduloHoy, href: "/hoy" },
    { icono: Star, ...t.portada.modulos.astral, href: "/carta-astral" },
    { icono: Hand, ...t.portada.modulos.quiromancia, href: "/quiromancia" },
    { icono: Hash, ...t.portada.modulos.numerologia, href: "/numerologia" },
    { icono: Hexagon, ...t.portada.modulos.iching, href: "/iching" },
    { icono: Flame, ...t.portada.modulos.chino, href: "/calendario-chino" },
    { icono: MoonStar, ...t.portada.modulos.suenos, href: "/suenos" },
    { icono: Layers, ...t.portada.modulos.cruce, href: "/cruce" },
    { icono: Heart, ...t.portada.modulos.compatibilidad, href: "/compatibilidad" },
    { icono: HeartHandshake, ...t.portada.modulos.sinastria, href: "/sinastria" },
    { icono: Coffee, ...t.portada.modulos.chocolate, href: "/chocolate" },
    { icono: FlameKindling, ...t.portada.modulos.velas, href: "/velas" },
    { icono: Wind, ...t.portada.modulos.tabaco, href: "/tabaco" },
    { icono: Sun, ...t.portada.modulos.revolucion, href: "/revolucion-solar" },
    { icono: Swords, ...t.portada.modulos.baraja, href: "/baraja-espanola" },
    { icono: Clover, ...t.portada.modulos.lenormand, href: "/lenormand" },
    { icono: Axe, ...t.portada.modulos.runas, href: "/runas" },
    { icono: Diamond, ...t.portada.modulos.pendulo, href: "/pendulo" },
    { icono: Bean, ...t.portada.modulos.cafe, href: "/cafe" },
    { icono: Egg, ...t.portada.modulos.huevo, href: "/huevo" },
    { icono: Pyramid, ...t.portada.modulos.maya, href: "/calendario-maya" },
    { icono: Sparkle, ...t.portada.modulos.aura, href: "/aura" },
    { icono: Moon, ...t.portada.modulos.horoscopo, href: "/horoscopo" },
    { icono: Orbit, ...t.portada.modulos.luna, href: "/luna" },
  ];

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

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((m, i) => (
          <Link key={m.href} href={m.href} className="tarjeta tarjeta-modulo aparecer group p-6" style={{ animationDelay: `${i * 70}ms` }}>
            <m.icono className="mb-4 h-7 w-7 text-oro transition group-hover:scale-110" aria-hidden />
            <h2 className="font-display text-2xl font-semibold text-texto">{m.titulo}</h2>
            <p className="mt-2 text-sm leading-relaxed text-texto-suave">{m.texto}</p>
            <span className="mt-4 inline-block text-sm text-violeta-suave transition group-hover:translate-x-1">{t.portada.explorar} →</span>
          </Link>
        ))}
      </section>

      <section aria-labelledby="tradiciones">
        <div className="mb-6 text-center">
          <h2 id="tradiciones" className="font-display text-3xl font-semibold text-oro-suave">{tx.titulo}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-texto-suave">{tx.texto}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tradiciones.map((m) => (
            <Link key={m.href} href={m.href} className="tarjeta tarjeta-modulo group overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={`/portadas/${PORTADA_TRADICION[m.clave]}.webp`} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noche/90 to-transparent" aria-hidden />
                {m.costo === 0 && <span className="absolute end-3 top-3 rounded-full border border-oro/50 bg-noche/80 px-2.5 py-0.5 text-xs font-semibold text-oro">{tx.gratis}</span>}
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold text-texto">{m.nombre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-texto-suave">{m.descripcion}</p>
                <span className="mt-4 inline-block text-sm text-violeta-suave transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{t.portada.explorar} →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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
