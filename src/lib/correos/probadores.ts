import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { escaparHtml, sitio } from "@/lib/correo";

/** Correos con acceso a /correos/probadores (separados por comas). */
export function esAdministrador(correo: string | null | undefined) {
  const lista = (process.env.ARCANA_ADMINS ?? "lualzaja@gmail.com").split(",").map((c) => c.trim().toLowerCase());
  return Boolean(correo) && lista.includes(correo!.toLowerCase());
}

export interface Probador {
  id: string;
  correo: string;
  nombre: string;
  creditos: number;
  lecturas: number;
  recibeCorreos: boolean;
  yaEnviado: boolean;
}

/**
 * Probadores de la prueba cerrada (recibieron créditos 'prueba_play'), sin las
 * cuentas ilimitadas del equipo, con sus créditos y lecturas al momento.
 */
export async function probadores(): Promise<Probador[]> {
  const admin = getSupabaseAdmin();
  const { data: movimientos } = await admin.from("movimientos_creditos").select("usuario_id").eq("motivo", "prueba_play");
  const ids = [...new Set((movimientos ?? []).map((m) => m.usuario_id as string))];
  if (!ids.length) return [];

  const [{ data: perfiles }, { data: lecturas }, { data: enviados }] = await Promise.all([
    admin.from("perfiles").select("id, nombre, creditos, ilimitado, recibe_correos").in("id", ids),
    admin.from("lecturas").select("usuario_id").in("usuario_id", ids),
    admin.from("correos").select("usuario_id").eq("tipo", "probadores").eq("estado", "enviado").in("usuario_id", ids),
  ]);
  const conteo = new Map<string, number>();
  for (const l of lecturas ?? []) conteo.set(l.usuario_id, (conteo.get(l.usuario_id) ?? 0) + 1);
  const yaEnviados = new Set((enviados ?? []).map((c) => c.usuario_id));

  const lista: Probador[] = [];
  for (const p of perfiles ?? []) {
    if (p.ilimitado) continue;
    const { data } = await admin.auth.admin.getUserById(p.id);
    const correo = data.user?.email;
    if (!correo) continue;
    lista.push({
      id: p.id,
      correo,
      nombre: (p.nombre?.trim().split(/\s+/)[0] ?? "").replace(/^./, (c: string) => c.toUpperCase()) || "viajero",
      creditos: p.creditos,
      lecturas: conteo.get(p.id) ?? 0,
      recibeCorreos: p.recibe_correos,
      yaEnviado: yaEnviados.has(p.id),
    });
  }
  return lista.sort((a, b) => b.lecturas - a.lecturas);
}

/** Agradecimiento por participar en la prueba, con los créditos que le quedan. */
export function correoProbador(p: Pick<Probador, "nombre" | "creditos" | "lecturas">, urlBaja: string) {
  const base = sitio();
  const url = `${base}/inicio?utm_source=correo&utm_medium=email&utm_campaign=probadores`;
  const nombre = escaparHtml(p.nombre);
  const parrafo =
    p.lecturas === 0
      ? "Todavía no has hecho tu primera lectura, y es el mejor momento: elige una tirada de tarot, tu carta astral, la lectura de tu mano o tu aura. Tus créditos ya te están esperando."
      : `Ya hiciste ${p.lecturas} ${p.lecturas === 1 ? "lectura" : "lecturas"}. Cada una nos ayuda a que Sibila escriba mejor. Sigue explorando: hay tarot, carta astral, quiromancia, I Ching, numerología, aura y mucho más.`;
  const boton = p.lecturas === 0 ? "Hacer mi primera lectura" : "Seguir explorando";
  const asunto = `Gracias por probar Arcana, ${p.nombre} ✨ Te quedan ${p.creditos} créditos`;

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><meta name="color-scheme" content="dark"><title>${escaparHtml(asunto)}</title></head>
<body style="margin:0;padding:0;background:#0b0716;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0716;"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#150f26;border:1px solid rgba(217,180,90,0.35);border-radius:18px;">
<tr><td align="center" style="padding:32px 28px 4px;">
<img src="${base}/marca/icono-192.png" width="72" height="72" alt="Arcana" style="display:block;border-radius:18px;">
<p style="margin:12px 0 0;font:600 12px/1.4 Arial,sans-serif;letter-spacing:5px;color:#d9b45a;text-transform:uppercase;">Arcana</p></td></tr>
<tr><td style="padding:18px 30px 0;">
<p style="margin:0;font:15px/1.5 Arial,sans-serif;color:#a89fc0;">Hola, ${nombre}:</p>
<h1 style="margin:8px 0 0;font:600 30px/1.15 Georgia,'Times New Roman',serif;color:#f1d99a;">Gracias por ser parte de la prueba</h1>
<p style="margin:14px 0 0;font:16px/1.6 Arial,sans-serif;color:#ece6f7;">Eres una de las primeras personas en probar Arcana en Android. Tu participación es lo que nos permite llegar a Google Play, y de verdad te lo agradecemos.</p>
<p style="margin:14px 0 0;font:16px/1.6 Arial,sans-serif;color:#ece6f7;">${parrafo}</p></td></tr>
<tr><td align="center" style="padding:24px 28px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" style="border:1px solid rgba(217,180,90,0.6);border-radius:16px;"><tr><td align="center" style="padding:16px 34px;">
<p style="margin:0;font:12px/1.4 Arial,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#a89fc0;">Te quedan</p>
<p style="margin:4px 0 0;font:600 44px/1 Georgia,serif;color:#f1d99a;">${p.creditos}</p>
<p style="margin:4px 0 0;font:13px/1.4 Arial,sans-serif;color:#a89fc0;">créditos para tus lecturas</p></td></tr></table></td></tr>
<tr><td align="center" style="padding:26px 28px 6px;">
<a href="${url}" style="display:inline-block;background:#d9b45a;color:#0b0716;font:700 15px/1 Arial,sans-serif;text-decoration:none;padding:15px 30px;border-radius:999px;">${boton}</a></td></tr>
<tr><td style="padding:18px 30px 28px;">
<p style="margin:0;font:14px/1.6 Arial,sans-serif;color:#a89fc0;">Recuerda mantener la app instalada durante la prueba. Y si algo no te funciona o se te ocurre una mejora, responde este correo: lo leemos todo.</p>
<p style="margin:16px 0 0;font:italic 16px/1.5 Georgia,serif;color:#f1d99a;">Con gratitud,<br>Sibila y el equipo de Arcana</p></td></tr>
</table>
<p style="margin:16px 0 0;font:12px/1.6 Arial,sans-serif;color:#6f6689;">Recibes este correo porque te uniste a la prueba cerrada de Arcana en Google Play.
<a href="${urlBaja}" style="color:#9a90b8;text-decoration:underline;">Dejar de recibir correos</a><br>miarcana.com</p>
</td></tr></table></body></html>`;

  const texto = [
    `Hola, ${p.nombre}:`,
    "",
    "Gracias por ser parte de la prueba de Arcana. Eres una de las primeras personas en probarla en Android, y tu participación nos permite llegar a Google Play.",
    "",
    parrafo,
    "",
    `Te quedan ${p.creditos} créditos para tus lecturas.`,
    `${boton}: ${url}`,
    "",
    "Recuerda mantener la app instalada durante la prueba. Si algo no te funciona o se te ocurre una mejora, responde este correo.",
    "",
    "Con gratitud,",
    "Sibila y el equipo de Arcana",
    "",
    `Dejar de recibir correos: ${urlBaja}`,
  ].join("\n");

  return { asunto, html, texto };
}
