/**
 * Precios aproximados de los paquetes en la moneda de cada país, para que Sibila pueda responder
 * «¿cuánto es en pesos mexicanos?». El cobro siempre es en pesos colombianos (Bold) y el banco de
 * la persona hace la conversión, así que todo se presenta como aproximado.
 *
 * Tasas: open.er-api.com (gratis, sin llave), guardadas un día. Si no responde, se usa la tabla de
 * respaldo, en unidades por dólar, a partir del precio en dólares de cada paquete.
 */

export interface Moneda {
  codigo: string;
  nombre: string;
  paises: string;
}

export const MONEDAS: Moneda[] = [
  { codigo: "MXN", nombre: "pesos mexicanos", paises: "México" },
  { codigo: "USD", nombre: "dólares", paises: "Estados Unidos, Ecuador, El Salvador, Panamá, Puerto Rico" },
  { codigo: "ARS", nombre: "pesos argentinos", paises: "Argentina" },
  { codigo: "CLP", nombre: "pesos chilenos", paises: "Chile" },
  { codigo: "PEN", nombre: "soles", paises: "Perú" },
  { codigo: "BOB", nombre: "bolivianos", paises: "Bolivia" },
  { codigo: "GTQ", nombre: "quetzales", paises: "Guatemala" },
  { codigo: "HNL", nombre: "lempiras", paises: "Honduras" },
  { codigo: "NIO", nombre: "córdobas", paises: "Nicaragua" },
  { codigo: "CRC", nombre: "colones", paises: "Costa Rica" },
  { codigo: "DOP", nombre: "pesos dominicanos", paises: "República Dominicana" },
  { codigo: "UYU", nombre: "pesos uruguayos", paises: "Uruguay" },
  { codigo: "PYG", nombre: "guaraníes", paises: "Paraguay" },
  { codigo: "BRL", nombre: "reales", paises: "Brasil" },
  { codigo: "EUR", nombre: "euros", paises: "España y Europa" },
];

/** Moneda que se muestra según el país (código ISO de Vercel o de la región del idioma del navegador). */
export const PAIS_MONEDA: Record<string, string> = {
  MX: "MXN", US: "USD", EC: "USD", SV: "USD", PA: "USD", PR: "USD", VE: "USD", AR: "ARS", CL: "CLP", PE: "PEN", BO: "BOB",
  GT: "GTQ", HN: "HNL", NI: "NIO", CR: "CRC", DO: "DOP", UY: "UYU", PY: "PYG", BR: "BRL", CO: "COP",
  ES: "EUR", FR: "EUR", IT: "EUR", DE: "EUR", PT: "EUR", NL: "EUR", BE: "EUR", IE: "EUR", AT: "EUR", FI: "EUR", GR: "EUR",
};

/** Bandera de un país por su código ISO (para el selector de moneda). */
export const BANDERA_MONEDA: Record<string, string> = {
  COP: "🇨🇴", MXN: "🇲🇽", USD: "🇺🇸", ARS: "🇦🇷", CLP: "🇨🇱", PEN: "🇵🇪", BOB: "🇧🇴", GTQ: "🇬🇹", HNL: "🇭🇳", NIO: "🇳🇮",
  CRC: "🇨🇷", DOP: "🇩🇴", UYU: "🇺🇾", PYG: "🇵🇾", BRL: "🇧🇷", EUR: "🇪🇺",
};

/** Respaldo aproximado (unidades por 1 USD, nov 2026). Solo se usa si el servicio de tasas no responde. */
const RESPALDO_POR_USD: Record<string, number> = {
  COP: 3950, MXN: 18.5, USD: 1, ARS: 1450, CLP: 940, PEN: 3.45, BOB: 6.96, GTQ: 7.67, HNL: 26.2, NIO: 36.7, CRC: 505, DOP: 63, UYU: 40, PYG: 7200, BRL: 5.4, EUR: 0.86,
};

type Tasas = { porUSD: Record<string, number>; fuente: "del día" | "aproximadas" };

let memoria: { tasas: Tasas; hasta: number } | null = null;

/** Unidades de cada moneda por 1 USD (incluye COP si viene del servicio). */
export async function tasasDelDia(): Promise<Tasas> {
  if (memoria && memoria.hasta > Date.now()) return memoria.tasas;
  let tasas: Tasas = { porUSD: RESPALDO_POR_USD, fuente: "aproximadas" };
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 86400 }, signal: AbortSignal.timeout(4000) });
    if (r.ok) {
      const d = (await r.json()) as { result?: string; rates?: Record<string, number> };
      if (d.result === "success" && d.rates?.COP && d.rates.MXN) tasas = { porUSD: d.rates, fuente: "del día" };
    }
  } catch {
    // Sin conexión con el servicio: queda el respaldo.
  }
  memoria = { tasas, hasta: Date.now() + (tasas.fuente === "del día" ? 12 : 1) * 3600_000 };
  return tasas;
}

/** Valor aproximado en otra moneda de un precio dado en COP (y su equivalente en USD, para el respaldo). */
export function convertir(tasas: Tasas, precioCOP: number, precioUSDCentavos: number, codigo: string) {
  const cop = tasas.porUSD.COP;
  const destino = tasas.porUSD[codigo];
  if (!destino) return null;
  return cop ? (precioCOP / cop) * destino : (precioUSDCentavos / 100) * destino;
}

/**
 * Precio en las tres monedas de referencia para publicaciones y respuestas: «$ 1.900 COP · $0.49 USD · ≈ $9 MXN».
 * Usa las tasas del día ya cargadas (tasasDelDia) o, si aún no se cargaron, la tabla de respaldo: el MXN es aproximado.
 */
export function tresMonedas(precioCOP: number, precioUSDCentavos: number) {
  const tasas = memoria?.tasas ?? { porUSD: RESPALDO_POR_USD, fuente: "aproximadas" as const };
  const cop = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(precioCOP);
  const usd = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(precioUSDCentavos / 100);
  const mxn = convertir(tasas, precioCOP, precioUSDCentavos, "MXN");
  const mx = mxn === null ? "" : ` · ≈ $${new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(Math.max(1, Math.round(mxn)))} MXN`;
  return `$ ${cop} COP · $${usd} USD${mx}`;
}

export function formatoMoneda(valor: number, codigo: string) {
  const decimales = valor < 20 ? 2 : 0;
  const numero = new Intl.NumberFormat("es-419", { minimumFractionDigits: decimales, maximumFractionDigits: decimales }).format(valor);
  return `${numero} ${codigo}`;
}

/** Bloque para los hechos de Sibila: cada moneda con el precio aproximado de cada paquete. */
export async function preciosEnMonedas(paquetes: { nombre: string; precioCOP: number; precioUSDCentavos: number }[]) {
  const tasas = await tasasDelDia();
  const lineas = MONEDAS.map((m) => {
    const precios = paquetes.map((p) => {
      const v = convertir(tasas, p.precioCOP, p.precioUSDCentavos, m.codigo);
      return v === null ? null : `${p.nombre} ≈ ${formatoMoneda(v, m.codigo)}`;
    });
    return precios.includes(null) ? null : `- ${m.nombre} (${m.paises}): ${precios.join(" · ")}`;
  }).filter(Boolean);
  return `Precios aproximados en otras monedas (tasas ${tasas.fuente}; el cobro es en pesos colombianos y el banco de la persona hace la conversión, así que puede variar un poco):\n${lineas.join("\n")}`;
}
