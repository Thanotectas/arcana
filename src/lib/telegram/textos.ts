import type { Idioma } from "@/lib/i18n/idiomas";

/** Textos fijos del bot de Telegram (los que no pasan por la IA), en los 8 idiomas de la página. */
export interface TextosTelegram {
  bienvenida: (nombre: string | null, enlace: string) => string;
  diaria: string;
  parar: string;
  persona: string;
  limite: string;
  vacio: string;
  carta: string;
  paraTi: (enlace: string) => string;
}

export const TEXTOS_TELEGRAM: Record<Idioma, TextosTelegram> = {
  es: {
    bienvenida: (n, e) => `Hola${n ? `, ${n}` : ""} 🌙 Soy Sibila, la guía de Arcana.\n\nPregúntame lo que quieras sobre la app, tus lecturas o los precios. Y si quieres un regalo: /carta te muestra la carta del día, gratis, y con /diaria te la mando cada mañana.\n\nLas lecturas personales (tarot, carta astral, tu taza de café, tu mano) están en ${e}`,
    diaria: "Listo 🌙 Cada mañana te llega la carta del día. Si algún día quieres dejar de recibirla, escribe /parar.",
    parar: "Hecho, ya no te mandaré la carta cada mañana. Cuando quieras volver, escribe /diaria 🌙",
    persona: "Le aviso a alguien del equipo y te escribirá por este mismo chat 🌙 Mientras tanto, cuéntame aquí qué pasó.",
    limite: "Por hoy ya conversamos bastante 🌙 Mañana sigo aquí. Si es urgente, escribe /persona y alguien del equipo te contesta.",
    vacio: "Aquí estoy 🌙 ¿En qué te ayudo con Arcana?",
    carta: "Carta del día",
    paraTi: (e) => `🔮 ¿Y para ti? Saca tu propia carta gratis en ${e}`,
  },
  en: {
    bienvenida: (n, e) => `Hi${n ? `, ${n}` : ""} 🌙 I'm Sibila, Arcana's guide.\n\nAsk me anything about the app, your readings or prices. And a gift: /carta shows you the card of the day, free, and with /diaria I'll send it to you every morning.\n\nPersonal readings (tarot, birth chart, your coffee cup, your palm) are at ${e}`,
    diaria: "Done 🌙 The card of the day will reach you every morning. If you ever want to stop, write /parar.",
    parar: "Done, I won't send you the card every morning anymore. Whenever you want it back, write /diaria 🌙",
    persona: "I'll let someone from the team know and they'll write to you in this same chat 🌙 Meanwhile, tell me here what happened.",
    limite: "We've talked a lot today 🌙 I'll be here tomorrow. If it's urgent, write /persona and someone from the team will answer.",
    vacio: "I'm here 🌙 How can I help you with Arcana?",
    carta: "Card of the day",
    paraTi: (e) => `🔮 And for you? Draw your own card for free at ${e}`,
  },
  pt: {
    bienvenida: (n, e) => `Olá${n ? `, ${n}` : ""} 🌙 Sou Sibila, a guia da Arcana.\n\nPergunte o que quiser sobre o app, suas leituras ou os preços. E um presente: /carta mostra a carta do dia, grátis, e com /diaria eu te mando toda manhã.\n\nAs leituras pessoais (tarô, mapa astral, sua xícara de café, sua mão) estão em ${e}`,
    diaria: "Pronto 🌙 Toda manhã a carta do dia chega para você. Se um dia quiser parar, escreva /parar.",
    parar: "Feito, não vou mais te mandar a carta toda manhã. Quando quiser voltar, escreva /diaria 🌙",
    persona: "Vou avisar alguém da equipe e vão te escrever por este mesmo chat 🌙 Enquanto isso, me conte aqui o que aconteceu.",
    limite: "Por hoje já conversamos bastante 🌙 Amanhã continuo aqui. Se for urgente, escreva /persona e alguém da equipe te responde.",
    vacio: "Estou aqui 🌙 Como posso te ajudar com a Arcana?",
    carta: "Carta do dia",
    paraTi: (e) => `🔮 E para você? Tire sua própria carta grátis em ${e}`,
  },
  fr: {
    bienvenida: (n, e) => `Bonjour${n ? `, ${n}` : ""} 🌙 Je suis Sibila, la guide d'Arcana.\n\nDemande-moi ce que tu veux sur l'app, tes lectures ou les prix. Et un cadeau : /carta te montre la carte du jour, gratuite, et avec /diaria je te l'envoie chaque matin.\n\nLes lectures personnelles (tarot, thème astral, ta tasse de café, ta main) sont sur ${e}`,
    diaria: "C'est fait 🌙 Chaque matin, la carte du jour t'arrivera. Si un jour tu veux arrêter, écris /parar.",
    parar: "C'est fait, je ne t'enverrai plus la carte chaque matin. Quand tu voudras revenir, écris /diaria 🌙",
    persona: "Je préviens quelqu'un de l'équipe, qui t'écrira dans ce même chat 🌙 En attendant, raconte-moi ici ce qui s'est passé.",
    limite: "On a déjà beaucoup parlé aujourd'hui 🌙 Je suis là demain. Si c'est urgent, écris /persona et quelqu'un de l'équipe te répondra.",
    vacio: "Je suis là 🌙 Comment puis-je t'aider avec Arcana ?",
    carta: "Carte du jour",
    paraTi: (e) => `🔮 Et pour toi ? Tire ta propre carte gratuitement sur ${e}`,
  },
  tr: {
    bienvenida: (n, e) => `Merhaba${n ? ` ${n}` : ""} 🌙 Ben Sibila, Arcana'nın rehberiyim.\n\nUygulama, okumaların ya da fiyatlar hakkında bana istediğini sorabilirsin. Bir de hediyem var: /carta ile günün kartını ücretsiz görürsün, /diaria yazarsan her sabah sana gönderirim.\n\nKişisel okumalar (tarot, doğum haritası, kahve falı, el falı) burada: ${e}`,
    diaria: "Tamam 🌙 Günün kartı her sabah sana gelecek. Bir gün durdurmak istersen /parar yaz.",
    parar: "Tamam, artık sana her sabah kart göndermeyeceğim. Tekrar istediğinde /diaria yaz 🌙",
    persona: "Ekipten birine haber veriyorum, sana bu sohbetten yazacak 🌙 Bu arada ne olduğunu bana buradan anlat.",
    limite: "Bugün epey konuştuk 🌙 Yarın yine buradayım. Acilse /persona yaz, ekipten biri cevap versin.",
    vacio: "Buradayım 🌙 Arcana ile ilgili sana nasıl yardımcı olabilirim?",
    carta: "Günün kartı",
    paraTi: (e) => `🔮 Peki senin kartın? Kendi kartını ücretsiz çek: ${e}`,
  },
  ar: {
    bienvenida: (n, e) => `أهلًا${n ? ` ${n}` : ""} 🌙 أنا سيبيلا، مرشدة أركانا.\n\nاسألني ما تشاء عن التطبيق أو قراءاتك أو الأسعار. ولك هدية: الأمر /carta يعرض لك بطاقة اليوم مجانًا، ومع /diaria أرسلها لك كل صباح.\n\nالقراءات الشخصية (التاروت، الخريطة الفلكية، فنجان القهوة، الكف) تجدها هنا: ${e}`,
    diaria: "تمّ 🌙 ستصلك بطاقة اليوم كل صباح. وإن أردت إيقافها يومًا، اكتب /parar.",
    parar: "تمّ، لن أرسل لك البطاقة كل صباح بعد الآن. وحين تريد العودة، اكتب /diaria 🌙",
    persona: "سأخبر أحد أعضاء الفريق وسيكتب لك في هذه المحادثة نفسها 🌙 وإلى ذلك الحين، احكِ لي هنا ما حدث.",
    limite: "تحدّثنا كثيرًا اليوم 🌙 سأكون هنا غدًا. وإن كان الأمر عاجلًا، اكتب /persona وسيرد عليك أحد من الفريق.",
    vacio: "أنا هنا 🌙 كيف أساعدك في أركانا؟",
    carta: "بطاقة اليوم",
    paraTi: (e) => `🔮 وماذا عنك؟ اسحب بطاقتك الخاصة مجانًا: ${e}`,
  },
  id: {
    bienvenida: (n, e) => `Halo${n ? `, ${n}` : ""} 🌙 Aku Sibila, pemandu Arcana.\n\nTanyakan apa saja tentang aplikasinya, bacaanmu, atau harganya. Ada hadiah juga: /carta menampilkan kartu hari ini, gratis, dan dengan /diaria aku kirimkan setiap pagi.\n\nBacaan pribadi (tarot, peta kelahiran, cangkir kopimu, telapak tanganmu) ada di ${e}`,
    diaria: "Siap 🌙 Kartu hari ini akan sampai setiap pagi. Kalau suatu hari ingin berhenti, tulis /parar.",
    parar: "Selesai, aku tidak akan mengirim kartu setiap pagi lagi. Kapan pun mau lagi, tulis /diaria 🌙",
    persona: "Aku kabari seseorang dari tim, nanti mereka menulis di obrolan ini 🌙 Sementara itu, ceritakan di sini apa yang terjadi.",
    limite: "Hari ini kita sudah banyak mengobrol 🌙 Besok aku di sini lagi. Kalau mendesak, tulis /persona dan seseorang dari tim akan menjawab.",
    vacio: "Aku di sini 🌙 Ada yang bisa kubantu soal Arcana?",
    carta: "Kartu hari ini",
    paraTi: (e) => `🔮 Bagaimana denganmu? Tarik kartumu sendiri gratis di ${e}`,
  },
  hi: {
    bienvenida: (n, e) => `नमस्ते${n ? ` ${n}` : ""} 🌙 मैं सिबिला हूँ, आर्काना की मार्गदर्शक।\n\nऐप, अपनी रीडिंग या कीमतों के बारे में कुछ भी पूछिए। और एक उपहार: /carta से आज का कार्ड मुफ़्त देखिए, और /diaria से मैं इसे हर सुबह भेजूँगी।\n\nव्यक्तिगत रीडिंग (टैरो, जन्म कुंडली, कॉफ़ी कप, हथेली) यहाँ हैं: ${e}`,
    diaria: "हो गया 🌙 आज का कार्ड हर सुबह आपको मिलेगा। कभी बंद करना हो तो /parar लिखिए।",
    parar: "ठीक है, अब मैं हर सुबह कार्ड नहीं भेजूँगी। जब चाहें, /diaria लिखिए 🌙",
    persona: "मैं टीम में किसी को बताती हूँ, वे इसी चैट में आपको लिखेंगे 🌙 तब तक मुझे यहाँ बताइए कि क्या हुआ।",
    limite: "आज हमने काफ़ी बात कर ली 🌙 कल मैं फिर यहीं हूँ। ज़रूरी हो तो /persona लिखिए, टीम से कोई जवाब देगा।",
    vacio: "मैं यहाँ हूँ 🌙 आर्काना में आपकी क्या मदद करूँ?",
    carta: "आज का कार्ड",
    paraTi: (e) => `🔮 और आपके लिए? अपना कार्ड मुफ़्त निकालिए: ${e}`,
  },
};
