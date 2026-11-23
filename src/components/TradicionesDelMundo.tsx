import Link from "next/link";
import Image from "next/image";
import { catalogoConTextos } from "@/lib/catalogo";
import type { Idioma } from "@/lib/i18n/idiomas";
import type { Diccionario } from "@/lib/i18n/diccionarios";

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

/**
 * «Tradiciones del mundo»: los productos y herramientas de los mercados nuevos, cada uno con su portada.
 * Va en la portada pública y en el panel de quien ya tiene cuenta (/inicio), con el costo en créditos.
 */
export function TradicionesDelMundo({ t, idioma, conCosto = false }: { t: Diccionario; idioma: Idioma; conCosto?: boolean }) {
  const tx = TEXTOS_TRADICIONES[idioma];
  // Las propias del idioma de la persona van primero (kundli en hindi, weton en indonesio…).
  const tradiciones = catalogoConTextos(t, { conCuenta: true, idioma }).filter((i) => PORTADA_TRADICION[i.clave]);
  return (
    <section aria-labelledby="tradiciones">
      <div className="mb-6 text-center">
        <h2 id="tradiciones" className="font-display text-3xl font-semibold text-oro-suave">{tx.titulo}</h2>
        <p className="mx-auto mt-2 max-w-2xl text-texto-suave">{tx.texto}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tradiciones.map((m) => {
          const etiqueta = m.costo === 0 ? tx.gratis : conCosto && m.costo ? `${m.costo} ${m.costo > 1 ? t.comun.creditos : t.comun.credito}` : null;
          return (
            <Link key={m.href} href={m.href} className="tarjeta tarjeta-modulo group overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={`/portadas/${PORTADA_TRADICION[m.clave]}.webp`} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-noche/90 to-transparent" aria-hidden />
                {etiqueta && <span className="absolute end-3 top-3 rounded-full border border-oro/50 bg-noche/80 px-2.5 py-0.5 text-xs font-semibold text-oro">{etiqueta}</span>}
              </div>
              <div className="p-5">
                <h3 className="font-display text-2xl font-semibold text-texto">{m.nombre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-texto-suave">{m.descripcion}</p>
                <span className="mt-4 inline-block text-sm text-violeta-suave transition group-hover:translate-x-1 rtl:group-hover:-translate-x-1">{t.portada.explorar} →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
