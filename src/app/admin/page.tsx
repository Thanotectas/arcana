import type { Metadata } from "next";
import Link from "next/link";
import { Megaphone, Mail, BarChart3, MessageCircle, HandCoins, Radio, Send } from "lucide-react";
import { requerirAdmin } from "@/lib/admin";

export const metadata: Metadata = { title: "Administración", robots: { index: false, follow: false } };

const HERRAMIENTAS = [
  { href: "/admin/resumen", icono: BarChart3, titulo: "Estado del negocio", texto: "Registros, ventas, lecturas, correos y redes de la última semana. Llega por correo cada lunes a las 7:00." },
  { href: "/admin/redes", icono: Megaphone, titulo: "Agente de redes", texto: "Borradores semanales de Sibila para Instagram y Facebook: aprobar, editar, publicar." },
  { href: "/admin/embajadores", icono: HandCoins, titulo: "Embajadores", texto: "Retiros de comisiones por pagar y quién trae más ventas con su enlace." },
  { href: "/admin/en-vivo", icono: Radio, titulo: "Sibila en vivo", texto: "Directos de YouTube: Sibila lee tarot, aura, numerología, horóscopo, tazas y manos en voz alta." },
  { href: "/admin/telegram", icono: Send, titulo: "Telegram", texto: "El bot de Sibila: responde dudas, manda la carta del día y la envía cada mañana a quien escribió /diaria." },
  { href: "/admin/whatsapp", icono: MessageCircle, titulo: "Atención", texto: "Preguntas de visitantes en el chat de la página (y el historial de WhatsApp, desactivado por Meta)." },
  { href: "/admin/probadores", icono: Mail, titulo: "Correo a probadores", texto: "Agradecimiento a quienes prueban Arcana en Google Play, con sus créditos." },
];

/** Índice de las herramientas de administración. */
export default async function PaginaAdmin() {
  await requerirAdmin();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">Administración</p>
        <h1 className="font-display text-4xl font-semibold">Herramientas</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {HERRAMIENTAS.map((h) => (
          <Link key={h.href} href={h.href} className="tarjeta block p-5 transition hover:border-violeta">
            <h.icono className="h-6 w-6 text-oro" aria-hidden />
            <h2 className="mt-3 font-display text-2xl font-semibold">{h.titulo}</h2>
            <p className="mt-1 text-sm text-texto-suave">{h.texto}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
