import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { escaparHtml, sitio } from "@/lib/correo";
import { CREDITOS_PROBADOR, MOTIVO_PROBADOR } from "@/lib/marca/play";

export interface Candidato {
  id: string;
  correo: string;
  nombre: string;
  lecturas: number;
  android: boolean;
  pais: string | null;
  creadoEn: string;
  puntos: number;
}

const primerNombre = (n: string | null) => (n?.trim().split(/\s+/)[0] ?? "").replace(/^./, (c) => c.toUpperCase());

/**
 * Cuentas que vale la pena invitar a la prueba de Android: las que ya usan Android (sus avisos se activaron desde un
 * Android), las que más lecturas hacen y las más recientes. Sin el equipo, sin quien ya es probador o ya fue
 * invitado, y solo quien acepta correos.
 */
export async function candidatosProbador(limite = 40): Promise<Candidato[]> {
  const admin = getSupabaseAdmin();
  const [{ data: perfiles }, { data: probadores }, { data: invitados }, { data: avisos }] = await Promise.all([
    admin.from("perfiles").select("id, nombre, ilimitado, recibe_correos, pais, creado_en").eq("ilimitado", false).eq("recibe_correos", true).limit(5000),
    admin.from("movimientos_creditos").select("usuario_id").eq("motivo", MOTIVO_PROBADOR),
    admin.from("probadores_invitaciones").select("usuario_id"),
    admin.from("suscripciones_push").select("usuario_id, agente"),
  ]);
  const fuera = new Set([...(probadores ?? []).map((p) => p.usuario_id), ...(invitados ?? []).map((i) => i.usuario_id)]);
  const android = new Set((avisos ?? []).filter((a) => /Android/i.test(a.agente ?? "")).map((a) => a.usuario_id));
  const lista = (perfiles ?? []).filter((p) => !fuera.has(p.id));
  if (!lista.length) return [];

  const conteo = new Map<string, number>();
  for (let i = 0; i < lista.length; i += 300) {
    const { data } = await admin.from("lecturas").select("usuario_id").in("usuario_id", lista.slice(i, i + 300).map((p) => p.id));
    for (const l of data ?? []) conteo.set(l.usuario_id, (conteo.get(l.usuario_id) ?? 0) + 1);
  }
  const ahora = Date.now();
  const puntuados = lista
    .map((p) => {
      const lecturas = conteo.get(p.id) ?? 0;
      const dias = (ahora - Date.parse(p.creado_en)) / 86_400_000;
      const puntos = (android.has(p.id) ? 50 : 0) + Math.min(lecturas, 10) * 5 + (dias < 30 ? 10 : dias < 90 ? 5 : 0);
      return { p, lecturas, puntos };
    })
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, limite * 2);

  const salida: Candidato[] = [];
  for (const { p, lecturas, puntos } of puntuados) {
    if (salida.length >= limite) break;
    const { data } = await admin.auth.admin.getUserById(p.id);
    const correo = data.user?.email;
    if (!correo) continue;
    salida.push({ id: p.id, correo, nombre: primerNombre(p.nombre) || "", lecturas, android: android.has(p.id), pais: p.pais, creadoEn: p.creado_en, puntos });
  }
  return salida;
}

