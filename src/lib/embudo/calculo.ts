/**
 * Embudo por cohorte: de las cuentas creadas en el periodo, cuántas usaron la app,
 * volvieron otro día, intentaron pagar, pagaron y entraron al Círculo (en cualquier
 * momento hasta hoy), agrupadas por origen o por país. Las visitas nuevas del mismo
 * periodo van al comienzo. Funciones puras: los datos los trae datos.ts.
 */

export type Agrupacion = "origen" | "pais";

export const PASOS = ["visitas", "cuentas", "usaron", "volvieron", "intentaron", "pagaron", "circulo"] as const;
export type Paso = (typeof PASOS)[number];

export const NOMBRE_PASO: Record<Paso, string> = {
  visitas: "Visitas nuevas",
  cuentas: "Crearon cuenta",
  usaron: "Usaron la app",
  volvieron: "Volvieron otro día",
  intentaron: "Intentaron pagar",
  pagaron: "Pagaron",
  circulo: "Entraron al Círculo",
};

export const EXPLICACION_PASO: Record<Paso, string> = {
  visitas: "Primera visita de un navegador en el periodo.",
  cuentas: "Cuentas creadas en el periodo (sin las cuentas ilimitadas).",
  usaron: "Hicieron al menos una lectura o vieron la carta del día.",
  volvieron: "Usaron la app un día distinto al de su registro.",
  intentaron: "Abrieron al menos una orden de pago.",
  pagaron: "Tienen al menos una orden aprobada.",
  circulo: "Compraron el Círculo Arcana al menos una vez.",
};

export interface CuentaEmbudo { id: string; creado_en: string; origen: string | null; pais: string | null }
export interface ActividadEmbudo { usuario_id: string; dia: string } // día de Bogotá (AAAA-MM-DD)
export interface OrdenEmbudo { usuario_id: string; estado: string; paquete: string; moneda: string; monto_centavos: number }
export interface VisitaEmbudo { origen: string; pais: string | null }

export type Conteos = Record<Paso, number>;
export interface FilaEmbudo extends Conteos { clave: string; cop: number; usdCentavos: number }

export const SIN_ORIGEN = "desconocido";
export const SIN_PAIS = "sin-dato";
const OTROS = "otros";
const MAX_FILAS = 10;

/** Día de Bogotá (UTC-5, sin horario de verano) de una fecha ISO. */
export function diaBogota(iso: string) {
  return new Date(Date.parse(iso) - 5 * 3_600_000).toISOString().slice(0, 10);
}

const vacia = (clave: string): FilaEmbudo => ({ clave, visitas: 0, cuentas: 0, usaron: 0, volvieron: 0, intentaron: 0, pagaron: 0, circulo: 0, cop: 0, usdCentavos: 0 });

function sumar(a: FilaEmbudo, b: FilaEmbudo) {
  for (const p of PASOS) a[p] += b[p];
  a.cop += b.cop;
  a.usdCentavos += b.usdCentavos;
}

export function calcularEmbudo(entrada: {
  cuentas: CuentaEmbudo[];
  actividad: ActividadEmbudo[];
  ordenes: OrdenEmbudo[];
  visitas: VisitaEmbudo[];
  por: Agrupacion;
}): { total: FilaEmbudo; filas: FilaEmbudo[] } {
  const claveCuenta = (c: CuentaEmbudo) => (entrada.por === "origen" ? c.origen || SIN_ORIGEN : c.pais || SIN_PAIS);
  const claveVisita = (v: VisitaEmbudo) => (entrada.por === "origen" ? v.origen || SIN_ORIGEN : v.pais || SIN_PAIS);

  const dias = new Map<string, Set<string>>();
  for (const a of entrada.actividad) {
    const s = dias.get(a.usuario_id) ?? new Set<string>();
    s.add(a.dia);
    dias.set(a.usuario_id, s);
  }
  const ordenesDe = new Map<string, OrdenEmbudo[]>();
  for (const o of entrada.ordenes) ordenesDe.set(o.usuario_id, [...(ordenesDe.get(o.usuario_id) ?? []), o]);

  const filas = new Map<string, FilaEmbudo>();
  const fila = (clave: string) => {
    let f = filas.get(clave);
    if (!f) filas.set(clave, (f = vacia(clave)));
    return f;
  };

  for (const v of entrada.visitas) fila(claveVisita(v)).visitas++;
  for (const c of entrada.cuentas) {
    const f = fila(claveCuenta(c));
    f.cuentas++;
    const usados = dias.get(c.id);
    if (usados?.size) f.usaron++;
    const registro = diaBogota(c.creado_en);
    if (usados && [...usados].some((d) => d > registro)) f.volvieron++;
    const propias = ordenesDe.get(c.id) ?? [];
    if (propias.length) f.intentaron++;
    const aprobadas = propias.filter((o) => o.estado === "aprobada");
    if (aprobadas.length) f.pagaron++;
    if (aprobadas.some((o) => o.paquete === "circulo")) f.circulo++;
    for (const o of aprobadas) {
      if (o.moneda === "COP") f.cop += Math.round(o.monto_centavos / 100);
      else f.usdCentavos += o.monto_centavos;
    }
  }

  const total = vacia("total");
  for (const f of filas.values()) sumar(total, f);
  const ordenadas = [...filas.values()].sort((a, b) => b.cuentas - a.cuentas || b.visitas - a.visitas || a.clave.localeCompare(b.clave));
  if (ordenadas.length <= MAX_FILAS) return { total, filas: ordenadas };
  const otros = vacia(OTROS);
  for (const f of ordenadas.slice(MAX_FILAS - 1)) sumar(otros, f);
  return { total, filas: [...ordenadas.slice(0, MAX_FILAS - 1), otros] };
}

/** Porcentaje entero de a sobre b, o null si b es 0. */
export function porcentaje(a: number, b: number): number | null {
  return b > 0 ? Math.round((100 * a) / b) : null;
}

/**
 * El paso donde se pierde la mayor proporción de gente (sin contar el de visitas a
 * cuentas si aún no hay visitas). Solo se informa con al menos 10 personas en el paso
 * anterior, para no sacar conclusiones de dos o tres casos.
 */
export function mayorPerdida(f: Conteos): { desde: Paso; hasta: Paso; siguen: number } | null {
  let peor: { desde: Paso; hasta: Paso; siguen: number } | null = null;
  for (const hasta of PASOS) {
    const desde = BASE_DE[hasta];
    if (!desde || f[desde] < 10) continue;
    const siguen = porcentaje(f[hasta], f[desde]);
    if (siguen === null) continue;
    if (!peor || siguen < peor.siguen) peor = { desde, hasta, siguen };
  }
  return peor;
}

/**
 * Contra qué paso se mide cada uno. "Volvieron" no es requisito para pagar: intentar
 * pagar se mide desde quienes usaron la app.
 */
export const BASE_DE: Record<Paso, Paso | null> = {
  visitas: null,
  cuentas: "visitas",
  usaron: "cuentas",
  volvieron: "usaron",
  intentaron: "usaron",
  pagaron: "intentaron",
  circulo: "pagaron",
};
