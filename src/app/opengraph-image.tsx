import { imagenOG, TAMANO_OG } from "@/lib/marca/og";
import { getT } from "@/lib/i18n/servidor";

export const alt = "Arcana";
export const size = TAMANO_OG;
export const contentType = "image/png";

export default async function Imagen() {
  const t = await getT();
  return imagenOG({ titulo: `${t.portada.titulo1} ${t.portada.titulo2}`, subtitulo: t.meta.descripcion });
}
