"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { calcularAbjad, calcularPersona, limpiarEscritura } from "./calculo";
import { TEXTOS_COMPLETA } from "./completa";
import { COSTO_NOMBRE_COMPLETO } from "@/lib/creditos";
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

  // Lectura completa (premium): letra regente, amor y trabajo según los elementos y, si se da, otro nombre.
  const completa = formData.get("completa") === "1";
  const otro = completa ? String(formData.get("otro") ?? "").trim().slice(0, 80) : "";
  const escrituraOtro = completa ? limpiarEscritura(String(formData.get("escritura_otro") ?? "")) : "";
  if (otro || escrituraOtro) {
    const p = calcularPersona(otro, escrituraOtro, idioma);
    if (p.total > 0) resultado.otro = p;
  }

  let id: string;
  try {
    id = await crearLectura({
      tipo: "abjad",
      titulo: plantilla(completa ? TEXTOS_COMPLETA[idioma].tituloLectura : t.tituloLectura, { nombre: nombre || resultado.persona.escritura, n: resultado.persona.total }),
      entrada: { nombre, escritura: resultado.persona.escritura, madre: madre || null, escrituraMadre: resultado.madre?.escritura ?? null, ...(completa ? { completa: true, otro: otro || null } : {}) },
      resultado,
      ...(completa ? { costo: COSTO_NOMBRE_COMPLETO } : {}),
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
