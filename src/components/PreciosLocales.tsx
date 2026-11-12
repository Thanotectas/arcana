"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { BANDERA_MONEDA, MONEDAS, PAIS_MONEDA, convertir, formatoMoneda } from "@/lib/monedas";
import { formatoCOP, formatoUSD } from "@/lib/creditos";

/**
 * Precios aproximados en la moneda de cada país. Se cobra siempre en pesos colombianos; esto solo ayuda a ubicarse.
 * La moneda sale de lo que la persona eligió (se recuerda en el navegador), del país que detecta Vercel o de la
 * región del idioma del navegador (es-MX → pesos mexicanos).
 */
const CLAVE = "arcana-moneda";
type Ctx = { moneda: string; setMoneda: (m: string) => void; porUSD: Record<string, number> };
const Contexto = createContext<Ctx | null>(null);

function adivinar(pais?: string | null) {
  if (pais && PAIS_MONEDA[pais]) return PAIS_MONEDA[pais];
  for (const l of typeof navigator !== "undefined" ? navigator.languages ?? [] : []) {
    const region = l.split("-")[1]?.toUpperCase();
    if (region && PAIS_MONEDA[region]) return PAIS_MONEDA[region];
  }
  return "COP";
}

export function ProveedorMoneda({ porUSD, pais, children }: { porUSD: Record<string, number>; pais?: string | null; children: ReactNode }) {
  // El país (Vercel) ya se sabe en el servidor: fuera de Colombia el primer render sale en dólares, sin parpadeo.
  const [moneda, setEstado] = useState(() => (pais && PAIS_MONEDA[pais] ? PAIS_MONEDA[pais] : "COP"));
  useEffect(() => {
    let guardada: string | null = null;
    try {
      guardada = localStorage.getItem(CLAVE);
    } catch {
      // Sin almacenamiento: se adivina cada vez.
    }
    // Después de montar (el servidor no sabe la moneda): se ajusta una sola vez.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEstado(guardada && (guardada === "COP" || BANDERA_MONEDA[guardada]) ? guardada : adivinar(pais));
  }, [pais]);
  const setMoneda = (m: string) => {
    setEstado(m);
    try {
      localStorage.setItem(CLAVE, m);
    } catch {
      // Sin almacenamiento: vale solo para esta visita.
    }
  };
  return <Contexto.Provider value={{ moneda, setMoneda, porUSD }}>{children}</Contexto.Provider>;
}

/** «≈ 46 MXN» debajo de un precio en pesos colombianos (nada si la moneda elegida es COP). */
export function PrecioLocal({ cop, usdCentavos, className = "block text-xs font-normal text-texto-suave" }: { cop: number; usdCentavos: number; className?: string }) {
  const c = useContext(Contexto);
  if (!c || c.moneda === "COP") return null;
  const v = convertir({ porUSD: c.porUSD, fuente: "del día" }, cop, usdCentavos, c.moneda);
  // «COP» primero: el «$» del precio también lo usan otros países (México, Argentina, Chile…).
  return v === null ? null : <span className={className}>COP · ≈ {formatoMoneda(v, c.moneda)}</span>;
}

/**
 * Precio principal de un paquete: en Colombia, en pesos; fuera (o si la persona eligió otra moneda), en dólares, que
 * es lo que entiende cualquier visitante, y debajo lo que de verdad se cobra en pesos y su moneda aproximada.
 */
export function PrecioPrincipal({ cop, usdCentavos, cobro }: { cop: number; usdCentavos: number; cobro: string }) {
  const c = useContext(Contexto);
  if (!c || c.moneda === "COP") return <>{formatoCOP(cop)}</>;
  const local = c.moneda === "USD" ? null : convertir({ porUSD: c.porUSD, fuente: "del día" }, cop, usdCentavos, c.moneda);
  return (
    <>
      {formatoUSD(usdCentavos)} <span className="text-base font-normal text-texto-suave">USD</span>
      <span className="block text-xs font-normal text-texto-suave">
        {local !== null ? `≈ ${formatoMoneda(local, c.moneda)} · ` : ""}
        {cobro} {formatoCOP(cop)} COP
      </span>
    </>
  );
}

/** Un texto ya armado en pesos o en dólares, según la moneda de la persona (en Colombia, pesos). */
export function SegunMoneda({ cop, usd }: { cop: string; usd: string }) {
  const c = useContext(Contexto);
  return <>{!c || c.moneda === "COP" ? cop : usd}</>;
}

/** Selector «Ver precios en…» con las monedas de Latinoamérica, dólares y euros. */
export function SelectorMoneda({ etiqueta, nota, idioma = "es" }: { etiqueta: string; nota: string; idioma?: string }) {
  const c = useContext(Contexto);
  if (!c) return null;
  let nombres: Intl.DisplayNames | null = null;
  try {
    nombres = new Intl.DisplayNames([idioma], { type: "currency" });
  } catch {
    nombres = null;
  }
  const opciones = ["COP", ...MONEDAS.map((m) => m.codigo)];
  return (
    <div className="flex flex-col items-center gap-1 text-center text-sm text-texto-suave">
      <label className="flex flex-wrap items-center justify-center gap-2">
        <span>{etiqueta}</span>
        <select value={c.moneda} onChange={(e) => c.setMoneda(e.target.value)} className="campo w-auto py-1.5 text-sm">
          {opciones.map((m) => (
            <option key={m} value={m}>
              {BANDERA_MONEDA[m] ?? ""} {nombres?.of(m) ?? m} ({m})
            </option>
          ))}
        </select>
      </label>
      <span className="text-xs">{nota}</span>
    </div>
  );
}