function plantilla(asunto: string, cuerpo: string, boton: { texto: string; url: string }, urlBaja: string) {
  const base = sitio();
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${escaparHtml(asunto)}</title></head>
<body style="margin:0;padding:0;background:#0b0716;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0716;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#150f26;border:1px solid rgba(217,180,90,0.35);border-radius:18px;">
<tr><td align="center" style="padding:32px 28px 4px;">
<img src="${base}/marca/icono-192.png" width="72" height="72" alt="Arcana" style="display:block;border-radius:18px;">
<p style="margin:12px 0 0;font:600 12px/1.4 Arial,sans-serif;letter-spacing:5px;color:#d9b45a;text-transform:uppercase;">Arcana</p></td></tr>
<tr><td style="padding:18px 30px 0;">${cuerpo}</td></tr>
<tr><td align="center" style="padding:26px 28px 6px;">
<a href="${boton.url}" style="display:inline-block;padding:15px 34px;border-radius:999px;background:#d9b45a;color:#1b1230;font:700 17px/1 Arial,sans-serif;text-decoration:none;">${escaparHtml(boton.texto)}</a></td></tr>
<tr><td style="padding:18px 30px 28px;"><p style="margin:0;font:15px/1.6 Arial,sans-serif;color:#ece6f7;">Con cariño,<br>Sibila, de Arcana 🔮</p></td></tr>
</table>
<p style="max-width:560px;margin:14px auto 0;font:12px/1.5 Arial,sans-serif;color:#7d7396;">Recibes este correo porque tienes una cuenta en Arcana. <a href="${urlBaja}" style="color:#a89fc0;">No quiero recibir más correos</a>.</p>
</td></tr></table></body></html>`;
}

const p = (t: string) => `<p style="margin:14px 0 0;font:16px/1.6 Arial,sans-serif;color:#ece6f7;">${t}</p>`;

/** Invitación a la prueba cerrada de Android, con los 30 créditos de regalo. */
export function correoInvitacionProbador(nombre: string, urlBaja: string) {
  const url = `${sitio()}/probador?utm_source=correo&utm_medium=email&utm_campaign=invitacion_probador`;
  const asunto = `${nombre ? `${nombre}, ¿` : "¿"}pruebas la app de Arcana antes que nadie? Te regalo ${CREDITOS_PROBADOR} créditos 🔮`;
  const saludo = nombre ? `Hola, ${escaparHtml(nombre)}:` : "Hola:";
  const cuerpo = `<p style="margin:0;font:15px/1.5 Arial,sans-serif;color:#a89fc0;">${saludo}</p>
<h1 style="margin:8px 0 0;font:600 30px/1.15 Georgia,'Times New Roman',serif;color:#f1d99a;">Te invito a probar Arcana en Android, antes de que salga en Google Play</h1>
${p("Estoy a punto de publicar la app de Arcana en Google Play, y antes Google pide que un grupo de personas la pruebe durante dos semanas. Pensé en ti porque ya me conoces.")}
${p(`<strong style="color:#f1d99a;">Te regalo ${CREDITOS_PROBADOR} créditos</strong> para que hagas las lecturas que quieras: tarot, tu carta astral, tu mano, tu taza, la carta escondida de cada día…`)}
${p("Son tres pasos:<br>1️⃣ Toca el botón y dime con qué Gmail usas Google Play.<br>2️⃣ Te agrego a la prueba y te llega el enlace para instalarla.<br>3️⃣ Abre la app y entra con tu cuenta de Arcana: los créditos se cargan solos.")}
${p("Lo único que te pido: <strong style=\"color:#f1d99a;\">ábrela un ratito cada día durante 14 días</strong> (la carta escondida del juego toma un minuto) y no la desinstales en ese tiempo. Y cuéntame qué te gustó y qué mejorarías con el botón «Tu opinión» que está dentro de la app. Necesitas un celular Android.")}`;
  const texto = `${saludo}\n\nTe invito a probar la app de Arcana en Android antes de que salga en Google Play. Te regalo ${CREDITOS_PROBADOR} créditos.\n\n1) Dime con qué Gmail usas Google Play: ${url}\n2) Te agrego a la prueba y te llega el enlace.\n3) Abre la app y entra con tu cuenta: los créditos se cargan solos.\n\nSolo te pido abrirla un ratito cada día durante 14 días (el juego de la carta escondida toma un minuto), no desinstalarla en ese tiempo y contarme qué mejorarías con el botón «Tu opinión» dentro de la app.\n\nSibila, de Arcana\n\nNo quiero recibir más correos: ${urlBaja}`;
  return { asunto, html: plantilla(asunto, cuerpo, { texto: "Quiero probarla", url }, urlBaja), texto };
}

/** Ya está en la lista de Play Console: el enlace para instalar y los pasos. */
export function correoProbadorAgregado(nombre: string, enlacePlay: string, urlBaja: string) {
  const asunto = `¡Listo${nombre ? `, ${nombre}` : ""}! Ya puedes instalar Arcana 📲`;
  const saludo = nombre ? `Hola, ${escaparHtml(nombre)}:` : "Hola:";
  const cuerpo = `<p style="margin:0;font:15px/1.5 Arial,sans-serif;color:#a89fc0;">${saludo}</p>
<h1 style="margin:8px 0 0;font:600 30px/1.15 Georgia,'Times New Roman',serif;color:#f1d99a;">Ya estás en la prueba de Arcana</h1>
${p("Desde tu celular Android, con el mismo Gmail que me diste:")}
${p("1️⃣ Toca el botón y luego «Convertirse en verificador».<br>2️⃣ Toca «Descargar en Google Play» e instala Arcana.<br>3️⃣ Abre la app y entra con tu cuenta de Arcana.")}
${p(`Al abrirla con tu cuenta se cargan solos tus <strong style="color:#f1d99a;">${CREDITOS_PROBADOR} créditos</strong>. Si el enlace dice que no tienes acceso, espera una hora (Google tarda en actualizar la lista) o respóndeme este correo.`)}
${p("Para que Google apruebe la app necesito que la abras <strong style=\"color:#f1d99a;\">cada día durante 14 días</strong>: juega la carta escondida de El Camino del Loco (un minuto) y, cuando algo te guste o te falle, cuéntamelo con el botón «Tu opinión». Gracias de corazón: me estás ayudando a que Arcana llegue a Google Play.")}`;
  const texto = `${saludo}\n\nYa estás en la prueba de Arcana. Desde tu Android, con el mismo Gmail:\n1) Abre ${enlacePlay} y toca «Convertirse en verificador».\n2) Descarga Arcana en Google Play.\n3) Abre la app y entra con tu cuenta: se cargan tus ${CREDITOS_PROBADOR} créditos.\n\nPara que Google apruebe la app, ábrela cada día durante 14 días (juega la carta escondida, un minuto) y cuéntame qué mejorarías con el botón «Tu opinión».\n\nSibila, de Arcana\n\nNo quiero recibir más correos: ${urlBaja}`;
  return { asunto, html: plantilla(asunto, cuerpo, { texto: "Unirme e instalar Arcana", url: enlacePlay }, urlBaja), texto };
}
