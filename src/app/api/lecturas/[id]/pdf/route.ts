import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getIdioma, getT } from "@/lib/i18n/servidor";
import { fechaLarga, plantilla } from "@/lib/i18n/formato";
import { pdfDeLectura, type DatosPdf, type VisualPdf } from "@/lib/pdf/documento";
import { cartaComoDataUri, monedaComoDataUri, auraComoDataUri } from "@/lib/marca/imagenes";
import { cartasDeTirada, POSICIONES_I18N, type CartaTirada, type TipoTirada } from "@/lib/tarot/tiradas";
import { esMazo, MAZOS, type IdMazo } from "@/lib/tarot/mazos";
import { MAZOS_CON_IMAGEN } from "@/components/CartaVisual";
import { signoPorId, signoPorLongitud } from "@/lib/zodiaco";
import { hexagramaPorNumero, esYang, type ResultadoIChing } from "@/lib/iching";
import { FICHA, nombrePilar, type ResultadoChino } from "@/lib/chino";
import type { ResultadoSinastria } from "@/lib/astro/sinastria";
import type { PerfilNumerologico } from "@/lib/numerologia";
import { COLORES_AURA, type ResultadoAura } from "@/lib/aura";
import type { EntradaSueno } from "@/lib/suenos";
import type { EntradaVelas } from "@/lib/velas";
import type { TipoLectura } from "@/lib/creditos";

export const maxDuration = 60;

