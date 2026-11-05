import "server-only";
import { generarTexto } from "@/lib/ia";
import { posiciones } from "@/lib/astro/efemerides";
import { proximasLunaciones } from "@/lib/astro/lunaciones";
import { signoPorId, signoPorLongitud } from "@/lib/zodiaco";
import { correosAdmin } from "@/lib/admin";
import { enviarCorreo, escaparHtml } from "@/lib/correo";
import { fechaLargaEs, lunesDe } from "./calendario";
import { fechaBogota } from "./carta-dia";

/**
 * Kit semanal de comentarios: un comentario listo por signo y por elemento, en español y en
 * francés, para dejar desde Mi Arcana en publicaciones grandes de horóscopo de otras páginas
 * («Escorpio, menciona…», «AMÉN 555», «DECRETADO»). La fórmula que funcionó: encajar con lo
 * que pide la publicación, un dato real del cielo, un consejo práctico y la firma de Sibila.
 * Llega por correo los lunes (orquestador de la mañana). Comentar en páginas ajenas es a mano:
 * Meta no permite hacerlo por la API, y automatizarlo se castiga como spam.
 */

const NOMBRES: Record<string, string> = { sol: "el Sol", mercurio: "Mercurio", venus: "Venus", marte: "Marte", jupiter: "Júpiter", saturno: "Saturno", urano: "Urano", neptuno: "Neptuno", pluton: "Plutón" };
const CUERPOS = Object.keys(NOMBRES);
const DIA = 86_400_000;
const isoDia = (d: Date) => d.toISOString().slice(0, 10);

/** Hechos reales del cielo entre el lunes y los 9 días siguientes (efemérides de Arcana). */
export function cieloDeLaSemana(lunes: string): string[] {
  const inicio = new Date(`${lunes}T12:00:00Z`);
  const dias = Array.from({ length: 10 }, (_, i) => new Date(inicio.getTime() + i * DIA));
  const pos = dias.map((d) => Object.fromEntries(posiciones(d).map((p) => [p.cuerpo, p])));
  const hechos: string[] = [];

  const base = pos[0];
  hechos.push(`Al empezar la semana: ${CUERPOS.map((c) => `${NOMBRES[c]} en ${signoPorLongitud(base[c].longitud).nombre}${base[c].retrogrado ? " (retrógrado)" : ""}`).join(", ")}.`);

  for (let i = 1; i < dias.length; i++) {
    const fecha = fechaLargaEs(isoDia(dias[i]));
    for (const c of CUERPOS) {
      const antes = pos[i - 1][c], ahora = pos[i][c];
      const s0 = signoPorLongitud(antes.longitud), s1 = signoPorLongitud(ahora.longitud);
      if (s0.id !== s1.id) hechos.push(`${NOMBRES[c]} entra en ${s1.nombre} el ${fecha}.`);
      if (!!antes.retrogrado !== !!ahora.retrogrado) hechos.push(ahora.retrogrado ? `${NOMBRES[c]} se pone retrógrado en ${s1.nombre} hacia el ${fecha}.` : `${NOMBRES[c]} retoma su marcha (deja de estar retrógrado) en ${s1.nombre} hacia el ${fecha}.`);
    }
  }

  // Encuentros (conjunciones) entre planetas: el día de menor distancia, si baja de 2°.
  const rapidos = ["sol", "mercurio", "venus", "marte", "jupiter", "saturno"];
  for (let a = 0; a < rapidos.length; a++)
    for (let b = a + 1; b < rapidos.length; b++) {
      let mejor = { sep: 99, i: 0 };
      pos.forEach((p, i) => {
        const d = Math.abs(((p[rapidos[a]].longitud - p[rapidos[b]].longitud + 540) % 360) - 180);
        if (d < mejor.sep) mejor = { sep: d, i };
      });
      // En el borde de la ventana el encuentro aún no llega (o ya pasó): se nombra la semana en que de verdad ocurre.
      if (mejor.sep < 2 && mejor.i > 0 && mejor.i < pos.length - 1) hechos.push(`${NOMBRES[rapidos[a]]} y ${NOMBRES[rapidos[b]]} se juntan en ${signoPorLongitud(pos[mejor.i][rapidos[a]].longitud).nombre} hacia el ${fechaLargaEs(isoDia(dias[mejor.i]))}.`);
    }

  const fin = dias[dias.length - 1].getTime() + DIA;
  const nombreFase = { nueva: "Luna nueva", creciente: "Cuarto creciente", llena: "Luna llena", menguante: "Cuarto menguante" } as const;
  for (const l of proximasLunaciones(new Date(inicio.getTime() - DIA / 2), 4)) {
    const t = Date.parse(l.fechaUtc);
    if (t < fin) hechos.push(`${nombreFase[l.fase]} en ${signoPorId(l.signo)?.nombre ?? l.signo} el ${fechaLargaEs(l.fechaUtc.slice(0, 10))}.`);
  }
  return hechos;
}

