import type { Metadata } from "next";
import { headers } from "next/headers";
import { Users, Coins } from "lucide-react";
import { requerirUsuario, getPerfil, getResumenInvitaciones } from "@/lib/dal";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { BONO_INVITADO, BONO_INVITADOR, enlaceInvitacion } from "@/lib/invitaciones";
import { InvitarAmigos } from "@/components/InvitarAmigos";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.invitar.seccion };
}

export default async function PaginaInvitar() {
  await requerirUsuario();
  const [perfil, resumen, t, h] = await Promise.all([getPerfil(), getResumenInvitaciones(), getT(), headers()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const enlace = enlaceInvitacion(base, perfil?.codigo_invitacion ?? "");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.invitar.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.invitar.titulo}</h1>
        <p className="mt-2 text-texto-suave">{plantilla(t.invitar.intro, { bonoInvitado: BONO_INVITADO, bonoInvitador: BONO_INVITADOR })}</p>
      </div>

      <div className="tarjeta p-6">
        <InvitarAmigos enlace={enlace} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="tarjeta flex items-center gap-4 p-5">
          <Users className="h-8 w-8 text-oro" aria-hidden />
          <div>
            <p className="font-display text-4xl text-oro-suave">{resumen.invitados}</p>
            <p className="text-sm text-texto-suave">{t.invitar.invitados}</p>
          </div>
        </div>
        <div className="tarjeta flex items-center gap-4 p-5">
          <Coins className="h-8 w-8 text-oro" aria-hidden />
          <div>
            <p className="font-display text-4xl text-oro-suave">{resumen.creditos_ganados}</p>
            <p className="text-sm text-texto-suave">{t.invitar.ganados}</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-texto-suave">{t.invitar.tope}</p>
    </div>
  );
}
