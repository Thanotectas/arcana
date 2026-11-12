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
 * Precio de un paquete en tres monedas para que cualquiera se ubique: pesos colombianos (lo que se cobra), dólares y
 * pesos mexicanos. La grande es la de la persona (Colombia → COP, México → MXN, el resto → USD); debajo, las otras dos
 * y, si eligió otra moneda en el selector (ARS, CLP, EUR…), también esa.
 */
export function PrecioPrincipal({ cop, usdCentavos }: { cop: number; usdCentavos: number }) {
  const c = useContext(Contexto);
  const moneda = c?.moneda ?? "COP";
  const tasas = { porUSD: c?.porUSD ?? {}, fuente: "del día" as const };
  const mxn = convertir(tasas, cop, usdCentavos, "MXN");
  const grande: Record<string, [string, string]> = {
    COP: [formatoCOP(cop), "COP"],
    USD: [formatoUSD(usdCentavos), "USD"],
  };
  const chico: Record<string, string> = { COP: `${formatoCOP(cop)} COP`, USD: `${formatoUSD(usdCentavos)} USD` };
  if (mxn !== null) {
    const n = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.round(mxn));
    grande.MXN = [`≈ $${n}`, "MXN"];
    chico.MXN = `≈ $${n} MXN`;
  }
  const principal = moneda === "COP" ? "COP" : moneda === "MXN" && grande.MXN ? "MXN" : "USD";
  const otras = ["COP", "USD", "MXN"].filter((m) => m !== principal && chico[m]).map((m) => chico[m]);
  if (!["COP", "USD", "MXN"].includes(moneda)) {
    const v = convertir(tasas, cop, usdCentavos, moneda);
    if (v !== null) otras.push(`≈ ${formatoMoneda(v, moneda)}`);
  }
  const [cifra, sigla] = grande[principal];
  return (
    <>
      {cifra} <span className="text-base font-normal text-texto-suave">{sigla}</span>
      <span className="block text-xs font-normal text-texto-suave">{otras.join(" · ")}</span>
    </>
  );
}

/** «$ 19.900 COP · $4.99 USD · ≈ $92 MXN», empezando por la moneda de la persona. */
function enTresMonedas(c: Ctx | null, cop: number, usdCentavos: number) {
  const moneda = c?.moneda ?? "COP";
  const mxn = convertir({ porUSD: c?.porUSD ?? {}, fuente: "del día" }, cop, usdCentavos, "MXN");
  const partes: Record<string, string> = { COP: `${formatoCOP(cop)} COP`, USD: `${formatoUSD(usdCentavos)} USD` };
  if (mxn !== null) partes.MXN = `≈ $${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.max(1, Math.round(mxn)))} MXN`;
  const primera = moneda === "COP" ? "COP" : moneda === "MXN" && partes.MXN ? "MXN" : "USD";
  return [primera, ...["COP", "USD", "MXN"].filter((m) => m !== primera)].filter((m) => partes[m]).map((m) => partes[m]).join(" · ");
}

/** Un texto con «{precio}» (p. ej. el del Círculo) con el precio en las tres monedas. */
export function TextoTresMonedas({ texto, cop, usdCentavos }: { texto: string; cop: number; usdCentavos: number }) {
  const c = useContext(Contexto);
  return <>{texto.replace("{precio}", enTresMonedas(c, cop, usdCentavos))}</>;
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
