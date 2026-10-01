/**
 * Proxy (antes middleware). Refresca la sesión de Supabase en cada request y
 * redirige a /entrar cuando una ruta privada no tiene sesión. Es un chequeo
 * optimista: la validación real la hacen las páginas y acciones con getUser().
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const RUTAS_PRIVADAS = [
  "/tarot",
  "/carta-astral",
  "/numerologia",
  "/compatibilidad",
  "/lecturas",
  "/creditos",
  "/cuenta",
  "/invitar",
  "/iching",
  "/hoy",
  "/calendario-chino",
  "/cruce",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // La app de Google Play abre con ?app=android: se recuerda en una cookie para
  // esconder las compras (la política de Play exige su propio sistema de pago).
  const app = request.nextUrl.searchParams.get("app");
  if (app === "android" || app === "pwa") {
    response.cookies.set("plataforma", app, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  }
  const esPrivada = RUTAS_PRIVADAS.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  if (esPrivada && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("volver", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/entrar" || pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|api/webhooks|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
