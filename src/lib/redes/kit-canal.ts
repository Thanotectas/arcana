import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { enviarCorreo, escaparHtml, sitio } from "@/lib/correo";
import { correosAdmin } from "@/lib/admin";
import { CANAL_WHATSAPP } from "@/lib/marca/redes";
import { PROXIMO_DIRECTO, diasParaDirecto, estadoDirecto } from "@/lib/marca/directo";
import { cartaDelDia, frase } from "./carta-dia";
import { fechaLargaEs, sumarDias, type PublicacionProgramada } from "./calendario";
import { reelPublicacion } from "./reel-publicacion";

/**
 * Kit diario del canal de WhatsApp: WhatsApp no deja publicar en canales desde
 * otros programas, así que cada mañana llega a la administración un correo con
 * lo del día listo para pegar: la imagen de la carta del día y su texto, y
 * según el día una encuesta (lunes), un video (martes y jueves), el aviso del
 * directo (el día que hay) o un regalo (viernes).
 */
export interface PiezaCanal {
  titulo: string;
  texto: string;
  imagen?: string;
  video?: string;
}

const REGALOS = [
  "🔮 ¿Una pregunta de sí o no? El péndulo te responde gratis una vez al día 👉 miarcana.com/wa/pendulo\nReacciona 💜 si te respondió",
  "🔢 Suma tu fecha de nacimiento dígito por dígito hasta que quede un solo número: ese es tu camino de vida. Y 2027 suma 11, número maestro ✨\nDescubre el tuyo 👉 miarcana.com/wa/numerologia",
  "🌙 Tu Sol, tu Luna y tu Ascendente: calcula tu carta astral gratis con tu fecha, hora y ciudad 👉 miarcana.com/wa/carta-astral\nReacciona con ☀️ si ya sabes tu Ascendente",
  "🥚 ¿Te sientes cargada o cargado? La limpia con huevo de las abuelas: lo pasas, lo rompes en un vaso con agua y Sibila lee tu vaso 👉 miarcana.com/wa/huevo",
];

/** Día de la semana (0 = domingo) de una fecha AAAA-MM-DD. */
const diaSemana = (fecha: string) => new Date(`${fecha}T12:00:00Z`).getUTCDay();

export function textoCartaCanal(fecha: string) {
  const c = cartaDelDia(fecha);
  return [`✨ Tu carta del día: ${c.nombre}`, "", frase(c.significado, 180), "", "¿Te tocó? Reacciona 💜", "Saca tu propia carta gratis 👉 miarcana.com/wa"].join("\n");
}

export async function piezasCanal(admin: SupabaseClient<Database>, fecha: string): Promise<PiezaCanal[]> {
  const piezas: PiezaCanal[] = [{ titulo: `Carta del día · ${cartaDelDia(fecha).nombre}`, imagen: `${sitio()}/api/redes/carta-dia?fecha=${fecha}`, texto: textoCartaCanal(fecha) }];
  const dia = diaSemana(fecha);
  if (dia === 1) {
    piezas.push({
      titulo: "Encuesta de la semana",
      texto: "Crea una encuesta (📎 → Encuesta) con esta pregunta y estas opciones:\n\n¿Qué quieres que lea Sibila esta semana? 🔮\n• Amor 💞\n• Dinero y trabajo 💰\n• Familia 🏡\n• Cambios y viajes ✈️",
    });
  }
  if (dia === 2 || dia === 4) {
    // El reel de la publicación de ayer ya está generado (el kit de TikTok lo usa también).
    const { data } = await admin.from("publicaciones_programadas").select("*").eq("fecha", sumarDias(fecha, -1)).eq("estado", "publicada").limit(1);
    const p = (data ?? [])[0] as PublicacionProgramada | undefined;
    if (p) {
      try {
        piezas.push({ titulo: `Video · ${p.titulo}`, video: await reelPublicacion(admin, p), texto: `${p.titulo} ✨\n\n${p.extracto}\n\n👉 ${p.enlace.replace("miarcana.com/", "miarcana.com/wa/")}` });
      } catch (e) {
        console.error("[kit canal] reel:", e instanceof Error ? e.message : e);
      }
    }
  }
  if (estadoDirecto() === "proximo" && diasParaDirecto() === 0) {
    const hora = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", hour: "numeric", minute: "2-digit" }).format(new Date(PROXIMO_DIRECTO.inicio));
    piezas.push({
      titulo: "Aviso del directo (publícalo a las 6 p.m.)",
      texto: `🔮 Hoy a las ${hora} te leo EN VIVO.\nEscribe tu signo y tu pregunta en el chat de YouTube, y si escribes "carta astral + fecha, hora y ciudad", la dibujo en pantalla ✨\n👉 ${PROXIMO_DIRECTO.emision ?? PROXIMO_DIRECTO.url}`,
    });
  }
  if (dia === 5) {
    const semana = Math.floor(Date.parse(`${fecha}T12:00:00Z`) / (7 * 86_400_000));
    piezas.push({ titulo: "Regalo del viernes", texto: REGALOS[semana % REGALOS.length] });
  }
  return piezas;
}

