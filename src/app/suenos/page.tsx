import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { COSTOS } from "@/lib/creditos";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { alternativas } from "@/lib/i18n/rutas";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { DiarioSuenos } from "@/components/DiarioSuenos";

/** Título y descripción para los buscadores: como se busca en cada idioma («rüya tabiri», «تفسير الأحلام»). */
const META: Record<Idioma, { titulo: string; descripcion: string }> = {
  es: { titulo: "Interpretación de sueños: qué significa tu sueño", descripcion: "Cuéntale tu sueño a Sibila: sus símbolos, su emoción y lo que puede estar anunciando, con la tradición clásica y tu diario de sueños." },
  en: { titulo: "Dream interpretation: what your dream means", descripcion: "Tell Sibila your dream: its symbols, its emotion and what it may be announcing, with the classical tradition and your dream journal." },
  pt: { titulo: "Interpretação de sonhos: o que seu sonho significa", descripcion: "Conte seu sonho à Sibila: seus símbolos, sua emoção e o que ele pode estar anunciando, com a tradição clássica e seu diário de sonhos." },
  fr: { titulo: "Interprétation des rêves : ce que ton rêve signifie", descripcion: "Raconte ton rêve à Sibila : ses symboles, son émotion et ce qu'il peut annoncer, avec la tradition classique et ton journal de rêves." },
  tr: { titulo: "Rüya tabiri: rüyan ne anlama geliyor?", descripcion: "Rüyanı Sibila'ya anlat: sembolleri, duygusu ve neye işaret ettiği, geleneksel rüya tabiri ve rüya günlüğünle birlikte." },
  ar: { titulo: "تفسير الأحلام: ما معنى حلمك؟", descripcion: "احكِ حلمك لسيبيلا: رموزه ومشاعره وما قد يبشّر به، على طريقة كتب تفسير الأحلام الكلاسيكية ومع دفتر أحلامك." },
  id: { titulo: "Arti mimpi: apa makna mimpimu", descripcion: "Ceritakan mimpimu kepada Sibila: simbolnya, emosinya, dan apa yang mungkin ditandakannya, dengan tradisi klasik dan jurnal mimpimu." },
  hi: { titulo: "सपनों का अर्थ: आपका सपना क्या कहता है", descripcion: "अपना सपना Sibila को बताइए: उसके प्रतीक, उसकी भावना और वह क्या संकेत दे सकता है, पारंपरिक स्वप्न शास्त्र और आपकी सपनों की डायरी के साथ।" },
};

export async function generateMetadata(): Promise<Metadata> {
  const idioma = await getIdioma();
  const m = META[idioma] ?? META.es;
  return { title: m.titulo, description: m.descripcion, alternates: alternativas("/suenos", idioma) };
}

export default async function PaginaSuenos() {
  await requerirUsuario();
  const [perfil, t] = await Promise.all([getPerfil(), getT()]);
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.suenos.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.suenos.titulo}</h1>
        <p className="mt-2 text-texto-suave">
          {t.suenos.intro} {plantilla(t.comun.cuesta, { n: COSTOS.suenos, unidad: t.comun.creditos })}{" "}
          {perfil?.ilimitado ? t.comun.tuCuentaIlimitada : plantilla(t.comun.tienesCreditos, { n: perfil?.creditos ?? 0 })}
        </p>
      </div>
      <div className="tarjeta p-6">
        <DiarioSuenos />
      </div>
      <section className="tarjeta p-6">
        <h2 className="font-display text-2xl">{t.suenos.consejosTitulo}</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-texto-suave">
          {(t.suenos.consejos as unknown as string[]).map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
