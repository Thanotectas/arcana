"use client";

import { reducirImagen } from "./CapturaPalma";
import { useT } from "@/lib/i18n/cliente";
import type { Idioma } from "@/lib/i18n/idiomas";

export type TipoFotosExtra = "cafe" | "huevo" | "chocolate" | "velas" | "tabaco";

/** Hasta dos fotos más desde otros ángulos: lo que cada una muestra, por tipo de lectura e idioma. */
const TEXTOS: Record<Idioma, { titulo: string } & Record<TipoFotosExtra, [string, string]>> = {
  es: {
    titulo: "Opcional: hasta dos fotos más desde otros ángulos, para una lectura más completa",
    cafe: ["Los lados de la taza", "El plato (si volteaste la taza sobre él)"],
    chocolate: ["Las paredes de la taza", "De cerca: la figura que más te llame la atención"],
    huevo: ["El vaso de lado", "El vaso desde arriba"],
    velas: ["Los restos desde otro ángulo", "De cerca: la cera o el hollín que más te llame la atención"],
    tabaco: ["La ceniza de cerca", "El otro lado del tabaco"],
  },
  en: {
    titulo: "Optional: up to two more photos from other angles, for a fuller reading",
    cafe: ["The sides of the cup", "The saucer (if you turned the cup over onto it)"],
    chocolate: ["The walls of the cup", "Close-up: the shape that catches your eye the most"],
    huevo: ["The glass from the side", "The glass from above"],
    velas: ["The remains from another angle", "Close-up: the wax or soot that catches your eye the most"],
    tabaco: ["The ash up close", "The other side of the cigar"],
  },
  pt: {
    titulo: "Opcional: até duas fotos a mais de outros ângulos, para uma leitura mais completa",
    cafe: ["As laterais da xícara", "O pires (se você virou a xícara sobre ele)"],
    chocolate: ["As paredes da xícara", "De perto: a figura que mais chama sua atenção"],
    huevo: ["O copo de lado", "O copo visto de cima"],
    velas: ["Os restos de outro ângulo", "De perto: a cera ou a fuligem que mais chama sua atenção"],
    tabaco: ["A cinza de perto", "O outro lado do charuto"],
  },
  fr: {
    titulo: "Facultatif : jusqu'à deux photos de plus sous d'autres angles, pour une lecture plus complète",
    cafe: ["Les parois de la tasse", "La soucoupe (si tu as retourné la tasse dessus)"],
    chocolate: ["Les parois de la tasse", "De près : la forme qui t'attire le plus"],
    huevo: ["Le verre de côté", "Le verre vu d'en haut"],
    velas: ["Les restes sous un autre angle", "De près : la cire ou la suie qui t'attire le plus"],
    tabaco: ["La cendre de près", "L'autre côté du cigare"],
  },
  tr: {
    titulo: "İsteğe bağlı: daha dolu bir fal için başka açılardan iki fotoğraf daha",
    cafe: ["Fincanın yanları", "Fincan tabağı (fincanı üzerine kapattıysan)"],
    chocolate: ["Fincanın iç duvarları", "Yakından: en çok dikkatini çeken şekil"],
    huevo: ["Bardağın yandan görünüşü", "Bardağın yukarıdan görünüşü"],
    velas: ["Kalıntılar başka bir açıdan", "Yakından: en çok dikkatini çeken mum ya da is"],
    tabaco: ["Kül yakından", "Purosunun diğer tarafı"],
  },
  ar: {
    titulo: "اختياري: حتى صورتين إضافيتين من زوايا أخرى، لقراءة أوفى",
    cafe: ["جوانب الفنجان", "الصحن (إن قُلب الفنجان عليه)"],
    chocolate: ["جدران الفنجان", "عن قرب: الشكل الذي يلفت انتباهك أكثر"],
    huevo: ["الكأس من الجانب", "الكأس من الأعلى"],
    velas: ["البقايا من زاوية أخرى", "عن قرب: الشمع أو السخام الذي يلفت انتباهك أكثر"],
    tabaco: ["الرماد عن قرب", "الجانب الآخر من السيجار"],
  },
  id: {
    titulo: "Opsional: hingga dua foto lagi dari sudut lain, untuk bacaan yang lebih lengkap",
    cafe: ["Sisi-sisi cangkir", "Tatakan (jika cangkir kamu telungkupkan di atasnya)"],
    chocolate: ["Dinding cangkir", "Dari dekat: bentuk yang paling menarik perhatianmu"],
    huevo: ["Gelas dari samping", "Gelas dari atas"],
    velas: ["Sisa lilin dari sudut lain", "Dari dekat: lilin atau jelaga yang paling menarik perhatianmu"],
    tabaco: ["Abu dari dekat", "Sisi lain cerutu"],
  },
  hi: {
    titulo: "वैकल्पिक: पूरी रीडिंग के लिए दूसरे कोणों से दो और तस्वीरें",
    cafe: ["कप के किनारे", "तश्तरी (अगर आपने कप उस पर उलटा रखा था)"],
    chocolate: ["कप की दीवारें", "पास से: वह आकृति जो सबसे ज़्यादा ध्यान खींचे"],
    huevo: ["गिलास बगल से", "गिलास ऊपर से"],
    velas: ["अवशेष दूसरे कोण से", "पास से: वह मोम या कालिख जो सबसे ज़्यादा ध्यान खींचे"],
    tabaco: ["राख पास से", "सिगार का दूसरा हिस्सा"],
  },
};

/** Las dos fotos opcionales (foto2 y foto3) de las lecturas por foto. */
export function FotosExtra({ tipo }: { tipo: TipoFotosExtra }) {
  const { idioma } = useT();
  const t = TEXTOS[idioma] ?? TEXTOS.es;
  const [uno, dos] = t[tipo];
  return (
    <div className="rounded-xl border border-borde p-4 text-sm">
      <p className="text-texto-suave">📸 {t.titulo}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="etiqueta">{uno}</span>
          <CampoFoto nombre="foto2" />
        </label>
        <label className="block">
          <span className="etiqueta">{dos}</span>
          <CampoFoto nombre="foto3" />
        </label>
      </div>
    </div>
  );
}

/** Foto extra: se reduce en el teléfono (como la principal) para no pasar el límite de subida. */
function CampoFoto({ nombre }: { nombre: string }) {
  return (
    <input
      type="file"
      name={nombre}
      accept="image/jpeg,image/png,image/webp"
      className="campo mt-1 w-full"
      onChange={async (e) => {
        const entrada = e.currentTarget;
        const archivo = entrada.files?.[0];
        if (!archivo) return;
        try {
          const { archivo: reducido } = await reducirImagen(archivo);
          const dt = new DataTransfer();
          dt.items.add(reducido);
          entrada.files = dt.files;
        } catch {
          entrada.value = "";
        }
      }}
    />
  );
}
