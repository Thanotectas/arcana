import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requerirAdmin } from "@/lib/admin";
import { sitio } from "@/lib/correo";
import { urlAutorizacionYoutube, youtubeConfigurado } from "@/lib/redes/youtube";

/** Lleva a la administración a autorizar la app en Google (botón «Conectar YouTube» de /admin/redes). */
export async function GET() {
  await requerirAdmin();
  if (!youtubeConfigurado()) return NextResponse.redirect(`${sitio()}/admin/redes?youtube=sin_configurar#youtube`);
  const estado = randomUUID();
  const res = NextResponse.redirect(urlAutorizacionYoutube(estado));
  res.cookies.set("youtube_estado", estado, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/youtube", maxAge: 600 });
  return res;
}
