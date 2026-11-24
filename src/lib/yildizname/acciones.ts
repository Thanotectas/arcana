"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { SIGNOS } from "@/lib/zodiaco";
import { SIGNOS_IDIOMA } from "@/lib/juego/textos";
import { limpiarEscritura } from "@/lib/abjad/calculo";
import { calcularYildizname } from "./calculo";
import { TEXTOS_YILDIZNAME } from "./textos";

/** Yıldızname: nombre + nombre de la madre (obligatorio). Los errores vuelven ya traducidos. */
export async function accionYildizname(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const idioma = await getIdioma();
  const t = TEXTOS_YILDIZNAME[idioma];
  const nombre = String(formData.get("nombre") ?? "").trim().slice(0, 80);
  const escritura = limpiarEscritura(String(formData.get("escritura") ?? ""));
  const madre = String(formData.get("madre") ?? "").trim().slice(0, 80);
  const escrituraMadre = limpiarEscritura(String(formData.get("escritura_madre") ?? ""));
  if (!nombre && !escritura) return { error: t.errores.nombre };
  if (!madre && !escrituraMadre) return { error: t.errores.madre };

  const resultado = calcularYildizname({ nombre, escritura, madre, escrituraMadre }, idioma);
  if (!resultado) return { error: t.errores.escritura };
  const signo = SIGNOS.find((s) => s.id === resultado.signo)!;
  const nombreSigno = idioma === "es" ? signo.nombre : (SIGNOS_IDIOMA[idioma][signo.id] ?? signo.nombre);

  let id: string;
  try {
    id = await crearLectura({
      tipo: "yildizname",
      titulo: plantilla(t.tituloLectura, { nombre: nombre || resultado.abjad.persona.escritura, signo: nombreSigno }),
      entrada: { nombre, escritura: resultado.abjad.persona.escritura, madre, escrituraMadre: resultado.abjad.madre?.escritura ?? null },
      resultado: resultado as unknown as Record<string, unknown>,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
