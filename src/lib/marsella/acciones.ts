"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { leerElegidas } from "@/lib/oraculos/sorteo";
import { sortearMarsella } from "./sorteo";
import { seleccionValida, type EntradaMarsella } from "./tirada";
import { TEXTOS_MARSELLA } from "./textos";

/**
 * Tarot de Marsella (tirage en croix): la persona elige cuatro posiciones del abanico boca abajo y el servidor
 * decide qué lámina hay en cada una; la quinta, la síntesis, se calcula. Los errores salen ya traducidos.
 */
export async function accionMarsella(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const idioma = await getIdioma();
  const textos = TEXTOS_MARSELLA[idioma];
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (pregunta.length < 3) return { error: textos.errores.pregunta };
  const elegidas = leerElegidas(formData.get("posiciones"));
  if (!seleccionValida(elegidas)) return { error: textos.errores.seleccion };

  let id: string;
  try {
    const resultado = sortearMarsella(elegidas);
    const entrada: EntradaMarsella = { pregunta };
    id = await crearLectura({ tipo: "marsella", titulo: `${textos.tituloLectura}: ${pregunta}`, entrada, resultado });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
