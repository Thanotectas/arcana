import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { escenarioActivo } from "@/lib/en-vivo";
import { PROXIMO_DIRECTO, ZONA_DIRECTO, estadoDirecto } from "@/lib/marca/directo";
import { FormularioVivo } from "@/components/FormularioVivo";
import { GRUPO_FACEBOOK, CANAL_WHATSAPP } from "@/lib/marca/redes";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sibila en vivo",
  description: "Sibila lee en vivo en YouTube: tu carta astral dibujada en pantalla, tu sinastría, tarot o aura. Activa el recordatorio o envía la foto de tu taza o de tu mano.",
};

/**
 * Página del QR del directo: antes muestra la fecha, el recordatorio de YouTube
 * y cómo pedir cada lectura; durante el directo, el botón para entrar y el
 * formulario para subir la foto de la taza o de la mano.
 */
export default async function PaginaVivo() {
  const activo = await escenarioActivo(getSupabaseAdmin()).catch(() => false);
  const estado = estadoDirecto();
  const inicio = new Date(PROXIMO_DIRECTO.inicio);
  const fecha = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_DIRECTO, weekday: "long", day: "numeric", month: "long" }).format(inicio);
  const hora = new Intl.DateTimeFormat("es-CO", { timeZone: ZONA_DIRECTO, hour: "numeric", minute: "2-digit" }).format(inicio);
  return (
    <div className="mx-auto max-w-md space-y-6 py-6">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Sibila en vivo</p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-oro-suave">Tu lectura en el directo</h1>
        <p className="mt-2 text-texto-suave">Sibila lee en vivo en YouTube y tú eliges: tu carta astral dibujada en pantalla, tu sinastría, tarot o aura. También puedes enviarle la foto de tu taza o de tu mano.</p>
      </div>
      {activo || estado === "en-vivo" ? (
        <>
          {/* Durante el directo: entrar a verlo es lo primero; la foto, después. */}
          <a href={PROXIMO_DIRECTO.url} target="_blank" rel="noopener noreferrer" className="boton boton-primario flex w-full justify-center text-lg">
            ▶ Entrar al directo en YouTube
          </a>
          {activo && (
            <div className="tarjeta p-5">
              <FormularioVivo />
            </div>
          )}
        </>
      ) : estado === "proximo" ? (
        <div className="tarjeta space-y-4 p-5 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">Próximo directo</p>
          <p className="font-display text-3xl text-oro-suave first-letter:uppercase">{fecha}</p>
          <p className="text-texto">{hora} · hora de Colombia · en YouTube</p>
          <a href={PROXIMO_DIRECTO.emision ?? PROXIMO_DIRECTO.url} target="_blank" rel="noopener noreferrer" className="boton boton-primario flex w-full justify-center">
            🔔 Activar el recordatorio en YouTube
          </a>
          <p className="text-xs text-texto-suave">En YouTube pulsa «Notificarme»: te avisa cuando empiece. A esa hora, este mismo enlace te lleva al directo.</p>
          <div className="space-y-2 border-t border-borde pt-4 text-left text-sm">
            <p className="text-xs uppercase tracking-widest text-texto-suave">Tú eliges qué leer · escríbelo en el chat</p>
            <p>
              <span className="text-oro-suave">Tu carta astral</span>, dibujada en pantalla: <span className="text-texto-suave">carta astral 14/03/1990 10:30 Bogotá</span>
            </p>
            <p>
              <span className="text-oro-suave">Tu sinastría</span> con esa persona: <span className="text-texto-suave">sinastría 14/03/1990 y 22/08/1992</span>
            </p>
            <p>
              <span className="text-oro-suave">Tarot, aura o mi año</span>: <span className="text-texto-suave">tu signo y tu pregunta</span>
            </p>
            <p className="text-texto-suave">El día del directo, aquí mismo podrás subir la foto de tu taza o de tu mano.</p>
          </div>
        </div>
      ) : (
        <div className="tarjeta space-y-3 p-5 text-center">
          <p>En este momento no hay directo.</p>
          <p className="text-sm text-texto-suave">
            Los anunciamos en{" "}
            <a href="https://www.instagram.com/miarcana.oficial" className="text-oro-suave underline" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>{" "}
            y en{" "}
            <a href="https://www.youtube.com/@miarcana" className="text-oro-suave underline" target="_blank" rel="noopener noreferrer">
              YouTube
            </a>
            . Mientras tanto, puedes hacer tu{" "}
            <Link href="/chocolate" className="text-oro-suave underline">
              lectura del chocolate
            </Link>{" "}
            o de{" "}
            <Link href="/quiromancia" className="text-oro-suave underline">
              tu mano
            </Link>{" "}
            cuando quieras.
          </p>
        </div>
      )}
      {/* La comunidad: para seguir aprendiendo entre un directo y otro. */}
      <a href={GRUPO_FACEBOOK.url} target="_blank" rel="noopener noreferrer" className="tarjeta block space-y-1 p-5 text-center transition hover:border-oro/40">
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">Comunidad Arcana</p>
        <p className="font-display text-2xl text-oro-suave">{GRUPO_FACEBOOK.nombre}</p>
        <p className="text-sm text-texto-suave">Nuestro grupo de Facebook para preguntar por tu Sol, tu Luna y tu Ascendente, comentar la carta del día y enterarte del próximo directo.</p>
        <p className="pt-1 text-sm font-semibold text-texto">Unirme al grupo →</p>
      </a>
      <a href={CANAL_WHATSAPP.url} target="_blank" rel="noopener noreferrer" className="tarjeta block space-y-1 border-exito/30 p-5 text-center transition hover:border-exito/60">
        <p className="text-xs uppercase tracking-[0.25em] text-violeta-suave">Canal de WhatsApp</p>
        <p className="font-display text-2xl text-oro-suave">{CANAL_WHATSAPP.nombre}</p>
        <p className="text-sm text-texto-suave">Tu carta del día cada mañana, el mensaje de tu signo y el aviso de cada directo, en tu WhatsApp.</p>
        <p className="pt-1 text-sm font-semibold text-texto">Unirme al canal →</p>
      </a>
      <p className="text-center text-xs text-texto-suave">Lecturas de entretenimiento y reflexión personal.</p>
    </div>
  );
}
