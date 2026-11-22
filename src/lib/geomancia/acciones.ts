"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { calcularGeomancia } from "./calculo";
import { leerToques, trazarConAzar } from "./azar";
import { figuraPorId } from "./figuras";
import { TEXTOS_GEOMANCIA } from "./textos";

/**
 * Geomancia: la persona escribe su pregunta y traza las 16 líneas; el servidor pone la última marca de cada línea
 * con azar criptográfico (y con ella la paridad), levanta el escudo y guarda la lectura. Los errores vuelven traducidos.
 */
export async function accionGeomancia(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const idioma = await getIdioma();
  const t = TEXTOS_GEOMANCIA[idioma];
  const pregunta = String(formData.get("pregunta") ?? "").trim().replace(/\s+/g, " ").slice(0, 300);
  if (!pregunta) return { error: t.errores.pregunta };
  const toques = leerToques(formData.get("toques"));
  if (!toques) return { error: t.errores.lineas };

  let id: string;
  try {
    const resultado = calcularGeomancia(trazarConAzar(toques));
    const juez = figuraPorId(resultado.juez)!;
    id = await crearLectura({
      tipo: "geomancia",
      titulo: plantilla(t.tituloLectura, { juez: juez.nombre[idioma], pregunta: pregunta.length > 90 ? `${pregunta.slice(0, 89)}…` : pregunta }),
      entrada: { pregunta },
      resultado,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
