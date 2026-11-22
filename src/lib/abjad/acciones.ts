"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { calcularAbjad, limpiarEscritura } from "./calculo";
import { TEXTOS_ABJAD } from "./textos";

/** Numerología abjad del nombre (y, si se da, del de la madre). Los errores vuelven ya traducidos. */
export async function accionAbjad(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const idioma = await getIdioma();
  const t = TEXTOS_ABJAD[idioma];
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const escritura = limpiarEscritura(String(formData.get("escritura") ?? ""));
  const madre = String(formData.get("madre") ?? "").trim().slice(0, 80);
  const escrituraMadre = limpiarEscritura(String(formData.get("escritura_madre") ?? ""));
  if (!nombre && !escritura) return { error: t.errores.nombre };

  const resultado = calcularAbjad({ nombre, escritura, madre, escrituraMadre }, idioma);
  if (resultado.persona.total <= 0) return { error: t.errores.escritura };
  if ((madre || escrituraMadre) && !resultado.madre) return { error: t.errores.madre };

  let id: string;
  try {
    id = await crearLectura({
      tipo: "abjad",
      titulo: plantilla(t.tituloLectura, { nombre: nombre || resultado.persona.escritura, n: resultado.persona.total }),
      entrada: { nombre, escritura: resultado.persona.escritura, madre: madre || null, escrituraMadre: resultado.madre?.escritura ?? null },
      resultado,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
