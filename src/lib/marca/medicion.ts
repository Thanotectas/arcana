/**
 * Píxel de Meta para medir los anuncios. Va el identificador del CONJUNTO DE
 * DATOS (Administrador de eventos → Conjuntos de datos → el de tipo web), no el
 * de una app de Meta: «Thanotectas Automation» es una app y no sirve aquí.
 * Vacío = apagado (ni aviso ni script).
 *
 * Solo se carga en la web (nunca en la app de Google Play, cuya ficha de
 * seguridad de datos declara que no se usan para publicidad) y solo si la
 * persona acepta el aviso. Eventos: PageView, CompleteRegistration (cuenta
 * nueva) y Purchase (compra aprobada, con valor y moneda). Nunca lecturas,
 * preguntas, fotos ni datos de nacimiento.
 */
export const META_PIXEL_ID = "";

/** Lo que eligió la persona en el aviso: "si" o "no" (localStorage). */
export const CLAVE_MEDICION = "arcana_medicion";

type Datos = Record<string, string | number>;
type Ventana = Window & { ArcanaMedir?: (evento: string, datos?: Datos) => void; __arcanaEventos?: [string, Datos | undefined][] };

/** Registra un evento estándar de Meta; si el píxel aún no cargó, queda en cola. */
export function medir(evento: string, datos?: Datos) {
  const w = window as Ventana;
  if (w.ArcanaMedir) w.ArcanaMedir(evento, datos);
  else (w.__arcanaEventos ??= []).push([evento, datos]);
}
