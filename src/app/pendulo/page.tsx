import Link from "next/link";
import type { Metadata } from "next";
import { requerirUsuario, getPerfil } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { inicioDelDia } from "@/lib/oraculos/pendulo";
import { getT } from "@/lib/i18n/servidor";
import { FormularioPendulo } from "@/components/FormularioPendulo";
import { Pendulo } from "@/components/Pendulo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.pendulo.titulo, description: t.pendulo.intro };
}

export default async function PaginaPendulo() {
  await requerirUsuario();
  const supabase = await createClient();
  const [perfil, t, { count }] = await Promise.all([
    getPerfil(),
    getT(),
    supabase.from("lecturas").select("id", { count: "exact", head: true }).eq("tipo", "pendulo").gte("creado_en", inicioDelDia()),
  ]);
  const usadoHoy = !perfil?.ilimitado && (count ?? 0) > 0;
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.pendulo.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.pendulo.titulo}</h1>
        <p className="mt-2 text-texto-suave">{t.pendulo.intro} <span className="text-oro-suave">{t.pendulo.gratis}</span></p>
      </div>
      <div className="tarjeta p-6">
        {usadoHoy ? (
          <div className="space-y-4 text-center">
            <Pendulo movimiento="quieto" className="mx-auto h-48 w-40" />
            <p className="text-texto-suave">{t.pendulo.yaHoy}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/baraja-espanola" className="boton boton-primario">{t.baraja.titulo}</Link>
              <Link href="/runas" className="boton boton-secundario">{t.runas.titulo}</Link>
            </div>
          </div>
        ) : (
          <FormularioPendulo />
        )}
      </div>
    </div>
  );
}
