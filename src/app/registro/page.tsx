import Link from "next/link";
import type { Metadata } from "next";
import { FormularioRegistro } from "@/components/FormularioAuth";
import { accionRegistrar } from "@/lib/auth/acciones";
import { BotonGoogle } from "@/components/BotonGoogle";
import { getT } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { Aviso } from "@/components/Aviso";
import { BONO_INVITADO, codigoInvitacionPendiente, nombreInvitador } from "@/lib/invitaciones";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.auth.registroTitulo };
}

export default async function PaginaRegistro({ searchParams }: { searchParams: Promise<{ inv?: string }> }) {
  const [{ inv }, t] = await Promise.all([searchParams, getT()]);
  const codigo = (await codigoInvitacionPendiente()) ?? (inv && /^[A-Z0-9]{4,12}$/i.test(inv) ? inv.toUpperCase() : null);
  const invitador = codigo ? await nombreInvitador(codigo) : null;
  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display mb-2 text-4xl font-semibold">{t.auth.registroTitulo}</h1>
      <p className="mb-6 text-texto-suave">{t.auth.registroIntro}</p>
      {codigo && (
        <div className="mb-4">
          <Aviso tipo="info">
            {invitador
              ? plantilla(t.invitar.bienvenida, { nombre: invitador, bono: BONO_INVITADO })
              : plantilla(t.invitar.bienvenidaSinNombre, { bono: BONO_INVITADO })}
          </Aviso>
        </div>
      )}
      <div className="tarjeta p-6">
        <BotonGoogle registro />
        <div className="my-5 flex items-center gap-3 text-xs text-texto-suave">
          <span className="h-px flex-1 bg-borde" />{t.auth.oConCorreo}<span className="h-px flex-1 bg-borde" />
        </div>
        <FormularioRegistro accion={accionRegistrar} />
      </div>
      <p className="mt-4 text-center text-sm text-texto-suave">
        {t.auth.conCuenta} <Link href="/entrar" className="text-oro-suave hover:underline">{t.comun.entrar}</Link>
      </p>
    </div>
  );
}
