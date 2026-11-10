import type { Metadata } from "next";
import { getT } from "@/lib/i18n/servidor";
import { CANALES_HUB, enlaceHub, origenDesdeRef, refHubValido, type CanalHub } from "@/lib/marca/redes";
import { Marca } from "@/components/Logo";
import { HubRedes, type CanalVista } from "@/components/HubRedes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.hub.titulo, description: t.hub.intro, alternates: { canonical: "/redes" }, openGraph: { title: `${t.hub.titulo} · Arcana`, description: t.hub.intro } };
}

/**
 * A dónde lleva cada canal. El código del hub (?ref=instagram-bio) viaja con
 * los destinos propios: la app recibe utm_source/utm_medium (los lee el proxy
 * y quedan en «Por dónde llegan») y el bot de Telegram recibe ?start=.
 */
function destino(c: CanalHub, ref: string) {
  if (c.id === "carta") {
    if (!ref) return "/";
    const { fuente, medio } = origenDesdeRef(ref);
    return `/?utm_source=${encodeURIComponent(fuente)}&utm_medium=${encodeURIComponent(medio)}&utm_campaign=hub`;
  }
  if (c.id === "telegram") return `${c.url}?start=hub-${ref || "directo"}`;
  return c.url;
}

/** Hub de redes: todos los canales de Arcana en una página, para la biografía de cada red, los correos y los videos. */
export default async function PaginaRedes({ searchParams }: { searchParams: Promise<{ ref?: string | string[] }> }) {
  const [t, sp] = await Promise.all([getT(), searchParams]);
  const ref = refHubValido(typeof sp.ref === "string" ? sp.ref : "");
  const textos = t.hub.canales as Record<string, { nombre: string; detalle: string }>;
  const canales: CanalVista[] = CANALES_HUB.map((c) => {
    const href = destino(c, ref);
    return { id: c.id, href, externo: !href.startsWith("/"), nombre: textos[c.id]?.nombre ?? c.id, detalle: textos[c.id]?.detalle ?? "", icono: c.icono, color: c.color, principal: c.principal };
  });

  return (
    <div className="mx-auto max-w-md space-y-7">
      <header className="flex flex-col items-center gap-3 text-center">
        <Marca tamano={72} />
        <p className="text-sm uppercase tracking-[0.3em] text-violeta-suave">{t.hub.seccion}</p>
        <h1 className="font-display text-4xl font-semibold">{t.hub.titulo}</h1>
        <p className="text-texto-suave">{t.hub.intro}</p>
      </header>
      <HubRedes canales={canales} codigo={ref} enlace={enlaceHub(ref)} textos={{ compartir: t.hub.compartir, copiar: t.hub.copiar, copiado: t.hub.copiado, titulo: t.hub.titulo, intro: t.hub.intro }} />
      <p className="text-center text-xs text-texto-suave">{t.pie.aviso}</p>
    </div>
  );
}