const REGLAS = `Eres Sibila, de Arcana. Preparas comentarios para dejar desde la página «Mi Arcana» en publicaciones grandes de horóscopo de otras páginas (del tipo «Escorpio, si eres de verdad, menciona…», «Escribe AMÉN 555», «DECRETADO», «Leo, ¿qué no perdonas?»).
La fórmula que funciona:
1) Una primera frase que encaje con casi cualquier publicación de ese signo (o elemento), con su voz.
2) UN dato real del cielo de la lista, con su fecha, y lo que significa para ese signo.
3) Un consejo práctico o un pequeño ritual (escribir un deseo, revisar gastos, hablar con calma…).
4) La firma «— Sibila, de Arcana 🔮».
Reglas: máximo 280 caracteres por comentario; cálida y concreta; sin enlaces; sin miedo, trabajos, envidias ni maldiciones; sin salud; sin dinero garantizado; usa solo los datos del cielo de la lista y no inventes otros; no repitas el mismo dato ni la misma frase en todos los signos (reparte los datos según a quién le tocan más).
Formato exacto, sin nada antes ni después:
## Aries
(comentario)
… los 12 signos en orden, y después:
## Fuego (Aries, Leo, Sagitario)
(comentario)
## Tierra (Tauro, Virgo, Capricornio)
## Aire (Géminis, Libra, Acuario)
## Agua (Cáncer, Escorpio, Piscis)`;

export async function redactarKitComentarios(lunes: string) {
  const cielo = cieloDeLaSemana(lunes).map((h) => `- ${h}`).join("\n");
  const [es, fr] = await Promise.all([
    generarTexto(`Semana del ${fechaLargaEs(lunes)}. Datos del cielo:\n${cielo}\n\nEscribe el kit en español.`, REGLAS, { effort: "low", maxTokens: 3500, idioma: "es" }),
    generarTexto(
      `Semaine du ${lunes}. Données du ciel (en espagnol, traduis-les) :\n${cielo}\n\nÉcris tout le kit en français : mêmes règles, titres en français (## Bélier, ## Taureau, ## Gémeaux, ## Cancer, ## Lion, ## Vierge, ## Balance, ## Scorpion, ## Sagittaire, ## Capricorne, ## Verseau, ## Poissons, ## Feu, ## Terre, ## Air, ## Eau) et signature « — Sibila, d'Arcana 🔮 ».`,
      REGLAS,
      { effort: "low", maxTokens: 3500, idioma: "auto" },
    ),
  ]);
  return { cielo, es: es.trim(), fr: fr.trim() };
}

export async function enviarKitComentarios(lunes: string, kit: { cielo: string; es: string; fr: string }) {
  const [para] = correosAdmin();
  if (!para) throw new Error("No hay correo de administración (ADMIN_CORREOS).");
  const pasos =
    "Busca publicaciones grandes y recientes (menos de 1 hora) de páginas de horóscopo. Copia el comentario del signo, ajusta la primera frase a lo que pide la publicación y comenta como Mi Arcana. Máximo 2 o 3 por página al día, y responde a quien te conteste.";
  const bloque = (titulo: string, texto: string) =>
    `<p style="margin:18px 0 8px;color:#f1d99a;font-size:17px">${escaparHtml(titulo)}</p><pre style="white-space:pre-wrap;font-family:inherit;margin:0;padding:14px;border-radius:10px;background:#150f26;color:#ece6f7;font-size:14px;line-height:1.55">${escaparHtml(texto)}</pre>`;
  const html = `<div style="font-family:Georgia,serif;color:#ece6f7;background:#0b0716;padding:28px;border-radius:16px;max-width:640px">
<p style="font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#b7a5ff;margin:0 0 8px">Kit de comentarios de la semana</p>
<h1 style="font-size:24px;color:#f1d99a;margin:0 0 6px">Semana del ${escaparHtml(fechaLargaEs(lunes))}</h1>
<p style="margin:0 0 6px;color:#a89fc0;font-size:14px">${escaparHtml(pasos)}</p>
${bloque("El cielo de la semana", kit.cielo)}${bloque("Español", kit.es)}${bloque("Français", kit.fr)}
</div>`;
  const texto = `Kit de comentarios · semana del ${fechaLargaEs(lunes)}\n${pasos}\n\nEL CIELO\n${kit.cielo}\n\nESPAÑOL\n${kit.es}\n\nFRANÇAIS\n${kit.fr}`;
  const r = await enviarCorreo({ para, asunto: `Kit de comentarios: semana del ${fechaLargaEs(lunes)}`, html, texto, etiqueta: "kit_comentarios" });
  if (!r.ok) throw new Error(`Correo del kit de comentarios: ${r.error}`);
  return r.id;
}

/** Lo que corre el lunes: redacta el kit y lo manda por correo. */
export async function kitComentarios(fecha = fechaBogota()) {
  if (process.env.REDES_KIT_COMENTARIOS === "0") return { apagado: true };
  const lunes = lunesDe(fecha);
  const kit = await redactarKitComentarios(lunes);
  return { lunes, correo: await enviarKitComentarios(lunes, kit) };
}
