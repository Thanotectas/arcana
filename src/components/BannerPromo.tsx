"use client";

import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { useT } from "@/lib/i18n/cliente";
import { PROMO, TEXTOS_PROMO, codigoPromo } from "@/lib/promo";

/** Cuenta regresiva «2d 05:12:09» hasta el fin de la promoción (se calcula en el navegador). */
function Reloj({ dias }: { dias: string }) {
  const [ahora, setAhora] = useState<number | null>(null);
  useEffect(() => {
    const tic = () => setAhora(Date.now());
    const t0 = setTimeout(tic, 0);
    const id = setInterval(tic, 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(id);
    };
  }, []);
  if (ahora === null) return null;
  const s = Math.max(0, Math.floor((PROMO.hasta - ahora) / 1000));
  const d = Math.floor(s / 86400);
  const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return <span dir="ltr" className="font-mono tabular-nums">{d > 0 ? `${d}${dias} ` : ""}{hh}:{mm}:{ss}</span>;
}

/** Banner de la promoción de Black Friday / viernes blanco, con el código aplicado de un toque. */
export function BannerPromo() {
  const { idioma } = useT();
  const t = TEXTOS_PROMO[idioma] ?? TEXTOS_PROMO.es;
  return (
    <a href={`/c/${codigoPromo(idioma)}`} className="tarjeta aparecer flex flex-wrap items-center gap-4 border-oro/60 bg-gradient-to-r from-oro/15 via-oro/5 to-violeta/10 p-4 hover:border-oro">
      <Gift className="h-8 w-8 shrink-0 text-oro" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-display text-xl text-oro-suave">{t.titulo}</p>
        <p className="text-sm text-texto-suave">{t.texto}</p>
        <p className="mt-1 text-xs text-oro-suave">{t.quedan} <Reloj dias={t.dias} /></p>
      </div>
      <span className="boton boton-primario shrink-0">{t.boton}</span>
    </a>
  );
}
