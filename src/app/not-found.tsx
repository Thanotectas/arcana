import Link from "next/link";
import { getT } from "@/lib/i18n/servidor";

export default async function NoEncontrado() {
  const t = await getT();
  return (
    <div className="py-20 text-center">
      <p className="font-display text-7xl text-oro-suave">404</p>
      <p className="mt-2 text-texto-suave">{t.noEncontrado.texto}</p>
      <Link href="/" className="boton boton-secundario mt-6">{t.comun.volverInicio}</Link>
    </div>
  );
}