/** Foto privada del bucket 'palmas' como data URI JPEG (react-pdf no lee WebP). */
async function fotoComoDataUri(ruta: unknown) {
  if (typeof ruta !== "string" || !ruta) return null;
  const { data } = await getSupabaseAdmin().storage.from("palmas").download(ruta);
  if (!data) return null;
  try {
    const jpeg = await sharp(Buffer.from(await data.arrayBuffer())).rotate().resize({ width: 1000, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

/** PDF de una lectura terminada: solo su dueña o dueño (RLS). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "no_autenticado" }, { status: 401 });

  const [{ data: lectura }, { data: perfil }, { data: preguntas }, t, idioma] = await Promise.all([
    supabase.from("lecturas").select("id, tipo, titulo, entrada, resultado, interpretacion, estado, creado_en").eq("id", id).maybeSingle(),
    supabase.from("perfiles").select("nombre").eq("id", user.id).maybeSingle(),
    supabase.from("preguntas_lectura").select("pregunta, respuesta, estado").eq("lectura_id", id).order("creado_en", { ascending: true }),
    getT(),
    getIdioma(),
  ]);
  if (!lectura || lectura.estado !== "lista" || !lectura.interpretacion) return NextResponse.json({ error: "no_lista" }, { status: 409 });

  const tipo = lectura.tipo as TipoLectura;
  const entrada = (lectura.entrada ?? {}) as Record<string, unknown>;
  const resultado = (lectura.resultado ?? {}) as Record<string, unknown>;
  const nombre = perfil?.nombre?.trim() || t.inicio.viajero;
  const pregunta = typeof entrada.pregunta === "string" && entrada.pregunta.trim() ? entrada.pregunta.trim() : null;

  let titulo = lectura.titulo;
  let visual: VisualPdf | undefined;
  const fichas: { etiqueta: string; valor: string }[] = [];
  let cita: DatosPdf["cita"];

  if (tipo.startsWith("tarot")) {
    const mazo: IdMazo = esMazo(entrada.mazo) ? entrada.mazo : "rider";
    const cartas = cartasDeTirada((resultado.cartas as CartaTirada[]) ?? [], mazo);
    const posiciones = POSICIONES_I18N[idioma][tipo as TipoTirada] ?? [];
    const conImagen = MAZOS_CON_IMAGEN.has(mazo);
    visual = {
      tipo: "cartas",
      items: await Promise.all(
        cartas.map(async (c) => ({
          imagen: conImagen ? await cartaComoDataUri(mazo, c.carta.id) : null,
          nombre: c.invertida ? `${c.carta.nombre} (${t.pdf.invertida})` : c.carta.nombre,
          posicion: posiciones[c.posicion]?.nombre ?? "",
        })),
      ),
    };
    fichas.push({ etiqueta: t.tarot.eligeMazo, valor: (t.tarot.mazos as Record<string, { nombre: string }>)[mazo]?.nombre ?? MAZOS[mazo].nombre });
  } else if (tipo === "carta_astral") {
    const planetas = (resultado.planetas as { cuerpo: string; signo: string }[]) ?? [];
    const casas = resultado.casas as { ascendente: number } | undefined;
    const sol = signoPorId(planetas.find((p) => p.cuerpo === "sol")?.signo ?? "");
    const luna = signoPorId(planetas.find((p) => p.cuerpo === "luna")?.signo ?? "");
    const asc = casas && !entrada.horaDesconocida ? signoPorLongitud(casas.ascendente) : undefined;
    const items = [
      sol && { etiqueta: "Sol", signo: sol },
      luna && { etiqueta: "Luna", signo: luna },
      asc && { etiqueta: "Ascendente", signo: asc },
    ].filter((x): x is { etiqueta: string; signo: NonNullable<typeof sol> } => Boolean(x));
    visual = { tipo: "monedas", items: await Promise.all(items.map(async (i) => ({ imagen: await monedaComoDataUri("signos", i.signo.id), etiqueta: i.etiqueta, valor: i.signo.nombre }))) };
  } else if (tipo === "numerologia") {
    const p = resultado as unknown as PerfilNumerologico;
    const n = t.numerologia.numeros as Record<string, string>;
    visual = {
      tipo: "numeros",
      items: (["caminoDeVida", "expresion", "almaOImpulso", "personalidad", "anioPersonal"] as const).map((k) => ({ etiqueta: n[k] ?? k, valor: String(p[k]) })),
    };
  } else if (tipo === "compatibilidad") {
    const a = signoPorId(String(resultado.signoA));
    const b = signoPorId(String(resultado.signoB));
    if (a && b) {
      visual = { tipo: "monedas", items: await Promise.all([a, b].map(async (x) => ({ imagen: await monedaComoDataUri("signos", x.id), etiqueta: "", valor: x.nombre }))) };
      fichas.push({ etiqueta: t.pdf.afinidad, valor: `${Number(resultado.puntaje)}%` });
    }
  } else if (tipo === "sinastria") {
    const r = resultado as unknown as ResultadoSinastria;
    visual = {
      tipo: "monedas",
      items: await Promise.all([r.a, r.b].map(async (p) => ({ imagen: await monedaComoDataUri("signos", p.sol), etiqueta: signoPorId(p.sol)?.nombre ?? p.sol, valor: p.nombre }))),
    };
    fichas.push({ etiqueta: t.pdf.afinidad, valor: `${r.puntaje}%` });
  } else if (tipo === "chino") {
    const r = resultado as unknown as ResultadoChino;
    visual = { tipo: "monedas", items: [{ imagen: await monedaComoDataUri("animales", r.pilar.animal), etiqueta: String(r.pilar.anio), valor: nombrePilar(r.pilar) }] };
    if (r.animalHora) fichas.push({ etiqueta: "Hora", valor: FICHA[r.animalHora].nombre });
  } else if (tipo === "aura") {
    const r = resultado as unknown as ResultadoAura;
    const nombres = t.aura.colores as Record<string, { nombre: string }>;
    const orden = [...COLORES_AURA].sort((a, b) => r.puntajes[b] - r.puntajes[a]);
    visual = { tipo: "aura", imagen: await auraComoDataUri(r.principal, r.secundario), items: orden.map((c) => ({ etiqueta: nombres[c]?.nombre ?? c, valor: String(r.puntajes[c]) })) };
    titulo = `${t.aura.tuAura}: ${nombres[r.principal]?.nombre} + ${nombres[r.secundario]?.nombre}`;
  } else if (tipo === "iching") {
    const r = resultado as unknown as ResultadoIChing;
    const h = hexagramaPorNumero(r.presente);
    const f = r.futuro ? hexagramaPorNumero(r.futuro) : undefined;
    visual = {
      tipo: "hexagrama",
      lineas: r.valores.map((v) => (esYang(v) ? 1 : 0)) as (0 | 1)[],
      mutantes: r.mutantes,
      titulo: h ? `${h.numero}. ${h.nombre} ${h.chino}` : lectura.titulo,
      futuro: f ? `${t.pdf.futuro}: ${f.numero}. ${f.nombre}` : undefined,
    };
  } else if (tipo === "quiromancia" || tipo === "chocolate" || tipo === "velas" || tipo === "tabaco") {
    const foto = await fotoComoDataUri(entrada.foto);
    if (foto) visual = { tipo: "foto", imagen: foto };
    if (tipo === "velas") {
      const e = entrada as unknown as EntradaVelas;
      const intenciones = t.velas.intenciones as Record<string, { nombre: string }>;
      const colores = t.velas.colores as Record<string, { nombre: string }>;
      fichas.push({ etiqueta: t.velas.queIntencion, valor: intenciones[e.intencion]?.nombre ?? e.intencion }, { etiqueta: t.velas.queColor, valor: colores[e.color]?.nombre ?? e.color });
    }
    if (tipo === "quiromancia" && typeof entrada.mano === "string") fichas.push({ etiqueta: t.pdf.foto, valor: entrada.mano });
  } else if (tipo === "suenos") {
    const e = entrada as unknown as EntradaSueno;
    cita = { etiqueta: t.pdf.sueno, texto: e.texto };
    const emociones = t.suenos.emociones as Record<string, string>;
    if (e.emocion) fichas.push({ etiqueta: t.suenos.alDespertar, valor: emociones[e.emocion] ?? e.emocion });
  } else if (tipo === "cruce") {
    const sistemas = ((entrada.sistemas as string[] | undefined) ?? []).map((s) => (t.cruce.sistemas as Record<string, string>)[s] ?? s);
    titulo = sistemas.join(" × ") || lectura.titulo;
  }

  if (pregunta && tipo !== "suenos") cita = cita ?? { etiqueta: t.pdf.pregunta, texto: pregunta };

  const logo = `data:image/png;base64,${(await readFile(path.join(process.cwd(), "public/marca/icono-192.png"))).toString("base64")}`;
  const datos: DatosPdf = {
    idioma,
    etiqueta: t.lecturas.nombres[tipo],
    titulo,
    meta: `${plantilla(t.pdf.fecha, { fecha: fechaLarga(lectura.creado_en, idioma) })} · ${plantilla(t.pdf.para, { nombre })}`,
    logo,
    visual,
    fichas,
    cita,
    interpretacion: lectura.interpretacion,
    preguntas: (preguntas ?? []).filter((p) => p.estado === "lista" && p.respuesta).map((p) => ({ pregunta: p.pregunta, respuesta: p.respuesta as string })),
    textos: { preguntas: t.pdf.preguntas, pagina: t.pdf.pagina, pie: t.pdf.pie, aviso: t.comun.aviso },
  };

  const pdf = await pdfDeLectura(datos);
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="arcana-${tipo}-${id.slice(0, 8)}.pdf"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
