"use server";

import { redirect } from "next/navigation";
import { crearLectura, manejarError, type EstadoAccion } from "@/lib/lecturas/crear";
import { getIdioma } from "@/lib/i18n/servidor";
import { plantilla } from "@/lib/i18n/formato";
import { calcularJodoh, calcularWeton, fechaValida } from "./calculo";
import { textosWeton } from "./textos";

/*
 * Weton y Weton Jodoh (Primbon Jawa). Los errores vuelven ya traducidos: el formulario los muestra tal cual.
 */

function leerNombre(formData: FormData, campo: string) {
  return String(formData.get(campo) ?? "").trim().slice(0, 80);
}

function leerFecha(formData: FormData, campo: string): string | null {
  const fecha = String(formData.get(campo) ?? "");
  if (!fechaValida(fecha)) return null;
  const anio = Number(fecha.slice(0, 4));
  return anio >= 1900 && anio <= new Date().getFullYear() ? fecha : null;
}

export async function accionWeton(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const t = textosWeton(await getIdioma());
  const nombre = leerNombre(formData, "nombre");
  const fecha = leerFecha(formData, "fecha");
  if (!nombre) return { error: t.errores.nombre };
  if (!fecha) return { error: t.errores.fecha };
  const despuesAtardecer = formData.get("atardecer") === "on";
  let id: string;
  try {
    const r = calcularWeton(fecha, despuesAtardecer);
    id = await crearLectura({
      tipo: "weton",
      titulo: plantilla(t.tituloLectura, { nombre, weton: r.weton }),
      entrada: { nombre, fecha, despuesAtardecer },
      resultado: r,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}

export async function accionWetonJodoh(_prev: EstadoAccion, formData: FormData): Promise<EstadoAccion> {
  const t = textosWeton(await getIdioma());
  const nombreA = leerNombre(formData, "nombre_a");
  const nombreB = leerNombre(formData, "nombre_b");
  const fechaA = leerFecha(formData, "fecha_a");
  const fechaB = leerFecha(formData, "fecha_b");
  if (!nombreA || !nombreB) return { error: t.errores.nombre2 };
  if (!fechaA || !fechaB) return { error: t.errores.fecha2 };
  const a = { nombre: nombreA, fecha: fechaA, despuesAtardecer: formData.get("atardecer_a") === "on" };
  const b = { nombre: nombreB, fecha: fechaB, despuesAtardecer: formData.get("atardecer_b") === "on" };
  let id: string;
  try {
    const r = calcularJodoh(calcularWeton(a.fecha, a.despuesAtardecer), calcularWeton(b.fecha, b.despuesAtardecer));
    id = await crearLectura({
      tipo: "weton_jodoh",
      titulo: plantilla(t.tituloLecturaJodoh, { a: nombreA, b: nombreB, resultado: r.nombre }),
      entrada: { a, b },
      resultado: r,
    });
  } catch (e) {
    return manejarError(e);
  }
  redirect(`/lecturas/${id}`);
}
