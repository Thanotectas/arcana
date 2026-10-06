import Link from "next/link";
import { getT } from "@/lib/i18n/servidor";
import { REDES, WHATSAPP } from "@/lib/marca/redes";
import { IconoRed } from "./IconoRed";

export async function PiePagina() {
  const t = await getT();
  return (
    <footer className="border-t border-borde py-8 text-sm text-texto-suave">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex gap-4">
            <Link href="/terminos" className="hover:text-texto">{t.pie.terminos}</Link>
            <Link href="/privacidad" className="hover:text-texto">{t.pie.privacidad}</Link>
            <Link href="/creditos" className="hover:text-texto">{t.pie.precios}</Link>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <a href={WHATSAPP.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-exito/40 px-3 py-1.5 text-exito transition hover:border-exito hover:text-texto" title={`WhatsApp ${WHATSAPP.visible}`}>
              <IconoRed id="whatsapp" className="h-4 w-4" />
              <span>{t.pie.whatsapp}</span>
            </a>
            <span className="text-xs uppercase tracking-[0.25em] text-violeta-suave">{t.pie.siguenos}</span>
            {REDES.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full border border-borde px-3 py-1.5 transition hover:border-oro/50 hover:text-oro-suave" title={`${r.nombre} ${r.usuario}`}>
                <IconoRed id={r.id} className="h-4 w-4" />
                <span className="hidden sm:inline">{r.usuario}</span>
              </a>
            ))}
          </div>
        </div>
        <p>
          © {new Date().getFullYear()} {t.comun.marca}. {t.pie.aviso}
        </p>
      </div>
    </footer>
  );
}
