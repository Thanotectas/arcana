"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/cliente";

const TEXTOS = {
  es: {
    boton: "Tu opinión",
    titulo: "¿Qué te parece la app?",
    ayuda: "Cuéntanos qué te gustó, qué falló o qué mejorarías. Lo leemos todo y lo usamos en la próxima versión.",
    lugar: "Qué te gustó, qué falló o qué mejorarías…",
    enviar: "Enviar",
    enviando: "Enviando…",
    gracias: "¡Gracias! Lo leemos y lo mejoramos en la próxima versión. 💜",
    error: "No se pudo enviar. Intenta de nuevo en un momento.",
    cerrar: "Cerrar",
    estrellas: "Calificación",
  },
  en: {
    boton: "Feedback",
    titulo: "What do you think of the app?",
    ayuda: "Tell us what you liked, what broke or what you'd improve. We read everything and use it in the next version.",
    lugar: "What you liked, what broke or what you'd improve…",
    enviar: "Send",
    enviando: "Sending…",
    gracias: "Thank you! We'll read it and improve the next version. 💜",
    error: "Couldn't send it. Try again in a moment.",
    cerrar: "Close",
    estrellas: "Rating",
  },
  pt: {
    boton: "Sua opinião",
    titulo: "O que você acha do app?",
    ayuda: "Conte o que gostou, o que falhou ou o que melhoraria. Lemos tudo e usamos na próxima versão.",
    lugar: "O que gostou, o que falhou ou o que melhoraria…",
    enviar: "Enviar",
    enviando: "Enviando…",
    gracias: "Obrigado! Vamos ler e melhorar na próxima versão. 💜",
    error: "Não foi possível enviar. Tente de novo em um momento.",
    cerrar: "Fechar",
    estrellas: "Nota",
  },
  fr: {
    boton: "Ton avis",
    titulo: "Que penses-tu de l'appli ?",
    ayuda: "Dis-nous ce qui t'a plu, ce qui n'a pas marché ou ce que tu améliorerais. On lit tout et on s'en sert pour la prochaine version.",
    lugar: "Ce qui t'a plu, ce qui n'a pas marché ou ce que tu améliorerais…",
    enviar: "Envoyer",
    enviando: "Envoi en cours…",
    gracias: "Merci ! On le lit et on améliore la prochaine version. 💜",
    error: "Impossible d'envoyer. Réessaie dans un instant.",
    cerrar: "Fermer",
    estrellas: "Note",
  },
  tr: {
    boton: "Görüşün",
    titulo: "Uygulama hakkında ne düşünüyorsun?",
    ayuda: "Neyi beğendiğini, neyin aksadığını ya da neyin daha iyi olabileceğini bize anlat. Hepsini okuyor ve bir sonraki sürümde kullanıyoruz.",
    lugar: "Neyi beğendin, ne aksadı, ne daha iyi olabilir…",
    enviar: "Gönder",
    enviando: "Gönderiliyor…",
    gracias: "Teşekkürler! Okuyup bir sonraki sürümü daha iyi yapacağız. 💜",
    error: "Gönderilemedi. Birazdan tekrar dene.",
    cerrar: "Kapat",
    estrellas: "Puan",
  },
};

const OCULTO_EN = ["/en-vivo", "/vivo", "/admin"];

/** Botón «Tu opinión» dentro de la app (Google Play y la instalada): recoge comentarios para mejorar cada versión. */
export function BotonOpinion() {
  const { idioma } = useT();
  const t = TEXTOS[idioma];
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [estrellas, setEstrellas] = useState(0);
  const [estado, setEstado] = useState<"" | "enviando" | "listo" | "error">("");
  if (OCULTO_EN.some((r) => ruta.startsWith(r))) return null;

  async function enviar() {
    setEstado("enviando");
    try {
      const r = await fetch("/api/app/opinion", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ texto, calificacion: estrellas || null, pagina: ruta }) });
      if (!r.ok) throw new Error(String(r.status));
      setEstado("listo");
      setTexto("");
      setEstrellas(0);
    } catch {
      setEstado("error");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAbierto(true);
          setEstado("");
        }}
        className="fixed bottom-5 left-4 z-40 flex items-center gap-1.5 rounded-full border border-violeta-suave/50 bg-[#160d33]/95 px-3.5 py-2 text-sm text-texto shadow-lg backdrop-blur transition hover:border-oro/60"
      >
        <span aria-hidden>💬</span> {t.boton}
      </button>
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-noche/80 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-label={t.titulo}>
          <div className="tarjeta aparecer w-full max-w-md space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-2xl">{t.titulo}</p>
              <button type="button" onClick={() => setAbierto(false)} aria-label={t.cerrar} className="text-2xl leading-none text-texto-suave">
                ×
              </button>
            </div>
            {estado === "listo" ? (
              <p className="rounded-xl border border-oro/40 bg-oro/10 p-4 text-center">{t.gracias}</p>
            ) : (
              <>
                <p className="text-sm text-texto-suave">{t.ayuda}</p>
                <div className="flex justify-center gap-2" role="radiogroup" aria-label={t.estrellas}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" role="radio" aria-checked={estrellas === n} aria-label={`${n}`} onClick={() => setEstrellas(n)} className={`text-3xl transition ${n <= estrellas ? "text-oro" : "text-texto-suave/40"}`}>
                      ★
                    </button>
                  ))}
                </div>
                <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={4} maxLength={2000} placeholder={t.lugar} className="campo w-full text-sm" />
                {estado === "error" && <p className="text-sm text-red-300">{t.error}</p>}
                <button type="button" onClick={() => void enviar()} disabled={texto.trim().length < 3 || estado === "enviando"} className="boton boton-primario w-full">
                  {estado === "enviando" ? t.enviando : t.enviar}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
