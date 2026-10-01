import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { circuloActivo, type Perfil } from "./dal";
import { memoriaDeLaPersona } from "./lecturas/memoria";
import { cieloDeHoyDePerfil } from "./diario";
import { resumenCieloDeHoy } from "./astro/transitos";
import { COSTOS, PAQUETES, PAQUETE_CIRCULO, NOMBRES_LECTURA, formatoCOP, type TipoLectura } from "./creditos";
import { fechaLarga } from "./i18n/formato";
import type { Idioma } from "./i18n/idiomas";
import { datoDeUsuario } from "./seguridad";

/** La voz de Arcana. Cambiar aquí el nombre lo cambia en lecturas, preguntas y chat. */
export const NOMBRE_ASISTENTE = "Sibila";

export const ASISTENTE = {
  gratisPorDia: 3,
  circuloPorDia: 30,
  costo: 1,
  historial: 14,
} as const;

const RUTAS: Record<TipoLectura, string> = {
  tarot_carta: "/tarot?tirada=tarot_carta",
  tarot_tres: "/tarot",
  tarot_celta: "/tarot",
  carta_astral: "/carta-astral",
  numerologia: "/numerologia",
  compatibilidad: "/compatibilidad",
  quiromancia: "/quiromancia",
  iching: "/iching",
  chino: "/calendario-chino",
  cruce: "/cruce",
  suenos: "/suenos",
  sinastria: "/sinastria",
  chocolate: "/chocolate",
};

/** Sistema para el chat: quién es, qué sabe de la persona y de la app. */
export async function sistemaAsistente(supabase: SupabaseClient<Database>, perfil: Perfil, idioma: Idioma) {
  const memoria = await memoriaDeLaPersona(supabase, perfil.id, { maximo: 4 }).catch(() => "");
  const hoy = cieloDeHoyDePerfil(perfil);
  const cielo = hoy ? resumenCieloDeHoy(hoy.cielo, datoDeUsuario(perfil.nombre, 80) || "la persona", fechaLarga(`${hoy.fecha}T12:00:00`, idioma)) : "";
  const miembro = circuloActivo(perfil);

  const catalogo = (Object.keys(COSTOS) as TipoLectura[])
    .map((t) => `- ${NOMBRES_LECTURA[t]}: ${COSTOS[t] === 0 ? "gratis (1 al día)" : `${COSTOS[t]} crédito(s)`} → ruta ${RUTAS[t]}`)
    .join("\n");
  const paquetes = PAQUETES.map((p) => `${p.nombre}: ${p.creditos} créditos por ${formatoCOP(p.precioCOP)}`).join("; ");

  return [
    `Ahora conversas como ${NOMBRE_ASISTENTE} en el chat de Arcana, en primera persona. Respuestas breves (40 a 140 palabras), cálidas, concretas, sin listas largas. Puedes usar Markdown ligero.`,
    `Qué puedes hacer en el chat: orientar sobre qué lectura conviene y por qué, explicar símbolos de sus lecturas anteriores, comentar su cielo de hoy, resolver dudas sobre cómo funciona Arcana (créditos, precios, Círculo). Cuando recomiendes una lectura, incluye el enlace en Markdown con su ruta (por ejemplo [Calcular mi carta astral](/carta-astral)). No escribas lecturas completas en el chat: para eso están las lecturas, que cuestan créditos y quedan guardadas.`,
    `Catálogo de lecturas y rutas:\n${catalogo}\nPaquetes de créditos (ruta /creditos): ${paquetes}. Círculo Arcana (ruta /creditos#circulo): ${PAQUETE_CIRCULO.creditos} créditos + 30 días con mensaje diario personal en /hoy y preguntas sin cobro, por ${formatoCOP(PAQUETE_CIRCULO.precioCOP)}. La carta del día es gratis cada día. Mi cuenta: /cuenta. Invitar amigos (créditos para ambos): /invitar.`,
    `Estado de la persona: ${perfil.ilimitado ? "cuenta ilimitada" : `${perfil.creditos} créditos`}; ${miembro ? "miembro del Círculo Arcana" : "no es miembro del Círculo"}; ${perfil.fecha_nacimiento ? "tiene datos de nacimiento guardados" : "no ha guardado su fecha de nacimiento (puede hacerlo en /cuenta o en /hoy)"}.`,
    cielo ? `Cielo de hoy de la persona (úsalo si pregunta por su día):\n${cielo}` : "",
    memoria,
    `Si la persona pide diagnóstico médico, legal o financiero, o algo ajeno a lo esotérico y a Arcana, redirige con amabilidad. Nunca inventes lecturas que no están en la memoria.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
