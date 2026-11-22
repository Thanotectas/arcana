"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useT } from "@/lib/i18n/cliente";
import type { Idioma } from "@/lib/i18n/idiomas";

interface Audio {
  estado: "generando" | "listo" | "error";
  url: string | null;
  texto: string | null;
}
interface Datos {
  disponible: boolean;
  pagada: boolean;
  creditosCompleto: number;
  mensaje: Audio | null;
  completo: Audio | null;
}

const TEXTOS: Record<Idioma, { titulo: string; intro: string; mensaje: string; grabando: string; completo: (n: number) => string; narrando: string; escribio: string; descargar: string; error: string; sinCreditos: string; comprar: string; confirmar: (n: number) => string }> = {
  es: {
    titulo: "🎙️ Sibila te habla",
    intro: "Escucha a Sibila en tu idioma: un mensaje de voz con lo esencial de tu lectura, incluido, o la lectura completa leída por ella.",
    mensaje: "Escuchar el mensaje de voz de Sibila",
    grabando: "Sibila está grabando tu mensaje… (unos segundos)",
    completo: (n) => `🎧 Escuchar la lectura completa · ${n} crédito${n === 1 ? "" : "s"}`,
    narrando: "Sibila está leyendo tu lectura completa… (puede tardar un minuto)",
    escribio: "Lo que dice Sibila",
    descargar: "Descargar audio",
    error: "No se pudo crear el audio. Intenta de nuevo en un momento (si se cobró, se devolvió).",
    sinCreditos: "No te alcanzan los créditos para la lectura completa en audio.",
    comprar: "Recargar créditos",
    confirmar: (n) => `La lectura completa en audio cuesta ${n} crédito${n === 1 ? "" : "s"}. ¿Continuar?`,
  },
  en: {
    titulo: "🎙️ Sibila speaks to you",
    intro: "Listen to Sibila in your language: a voice message with the heart of your reading, included, or the full reading read by her.",
    mensaje: "Listen to Sibila's voice message",
    grabando: "Sibila is recording your message… (a few seconds)",
    completo: (n) => `🎧 Listen to the full reading · ${n} credit${n === 1 ? "" : "s"}`,
    narrando: "Sibila is reading your full reading aloud… (it may take a minute)",
    escribio: "What Sibila says",
    descargar: "Download audio",
    error: "The audio couldn't be created. Try again in a moment (if you were charged, it was refunded).",
    sinCreditos: "You don't have enough credits for the full audio reading.",
    comprar: "Get credits",
    confirmar: (n) => `The full audio reading costs ${n} credit${n === 1 ? "" : "s"}. Continue?`,
  },
  pt: {
    titulo: "🎙️ Sibila fala com você",
    intro: "Ouça a Sibila no seu idioma: uma mensagem de voz com o essencial da sua leitura, incluída, ou a leitura completa lida por ela.",
    mensaje: "Ouvir a mensagem de voz da Sibila",
    grabando: "Sibila está gravando sua mensagem… (alguns segundos)",
    completo: (n) => `🎧 Ouvir a leitura completa · ${n} crédito${n === 1 ? "" : "s"}`,
    narrando: "Sibila está lendo sua leitura completa… (pode levar um minuto)",
    escribio: "O que a Sibila diz",
    descargar: "Baixar áudio",
    error: "Não foi possível criar o áudio. Tente de novo em instantes (se houve cobrança, foi devolvida).",
    sinCreditos: "Seus créditos não são suficientes para a leitura completa em áudio.",
    comprar: "Recarregar créditos",
    confirmar: (n) => `A leitura completa em áudio custa ${n} crédito${n === 1 ? "" : "s"}. Continuar?`,
  },
  fr: {
    titulo: "🎙️ Sibila te parle",
    intro: "Écoute Sibila dans ta langue : un message vocal avec l'essentiel de ta lecture, inclus, ou la lecture complète lue par elle.",
    mensaje: "Écouter le message vocal de Sibila",
    grabando: "Sibila enregistre ton message… (quelques secondes)",
    completo: (n) => `🎧 Écouter la lecture complète · ${n} crédit${n === 1 ? "" : "s"}`,
    narrando: "Sibila lit ta lecture complète… (cela peut prendre une minute)",
    escribio: "Ce que dit Sibila",
    descargar: "Télécharger l'audio",
    error: "L'audio n'a pas pu être créé. Réessaie dans un instant (si tu as été débité, c'est remboursé).",
    sinCreditos: "Tu n'as pas assez de crédits pour la lecture complète en audio.",
    comprar: "Recharger des crédits",
    confirmar: (n) => `La lecture complète en audio coûte ${n} crédit${n === 1 ? "" : "s"}. Continuer ?`,
  },
  tr: {
    titulo: "🎙️ Sibila seninle konuşuyor",
    intro: "Sibila'yı kendi dilinde dinle: yorumunun özünü anlatan bir sesli mesaj (dahil) ya da onun sesinden yorumunun tamamı.",
    mensaje: "Sibila'nın sesli mesajını dinle",
    grabando: "Sibila mesajını kaydediyor… (birkaç saniye)",
    completo: (n) => `🎧 Yorumun tamamını dinle · ${n} kredi`,
    narrando: "Sibila yorumunun tamamını okuyor… (bir dakika sürebilir)",
    escribio: "Sibila'nın söyledikleri",
    descargar: "Sesi indir",
    error: "Ses oluşturulamadı. Birazdan tekrar dene (ücret alındıysa iade edildi).",
    sinCreditos: "Sesli tam yorum için kredin yetmiyor.",
    comprar: "Kredi yükle",
    confirmar: (n) => `Sesli tam yorum: ${n} kredi. Devam edilsin mi?`,
  },
  ar: {
    titulo: "🎙️ سيبيلا تتحدث إليك",
    intro: "استمع إلى سيبيلا بلغتك: رسالة صوتية بأهم ما في قراءتك، مشمولة، أو القراءة كاملة بصوتها.",
    mensaje: "الاستماع إلى رسالة سيبيلا الصوتية",
    grabando: "سيبيلا تسجّل رسالتك… (بضع ثوانٍ)",
    completo: (n) => `🎧 الاستماع إلى القراءة كاملة · النقاط: ${n}`,
    narrando: "سيبيلا تقرأ قراءتك كاملة… (قد يستغرق ذلك دقيقة)",
    escribio: "ما تقوله سيبيلا",
    descargar: "تنزيل الصوت",
    error: "تعذّر إنشاء الصوت. يُرجى المحاولة بعد لحظات (وإن خُصمت نقاط فقد أُعيدت).",
    sinCreditos: "نقاطك لا تكفي للقراءة الكاملة بالصوت.",
    comprar: "شحن النقاط",
    confirmar: (n) => `القراءة الكاملة بالصوت تكلّف ${n} من النقاط. هل تريد المتابعة؟`,
  },
  id: {
    titulo: "🎙️ Sibila berbicara padamu",
    intro: "Dengarkan Sibila dalam bahasamu: pesan suara berisi inti bacaanmu (sudah termasuk), atau bacaan lengkap yang dibacakan olehnya.",
    mensaje: "Dengarkan pesan suara Sibila",
    grabando: "Sibila sedang merekam pesanmu… (beberapa detik)",
    completo: (n) => `🎧 Dengarkan bacaan lengkap · ${n} kredit`,
    narrando: "Sibila sedang membacakan bacaan lengkapmu… (bisa memakan waktu semenit)",
    escribio: "Yang dikatakan Sibila",
    descargar: "Unduh audio",
    error: "Audio tidak dapat dibuat. Coba lagi sebentar lagi (jika terpotong kredit, sudah dikembalikan).",
    sinCreditos: "Kreditmu tidak cukup untuk bacaan lengkap dalam audio.",
    comprar: "Isi ulang kredit",
    confirmar: (n) => `Bacaan lengkap dalam audio memerlukan ${n} kredit. Lanjutkan?`,
  },
  hi: {
    titulo: "🎙️ सिबिला आपसे बात करती हैं",
    intro: "सिबिला को अपनी भाषा में सुनिए: आपकी रीडिंग के सार वाला एक वॉइस मैसेज (शामिल), या उनकी आवाज़ में पूरी रीडिंग।",
    mensaje: "सिबिला का वॉइस मैसेज सुनें",
    grabando: "सिबिला आपका मैसेज रिकॉर्ड कर रही हैं… (कुछ सेकंड)",
    completo: (n) => `🎧 पूरी रीडिंग सुनें · क्रेडिट: ${n}`,
    narrando: "सिबिला आपकी पूरी रीडिंग पढ़ रही हैं… (एक मिनट लग सकता है)",
    escribio: "सिबिला क्या कहती हैं",
    descargar: "ऑडियो डाउनलोड करें",
    error: "ऑडियो नहीं बन सका। थोड़ी देर में फिर कोशिश करें (अगर क्रेडिट कटे थे, तो लौटा दिए गए हैं)।",
    sinCreditos: "पूरी ऑडियो रीडिंग के लिए आपके क्रेडिट कम हैं।",
    comprar: "क्रेडिट रिचार्ज करें",
    confirmar: (n) => `पूरी ऑडियो रीडिंग के लिए क्रेडिट: ${n}। जारी रखें?`,
  },
};

