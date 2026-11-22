"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { leerElegidas } from "@/lib/oraculos/sorteo";
import { sortearIskambil } from "./sorteo";
import { esTiradaIskambil, seleccionValidaIskambil, type EntradaIskambil } from "./tirada";
import { TEXTOS_ISKAMBIL } from "./textos";

/**
 * Iskambil falı: la persona elige 3 o 5 posiciones del abanico de 52 cartas boca abajo y el servidor decide qué carta
 * hay en cada una. Los errores salen ya traducidos.
 */
export async function accionIskambil(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const idioma = await getIdioma();
  const textos = TEXTOS_ISKAMBIL[idioma];
  const tirada = String(formData.get("tirada") ?? "");
  if (!esTiradaIskambil(tirada)) return { error: textos.errores.tirada };
  const pregunta = String(formData.get("pregunta") ?? "").trim().slice(0, 300);
  if (pregunta.length < 3) return { error: textos.errores.pregunta };
  const elegidas = leerElegidas(formData.get("posiciones"));
  if (!seleccionValidaIskambil(elegidas, tirada)) return { error: textos.errores.seleccion };

  let id: string;
  try {
    const resultado = sortearIskambil(tirada, elegidas);
    const entrada: EntradaIskambil = { pregunta };
    id = await crearLectura({ tipo: "iskambil", titulo: `${textos.tituloLectura}: ${pregunta}`, entrada, resultado });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
