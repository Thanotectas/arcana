import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getT } from "@/lib/i18n/servidor";
import type { TipoLectura } from "@/lib/creditos";

/** Invitación contextual al final de una lectura: el paso natural siguiente. */
export async function SiguientePaso({ tipo }: { tipo: TipoLectura }) {
  const t = await getT();
  const clave = tipo.startsWith("tarot") ? "tarot" : tipo;
  const s = t.persuasion.siguiente[clave as keyof typeof t.persuasion.siguiente];
  if (!s || typeof s === "string") return null;
  return (
    <aside className="tarjeta tarjeta-modulo flex flex-wrap items-center justify-between gap-4 border-violeta/30 p-5">
      <div>
        <p className="font-display text-2xl text-oro-suave">{t.persuasion.siguiente.titulo}</p>
        <p className="text-sm text-texto-suave">{s.texto}</p>
      </div>
      <Link href={s.href} className="boton boton-primario">
        {s.accion} <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </aside>
  );
}
