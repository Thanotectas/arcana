/**
 * Proxy (antes middleware). Refresca la sesión de Supabase en cada request y
 * redirige a /entrar cuando una ruta privada no tiene sesión. Es un chequeo
 * optimista: la validación real la hacen las páginas y acciones con getUser().
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { COOKIE_ORIGEN, OPCIONES_COOKIE_ORIGEN, detectarOrigen, serializarOrigen } from "@/lib/origen/comun";
import { CABECERA_IDIOMA, separarPrefijo } from "@/lib/i18n/rutas";
import { COOKIE_IDIOMA } from "@/lib/i18n/idiomas";

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
  "/admin",
];

export async function proxy(request: NextRequest) {
  // /fr/horoscopo, /tr/runas…: se sirve la página sin el prefijo, en ese idioma (y queda recordado en la cookie).
  const prefijo = separarPrefijo(request.nextUrl.pathname);
  const cabeceras = new Headers(request.headers);
  if (prefijo) cabeceras.set(CABECERA_IDIOMA, prefijo.idioma);
  else cabeceras.delete(CABECERA_IDIOMA);
  const destino = request.nextUrl.clone();
  if (prefijo) destino.pathname = prefijo.ruta;
  const siguiente = () => (prefijo ? NextResponse.rewrite(destino, { request: { headers: cabeceras } }) : NextResponse.next({ request: { headers: cabeceras } }));
  let response = siguiente();

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
          response = siguiente();
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

  const pathname = prefijo ? prefijo.ruta : request.nextUrl.pathname;
  if (prefijo && request.cookies.get(COOKIE_IDIOMA)?.value !== prefijo.idioma) {
    response.cookies.set(COOKIE_IDIOMA, prefijo.idioma, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }

  // La app de Google Play abre con ?app=android: se recuerda en una cookie para
  // esconder las compras (la política de Play exige su propio sistema de pago).
  const app = request.nextUrl.searchParams.get("app");
  if (app === "android" || app === "pwa") {
    response.cookies.set("plataforma", app, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax", httpOnly: true, secure: process.env.NODE_ENV === "production" });
  }
  // Por dónde llegó la persona (utm_source o el Referer de una red conocida):
  // se guarda la primera vez, 30 días, y al registrarse queda en el perfil.
  if (!request.cookies.get(COOKIE_ORIGEN)?.value) {
    const origen = detectarOrigen(request.nextUrl.searchParams, request.headers.get("referer"));
    if (origen) response.cookies.set(COOKIE_ORIGEN, serializarOrigen(origen), { ...OPCIONES_COOKIE_ORIGEN, secure: process.env.NODE_ENV === "production" });
  }
  const esPrivada = RUTAS_PRIVADAS.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );

  if (esPrivada && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("volver", pathname);
    return redirigir(url, response);
  }

  if (user && (pathname === "/entrar" || pathname === "/registro")) {
    const url = request.nextUrl.clone();
    url.pathname = "/inicio";
    url.search = "";
    return redirigir(url, response);
  }

  return response;
}

/**
 * Redirección que conserva las cookies ya puestas en esta petición (la sesión
 * refrescada y la marca de plataforma): si la app de Android abre un atajo sin
 * sesión, la marca no se pierde y las compras siguen ocultas.
 */
function redirigir(url: URL, base: NextResponse) {
  const r = NextResponse.redirect(url);
  base.cookies.getAll().forEach((c) => r.cookies.set(c));
  return r;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.webmanifest|api/webhooks|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
