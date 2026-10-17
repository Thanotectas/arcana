import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { MAZOS } from "@/lib/tarot/mazos";
import { cartaDelDia, frase, mazoDelDia } from "./carta-dia";
import { fechaLargaEs, type PublicacionProgramada } from "./calendario";
import { reelCartaDelDia } from "./reel";
import { reelPublicacion } from "./reel-publicacion";

/**
 * Kit diario para TikTok: TikTok no deja publicar por API sin una revisión
 * larga, así que cada mañana llega a la administración un correo con los
 * reels de ayer (carta del día y publicación del agente, ya generados) para
 * descargarlos y el texto listo para pegar. Subirlo a mano permite poner un audio en
 * tendencia, que es lo que más alcance da en TikTok.
 */
interface Pieza {
  titulo: string;
  video: string;
  texto: string;
}

function textoCarta(fecha: string) {
  const c = cartaDelDia(fecha);
  const mazo = mazoDelDia(fecha);
  return [
    `Carta del día: ${c.nombre} ✨`,
    "",
    frase(c.significado, 160),
    "",
    "¿Qué carta te salió a ti? Sácala gratis en miarcana.com (link en el perfil)",
    "",
    `#tarot #cartadeldia #tarotenespañol #${mazo === "arcana" ? "tarotarcana" : MAZOS[mazo].nombre.toLowerCase().replace(/[^a-z]/g, "")} #espiritualidad #fyp`,
  ].join("\n");
}

function textoPublicacion(p: Pick<PublicacionProgramada, "titulo" | "extracto" | "enlace">) {
  return [`${p.titulo} ✨`, "", p.extracto, "", `${p.enlace} (link en el perfil)`, "", "#miarcana #tarot #astrologia #espiritualidad #fyp #parati"].join("\n");
}

/** Reúne las piezas del día: el reel de la carta del día y el del agente, si salió. */
export async function piezasDelDia(admin: SupabaseClient<Database>, fecha: string): Promise<Pieza[]> {
  const piezas: Pieza[] = [];
  try {
    piezas.push({ titulo: `Carta del día · ${cartaDelDia(fecha).nombre}`, video: await reelCartaDelDia(admin, fecha), texto: textoCarta(fecha) });
  } catch (e) {
    console.error("[kit tiktok] reel carta del día:", e instanceof Error ? e.message : e);
  }
  const { data: publicadas } = await admin.from("publicaciones_programadas").select("*").eq("fecha", fecha).eq("estado", "publicada").limit(2);
  for (const p of (publicadas ?? []) as PublicacionProgramada[]) {
    try {
      piezas.push({ titulo: `${p.etiqueta} · ${p.titulo}`, video: await reelPublicacion(admin, p), texto: textoPublicacion(p) });
    } catch (e) {
      console.error("[kit tiktok] reel publicación:", e instanceof Error ? e.message : e);
    }
  }
  return piezas;
}

/** Envía el correo del kit; devuelve el id del envío. */
export async function enviarKitTiktok(fecha: string, piezas: Pieza[]): Promise<string> {
  const [para] = correosAdmin();
  if (!para) throw new Error("No hay correo de administración (ADMIN_CORREOS).");
  if (!piezas.length) throw new Error("No hay reels del día para el kit.");
  const pasos = "Abre TikTok → + → Subir → elige el video → Sonidos: busca uno en tendencia y bájale el volumen → pega el texto → Publicar.";
  const bloques = piezas
    .map(
      (p, i) => `<div style="margin:0 0 22px;padding:18px;border-radius:14px;background:#150f26;border:1px solid #ffffff1f">
<p style="margin:0 0 10px;color:#f1d99a;font-size:17px">${i + 1}. ${escaparHtml(p.titulo)}</p>
<p style="margin:0 0 12px"><a href="${p.video}?download=tiktok-${fecha}-${i + 1}.mp4" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Descargar el video</a></p>
<p style="margin:0 0 6px;color:#a89fc0;font-size:13px">Texto para pegar:</p>
<pre style="white-space:pre-wrap;font-family:inherit;margin:0;padding:12px;border-radius:10px;background:#0b0716;color:#ece6f7;font-size:14px;line-height:1.5">${escaparHtml(p.texto)}</pre>
</div>`,
    )
    .join("");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px;max-width:620px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Kit para TikTok</p>
<h1 style="font-size:24px;color:#f1d99a;margin:0 0 6px">${escaparHtml(fechaLargaEs(fecha))}</h1>
<p style="margin:0 0 20px;color:#a89fc0;font-size:14px">${escaparHtml(pasos)}</p>
${bloques}
<p style="margin:12px 0 0;color:#a89fc0;font-size:13px">Consejo: publica entre las 6 y las 9 de la noche y responde los primeros comentarios. Son los videos de ayer en Instagram y Facebook; en TikTok son nuevos.</p>
</div>`;
  const texto = `Kit para TikTok · ${fechaLargaEs(fecha)}\n${pasos}\n\n${piezas.map((p, i) => `${i + 1}. ${p.titulo}\nVideo: ${p.video}\n\n${p.texto}`).join("\n\n---\n\n")}\n\n${sitio()}/admin/redes`;
  const r = await enviarCorreo({ para, asunto: `TikTok: ${piezas.length} video${piezas.length === 1 ? "" : "s"} listo${piezas.length === 1 ? "" : "s"} para subir hoy`, html, texto, etiqueta: "kit_tiktok" });
  if (!r.ok) throw new Error(`Correo del kit: ${r.error}`);
  return r.id;
}
