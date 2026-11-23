"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import type { Idioma } from "@/lib/i18n/idiomas";

const TEXTOS: Record<Idioma, { titulo: string; texto: string; boton: string; invitar: string }> = {
  es: { titulo: "Sibila tiene más para decirte", texto: "Se terminaron tus créditos, pero tu lectura te está esperando. Con el paquete más pequeño —por menos de lo que cuesta un café— la sigues ahora mismo.", boton: "Ver los paquetes", invitar: "¿Prefieres no pagar? Invita a alguien y los dos ganan créditos" },
  en: { titulo: "Sibila has more to tell you", texto: "You've run out of credits, but your reading is waiting for you. With the smallest pack — for less than a cup of coffee — you can continue right now.", boton: "See the packs", invitar: "Rather not pay? Invite someone and you both earn credits" },
  pt: { titulo: "A Sibila tem mais para te dizer", texto: "Seus créditos acabaram, mas sua leitura está te esperando. Com o pacote menor — por menos do que custa um café — você continua agora mesmo.", boton: "Ver os pacotes", invitar: "Prefere não pagar? Convide alguém e os dois ganham créditos" },
  fr: { titulo: "Sibila a encore beaucoup à te dire", texto: "Tu n'as plus de crédits, mais ta lecture t'attend. Avec le plus petit pack — pour moins qu'un café — tu continues tout de suite.", boton: "Voir les packs", invitar: "Tu préfères ne pas payer ? Invite quelqu'un et vous gagnez tous les deux des crédits" },
  tr: { titulo: "Sibila'nın sana söyleyecekleri bitmedi", texto: "Kredin bitti ama falın seni bekliyor. En küçük paketle — bir kahveden daha ucuza — hemen devam edebilirsin.", boton: "Paketlere bak", invitar: "Ödemek istemiyor musun? Birini davet et, ikiniz de kredi kazanın" },
  ar: { titulo: "لدى سيبيلا المزيد لتقوله لك", texto: "نفدت نقاطك، لكن قراءتك بانتظارك. مع أصغر باقة — بأقل من ثمن فنجان قهوة — تكمل الآن.", boton: "عرض الباقات", invitar: "لا تريد الدفع؟ ادعُ شخصًا وتربحان النقاط معًا" },
  id: { titulo: "Sibila masih punya banyak untuk dikatakan", texto: "Kreditmu habis, tapi bacaanmu menunggumu. Dengan paket terkecil — lebih murah dari secangkir kopi — kamu bisa lanjut sekarang juga.", boton: "Lihat paket", invitar: "Tidak mau bayar? Undang seseorang dan kalian berdua dapat kredit" },
  hi: { titulo: "सिबिला के पास आपके लिए और भी बहुत कुछ है", texto: "आपके क्रेडिट ख़त्म हो गए, पर आपकी रीडिंग आपका इंतज़ार कर रही है। सबसे छोटे पैक से — एक कप कॉफ़ी से भी कम में — आप अभी आगे बढ़ सकते हैं।", boton: "पैक देखें", invitar: "पैसे नहीं देना चाहते? किसी को आमंत्रित करें, दोनों को क्रेडिट मिलेंगे" },
};

/** En lugar del error «sin créditos»: una invitación cálida a seguir la lectura (paquetes o invitar a alguien). */
export function InvitacionCreditos() {
  const { idioma } = useT();
  const t = TEXTOS[idioma] ?? TEXTOS.es;
  return (
    <div role="status" className="tarjeta space-y-3 border-oro/50 bg-oro/5 p-5">
      <p className="flex items-center gap-2 font-display text-2xl text-oro-suave">
        <Sparkles className="h-5 w-5 shrink-0" aria-hidden /> {t.titulo}
      </p>
      <p className="text-sm">{t.texto}</p>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/creditos" className="boton boton-primario">{t.boton}</Link>
        <Link href="/invitar" className="text-sm text-texto-suave underline hover:text-texto">{t.invitar}</Link>
      </div>
    </div>
  );
}
