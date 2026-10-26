import "server-only";
import { calcularCarta, type DatosNacimiento } from "@/lib/astro/carta";
import { calcularSinastria, resumenSinastria } from "@/lib/astro/sinastria";
import { buscarLugares } from "@/lib/astro/geocodificar";
import { NOMBRES_CUERPO, NOMBRES_ASPECTO, type Cuerpo } from "@/lib/astro/textos";
import { fechaHoy } from "@/lib/horoscopo";
import { cieloDelSigno, instanteDelDia, resumenCielo } from "@/lib/horoscopo/cielo";
import type { Signo } from "@/lib/zodiaco";
import { candidatosLugar, fechasEn, horaEn } from "@/lib/en-vivo-pedidos";
export { PIDE_CARTA, PIDE_SINASTRIA, fechasEn, horaEn } from "@/lib/en-vivo-pedidos";
import type { GraficoVivo, PlanetaVivo } from "@/lib/en-vivo-graficos";

/**
 * Carta astral, sinastría y cielo del día para el directo: interpreta lo que
 * la persona escribió en el chat («carta astral 14/03/1985 10:30 Medellín»,
 * «sinastría 14/03/1985 y 22/08/1990»), calcula y devuelve el gráfico que
 * dibuja el escenario y el resumen para Sibila.
 */

/** Ciudad que nombra el mensaje: se buscan los trozos candidatos hasta encontrar una. */
async function lugarEn(texto: string) {
  for (const candidato of candidatosLugar(texto)) {
    const [lugar] = await buscarLugares(candidato, 1).catch(() => []);
    if (lugar) return lugar;
  }
  return null;
}

const CUERPOS: Cuerpo[] = ["sol", "luna", "mercurio", "venus", "marte", "jupiter", "saturno", "urano", "neptuno", "pluton"];
const planetasVivo = (lista: { cuerpo: Cuerpo; longitud: number; retrogrado: boolean }[]): PlanetaVivo[] =>
  lista.filter((p) => CUERPOS.includes(p.cuerpo)).map((p) => ({ c: p.cuerpo, lon: Math.round(p.longitud * 100) / 100, r: p.retrogrado }));

const BOGOTA = { latitud: 4.711, longitud: -74.0721, zonaHoraria: "America/Bogota" };
const fechaCorta = (f: string) => f.split("-").reverse().join("/");

export async function prepararCarta(autor: string, texto: string): Promise<{ entrada: string; grafico: GraficoVivo } | null> {
  const [fecha] = fechasEn(texto);
  if (!fecha) return null;
  const hora = horaEn(texto);
  const lugar = await lugarEn(texto);
  const completa = Boolean(hora && lugar);
  const datos: DatosNacimiento = {
    nombre: autor,
    fecha,
    hora: hora ?? "12:00",
    horaDesconocida: !hora,
    lugar: lugar?.nombre ?? "",
    ...(lugar ? { latitud: lugar.latitud, longitud: lugar.longitud, zonaHoraria: lugar.zonaHoraria } : BOGOTA),
  };
  const c = calcularCarta(datos);
  const sig = (cuerpo: Cuerpo) => c.planetas.find((p) => p.cuerpo === cuerpo)!;
  const linea = (cuerpo: Cuerpo) => `${NOMBRES_CUERPO[cuerpo]} en ${sig(cuerpo).signo.nombre}${completa ? ` (casa ${sig(cuerpo).casa})` : ""}`;
  const aspectos = c.aspectos.filter((a) => CUERPOS.includes(a.a) && CUERPOS.includes(a.b)).slice(0, 8);
  const entrada = [
    `Nacimiento: ${fechaCorta(fecha)}${hora ? ` a las ${hora}` : " (sin hora)"}${lugar ? ` en ${lugar.nombre}${lugar.pais ? `, ${lugar.pais}` : ""}` : " (sin ciudad)"}.`,
    [linea("sol"), linea("luna"), completa ? `Ascendente en ${c.ascendente.signo.nombre}` : "Sin Ascendente (falta la hora o la ciudad)"].join(". ") + ".",
    `${linea("mercurio")}, ${linea("venus")}, ${linea("marte")}.`,
    `Aspectos más exactos: ${aspectos.slice(0, 4).map((a) => `${NOMBRES_CUERPO[a.a]} ${NOMBRES_ASPECTO[a.tipo].toLowerCase()} ${NOMBRES_CUERPO[a.b]}`).join("; ") || "ninguno estrecho"}.`,
  ].join("\n");
  return {
    entrada,
    grafico: {
      tipo: "carta",
      planetas: planetasVivo(c.planetas),
      asc: completa ? Math.round(c.ascendente.longitud * 100) / 100 : null,
      mc: completa ? Math.round(c.medioCielo.longitud * 100) / 100 : null,
      aspectos: aspectos.map((a) => ({ a: a.a, b: a.b, t: a.tipo })),
      fecha: fechaCorta(fecha),
      hora,
      lugar: lugar?.nombre ?? null,
    },
  };
}

export function prepararSinastria(autor: string, texto: string): { entrada: string; grafico: GraficoVivo } | null {
  const [fa, fb] = fechasEn(texto);
  if (!fa || !fb) return null;
  const datos = (nombre: string, fecha: string): DatosNacimiento => ({ nombre, fecha, hora: "12:00", horaDesconocida: true, lugar: "", ...BOGOTA });
  const da = datos(autor, fa);
  const db = datos("su pareja", fb);
  const r = calcularSinastria(da, db);
  const hilos = r.aspectos
    .filter((x) => x.a !== "ascendente" && x.b !== "ascendente")
    .slice(0, 8)
    .map((x) => ({ a: x.a as Cuerpo, b: x.b as Cuerpo, armonico: x.aporte >= 0 }));
  return {
    entrada: `Fechas: ${fechaCorta(fa)} (persona A, ${autor}) y ${fechaCorta(fb)} (persona B). Sin horas de nacimiento: no hay Ascendentes ni casas.\n${resumenSinastria(r)}`,
    grafico: {
      tipo: "sinastria",
      a: { fecha: fechaCorta(fa), planetas: planetasVivo(calcularCarta(da).planetas) },
      b: { fecha: fechaCorta(fb), planetas: planetasVivo(calcularCarta(db).planetas) },
      hilos,
      afinidad: r.puntaje,
    },
  };
}

/** Cielo de hoy para un signo (el mismo del horóscopo de la página). */
export function prepararCielo(signo: Signo): { entrada: string; grafico: GraficoVivo } {
  const cielo = cieloDelSigno(signo, instanteDelDia(fechaHoy()));
  return {
    entrada: resumenCielo(cielo),
    grafico: { tipo: "cielo", signo: signo.id, planetas: cielo.planetas.map((p) => ({ c: p.cuerpo, lon: Math.round(p.longitud * 100) / 100, r: p.retrogrado, trato: p.trato })) },
  };
}
