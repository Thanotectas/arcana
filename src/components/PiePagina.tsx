import Link from "next/link";
import { getT } from "@/lib/i18n/servidor";

export async function PiePagina() {
  const t = await getT();
  return (
    <footer className="border-t border-borde py-8 text-sm text-texto-suave">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {t.comun.marca}. {t.pie.aviso} <span className="opacity-70">{t.pie.creditosImagenes}</span>
        </p>
        <nav className="flex gap-4">
          <Link href="/terminos" className="hover:text-texto">{t.pie.terminos}</Link>
          <Link href="/privacidad" className="hover:text-texto">{t.pie.privacidad}</Link>
          <Link href="/creditos" className="hover:text-texto">{t.pie.precios}</Link>
        </nav>
      </div>
    </footer>
  );
}
