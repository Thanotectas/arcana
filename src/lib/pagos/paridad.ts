/**
 * Precios en dólares ajustados por país (paridad de poder adquisitivo) para los mercados nuevos: 5 créditos a
 * US$2,49 son caros en India, Indonesia o África occidental. El país sale de la cabecera de Vercel
 * (x-vercel-ip-country) en el servidor; el cobro (Lemon Squeezy) usa el precio ajustado como custom_price y la
 * orden guarda ese monto, así el webhook lo valida igual que siempre. Los demás países pagan el precio base.
 */
export const FACTOR_PAIS: Record<string, number> = {
  // Asia
  IN: 0.4, ID: 0.45, PK: 0.4, BD: 0.4, NP: 0.4, LK: 0.45, PH: 0.5, VN: 0.45,
  // Turquía y mundo árabe
  TR: 0.55, EG: 0.4, MA: 0.55, DZ: 0.5, TN: 0.5, JO: 0.6, LB: 0.6, IQ: 0.55,
  // África francófona y anglófona
  SN: 0.45, CI: 0.45, ML: 0.45, BF: 0.45, BJ: 0.45, TG: 0.45, NE: 0.45, GN: 0.45, CM: 0.45, GA: 0.55, CG: 0.45, CD: 0.45, TD: 0.45, MG: 0.45,
  NG: 0.4, GH: 0.45, KE: 0.45, TZ: 0.45, UG: 0.45, ET: 0.4,  // Golfo: ingresos altos; US$2,49 por cinco lecturas allí parece poco serio. Precio más alto, no más bajo.
  AE: 2, KW: 2, QA: 2, SA: 1.6, BH: 1.6, OM: 1.6,
};

/** Factor de precio del país (1 si no tiene ajuste). */
export function factorPais(pais: string | null | undefined) {
  return (pais && FACTOR_PAIS[pais.toUpperCase()]) || 1;
}

/** Precio en centavos de dólar para el país: ajustado (más bajo o, en el Golfo, más alto), terminado en 9 y nunca menos de US$0,99. */
export function precioUSDPara(centavos: number, pais: string | null | undefined) {
  const f = factorPais(pais);
  if (f === 1) return centavos;
  return Math.max(99, Math.round((centavos * f) / 10) * 10 - 1);
}
