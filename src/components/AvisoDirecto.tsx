import Link from "next/link";
import { CalendarClock, Gift, Radio } from "lucide-react";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { LOCALE_INTL, type Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { VideoInvitacion } from "@/components/VideoInvitacion";
import { PROXIMO_DIRECTO, ZONA_DIRECTO, diasParaDirecto, estadoDirecto } from "@/lib/marca/directo";

/**
 * Aviso del próximo directo de Sibila en la portada: el video de invitación,
 * día y hora, recordatorio de YouTube y la oferta de esa noche. Durante el
 * directo invita a entrar; cuando termina deja de mostrarse solo.
 */
export function AvisoDirecto({ t, sonido, idioma }: { t: Diccionario["portada"]["directo"]; sonido: { activarSonido: string; silenciar: string }; idioma: Idioma }) {
  const estado = estadoDirecto();
  if (!estado) return null;

  const inicio = new Date(PROXIMO_DIRECTO.inicio);
  const locale = LOCALE_INTL[idioma];
  const dias = diasParaDirecto();
  const fecha = new Intl.DateTimeFormat(locale, { timeZone: ZONA_DIRECTO, weekday: "long", day: "numeric", month: "long" }).format(inicio);
  const dia = dias === 0 ? t.hoy : dias === 1 ? t.manana : fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const hora = new Intl.DateTimeFormat(locale, { timeZone: ZONA_DIRECTO, hour: "numeric", minute: "2-digit" }).format(inicio);
  const enVivo = estado === "en-vivo";
  const { video, codigo, url } = PROXIMO_DIRECTO;

  return (
    <section className="tarjeta mx-auto grid max-w-4xl items-center gap-6 overflow-hidden p-5 sm:grid-cols-[14rem_1fr] sm:gap-8 sm:p-6">
      <div className="mx-auto aspect-[9/16] w-40 overflow-hidden rounded-xl bg-black sm:w-56">
        <VideoInvitacion id={video} textos={sonido} />
      </div>
      <div className="text-center sm:text-left">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-violeta-suave">
          <Radio className={`h-4 w-4 ${enVivo ? "animate-pulse text-red-400" : ""}`} aria-hidden />
          {t.etiqueta}
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold text-oro-suave sm:text-4xl">{enVivo ? t.tituloAhora : t.titulo}</h2>
        {!enVivo && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-oro/40 bg-oro/10 px-4 py-1 text-sm text-texto sm:text-base">
            <CalendarClock className="h-4 w-4 text-oro" aria-hidden />
            {plantilla(t.cuando, { dia, hora })}
          </p>
        )}
        <p className="mt-4 text-texto-suave">{t.intro}</p>
        {codigo && (
          <p className="mt-3 inline-flex items-start gap-2 text-sm text-texto">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-oro" aria-hidden />
            {plantilla(t.oferta, { codigo: codigo.codigo, n: codigo.creditosExtra })}
          </p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
          <a href={url} target="_blank" rel="noopener noreferrer" className="boton boton-primario">
            {enVivo ? t.entrar : t.recordatorio}
          </a>
          <Link href="/vivo" className="boton boton-secundario">{t.subirFoto}</Link>
        </div>
      </div>
    </section>
  );
}
