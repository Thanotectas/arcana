import Link from "next/link";
import { JsonLd } from "@/components/seo/BloquesSeo";
import type { TextosNumeros } from "@/lib/numeros-angelicales/textos";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/\/$/, "");

/** Migas de pan en el idioma de la página, con su BreadcrumbList. */
export function MigasNumeros({ items }: { items: { nombre: string; href: string }[] }) {
  return (
    <nav className="text-xs text-texto-suave">
      {items.map((it, i) => (
        <span key={it.href}>
          {i > 0 && <span className="mx-1.5">›</span>}
          {i < items.length - 1 ? <Link href={it.href} className="hover:text-texto">{it.nombre}</Link> : <span>{it.nombre}</span>}
        </span>
      ))}
      <JsonLd
        datos={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.nombre, item: BASE + it.href })),
        }}
      />
    </nav>
  );
}

/** Tarjeta de un número para las rejillas (índice y relacionados). */
export function TarjetaNumero({ numero, lema, href }: { numero: string; lema: string; href: string }) {
  return (
    <Link href={href} className="tarjeta group flex flex-col items-center gap-1 p-4 text-center transition hover:border-oro/50">
      <span dir="ltr" className="font-display text-3xl font-semibold [font-variant-numeric:lining-nums] text-oro-suave transition group-hover:text-oro">{numero}</span>
      <span className="text-xs leading-snug text-texto-suave">{lema}</span>
    </Link>
  );
}

/** Invitación suave a una lectura personalizada: numerología y tarot. */
export function CtaNumeros({ t }: { t: TextosNumeros["cta"] }) {
  return (
    <section className="tarjeta border-oro/40 bg-oro/5 p-6 text-center sm:p-8">
      <h2 className="font-display text-2xl sm:text-3xl">{t.titulo}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-texto-suave">{t.texto}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link href="/numerologia" className="boton boton-primario">{t.numerologia}</Link>
        <Link href="/tarot" className="boton boton-secundario">{t.tarot}</Link>
      </div>
      <p className="mt-2 text-xs text-texto-suave">{t.nota}</p>
    </section>
  );
}

export { BASE as BASE_SITIO };
