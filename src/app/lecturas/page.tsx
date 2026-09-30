import type { Metadata } from "next";
import { getLecturas, requerirUsuario } from "@/lib/dal";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { ListaLecturas } from "@/components/ListaLecturas";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.lecturas.lista.titulo };
}

export default async function PaginaLecturas() {
  await requerirUsuario();
  const [lecturas, t, idioma] = await Promise.all([getLecturas(200), getT(), getIdioma()]);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="font-display text-4xl font-semibold">{t.lecturas.lista.titulo}</h1>
      {lecturas.length === 0 ? (
        <p className="tarjeta p-6 text-texto-suave">{t.lecturas.lista.vacio}</p>
      ) : (
        <ListaLecturas
          idioma={idioma}
          lecturas={lecturas.map((l) => ({ id: l.id, tipo: l.tipo, titulo: l.titulo, creado_en: l.creado_en, estado: l.estado }))}
        />
      )}
    </div>
  );
}
