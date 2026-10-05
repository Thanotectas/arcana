import "server-only";
import { diccionario } from "@/lib/i18n/diccionarios";
import type { Idioma } from "@/lib/i18n/idiomas";
import { plantilla } from "@/lib/i18n/formato";
import { cartaDelDia, frase, mazoDelDia } from "@/lib/redes/carta-dia";
import { MAZOS } from "@/lib/tarot/mazos";
import { escaparHtml, sitio } from "@/lib/correo";

export const TIPOS_CORREO = ["carta_activo", "regreso_7", "regreso_30"] as const;
export type TipoCorreo = (typeof TIPOS_CORREO)[number];

export interface DatosCorreo {
  tipo: TipoCorreo;
  nombre: string | null;
  idioma: Idioma;
  /** Fecha AAAA-MM-DD (Bogotá) que decide la carta del día. */
  fecha: string;
  urlBaja: string;
  /** Texto de una oferta vigente (p. ej. precio de fundadores), si la hay. */
  oferta?: string;
}

export interface CorreoArmado {
  asunto: string;
  html: string;
  texto: string;
}

const ORO = "#d9b45a";
const ORO_SUAVE = "#f1d99a";
const NOCHE = "#0b0716";
const SUPERFICIE = "#150f26";
const TEXTO = "#ece6f7";
const TEXTO_SUAVE = "#a89fc0";

/**
 * Correo de campaña: la carta del día de Arcana como gancho, un botón y los
 * enlaces de baja. HTML de tablas (compatible con Gmail, Outlook y Apple Mail);
 * las imágenes van por URL pública del sitio.
 */
export function correoCampana(d: DatosCorreo): CorreoArmado {
  const t = diccionario(d.idioma);
  const base = sitio();
  const carta = cartaDelDia(d.fecha);
  const mazo = mazoDelDia(d.fecha);
  const nombre = d.nombre?.trim() || t.inicio.viajero;
  const textos = t.correos.tipos[d.tipo];
  const asunto = plantilla(textos.asunto, { carta: carta.nombre });
  const titulo = textos.titulo;
  const cuerpo = plantilla(textos.cuerpo, { carta: carta.nombre });
  const saludo = plantilla(t.correos.saludo, { nombre });
  const campana = `utm_source=correo&utm_medium=email&utm_campaign=${d.tipo}`;
  const urlCarta = `${base}/tarot?${campana}`;
  const urlImagen = `${base}/cartas/${mazo}/${carta.id}.webp`;
  const nombreMazo = mazo === "arcana" ? "Tarot Arcana" : MAZOS[mazo].nombre;
  // Los textos de las cartas están en español: el significado solo va en ese idioma.
  const significado = d.idioma === "es" ? frase(carta.significado, 180) : "";
  const enlaces: [string, string][] = [
    [`${base}/hoy?${campana}`, t.correos.enlaces.hoy],
    [`${base}/suenos?${campana}`, t.correos.enlaces.suenos],
    [`${base}/explorar?${campana}`, t.correos.enlaces.explorar],
  ];

  const html = `<!doctype html>
<html lang="${d.idioma}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="dark">
<title>${escaparHtml(asunto)}</title>
</head>
<body style="margin:0;padding:0;background:${NOCHE};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escaparHtml(cuerpo.slice(0, 140))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NOCHE};">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${SUPERFICIE};border:1px solid rgba(217,180,90,0.35);border-radius:18px;">
<tr><td align="center" style="padding:30px 28px 6px;">
  <img src="${base}/marca/icono-192.png" width="56" height="56" alt="Arcana" style="display:block;border-radius:14px;">
  <p style="margin:12px 0 0;font:600 11px/1.4 Inter,Arial,sans-serif;letter-spacing:4px;color:${ORO};text-transform:uppercase;">Arcana</p>
</td></tr>
<tr><td style="padding:10px 28px 0;">
  <p style="margin:0;font:15px/1.5 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};">${escaparHtml(saludo)}</p>
  <h1 style="margin:8px 0 0;font:600 30px/1.15 'Cormorant Garamond',Georgia,'Times New Roman',serif;color:${ORO_SUAVE};">${escaparHtml(titulo)}</h1>
  <p style="margin:14px 0 0;font:16px/1.6 Inter,Arial,sans-serif;color:${TEXTO};">${escaparHtml(cuerpo)}</p>
</td></tr>
<tr><td align="center" style="padding:26px 28px 0;">
  <a href="${urlCarta}" style="text-decoration:none;">
    <img src="${urlImagen}" width="180" alt="${escaparHtml(carta.nombre)}" style="display:block;width:180px;border-radius:12px;border:1px solid rgba(217,180,90,0.6);">
  </a>
  <p style="margin:14px 0 0;font:600 24px/1.2 'Cormorant Garamond',Georgia,serif;color:${ORO_SUAVE};">${escaparHtml(carta.nombre)}</p>
  <p style="margin:4px 0 0;font:12px/1.4 Inter,Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:${TEXTO_SUAVE};">${escaparHtml(nombreMazo)}</p>
  ${significado ? `<p style="margin:12px 0 0;font:italic 15px/1.55 'Cormorant Garamond',Georgia,serif;color:${TEXTO_SUAVE};max-width:400px;">${escaparHtml(significado)}</p>` : ""}
</td></tr>
<tr><td align="center" style="padding:26px 28px 8px;">
  <a href="${urlCarta}" style="display:inline-block;background:${ORO};color:${NOCHE};font:700 15px/1 Inter,Arial,sans-serif;text-decoration:none;padding:15px 30px;border-radius:999px;">${escaparHtml(t.correos.boton)}</a>
</td></tr>
${d.oferta ? `<tr><td align="center" style="padding:6px 28px 0;"><p style="margin:0;display:inline-block;padding:10px 18px;border-radius:999px;border:1px solid rgba(217,180,90,0.6);font:600 13px/1.4 Inter,Arial,sans-serif;color:${ORO_SUAVE};">${escaparHtml(d.oferta)}</p></td></tr>` : ""}
<tr><td align="center" style="padding:14px 28px 26px;">
  <p style="margin:0;font:13px/1.8 Inter,Arial,sans-serif;color:${TEXTO_SUAVE};">${escaparHtml(t.correos.tambien)}:
  ${enlaces.map(([u, e]) => `<a href="${u}" style="color:${ORO_SUAVE};text-decoration:underline;">${escaparHtml(e)}</a>`).join(" · ")}</p>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td align="center" style="padding:18px 20px 0;">
  <p style="margin:0;font:12px/1.7 Inter,Arial,sans-serif;color:#6f6689;">${escaparHtml(t.correos.porque)}
  <a href="${d.urlBaja}" style="color:#9a90b8;text-decoration:underline;">${escaparHtml(t.correos.baja)}</a><br>${escaparHtml(t.correos.direccion)}</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const texto = [
    saludo,
    "",
    titulo,
    cuerpo,
    "",
    `${plantilla(t.correos.hoySalio, { carta: carta.nombre })} (${nombreMazo})${significado ? `: ${significado}` : ""}`,
    `${t.correos.boton}: ${urlCarta}`,
    ...(d.oferta ? ["", d.oferta] : []),
    "",
    `${t.correos.tambien}:`,
    ...enlaces.map(([u, e]) => `- ${e}: ${u}`),
    "",
    `${t.correos.porque} ${t.correos.baja}: ${d.urlBaja}`,
    t.correos.direccion,
  ].join("\n");

  return { asunto, html, texto };
}
