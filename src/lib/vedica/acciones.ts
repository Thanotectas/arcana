"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { zonaHorariaValida } from "@/lib/seguridad";
import type { DatosNacimiento } from "@/lib/astro/carta";
import { calcularKundli } from "./calculo";
import { calcularMilan } from "./milan";
import { textosVedica, type TextosVedica } from "./textos";

function leerNacimiento(formData: FormData, sufijo: string): DatosNacimiento {
  const v = (campo: string) => formData.get(`${campo}${sufijo}`);
  return {
    nombre: String(v("nombre") ?? "").trim().slice(0, 80),
    fecha: String(v("fecha") ?? ""),
    hora: String(v("hora") ?? "12:00") || "12:00",
    horaDesconocida: v("hora_desconocida") === "on",
    lugar: String(v("lugar") ?? "").trim().slice(0, 120),
    latitud: Number(v("latitud")),
    longitud: Number(v("longitud")),
    zonaHoraria: String(v("zona_horaria") ?? ""),
  };
}

/** Devuelve el error ya traducido, o null si los datos sirven. */
function errorNacimiento(d: DatosNacimiento, e: TextosVedica["errores"]): string | null {
  if (!d.nombre) return e.nombre;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d.fecha) || Number.isNaN(new Date(`${d.fecha}T00:00:00Z`).getTime())) return e.fecha;
  if (!d.horaDesconocida && !/^([01]\d|2[0-3]):[0-5]\d$/.test(d.hora)) return e.hora;
  if (d.horaDesconocida) d.hora = "12:00";
  if (!d.lugar || !Number.isFinite(d.latitud) || !Number.isFinite(d.longitud) || !zonaHorariaValida(d.zonaHoraria)) return e.lugar;
  if (Math.abs(d.latitud) > 90 || Math.abs(d.longitud) > 180) return e.lugar;
  const anio = Number(d.fecha.slice(0, 4));
  if (anio < 1900 || anio > new Date().getFullYear() || d.fecha > new Date().toISOString().slice(0, 10)) return e.anio;
  return null;
}

// ---------------------------------------------------------------------------
// Kundli: carta natal védica (sideral Lahiri), dashas y Manglik.
// ---------------------------------------------------------------------------
export async function accionKundli(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const t = textosVedica(await getIdioma());
  const datos = leerNacimiento(formData, "");
  const error = errorNacimiento(datos, t.errores);
  if (error) return { error };

  let id: string;
  try {
    const resultado = calcularKundli(datos);
    id = await crearLectura({
      tipo: "kundli",
      titulo: plantilla(t.kundli.tituloLectura, { nombre: datos.nombre }),
      entrada: datos,
      resultado,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

// ---------------------------------------------------------------------------
// Kundli milan: Ashtakoot Guna Milan entre dos personas.
// ---------------------------------------------------------------------------
export async function accionKundliMilan(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const t = textosVedica(await getIdioma());
  const a = leerNacimiento(formData, "");
  const b = leerNacimiento(formData, "_b");
  const errorA = errorNacimiento(a, t.errores);
  if (errorA) return { error: errorA };
  const errorB = errorNacimiento(b, t.errores);
  if (errorB) return { error: plantilla(t.errores.segunda, { error: errorB }) };

  let id: string;
  try {
    const resultado = calcularMilan(a, b);
    id = await crearLectura({
      tipo: "kundli_milan",
      titulo: plantilla(t.milan.tituloLectura, { a: a.nombre, b: b.nombre, total: resultado.total }),
      entrada: { a, b },
      resultado,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
