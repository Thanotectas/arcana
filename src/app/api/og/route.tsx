import type { NextRequest } from "next/server";
import { imagenOG } from "@/lib/marca/og";
import { BONO_INVITADO, nombreInvitador } from "@/lib/invitaciones";
import { diccionario } from "@/lib/i18n/diccionarios";
import { esIdioma, IDIOMA_PREDETERMINADO } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";

/**
 * Vista previa de una invitación: /api/og?inv=CODIGO&idioma=es
 * El texto se construye aquí a partir del código, nunca desde la URL, para
 * que nadie pueda fabricar imágenes con la marca y un mensaje propio.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const inv = (q.get("inv") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  if (inv.length < 4) return new Response("Solicitud no válida", { status: 400 });
  const idiomaParam = q.get("idioma");
  const t = diccionario(esIdioma(idiomaParam) ? idiomaParam : IDIOMA_PREDETERMINADO);
  const invitador = await nombreInvitador(inv);
  const titulo = invitador ? plantilla(t.invitar.ogTitulo, { nombre: invitador }) : t.invitar.ogTituloSinNombre;
  const subtitulo = plantilla(t.invitar.ogDescripcion, { bono: BONO_INVITADO });
  const respuesta = await imagenOG({ titulo, subtitulo });
  respuesta.headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
  return respuesta;
}