export async function enviarKitCanal(fecha: string, piezas: PiezaCanal[]): Promise<string> {
  const [para] = correosAdmin();
  if (!para) throw new Error("No hay correo de administración (ADMIN_CORREOS).");
  const pasos = "Abre WhatsApp → Novedades → tu canal → 📎 → elige la foto o el video (guárdalo antes desde el botón) → pega el texto en el pie → Enviar.";
  const boton = (href: string, etiqueta: string) => `<a href="${href}" style="display:inline-block;background:#d9b45a;color:#0b0716;padding:10px 18px;border-radius:999px;text-decoration:none;font-weight:bold;margin:0 8px 8px 0">${etiqueta}</a>`;
  const bloques = piezas
    .map(
      (p, i) => `<div style="margin:0 0 22px;padding:18px;border-radius:14px;background:#150f26;border:1px solid #ffffff1f">
<p style="margin:0 0 10px;color:#f1d99a;font-size:17px">${i + 1}. ${escaparHtml(p.titulo)}</p>
${p.imagen ? `<p style="margin:0 0 10px"><img src="${p.imagen}" alt="" width="260" style="border-radius:10px;display:block"></p><p style="margin:0">${boton(p.imagen, "Abrir la imagen")}</p>` : ""}
${p.video ? `<p style="margin:0">${boton(`${p.video}?download=canal-${fecha}-${i + 1}.mp4`, "Descargar el video")}</p>` : ""}
<p style="margin:6px 0;color:#a89fc0;font-size:13px">Texto para pegar:</p>
<pre style="white-space:pre-wrap;font-family:inherit;margin:0;padding:12px;border-radius:10px;background:#0b0716;color:#ece6f7;font-size:14px;line-height:1.5">${escaparHtml(p.texto)}</pre>
</div>`,
    )
    .join("");
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px;max-width:620px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Kit del canal de WhatsApp</p>
<h1 style="font-size:24px;color:#f1d99a;margin:0 0 6px">${escaparHtml(fechaLargaEs(fecha))}</h1>
<p style="margin:0 0 20px;color:#a89fc0;font-size:14px">${escaparHtml(pasos)}</p>
${bloques}
<p style="margin:12px 0 0;color:#a89fc0;font-size:13px">Una o dos publicaciones al día bastan; cierra siempre con algo para reaccionar. Canal: <a href="${CANAL_WHATSAPP.url}" style="color:#f1d99a">${CANAL_WHATSAPP.nombre}</a></p>
</div>`;
  const texto = `Kit del canal de WhatsApp · ${fechaLargaEs(fecha)}\n${pasos}\n\n${piezas.map((p, i) => `${i + 1}. ${p.titulo}${p.imagen ? `\nImagen: ${p.imagen}` : ""}${p.video ? `\nVideo: ${p.video}` : ""}\n\n${p.texto}`).join("\n\n---\n\n")}`;
  const r = await enviarCorreo({ para, asunto: `Canal de WhatsApp: ${piezas.length === 1 ? "tu carta del día" : `${piezas.length} publicaciones`} para hoy`, html, texto, etiqueta: "kit_canal" });
  if (!r.ok) throw new Error(`Correo del kit del canal: ${r.error}`);
  return r.id;
}
