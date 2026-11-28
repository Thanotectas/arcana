"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { accionCompraRapida } from "@/lib/pagos/acciones";
import type { Idioma } from "@/lib/i18n/idiomas";

const TEXTOS: Record<Idioma, { titulo: string; texto: string; boton: string; invitar: string; rapido: string; rapidoNota: string }> = {
  es: { titulo: "Sibila tiene más para decirte", texto: "Se terminaron tus créditos, pero tu lectura te está esperando. Con el paquete más pequeño —por menos de lo que cuesta un café— la sigues ahora mismo.", boton: "Ver los paquetes", invitar: "¿Prefieres no pagar? Invita a alguien y los dos ganan créditos", rapido: "Seguir ahora · 5 créditos", rapidoNota: "Pago seguro en un minuto. En tu primera compra, 2 créditos más de regalo." },
  en: { titulo: "Sibila has more to tell you", texto: "You've run out of credits, but your reading is waiting for you. With the smallest pack — for less than a cup of coffee — you can continue right now.", boton: "See the packs", invitar: "Rather not pay? Invite someone and you both earn credits", rapido: "Continue now · 5 credits", rapidoNota: "Secure payment in one minute. On your first purchase, 2 extra credits as a gift." },
  pt: { titulo: "A Sibila tem mais para te dizer", texto: "Seus créditos acabaram, mas sua leitura está te esperando. Com o pacote menor — por menos do que custa um café — você continua agora mesmo.", boton: "Ver os pacotes", invitar: "Prefere não pagar? Convide alguém e os dois ganham créditos", rapido: "Continuar agora · 5 créditos", rapidoNota: "Pagamento seguro em um minuto. Na primeira compra, 2 créditos de presente." },
  fr: { titulo: "Sibila a encore beaucoup à te dire", texto: "Tu n'as plus de crédits, mais ta lecture t'attend. Avec le plus petit pack — pour moins qu'un café — tu continues tout de suite.", boton: "Voir les packs", invitar: "Tu préfères ne pas payer ? Invite quelqu'un et vous gagnez tous les deux des crédits", rapido: "Continuer maintenant · 5 crédits", rapidoNota: "Paiement sécurisé en une minute. Pour ton premier achat, 2 crédits offerts." },
  tr: { titulo: "Sibila'nın sana söyleyecekleri bitmedi", texto: "Kredin bitti ama falın seni bekliyor. En küçük paketle — bir kahveden daha ucuza — hemen devam edebilirsin.", boton: "Paketlere bak", invitar: "Ödemek istemiyor musun? Birini davet et, ikiniz de kredi kazanın", rapido: "Şimdi devam et · 5 kredi", rapidoNota: "Bir dakikada güvenli ödeme. İlk alışverişinde 2 kredi hediye." },
  ar: { titulo: "لدى سيبيلا المزيد لتقوله لك", texto: "نفدت نقاطك، لكن قراءتك بانتظارك. مع أصغر باقة — بأقل من ثمن فنجان قهوة — تكمل الآن.", boton: "عرض الباقات", invitar: "لا تريد الدفع؟ ادعُ شخصًا وتربحان النقاط معًا", rapido: "أكمل الآن · 5 نقاط", rapidoNota: "دفع آمن في دقيقة. في أول شراء، نقطتان إضافيتان هدية." },
  id: { titulo: "Sibila masih punya banyak untuk dikatakan", texto: "Kreditmu habis, tapi bacaanmu menunggumu. Dengan paket terkecil — lebih murah dari secangkir kopi — kamu bisa lanjut sekarang juga.", boton: "Lihat paket", invitar: "Tidak mau bayar? Undang seseorang dan kalian berdua dapat kredit", rapido: "Lanjut sekarang · 5 kredit", rapidoNota: "Pembayaran aman dalam satu menit. Di pembelian pertama, bonus 2 kredit." },
  hi: { titulo: "सिबिला के पास आपके लिए और भी बहुत कुछ है", texto: "आपके क्रेडिट ख़त्म हो गए, पर आपकी रीडिंग आपका इंतज़ार कर रही है। सबसे छोटे पैक से — एक कप कॉफ़ी से भी कम में — आप अभी आगे बढ़ सकते हैं।", boton: "पैक देखें", invitar: "पैसे नहीं देना चाहते? किसी को आमंत्रित करें, दोनों को क्रेडिट मिलेंगे", rapido: "अभी जारी रखें · 5 क्रेडिट", rapidoNota: "एक मिनट में सुरक्षित भुगतान। पहली ख़रीद पर 2 क्रेडिट उपहार में।" },
};

/** En lugar del error «sin créditos»: una invitación cálida a seguir la lectura (paquetes o invitar a alguien). */
export function InvitacionCreditos() {
  const { idioma } = useT();
  const t = TEXTOS[idioma] ?? TEXTOS.es;
  // Embudo de compra: cuántas personas ven esta invitación (una vez por montaje).
  useEffect(() => {
    fetch("/api/evento-compra", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ evento: "vio_invitacion", via: location.pathname }), keepalive: true }).catch(() => undefined);
  }, []);
  return (
    <div role="status" className="tarjeta space-y-3 border-oro/50 bg-oro/5 p-5">
      <p className="flex items-center gap-2 font-display text-2xl text-oro-suave">
        <Sparkles className="h-5 w-5 shrink-0" aria-hidden /> {t.titulo}
      </p>
      <p className="text-sm">{t.texto}</p>
      <form action={accionCompraRapida} className="space-y-1.5">
        <button type="submit" className="boton boton-primario w-full sm:w-auto">{t.rapido}</button>
        <p className="text-xs text-texto-suave">{t.rapidoNota}</p>
      </form>
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/creditos" className="text-sm underline">{t.boton}</Link>
        <Link href="/invitar" className="text-sm text-texto-suave underline hover:text-texto">{t.invitar}</Link>
      </div>
    </div>
  );
}
