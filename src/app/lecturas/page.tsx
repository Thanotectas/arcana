import Link from "next/link";
import type { Metadata } from "next";
import { getLecturas, requerirUsuario } from "@/lib/dal";
import { NOMBRES_LECTURA } from "@/lib/creditos";

export const metadata: Metadata = { title: "Mis lecturas" };

export default async function PaginaLecturas() {
  await requerirUsuario();
  const lecturas = await getLecturas(100);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-4xl font-semibold">Mis lecturas</h1>
      {lecturas.length === 0 ? (
        <p className="tarjeta p-6 text-texto-suave">Aún no tienes lecturas guardadas.</p>
      ) : (
        <ul className="space-y-3">
          {lecturas.map((l) => (
            <li key={l.id}>
              <Link href={`/lecturas/${l.id}`} className="tarjeta flex items-center justify-between gap-4 p-4 transition hover:border-oro/40">
                <div>
                  <p className="text-xs uppercase tracking-widest text-violeta-suave">{NOMBRES_LECTURA[l.tipo]}</p>
                  <p className="font-medium">{l.titulo}</p>
                </div>
                <p className="shrink-0 text-xs text-texto-suave">{new Date(l.creado_en).toLocaleDateString("es-CO")}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
