import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { imagenTarjeta, extractoDe } from "@/lib/marca/tarjeta";
import { getT } from "@/lib/i18n/servidor";
import { cartasDeTirada, type CartaTirada, type TipoTirada } from "@/lib/tarot/tiradas";
import { esMazo, type IdMazo } from "@/lib/tarot/mazos";
import { MAZOS_CON_IMAGEN } from "@/components/CartaVisual";
import { signoPorId, signoPorLongitud } from "@/lib/zodiaco";
import { hexagramaPorNumero, esYang, type ResultadoIChing } from "@/lib/iching";
import { FICHA, nombrePilar, type ResultadoChino } from "@/lib/chino";
import type { TipoLectura } from "@/lib/creditos";
import type { PerfilNumerologico } from "@/lib/numerologia";

/**
 * Tarjeta vertical (1080×1350) para compartir una lectura en redes y
 * WhatsApp. Incluye el enlace de invitación de la persona: cada lectura
 * compartida es una invitación.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_autenticado" }, { status: 401 });

  const [{ data: lectura }, { data: perfil }, t] = await Promise.all([
    supabase.from("lecturas").select("id, tipo, titulo, entrada, resultado, interpretacion, estado").eq("id", id).maybeSingle(),
    supabase.from("perfiles").select("codigo_invitacion").eq("id", user.id).maybeSingle(),
    getT(),
  ]);
  if (!lectura || lectura.estado !== "lista" || !lectura.interpretacion) {
    return NextResponse.json({ error: "no_lista" }, { status: 409 });
  }

  const tipo = lectura.tipo as TipoLectura;
  const entrada = (lectura.entrada ?? {}) as Record<string, unknown>;
  const resultado = (lectura.resultado ?? {}) as Record<string, unknown>;
  const dominio = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://miarcana.com").replace(/^https?:\/\//, "");
  const enlace = perfil?.codigo_invitacion ? `${dominio}/r/${perfil.codigo_invitacion}` : dominio;

  let titulo = lectura.titulo;
  let simbolos: string[] = ["✦"];
  let hexagrama: (0 | 1)[] | undefined;
  let imagenes: string[] | undefined;

  if (tipo.startsWith("tarot")) {
    const mazo: IdMazo = esMazo(entrada.mazo) ? entrada.mazo : "rider";
    const cartas = cartasDeTirada((resultado.cartas as CartaTirada[]) ?? [], mazo);
    titulo = cartas.map((c) => c.carta.nombre).join(" · ");
    if (MAZOS_CON_IMAGEN.has(mazo)) imagenes = await Promise.all(cartas.slice(0, 3).map((c) => cartaComoDataUri(mazo, c.carta.id)));
    simbolos = cartas.slice(0, 4).map((c) => (c.carta.arcano === "mayor" ? "✦" : { bastos: "🜂", copas: "🜄", espadas: "🜁", oros: "🜃" }[c.carta.palo ?? "bastos"]));
    void (tipo as TipoTirada);
  } else if (tipo === "carta_astral") {
    const planetas = (resultado.planetas as { cuerpo: string; signo: string }[]) ?? [];
    const casas = resultado.casas as { ascendente: number } | undefined;
    const sol = signoPorId(planetas.find((p) => p.cuerpo === "sol")?.signo ?? "");
    const luna = signoPorId(planetas.find((p) => p.cuerpo === "luna")?.signo ?? "");
    const asc = casas ? signoPorLongitud(casas.ascendente) : undefined;
    // Los glifos zodiacales no se dibujan en la tarjeta (el motor los trata como emoji): van las monedas y el título.
    simbolos = asc && !entrada.horaDesconocida ? ["☉", "☽", "↑"] : ["☉", "☽"];
    const monedas = [sol, luna, asc && !entrada.horaDesconocida ? asc : undefined].filter((x): x is NonNullable<typeof x> => Boolean(x));
    imagenes = await Promise.all(monedas.map((x) => monedaComoDataUri("signos", x.id)));
    titulo = [sol && `☉ ${sol.nombre}`, luna && `☽ ${luna.nombre}`, asc && !entrada.horaDesconocida && `ASC ${asc.nombre}`].filter(Boolean).join(" · ");
  } else if (tipo === "numerologia") {
    const p = resultado as unknown as PerfilNumerologico;
    simbolos = [String(p.caminoDeVida), String(p.expresion), String(p.almaOImpulso)];
    titulo = `${t.numerologia.numeros.caminoDeVida} ${p.caminoDeVida} · ${t.numerologia.numeros.expresion} ${p.expresion}`;
  } else if (tipo === "compatibilidad") {
    const a = signoPorId(String(resultado.signoA));
    const b = signoPorId(String(resultado.signoB));
    simbolos = ["♡"];
    if (a && b) imagenes = await Promise.all([a, b].map((x) => monedaComoDataUri("signos", x.id)));
    titulo = `${a?.nombre ?? ""} + ${b?.nombre ?? ""}: ${Number(resultado.puntaje)}% ${t.compatibilidad.afinidad}`;
  } else if (tipo === "quiromancia") {
    simbolos = ["✋"];
    titulo = t.lecturas.nombres.quiromancia;
  } else if (tipo === "chino") {
    const r = resultado as unknown as ResultadoChino;
    // Las fuentes de la tarjeta no traen caracteres chinos: el animal va en el título.
    simbolos = ["✦"];
    imagenes = [await monedaComoDataUri("animales", r.pilar.animal)];
    titulo = nombrePilar(r.pilar) + (r.animalHora ? ` · ${FICHA[r.animalHora].nombre}` : "");
  } else if (tipo === "cruce") {
    const sistemas = ((entrada.sistemas as string[] | undefined) ?? []).map((s) => (t.cruce.sistemas as Record<string, string>)[s] ?? s);
    simbolos = ["✦", "×", "✦"];
    titulo = sistemas.join(" × ");
  } else if (tipo === "iching") {
    const r = resultado as unknown as ResultadoIChing;
    const h = hexagramaPorNumero(r.presente);
    hexagrama = r.valores.map((v) => (esYang(v) ? 1 : 0)) as (0 | 1)[];
    titulo = h ? `${h.numero}. ${h.nombre} ${h.chino}` : lectura.titulo;
  }

  const respuesta = await imagenTarjeta({
    etiqueta: t.lecturas.nombres[tipo],
    titulo,
    simbolos,
    extracto: extractoDe(lectura.interpretacion),
    enlace,
    pie: t.lecturas.detalle.tarjetaPie,
    hexagrama,
    imagenes: imagenes?.filter(Boolean),
    monedas: tipo === "carta_astral" || tipo === "compatibilidad" || tipo === "chino",
  });
  respuesta.headers.set("Cache-Control", "private, max-age=3600");
  respuesta.headers.set("Content-Disposition", `inline; filename="arcana-${id.slice(0, 8)}.png"`);
  return respuesta;
}

/** Ilustración de una carta como data URI PNG (el motor de la tarjeta no lee WebP). Si falta, devuelve "". */
function cartaComoDataUri(mazo: IdMazo, id: string) {
  return webpComoDataUri(path.join(process.cwd(), "public", "cartas", mazo, `${id}.webp`), undefined, 527);
}

/** Moneda dorada (signo occidental o animal chino) como data URI PNG, reducida para la tarjeta. */
function monedaComoDataUri(carpeta: "signos" | "animales", id: string) {
  return webpComoDataUri(path.join(process.cwd(), "public", carpeta, `${id}.webp`), 260);
}

async function webpComoDataUri(ruta: string, lado?: number, alto?: number) {
  try {
    const webp = await readFile(ruta);
    const base = sharp(webp);
    const png = await (lado ? base.resize(lado, lado) : alto ? base.resize({ height: alto }) : base).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return "";
  }
}
