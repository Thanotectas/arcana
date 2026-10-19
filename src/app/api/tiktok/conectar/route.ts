import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin";
import { sitio } from "@/lib/correo";
import { tiktokConfigurado, urlAutorizacionTiktok } from "@/lib/redes/tiktok";

/** Lleva a la administración a autorizar la app en TikTok (botón «Conectar TikTok» de /admin/redes). */
export async function GET() {
  await requerirAdmin();
  if (!tiktokConfigurado()) return NextResponse.redirect(`${sitio()}/admin/redes?tiktok=sin_configurar#tiktok`);
  const estado = randomUUID();
  const res = NextResponse.redirect(urlAutorizacionTiktok(estado));
  res.cookies.set("tiktok_estado", estado, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/tiktok", maxAge: 600 });
  return res;
}