/** Botones del audio de Sibila en una lectura paga: el mensaje de voz (incluido) y la lectura completa (con créditos). */
export function AudioSibila({ id, compras }: { id: string; compras: boolean }) {
  const { idioma } = useT();
  const tx = TEXTOS[idioma] ?? TEXTOS.es;
  const [datos, setDatos] = useState<Datos | null>(null);
  const [pidiendo, setPidiendo] = useState<"mensaje" | "completo" | null>(null);
  const [error, setError] = useState<"" | "error" | "sinCreditos">("");

  useEffect(() => {
    let vivo = true;
    fetch(`/api/lecturas/${id}/audio`, { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<Datos>) : null))
      .then((d) => vivo && d && setDatos(d))
      .catch(() => null);
    return () => {
      vivo = false;
    };
  }, [id]);

  async function pedir(tipo: "mensaje" | "completo") {
    if (tipo === "completo" && datos && !window.confirm(tx.confirmar(datos.creditosCompleto))) return;
    setPidiendo(tipo);
    setError("");
    try {
      for (let intento = 0; intento < 40; intento++) {
        const r = await fetch(`/api/lecturas/${id}/audio`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tipo }) });
        if (r.status === 402) {
          setError("sinCreditos");
          return;
        }
        const d = (await r.json().catch(() => ({}))) as Partial<Audio> & { error?: string };
        if (r.status === 202) {
          // Ya se está generando (otro clic u otra pestaña): se espera y se vuelve a preguntar.
          await new Promise((res) => setTimeout(res, 5000));
          continue;
        }
        if (!r.ok || d.estado !== "listo") {
          setError("error");
          return;
        }
        setDatos((x) => (x ? { ...x, [tipo]: { estado: "listo", url: d.url ?? null, texto: d.texto ?? null } } : x));
        return;
      }
      setError("error");
    } catch {
      setError("error");
    } finally {
      setPidiendo(null);
    }
  }

  if (!datos || !datos.disponible || !datos.pagada) return null;
  const listo = (a: Audio | null) => (a?.estado === "listo" && a.url ? a : null);
  const mensaje = listo(datos.mensaje);
  const completo = listo(datos.completo);

  return (
    <section className="tarjeta space-y-4 p-6">
      <div>
        <h2 className="font-display text-2xl">{tx.titulo}</h2>
        <p className="mt-1 text-sm text-texto-suave">{tx.intro}</p>
      </div>

      {mensaje ? (
        <div className="space-y-2">
          <audio controls src={mensaje.url ?? undefined} className="w-full" preload="none" />
          {mensaje.texto && (
            <details className="text-sm text-texto-suave">
              <summary className="cursor-pointer">{tx.escribio}</summary>
              <p className="mt-2 leading-relaxed">{mensaje.texto}</p>
            </details>
          )}
        </div>
      ) : (
        <button type="button" onClick={() => void pedir("mensaje")} disabled={pidiendo !== null} className="boton boton-primario w-full sm:w-auto">
          {pidiendo === "mensaje" ? tx.grabando : `▶ ${tx.mensaje}`}
        </button>
      )}

      {completo ? (
        <div className="space-y-1">
          <audio controls src={completo.url ?? undefined} className="w-full" preload="none" />
          <a href={completo.url ?? undefined} download className="text-xs text-oro-suave underline">
            {tx.descargar}
          </a>
        </div>
      ) : (
        <button type="button" onClick={() => void pedir("completo")} disabled={pidiendo !== null} className="boton boton-secundario w-full sm:w-auto">
          {pidiendo === "completo" ? tx.narrando : tx.completo(datos.creditosCompleto)}
        </button>
      )}

      {error === "error" && <p className="text-sm text-red-300">{tx.error}</p>}
      {error === "sinCreditos" && (
        <p className="text-sm text-red-300">
          {tx.sinCreditos}{" "}
          {compras && (
            <Link href="/creditos" className="text-oro-suave underline">
              {tx.comprar}
            </Link>
          )}
        </p>
      )}
    </section>
  );
}
